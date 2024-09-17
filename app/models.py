from . import db

class BlacklistedGame(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    steam_id = db.Column(db.String(20), nullable=False)
    appid = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f"<BlacklistedGame {self.appid} for {self.steam_id}>"