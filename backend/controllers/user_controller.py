from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity
from services import (
    create_user, get_user, get_all_users,
    update_user, delete_user, login_user,
    get_user_by_username)


def add_user():
    try:
        data = request.get_json() or {}
        new_user = create_user(data)
        return jsonify(new_user), 201
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500

def login():
    try:
        data = request.get_json() or {}
        email = data.get("email")
        password = data.get("password")
        
        result = login_user(email, password)
        if result:
            return jsonify(result), 200
        else:
            return jsonify({"message": "Invalid email or password"}), 401
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500


def get_users():
    users = get_all_users()
    if not users:
        return jsonify([]), 200
    return jsonify(users), 200


def get_user_by_id(user_id):
    try:
        user = get_user(user_id)
        return jsonify(user), 200
    except ValueError as ve:
        message = str(ve)
        status_code = 404 if message == "User not found" else 400
        return jsonify({"message": message}), status_code
    except Exception as e:
        return jsonify({"message": str(e)}), 500


def get_user_by_username_controller(username):
    try:
        user = get_user_by_username(username)
        return jsonify(user), 200
    except ValueError as ve:
        message = str(ve)
        status_code = 404 if message == "User not found" else 400
        return jsonify({"message": message}), status_code
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    

def put_user_by_id(user_id):
    try:
        data = request.form.to_dict()
        if 'profile_picture' in request.files:
            data['profile_picture'] = request.files['profile_picture']
        data['user_id'] = get_jwt_identity()
        updated_user = update_user(user_id, data)
        return jsonify(updated_user), 200
    except ValueError as ve:
        message = str(ve)
        status_code = 404 if message == "User not found" else 400
        return jsonify({"message": message}), status_code
    except PermissionError as pe:
        return jsonify({"message": str(pe)}), 403
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    

def delete_user_by_id(user_id):
    try:
        result = delete_user(user_id)
        return jsonify(result), 200
    except ValueError as ve:
        message = str(ve)
        status_code = 404 if message == "User not found" else 400
        return jsonify({"message": message}), status_code
    except PermissionError as pe:
        return jsonify({"message": str(pe)}), 403
    except Exception as e:
        return jsonify({"message": str(e)}), 500