import json
import logging
from app.agents.base import call_gemini
from app.schemas import ResumeAnalyzeResponse

logger = logging.getLogger(__name__)

class ResumeAnalyzerAgent:
    def __init__(self):
        self.name = "Resume Analyzer Agent"
        self.description = "Parses resumes, checks section compliance, evaluates strengths and weaknesses, and scores ATS compatibility."

    def analyze(self, file_name: str, text_content: str, target_role: str) -> ResumeAnalyzeResponse:
        logger.info(f"Agent {self.name} starts analyzing resume '{file_name}' for target role '{target_role}'.")
        
        prompt = f"""
        You are an expert recruiter and Technical ATS System.
        Analyze the following resume text for the target job role of: "{target_role}".
        
        Resume text content:
        ---
        {text_content}
        ---

        Tasks:
        1. Calculate a realistic ATS compatibility score (0 to 100) based on relevance of experience, skills, and formatting.
        2. Identify key strengths of the candidate.
        3. Identify weaknesses/missing gaps relative to the target role of "{target_role}".
        4. Identify if key sections are present or missing: Education, Experience, Projects, Skills, Certifications.
        5. Provide concrete, actionable suggestions for improving the resume (e.g. adding metrics, correcting terminology).

        You must format the response as a JSON object matching the requested schema.
        """
        
        response_text = call_gemini(prompt, response_schema=ResumeAnalyzeResponse)
        
        try:
            data = json.loads(response_text)
            # Ensure file_name is preserved
            data["file_name"] = file_name
            return ResumeAnalyzeResponse(**data)
        except Exception as e:
            logger.error(f"Error parsing Gemini response in ResumeAnalyzerAgent: {e}. Fallback to mock.")
            # Call baseline mock manually in case of validation failures
            from app.agents.base import generate_mock_data
            mock_str = generate_mock_data(prompt, response_schema=ResumeAnalyzeResponse)
            data = json.loads(mock_str)
            data["file_name"] = file_name
            return ResumeAnalyzeResponse(**data)
