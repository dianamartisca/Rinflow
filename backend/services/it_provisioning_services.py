from models import ITProvisioning, db


def create_it_provisioning(data):
    item = ITProvisioning(
        onboarding_request_id=data.get("onboarding_request_id"),
        workflow_run=data.get("workflow_run"),
        company_email=data.get("company_email"),
        username=data.get("username"),
        laptop_model=data.get("laptop_model"),
        configuration_notes=data.get("configuration_notes"),
    )
    db.session.add(item)
    db.session.commit()
    return item.to_dict()


def get_all_it_provisioning_records():
    items = ITProvisioning.query.filter_by(is_deleted=False).order_by(ITProvisioning.created_at.desc()).all()
    return [item.to_dict() for item in items]


def get_it_provisioning(provisioning_id):
    item = db.session.get(ITProvisioning, provisioning_id)
    if not item or item.is_deleted:
        raise ValueError("ITProvisioning not found")
    return item.to_dict()


def update_it_provisioning(provisioning_id, data):
    item = db.session.get(ITProvisioning, provisioning_id)
    if not item or item.is_deleted:
        raise ValueError("ITProvisioning not found")

    if not data:
        raise ValueError("Payload cannot be empty")

    if "company_email" in data:
        item.company_email = data["company_email"]
    if "username" in data:
        item.username = data["username"]
    if "laptop_model" in data:
        item.laptop_model = data["laptop_model"]
    if "configuration_notes" in data:
        item.configuration_notes = data["configuration_notes"]

    db.session.commit()
    return item.to_dict()


def delete_it_provisioning(provisioning_id):
    item = db.session.get(ITProvisioning, provisioning_id)
    if not item or item.is_deleted:
        raise ValueError("ITProvisioning not found")

    item.is_deleted = True
    db.session.commit()
    return {"message": "ITProvisioning deleted"}
