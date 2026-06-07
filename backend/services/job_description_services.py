from models import ApprovalHistory, JobDescription, OnboardingRequest, db
from utils.enums import ApprovalAction, ApprovalStage, HardwareTier, RequestStage, RequestStatus
from utils.pdf_utils import write_job_description_pdf


def create_job_description(data):
    onboarding_request_id = data.get("onboarding_request_id")
    reviewer_id = data.get("reviewer_id")
    requirements = data.get("requirements") or data.get("content")

    if not onboarding_request_id:
        raise ValueError("onboarding_request_id is required")
    if not reviewer_id:
        raise ValueError("reviewer_id is required")
    if not requirements:
        raise ValueError("requirements are required")

    onboarding_request_id = int(onboarding_request_id)
    reviewer_id = int(reviewer_id)
    onboarding_request = db.session.get(OnboardingRequest, onboarding_request_id)
    if not onboarding_request or onboarding_request.is_deleted:
        raise ValueError("OnboardingRequest not found")
    if onboarding_request.manager_id != reviewer_id:
        raise ValueError("This onboarding request is not assigned to this manager")
    if onboarding_request.current_stage != RequestStage.MANAGER_REVIEW:
        raise ValueError("OnboardingRequest is not in manager review")

    workflow_run = data.get("workflow_run", onboarding_request.workflow_run)
    workflow_run = int(workflow_run)
    if workflow_run != onboarding_request.workflow_run:
        raise ValueError("workflow_run must match current onboarding workflow_run")

    existing_item = JobDescription.query.filter_by(
        onboarding_request_id=onboarding_request_id,
        workflow_run=workflow_run,
        is_deleted=False,
    ).first()
    if existing_item:
        raise ValueError("JobDescription already exists for this onboarding workflow run")

    if onboarding_request.employee.hardware_tier == HardwareTier.PREMIUM:
        if not onboarding_request.finance_id:
            raise ValueError("finance_id is required for PREMIUM hardware tier")

    content_path = write_job_description_pdf(onboarding_request, requirements)

    if onboarding_request.employee.hardware_tier == HardwareTier.PREMIUM:
        onboarding_request.current_stage = RequestStage.FINANCE_APPROVAL
    else:
        onboarding_request.current_stage = RequestStage.IT_PROVISIONING
    onboarding_request.status = RequestStatus.PENDING

    item = JobDescription(
        onboarding_request_id=onboarding_request_id,
        workflow_run=workflow_run,
        content=content_path,
    )
    approval = ApprovalHistory(
        onboarding_request_id=onboarding_request_id,
        workflow_run=workflow_run,
        reviewer_id=reviewer_id,
        stage=ApprovalStage.MANAGER_REVIEW,
        action=ApprovalAction.APPROVED,
        comments=data.get("comments"),
    )

    db.session.add(item)
    db.session.add(approval)
    db.session.commit()
    return item.to_dict()


def get_all_job_descriptions(manager_id=None):
    query = JobDescription.query.filter_by(is_deleted=False)
    if manager_id is not None:
        query = query.join(OnboardingRequest).filter(OnboardingRequest.manager_id == manager_id)

    items = query.order_by(JobDescription.created_at.desc(), JobDescription.id.desc()).all()
    return [item.to_dict() for item in items]


def get_job_description(job_description_id):
    item = db.session.get(JobDescription, job_description_id)
    if not item or item.is_deleted:
        raise ValueError("JobDescription not found")
    return item.to_dict()


def update_job_description(job_description_id, data):
    item = db.session.get(JobDescription, job_description_id)
    if not item or item.is_deleted:
        raise ValueError("JobDescription not found")

    if not data:
        raise ValueError("Payload cannot be empty")

    if "content" in data:
        item.content = data["content"]

    db.session.commit()
    return item.to_dict()


def delete_job_description(job_description_id):
    item = db.session.get(JobDescription, job_description_id)
    if not item or item.is_deleted:
        raise ValueError("JobDescription not found")

    item.is_deleted = True
    db.session.commit()
    return {"message": "JobDescription deleted"}
