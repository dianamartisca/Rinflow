from flask import jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity
from services import (
    create_job_description,
    delete_job_description,
    get_all_job_descriptions,
    get_job_description,
    update_job_description,
)


def add_job_description():
    try:
        data = request.get_json() or {}
        item = create_job_description(data)
        return jsonify(item), 201
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500


def get_job_descriptions():
    role = str(get_jwt().get("role", "")).upper()
    manager_id = int(get_jwt_identity()) if role == "MANAGER" else None
    items = get_all_job_descriptions(manager_id=manager_id)
    return jsonify(items), 200


def get_job_description_by_id(job_description_id):
    try:
        item = get_job_description(job_description_id)
        return jsonify(item), 200
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500


def put_job_description_by_id(job_description_id):
    try:
        data = request.get_json() or {}
        item = update_job_description(job_description_id, data)
        return jsonify(item), 200
    except ValueError as ve:
        message = str(ve)
        status_code = 404 if message == "JobDescription not found" else 400
        return jsonify({"message": message}), status_code
    except Exception as e:
        return jsonify({"message": str(e)}), 500


def delete_job_description_by_id(job_description_id):
    try:
        result = delete_job_description(job_description_id)
        return jsonify(result), 200
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500
