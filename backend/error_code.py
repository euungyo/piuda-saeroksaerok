from enum import Enum


class ErrorCode(Enum):
    # 공통 에러
    INVALID_REQUEST = (400, "잘못된 요청입니다.")
    INVALID_ID_FORMAT = (400, "잘못된 id 형식입니다.")
    INTERNAL_SERVER_ERROR = (500, "서버 내부 오류가 발생했습니다.")

    # Diary 에러
    DIARY_NOT_FOUND = (404, "해당하는 diary를 찾을 수 없습니다.")
    DIARY_TITLE_REQUIRED = (400, "제목이 필요합니다.")
    DIARY_CONTENT_REQUIRED = (400, "내용이 필요합니다.")
    DIARY_MOOD_REQUIRED = (400, "기분 선택이 필요합니다.")
    DIARY_TITLE_EMPTY = (400, "제목이 비어있습니다.")
    DIARY_CONTENT_EMPTY = (400, "내용이 비어있습니다.")
    DIARY_MOOD_EMPTY = (400, "기분 값이 비어있습니다.")
    INVALID_DIARY_MOOD = (400, "올바르지 않은 기분 값입니다.")
    INVALID_IMAGE_EXTENSION = (400, "허용되지 않는 파일 형식입니다.")
    NO_CHANGES = (400, "변경된 사항이 없습니다.")
    DIARY_DELETE_FAILED = (500, "삭제에 실패했습니다.")

    # Question 에러
    NO_QUESTIONS_AVAILABLE = (404, "등록된 질문이 없습니다.")
    QUESTION_NOT_FOUND = (404, "해당하는 질문을 찾을 수 없습니다.")
    ANSWERS_REQUIRED = (400, "답변이 필요합니다.")
    ANSWER_EMPTY = (400, "답변 내용이 비어있습니다.")

    # AI 꼬리질문 에러
    FOLLOWUP_GENERATION_FAILED = (502, "AI 꼬리질문 생성에 실패했어요. 잠시 후 다시 시도해주세요.")
    DIARY_COMPOSE_FAILED = (502, "AI 일기 작성에 실패했어요. 잠시 후 다시 시도해주세요.")

    def __init__(self, status, message):
        self.status = status
        self.message = message

    # Photo 에러
    PHOTO_NOT_FOUND = (404, "해당하는 사진을 찾을 수 없습니다.")
    PHOTO_IMAGE_REQUIRED = (400, "사진 이미지가 필요합니다.")