from flask import jsonify, request

from services import generate_job_responsibilities


def generate_job_responsibilities_content():
    try:
        data = request.get_json() or {}
        item = generate_job_responsibilities(data.get("role"))
        return jsonify(item), 200
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500
