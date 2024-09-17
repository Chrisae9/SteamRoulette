# SteamRoulette 🎲

SteamRoulette is a web application that randomly selects a game from your Steam library, helping you decide what to play next.

## Features

- **Steam Login**: Securely log in with your Steam account.
- **Random Game Picker**: Get a random game suggestion from your library.
- **Playtime Filter**: Set a minimum playtime to focus on unplayed or underplayed games.
- **Game Blacklisting**: Exclude specific games from the random selection.
- **Responsive Design**: Clean and user-friendly interface.

## Getting Started

1. **Clone the Repository**

    ```bash
    git clone git@github.com:Chrisae9/SteamRoulette.git
    ```

2. **Install Dependencies**

    ```bash
    cd SteamRoulette
    pip install -r requirements.txt
    ```

3. **Set Up Environment Variables**

    - Create a `.env` file with your Steam API key and necessary configurations.

4. **Run Database Migrations**

    ```bash
    flask db upgrade
    ```

5. **Start the Application**

    ```bash
    flask run
    ```

6. **Access the App**

    - Navigate to `http://localhost:5000` in your web browser.

## License

This project is licensed under the [MIT License](LICENSE).
