from models import EmployeeProfile, OnboardingRequest, db
from utils.enums import HardwareTier, RequestStage
from utils.date_utils import parse_future_workday
from utils.enum_utils import parse_enum


def create_employee_profile(data):
    employee = EmployeeProfile(
        first_name=data.get("first_name"),
        last_name=data.get("last_name"),
        role=data.get("role"),
        start_date=parse_future_workday(data.get("start_date"), "start_date"),
        hardware_tier=parse_enum(HardwareTier, data.get("hardware_tier"), "hardware_tier"),
        created_by=data.get("created_by"),
    )
    db.session.add(employee)
    db.session.commit()
    return employee.to_dict()


def get_all_employee_profiles():
    items = EmployeeProfile.query.filter_by(is_deleted=False).order_by(EmployeeProfile.created_at.desc()).all()
    return [item.to_dict() for item in items]


def get_manager_review_employee_profiles(manager_id):
    items = (
        OnboardingRequest.query.filter_by(
            manager_id=manager_id,
            current_stage=RequestStage.MANAGER_REVIEW,
            is_deleted=False,
        )
        .order_by(OnboardingRequest.created_at.desc(), OnboardingRequest.id.desc())
        .all()
    )

    profiles = []
    for onboarding_request in items:
        if not onboarding_request.employee or onboarding_request.employee.is_deleted:
            continue

        profile = onboarding_request.employee.to_dict()
        profile.update(
            {
                "onboarding_request_id": onboarding_request.id,
                "workflow_run": onboarding_request.workflow_run,
                "onboarding_created_at": onboarding_request.created_at.isoformat() if onboarding_request.created_at else None,
            }
        )
        profiles.append(profile)

    return profiles


def get_employee_profile(profile_id):
    item = db.session.get(EmployeeProfile, profile_id)
    if not item or item.is_deleted:
        raise ValueError("EmployeeProfile not found")
    return item.to_dict()


def update_employee_profile(profile_id, data):
    item = db.session.get(EmployeeProfile, profile_id)
    if not item or item.is_deleted:
        raise ValueError("EmployeeProfile not found")

    if not data:
        raise ValueError("Payload cannot be empty")

    onboarding_request = OnboardingRequest.query.filter_by(employee_id=profile_id, is_deleted=False).first()
    if onboarding_request and onboarding_request.current_stage != RequestStage.HR_REWORK:
        raise ValueError("Employee profile can only be updated before onboarding starts or during HR_REWORK")

    if "first_name" in data:
        item.first_name = data["first_name"]
    if "last_name" in data:
        item.last_name = data["last_name"]
    if "role" in data:
        item.role = data["role"]
    if "start_date" in data:
        item.start_date = parse_future_workday(data["start_date"], "start_date")
    if "hardware_tier" in data:
        item.hardware_tier = parse_enum(HardwareTier, data["hardware_tier"], "hardware_tier")

    db.session.commit()
    return item.to_dict()


def delete_employee_profile(profile_id):
    item = db.session.get(EmployeeProfile, profile_id)
    if not item or item.is_deleted:
        raise ValueError("EmployeeProfile not found")

    item.is_deleted = True
    db.session.commit()
    return {"message": "EmployeeProfile deleted"}
