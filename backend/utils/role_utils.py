from utils.enums import UserRole


def _parse_user_role(role_value):
    if role_value in (None, ""):
        raise ValueError("Role is required")
    try:
        return UserRole(role_value)
    except ValueError:
        try:
            return UserRole[str(role_value).upper()]
        except KeyError as exc:
            allowed = ", ".join(item.value for item in UserRole)
            raise ValueError(f"Invalid role. Allowed values: {allowed}") from exc
