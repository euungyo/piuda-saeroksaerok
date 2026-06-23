from flask import Flask
from flask_cors import CORS
from backend.photo.photo_routes import PhotoBlueprint
from backend.quiz.quiz_routes import QuizBlueprint


app = Flask(__name__)
CORS(app)

app.register_blueprint(PhotoBlueprint)
app.register_blueprint(QuizBlueprint)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )