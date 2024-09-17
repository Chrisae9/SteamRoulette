from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__,
                template_folder='../templates',
                static_folder='../assets'
               )
    app.config.from_object(Config)

    # Initialize the app with the extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Import models so that Flask-Migrate can detect them
    from app.models import BlacklistedGame  # Ensure models are imported

    from app.auth import auth_routes
    from app.routes import main_routes

    # Register blueprints
    app.register_blueprint(auth_routes)
    app.register_blueprint(main_routes)

    return app

