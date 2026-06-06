from models import ApprovalHistory, OnboardingRequest, db
from utils.enums import ApprovalAction, ApprovalStage, HardwareTier, RequestStage, RequestStatus
from utils.enum_utils import parse_enum


def create_approval_history_entry(data):
    onboarding_request_id = data.get("onboarding_request_id")
    reviewer_id = data.get("reviewer_id")
    stage = parse_enum(ApprovalStage, data.get("stage"), "stage")
    action = parse_enum(ApprovalAction, data.get("action"), "action")

    if not onboarding_request_id:
        raise ValueError("onboarding_request_id is required")
    if not reviewer_id:
        raise ValueError("reviewer_id is required")

    onboarding_request = db.session.get(OnboardingRequest, onboarding_request_id)
    if not onboarding_request or onboarding_request.is_deleted:
        raise ValueError("OnboardingRequest not found")

    expected_stage = {
        RequestStage.MANAGER_REVIEW: ApprovalStage.MANAGER_REVIEW,
        RequestStage.FINANCE_APPROVAL: ApprovalStage.FINANCE_APPROVAL,
        RequestStage.IT_PROVISIONING: ApprovalStage.IT_PROVISIONING,
    }.get(onboarding_request.current_stage)

    if expected_stage is None:
        raise ValueError("OnboardingRequest is not in an approvable stage")
    if stage != expected_stage:
        raise ValueError("Approval stage does not match onboarding current stage")

    workflow_run = data.get("workflow_run", onboarding_request.workflow_run)
    if workflow_run != onboarding_request.workflow_run:
        raise ValueError("workflow_run must match current onboarding workflow_run")

    item = ApprovalHistory(
        onboarding_request_id=onboarding_request_id,
        workflow_run=workflow_run,
        reviewer_id=reviewer_id,
        stage=stage,
        action=action,
        comments=data.get("comments"),
    )

    if action == ApprovalAction.REJECTED:
        onboarding_request.current_stage = RequestStage.HR_REWORK
        onboarding_request.status = RequestStatus.NEEDS_REWORK
    else:
        if stage == ApprovalStage.MANAGER_REVIEW:
            if onboarding_request.employee.hardware_tier == HardwareTier.PREMIUM:
                if not onboarding_request.finance_id:
                    raise ValueError("finance_id is required for PREMIUM hardware tier")
                onboarding_request.current_stage = RequestStage.FINANCE_APPROVAL
                onboarding_request.status = RequestStatus.PENDING
            else:
                onboarding_request.current_stage = RequestStage.IT_PROVISIONING
                onboarding_request.status = RequestStatus.PENDING
        elif stage == ApprovalStage.FINANCE_APPROVAL:
            onboarding_request.current_stage = RequestStage.IT_PROVISIONING
            onboarding_request.status = RequestStatus.PENDING
        elif stage == ApprovalStage.IT_PROVISIONING:
            onboarding_request.current_stage = RequestStage.COMPLETED
            onboarding_request.status = RequestStatus.COMPLETED

    db.session.add(item)
    db.session.commit()
    return item.to_dict()


def get_all_approval_history_entries():
    items = ApprovalHistory.query.filter_by(is_deleted=False).all()
    return [item.to_dict() for item in items]


def get_approval_history_entry(history_id):
    item = db.session.get(ApprovalHistory, history_id)
    if not item or item.is_deleted:
        raise ValueError("ApprovalHistory not found")
    return item.to_dict()
