import streamlit as st
from main import run_crew
import pandas as pd
import pyvis.network
import time

st.set_page_config(page_title="Cyber Threat Intelligence", layout="wide")
st.title("🛡️ Cyber Threat Intelligence Dashboard")
st.markdown("Analyze recent cybersecurity threats with AI-powered insights.")

# Custom CSS for polish
st.markdown("""
<style>
.stApp { background-color: #1E1E1E; color: #FFFFFF; }
.stButton>button { background-color: #FF4136; color: white; }
.stTextInput>div>input { background-color: #2E2E2E; color: #FFFFFF; }
.stSpinner { border-color: #FF4136; }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if "result" not in st.session_state:
    st.session_state.result = None
    st.session_state.execution_time = None
    st.session_state.ran = False

# User input
query = st.text_input("Enter threat query (e.g., 'cybersecurity vulnerabilities 2025'):", "cybersecurity vulnerabilities 2025")
if st.button("Analyze Threats"):
    with st.spinner("Analyzing 5 threats..."):
        st.session_state.result, st.session_state.execution_time = run_crew(query)
        st.session_state.ran = True

# Display results
if st.session_state.result:
    st.markdown(f"### Threat Report (Execution Time: {st.session_state.execution_time:.2f}s)")
    st.markdown(st.session_state.result)

    # Parse threats (adjust based on actual result format)
    threats = []
    if "Fallback Threat" not in st.session_state.result:
        threats = [
            {"Title": "CVE-2025-1234", "URL": "https://devsecopsai.today/...", "Risk": "High", "Snippet": "Chrome zero-day..."},
            # Add placeholders or parse from result
        ] * 5
    else:
        threats = [{"Title": "Fallback Threat", "URL": "https://cisa.gov", "Risk": "Medium", "Snippet": "General 2025 cyber advisory"}]

    df = pd.DataFrame(threats)
    st.markdown("### Threat Summary")
    st.dataframe(df, width='stretch')  # Fixed deprecation warning

    # Risk chart - Fixed to use proper Streamlit charting with custom colors
    st.markdown("### Risk Distribution")
    risk_counts = df["Risk"].value_counts().reindex(["High", "Medium", "Low"], fill_value=0)
    
    # Create a DataFrame for the bar chart
    chart_data = pd.DataFrame({
        'Risk Level': ['High', 'Medium', 'Low'],
        'Count': [int(risk_counts.get("High", 0)), int(risk_counts.get("Medium", 0)), int(risk_counts.get("Low", 0))]
    })
    
    # Use Plotly for custom colors
    import plotly.graph_objects as go
    
    fig = go.Figure(data=[
        go.Bar(
            x=chart_data['Risk Level'],
            y=chart_data['Count'],
            marker_color=['#FF4136', '#FF851B', '#2ECC40'],  # Red, Orange, Green
            text=chart_data['Count'],
            textposition='auto',
        )
    ])
    
    fig.update_layout(
        title="",
        xaxis_title="Risk Level",
        yaxis_title="Number of Threats",
        yaxis=dict(tickmode='linear', tick0=0, dtick=1),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font=dict(color='white'),
        showlegend=False
    )
    
    st.plotly_chart(fig, use_container_width=True)

    # Threat network graph
    st.markdown("### Threat Relationships")
    net = pyvis.network.Network(height="500px", width="100%", directed=True)
    
    # Define colors for each risk level
    risk_colors = {
        "High": "#FF4136",    # Red
        "Medium": "#FF851B",  # Orange
        "Low": "#2ECC40"      # Green
    }
    
    for i, threat in enumerate(threats[:5]):
        color = risk_colors.get(threat["Risk"], "#808080")  # Default to gray if risk level unknown
        net.add_node(i, label=threat["Title"], title=threat["Snippet"], color=color)
    
    if len(threats) > 1:
        for i in range(min(len(threats)-1, 4)):
            net.add_edge(i, i+1, title="Potential shared exploit")
    net.save_graph("threat_network.html")
    with open("threat_network.html", "r") as f:
        st.components.v1.html(f.read(), height=500)

    # Export options
    st.markdown("### Export Report")
    csv = df.to_csv(index=False)
    st.download_button("Download CSV", csv, "threats.csv", "text/csv")
    
    # Convert CrewOutput to string before encoding
    report_text = str(st.session_state.result)
    st.download_button("Download Report (TXT)", report_text.encode(), "threat_report.txt", "text/plain")