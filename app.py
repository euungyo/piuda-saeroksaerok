from flask import Flask
from backend.photo.photo_routes import PhotoBlueprint


app = Flask(__name__)

app.register_blueprint(PhotoBlueprint)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )