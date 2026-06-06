from datetime import datetime
from . import db
from utils.enums import UserRole

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.Enum(UserRole, native_enum=False, validate_strings=True), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    first_name = db.Column(db.String(120))
    last_name = db.Column(db.String(120))
    profile_picture = db.Column(db.String(500))
    is_deleted = db.Column(db.Boolean, default=False)
    created_employee_profiles = db.relationship("EmployeeProfile", foreign_keys="EmployeeProfile.created_by", back_populates="creator", lazy=True)
    managed_onboarding_requests = db.relationship("OnboardingRequest", foreign_keys="OnboardingRequest.manager_id", back_populates="manager", lazy=True)
    financed_onboarding_requests = db.relationship("OnboardingRequest", foreign_keys="OnboardingRequest.finance_id", back_populates="finance", lazy=True)
    it_onboarding_requests = db.relationship("OnboardingRequest", foreign_keys="OnboardingRequest.it_id", back_populates="it", lazy=True)
    approvals_made = db.relationship("ApprovalHistory", foreign_keys="ApprovalHistory.reviewer_id", back_populates="reviewer", lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role.value if self.role else None,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'profile_picture': self.profile_picture,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def save(self):
        db.session.add(self)
        db.session.commit()
    