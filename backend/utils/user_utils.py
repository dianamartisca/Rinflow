from models import User


def get_user_id_by_email(email, expected_role, label, required=True):
    if not email:
        if required:
            raise ValueError(f"{label}_email is required")
        return None

    user = User.query.filter_by(email=email.strip(), is_deleted=False).first()
    if not user:
        raise ValueError(f"{label} user not found")
    if user.role != expected_role:
        raise ValueError(f"{label}_email must belong to a {expected_role.value} user")

    return user.id
