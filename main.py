from crewai import Crew
from agents import research_agent, analysis_agent, response_agent, coordinator_agent
from tasks import research_task, analysis_task, response_task, coordinator_task
import time

def run_crew(query):
    # Get current date
    current_date = time.strftime("%Y-%m-%d")
    
    # Update coordinator_task description and expected_output with current_date
    coordinator_task.description = coordinator_task.description.format(current_date=current_date)
    coordinator_task.expected_output = coordinator_task.expected_output.format(current_date=current_date)
    
    cybersec_crew = Crew(
        agents=[research_agent, analysis_agent, response_agent, coordinator_agent],
        tasks=[research_task, analysis_task, response_task, coordinator_task],
        verbose=True,
        context={"current_date": current_date, "num_threats": 5}
    )
    cybersec_crew.tasks[0].description = f"Search for the 5 most recent {query}. Return a list of titles, URLs, and snippets."
    start_time = time.time()
    result = cybersec_crew.kickoff()
    execution_time = time.time() - start_time
    return result, execution_time