from flask import Blueprint
from flask_jwt_extended import jwt_required
from auth import roles_required
from controllers.employee_profile_controller import *

employee_profiles_routes = Blueprint("employee_profile_routes", __name__)


@employee_profiles_routes.route('/employee-profiles', methods=['POST'])
@roles_required('HR')
def create_employee_profile():
    return add_employee_profile()


@employee_profiles_routes.route('/employee-profiles', methods=['GET'])
@jwt_required()
def list_employee_profiles():
    return get_employee_profiles()


@employee_profiles_routes.route('/employee-profiles/<int:profile_id>', methods=['GET'])
@jwt_required()
def list_employee_profile_by_id(profile_id):
    return get_employee_profile_by_id(profile_id)


@employee_profiles_routes.route('/employee-profiles/<int:profile_id>', methods=['PUT'])
@roles_required('HR')
def update_employee_profile_by_id(profile_id):
    return put_employee_profile_by_id(profile_id)


@employee_profiles_routes.route('/employee-profiles/<int:profile_id>', methods=['DELETE'])
@roles_required('HR')
def remove_employee_profile_by_id(profile_id):
    return delete_employee_profile_by_id(profile_id)
