import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.models.database import get_db, Decision
from app.schemas.schemas import DecisionResponse

router = APIRouter(prefix="/api", tags=["decisions"])

@router.get("/decisions", response_model=List[DecisionResponse])
def get_decisions(db: Session = Depends(get_db)):
    decisions = db.query(Decision).order_by(Decision.created_at.desc()).all()
    resp = []
    for d in decisions:
        before_m = json.loads(d.before_metrics) if isinstance(d.before_metrics, str) else d.before_metrics
        after_m = json.loads(d.after_metrics) if isinstance(d.after_metrics, str) else d.after_metrics
        resp.append(DecisionResponse(
            id=d.id,
            event_type=d.event_type,
            trigger=d.trigger,
            reason=d.reason,
            action=d.action,
            before_metrics=before_m,
            after_metrics=after_m,
            status=d.status,
            created_at=d.created_at
        ))
    return resp

@router.get("/decisions/{decision_id}", response_model=DecisionResponse)
def get_decision_detail(decision_id: int, db: Session = Depends(get_db)):
    d = db.query(Decision).filter(Decision.id == decision_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Decision record not found")
    before_m = json.loads(d.before_metrics) if isinstance(d.before_metrics, str) else d.before_metrics
    after_m = json.loads(d.after_metrics) if isinstance(d.after_metrics, str) else d.after_metrics
    return DecisionResponse(
        id=d.id,
        event_type=d.event_type,
        trigger=d.trigger,
        reason=d.reason,
        action=d.action,
        before_metrics=before_m,
        after_metrics=after_m,
        status=d.status,
        created_at=d.created_at
    )
