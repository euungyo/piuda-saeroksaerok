from flask import Blueprint

from backend import db
from backend.gemini import gemini_client


QuizBlueprint = Blueprint(
    "Quiz",
    __name__,
    url_prefix="/api/quiz"
)


@QuizBlueprint.route("/health", methods=["GET"])
def QuizHealth():
    """Connection check for the quiz stack (MongoDB + Gemini)."""
    status = {"mongo": False, "gemini": False}
    errors = {}

    try:
        db.ping()
        status["mongo"] = True
    except Exception as error:
        errors["mongo"] = str(error)

    try:
        gemini_client.ping()
        status["gemini"] = True
    except Exception as error:
        errors["gemini"] = str(error)

    ok = all(status.values())

    return {
        "Success": ok,
        "Message": "All connections healthy" if ok else "Some connections failed",
        "Data": {"status": status, "errors": errors}
    }, (200 if ok else 503)


# 연상 퀴즈 생성 로직은 팀원이 푸쉬하면 이어서 구현 예정.
# DB 접근: backend.db.get_db()  또는  from backend.db import db
# Gemini 호출: backend.gemini.gemini_client.generate(...)
