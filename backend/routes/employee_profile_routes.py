from flask import Blueprint
from auth import roles_required
from controllers.employee_profile_controller import *

employee_profiles_routes = Blueprint("employee_profile_routes", __name__)


@employee_profiles_routes.route('/employee-profiles', methods=['POST'])
@roles_required('HR')
def create_employee_profile():
    return add_employee_profile()


@employee_profiles_routes.route('/employee-profiles', methods=['GET'])
@roles_required('HR', 'ADMIN')
def list_employee_profiles():
    return get_employee_profiles()


@employee_profiles_routes.route('/employee-profiles/manager-review', methods=['GET'])
@roles_required('MANAGER')
def list_manager_review_profiles():
    return get_manager_review_profiles()


@employee_profiles_routes.route('/employee-profiles/finance-approval', methods=['GET'])
@roles_required('FINANCE')
def list_finance_approval_profiles():
    return get_finance_approval_profiles()


@employee_profiles_routes.route('/employee-profiles/finance-approved', methods=['GET'])
@roles_required('FINANCE')
def list_finance_approved_profiles():
    return get_finance_approved_profiles()


@employee_profiles_routes.route('/employee-profiles/it-provisioning', methods=['GET'])
@roles_required('IT')
def list_it_provisioning_profiles():
    return get_it_provisioning_profiles()


@employee_profiles_routes.route('/employee-profiles/<int:profile_id>', methods=['GET'])
@roles_required('HR', 'ADMIN')
def list_employee_profile_by_id(profile_id):
    return get_employee_profile_by_id(profile_id)


@employee_profiles_routes.route('/employee-profiles/<int:profile_id>', methods=['PUT'])
@roles_required('HR')
def update_employee_profile_by_id(profile_id):
    return put_employee_profile_by_id(profile_id)


@employee_profiles_routes.route('/employee-profiles/<int:profile_id>', methods=['DELETE'])
@roles_required('ADMIN')
def remove_employee_profile_by_id(profile_id):
    return delete_employee_profile_by_id(profile_id)
