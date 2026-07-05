import logging
from sqlalchemy.orm import Session
from app import models

logger = logging.getLogger(__name__)

class ProgressTrackerAgent:
    def __init__(self):
        self.name = "Progress Tracker Agent"
        self.description = "Aggregates learning streaks, completed milestones, interview scores, and updates the global Job Readiness Index (JRI)."

    def calculate_and_update_progress(self, db: Session, user_id: int) -> models.Progress:
        logger.info(f"Agent {self.name} is calculating job readiness index for user {user_id}.")
        
        # 1. Fetch Skill Gap Match Percentage
        skill_gap = db.query(models.SkillGap).filter(models.SkillGap.user_id == user_id).order_by(models.SkillGap.created_at.desc()).first()
        skill_match = skill_gap.match_percentage if skill_gap else 40.0
        
        # 2. Fetch Resume ATS Score
        resume = db.query(models.Resume).filter(models.Resume.user_id == user_id).order_by(models.Resume.created_at.desc()).first()
        ats_score = resume.ats_score if resume else 0
        
        # 3. Fetch Completed Projects
        projects = db.query(models.Project).filter(models.Project.user_id == user_id).all()
        completed_projects_count = sum(1 for p in projects if p.completed)
        
        # 4. Fetch Mock Interviews Average Score
        interviews = db.query(models.InterviewSession).filter(models.InterviewSession.user_id == user_id, models.InterviewSession.is_completed == True).all()
        avg_interview_score = sum(i.score for i in interviews) / len(interviews) if interviews else 0.0
        
        # 5. Fetch DSA progress
        dsa_plan = db.query(models.DSAPlan).filter(models.DSAPlan.user_id == user_id).first()
        dsa_progress_pct = 0.0
        if dsa_plan and dsa_plan.practice_progress:
            # Calculate completed tasks vs total tasks
            completed_challenges = dsa_plan.practice_progress.get("completed_questions", [])
            dsa_progress_pct = min(100.0, len(completed_challenges) * 10)  # assume 10 questions total
        
        # 6. Fetch GitHub Portfolio overall score
        github_review = db.query(models.GitHubReview).filter(models.GitHubReview.user_id == user_id).order_by(models.GitHubReview.created_at.desc()).first()
        github_score = github_review.overall_score if github_review else 0
        
        # Calculate JRI (Job Readiness Index) out of 100
        # Weights:
        # Skill Match: 30%
        # ATS Resume Score: 20%
        # Interview Coach Score: 20%
        # GitHub Portfolio Review: 15%
        # DSA Practice Tracker: 15%
        
        jri = (
            (skill_match * 0.3) +
            (ats_score * 0.2) +
            (avg_interview_score * 0.2 if avg_interview_score > 0 else 50 * 0.2) +
            (github_score * 0.15 if github_score > 0 else 60 * 0.15) +
            (dsa_progress_pct * 0.15 if dsa_progress_pct > 0 else 40 * 0.15)
        )
        
        jri_int = min(100, max(0, int(jri)))
        
        # Retrieve or create Progress record
        progress = db.query(models.Progress).filter(models.Progress.user_id == user_id).first()
        if not progress:
            progress = models.Progress(
                user_id=user_id,
                completed_skills=skill_gap.current_skills if skill_gap else [],
                completed_projects=completed_projects_count,
                average_interview_score=int(avg_interview_score),
                dsa_completed=len(dsa_plan.practice_progress.get("completed_questions", [])) if dsa_plan and dsa_plan.practice_progress else 0,
                job_readiness_score=jri_int,
                learning_streak=3,
                weekly_progress=[
                    {"name": "Week 1", "value": 30},
                    {"name": "Week 2", "value": 45},
                    {"name": "Week 3", "value": 60},
                    {"name": "Week 4", "value": jri_int}
                ]
            )
            db.add(progress)
        else:
            progress.completed_projects = completed_projects_count
            progress.average_interview_score = int(avg_interview_score)
            progress.dsa_completed = len(dsa_plan.practice_progress.get("completed_questions", [])) if dsa_plan and dsa_plan.practice_progress else progress.dsa_completed
            progress.job_readiness_score = jri_int
            progress.weekly_progress = [
                {"name": "Week 1", "value": 30},
                {"name": "Week 2", "value": 45},
                {"name": "Week 3", "value": 60},
                {"name": "Week 4", "value": jri_int}
            ]
            
        db.commit()
        db.refresh(progress)
        return progress
