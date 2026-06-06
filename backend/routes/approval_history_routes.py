from flask import Blueprint
from flask_jwt_extended import jwt_required
from auth import roles_required
from controllers.approval_history_controller import *

approval_history_routes = Blueprint("approval_history_routes", __name__)


@approval_history_routes.route('/approval-history', methods=['POST'])
@roles_required('MANAGER', 'FINANCE', 'IT')
def create_approval_history_entry():
    return add_approval_history_entry()


@approval_history_routes.route('/approval-history', methods=['GET'])
@jwt_required()
def list_approval_history_entries():
    return get_approval_history_entries()


@approval_history_routes.route('/approval-history/<int:history_id>', methods=['GET'])
@jwt_required()
def list_approval_history_by_id(history_id):
    return get_approval_history_by_id(history_id)

