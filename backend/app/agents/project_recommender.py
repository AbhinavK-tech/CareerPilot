import json
import logging
from typing import List, Dict, Any
from pydantic import BaseModel
from app.agents.base import call_gemini

logger = logging.getLogger(__name__)

class ProjectItemSchema(BaseModel):
    title: str
    description: str
    difficulty: str  # Beginner, Medium, Hard
    duration: str  # e.g., '2 weeks'
    skills_learned: List[str]
    folder_structure: str  # text representation of workspace
    portfolio_impact: str  # High, Medium, Low

class ProjectListSchema(BaseModel):
    projects: List[ProjectItemSchema]

class ProjectRecommenderAgent:
    def __init__(self):
        self.name = "Project Recommendation Agent"
        self.description = "Recommends custom portfolio projects based on target skill acquisition, difficulty preferences, and structural outline templates."

    def recommend(self, target_role: str, missing_skills: List[str], learning_speed: str) -> List[Dict[str, Any]]:
        logger.info(f"Agent {self.name} is formulating customized project tasks for target role '{target_role}'.")
        
        prompt = f"""
        You are a senior systems engineer and technical curriculum planner.
        Recommend exactly 2 portfolio-worthy coding projects for a candidate preparing for the role of "{target_role}".
        The projects should focus on incorporating these missing skills: {', '.join(missing_skills) if missing_skills else 'Advanced system design, cloud scalability'}.
        
        User details:
        - Target Role: {target_role}
        - Pacing: {learning_speed}

        Each project must contain:
        1. 'title': Unique and descriptive (e.g. 'Serverless ML inference backend')
        2. 'description': Detailed description of what the project does and what tools it uses
        3. 'difficulty': Beginner, Medium, or Hard
        4. 'duration': Estimated completion time (e.g. '1 week', '2 weeks')
        5. 'skills_learned': List of specific libraries/technologies applied
        6. 'folder_structure': A clear ASCII text tree directory representation of the project structure
        7. 'portfolio_impact': High, Medium, or Low (depending on complexity and resume value)

        Return the response as a JSON object with a 'projects' list matching the schema.
        """
        
        response_text = call_gemini(prompt, response_schema=ProjectListSchema)
        
        try:
            data = json.loads(response_text)
            return data.get("projects", [])
        except Exception as e:
            logger.error(f"Error parsing Gemini response in ProjectRecommenderAgent: {e}. Fallback to mock.")
            # Standard mock projects
            return [
                {
                    "title": f"Distributed Task Worker Queue",
                    "description": f"Build a robust asynchronous task processor using FastAPI, Redis, and Celery. Includes worker pooling, retry mechanisms, and a live monitoring dashboard.",
                    "difficulty": "Medium",
                    "duration": "2 weeks",
                    "skills_learned": ["FastAPI", "Redis", "Celery", "Docker", "PostgreSQL"],
                    "folder_structure": ".\n├── app/\n│   ├── main.py\n│   ├── tasks.py\n│   └── worker.py\n├── docker-compose.yml\n└── README.md",
                    "portfolio_impact": "High"
                },
                {
                    "title": f"Scalable Real-time Web Crawler",
                    "description": f"Develop a concurrent web scraper targeting developer documentation, parsing content, indexing in SQLite / PG Vector, and serving via REST API.",
                    "difficulty": "Hard",
                    "duration": "3 weeks",
                    "skills_learned": ["Python asyncio", "httpx", "BeautifulSoup", "SQLite", "FastAPI"],
                    "folder_structure": ".\n├── src/\n│   ├── crawler.py\n│   ├── parser.py\n│   └── server.py\n├── requirements.txt\n└── README.md",
                    "portfolio_impact": "High"
                }
            ]
