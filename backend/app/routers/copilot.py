import io
import logging
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pypdf import PdfReader
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.agents.orchestrator import OrchestratorAgent
from app.agents.github_reviewer import GitHubReviewerAgent
from app.agents.progress_tracker import ProgressTrackerAgent
from app.agents.demo_seeder import seed_demo_data

router = APIRouter(prefix="/api/copilot", tags=["Career Copilot Engine"])
logger = logging.getLogger(__name__)
orchestrator = OrchestratorAgent()
github_reviewer = GitHubReviewerAgent()
progress_tracker = ProgressTrackerAgent()

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"Failed to extract text from PDF: {e}")
        return ""

@router.post("/upload-resume")
def upload_resume(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF resume files are supported."
        )
        
    try:
        file_bytes = file.file.read()
        # Enforce file size limit (5MB)
        if len(file_bytes) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Resume file exceeds maximum size limit of 5MB."
            )
            
        resume_text = extract_text_from_pdf(file_bytes)
        if not resume_text:
            # If PDF is scanned/image-only or parsing fails, use standard text
            resume_text = f"Candidate Profile: {current_user.full_name or 'Developer'}. Focuses on backend Python, javascript, API development."
            logger.info("PDF contained no extractable text. Initializing with default text profile.")
            
        # Run orchestrator
        results = orchestrator.run_onboarding_pipeline(
            db=db,
            user=current_user,
            file_name=file.filename,
            resume_text=resume_text
        )
        return {"message": "Resume uploaded and pipeline completed successfully.", "results": results}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error handling upload-resume: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during resume processing: {str(e)}"
        )

@router.post("/seed-demo")
def trigger_demo_seeder(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        seed_demo_data(db, current_user)
        return {"message": "Demo data successfully seeded. Enjoy checking the dashboard!"}
    except Exception as e:
        logger.error(f"Failed to seed demo data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to seed demo database: {str(e)}"
        )

@router.get("/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard_data(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch progress record
    progress = db.query(models.Progress).filter(models.Progress.user_id == current_user.id).first()
    
    # If no progress found, user needs to upload a resume or seed data
    if not progress:
        return schemas.DashboardResponse(
            career_readiness_score=0,
            ats_score=0,
            interview_score=0,
            skill_match=0,
            projects_completed=0,
            roadmap_completion=0,
            github_score=0,
            dsa_progress=0,
            weekly_progress=[],
            learning_streak=0,
            target_role=current_user.target_role,
            available_hours=current_user.available_hours,
            learning_speed=current_user.learning_speed
        )
        
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.created_at.desc()).first()
    skill_gap = db.query(models.SkillGap).filter(models.SkillGap.user_id == current_user.id).order_by(models.SkillGap.created_at.desc()).first()
    
    # Calculate Roadmap Completion
    roadmaps = db.query(models.Roadmap).filter(models.Roadmap.user_id == current_user.id).all()
    total_tasks = 0
    completed_tasks = 0
    for r in roadmaps:
        if r.tasks:
            total_tasks += len(r.tasks)
            completed_tasks += sum(1 for t in r.tasks if t.get("status") == "completed")
            
    roadmap_completion_pct = int((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 0
    
    # Calculate DSA Completed count percentage (assume 10 total)
    dsa_plan = db.query(models.DSAPlan).filter(models.DSAPlan.user_id == current_user.id).first()
    dsa_completed_count = 0
    if dsa_plan and dsa_plan.practice_progress:
        dsa_completed_count = len(dsa_plan.practice_progress.get("completed_questions", []))
    dsa_progress_pct = min(100, dsa_completed_count * 10)
    
    github_review = db.query(models.GitHubReview).filter(models.GitHubReview.user_id == current_user.id).order_by(models.GitHubReview.created_at.desc()).first()
    github_score = github_review.overall_score if github_review else 0
    
    return schemas.DashboardResponse(
        career_readiness_score=progress.job_readiness_score,
        ats_score=resume.ats_score if resume else 0,
        interview_score=progress.average_interview_score,
        skill_match=int(skill_gap.match_percentage) if skill_gap else 0,
        projects_completed=progress.completed_projects,
        roadmap_completion=roadmap_completion_pct,
        github_score=github_score,
        dsa_progress=dsa_progress_pct,
        weekly_progress=progress.weekly_progress or [],
        learning_streak=progress.learning_streak,
        target_role=current_user.target_role,
        available_hours=current_user.available_hours,
        learning_speed=current_user.learning_speed
    )

@router.get("/roadmap", response_model=List[schemas.RoadmapResponse])
def get_user_roadmaps(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    roadmaps = db.query(models.Roadmap).filter(models.Roadmap.user_id == current_user.id).all()
    # If empty, create standard empty roadmaps response
    return [schemas.RoadmapResponse(term_type=r.term_type, tasks=r.tasks or []) for r in roadmaps]

@router.put("/roadmap/task")
def toggle_roadmap_task(
    payload: Dict[str, Any],
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    term_type = payload.get("term_type")
    task_title = payload.get("task_title")
    new_status = payload.get("status") # pending, in_progress, completed
    
    roadmap = db.query(models.Roadmap).filter(
        models.Roadmap.user_id == current_user.id,
        models.Roadmap.term_type == term_type
    ).first()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found.")
        
    updated = False
    tasks = list(roadmap.tasks or [])
    for task in tasks:
        if task.get("title") == task_title:
            task["status"] = new_status
            updated = True
            break
            
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found in this roadmap.")
        
    roadmap.tasks = tasks
    db.commit()
    
    # Recalculate global readiness index
    progress_tracker.calculate_and_update_progress(db, current_user.id)
    return {"message": "Task status updated successfully."}

@router.get("/resources", response_model=List[schemas.LearningResourceResponse])
def get_resources(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.LearningResource).filter(models.LearningResource.user_id == current_user.id).all()

@router.put("/resources/{resource_id}/toggle")
def toggle_resource(
    resource_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    res = db.query(models.LearningResource).filter(
        models.LearningResource.id == resource_id,
        models.LearningResource.user_id == current_user.id
    ).first()
    
    if not res:
        raise HTTPException(status_code=404, detail="Resource not found.")
        
    res.completed = not res.completed
    db.commit()
    
    progress_tracker.calculate_and_update_progress(db, current_user.id)
    return {"message": "Resource state toggled.", "completed": res.completed}

@router.get("/projects", response_model=List[schemas.ProjectResponse])
def get_projects(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Project).filter(models.Project.user_id == current_user.id).all()

@router.put("/projects/{project_id}/toggle")
def toggle_project(
    project_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    proj = db.query(models.Project).filter(
        models.Project.id == project_id,
        models.Project.user_id == current_user.id
    ).first()
    
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found.")
        
    proj.completed = not proj.completed
    db.commit()
    
    progress_tracker.calculate_and_update_progress(db, current_user.id)
    return {"message": "Project status toggled.", "completed": proj.completed}

@router.post("/github-review", response_model=schemas.GitHubReviewResponse)
def perform_github_review(
    req: schemas.GitHubReviewRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Run GitHub reviewer agent
        review = github_reviewer.review_repository(req.repo_url)
        
        # Save to database
        db_review = models.GitHubReview(
            user_id=current_user.id,
            repo_name=review.repo_name,
            readme_score=review.readme_score,
            documentation_score=review.documentation_score,
            structure_score=review.structure_score,
            commits_score=review.commits_score,
            complexity_score=review.complexity_score,
            overall_score=review.overall_score,
            comments=review.comments,
            folder_structure=review.folder_structure,
            improvements=review.improvements
        )
        db.add(db_review)
        db.commit()
        db.refresh(db_review)
        
        # Re-calc JRI
        progress_tracker.calculate_and_update_progress(db, current_user.id)
        
        return review
    except Exception as e:
        logger.error(f"GitHub review agent invocation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"GitHub portfolio analysis failed: {str(e)}"
        )

@router.get("/download-report")
def download_career_report(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch User data
    resume = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).order_by(models.Resume.created_at.desc()).first()
    skill_gap = db.query(models.SkillGap).filter(models.SkillGap.user_id == current_user.id).order_by(models.SkillGap.created_at.desc()).first()
    roadmaps = db.query(models.Roadmap).filter(models.Roadmap.user_id == current_user.id).all()
    progress = db.query(models.Progress).filter(models.Progress.user_id == current_user.id).first()
    
    if not resume or not skill_gap or not progress:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No career data found. Please complete the resume upload process first."
        )

    # Compile report text
    report = f"""==================================================
CAREERPILOT AI – MULTI-AGENT CAREER REPORT
==================================================
Report Generated For: {current_user.full_name or current_user.email}
Target Role: {current_user.target_role}
Created On: {progress.created_at.strftime('%Y-%m-%d')}
Job Readiness Index (JRI): {progress.job_readiness_score}%
==================================================

1. RESUME & ATS ASSESSMENT
--------------------------------------------------
ATS Score: {resume.ats_score}/100

Strengths:
{chr(10).join(['  - ' + s for s in resume.strengths or []])}

Areas of Improvement:
{chr(10).join(['  - ' + w for w in resume.weaknesses or []])}

Actionable Suggestions:
{chr(10).join(['  - ' + sug for sug in resume.suggestions or []])}

2. SKILL GAP ANALYSIS
--------------------------------------------------
Skill Match Rate: {skill_gap.match_percentage}%

Current Skillset: {', '.join(skill_gap.current_skills or [])}
Missing Skillsets: {', '.join(skill_gap.missing_skills or [])}

Prioritized Development Gap Checklist:
{chr(10).join([f"  [ ] {skill} (Priority: {prio})" for skill, prio in (skill_gap.priorities or {}).items()])}

3. ACTIVE PATHWAY TIMELINE
--------------------------------------------------
"""
    for rm in roadmaps:
        report += f"\nTerm Roadmap: {rm.term_type}\n"
        for task in rm.tasks or []:
            status_box = "[x]" if task.get("status") == "completed" else "[/]" if task.get("status") == "in_progress" else "[ ]"
            report += f"  {status_box} Week {task.get('week')}: {task.get('title')}\n"
            report += f"       Details: {task.get('description')}\n"
            
    report += """
==================================================
Your AI Mentor is rooting for you! Review and check
off completed projects and practice questions in 
the CareerPilot AI dashboard to boost your score.
==================================================
"""
    
    file_stream = io.StringIO(report)
    response = StreamingResponse(iter([file_stream.getvalue()]), media_type="text/plain")
    response.headers["Content-Disposition"] = "attachment; filename=careerpilot_report.txt"
    return response
