import logging
from sqlalchemy.orm import Session
from app import models
from app.agents.resume_analyzer import ResumeAnalyzerAgent
from app.agents.skill_gap import SkillGapAgent
from app.agents.career_planner import CareerPlannerAgent
from app.agents.learning_resource import LearningResourceAgent
from app.agents.project_recommender import ProjectRecommenderAgent
from app.agents.dsa_coach import DSACoachAgent
from app.agents.job_matching import JobMatchingAgent
from app.agents.progress_tracker import ProgressTrackerAgent

logger = logging.getLogger(__name__)

class OrchestratorAgent:
    def __init__(self):
        self.name = "Orchestrator Agent"
        self.description = "Manages data routing and schedules individual sub-agents to build a cohesive learning pathway."
        
        # Instantiate sub-agents
        self.resume_analyzer = ResumeAnalyzerAgent()
        self.skill_gap_agent = SkillGapAgent()
        self.career_planner = CareerPlannerAgent()
        self.learning_resource_agent = LearningResourceAgent()
        self.project_recommender = ProjectRecommenderAgent()
        self.dsa_coach = DSACoachAgent()
        self.job_matching_agent = JobMatchingAgent()
        self.progress_tracker = ProgressTrackerAgent()

    def run_onboarding_pipeline(self, db: Session, user: models.User, file_name: str, resume_text: str) -> dict:
        logger.info(f"{self.name} is coordinating onboarding pipeline for user {user.id}.")
        
        # Step 1: Resume Analysis
        resume_analysis = self.resume_analyzer.analyze(file_name, resume_text, user.target_role)
        db_resume = models.Resume(
            user_id=user.id,
            file_name=file_name,
            ats_score=resume_analysis.ats_score,
            text_content=resume_text,
            strengths=resume_analysis.strengths,
            weaknesses=resume_analysis.weaknesses,
            sections_found=resume_analysis.sections_found,
            suggestions=resume_analysis.suggestions
        )
        db.add(db_resume)
        db.flush() # get database generated ids

        # Step 2: Skill Gap Analysis
        skill_gap = self.skill_gap_agent.analyze_gaps(resume_text, user.target_role)
        db_skill_gap = models.SkillGap(
            user_id=user.id,
            current_skills=skill_gap.current_skills,
            missing_skills=skill_gap.missing_skills,
            target_skills=skill_gap.target_skills,
            priorities=skill_gap.priorities,
            match_percentage=skill_gap.match_percentage
        )
        db.add(db_skill_gap)
        db.flush()

        # Step 3: Career Roadmaps (Generate 30-day and 90-day roadmaps)
        # To avoid API timeouts, we generate two key roadmaps now
        roadmap_30 = self.career_planner.generate_roadmap(
            target_role=user.target_role,
            missing_skills=skill_gap.missing_skills,
            available_hours=user.available_hours,
            learning_speed=user.learning_speed,
            term_type="30-day"
        )
        db_roadmap_30 = models.Roadmap(
            user_id=user.id,
            term_type="30-day",
            tasks=[t.model_dump() for t in roadmap_30.tasks]
        )
        db.add(db_roadmap_30)

        roadmap_90 = self.career_planner.generate_roadmap(
            target_role=user.target_role,
            missing_skills=skill_gap.missing_skills,
            available_hours=user.available_hours,
            learning_speed=user.learning_speed,
            term_type="90-day"
        )
        db_roadmap_90 = models.Roadmap(
            user_id=user.id,
            term_type="90-day",
            tasks=[t.model_dump() for t in roadmap_90.tasks]
        )
        db.add(db_roadmap_90)

        # Step 4: Learning Resources for missing skills
        resources = self.learning_resource_agent.recommend_resources(skill_gap.missing_skills)
        for r in resources:
            db_resource = models.LearningResource(
                user_id=user.id,
                skill=r.get("skill"),
                title=r.get("title"),
                url=r.get("url"),
                source=r.get("source"),
                difficulty=r.get("difficulty"),
                completed=False
            )
            db.add(db_resource)

        # Step 5: Project Recommendations
        projects = self.project_recommender.recommend(user.target_role, skill_gap.missing_skills, user.learning_speed)
        for p in projects:
            db_project = models.Project(
                user_id=user.id,
                title=p.get("title"),
                description=p.get("description"),
                difficulty=p.get("difficulty"),
                duration=p.get("duration"),
                skills_learned=p.get("skills_learned"),
                folder_structure=p.get("folder_structure"),
                portfolio_impact=p.get("portfolio_impact"),
                completed=False
            )
            db.add(db_project)

        # Step 6: DSA Coach Initial Seeding
        dsa_data = self.dsa_coach.generate_plan(user.target_role)
        db_dsa = models.DSAPlan(
            user_id=user.id,
            topic_roadmap=dsa_data.get("topic_roadmap"),
            daily_schedule=dsa_data.get("daily_schedule"),
            practice_progress=dsa_data.get("practice_progress")
        )
        db.add(db_dsa)
        db.flush()

        # Step 7: Commit transaction
        db.commit()

        # Step 8: Progress Tracker calculation (Update Job Readiness Index)
        self.progress_tracker.calculate_and_update_progress(db, user.id)

        logger.info(f"Onboarding pipeline completed for user {user.id}.")
        return {
            "resume_analysis": resume_analysis,
            "skill_gap": skill_gap,
            "roadmap_30": roadmap_30,
            "projects_count": len(projects),
            "resources_count": len(resources)
        }
