from models import User, db
from utils.image_utils import _save_profile_picture
from utils.role_utils import _parse_user_role
import bcrypt
import re
from flask_jwt_extended import create_access_token
from werkzeug.datastructures import FileStorage

def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def create_user(data):
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role_value = data.get("role")
    role = _parse_user_role(role_value)
    first_name = data.get("first_name")
    last_name = data.get("last_name")

    if not username:
        raise ValueError("Username cannot be empty")
    if len(username) < 4:
        raise ValueError("Username must be at least 4 characters long")
    if User.query.filter_by(username=username).first() is not None:
        raise ValueError("Username already exists")
    if not email:
        raise ValueError("Email cannot be empty")
    if not is_valid_email(email):
        raise ValueError("Email format is invalid")
    if User.query.filter_by(email=email).first() is not None:
        raise ValueError("Email already exists")
    if not password:
        raise ValueError("Password cannot be empty")

    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    hashed_str = hashed.decode('utf-8')

    user = User(
        username=username,
        email=email,
        password_hash=hashed_str,
        role=role,
        first_name=first_name,
        last_name=last_name,
    )
    db.session.add(user)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise e

    return user.to_dict()

def login_user(email, password):
    if not email or not password:
        raise ValueError("Email and password are required")
    
    user = User.query.filter_by(email=email).first()
    if not user or user.is_deleted:
        return None
    
    stored_hash = user.password_hash.encode('utf-8')
    if not bcrypt.checkpw(password.encode('utf-8'), stored_hash):
        return None
    
    additional_claims = {"role": user.role.value if user.role else None}
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims=additional_claims
    )
    
    return {
        "user": user.to_dict(),
        "access_token": access_token
    }


def get_all_users():
    users = User.query.filter_by(is_deleted=False).order_by(User.created_at.desc()).all()
    return [user.to_dict() for user in users]


def get_user(user_id):
    user = db.session.get(User, user_id)
    if not user or user.is_deleted:
        raise ValueError("User not found")

    return user.to_dict()

def get_user_by_username(username):
    if not username:
        raise ValueError("Username cannot be empty")

    user = User.query.filter_by(username=username).first()
    if not user or user.is_deleted:
        raise ValueError("User not found")

    return user.to_dict()

def update_user(user_id, data):
    user = db.session.get(User, user_id)

    if not user:
        raise ValueError("User not found")
    if not len(data):
        raise ValueError("Payload cannot be empty")

    username = data.get("username")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    email = data.get("email")
    role = data.get("role")
    profile_picture = data.get("profile_picture")

    if username:
        if len(username) < 4:
            raise ValueError("Username must be at least 4 characters long.")
        user.username = username
    if first_name:
        user.first_name = first_name
    if last_name:
        user.last_name = last_name
    if email:
        user.email = email
    if role:
        user.role = _parse_user_role(role)
    if "profile_picture" in data:
        if isinstance(profile_picture, FileStorage):
            user.profile_picture = _save_profile_picture(profile_picture)
        elif profile_picture in ("", None):
            user.profile_picture = None
        else:
            raise ValueError("Profile picture must be uploaded as a file")

    user.updated_at = db.func.now()

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise e

    return user.to_dict()


def delete_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        raise ValueError("User not found")
    if user.is_deleted:
        raise ValueError("User is already deleted")

    user.is_deleted = True

    try:
        db.session.commit()
        return {"message": "User deleted successfully"}
    except Exception as e:
        db.session.rollback()
        raise e
