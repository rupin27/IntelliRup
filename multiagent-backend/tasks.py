from crewai import Task
from agents import research_agent, analysis_agent, response_agent, coordinator_agent

research_task = Task(
    description="Search for the 5 most recent cybersecurity vulnerabilities or threats reported in 2025. Return a list of titles, URLs, and snippets.",
    agent=research_agent,
    expected_output="A list of 5 recent cybersecurity threats with titles, URLs, and snippets."
)
analysis_task = Task(
    description="Analyze the provided threat data (titles, URLs, snippets) to assess severity. Summarize each threat and assign a risk level (Low, Medium, High).",
    agent=analysis_agent,
    expected_output="A summary of each threat with a risk level (Low, Medium, High).",
    context=[research_task]
)
response_task = Task(
    description="Generate a mitigation plan for each analyzed threat, including specific actions to neutralize it.",
    agent=response_agent,
    expected_output="A mitigation plan for each threat with actionable steps.",
    context=[research_task, analysis_task]
)
coordinator_task = Task(
    description="Compile results into a final report summarizing 5 threats, their risk levels, and mitigation plans. Use the current date: {current_date}.",
    agent=coordinator_agent,
    expected_output="A final report combining 5 threats, analyses, and mitigation plans, with date: {current_date}.",
    context=[research_task, analysis_task, response_task]
)