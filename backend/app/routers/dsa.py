from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.agents.dsa_coach import DSACoachAgent
from app.agents.progress_tracker import ProgressTrackerAgent

router = APIRouter(prefix="/api/dsa", tags=["DSA Practice Coach"])
dsa_coach = DSACoachAgent()
progress_tracker = ProgressTrackerAgent()

@router.get("/plan", response_model=schemas.DSAPlanResponse)
def get_dsa_plan(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(models.DSAPlan).filter(models.DSAPlan.user_id == current_user.id).first()
    if not plan:
        # Generate new plan on the fly if not exists
        dsa_data = dsa_coach.generate_plan(current_user.target_role)
        plan = models.DSAPlan(
            user_id=current_user.id,
            topic_roadmap=dsa_data.get("topic_roadmap"),
            daily_schedule=dsa_data.get("daily_schedule"),
            practice_progress=dsa_data.get("practice_progress")
        )
        db.add(plan)
        db.commit()
        db.refresh(plan)
        
    return schemas.DSAPlanResponse(
        topic_roadmap=plan.topic_roadmap or [],
        daily_schedule=plan.daily_schedule or [],
        practice_progress=plan.practice_progress or {}
    )

@router.put("/toggle")
def toggle_dsa_question(
    payload: Dict[str, Any],
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    topic_name = payload.get("topic")
    question_title = payload.get("question_title")
    
    plan = db.query(models.DSAPlan).filter(models.DSAPlan.user_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="DSA plan not found.")
        
    roadmap = list(plan.topic_roadmap or [])
    progress = dict(plan.practice_progress or {"completed_questions": [], "completed_topics": []})
    
    question_found = False
    for topic_item in roadmap:
        if topic_item.get("topic") == topic_name:
            questions_list = list(topic_item.get("questions", []))
            for q in questions_list:
                if q.get("title") == question_title:
                    new_val = not q.get("completed", False)
                    q["completed"] = new_val
                    question_found = True
                    
                    # Update completed list
                    comp_q = progress.get("completed_questions", [])
                    if new_val:
                        if question_title not in comp_q:
                            comp_q.append(question_title)
                    else:
                        if question_title in comp_q:
                            comp_q.remove(question_title)
                    progress["completed_questions"] = comp_q
                    
                    break
            topic_item["questions"] = questions_list
            
            # Check if all questions in topic are completed
            all_comp = all(q.get("completed") for q in questions_list)
            comp_t = progress.get("completed_topics", [])
            if all_comp:
                if topic_name not in comp_t:
                    comp_t.append(topic_name)
            else:
                if topic_name in comp_t:
                    comp_t.remove(topic_name)
            progress["completed_topics"] = comp_t
            break
            
    if not question_found:
        raise HTTPException(status_code=404, detail="Question not found in the topic.")
        
    plan.topic_roadmap = roadmap
    plan.practice_progress = progress
    db.commit()
    
    # Re-calc global index
    progress_tracker.calculate_and_update_progress(db, current_user.id)
    return {"message": "Question state toggled.", "progress": progress}
