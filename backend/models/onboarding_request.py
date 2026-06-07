from datetime import datetime
from . import db
from utils.enums import RequestStage, RequestStatus

class OnboardingRequest(db.Model):
    __tablename__ = "onboarding_requests"

    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey("employee_profiles.id"), nullable=False)
    current_stage = db.Column(db.Enum(RequestStage, native_enum=False, validate_strings=True), nullable=False, default=RequestStage.MANAGER_REVIEW)
    status = db.Column(db.Enum(RequestStatus, native_enum=False, validate_strings=True), nullable=False, default=RequestStatus.PENDING)
    manager_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    finance_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    it_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    workflow_run = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False)
    employee = db.relationship("EmployeeProfile", back_populates="onboarding_requests")
    manager = db.relationship("User", foreign_keys=[manager_id], back_populates="managed_onboarding_requests")
    finance = db.relationship("User", foreign_keys=[finance_id], back_populates="financed_onboarding_requests")
    it = db.relationship("User", foreign_keys=[it_id], back_populates="it_onboarding_requests")
    approval_history = db.relationship("ApprovalHistory", back_populates="onboarding_request", cascade="all, delete-orphan", lazy=True)
    job_descriptions = db.relationship("JobDescription", back_populates="onboarding_request", cascade="all, delete-orphan", lazy=True)
    it_provisioning_records = db.relationship("ITProvisioning", back_populates="onboarding_request", cascade="all, delete-orphan", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "employee_id": self.employee_id,
            "current_stage": self.current_stage.value if self.current_stage else None,
            "status": self.status.value if self.status else None,
            "manager_id": self.manager_id,
            "manager_email": self.manager.email if self.manager else None,
            "finance_id": self.finance_id,
            "finance_email": self.finance.email if self.finance else None,
            "it_id": self.it_id,
            "it_email": self.it.email if self.it else None,
            "workflow_run": self.workflow_run,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<OnboardingRequest {self.id} for EmployeeProfile {self.employee_id}>'
    
    def save(self):
        db.session.add(self)
        db.session.commit()
