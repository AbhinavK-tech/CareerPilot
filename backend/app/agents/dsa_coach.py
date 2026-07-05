import json
import logging
from typing import List, Dict, Any
from pydantic import BaseModel
from app.agents.base import call_gemini

logger = logging.getLogger(__name__)

# Internal schemas for structured output
class MockDSAPracticeItem(BaseModel):
    title: str
    difficulty: str  # Easy, Medium, Hard
    completed: bool = False

class MockDSATopic(BaseModel):
    topic: str
    questions: List[MockDSAPracticeItem]

class DSAScheduleItem(BaseModel):
    day: int
    topic: str
    task: str

class DSAPlanSchema(BaseModel):
    topic_roadmap: List[MockDSATopic]
    daily_schedule: List[DSAScheduleItem]

class DSACoachAgent:
    def __init__(self):
        self.name = "DSA Coach Agent"
        self.description = "Creates daily Data Structures and Algorithms progression trees, mapping questions from Easy to Hard."

    def generate_plan(self, target_role: str) -> Dict[str, Any]:
        logger.info(f"Agent {self.name} is formulating a DSA training roadmap for target role '{target_role}'.")
        
        prompt = f"""
        You are an algorithmic puzzle master and technical coding coach.
        Generate a comprehensive 5-day Data Structures and Algorithms (DSA) preparation plan for a candidate targetting the role of "{target_role}".
        
        The plan should include:
        1. 'topic_roadmap': A list of core topics (e.g. 'Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Trees', 'Graphs'). Each topic should have 2 typical interview problems (specifying title and difficulty: Easy/Medium/Hard).
        2. 'daily_schedule': A day-by-day checklist (Day 1 through Day 5) detailing which topic to study and a specific practice task (e.g., 'Solve 2 problems on Linked Lists').
        
        Format the response as a JSON object matching the schema.
        """
        
        response_text = call_gemini(prompt, response_schema=DSAPlanSchema)
        
        try:
            data = json.loads(response_text)
            # Add default practice_progress block
            data["practice_progress"] = {
                "completed_questions": [],
                "completed_topics": []
            }
            return data
        except Exception as e:
            logger.error(f"Error parsing Gemini response in DSACoachAgent: {e}. Fallback to mock.")
            # High quality fallback
            return {
                "topic_roadmap": [
                    {
                        "topic": "Arrays & Hashing",
                        "questions": [
                            {"title": "Two Sum", "difficulty": "Easy", "completed": False},
                            {"title": "Group Anagrams", "difficulty": "Medium", "completed": False}
                        ]
                    },
                    {
                        "topic": "Two Pointers & Sliding Window",
                        "questions": [
                            {"title": "Valid Palindrome", "difficulty": "Easy", "completed": False},
                            {"title": "Container With Most Water", "difficulty": "Medium", "completed": False}
                        ]
                    },
                    {
                        "topic": "Trees",
                        "questions": [
                            {"title": "Invert Binary Tree", "difficulty": "Easy", "completed": False},
                            {"title": "Binary Tree Maximum Path Sum", "difficulty": "Hard", "completed": False}
                        ]
                    }
                ],
                "daily_schedule": [
                    {"day": 1, "topic": "Arrays & Hashing", "task": "Study Hashmap insertions and collision rates. Solve 'Two Sum'."},
                    {"day": 2, "topic": "Arrays & Hashing", "task": "Solve 'Group Anagrams' and practice bucket sort approaches."},
                    {"day": 3, "topic": "Two Pointers", "task": "Read about two pointer iterations. Solve 'Valid Palindrome'."},
                    {"day": 4, "topic": "Sliding Window", "task": "Solve 'Container With Most Water' and analyze dynamic window resizing."},
                    {"day": 5, "topic": "Trees", "task": "Revise recursion and DFS traversals. Solve 'Invert Binary Tree'."}
                ],
                "practice_progress": {
                    "completed_questions": [],
                    "completed_topics": []
                }
            }
