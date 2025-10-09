import os
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from crewai import Crew
from agents import research_agent, analysis_agent, response_agent, coordinator_agent
from tasks import research_task, analysis_task, response_task, coordinator_task
import time
import json
import logging
import pandas as pd
from typing import List, Dict, Optional
from difflib import SequenceMatcher
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone

# Configure logging
logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

app = FastAPI()

# Environment variables
origins_env = os.getenv("ALLOWED_ORIGINS")
allowed_origins = [origin.strip() for origin in origins_env.split(",")] if origins_env else []
JWT_SECRET = os.getenv("JWT_SECRET")
DASHBOARD_PASSWORD_HASH = bcrypt.hashpw(
    os.getenv("DASHBOARD_PASSWORD").encode('utf-8'),
    bcrypt.gensalt()
).decode('utf-8')

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Authentication
security = HTTPBearer()

def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)

class Threat(BaseModel):
    title: str
    url: str
    risk: str
    snippet: str

class AnalysisResponse(BaseModel):
    threats: List[Threat]
    report: str
    executionTime: float

class LoginRequest(BaseModel):
    password: str

def parse_json_with_single_quotes(s: str) -> List[Dict]:
    """Safely parse JSON-like string with single quotes."""
    s = s.strip()
    if not (s.startswith('[') and s.endswith(']')):
        raise ValueError("Input is not a list-like string")
    
    s = s.replace("'", '"')
    
    try:
        return json.loads(s)
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {e}")
        raise ValueError(f"Failed to parse JSON: {e}")

def extract_threats_from_research(research_output: str) -> List[Dict]:
    """Extract threat data from research agent output."""
    try:
        threats_data = parse_json_with_single_quotes(research_output)
        return [
            {
                "title": item.get("title", "Unknown"),
                "url": item.get("url", ""),
                "snippet": item.get("snippet", "")
            }
            for item in threats_data
        ]
    except (ValueError, json.JSONDecodeError) as e:
        logger.error(f"Failed to parse research output: {e}")
        return []

def normalize_risk_level(risk: str) -> str:
    """
    Normalize risk level to standard categories.
    Maps various risk terms to: Critical, High, Medium, Low
    """
    risk_lower = risk.lower().strip()
    
    risk_map = {
        'critical': 'High',
        'severe': 'High',
        'urgent': 'High',
        'emergency': 'High',
        'high': 'High',
        'elevated': 'High',
        'serious': 'High',
        'medium': 'Medium',
        'moderate': 'Medium',
        'intermediate': 'Medium',
        'low': 'Low',
        'minimal': 'Low',
        'minor': 'Low',
        'negligible': 'Low',
        'info': 'Low',
        'informational': 'Low'
    }
    
    if risk_lower in risk_map:
        return risk_map[risk_lower]
    
    for keyword, normalized in risk_map.items():
        if keyword in risk_lower:
            return normalized
    
    return 'Medium'

def extract_risk_levels(text: str) -> pd.DataFrame:
    """
    Extract risk levels from analysis/coordinator output using pandas.
    Returns a DataFrame with columns: title, risk, position
    """
    lines = text.split('\n')
    
    df = pd.DataFrame({'line': lines})
    df['line_num'] = df.index
    df['line_lower'] = df['line'].str.lower()
    
    risk_indicators = ['risk', 'severity', 'priority', 'impact', 'level']
    df['contains_risk'] = df['line_lower'].str.contains('|'.join(risk_indicators), na=False)
    
    risk_keywords = [
        'critical', 'severe', 'urgent', 'emergency',
        'high', 'elevated', 'serious',
        'medium', 'moderate', 'intermediate',
        'low', 'minimal', 'minor', 'negligible', 'info', 'informational'
    ]
    
    df['risk_level'] = None
    
    for keyword in risk_keywords:
        mask = df['line_lower'].str.contains(keyword, na=False) & df['contains_risk']
        df.loc[mask & df['risk_level'].isna(), 'risk_level'] = keyword
    
    df['is_title'] = (
        df['line'].str.contains(r'\*\*.*\*\*', na=False) |
        df['line'].str.match(r'^\s*\d+\.', na=False) |
        df['line'].str.match(r'^[A-Z][^:\n]{10,}', na=False)
    )
    
    df['extracted_title'] = df['line'].str.extract(r'\*\*([^\*]+)\*\*', expand=False)
    
    numbered_titles = df['line'].str.extract(r'^\s*\d+\.\s*(.+?)(?:\*\*|$)', expand=False)
    df['extracted_title'] = df['extracted_title'].fillna(numbered_titles)
    
    df['extracted_title'] = df['extracted_title'].str.strip()
    df['extracted_title'] = df['extracted_title'].str.replace(r'^\d+\.\s*', '', regex=True)
    df['extracted_title'] = df['extracted_title'].str.replace(r':$', '', regex=True)
    
    risk_lines = df[df['risk_level'].notna()].copy()
    title_lines = df[df['extracted_title'].notna()].copy()
    
    risk_assignments = []
    
    for _, risk_row in risk_lines.iterrows():
        risk_line_num = risk_row['line_num']
        
        nearby_titles = title_lines[
            (title_lines['line_num'] < risk_line_num) &
            (title_lines['line_num'] >= risk_line_num - 10)
        ]
        
        if not nearby_titles.empty:
            closest_title = nearby_titles.iloc[-1]
            normalized_risk = normalize_risk_level(risk_row['risk_level'])
            
            risk_assignments.append({
                'title': closest_title['extracted_title'],
                'risk': normalized_risk,
                'position': closest_title['line_num']
            })
    
    if not risk_assignments:
        return pd.DataFrame(columns=['title', 'risk', 'position'])
    
    result_df = pd.DataFrame(risk_assignments)
    result_df = result_df.drop_duplicates(subset=['title'], keep='first')
    
    return result_df

def calculate_similarity(str1: str, str2: str) -> float:
    """Calculate similarity ratio between two strings."""
    return SequenceMatcher(None, str1.lower(), str2.lower()).ratio()

def match_risks_to_threats(threats: List[Dict], risk_df: pd.DataFrame) -> List[Dict]:
    """Match risk levels to threats using pandas operations."""
    
    threats_df = pd.DataFrame(threats)
    threats_df['risk'] = 'Medium'
    
    if risk_df.empty:
        return threats_df.to_dict('records')
    
    for threat_idx, threat_row in threats_df.iterrows():
        threat_title = threat_row['title']
        best_match_score = 0
        best_match_risk = 'Medium'
        
        for _, risk_row in risk_df.iterrows():
            risk_title = risk_row['title']
            
            similarity = calculate_similarity(threat_title, risk_title)
            
            if threat_title.lower() in risk_title.lower() or risk_title.lower() in threat_title.lower():
                similarity = max(similarity, 0.8)
            
            threat_words = set(threat_title.lower().split())
            risk_words = set(risk_title.lower().split())
            
            stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'}
            threat_words -= stop_words
            risk_words -= stop_words
            
            if threat_words and risk_words:
                word_overlap = len(threat_words & risk_words) / max(len(threat_words), len(risk_words))
                similarity = max(similarity, word_overlap)
            
            if similarity > best_match_score:
                best_match_score = similarity
                best_match_risk = risk_row['risk']
        
        if best_match_score >= 0.4:
            threats_df.at[threat_idx, 'risk'] = best_match_risk
    
    return threats_df.to_dict('records')

def run_crew(query: str) -> tuple:
    """Execute the CrewAI workflow."""
    current_date = time.strftime("%Y-%m-%d")
    
    coordinator_task.description = coordinator_task.description.format(current_date=current_date)
    coordinator_task.expected_output = coordinator_task.expected_output.format(current_date=current_date)
    
    cybersec_crew = Crew(
        agents=[research_agent, analysis_agent, response_agent, coordinator_agent],
        tasks=[research_task, analysis_task, response_task, coordinator_task],
        verbose=True,
        context={"current_date": current_date, "num_threats": 5}
    )
    
    cybersec_crew.tasks[0].description = (
        f"Search for the 5 most recent {query}. "
        "Return a list of titles, URLs, and snippets."
    )
    
    start_time = time.time()
    result = cybersec_crew.kickoff()
    execution_time = time.time() - start_time
    
    return result, execution_time

@app.post("/login")
async def login(request: LoginRequest):
    """Authenticate user and return JWT token."""
    try:
        stored_password_hash = DASHBOARD_PASSWORD_HASH.encode('utf-8')
        if bcrypt.checkpw(request.password.encode('utf-8'), stored_password_hash):
            token = jwt.encode(
                {
                    "sub": "dashboard-user",
                    "exp": datetime.now(timezone.utc) + timedelta(hours=30)
                },
                JWT_SECRET,
                algorithm="HS256"
            )
            return {"token": token}
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
    except Exception as e:
        logger.exception(f"Error in login: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Authentication failed")

@app.post("/analyze", response_model=AnalysisResponse, dependencies=[Depends(verify_jwt_token)])
async def analyze_threats(request: QueryRequest):
    """Analyze cybersecurity threats based on user query."""
    try:
        result, execution_time = run_crew(request.query)
        
        if not result.tasks_output or len(result.tasks_output) < 4:
            raise HTTPException(
                status_code=500,
                detail="Crew execution did not produce expected outputs"
            )
        
        research_output = result.tasks_output[0].raw
        threats = extract_threats_from_research(research_output)
        
        if not threats:
            return AnalysisResponse(
                threats=[],
                report="No threats found for the given query.",
                executionTime=execution_time
            )
        
        coordinator_output = result.tasks_output[3].raw
        report = coordinator_output if coordinator_output else "No report generated."
        
        analysis_output = result.tasks_output[1].raw
        analysis_risks = extract_risk_levels(analysis_output)
        coordinator_risks = extract_risk_levels(coordinator_output)
        
        combined_risks = pd.concat([analysis_risks, coordinator_risks], ignore_index=True)
        combined_risks = combined_risks.drop_duplicates(subset=['title'], keep='first')
        
        threats_with_risks = match_risks_to_threats(threats, combined_risks)
        
        return AnalysisResponse(
            threats=[Threat(**t) for t in threats_with_risks],
            report=report,
            executionTime=execution_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Unexpected error in analyze_threats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)