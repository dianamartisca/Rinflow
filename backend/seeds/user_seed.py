import os

import bcrypt

from models import User, db
from utils.enums import UserRole


DEFAULT_PASSWORD = os.getenv("SEED_DEFAULT_PASSWORD")


DEFAULT_ROLE_ACCOUNTS = {
    UserRole.ADMIN: {
        "username": "admin_user",
        "email": "admin@rinf.com",
        "first_name": "System",
        "last_name": "Admin",
    },
    UserRole.HR: {
        "username": "hr_user",
        "email": "hr@rinf.com",
        "first_name": "HR",
        "last_name": "User",
    },
    UserRole.IT: {
        "username": "it_user",
        "email": "it@rinf.com",
        "first_name": "IT",
        "last_name": "User",
    },
    UserRole.FINANCE: {
        "username": "finance_user",
        "email": "finance@rinf.com",
        "first_name": "Finance",
        "last_name": "User",
    },
    UserRole.MANAGER: {
        "username": "manager_user",
        "email": "manager@rinf.com",
        "first_name": "Team",
        "last_name": "Manager",
    },
}


def _hash_password(password):
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def seed_default_users():
    created_roles = []

    for role, account_data in DEFAULT_ROLE_ACCOUNTS.items():
        existing = User.query.filter_by(role=role, is_deleted=False).first()
        if existing:
            continue

        user = User(
            username=account_data["username"],
            email=account_data["email"],
            password_hash=_hash_password(DEFAULT_PASSWORD),
            role=role,
            first_name=account_data["first_name"],
            last_name=account_data["last_name"],
        )
        db.session.add(user)
        created_roles.append(role.value)

    if created_roles:
        db.session.commit()

    return created_roles
