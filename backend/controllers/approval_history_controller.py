from flask import jsonify, request
from services import (
    create_approval_history_entry,
    get_all_approval_history_entries,
    get_approval_history_entry,
)


def add_approval_history_entry():
    try:
        data = request.get_json() or {}
        item = create_approval_history_entry(data)
        return jsonify(item), 201
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500


def get_approval_history_entries():
    items = get_all_approval_history_entries()
    return jsonify(items), 200


def get_approval_history_by_id(history_id):
    try:
        item = get_approval_history_entry(history_id)
        return jsonify(item), 200
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500
