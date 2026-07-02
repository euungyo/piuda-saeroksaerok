from backend.diary_quiz.quiz_model import get_random_question
from backend.exceptions import CustomException
from backend.error_code import ErrorCode
from datetime import datetime
from backend.db import db
from backend.photo.photo_service import unlock_today_photos

QuizResultCollection = db["quiz_results"]

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