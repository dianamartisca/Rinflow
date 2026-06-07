from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity
from services import (
    create_employee_profile,
    delete_employee_profile,
    get_all_employee_profiles,
    get_employee_profile,
    get_manager_review_employee_profiles,
    update_employee_profile,
)


def add_employee_profile():
    try:
        data = request.get_json() or {}
        data["created_by"] = int(get_jwt_identity())
        employee = create_employee_profile(data)
        return jsonify(employee), 201
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500


def get_employee_profiles():
    items = get_all_employee_profiles()
    return jsonify(items), 200


def get_manager_review_profiles():
    items = get_manager_review_employee_profiles(int(get_jwt_identity()))
    return jsonify(items), 200


def get_employee_profile_by_id(profile_id):
    try:
        item = get_employee_profile(profile_id)
        return jsonify(item), 200
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500


def put_employee_profile_by_id(profile_id):
    try:
        data = request.get_json() or {}
        item = update_employee_profile(profile_id, data)
        return jsonify(item), 200
    except ValueError as ve:
        message = str(ve)
        status_code = 404 if message == "EmployeeProfile not found" else 400
        return jsonify({"message": message}), status_code
    except Exception as e:
        return jsonify({"message": str(e)}), 500


def delete_employee_profile_by_id(profile_id):
    try:
        result = delete_employee_profile(profile_id)
        return jsonify(result), 200
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500
