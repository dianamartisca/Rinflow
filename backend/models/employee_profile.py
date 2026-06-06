from datetime import datetime
from . import db
from utils.enums import HardwareTier

class EmployeeProfile(db.Model):
    __tablename__ = "employee_profiles"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    hardware_tier = db.Column(db.Enum(HardwareTier, native_enum=False, validate_strings=True), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False)
    creator = db.relationship("User", back_populates="created_employee_profiles")
    onboarding_requests = db.relationship("OnboardingRequest", back_populates="employee", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "role": self.role,
            "start_date": self.start_date.isoformat(),
            "hardware_tier": self.hardware_tier.value if self.hardware_tier else None,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<EmployeeProfile {self.first_name} {self.last_name}>'
    
    def save(self):
        db.session.add(self)
        db.session.commit()