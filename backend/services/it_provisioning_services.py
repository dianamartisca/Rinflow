from models import ApprovalHistory, ITProvisioning, OnboardingRequest, db
from utils.enums import ApprovalAction, ApprovalStage, RequestStage, RequestStatus
from utils.employee_utils import _build_username, _to_it_provisioning_dict


def create_it_provisioning(data):
    onboarding_request_id = data.get("onboarding_request_id")
    reviewer_id = data.get("reviewer_id")
    company_email = (data.get("company_email") or "").strip()
    laptop_model = (data.get("laptop_model") or "").strip()
    configuration_notes = (data.get("configuration_notes") or "").strip()

    if not onboarding_request_id:
        raise ValueError("onboarding_request_id is required")
    if not reviewer_id:
        raise ValueError("reviewer_id is required")
    if not company_email:
        raise ValueError("company_email is required")
    if not laptop_model:
        raise ValueError("laptop_model is required")
    if not configuration_notes:
        raise ValueError("configuration_notes is required")

    onboarding_request_id = int(onboarding_request_id)
    reviewer_id = int(reviewer_id)
    onboarding_request = db.session.get(OnboardingRequest, onboarding_request_id)
    if not onboarding_request or onboarding_request.is_deleted:
        raise ValueError("OnboardingRequest not found")
    if onboarding_request.it_id != reviewer_id:
        raise ValueError("This onboarding request is not assigned to this IT user")
    if onboarding_request.current_stage != RequestStage.IT_PROVISIONING:
        raise ValueError("OnboardingRequest is not in IT provisioning")

    workflow_run = int(data.get("workflow_run", onboarding_request.workflow_run))
    if workflow_run != onboarding_request.workflow_run:
        raise ValueError("workflow_run must match current onboarding workflow_run")

    if ITProvisioning.query.filter_by(company_email=company_email, is_deleted=False).first():
        raise ValueError("company_email must be unique")
    if ITProvisioning.query.filter_by(
        onboarding_request_id=onboarding_request_id,
        workflow_run=workflow_run,
        is_deleted=False,
    ).first():
        raise ValueError("ITProvisioning already exists for this onboarding workflow run")

    item = ITProvisioning(
        onboarding_request_id=onboarding_request_id,
        workflow_run=workflow_run,
        company_email=company_email,
        username=_build_username(onboarding_request.employee),
        laptop_model=laptop_model,
        configuration_notes=configuration_notes,
    )
    approval = ApprovalHistory(
        onboarding_request_id=onboarding_request_id,
        workflow_run=workflow_run,
        reviewer_id=reviewer_id,
        stage=ApprovalStage.IT_PROVISIONING,
        action=ApprovalAction.APPROVED,
        comments=data.get("comments"),
    )
    onboarding_request.current_stage = RequestStage.COMPLETED
    onboarding_request.status = RequestStatus.COMPLETED

    db.session.add(item)
    db.session.add(approval)
    db.session.commit()
    return _to_it_provisioning_dict(item)


def get_all_it_provisioning_records(it_id=None):
    query = ITProvisioning.query.filter_by(is_deleted=False)
    if it_id is not None:
        query = query.join(OnboardingRequest).filter(OnboardingRequest.it_id == it_id)

    items = query.order_by(ITProvisioning.created_at.desc(), ITProvisioning.id.desc()).all()
    return [_to_it_provisioning_dict(item) for item in items]


def get_it_provisioning(provisioning_id):
    item = db.session.get(ITProvisioning, provisioning_id)
    if not item or item.is_deleted:
        raise ValueError("ITProvisioning not found")
    return _to_it_provisioning_dict(item)


def delete_it_provisioning(provisioning_id):
    item = db.session.get(ITProvisioning, provisioning_id)
    if not item or item.is_deleted:
        raise ValueError("ITProvisioning not found")

    item.is_deleted = True
    db.session.commit()
    return {"message": "ITProvisioning deleted"}
