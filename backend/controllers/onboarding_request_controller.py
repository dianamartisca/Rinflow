from flask import jsonify, request
from services import (
    create_onboarding_request,
    delete_onboarding_request,
    get_all_onboarding_requests,
    get_onboarding_request,
    resubmit_onboarding_request as resubmit_onboarding_request_service,
)


def add_onboarding_request():
    try:
        data = request.get_json() or {}
        item = create_onboarding_request(data)
        return jsonify(item), 201
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500


def get_onboarding_requests():
    items = get_all_onboarding_requests()
    return jsonify(items), 200


def get_onboarding_request_by_id(request_id):
    try:
        item = get_onboarding_request(request_id)
        return jsonify(item), 200
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500


def resubmit_onboarding_request(request_id):
    try:
        item = resubmit_onboarding_request_service(request_id)
        return jsonify(item), 200
    except ValueError as ve:
        message = str(ve)
        status_code = 404 if message == "OnboardingRequest not found" else 400
        return jsonify({"message": message}), status_code
    except Exception as e:
        return jsonify({"message": str(e)}), 500


def delete_onboarding_request_by_id(request_id):
    try:
        result = delete_onboarding_request(request_id)
        return jsonify(result), 200
    except ValueError as ve:
        return jsonify({"message": str(ve)}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500
