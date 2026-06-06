from datetime import datetime
from . import db
from utils.enums import ApprovalAction, ApprovalStage

class ApprovalHistory(db.Model):
    __tablename__ = "approval_history"

    id = db.Column(db.Integer, primary_key=True)
    onboarding_request_id = db.Column(db.Integer, db.ForeignKey("onboarding_requests.id"), nullable=False)
    workflow_run = db.Column(db.Integer, nullable=False)
    reviewer_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    stage = db.Column(db.Enum(ApprovalStage, native_enum=False, validate_strings=True), nullable=False)
    action = db.Column(db.Enum(ApprovalAction, native_enum=False, validate_strings=True), nullable=False)
    comments = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False)
    reviewer = db.relationship("User", back_populates="approvals_made")
    onboarding_request = db.relationship("OnboardingRequest", back_populates="approval_history")

    def to_dict(self):
        return {
            "id": self.id,
            "onboarding_request_id": self.onboarding_request_id,
            "workflow_run": self.workflow_run,
            "reviewer_id": self.reviewer_id,
            "stage": self.stage.value if self.stage else None,
            "action": self.action.value if self.action else None,
            "comments": self.comments,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }   
    
    def __repr__(self):
        return f'<ApprovalHistory {self.id} for OnboardingRequest {self.onboarding_request_id} by Reviewer {self.reviewer_id}>'
    
    def save(self):
        db.session.add(self)
        db.session.commit()