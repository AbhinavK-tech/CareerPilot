import json
import logging
from app.agents.base import call_gemini
from app.schemas import SkillGapResponse

logger = logging.getLogger(__name__)

class SkillGapAgent:
    def __init__(self):
        self.name = "Skill Gap Agent"
        self.description = "Compares candidate's resume/skills against a target industry role, mapping out missing skills and prioritization levels."

    def analyze_gaps(self, resume_text: str, target_role: str) -> SkillGapResponse:
        logger.info(f"Agent {self.name} is assessing skill gaps for target role '{target_role}'.")
        
        prompt = f"""
        You are an expert technical product manager and IT career mentor.
        Compare the candidate's experience/skills (from their resume below) against the standard expectations for the target role: "{target_role}".
        
        Candidate's resume content:
        ---
        {resume_text}
        ---

        Tasks:
        1. Compile list of 'current_skills' found in the resume.
        2. Compile list of standard 'target_skills' expected for a professional in the role "{target_role}".
        3. Identify 'missing_skills' (skills in target_skills that the user lacks or has weak exposure to).
        4. Prioritize learning the missing skills: mark each missing skill as "High", "Medium", or "Low" priority based on how critical they are to land the role.
        5. Calculate a skill 'match_percentage' (0.0 to 100.0) expressing current job readiness.

        You must format the response as a JSON object matching the requested schema.
        """
        
        response_text = call_gemini(prompt, response_schema=SkillGapResponse)
        
        try:
            data = json.loads(response_text)
            return SkillGapResponse(**data)
        except Exception as e:
            logger.error(f"Error parsing Gemini response in SkillGapAgent: {e}. Fallback to mock.")
            from app.agents.base import generate_mock_data
            mock_str = generate_mock_data(prompt, response_schema=SkillGapResponse)
            return SkillGapResponse(**json.loads(mock_str))
