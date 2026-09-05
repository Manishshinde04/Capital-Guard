from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.database import get_db, Alert
from app.schemas.schemas import AlertResponse

router = APIRouter(prefix="/api", tags=["alerts"])

@router.get("/alerts", response_model=List[AlertResponse])
def get_alerts(
    status: Optional[str] = Query(None, description="Filter by status: ACTIVE, RESOLVED"),
    severity: Optional[str] = Query(None, description="Filter by severity: CRITICAL, WARNING, INFO"),
    db: Session = Depends(get_db)
):
    query = db.query(Alert).order_by(Alert.created_at.desc())
    if status:
        query = query.filter(Alert.status == status.upper())
    if severity:
        query = query.filter(Alert.severity == severity.upper())
    return query.all()

@router.patch("/alerts/{alert_id}", response_model=AlertResponse)
def update_alert_status(
    alert_id: int,
    status: str = Query("RESOLVED", description="New status"),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = status.upper()
    db.commit()
    db.refresh(alert)
    return alert
