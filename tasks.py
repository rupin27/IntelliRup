from crewai import Task
from agents import research_agent, analysis_agent, response_agent, coordinator_agent

research_task = Task(
    description="Search for the 3 most recent cybersecurity vulnerabilities or threats reported in 2025. Return a list of titles and URLs.",
    agent=research_agent,
    expected_output="A list of 3 recent cybersecurity threats with titles and URLs."
)

analysis_task = Task(
    description="Analyze the provided threat data (titles and URLs) to assess their severity. Summarize each threat and assign a risk level (Low, Medium, High).",
    agent=analysis_agent,
    expected_output="A summary of each threat with a risk level (Low, Medium, High)."
)

response_task = Task(
    description="Based on the analyzed threats and their risk levels, generate a mitigation plan for each threat, including specific actions to neutralize it.",
    agent=response_agent,
    expected_output="A mitigation plan for each threat with actionable steps."
)

coordinator_task = Task(
    description="Oversee the research, analysis, and response tasks. Compile the results into a final report summarizing threats, their risk levels, and mitigation plans.",
    agent=coordinator_agent,
    expected_output="A final report combining threat data, analysis, and mitigation plans."
)