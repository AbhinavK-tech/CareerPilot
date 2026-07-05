from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    target_role = Column(String, default="AI Engineer")
    available_hours = Column(Integer, default=15)  # hours per week
    learning_speed = Column(String, default="Moderate")  # Fast, Moderate, Slow
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    skill_gaps = relationship("SkillGap", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")
    learning_resources = relationship("LearningResource", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")
    dsa_plans = relationship("DSAPlan", back_populates="user", cascade="all, delete-orphan")
    github_reviews = relationship("GitHubReview", back_populates="user", cascade="all, delete-orphan")
    progress_records = relationship("Progress", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String, nullable=False)
    ats_score = Column(Integer, default=0)
    text_content = Column(Text, nullable=True)
    strengths = Column(JSON, nullable=True)  # List of strings
    weaknesses = Column(JSON, nullable=True)  # List of strings
    sections_found = Column(JSON, nullable=True)  # Dict of section name: bool
    suggestions = Column(JSON, nullable=True)  # List of strings
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="resumes")


class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    current_skills = Column(JSON, nullable=True)  # List of strings
    missing_skills = Column(JSON, nullable=True)  # List of strings
    target_skills = Column(JSON, nullable=True)  # List of strings
    priorities = Column(JSON, nullable=True)  # Dict of skill: Priority (High/Med/Low)
    match_percentage = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="skill_gaps")


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    term_type = Column(String, nullable=False)  # 30-day, 90-day, 6-month, 1-year
    tasks = Column(JSON, nullable=True)  # List of dicts (title, description, status, week, resources)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="roadmaps")


class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill = Column(String, nullable=False)
    title = Column(String, nullable=False)
    url = Column(String, nullable=True)
    source = Column(String, nullable=True)  # YouTube, GitHub, Documentation, Kaggle
    difficulty = Column(String, default="Beginner")
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="learning_resources")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(String, default="Medium")
    duration = Column(String, nullable=True)  # e.g., 2 weeks
    skills_learned = Column(JSON, nullable=True)  # List of strings
    folder_structure = Column(Text, nullable=True)  # Text representation of folder tree
    portfolio_impact = Column(String, nullable=True)  # High / Medium / Low
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="projects")


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    questions = Column(JSON, nullable=True)  # List of questions
    answers = Column(JSON, nullable=True)  # List of answers / feedback
    score = Column(Integer, default=0)
    feedback = Column(JSON, nullable=True)  # Detailed feedback dict
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="interviews")


class DSAPlan(Base):
    __tablename__ = "dsa_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    topic_roadmap = Column(JSON, nullable=True)  # List of topics with difficulty and questions
    daily_schedule = Column(JSON, nullable=True)  # Checklist of what to do each day
    practice_progress = Column(JSON, nullable=True)  # Completed questions/topics
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="dsa_plans")


class GitHubReview(Base):
    __tablename__ = "github_reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    repo_name = Column(String, nullable=False)
    readme_score = Column(Integer, default=0)
    documentation_score = Column(Integer, default=0)
    structure_score = Column(Integer, default=0)
    commits_score = Column(Integer, default=0)
    complexity_score = Column(Integer, default=0)
    overall_score = Column(Integer, default=0)
    comments = Column(Text, nullable=True)
    folder_structure = Column(Text, nullable=True)
    improvements = Column(JSON, nullable=True)  # List of strings
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="github_reviews")


class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    completed_skills = Column(JSON, nullable=True)  # List of strings
    completed_projects = Column(Integer, default=0)
    average_interview_score = Column(Integer, default=0)
    dsa_completed = Column(Integer, default=0)  # Count of completed DSA challenges
    job_readiness_score = Column(Integer, default=0)  # Calculated score out of 100
    learning_streak = Column(Integer, default=1)
    weekly_progress = Column(JSON, nullable=True)  # List of completed tasks per week
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="progress_records")
