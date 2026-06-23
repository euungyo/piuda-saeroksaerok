from datetime import datetime
from bson.errors import InvalidId
import os
import uuid
from werkzeug.utils import secure_filename
from backend.exceptions import CustomException
from backend.error_code import ErrorCode

from backend.diary.diary_model import (
    insert_diary,
    find_all_diaries,
    find_diary_by_id,
    update_diary_by_id,
    delete_diary_by_id,
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