IntelliRup: Multi-Agent Cybersecurity Intelligence System
IntelliRup is an advanced cybersecurity intelligence platform that leverages a multi-agent AI system to detect, analyze, and mitigate cyber threats in real-time. By combining cutting-edge natural language processing, web search capabilities, and interactive visualizations, IntelliRup empowers cybersecurity professionals, enterprise security teams, and researchers to stay ahead of emerging threats with actionable insights.
Table of Contents

Overview
Features
Use Cases
Technical Architecture
Project Structure
Installation
Usage
Environment Variables
Contributing
License

Overview
IntelliRup automates the process of identifying and responding to cybersecurity threats by integrating a multi-agent system powered by AI. Users can input queries (e.g., "cybersecurity vulnerabilities 2025") to retrieve recent threat data, assess their severity, and receive tailored mitigation plans. The system features a modern React-based frontend with interactive visualizations and a robust Python-based backend using FastAPI and CrewAI.
Key Objectives

Detect: Identify recent cybersecurity threats using web searches.
Analyze: Assess the severity and impact of detected threats.
Mitigate: Generate actionable mitigation plans.
Visualize: Present threat relationships and risk distributions through intuitive charts and graphs.

Features

Threat Query Input: Users can input custom queries to analyze specific threats, with a dynamic status display cycling through agent activities (Research, Analysis, Response, Coordinator) every 5 seconds during processing.
Interactive Threat Network: Visualizes threat relationships with nodes and directed arrows, color-coded by risk level (High: Red, Medium: Orange, Low: Green).
Risk Distribution Charts: Displays the distribution of threat risk levels using Recharts for clear, actionable insights.
Exportable Reports: Download threat summaries as CSV and detailed reports as TXT.
Responsive UI: Built with Tailwind CSS and Shadcn/UI for a polished, user-friendly experience.
Multi-Agent System: Employs four AI agents (Research, Analysis, Response, Coordinator) to streamline the threat intelligence workflow.

Use Cases

Emerging Threat Detection: A cybersecurity analyst queries "zero-day exploits 2025" to identify recent vulnerabilities, visualize their relationships, and download a report with mitigation strategies for immediate action.
Enterprise Threat Response: A security team uses IntelliRup to monitor and respond to threats targeting their software stack, receiving automated risk assessments and mitigation plans to protect critical infrastructure.

Technical Architecture
IntelliRup is divided into two main components: a frontend dashboard and a backend API with a multi-agent system.
Frontend

Framework: React with TypeScript, built using Vite for fast development and builds.
UI Libraries: Tailwind CSS for styling, Shadcn/UI for components, Lucide for icons, Sonner for toasts, and Recharts for charts.
Key Components:
ThreatAnalyzer.tsx: Handles user input and displays agent status during analysis.
ThreatNetwork.tsx: Renders an interactive canvas-based visualization of threat relationships.
RiskChart.tsx: Displays risk distribution using bar charts.
ThreatTable.tsx: Presents threat summaries in a tabular format.
MetricsPanel.tsx: Provides additional metrics (assumed for monitoring or analytics).


Environment: Uses VITE_API_ENDPOINT from a .env file to connect to the backend.

Backend

Framework: FastAPI for the API, serving endpoints like /analyze and /health.
Multi-Agent System: Built with CrewAI, utilizing four agents:
Research Agent: Uses the Exa API to search for recent threats, filtered by trusted domains (e.g., .edu, .gov, .org) and date (since 2025).
Analysis Agent: Evaluates threats using Groq’s Gemma2-9b-it LLM to assign risk levels (Critical, High, Medium, Low).
Response Agent: Generates mitigation plans for each threat.
Coordinator Agent: Compiles results into a comprehensive report with an executive summary, threat details, risk assessments, and mitigation plans.


Dependencies: crewai, langchain_groq, exa_py, pandas, fastapi, and pydantic for data validation.
Data Flow:
User submits a query via the frontend.
The frontend sends a POST request to /analyze with the query.
The backend’s CrewAI workflow processes the query through the agents.
The Research Agent fetches threat data, Analysis Agent assigns risk levels, Response Agent generates mitigation plans, and Coordinator Agent compiles the report.
The backend returns a JSON response with threats, report, and execution time.
The frontend renders the results in tables, charts, and network visualizations.



Project Structure
IntelliRup/
├── multiagent-backend/         # Backend FastAPI and CrewAI logic
│   ├── agents.py              # Defines AI agents and Exa search tool
│   ├── app.py                # Streamlit dashboard (alternative frontend)
│   ├── main.py               # FastAPI server with /analyze endpoint
│   ├── tasks.py              # CrewAI tasks for agents
│   └── test_setup.py         # Testing utilities
├── react-dashboard/           # React frontend
│   ├── src/
│   │   ├── components/       # React components (ThreatAnalyzer, ThreatNetwork, etc.)
│   │   ├── types/            # TypeScript type definitions (e.g., threat.ts)
│   │   ├── pages/            # Page components (Index, NotFound)
│   │   ├── hooks/            # Custom hooks (e.g., use-mobile, use-toast)
│   │   └── lib/              # Utility functions
│   ├── .env                  # Environment variables (VITE_API_ENDPOINT)
│   ├── package.json          # Frontend dependencies
│   └── tailwind.config.ts    # Tailwind CSS configuration
├── LICENSE                   # Project license
└── README.md                 # Project documentation

Installation
Prerequisites

Node.js: v18 or higher
Python: 3.9 or higher
API Keys:
Groq API key for LLM (GROQ_API_KEY)
Exa API key for web search (EXA_API_KEY)



Backend Setup

Navigate to the multiagent-backend directory:cd multiagent-backend


Create a virtual environment and activate it:python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate


Install dependencies:pip install fastapi uvicorn crewai langchain-groq exa-py pandas pydantic


Create a .env file in multiagent-backend with:GROQ_API_KEY=your_groq_api_key
EXA_API_KEY=your_exa_api_key


Run the FastAPI server:uvicorn main:app --host 0.0.0.0 --port 8000



Frontend Setup

Navigate to the react-dashboard directory:cd react-dashboard


Install dependencies:npm install


Create a .env file in react-dashboard with:VITE_API_ENDPOINT=http://localhost:8000


Start the development server:npm run dev


Open http://localhost:5173 (or the Vite-assigned port) in your browser.

Usage

Access the Dashboard: Open the React frontend in your browser.
Enter a Query: Use the ThreatAnalyzer component to input a query (e.g., "cybersecurity vulnerabilities 2025").
View Results: During analysis, a rotating status message displays the agents’ progress. Once complete, view:
Threat Table: Summarizes threats with titles, URLs, risks, and snippets.
Threat Network: Visualizes threat relationships with directed arrows.
Risk Chart: Shows risk distribution (High, Medium, Low).


Export Reports: Download threat data as CSV or the full report as TXT.

Environment Variables

Backend (multiagent-backend/.env):
GROQ_API_KEY: API key for Groq’s LLM.
EXA_API_KEY: API key for Exa web search.


Frontend (react-dashboard/.env):
VITE_API_ENDPOINT: Backend API URL (e.g., http://localhost:8000).

License
This project is licensed under the terms specified in the LICENSE file.
