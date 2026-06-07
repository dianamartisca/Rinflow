import re

from models import JobDescription
from utils.pdf_utils import extract_job_description_requirements


def _build_username(employee):
    first_name = re.sub(r"[^a-z0-9]+", "", employee.first_name.strip().lower())
    last_name = re.sub(r"[^a-z0-9]+", "", employee.last_name.strip().lower())
    return f"{first_name}.{last_name}"


def _get_job_description_for_request(onboarding_request):
    return JobDescription.query.filter_by(
        onboarding_request_id=onboarding_request.id,
        workflow_run=onboarding_request.workflow_run,
        is_deleted=False,
    ).first()


def _to_finance_profile(onboarding_request, approved_at=None):
    employee = onboarding_request.employee
    job_description = _get_job_description_for_request(onboarding_request)
    profile = employee.to_dict()
    profile.update(
        {
            "onboarding_request_id": onboarding_request.id,
            "workflow_run": onboarding_request.workflow_run,
            "requirements": extract_job_description_requirements(job_description.content) if job_description else "",
            "job_description_url": job_description.content if job_description else None,
            "approved_at": approved_at,
        }
    )
    return profile


def _to_it_provisioning_dict(item):
    payload = item.to_dict()
    onboarding_request = item.onboarding_request
    employee = onboarding_request.employee if onboarding_request else None
    job_description = _get_job_description_for_request(onboarding_request) if onboarding_request else None

    payload.update(
        {
            "employee_name": f"{employee.first_name} {employee.last_name}" if employee else None,
            "role": employee.role if employee else None,
            "start_date": employee.start_date.isoformat() if employee else None,
            "hardware_tier": employee.hardware_tier.value if employee and employee.hardware_tier else None,
            "requirements": extract_job_description_requirements(job_description.content) if job_description else "",
        }
    )
    return payload


def _to_admin_employee_profile(profile):
    payload = profile.to_dict()
    onboarding_request = max(
        (request for request in profile.onboarding_requests if not request.is_deleted),
        key=lambda request: request.created_at,
        default=None,
    )

    if not onboarding_request:
        payload.update(
            {
                "onboarding_stage": None,
                "onboarding_status": None,
                "job_description_url": None,
                "it_provisioning": None,
            }
        )
        return payload

    job_description = _get_job_description_for_request(onboarding_request)
    it_provisioning = max(
        (
            record
            for record in onboarding_request.it_provisioning_records
            if not record.is_deleted and record.workflow_run == onboarding_request.workflow_run
        ),
        key=lambda record: record.created_at,
        default=None,
    )

    payload.update(
        {
            "onboarding_request_id": onboarding_request.id,
            "workflow_run": onboarding_request.workflow_run,
            "onboarding_stage": onboarding_request.current_stage.value if onboarding_request.current_stage else None,
            "onboarding_status": onboarding_request.status.value if onboarding_request.status else None,
            "job_description_url": job_description.content if job_description else None,
            "it_provisioning": _to_it_provisioning_dict(it_provisioning) if it_provisioning else None,
        }
    )
    return payload
