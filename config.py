import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a_secret_key_for_session'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    STEAM_API_KEY = os.environ.get('STEAM_API_KEY')
