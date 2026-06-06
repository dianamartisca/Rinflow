from flask import Blueprint
from flask_jwt_extended import jwt_required
from auth import roles_required
from controllers.onboarding_request_controller import *

onboarding_requests_routes = Blueprint("onboarding_request_routes", __name__)


@onboarding_requests_routes.route('/onboarding-requests', methods=['POST'])
@roles_required('HR')
def create_onboarding_request():
    return add_onboarding_request()


@onboarding_requests_routes.route('/onboarding-requests', methods=['GET'])
@jwt_required()
def list_onboarding_requests():
    return get_onboarding_requests()


@onboarding_requests_routes.route('/onboarding-requests/<int:request_id>', methods=['GET'])
@jwt_required()
def list_onboarding_request_by_id(request_id):
    return get_onboarding_request_by_id(request_id)

@onboarding_requests_routes.route('/onboarding-requests/<int:request_id>/resubmit', methods=['POST'])
@roles_required('HR')
def restart_onboarding_request(request_id):
    return resubmit_onboarding_request(request_id)


@onboarding_requests_routes.route('/onboarding-requests/<int:request_id>', methods=['DELETE'])
@roles_required('HR')
def remove_onboarding_request_by_id(request_id):
    return delete_onboarding_request_by_id(request_id)
