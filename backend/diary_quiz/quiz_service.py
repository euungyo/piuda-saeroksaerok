from backend.diary_quiz.quiz_model import get_random_question
from backend.exceptions import CustomException
from backend.error_code import ErrorCode


def get_quiz_service(quiz_type=None):
    question = get_random_question(quiz_type)

    if not question:
        raise CustomException(ErrorCode.QUIZ_NOT_FOUND)

    return {"Success": True, "Message": "퀴즈 문제를 불러왔습니다.", "Data": question}, 200
