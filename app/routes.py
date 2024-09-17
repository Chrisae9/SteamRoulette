from flask import Blueprint, jsonify, render_template, session, redirect, url_for, request, current_app
import requests
import random as py_random  # Renamed import to avoid conflict
from . import db
import concurrent.futures

main_routes = Blueprint('main_routes', __name__)

# Define the BlacklistedGame model
class BlacklistedGame(db.Model):
    __tablename__ = 'blacklisted_games'  # Ensure table name is specified
    id = db.Column(db.Integer, primary_key=True)
    steam_id = db.Column(db.String(20), nullable=False)
    appid = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f"<BlacklistedGame {self.appid} for {self.steam_id}>"

@main_routes.route("/")
def index():
    if 'steam_id' in session:
        return redirect(url_for('main_routes.random'))
    return render_template('index.html')

@main_routes.route("/random", methods=['GET', 'POST'])
def random():
    if 'steam_id' not in session:
        return redirect(url_for('auth_routes.login'))

    steam_id = session['steam_id']
    api_key = current_app.config['STEAM_API_KEY']

    # Fetch games from Steam API
    games_response = requests.get(
        f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"
        f"?key={api_key}&steamid={steam_id}&include_appinfo=true&format=json"
    )
    games_data = games_response.json()

    # Fetch the user's blacklisted games
    blacklisted_games = {game.appid for game in BlacklistedGame.query.filter_by(steam_id=steam_id).all()}

    if "games" in games_data.get("response", {}):
        games = games_data["response"]["games"]

        # Accept min_playtime from both POST data and query parameters
        min_playtime = 0  # Default value

        if request.method == 'POST':
            min_playtime = int(request.form.get('min_playtime', 0))
        elif 'min_playtime' in request.args:
            min_playtime = int(request.args.get('min_playtime', 0))

        # Apply filters if any
        filtered_games = [
            game for game in games
            if game.get('playtime_forever', 0) >= min_playtime and
            game['appid'] not in blacklisted_games
        ]

        if filtered_games:
            random_game = py_random.choice(filtered_games)  # Using the renamed import
            game_name = random_game.get("name", "Unknown Game")
            playtime_hours = random_game.get('playtime_forever', 0) / 60
            appid = random_game.get('appid')

            # Construct the large image URL (capsule image)
            game_image_url = f"https://steamcdn-a.akamaihd.net/steam/apps/{appid}/header.jpg"

            # Render template with min_playtime
            return render_template('random.html',
                                   game_name=game_name,
                                   playtime_hours=playtime_hours,
                                   random_game=random_game,
                                   game_image_url=game_image_url,
                                   last_played=None,  # Include last_played if available
                                   min_playtime=min_playtime)
        else:
            # No games match filters
            return render_template('no_games.html', min_playtime=min_playtime)
    else:
        return "No games found in your library."

@main_routes.route("/blacklist_game/<int:appid>", methods=['POST'])
def blacklist_game(appid):
    if 'steam_id' not in session:
        return redirect(url_for('auth_routes.login'))

    steam_id = session['steam_id']

    # Check if the game is already blacklisted
    if not BlacklistedGame.query.filter_by(steam_id=steam_id, appid=appid).first():
        # Add the game to the blacklist
        blacklisted_game = BlacklistedGame(steam_id=steam_id, appid=appid)
        db.session.add(blacklisted_game)
        db.session.commit()

    # Get min_playtime from form data
    min_playtime = int(request.form.get('min_playtime', 0))

    # Redirect back to the random game page with min_playtime as a query parameter
    return redirect(url_for('main_routes.random', min_playtime=min_playtime))

@main_routes.route("/blacklist", methods=['GET', 'POST'])
def blacklist():
    if 'steam_id' not in session:
        return redirect(url_for('auth_routes.login'))

    steam_id = session['steam_id']

    if request.method == 'POST':
        appid = request.form.get('appid')
        if appid:
            # Remove the game from the blacklist
            blacklisted_game = BlacklistedGame.query.filter_by(steam_id=steam_id, appid=appid).first()
            if blacklisted_game:
                db.session.delete(blacklisted_game)
                db.session.commit()
                return jsonify({"status": "success", "message": "Game removed from blacklist"}), 200

    # Fetch the user's blacklisted games
    blacklisted_games = BlacklistedGame.query.filter_by(steam_id=steam_id).all()
    appids = [game.appid for game in blacklisted_games]

    if not appids:
        # No blacklisted games, render template with empty games list
        return render_template('blacklist.html', games=[])

    # Function to fetch game details for a single appid
    def fetch_game_details(appid):
        try:
            response = requests.get(f"https://store.steampowered.com/api/appdetails?appids={appid}")
            data = response.json()
            appid_str = str(appid)
            if data.get(appid_str, {}).get("success"):
                game_data = data[appid_str]["data"]
                game_name = game_data.get("name", "Unknown Game")
                game_image_url = game_data.get("header_image", "")
                return {
                    "appid": appid,
                    "name": game_name,
                    "image_url": game_image_url
                }
            else:
                return {
                    "appid": appid,
                    "name": "Unknown Game",
                    "image_url": ""
                }
        except Exception as e:
            print(f"Error fetching details for appid {appid}: {e}")
            return {
                "appid": appid,
                "name": "Unknown Game",
                "image_url": ""
            }

    # Use ThreadPoolExecutor to fetch game details concurrently
    games = []
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = {executor.submit(fetch_game_details, appid): appid for appid in appids}
        for future in concurrent.futures.as_completed(futures):
            game = future.result()
            games.append(game)

    return render_template('blacklist.html', games=games)
