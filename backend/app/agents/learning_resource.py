import json
import logging
from typing import List, Dict, Any
from pydantic import BaseModel
from app.agents.base import call_gemini

logger = logging.getLogger(__name__)

class ResourceItem(BaseModel):
    skill: str
    title: str
    url: str
    source: str  # YouTube, Kaggle, GitHub, Documentation, Free Course
    difficulty: str  # Beginner, Intermediate, Advanced

class ResourceListSchema(BaseModel):
    resources: List[ResourceItem]

class LearningResourceAgent:
    def __init__(self):
        self.name = "Learning Resource Agent"
        self.description = "Searches, filters, and indexes non-duplicate learning material across YouTube, GitHub, Kaggle, and official developer documentations."

    def recommend_resources(self, missing_skills: List[str]) -> List[Dict[str, Any]]:
        if not missing_skills:
            return []
            
        logger.info(f"Agent {self.name} is discovering learning resources for: {missing_skills}.")
        
        prompt = f"""
        You are a tech education librarian and content curator.
        Recommend high-quality learning resources for the following skills: {', '.join(missing_skills)}.
        
        For each skill, suggest 1 or 2 top-tier resources.
        Choose from these sources: YouTube, Kaggle, GitHub, Official Documentation, or Free Courses.
        Provide realistic and valid URLs (e.g. YouTube channels, GitHub repos, official doc websites).
        Avoid duplicate links.
        
        Return the response as a JSON object with a 'resources' list, matching the Pydantic schema structure.
        Each item needs:
        - 'skill': name of the skill
        - 'title': descriptive title of the resource (e.g. 'Intro to Docker - FreeCodeCamp')
        - 'url': URL
        - 'source': YouTube / Kaggle / GitHub / Documentation / Free Course
        - 'difficulty': Beginner / Intermediate / Advanced
        """
        
        response_text = call_gemini(prompt, response_schema=ResourceListSchema)
        
        try:
            data = json.loads(response_text)
            return data.get("resources", [])
        except Exception as e:
            logger.error(f"Error parsing Gemini response in LearningResourceAgent: {e}. Fallback to mock.")
            # Standard high-quality mock resources fallback
            mock_resources = []
            for skill in missing_skills[:4]:
                mock_resources.append({
                    "skill": skill,
                    "title": f"Official {skill} Documentation and Tutorial Guides",
                    "url": f"https://docs.google.com/search?q={skill}+official+documentation",
                    "source": "Documentation",
                    "difficulty": "Beginner"
                })
                mock_resources.append({
                    "skill": skill,
                    "title": f"{skill} Crash Course - Tech With Tim",
                    "url": f"https://www.youtube.com/results?search_query={skill}+crash+course",
                    "source": "YouTube",
                    "difficulty": "Intermediate"
                })
            return mock_resources
