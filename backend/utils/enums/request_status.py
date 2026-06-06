from enum import Enum


class RequestStatus(str, Enum):
    PENDING = "PENDING"
    NEEDS_REWORK = "NEEDS_REWORK"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"