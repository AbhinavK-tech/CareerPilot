import json
import logging
from typing import List, Dict, Any
from pydantic import BaseModel
from app.agents.base import call_gemini
from app.schemas import InterviewQuestion, AnswerFeedback, InterviewEvaluationResponse

logger = logging.getLogger(__name__)

# Pydantic schemas for structured Gemini generation
class QuestionsListSchema(BaseModel):
    questions: List[Dict[str, Any]] # Will contains id, question, type, company

class EvaluationSchema(BaseModel):
    score: int
    feedback: List[AnswerFeedback]
    overall_summary: str

class InterviewCoachAgent:
    def __init__(self):
        self.name = "Interview Coach Agent"
        self.description = "Conducts mock technical, behavioral, and coding interviews. Assesses answers and scores communication and correctness."

    def generate_questions(self, target_role: str) -> List[Dict[str, Any]]:
        logger.info(f"Agent {self.name} is generating mock interview questions for: {target_role}.")
        
        prompt = f"""
        You are a hiring manager and technical interviewer.
        Generate exactly 3 interview questions for a candidate applying for the role: "{target_role}".
        
        The questions must represent:
        - 1 Technical question (evaluating core concepts)
        - 1 Behavioral question (evaluating team conflict or problem solving)
        - 1 Coding/System Design question (evaluating architecture or algorithmic details)

        Ensure questions are challenging, relevant to "{target_role}", and clear.
        
        Return the response as a JSON object with a 'questions' list. Each question should have:
        - 'id': integer (1, 2, 3)
        - 'question': the prompt string
        - 'type': 'technical', 'behavioral', or 'coding'
        - 'company': optional name of a tech company that asks this (e.g. 'Google', 'Meta', 'Netflix')
        """
        
        response_text = call_gemini(prompt, response_schema=QuestionsListSchema)
        
        try:
            data = json.loads(response_text)
            return data.get("questions", [])
        except Exception as e:
            logger.error(f"Error parsing Gemini response in InterviewCoachAgent.generate_questions: {e}. Fallback to mock.")
            # Standard mock questions
            return [
                {
                    "id": 1,
                    "question": f"What are the main performance bottlenecks when scaling a {target_role} system, and how would you optimize them?",
                    "type": "technical",
                    "company": "Netflix"
                },
                {
                    "id": 2,
                    "question": "Tell me about a time you had to make a technical trade-off under a tight deadline. What was the impact?",
                    "type": "behavioral",
                    "company": "Google"
                },
                {
                    "id": 3,
                    "question": f"Design a highly available database schema and caching layer for a global dashboard supporting a {target_role} workflow.",
                    "type": "coding",
                    "company": "Meta"
                }
            ]

    def evaluate_answers(self, target_role: str, session_questions: List[Dict[str, Any]], user_answers: Dict[int, str]) -> EvaluationSchema:
        logger.info(f"Agent {self.name} is evaluating user answers for session.")
        
        # Prepare evaluation context
        evaluation_context = []
        for q in session_questions:
            qid = q.get("id")
            q_text = q.get("question")
            ans = user_answers.get(str(qid)) or user_answers.get(qid) or "No answer provided."
            evaluation_context.append({
                "question_id": qid,
                "question": q_text,
                "user_answer": ans
            })
            
        context_str = json.dumps(evaluation_context, indent=2)
        
        prompt = f"""
        You are a hiring committee manager and technical coach evaluating a candidate's mock interview responses for the role of "{target_role}".
        
        Review the candidate's answers below:
        {context_str}

        Tasks:
        1. Rate each answer out of 100 on accuracy, communication, and completeness.
        2. Provide constructive, detailed feedback for each question explaining what was good, what was missing, and how to improve.
        3. Provide an 'exemplar' model answer for each question.
        4. Calculate an overall average score (0 to 100) for the interview session.
        5. Write a professional overall_summary summarizing the candidate's strengths and areas of growth.

        Format the response as a JSON object matching the requested schema.
        """
        
        response_text = call_gemini(prompt, response_schema=EvaluationSchema)
        
        try:
            data = json.loads(response_text)
            return EvaluationSchema(**data)
        except Exception as e:
            logger.error(f"Error parsing Gemini response in InterviewCoachAgent.evaluate_answers: {e}. Fallback to mock.")
            # Fallback mock evaluation
            feedbacks = []
            total_score = 0
            for item in evaluation_context:
                score = 75 if item["user_answer"] != "No answer provided." else 0
                total_score += score
                feedbacks.append(AnswerFeedback(
                    question_id=item["question_id"],
                    question=item["question"],
                    user_answer=item["user_answer"],
                    score=score,
                    feedback="Good initial explanation. To make it stronger, explain the structural trade-offs and include quantitative metrics of past project impact.",
                    exemplar="An ideal answer would outline: 1. Core architectural concepts. 2. Performance implications. 3. Specific production design choices."
                ))
            
            avg_score = int(total_score / len(evaluation_context)) if evaluation_context else 0
            return EvaluationSchema(
                score=avg_score,
                feedback=feedbacks,
                overall_summary="The candidate displays strong fundamental knowledge. Communication is clear, but could benefit from explaining technical design patterns and metrics."
            )
        
