from models import JobDescription, db


def create_job_description(data):
    item = JobDescription(
        onboarding_request_id=data.get("onboarding_request_id"),
        workflow_run=data.get("workflow_run"),
        content=data.get("content"),
    )
    db.session.add(item)
    db.session.commit()
    return item.to_dict()


def get_all_job_descriptions():
    items = JobDescription.query.filter_by(is_deleted=False).all()
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
