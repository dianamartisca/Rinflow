from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt


def roles_required(*allowed_roles):
    normalized_allowed_roles = {role.upper() for role in allowed_roles}

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = str(claims.get("role", "")).upper()

            if user_role not in normalized_allowed_roles:
                readable_roles = ", ".join(sorted(normalized_allowed_roles))
                return jsonify({"message": f"Access restricted to roles: {readable_roles}"}), 403

            return fn(*args, **kwargs)

        return wrapper

    return decorator
