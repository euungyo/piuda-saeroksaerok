from datetime import datetime, timedelta
from bson.errors import InvalidId
import json
import os
import uuid
from werkzeug.utils import secure_filename
from backend.exceptions import CustomException
from backend.error_code import ErrorCode
from backend.gemini import gemini_client

from backend.diary.diary_model import (
    insert_diary,
    find_all_diaries,
    find_diary_by_id,
    update_diary_by_id,
    delete_diary_by_id,
    insert_questions,
    count_questions,
    find_random_questions,
    find_question_by_id,
    insert_question_diary,
    find_all_question_diaries,
    find_question_diary_by_id,
    count_question_diaries_between,
    update_question_diary,
)

ALLOWED_MOODS = ["happy", "sad", "angry", "tired", "calm"]

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 이미지 파일 확장자 확인
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# 이미지 파일들을 uploads 폴더에 저장하고 URL 목록 반환
def save_uploaded_images(files):

    image_urls = []

    for file in files:
        if file and file.filename:
            if not allowed_file(file.filename):
                raise CustomException(ErrorCode.INVALID_IMAGE_EXTENSION)

            original_filename = secure_filename(file.filename)
            ext = original_filename.rsplit(".", 1)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}.{ext}"
            filepath = os.path.join(UPLOAD_FOLDER, unique_filename)

            file.save(filepath)
            image_urls.append(f"/uploads/{unique_filename}")

    return image_urls

# imageUrls에 저장된 이미지 파일들을 uploads 폴더에서 삭제
def delete_image_files(image_urls):
    for image_url in image_urls:
        filename = image_url.replace("/uploads/", "")
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        if os.path.exists(filepath):
            os.remove(filepath)

# MongoDB 문서를 프론트로 보낼 수 있는 JSON 형태로 변환
def serialize_diary(doc):
    return {
        "_id": str(doc["_id"]),
        "title": doc.get("title"),
        "content": doc.get("content"),
        "mood": doc.get("mood"),
        "imageUrls": doc.get("imageUrls", []),
        "createdAt": doc["createdAt"].isoformat(),
        "updatedAt": doc["updatedAt"].isoformat(),
    }

# 일기 기분 값 valid 검증
def validate_mood(mood):
    
    if mood not in ALLOWED_MOODS:
        raise CustomException(ErrorCode.INVALID_DIARY_MOOD)

# 일기 작성 처리: 값 검증(제목, 컨텐츠, 기분), 이미지 저장, DB 저장
def create_diary_service(form_data, files):

    title = form_data.get("title")
    if not title:
        raise CustomException(ErrorCode.DIARY_TITLE_REQUIRED)

    content = form_data.get("content")
    if not content:
        raise CustomException(ErrorCode.DIARY_CONTENT_REQUIRED)

    mood = form_data.get("mood")
    if not mood:
        raise CustomException(ErrorCode.DIARY_MOOD_REQUIRED)

    validate_mood(mood)

    image_urls = save_uploaded_images(files.getlist("images")) if "images" in files else []

    now = datetime.utcnow()

    doc = {
        "title": title,
        "content": content,
        "mood": mood,
        "imageUrls": image_urls,
        "createdAt": now,
        "updatedAt": now,
    }

    result = insert_diary(doc)

    response = {
        "_id": str(result.inserted_id),
        "title": title,
        "content": content,
        "mood": mood,
        "imageUrls": image_urls,
        "createdAt": now.isoformat(),
        "updatedAt": now.isoformat(),
    }

    return response, 201

# 전체 일기 목록 조회
def get_diaries_service():

    docs = find_all_diaries()
    return [serialize_diary(doc) for doc in docs], 200

# 일기 상세 조회
def get_diary_service(diary_id):
    try:
        doc = find_diary_by_id(diary_id)
    except InvalidId:
        raise CustomException(ErrorCode.INVALID_ID_FORMAT)

    if not doc:
        raise CustomException(ErrorCode.DIARY_NOT_FOUND)

    return serialize_diary(doc), 200

#  일기 수정 처리 - title/content/mood 수정 가능. images로 새 이미 추가 . deleteImageUrls로 삭제 가능
def update_diary_service(diary_id, form_data, files):
    
    try:
        existing_doc = find_diary_by_id(diary_id)
    except InvalidId:
        raise CustomException(ErrorCode.INVALID_ID_FORMAT)

    if not existing_doc:
        raise CustomException(ErrorCode.DIARY_NOT_FOUND)

    update_fields = {}

    if "title" in form_data:
        title = form_data.get("title")
        if not title:
            raise CustomException(ErrorCode.DIARY_TITLE_EMPTY)
        update_fields["title"] = title

    if "content" in form_data:
        content = form_data.get("content")
        if not content:
            raise CustomException(ErrorCode.DIARY_CONTENT_EMPTY)
        update_fields["content"] = content

    if "mood" in form_data:
        mood = form_data.get("mood")
        if not mood:
            raise CustomException(ErrorCode.DIARY_MOOD_EMPTY)
        validate_mood(mood)
        update_fields["mood"] = mood

    current_image_urls = existing_doc.get("imageUrls", [])

    delete_image_urls = form_data.getlist("deleteImageUrls")
    if delete_image_urls:
        current_image_urls = [
            url for url in current_image_urls
            if url not in delete_image_urls
        ]
        delete_image_files(delete_image_urls)

    new_image_urls = save_uploaded_images(files.getlist("images")) if "images" in files else []

    if delete_image_urls or new_image_urls:
        update_fields["imageUrls"] = current_image_urls + new_image_urls

    if not update_fields:
        raise CustomException(ErrorCode.NO_CHANGES)

    update_fields["updatedAt"] = datetime.utcnow()

    update_diary_by_id(diary_id, update_fields)

    updated_doc = find_diary_by_id(diary_id)
    return serialize_diary(updated_doc), 200

# 일기 삭제 - DB 삭제 전 이미지 파일 함께 삭제 
def delete_diary_service(diary_id):
    try:
        existing_doc = find_diary_by_id(diary_id)
    except InvalidId:
        raise CustomException(ErrorCode.INVALID_ID_FORMAT)

    if not existing_doc:
        raise CustomException(ErrorCode.DIARY_NOT_FOUND)

    image_urls = existing_doc.get("imageUrls", [])
    delete_image_files(image_urls)

    result = delete_diary_by_id(diary_id)

    if result.deleted_count == 0:
        raise CustomException(ErrorCode.DIARY_DELETE_FAILED)

    return {"message": "삭제완료"}, 200


# =========================================================
# 질문 기반 일기 작성 (오늘의 일기 작성 → 질문에 답하기)
# =========================================================

# 작성 화면에 한 번에 보여줄 기본 질문 개수 (UI상 1/3)
DEFAULT_QUESTION_COUNT = 3

# 일상적인 기본 질문들 (DB가 비어있을 때 시드로 삽입)
DEFAULT_QUESTIONS = [
    "오늘 점심은 무엇을 드셨나요?",
    "오늘 무슨 옷을 입으셨나요?",
    "오늘 아침에 일어나서 가장 먼저 한 일은 무엇인가요?",
    "오늘 가장 기억에 남는 순간은 언제였나요?",
    "오늘 누구와 함께 시간을 보내셨나요?",
    "오늘 드신 음식 중 가장 맛있었던 건 무엇인가요?",
    "오늘 날씨는 어땠나요?",
    "오늘 하루를 한 단어로 표현한다면 무엇인가요?",
    "오늘 가장 많이 웃었던 순간은 언제였나요?",
    "오늘 가장 오래 머물렀던 장소는 어디인가요?",
    "오늘 가장 자주 떠올린 생각은 무엇이었나요?",
    "오늘 나를 가장 기쁘게 만든 일은 무엇인가요?",
    "오늘 나를 가장 힘들게 만든 일은 무엇인가요?",
    "오늘 스스로에게 칭찬해주고 싶은 행동은 무엇인가요?",
    "오늘 들었던 말 중 가장 기억에 남는 말은 무엇인가요?",
    "오늘 가장 인상 깊게 본 장면이나 풍경은 무엇인가요?",
    "오늘 내가 누군가에게 도움을 준 적이 있나요?",
    "오늘 누군가에게 도움을 받은 적이 있나요?",
    "오늘 가장 집중했던 일은 무엇인가요?",
    "오늘 가장 아쉬웠던 순간은 언제였나요?",
    "오늘 가장 뿌듯했던 순간은 언제였나요?",
    "오늘 나의 기분을 색깔로 표현한다면 어떤 색인가요?",
    "오늘 나를 웃게 만든 사람이나 사건은 무엇인가요?",
    "오늘 나를 설레게 하거나 기대하게 만든 일이 있었나요?",
    "오늘 하루 중 가장 평온했던 순간은 언제였나요?",
    "오늘 잠들기 전에 꼭 기억하고 싶은 일은 무엇인가요?",
]


# 질문 문서를 프론트로 보낼 JSON 형태로 변환
def serialize_question(doc):
    return {
        "_id": str(doc["_id"]),
        "text": doc.get("text"),
    }


# 질문 일기 문서를 프론트로 보낼 JSON 형태로 변환 (조회용)
def serialize_question_diary(doc):
    return {
        "_id": str(doc["_id"]),
        "title": doc.get("title", ""),
        "content": doc.get("content", ""),
        "topics": doc.get("topics", []),
        "answers": doc.get("answers", []),
        "followups": doc.get("followups", []),
        "createdAt": doc["createdAt"].isoformat(),
        "updatedAt": doc["updatedAt"].isoformat(),
    }


# 기본 질문 시드: 질문이 하나도 없을 때만 삽입 (이미 있으면 건너뜀)
def seed_questions_service():
    if count_questions() > 0:
        return {"message": "이미 질문이 존재합니다.", "inserted": 0}, 200

    now = datetime.utcnow()
    docs = [{"text": text, "createdAt": now} for text in DEFAULT_QUESTIONS]
    result = insert_questions(docs)

    return {"message": "질문 시드 완료", "inserted": len(result.inserted_ids)}, 201


# 오늘의 질문 조회: 질문 풀에서 랜덤 N개
def get_daily_questions_service(count=DEFAULT_QUESTION_COUNT):
    if not count or count < 1:
        count = DEFAULT_QUESTION_COUNT

    if count_questions() == 0:
        raise CustomException(ErrorCode.NO_QUESTIONS_AVAILABLE)

    docs = find_random_questions(count)
    return [serialize_question(doc) for doc in docs], 200


# 질문 일기 작성: 답변들의 questionId 유효성/존재 + 답변 비어있는지 검증 후 저장
def create_question_diary_service(payload):
    payload = payload or {}
    answer_items = payload.get("answers")

    if not answer_items or not isinstance(answer_items, list):
        raise CustomException(ErrorCode.ANSWERS_REQUIRED)

    saved_answers = []

    for item in answer_items:
        item = item or {}
        question_id = item.get("questionId")
        answer_text = item.get("answer")

        if not question_id:
            raise CustomException(ErrorCode.INVALID_REQUEST)

        if not answer_text or not answer_text.strip():
            raise CustomException(ErrorCode.ANSWER_EMPTY)

        try:
            question_doc = find_question_by_id(question_id)
        except InvalidId:
            raise CustomException(ErrorCode.INVALID_ID_FORMAT)

        if not question_doc:
            raise CustomException(ErrorCode.QUESTION_NOT_FOUND)

        # 질문 텍스트를 함께 저장(비정규화)해 이후 질문이 바뀌어도 기록이 보존되도록 함
        saved_answers.append({
            "questionId": str(question_doc["_id"]),
            "question": question_doc.get("text"),
            "answer": answer_text.strip(),
        })

    now = datetime.utcnow()
    doc = {
        "answers": saved_answers,
        "createdAt": now,
        "updatedAt": now,
    }

    result = insert_question_diary(doc)

    response = {
        "_id": str(result.inserted_id),
        "answers": saved_answers,
        "createdAt": now.isoformat(),
        "updatedAt": now.isoformat(),
    }

    return response, 201


# 질문 일기 목록 조회 (일기 조회 화면용)
def get_question_diaries_service():
    docs = find_all_question_diaries()
    return [serialize_question_diary(doc) for doc in docs], 200


# 질문 일기 상세 조회
def get_question_diary_service(diary_id):
    try:
        doc = find_question_diary_by_id(diary_id)
    except InvalidId:
        raise CustomException(ErrorCode.INVALID_ID_FORMAT)

    if not doc:
        raise CustomException(ErrorCode.DIARY_NOT_FOUND)

    return serialize_question_diary(doc), 200


# 오늘(로컬 기준) 질문 일기를 작성했는지 여부 조회
def get_today_status_service():
    # createdAt 은 UTC(utcnow)로 저장되므로, 로컬 자정 구간을 UTC 로 변환해 조회한다.
    utc_now = datetime.utcnow()
    offset = datetime.now() - utc_now            # 로컬 타임존 보정 (KST ≈ +9h)

    today_local = (utc_now + offset).date()
    start_local = datetime(today_local.year, today_local.month, today_local.day)
    start_utc = start_local - offset
    end_utc = start_utc + timedelta(days=1)

    count = count_question_diaries_between(start_utc, end_utc)

    return {"written": count > 0, "count": count}, 200


# =========================================================
# AI 꼬리질문 (작성한 답변을 바탕으로 Gemini가 추가 질문 생성)
# =========================================================

# 대주제(질문)당 생성할 꼬리질문 개수 범위
FOLLOWUP_MIN = 2
FOLLOWUP_MAX = 3


# 작성된 답변들로 Gemini 프롬프트를 구성합니다.
def build_followup_prompt(answers):
    lines = []
    for index, answer in enumerate(answers, start=1):
        lines.append(
            f'{index}. (questionId: {answer["questionId"]}) '
            f'질문: {answer.get("question", "")} / 답변: {answer.get("answer", "")}'
        )
    diary_text = "\n".join(lines)

    return (
        "당신은 노인을 위한 일기 앱의 따뜻한 대화 도우미입니다.\n"
        "사용자가 아래 질문들에 답해 오늘의 일기를 작성했습니다.\n"
        f"각 질문(대주제)마다, 사용자의 답변 내용을 바탕으로 자연스럽고 구체적인 "
        f"꼬리질문을 {FOLLOWUP_MIN}~{FOLLOWUP_MAX}개씩 만들어 주세요.\n"
        "- 답변에 등장한 구체적 내용(음식/사람/장소 등)을 활용해 더 깊이 물어보세요.\n"
        "- 짧고 친근한 존댓말 한 문장으로 작성하세요.\n"
        f"- 답변이 비어있거나 의미를 알 수 없으면 그 주제에 대한 가벼운 일반 질문 {FOLLOWUP_MIN}개를 만들어 주세요.\n\n"
        f"[작성된 일기]\n{diary_text}\n\n"
        "반드시 아래 JSON 형식으로만 답하세요(다른 텍스트 금지):\n"
        '{"topics":[{"questionId":"<위 questionId 그대로>","followups":["질문1","질문2"]}]}'
    )


# 저장된 일기를 불러와 Gemini로 대주제별 꼬리질문을 생성합니다.
def generate_followups_service(diary_id):
    try:
        doc = find_question_diary_by_id(diary_id)
    except InvalidId:
        raise CustomException(ErrorCode.INVALID_ID_FORMAT)

    if not doc:
        raise CustomException(ErrorCode.DIARY_NOT_FOUND)

    answers = doc.get("answers", [])
    if not answers:
        raise CustomException(ErrorCode.ANSWERS_REQUIRED)

    prompt = build_followup_prompt(answers)

    try:
        raw = gemini_client.generate_json(prompt)
        topics_raw = json.loads(raw).get("topics", [])
    except Exception:
        # Gemini 키 미설정/네트워크/파싱 실패 등은 모두 동일한 사용자 메시지로 처리
        raise CustomException(ErrorCode.FOLLOWUP_GENERATION_FAILED)

    # questionId -> 원본 답변 매핑 (꼬리질문에 맥락을 붙여 돌려주기 위함)
    answer_by_id = {answer["questionId"]: answer for answer in answers}

    topics = []
    for topic in topics_raw:
        question_id = (topic or {}).get("questionId")
        base = answer_by_id.get(question_id)
        if not base:
            continue

        followups = [
            text.strip()
            for text in (topic.get("followups") or [])
            if isinstance(text, str) and text.strip()
        ][:FOLLOWUP_MAX]

        if not followups:
            continue

        topics.append({
            "questionId": question_id,
            "question": base.get("question", ""),
            "answer": base.get("answer", ""),
            "followups": followups,
        })

    if not topics:
        raise CustomException(ErrorCode.FOLLOWUP_GENERATION_FAILED)

    return {"diaryId": str(doc["_id"]), "topics": topics}, 200


# 사용자가 답한 꼬리질문 답변을 일기 문서에 저장합니다.
def save_followups_service(diary_id, payload):
    try:
        doc = find_question_diary_by_id(diary_id)
    except InvalidId:
        raise CustomException(ErrorCode.INVALID_ID_FORMAT)

    if not doc:
        raise CustomException(ErrorCode.DIARY_NOT_FOUND)

    payload = payload or {}
    topics = payload.get("followups")

    if not topics or not isinstance(topics, list):
        raise CustomException(ErrorCode.ANSWERS_REQUIRED)

    saved = []
    for topic in topics:
        topic = topic or {}
        question_id = topic.get("questionId")
        items = topic.get("items")

        if not question_id or not isinstance(items, list):
            continue

        clean_items = []
        for pair in items:
            pair = pair or {}
            question = pair.get("question")
            answer = pair.get("answer")

            if not question:
                continue

            clean_items.append({
                "question": question,
                "answer": (answer or "").strip(),
            })

        if clean_items:
            saved.append({"questionId": question_id, "items": clean_items})

    update_question_diary(str(doc["_id"]), {
        "followups": saved,
        "updatedAt": datetime.utcnow(),
    })

    updated = find_question_diary_by_id(str(doc["_id"]))
    return serialize_question_diary(updated), 200


# =========================================================
# AI 일기 작성 (답변 + 꼬리질문 답변을 엮어 하나의 일기로 완성)
# =========================================================

# 답변과 꼬리질문 답변으로 일기 작성 프롬프트를 구성합니다.
def build_compose_prompt(answers, followups):
    followups_by_id = {
        topic.get("questionId"): topic.get("items", [])
        for topic in (followups or [])
    }

    blocks = []
    for answer in answers:
        block = [f'■ 질문: {answer.get("question", "")} / 답변: {answer.get("answer", "")}']
        for item in followups_by_id.get(answer["questionId"], []):
            block.append(f'   ↳ {item.get("question", "")} / {item.get("answer", "")}')
        blocks.append("\n".join(block))

    diary_source = "\n".join(blocks)

    return (
        "당신은 노인을 위한 따뜻한 일기 작가입니다.\n"
        "사용자가 오늘 아래 질문들에 답했습니다(기본 질문과, 그에 대한 AI 꼬리질문 답변 포함).\n"
        "이 답변들을 자연스럽게 엮어, 사용자가 직접 쓴 것 같은 1인칭 시점의 따뜻한 하루 일기를 작성해 주세요.\n\n"
        "[규칙]\n"
        "- title: 하루를 잘 담은 짧고 정겨운 제목 (12자 이내)\n"
        "- content: 3~5문장의 1인칭 일기. 답변에 없는 사실은 지어내지 말고, 답변 내용만 자연스럽게 풀어 써주세요. 따뜻하고 편안한 말투로.\n"
        "- topics: 이 일기의 대주제를 나타내는 짧은 키워드 2~5개 (예: \"점심\", \"산책\")\n\n"
        f"[오늘의 답변]\n{diary_source}\n\n"
        "반드시 아래 JSON 형식으로만 답하세요(다른 텍스트 금지):\n"
        '{"title":"...","content":"...","topics":["...","..."]}'
    )


# 저장된 답변/꼬리질문을 바탕으로 AI가 일기를 완성해 저장합니다.
def compose_diary_service(diary_id):
    try:
        doc = find_question_diary_by_id(diary_id)
    except InvalidId:
        raise CustomException(ErrorCode.INVALID_ID_FORMAT)

    if not doc:
        raise CustomException(ErrorCode.DIARY_NOT_FOUND)

    answers = doc.get("answers", [])
    if not answers:
        raise CustomException(ErrorCode.ANSWERS_REQUIRED)

    prompt = build_compose_prompt(answers, doc.get("followups", []))

    try:
        data = json.loads(gemini_client.generate_json(prompt))
    except Exception:
        raise CustomException(ErrorCode.DIARY_COMPOSE_FAILED)

    title = (data.get("title") or "오늘의 일기").strip()
    content = (data.get("content") or "").strip()
    topics = [
        topic.strip()
        for topic in (data.get("topics") or [])
        if isinstance(topic, str) and topic.strip()
    ][:5]

    if not content:
        raise CustomException(ErrorCode.DIARY_COMPOSE_FAILED)

    update_question_diary(str(doc["_id"]), {
        "title": title,
        "content": content,
        "topics": topics,
        "updatedAt": datetime.utcnow(),
    })

    updated = find_question_diary_by_id(str(doc["_id"]))
    return serialize_question_diary(updated), 200