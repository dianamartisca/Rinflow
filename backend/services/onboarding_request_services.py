from models import EmployeeProfile, OnboardingRequest, db
from utils.enums import HardwareTier, RequestStage, RequestStatus
from utils.enum_utils import parse_enum


def create_onboarding_request(data):
    employee_id = data.get("employee_id")
    manager_id = data.get("manager_id")
    it_id = data.get("it_id")
    finance_id = data.get("finance_id")

    if not employee_id:
        raise ValueError("employee_id is required")
    if not manager_id:
        raise ValueError("manager_id is required")
    if not it_id:
        raise ValueError("it_id is required")

    employee = db.session.get(EmployeeProfile, employee_id)
    if not employee or employee.is_deleted:
        raise ValueError("EmployeeProfile not found")

    if employee.hardware_tier == HardwareTier.PREMIUM and not finance_id:
        raise ValueError("finance_id is required for PREMIUM hardware tier")

    item = OnboardingRequest(
        employee_id=employee_id,
        current_stage=RequestStage.MANAGER_REVIEW,
        status=RequestStatus.PENDING,
        manager_id=manager_id,
        finance_id=finance_id,
        it_id=it_id,
        workflow_run=1,
    )
    db.session.add(item)
    db.session.commit()
    return item.to_dict()


def get_all_onboarding_requests():
    items = OnboardingRequest.query.filter_by(is_deleted=False).all()
    return [item.to_dict() for item in items]


def get_onboarding_request(request_id):
    item = db.session.get(OnboardingRequest, request_id)
    if not item or item.is_deleted:
        raise ValueError("OnboardingRequest not found")
    return item.to_dict()


def resubmit_onboarding_request(request_id):
    item = db.session.get(OnboardingRequest, request_id)
    if not item or item.is_deleted:
        raise ValueError("OnboardingRequest not found")

    if item.status != RequestStatus.NEEDS_REWORK:
        raise ValueError("Only NEEDS_REWORK requests can be resubmitted")

    item.workflow_run += 1
    item.status = RequestStatus.PENDING
    item.current_stage = RequestStage.MANAGER_REVIEW
    db.session.commit()
    return item.to_dict()


def delete_onboarding_request(request_id):
    item = db.session.get(OnboardingRequest, request_id)
    if not item or item.is_deleted:
        raise ValueError("OnboardingRequest not found")

    item.is_deleted = True
    db.session.commit()
    return {"message": "OnboardingRequest deleted"}
