from datetime import datetime
from . import db

class ITProvisioning(db.Model):
    __tablename__ = "it_provisioning"

    id = db.Column(db.Integer, primary_key=True)
    onboarding_request_id = db.Column(db.Integer, db.ForeignKey("onboarding_requests.id"), nullable=False)
    workflow_run = db.Column(db.Integer, nullable=False)
    company_email = db.Column(db.String(150))
    username = db.Column(db.String(100))
    laptop_model = db.Column(db.String(100))
    configuration_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False)
    onboarding_request = db.relationship("OnboardingRequest", back_populates="it_provisioning_records")

    __table_args__ = (
        db.UniqueConstraint("onboarding_request_id", "workflow_run", name="uq_it_prov_request_run"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "onboarding_request_id": self.onboarding_request_id,
            "workflow_run": self.workflow_run,
            "company_email": self.company_email,
            "username": self.username,
            "laptop_model": self.laptop_model,
            "configuration_notes": self.configuration_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<ITProvisioning {self.id} for OnboardingRequest {self.onboarding_request_id}>'
    
    def save(self):
        db.session.add(self)
        db.session.commit()