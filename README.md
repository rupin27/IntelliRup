# IntelliRup: Multi-Agent Cybersecurity Intelligence System

**IntelliRup** is a proprietary cybersecurity intelligence platform designed to detect, analyze, and mitigate cyber threats in real-time using a multi-agent AI system. Leveraging advanced natural language processing, web search capabilities, and interactive visualizations, IntelliRup empowers authorized cybersecurity professionals and enterprise security teams with actionable insights.

> **⚠️ Important**: This software is proprietary and not open-source. Use, modification, or distribution without explicit permission from Rupin Mehra is strictly prohibited.
<img width="1901" height="937" alt="dashboard-1" src="https://github.com/user-attachments/assets/ea5914c1-3845-429c-8109-e7d860f02135" />
<img width="1901" height="937" alt="dashboard-2" src="https://github.com/user-attachments/assets/b963e35a-f822-4ae9-90c3-31f32c701fac" />


---

## Table of Contents

* [Deployment](#deployment)
* [Overview](#overview)
* [Features](#features)
* [Use Cases](#use-cases)
* [Technical Architecture](#technical-architecture)
* [Project Structure](#project-structure)
* [Installation](#installation)
* [Usage](#usage)
* [Environment Variables](#environment-variables)
* [License](#license)

---

## Deployment

* **Frontend**: Hosted on **Vercel** ([https://intellirup.vercel.app/](https://intellirup.vercel.app/))
* **Backend API**: Hosted on **Render** ([https://intellirup.onrender.com](https://intellirup.onrender.com))
* **Authentication**: Only verified users with passwords can access the system. Unauthorized requests are blocked.

---

## Overview

IntelliRup automates the process of identifying, analyzing, and responding to cybersecurity threats. Authorized users can input queries (e.g., "cybersecurity vulnerabilities 2025") to retrieve recent threat data, assess their severity, and receive tailored mitigation plans. The system combines a modern **React-based frontend** with a robust **Python-based backend** powered by FastAPI and CrewAI, delivering a seamless and secure experience.

### Key Objectives

* **Detect**: Identify recent cybersecurity threats using targeted web searches.
* **Analyze**: Assess the severity and impact of detected threats.
* **Mitigate**: Generate actionable mitigation plans.
* **Visualize**: Present threat relationships and risk distributions through intuitive charts and graphs.
* **Secure Access**: Only verified users with the correct password can access the system.

---

## Features

* **Threat Query Input**: Input custom queries with a dynamic status display cycling through agent activities (Research, Analysis, Response, Coordinator) every 5 seconds during analysis.
* **Interactive Threat Network**: Visualizes threat relationships with color-coded nodes (High: Red, Medium: Orange, Low: Green) and directed arrows.
* **Risk Distribution Charts**: Displays risk levels (High, Medium, Low) using Recharts for clear insights.
* **Exportable Reports**: Download threat summaries as CSV or detailed reports as TXT.
* **Responsive UI**: Built with React for a polished, user-friendly experience.
* **Multi-Agent System**: Employs four AI agents to streamline the threat intelligence workflow.
* **Secure Authentication Layer**: Access restricted to verified users only.

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

* **Framework**: React with TypeScript, built using Vite.
* **UI Libraries**: Tailwind CSS, Shadcn/UI, Lucide, Sonner, Recharts.
* **Deployment**: Hosted on **Vercel**.
* **Environment**: Uses `VITE_API_ENDPOINT` from `.env` to connect to backend.

### Backend

* **Framework**: FastAPI, serving endpoints like `/analyze` and `/health`.
* **Multi-Agent System**: CrewAI with Research, Analysis, Response, and Coordinator agents.
* **Dependencies**: `crewai`, `langchain_groq`, `exa_py`, `pandas`, `fastapi`, `pydantic`.
* **Deployment**: Hosted on **Render**.
* **Authentication Layer**: Only users with valid credentials (password-protected) can access endpoints.

---

## Project Structure

```plaintext
IntelliRup/
├── multiagent-backend/         # Backend FastAPI and CrewAI logic
│   ├── agents.py
│   ├── app.py
│   ├── main.py
│   ├── tasks.py
│   └── test_setup.py
├── react-dashboard/            # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── types/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── lib/
│   ├── .env                    # Environment variables
│   ├── package.json
│   └── tailwind.config.ts
├── LICENSE
└── README.md
```

---

## Installation

> **⚠️ Note**: Installation is restricted to authorized users only. Unauthorized use or distribution is prohibited.

### Prerequisites

* **Node.js**: v18+
* **Python**: 3.9+
* **API Keys**: Groq (`GROQ_API_KEY`) and Exa (`EXA_API_KEY`)

### Backend Setup

```bash
cd multiagent-backend
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn crewai langchain-groq exa-py pandas pydantic
# Add .env with API keys
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd react-dashboard
npm install
# Add .env with VITE_API_ENDPOINT pointing to backend
npm run dev
```

---

## Usage

1. Open the React frontend.
2. Enter a query in the ThreatAnalyzer component.
3. View threat tables, network visualizations, and risk charts.
4. Download CSV or TXT reports.
5. Ensure you are logged in as a verified user to access all functionality.

---

## Environment Variables

### Backend (`multiagent-backend/.env`)

* `GROQ_API_KEY`
* `EXA_API_KEY`

### Frontend (`react-dashboard/.env`)

* `VITE_API_ENDPOINT`

---

## License

**IntelliRup** is proprietary software. All rights reserved by Rupin Mehra. Unauthorized use, modification, or distribution is strictly prohibited. See `LICENSE` for full details.
