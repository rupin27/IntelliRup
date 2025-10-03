# IntelliRup: Multi-Agent Cybersecurity Intelligence System

**IntelliRup** is a proprietary cybersecurity intelligence platform designed to detect, analyze, and mitigate cyber threats in real-time using a multi-agent AI system. Leveraging advanced natural language processing, web search capabilities, and interactive visualizations, IntelliRup empowers authorized cybersecurity professionals and enterprise security teams with actionable insights.  

> **⚠️ Important**: This software is proprietary and not open-source. Use, modification, or distribution without explicit permission from Rupin Mehra is strictly prohibited.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Use Cases](#use-cases)
- [Technical Architecture](#technical-architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Overview

IntelliRup automates the process of identifying, analyzing, and responding to cybersecurity threats. Authorized users can input queries (e.g., "cybersecurity vulnerabilities 2025") to retrieve recent threat data, assess their severity, and receive tailored mitigation plans. The system combines a modern **React-based frontend** with a robust **Python-based backend** powered by FastAPI and CrewAI, delivering a seamless and secure experience.

### Key Objectives
- **Detect**: Identify recent cybersecurity threats using targeted web searches.  
- **Analyze**: Assess the severity and impact of detected threats.  
- **Mitigate**: Generate actionable mitigation plans.  
- **Visualize**: Present threat relationships and risk distributions through intuitive charts and graphs.  

---

## Features

- **Threat Query Input**: Input custom queries with a dynamic status display cycling through agent activities (Research, Analysis, Response, Coordinator) every 5 seconds during analysis.  
- **Interactive Threat Network**: Visualizes threat relationships with color-coded nodes (High: Red, Medium: Orange, Low: Green) and directed arrows.  
- **Risk Distribution Charts**: Displays risk levels (High, Medium, Low) using Recharts for clear insights.  
- **Exportable Reports**: Download threat summaries as CSV or detailed reports as TXT.  
- **Responsive UI**: Built with React for a polished, user-friendly experience.  
- **Multi-Agent System**: Employs four AI agents to streamline the threat intelligence workflow.  

---

## Use Cases

1. **Emerging Threat Detection**  
   An authorized analyst queries *"zero-day exploits 2025"* to identify vulnerabilities, visualize relationships, and download mitigation strategies for immediate action.  

2. **Enterprise Threat Response**  
   Authorized security teams monitor and respond to threats targeting their software stack, receiving automated risk assessments and mitigation plans.  

---

## Technical Architecture

IntelliRup consists of a **frontend dashboard** and a **backend API** with a multi-agent system.

### Frontend
- **Framework**: React with TypeScript, built using Vite for fast development and builds.  
- **UI Libraries**:
  - Tailwind CSS for styling  
  - Shadcn/UI for components  
  - Lucide for icons  
  - Sonner for toasts  
  - Recharts for charts  
- **Environment**: Uses `VITE_API_ENDPOINT` from a `.env` file to connect to the backend.  

### Backend
- **Framework**: FastAPI, serving endpoints like `/analyze` and `/health`.  
- **Multi-Agent System**: Built with CrewAI, utilizing four agents:  
  - **Research Agent**: Uses the Exa API to search for threats, filtered by trusted domains (e.g., .edu, .gov, .org) and date (since 2025).  
  - **Analysis Agent**: Evaluates threats using Groq’s Gemma2-9b-it LLM to assign risk levels (Critical, High, Medium, Low).  
  - **Response Agent**: Generates mitigation plans for each threat.  
  - **Coordinator Agent**: Compiles results into a comprehensive report with an executive summary, threat details, risk assessments, and mitigation plans.  
- **Dependencies**: `crewai`, `langchain_groq`, `exa_py`, `pandas`, `fastapi`, `pydantic`.  
- **Data Flow**:
  1. User submits a query via the frontend.  
  2. Frontend sends a POST request to `/analyze`.  
  3. Backend’s CrewAI workflow processes the query through agents.  
  4. Research Agent fetches threat data, Analysis Agent assigns risk levels, Response Agent generates mitigation plans, and Coordinator Agent compiles the report.  
  5. Backend returns a JSON response with threats, report, and execution time.  
  6. Frontend renders results in tables, charts, and network visualizations.  

---

## Project Structure

```plaintext
IntelliRup/
├── multiagent-backend/         # Backend FastAPI and CrewAI logic
│   ├── agents.py               # Defines AI agents and Exa search tool
│   ├── app.py                  # Streamlit dashboard (alternative frontend)
│   ├── main.py                 # FastAPI server with /analyze endpoint
│   ├── tasks.py                # CrewAI tasks for agents
│   └── test_setup.py           # Testing utilities
├── react-dashboard/            # React frontend
│   ├── src/
│   │   ├── components/         # React components (ThreatAnalyzer, ThreatNetwork, etc.)
│   │   ├── types/              # TypeScript type definitions (e.g., threat.ts)
│   │   ├── pages/              # Page components (Index, NotFound)
│   │   ├── hooks/              # Custom hooks (e.g., use-mobile, use-toast)
│   │   └── lib/                # Utility functions
│   ├── .env                    # Environment variables (VITE_API_ENDPOINT)
│   ├── package.json            # Frontend dependencies
│   └── tailwind.config.ts      # Tailwind CSS configuration
├── LICENSE                     # Proprietary license
└── README.md                   # Project documentation
```

---

## Installation

> **⚠️ Note**: Installation is restricted to authorized users only. Unauthorized use or distribution is prohibited.

### Prerequisites
- **Node.js**: v18 or higher  
- **Python**: 3.9 or higher  
- **API Keys**:
  - Groq API key for LLM (`GROQ_API_KEY`)  
  - Exa API key for web search (`EXA_API_KEY`)  

### Backend Setup
```bash
# Navigate to backend
cd multiagent-backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn crewai langchain-groq exa-py pandas pydantic

# Create .env file with API keys
echo "GROQ_API_KEY=your_groq_api_key" >> .env
echo "EXA_API_KEY=your_exa_api_key" >> .env

# Run FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
# Navigate to frontend
cd react-dashboard

# Install dependencies
npm install

# Create .env file with backend endpoint
echo "VITE_API_ENDPOINT=http://localhost:8000" >> .env

# Start development server
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) (or the Vite-assigned port) in your browser.  

---

## Usage

1. **Access the Dashboard**: Open the React frontend in your browser.  
2. **Enter a Query**: Use the ThreatAnalyzer component to input a query (e.g., "cybersecurity vulnerabilities 2025").  
3. **View Results**:  
   - **Threat Table**: Summarizes threats with titles, URLs, risks, and snippets.  
   - **Threat Network**: Visualizes threat relationships with directed arrows.  
   - **Risk Chart**: Shows risk distribution (High, Medium, Low).  
   - During analysis, a rotating status message displays agent progress.  
4. **Export Reports**: Download threat data as CSV or the full report as TXT.  

---

## Environment Variables

### Backend (`multiagent-backend/.env`)
- `GROQ_API_KEY`: API key for Groq’s LLM.  
- `EXA_API_KEY`: API key for Exa web search.  

### Frontend (`react-dashboard/.env`)
- `VITE_API_ENDPOINT`: Backend API URL (e.g., `http://localhost:8000`).  

---

## License

**IntelliRup** is proprietary software. All rights are reserved by Rupin Mehra.  

The software, including its source code, documentation, and associated materials, may not be copied, modified, distributed, or used without explicit written permission from Rupin Mehra. See the `LICENSE` file for full details.  

Unauthorized use, modification, or distribution of this software is strictly prohibited.
