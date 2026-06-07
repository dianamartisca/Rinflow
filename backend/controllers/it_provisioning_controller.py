from flask import jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity
from services import (
    create_it_provisioning,
    delete_it_provisioning,
    get_all_it_provisioning_records,
    get_it_provisioning,
)


def add_it_provisioning():
    try:
        data = request.get_json() or {}
        data["reviewer_id"] = int(get_jwt_identity())
        item = create_it_provisioning(data)
        return jsonify(item), 201
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500


def get_it_provisioning_records():
    role = str(get_jwt().get("role", "")).upper()
    it_id = int(get_jwt_identity()) if role == "IT" else None
    items = get_all_it_provisioning_records(it_id=it_id)
    return jsonify(items), 200


def get_it_provisioning_by_id(provisioning_id):
    try:
        item = get_it_provisioning(provisioning_id)
        return jsonify(item), 200
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500


def delete_it_provisioning_by_id(provisioning_id):
    try:
        result = delete_it_provisioning(provisioning_id)
        return jsonify(result), 200
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500
