from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.agents.interview_coach import InterviewCoachAgent
from app.agents.progress_tracker import ProgressTrackerAgent

router = APIRouter(prefix="/api/interview", tags=["Mock Interview Coach"])
interview_coach = InterviewCoachAgent()
progress_tracker = ProgressTrackerAgent()

@router.post("/start", response_model=schemas.InterviewSessionStartResponse)
def start_interview(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    questions_list = interview_coach.generate_questions(current_user.target_role)
    
    # Store temporary session
    db_session = models.InterviewSession(
        user_id=current_user.id,
        questions=questions_list,
        answers=[],
        score=0,
        feedback={},
        is_completed=False
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    # Map questions to schema format
    mapped_qs = [
        schemas.InterviewQuestion(
            id=q.get("id"),
            question=q.get("question"),
            type=q.get("type"),
            company=q.get("company")
        ) for q in questions_list
    ]
    
    return schemas.InterviewSessionStartResponse(
        session_id=db_session.id,
        questions=mapped_qs
    )

@router.post("/submit", response_model=schemas.InterviewEvaluationResponse)
def submit_interview(
    payload: Dict[str, Any],
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session_id = payload.get("session_id")
    answers_dict = payload.get("answers") # dict mapping question id to user response text
    
    db_session = db.query(models.InterviewSession).filter(
        models.InterviewSession.id == session_id,
        models.InterviewSession.user_id == current_user.id
    ).first()
    
    if not db_session:
        raise HTTPException(status_code=404, detail="Interview session not found.")
        
    if db_session.is_completed:
        raise HTTPException(status_code=400, detail="This interview session is already evaluated.")
        
    try:
        # Run evaluator agent
        evaluation = interview_coach.evaluate_answers(
            target_role=current_user.target_role,
            session_questions=db_session.questions,
            user_answers=answers_dict
        )
        
        # Save evaluation to db
        db_session.score = evaluation.score
        db_session.is_completed = True
        db_session.feedback = {"overall_summary": evaluation.overall_summary}
        
        # Format saved answers list
        saved_answers = []
        for feedback_item in evaluation.feedback:
            saved_answers.append({
                "question_id": feedback_item.question_id,
                "question": feedback_item.question,
                "user_answer": feedback_item.user_answer,
                "score": feedback_item.score,
                "feedback": feedback_item.feedback,
                "exemplar": feedback_item.exemplar
            })
        db_session.answers = saved_answers
        db.commit()
        
        # Recalc global index
        progress_tracker.calculate_and_update_progress(db, current_user.id)
        
        return schemas.InterviewEvaluationResponse(
            session_id=db_session.id,
            score=evaluation.score,
            feedback=evaluation.feedback,
            overall_summary=evaluation.overall_summary
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during response evaluation: {str(e)}"
        )

@router.get("/history", response_model=List[schemas.InterviewEvaluationResponse])
def get_interview_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(models.InterviewSession).filter(
        models.InterviewSession.user_id == current_user.id,
        models.InterviewSession.is_completed == True
    ).order_by(models.InterviewSession.created_at.desc()).all()
    
    results = []
    for s in sessions:
        feedback_list = []
        for item in s.answers or []:
            feedback_list.append(schemas.AnswerFeedback(
                question_id=item.get("question_id"),
                question=item.get("question"),
                user_answer=item.get("user_answer"),
                score=item.get("score", 0),
                feedback=item.get("feedback"),
                exemplar=item.get("exemplar", "")
            ))
        results.append(schemas.InterviewEvaluationResponse(
            session_id=s.id,
            score=s.score,
            feedback=feedback_list,
            overall_summary=s.feedback.get("overall_summary", "") if s.feedback else ""
        ))
    return results
export_router = router
