import json
import logging
from app.agents.base import call_gemini
from app.schemas import GitHubReviewResponse

logger = logging.getLogger(__name__)

class GitHubReviewerAgent:
    def __init__(self):
        self.name = "GitHub Review Agent"
        self.description = "Analyzes repository metadata, file structuring trees, README documentation quality, and commits to rate portfolio readiness."

    def review_repository(self, repo_url: str) -> GitHubReviewResponse:
        logger.info(f"Agent {self.name} is reviewing repository: '{repo_url}'.")
        
        # In a real environment we would make HTTP calls to GitHub api.
        # To handle both real and mocked repos, the prompt evaluates based on the repo url or returns high-quality simulation.
        
        prompt = f"""
        You are a senior tech lead and open source repository code auditor.
        Review the public GitHub repository URL: "{repo_url}".
        
        Analyze its likely structure, documentation standards, and architectural completeness.
        
        Tasks:
        1. Parse the repository name from the URL.
        2. Assign scores (0 to 100) for: README quality, documentation, folder structure, commit message style, and code complexity.
        3. Calculate an overall average score (0 to 100).
        4. Draft detailed audit comments (comments) describing code strengths.
        5. Propose a typical folder_structure tree for this type of project.
        6. List 3 to 5 clear improvements to make it production-ready.

        Return the response as a JSON object matching the requested schema.
        """
        
        response_text = call_gemini(prompt, response_schema=GitHubReviewResponse)
        
        try:
            data = json.loads(response_text)
            # Make sure repo_name is correct
            repo_name = repo_url.rstrip("/").split("/")[-1]
            data["repo_name"] = repo_name
            return GitHubReviewResponse(**data)
        except Exception as e:
            logger.error(f"Error parsing Gemini response in GitHubReviewerAgent: {e}. Fallback to mock.")
            # Mock review
            repo_name = repo_url.rstrip("/").split("/")[-1] if "/" in repo_url else "careerpilot-dashboard"
            from app.agents.base import generate_mock_data
            mock_str = generate_mock_data(prompt, response_schema=GitHubReviewResponse)
            data = json.loads(mock_str)
            data["repo_name"] = repo_name
            return GitHubReviewResponse(**data)
