from flask import Blueprint
from flask_jwt_extended import jwt_required
from auth import roles_required
from controllers.job_description_controller import *

job_descriptions_routes = Blueprint("job_description_routes", __name__)


@job_descriptions_routes.route('/job-descriptions', methods=['POST'])
@roles_required('MANAGER')
def create_job_description():
    return add_job_description()


@job_descriptions_routes.route('/job-descriptions', methods=['GET'])
@roles_required('MANAGER', 'HR', 'ADMIN')
def list_job_descriptions():
    return get_job_descriptions()


@job_descriptions_routes.route('/job-descriptions/<int:job_description_id>', methods=['GET'])
@roles_required('MANAGER', 'HR', 'ADMIN')
def list_job_description_by_id(job_description_id):
    return get_job_description_by_id(job_description_id)


@job_descriptions_routes.route('/job-descriptions/<int:job_description_id>', methods=['PUT'])
@roles_required('MANAGER')
def update_job_description_by_id(job_description_id):
    return put_job_description_by_id(job_description_id)


@job_descriptions_routes.route('/job-descriptions/<int:job_description_id>', methods=['DELETE'])
@roles_required('ADMIN')
def remove_job_description_by_id(job_description_id):
    return delete_job_description_by_id(job_description_id)
