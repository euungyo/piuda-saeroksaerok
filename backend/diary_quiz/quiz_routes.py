from flask import Blueprint, request, jsonify

from backend import db
from backend.gemini import gemini_client
from backend.diary_quiz.quiz_service import get_quiz_service, submit_quiz_service, get_today_quiz_result_service

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


# 퀴즈 문제 랜덤 1개 조회
# query param: type=consonant|general|opposite|blank (생략 시 전체에서 랜덤)
@QuizBlueprint.route("/question", methods=["GET"])
def get_quiz():
    quiz_type = request.args.get("type", None)
    response, status_code = get_quiz_service(quiz_type)
    return jsonify(response), status_code

# 오늘 퀴즈 결과 조회 (가족 유저용)
# query param: user_id, family_id
@QuizBlueprint.route("/result", methods=["GET"])
def GetTodayQuizResult():
    user_id = request.args.get("user_id")
    family_id = request.args.get("family_id")
    response, status_code = get_today_quiz_result_service(user_id, family_id)
    return jsonify(response), status_code


# 퀴즈 제출
@QuizBlueprint.route("/submit", methods=["POST"])
def SubmitQuiz():
    data = request.get_json()

    response, status_code = submit_quiz_service(
        user_id=data.get("user_id"),
        family_id=data.get("family_id"),
        quiz_id=data.get("quiz_id"),
        quiz_type=data.get("quiz_type"),
        question=data.get("question"),
        answer=data.get("answer"),
        correct_answer=data.get("correct_answer")
    )

    return jsonify(response), status_code