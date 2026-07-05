import json
import logging
from typing import List
from app.agents.base import call_gemini
from app.schemas import RoadmapResponse, TaskItem

logger = logging.getLogger(__name__)

class CareerPlannerAgent:
    def __init__(self):
        self.name = "Career Planner Agent"
        self.description = "Creates structured, actionable milestones and timelines based on user experience, learning pace, and available study hours."

    def generate_roadmap(
        self, 
        target_role: str, 
        missing_skills: List[str], 
        available_hours: int, 
        learning_speed: str, 
        term_type: str
    ) -> RoadmapResponse:
        logger.info(f"Agent {self.name} is creating a '{term_type}' roadmap for {target_role}.")
        
        prompt = f"""
        You are a senior tech lead and engineering career developer.
        Generate a personalized career roadmap for a user transitioning to the target role of: "{target_role}".
        
        User context:
        - Target Role: {target_role}
        - Missing Skills to acquire: {', '.join(missing_skills) if missing_skills else 'None, focus on advanced projects'}
        - Available hours to study: {available_hours} hours/week
        - Learning speed: {learning_speed}
        - Roadmap term type: {term_type} (e.g. 30-day, 90-day, 6-month, or 1-year plan)

        Tasks:
        Create a detailed list of learning tasks. Each task should specify:
        1. 'title': A short, clear name for the task (e.g., "Dockerize a Python REST API").
        2. 'description': Actionable details on what exactly needs to be learned/built, tailored to the user's available time ({available_hours} hrs/week).
        3. 'week': The specific week index (1-indexed) in which this task should be done.
        4. 'resources': A list of standard suggested topics or links (e.g., "FastAPI Docs", "Docker Tutorial") to consult.

        Ensure tasks are sequenced logically (fundamentals first, then integration, then cloud/deployment, then advanced portfolio projects).
        Return the response as a JSON object matching the requested schema.
        """
        
        response_text = call_gemini(prompt, response_schema=RoadmapResponse)
        
        try:
            data = json.loads(response_text)
            # Guarantee term_type matches what was requested
            data["term_type"] = term_type
            return RoadmapResponse(**data)
        except Exception as e:
            logger.error(f"Error parsing Gemini response in CareerPlannerAgent: {e}. Fallback to mock.")
            from app.agents.base import generate_mock_data
            mock_str = generate_mock_data(prompt, response_schema=RoadmapResponse)
            data = json.loads(mock_str)
            data["term_type"] = term_type
            return RoadmapResponse(**data)
