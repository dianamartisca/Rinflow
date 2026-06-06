from flask import jsonify, request
from services import (
    create_it_provisioning,
    delete_it_provisioning,
    get_all_it_provisioning_records,
    get_it_provisioning,
    update_it_provisioning,
)


def add_it_provisioning():
    try:
        data = request.get_json() or {}
        item = create_it_provisioning(data)
        return jsonify(item), 201
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500


def get_it_provisioning_records():
    items = get_all_it_provisioning_records()
    return jsonify(items), 200


def get_it_provisioning_by_id(provisioning_id):
    try:
        item = get_it_provisioning(provisioning_id)
        return jsonify(item), 200
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500


def put_it_provisioning_by_id(provisioning_id):
    try:
        data = request.get_json() or {}
        item = update_it_provisioning(provisioning_id, data)
        return jsonify(item), 200
    except ValueError as ve:
        message = str(ve)
        status_code = 404 if message == "ITProvisioning not found" else 400
        return jsonify({"message": message}), status_code
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
