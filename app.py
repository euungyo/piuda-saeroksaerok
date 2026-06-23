from flask import Flask
from backend.error_handler import register_error_handlers
from backend.photo.photo_routes import PhotoBlueprint
from backend.diary.diary_routes import diary_bp


app = Flask(__name__)

register_error_handlers(app)

app.register_blueprint(PhotoBlueprint)
app.register_blueprint(diary_bp)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )