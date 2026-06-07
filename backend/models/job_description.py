from datetime import datetime
from . import db

class JobDescription(db.Model):
    __tablename__ = "job_descriptions"

    id = db.Column(db.Integer, primary_key=True)
    onboarding_request_id = db.Column(db.Integer, db.ForeignKey("onboarding_requests.id"), nullable=False)
    workflow_run = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False)
    onboarding_request = db.relationship("OnboardingRequest", back_populates="job_descriptions")

    __table_args__ = (
        db.UniqueConstraint("onboarding_request_id", "workflow_run", name="uq_job_desc_request_run"),
    )

    def to_dict(self):
        employee = self.onboarding_request.employee if self.onboarding_request else None
        employee_name = f"{employee.first_name} {employee.last_name}" if employee else None

        return {
            "id": self.id,
            "onboarding_request_id": self.onboarding_request_id,
            "workflow_run": self.workflow_run,
            "content": self.content,
            "download_url": self.content,
            "employee_name": employee_name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<JobDescription {self.id} for OnboardingRequest {self.onboarding_request_id}>'
    
    def save(self):
        db.session.add(self)
        db.session.commit()
