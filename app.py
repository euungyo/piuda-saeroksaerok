from flask import Flask
from backend.photo.photo_routes import PhotoBlueprint
from backend.diary.diary_routes import diary_bp


app = Flask(__name__)

app.register_blueprint(PhotoBlueprint)
app.register_blueprint(diary_bp)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )