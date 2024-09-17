from flask import Blueprint, redirect, url_for, session, request, flash
import requests
from urllib.parse import urlencode

auth_routes = Blueprint('auth_routes', __name__)

# Steam OpenID endpoint
STEAM_OPENID_URL = "https://steamcommunity.com/openid/login"

@auth_routes.route("/login")
def login():
    if 'steam_id' in session:
        return redirect(url_for('main_routes.random'))  # Redirect if already logged in
    params = {
        'openid.ns': 'http://specs.openid.net/auth/2.0',
        'openid.mode': 'checkid_setup',
        'openid.return_to': url_for('auth_routes.authorized', _external=True),
        'openid.realm': request.host_url,
        'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    }
    query_string = urlencode(params)
    auth_url = f"{STEAM_OPENID_URL}?{query_string}"
    return redirect(auth_url)

@auth_routes.route("/login/authorized")
def authorized():
    params = {
        'openid.assoc_handle': request.args.get('openid.assoc_handle'),
        'openid.signed': request.args.get('openid.signed'),
        'openid.sig': request.args.get('openid.sig'),
        'openid.ns': request.args.get('openid.ns'),
    }

    for param in request.args.get('openid.signed').split(','):
        params[f'openid.{param}'] = request.args.get(f'openid.{param}')

    params['openid.mode'] = 'check_authentication'

    response = requests.post(STEAM_OPENID_URL, data=params)

    if "is_valid:true" in response.text:
        steam_id = request.args.get('openid.claimed_id').split('/')[-1]
        session['steam_id'] = steam_id  # Make sure this is properly set
        return redirect(url_for('main_routes.random'))  # Redirect to a page that requires login
    else:
        return "Authorization failed."

@auth_routes.route("/logout")
def logout():
    session.pop('steam_id', None)
    return redirect(url_for('main_routes.index'))
