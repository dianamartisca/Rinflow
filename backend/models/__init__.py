from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User
from .employee_profile import EmployeeProfile
from .onboarding_request import OnboardingRequest
from .job_description import JobDescription
from .it_provisioning import ITProvisioning
from .approval_history import ApprovalHistory
from utils.enums import (
    UserRole,
    HardwareTier,
    RequestStage,
    RequestStatus,
    ApprovalStage,
    ApprovalAction,
)
