from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# Auth Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    target_role: str = "AI Engineer"
    available_hours: int = 15
    learning_speed: str = "Moderate"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    target_role: Optional[str] = None
    available_hours: Optional[int] = None
    learning_speed: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Resume Analyzer Schemas
class ResumeAnalyzeResponse(BaseModel):
    file_name: str
    ats_score: int
    strengths: List[str]
    weaknesses: List[str]
    sections_found: Dict[str, bool]
    suggestions: List[str]

# Skill Gap Schemas
class SkillGapResponse(BaseModel):
    current_skills: List[str]
    missing_skills: List[str]
    target_skills: List[str]
    priorities: Dict[str, str]
    match_percentage: float

# Career Roadmap Schemas
class TaskItem(BaseModel):
    title: str
    description: str
    status: str = "pending"  # pending, in_progress, completed
    week: int
    resources: Optional[List[str]] = []

class RoadmapResponse(BaseModel):
    term_type: str
    tasks: List[TaskItem]

# Learning Resource Schemas
class LearningResourceResponse(BaseModel):
    id: int
    skill: str
    title: str
    url: str
    source: str
    difficulty: str
    completed: bool

# Project Schemas
class ProjectResponse(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    duration: str
    skills_learned: List[str]
    folder_structure: str
    portfolio_impact: str
    completed: bool

# Interview Coach Schemas
class InterviewQuestion(BaseModel):
    id: int
    question: str
    type: str  # technical, behavioral, coding, company
    company: Optional[str] = None

class InterviewSessionStartResponse(BaseModel):
    session_id: int
    questions: List[InterviewQuestion]

class AnswerSubmission(BaseModel):
    question_id: int
    answer: str

class AnswerFeedback(BaseModel):
    question_id: int
    question: str
    user_answer: str
    score: int
    feedback: str
    exemplar: str

class InterviewEvaluationResponse(BaseModel):
    session_id: int
    score: int
    feedback: List[AnswerFeedback]
    overall_summary: str

# DSA Coach Schemas
class DSAPracticeItem(BaseModel):
    title: str
    difficulty: str
    completed: bool
    solved_date: Optional[str] = None

class DSATopic(BaseModel):
    topic: str
    questions: List[DSAPracticeItem]

class DSAPlanResponse(BaseModel):
    topic_roadmap: List[DSATopic]
    daily_schedule: List[Dict[str, Any]]
    practice_progress: Dict[str, Any]

# GitHub Review Schemas
class GitHubReviewRequest(BaseModel):
    repo_url: str

class GitHubReviewResponse(BaseModel):
    repo_name: str
    readme_score: int
    documentation_score: int
    structure_score: int
    commits_score: int
    complexity_score: int
    overall_score: int
    comments: str
    folder_structure: str
    improvements: List[str]

# Dashboard Dashboard Data Schema
class DashboardResponse(BaseModel):
    career_readiness_score: int
    ats_score: int
    interview_score: int
    skill_match: int
    projects_completed: int
    roadmap_completion: int
    github_score: int
    dsa_progress: int
    weekly_progress: List[Dict[str, Any]]
    learning_streak: int
    target_role: str
    available_hours: int
    learning_speed: str
