from flask import Flask
from flask_cors import CORS
from backend.error_handler import register_error_handlers
from backend.photo.photo_routes import PhotoBlueprint
from backend.diary_quiz.quiz_routes import QuizBlueprint
from backend.diary.diary_routes import diary_bp


app = Flask(__name__)
CORS(app)
register_error_handlers(app)

app.register_blueprint(PhotoBlueprint)
app.register_blueprint(diary_bp)
app.register_blueprint(QuizBlueprint)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )