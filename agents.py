import os
from dotenv import load_dotenv
from crewai import Agent
from crewai.tools import BaseTool
from groq import BaseModel
from langchain_groq import ChatGroq
from exa_py import Exa
from pydantic import Field, BaseModel
from datetime import datetime
import json

load_dotenv()

# Initialize LLM (Groq) - Added api_key
llm = ChatGroq(
    model="groq/gemma2-9b-it",
    api_key=os.getenv("GROQ_API_KEY"),  # Critical: Add this to authenticate and set provider
    temperature=0.3,
    max_tokens=1024,
    max_retries=2
)

# Initialize Exa client
exa = Exa(api_key=os.getenv("EXA_API_KEY"))

from pydantic import BaseModel, Field

class ExaSearchToolInput(BaseModel):
    """Inner schema for query input."""
    description: str = Field(..., description="The query string for searching cybersecurity threats.")
    type: str | None = Field(None, description="Optional type field, ignored if present.")

class ExaSearchToolSchema(BaseModel):
    """Schema for ExaSearchTool input."""
    input_data: ExaSearchToolInput | str = Field(..., description="The input query, either as a string or dict with description.")

class ExaSearchTool(BaseTool):
    name: str = "Exa_Search"
    description: str = "Searches the web for recent cybersecurity threats and vulnerabilities, returning a list of dictionaries with titles, URLs, and snippets."
    # args_schema = ExaSearchToolSchema  # Comment out to bypass Pydantic
    def _run(self, input_data: str | dict) -> list:
        print(f"Exa_Search raw input: {input_data}")
        if isinstance(input_data, dict):
            # Extract query from common keys, ignore extras like 'security_context'
            input_data = input_data.get('description', input_data.get('query', input_data.get('input_data', str(input_data))))
        query = self._parse_input(str(input_data))
        print(f"Exa_Search processed query: {query}")
        try:
            results = exa.search(
                query=f"{query} site:*.edu | site:*.gov | site:*.org since:2025-01-01",
                num_results=5,
                type="hybrid",
                use_autoprompt=True
            )
            return [
                {"title": r.title, "url": r.url, "snippet": r.text[:500] + "..." if r.text else f"Visit {r.url} for details"}
                for r in results.results
            ]
        except Exception as e:
            print(f"Exa_Search error: {str(e)}")
            return [{"title": "Fallback Threat", "url": "https://cisa.gov", "snippet": "General 2025 cyber advisory"}]

    def _parse_input(self, input_data: str) -> str:
        """Parse input to handle CrewAI's malformed JSON."""
        print(f"Exa_Search parsing input: {input_data}")
        try:
            if isinstance(input_data, str) and input_data.startswith('{'):
                data = json.loads(input_data)
                if isinstance(data, dict):
                    return data.get('query', data.get('description', data.get('value', 'cybersecurity vulnerabilities 2025')))
            return input_data
        except json.JSONDecodeError:
            print("Exa_Search JSON parse failed, using fallback")
            return 'cybersecurity vulnerabilities 2025'
        except Exception as e:
            print(f"Exa_Search parse error: {str(e)}")
            return 'cybersecurity vulnerabilities 2025'

# Instantiate the tool
exa_tool = ExaSearchTool()

# Research Agent: Gathers threat data using Exa tool (increased limits for resilience)
research_agent = Agent(
    role="Threat Intelligence Researcher",
    goal="Search for recent cybersecurity threats.",
    backstory="Use Exa_Search with simple string queries like 'cybersecurity vulnerabilities 2025'. Return list with title and URL after one use.",
    tools=[exa_tool],
    llm=llm,
    verbose=True,
    max_iterations=2,
    max_rpm=20 
)

# Analysis Agent: Evaluates threats using LLM
analysis_agent = Agent(
    role="Threat Analyst",
    goal="Analyze threat data to assess severity and impact.",
    backstory="You are an expert in evaluating cybersecurity threats, identifying patterns, and assigning risk levels using natural language processing.",
    llm=llm,
    verbose=True
)

# Response Agent: Generates mitigation plans
response_agent = Agent(
    role="Incident Responder",
    goal="Generate actionable mitigation plans for identified threats.",
    backstory="You are a seasoned incident responder who crafts clear, practical strategies to neutralize cyber threats, leveraging AI to draft precise reports.",
    llm=llm,
    verbose=True
)

# Coordinator Agent: Oversees workflow
coordinator_agent = Agent(
    role="Threat Response Coordinator",
    goal="Orchestrate the collaboration of research, analysis, and response agents to ensure a cohesive threat response.",
    backstory="You compile results into a detailed report with the current date and all threats analyzed.",
    llm=llm,
    verbose=True,
    prompt_template="Generate a report for {num_threats} threats. Use date: {current_date}. Include executive summary, threat details, risk assessments, and mitigation plans."
)