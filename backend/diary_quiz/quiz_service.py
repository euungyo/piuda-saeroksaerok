from backend.diary_quiz.quiz_model import get_random_question
from backend.exceptions import CustomException
from backend.error_code import ErrorCode
from datetime import datetime, time
from backend.db import db
from backend.photo.photo_service import unlock_today_photos

QuizResultCollection = db["quiz_results"]

from datetime import datetime, time
from backend.db import db

QuizResultCollection = db["quiz_results"]

def has_today_quiz_result(user_id, family_id):
    today_start = datetime.combine(datetime.utcnow().date(), time.min)
    today_end = datetime.combine(datetime.utcnow().date(), time.max)

    result = QuizResultCollection.find_one({
        "user_id": str(user_id),
        "family_id": str(family_id),
        "created_at": {
            "$gte": today_start,
            "$lte": today_end
        }
    })

    return result is not None

# 특정 유저의 오늘 퀴즈 결과를 조회합니다.
def get_today_quiz_result_service(user_id, family_id):
    if not user_id or not family_id:
        raise CustomException(ErrorCode.INVALID_REQUEST)

    today_start = datetime.combine(datetime.utcnow().date(), time.min)
    today_end = datetime.combine(datetime.utcnow().date(), time.max)

    result = QuizResultCollection.find_one(
        {
            "user_id": str(user_id),
            "family_id": str(family_id),
            "created_at": {"$gte": today_start, "$lte": today_end},
        },
        sort=[("created_at", -1)],
    )

    if not result:
        return {
            "Success": True,
            "Message": "오늘 퀴즈 결과가 없습니다.",
            "Data": {"solved": False},
        }, 200

    return {
        "Success": True,
        "Message": "오늘 퀴즈 결과를 불러왔습니다.",
        "Data": {
            "solved": True,
            "is_correct": result.get("is_correct"),
            "quiz_type": result.get("quiz_type"),
            "question": result.get("question"),
            "correct_answer": result.get("correct_answer"),
        },
    }, 200


def get_quiz_service(quiz_type=None):
    question = get_random_question(quiz_type)

    if not question:
        raise CustomException(ErrorCode.QUIZ_NOT_FOUND)

    return {"Success": True, "Message": "퀴즈 문제를 불러왔습니다.", "Data": question}, 200


def submit_quiz_service(user_id, family_id, quiz_id, quiz_type, question, answer, correct_answer):
    if not user_id or not family_id or not answer or not correct_answer:
        raise CustomException(ErrorCode.INVALID_REQUEST)

    is_correct = str(answer).strip() == str(correct_answer).strip()

    quiz_result = {
        "user_id": user_id,
        "family_id": family_id,
        "quiz_id": quiz_id,
        "quiz_type": quiz_type,
        "question": question,
        "answer": answer,
        "correct_answer": correct_answer,
        "is_correct": is_correct,
        "created_at": datetime.utcnow()
    }

    QuizResultCollection.insert_one(quiz_result)

    unlock_result = unlock_today_photos(family_id)

    return {
        "Success": True,
        "Message": "퀴즈 제출이 완료되어 오늘의 사진이 열렸습니다.",
        "Data": {
            "is_correct": is_correct,
            "photo_unlocked": True,
            "unlocked_count": unlock_result["unlocked_count"]
        }
    }, 200