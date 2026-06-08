from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

from models import db
from .approval_history_routes import approval_history_routes
from .employee_profile_routes import employee_profiles_routes
from .it_provisioning_routes import it_provisioning_routes
from .job_description_routes import job_descriptions_routes
from .onboarding_request_routes import onboarding_requests_routes
from .user_routes import user_routes


def create_app():
    app = Flask(__name__, static_folder='../../static')
    CORS(app, support_credentials=False)

    app.config.from_object(Config)
    
    db.init_app(app)
    jwt = JWTManager(app)

    app.register_blueprint(user_routes)
    app.register_blueprint(employee_profiles_routes)
    app.register_blueprint(onboarding_requests_routes)
    app.register_blueprint(job_descriptions_routes)
    app.register_blueprint(it_provisioning_routes)
    app.register_blueprint(approval_history_routes)

    return app
