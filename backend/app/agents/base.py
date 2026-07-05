import os
import json
import logging
from typing import Any, Dict, Optional, Type
from pydantic import BaseModel
from app.config import settings

logger = logging.getLogger(__name__)

# Try importing google-genai, fallback to google-generativeai or mock
gemini_available = False
client = None

if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip() not in ["", "your_gemini_api_key_here"]:
    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        gemini_available = True
        logger.info("Google GenAI client initialized successfully.")
    except Exception as e:
        logger.warning(f"Failed to initialize google-genai: {e}. Falling back to mock agent responses.")
else:
    logger.info("No valid GEMINI_API_KEY provided. Operating in Demo Mode with mock responses.")

def call_gemini(prompt: str, response_schema: Optional[Type[BaseModel]] = None) -> str:
    """
    Call Gemini with the given prompt, requesting structured JSON output if schema is provided.
    If the API call fails or is disabled, fallback to mock generation.
    """
    if not gemini_available or client is None:
        logger.debug("Gemini not available. Generating mock data.")
        return generate_mock_data(prompt, response_schema)

    try:
        model_name = 'gemini-2.5-flash'
        if response_schema:
            # Structuring configurations for structured outputs
            from google.genai import types
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=response_schema,
                temperature=0.2
            )
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=config
            )
        else:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )
        return response.text
    except Exception as e:
        logger.error(f"Gemini API invocation failed: {e}. Falling back to mock data.")
        return generate_mock_data(prompt, response_schema)


def generate_mock_data(prompt: str, response_schema: Optional[Type[BaseModel]]) -> str:
    """
    Heuristics-based mock data generator to satisfy Demo Mode requirements when Gemini is not configured.
    """
    prompt_lower = prompt.lower()
    
    # If the schema is user-defined, we can inspect its fields and return some mock data.
    # To make it high quality, we write custom mock templates for each agent below.
    
    if response_schema:
        schema_name = response_schema.__name__.lower()
        
        # 1. Resume Analyzer
        if "resume" in schema_name or "resumeanalyzer" in schema_name:
            mock = {
                "file_name": "resume.pdf",
                "ats_score": 78,
                "strengths": [
                    "Strong background in Python and FastAPI",
                    "Demonstrated project work with PyTorch and machine learning pipelines",
                    "Good understanding of SQL databases"
                ],
                "weaknesses": [
                    "Missing system design / architecture details",
                    "Limited cloud deployment experience listed (AWS/GCP)",
                    "No formal section on unit testing or CI/CD pipelines"
                ],
                "sections_found": {
                    "Education": True,
                    "Experience": True,
                    "Projects": True,
                    "Skills": True,
                    "Certifications": False
                },
                "suggestions": [
                    "Add a dedicated 'Cloud & DevOps' section outlining Docker or AWS tools.",
                    "Elaborate on the scale and performance metrics of your ML projects (e.g. throughput, accuracy improvements).",
                    "Incorporate key system design keywords to improve ATS scanning compatibility."
                ]
            }
            return json.dumps(mock)
            
        # 2. Skill Gap
        elif "skillgap" in schema_name:
            # Determine role from prompt
            target_role = "AI Engineer"
            if "devops" in prompt_lower:
                target_role = "DevOps Engineer"
            elif "backend" in prompt_lower:
                target_role = "Backend Engineer"
                
            mock = {
                "current_skills": ["Python", "FastAPI", "SQL", "Git", "PyTorch"],
                "missing_skills": ["Docker", "Kubernetes", "Google Cloud Platform", "CI/CD (GitHub Actions)", "System Design"],
                "target_skills": ["Python", "FastAPI", "SQL", "Git", "PyTorch", "Docker", "Kubernetes", "GCP", "CI/CD", "System Design"],
                "priorities": {
                    "Docker": "High",
                    "System Design": "High",
                    "CI/CD (GitHub Actions)": "Medium",
                    "Google Cloud Platform": "Medium",
                    "Kubernetes": "Low"
                },
                "match_percentage": 55.0
            }
            return json.dumps(mock)
            
        # 3. Career Planner / Roadmap
        elif "roadmap" in schema_name:
            mock = {
                "term_type": "30-day",
                "tasks": [
                    {"title": "Master Docker Containers", "description": "Learn containerization basics, write Dockerfiles, and compose multi-service backends.", "status": "pending", "week": 1, "resources": ["Docker Official Docs", "Docker Tutorial on YouTube"]},
                    {"title": "Setup CI/CD Pipeline", "description": "Implement automated testing and building using GitHub Actions for your FastAPI projects.", "status": "pending", "week": 2, "resources": ["GitHub Actions Guide"]},
                    {"title": "System Design Foundations", "description": "Study caching, load balancers, database scaling, and microservices design principles.", "status": "pending", "week": 3, "resources": ["Grokking System Design", "ByteByteGo YouTube"]},
                    {"title": "Deploy to GCP Cloud Run", "description": "Package the FastAPI backend and deploy it to Google Cloud Run with serverless scaling.", "status": "pending", "week": 4, "resources": ["GCP Cloud Run Quickstart"]}
                ]
            }
            return json.dumps(mock)

        # 4. Learning Resources
        elif "learningresource" in schema_name:
            # This should match the list of LearningResource
            pass

        # 5. Project Recommendation
        elif "project" in schema_name:
            pass

        # 6. Interview Coach
        elif "interviewsession" in schema_name or "interview" in schema_name:
            mock = {
                "session_id": 101,
                "questions": [
                    {"id": 1, "question": "Explain the difference between a process and a thread in Python. How does the Global Interpreter Lock (GIL) affect them?", "type": "technical"},
                    {"id": 2, "question": "Describe a time you faced a challenging technical block. How did you diagnose and overcome it?", "type": "behavioral"},
                    {"id": 3, "question": "Design a rate limiter for a public API. What database or data structure would you use, and why?", "type": "coding"}
                ]
            }
            return json.dumps(mock)

        # 7. GitHub Review
        elif "githubreview" in schema_name:
            mock = {
                "repo_name": "fastapi-ml-app",
                "readme_score": 85,
                "documentation_score": 75,
                "structure_score": 90,
                "commits_score": 80,
                "complexity_score": 85,
                "overall_score": 83,
                "comments": "The repository is well structured with clean separations of code logic. However, the README lacks setup command specifications, and API documentation for endpoint usage is sparse.",
                "folder_structure": ".\n├── app/\n│   ├── main.py\n│   ├── models.py\n│   └── utils.py\n├── tests/\n│   └── test_main.py\n├── Dockerfile\n├── README.md\n└── requirements.txt",
                "improvements": [
                    "Expand the README.md with detailed API requests and responses examples.",
                    "Include a Swagger/OpenAPI doc link and setup guide.",
                    "Add badges and pre-commit linting to ensure documentation builds successfully."
                ]
            }
            return json.dumps(mock)
            
        # Fallback dictionary for any schema
        fields = response_schema.model_fields
        fallback = {}
        for field_name, field_type in fields.items():
            if getattr(field_type.annotation, "__origin__", None) is list:
                fallback[field_name] = ["Sample Item 1", "Sample Item 2"]
            elif getattr(field_type.annotation, "__origin__", None) is dict:
                fallback[field_name] = {"key1": "value1", "key2": "value2"}
            elif field_type.annotation is int:
                fallback[field_name] = 80
            elif field_type.annotation is float:
                fallback[field_name] = 85.5
            elif field_type.annotation is bool:
                fallback[field_name] = True
            else:
                fallback[field_name] = "Sample text value"
        return json.dumps(fallback)
        
    return "Sample plain text response."
