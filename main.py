from crewai import Crew
from agents import research_agent, analysis_agent, response_agent, coordinator_agent
from tasks import research_task, analysis_task, response_task, coordinator_task
import time  # For metrics

cybersec_crew = Crew(
    agents=[research_agent, analysis_agent, response_agent, coordinator_agent],
    tasks=[research_task, analysis_task, response_task, coordinator_task],
    verbose=True
)

print("Starting crew execution...")
start_time = time.time()
result = cybersec_crew.kickoff()
print(f"Final Report (Execution time: {time.time() - start_time:.2f}s):")
print(result)