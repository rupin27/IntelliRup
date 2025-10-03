import os
from dotenv import load_dotenv
from exa_py import Exa
from langchain_groq import ChatGroq

load_dotenv()

# Test Exa for threat intel
exa = Exa(api_key=os.getenv("EXA_API_KEY"))
search_response = exa.search(
    query="latest cybersecurity vulnerabilities October 2025",
    num_results=3,  # Keep it small for testing
    use_autoprompt=True,  # Auto-generates better search prompts
    type="hybrid"  # Balances semantic and keyword search
)
print("Exa Threat Search Results:")
for result in search_response.results:
    print(f"- Title: {result.title}")
    print(f"  URL: {result.url}")
    # Check if text exists before slicing
    snippet = result.text if result.text else "No snippet available"
    print(f"  Snippet: {snippet[:200]}...")  # Truncate for readability


# Test Groq LLM
print("Testing Groq LLM Integration...")
llm = ChatGroq(
    model="llama-3.1-8b-instant",  # Fast and capable for our needs; alternatives: "mixtral-8x7b-32768"
    temperature=0.7  # Balanced creativity for threat analysis
)
response = llm.invoke("Summarize the importance of multi-agent AI in cybersecurity threat detection.")
print("Groq Response:")
print(response.content)