from flask import Blueprint
from flask_jwt_extended import jwt_required
from auth import roles_required
from controllers.user_controller import *

user_routes = Blueprint("user_routes", __name__)


@user_routes.route('/users', methods=['POST'])
@roles_required("ADMIN")
def create_user():
    return add_user()


@user_routes.route('/users/login', methods=['POST'])
def login_user():
    return login()


@user_routes.route('/users', methods=['GET'])
@roles_required("ADMIN")
def list_users():
    return get_users()


@user_routes.route('/users/<int:user_id>', methods=['GET'])
@roles_required('ADMIN')
def list_user_by_id(user_id):
    return get_user_by_id(user_id)


@user_routes.route('/users/username/<string:username>', methods=['GET'])
@roles_required("ADMIN")
def list_user_by_username(username):
    return get_user_by_username_controller(username)


@user_routes.route('/users/<int:user_id>', methods=['PUT'])
@roles_required("ADMIN")
def update_user_by_id(user_id):
    return put_user_by_id(user_id)


@user_routes.route('/users/<int:user_id>', methods=['DELETE'])
@roles_required("ADMIN")
def remove_user_by_id(user_id):
    return delete_user_by_id(user_id)
