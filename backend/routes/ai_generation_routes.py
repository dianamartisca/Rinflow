from flask import Blueprint

from auth import roles_required
from controllers.ai_generation_controller import generate_job_responsibilities_content

ai_generation_routes = Blueprint("ai_generation_routes", __name__)


@ai_generation_routes.route("/ai/job-responsibilities", methods=["POST"])
@roles_required("MANAGER")
def generate_manager_job_responsibilities():
    return generate_job_responsibilities_content()
