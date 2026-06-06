from flask import Blueprint
from flask_jwt_extended import jwt_required
from auth import roles_required
from controllers.it_provisioning_controller import *

it_provisioning_routes = Blueprint("it_provisioning_routes", __name__)


@it_provisioning_routes.route('/it-provisioning', methods=['POST'])
@roles_required('IT')
def create_it_provisioning():
    return add_it_provisioning()


@it_provisioning_routes.route('/it-provisioning', methods=['GET'])
@jwt_required()
def list_it_provisioning_records():
    return get_it_provisioning_records()


@it_provisioning_routes.route('/it-provisioning/<int:provisioning_id>', methods=['GET'])
@jwt_required()
def list_it_provisioning_by_id(provisioning_id):
    return get_it_provisioning_by_id(provisioning_id)


@it_provisioning_routes.route('/it-provisioning/<int:provisioning_id>', methods=['PUT'])
@roles_required('IT')
def update_it_provisioning_by_id(provisioning_id):
    return put_it_provisioning_by_id(provisioning_id)


@it_provisioning_routes.route('/it-provisioning/<int:provisioning_id>', methods=['DELETE'])
@roles_required('IT')
def remove_it_provisioning_by_id(provisioning_id):
    return delete_it_provisioning_by_id(provisioning_id)
