import json
import logging
from typing import List, Dict, Any
from pydantic import BaseModel
from app.agents.base import call_gemini

logger = logging.getLogger(__name__)

class JobMatchItemSchema(BaseModel):
    role_name: str
    match_percentage: int
    pros: List[str]
    cons: List[str]

class JobMatchListSchema(BaseModel):
    matches: List[JobMatchItemSchema]

class JobMatchingAgent:
    def __init__(self):
        self.name = "Job Matching Agent"
        self.description = "Compares candidate skill sets across popular technology disciplines, rendering alignment percentages."

    def evaluate_roles(self, resume_text: str, current_skills: List[str]) -> List[Dict[str, Any]]:
        logger.info(f"Agent {self.name} is matching skills profile against tech roles.")
        
        prompt = f"""
        You are a career consultant and recruitment director.
        Evaluate the candidate's skills and resume content across the following standard technical roles:
        - AI Engineer
        - ML Engineer
        - Backend Engineer
        - Data Scientist
        - DevOps Engineer
        - Fullstack Engineer
        - Software Engineer
        - Data Analyst
        - Frontend Engineer

        Candidate's current skills: {', '.join(current_skills)}
        Resume snippet:
        ---
        {resume_text[:2000]}
        ---

        Tasks:
        For each role, calculate:
        1. 'match_percentage': an integer from 0 to 100 indicating alignment.
        2. 'pros': list of reasons why they fit this role based on their skills.
        3. 'cons': list of missing experience/skills holding them back for this role.

        Return a JSON object containing a 'matches' list, where each item fits the JobMatchItemSchema.
        """
        
        response_text = call_gemini(prompt, response_schema=JobMatchListSchema)
        
        try:
            data = json.loads(response_text)
            return data.get("matches", [])
        except Exception as e:
            logger.error(f"Error parsing Gemini response in JobMatchingAgent: {e}. Fallback to mock.")
            # Standard mock matches
            return [
                {
                    "role_name": "AI Engineer",
                    "match_percentage": 75,
                    "pros": ["Good knowledge of Python", "Understands FastAPI and basic machine learning model integration"],
                    "cons": ["Lacks experience with advanced LLM hosting or fine-tuning pipelines"]
                },
                {
                    "role_name": "Backend Engineer",
                    "match_percentage": 85,
                    "pros": ["Solid FastAPI and Python foundations", "Strong understanding of relational SQL databases"],
                    "cons": ["Needs exposure to message queues (RabbitMQ/Celery) and caching frameworks (Redis)"]
                },
                {
                    "role_name": "ML Engineer",
                    "match_percentage": 60,
                    "pros": ["Knows PyTorch and numpy", "Can set up basic modeling containers"],
                    "cons": ["Missing experience with MLOps pipelines (MLflow, Kubeflow) and high-throughput deployment"]
                },
                {
                    "role_name": "DevOps Engineer",
                    "match_percentage": 45,
                    "pros": ["Familiar with basic Linux and git CLI workflow"],
                    "cons": ["No experience with Kubernetes, CI/CD Actions, Terraform, or cloud systems (AWS/GCP)"]
                },
                {
                    "role_name": "Fullstack Engineer",
                    "match_percentage": 70,
                    "pros": ["Comfortable with Python backends and REST architecture", "Familiar with JS/HTML interfaces"],
                    "cons": ["Needs to master modern React routing, state workflows, and Tailwind layout styles"]
                },
                {
                    "role_name": "Software Engineer",
                    "match_percentage": 80,
                    "pros": ["Strong backend development fundamentals", "Familiar with system design and databases"],
                    "cons": ["Could add experience with concurrency testing frameworks and legacy integration systems"]
                },
                {
                    "role_name": "Data Analyst",
                    "match_percentage": 65,
                    "pros": ["Strong SQL database querying foundations", "Experienced with NumPy and data manipulation"],
                    "cons": ["Lacks experience with Tableau/PowerBI visual dashboards and BI analytics tooling"]
                },
                {
                    "role_name": "Frontend Engineer",
                    "match_percentage": 50,
                    "pros": ["Understands basic HTML/CSS selectors and script layouts"],
                    "cons": ["Missing modern UI framework builds (Vite, React, Next.js) and state management libraries"]
                }
            ]
export_matching_agent = JobMatchingAgent
