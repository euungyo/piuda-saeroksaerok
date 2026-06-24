from datetime import datetime


def create_photo_document(user_id, family_id, image_url, content=None):
    now = datetime.utcnow()

    return {
        "user_id": user_id,  
        "family_id": family_id,               # 가족 그룹
        "image_url": image_url,
        "content": content,

        "is_available": False,              # 기본값: 고령 사용자 열람 불가
        "available_after_quiz": True,        # 퀴즈 푼 뒤 열람 가능

        "created_at": now,
        "updated_at": now
    }


def photo_to_response(photo):
    return {
        "photo_id": str(photo["_id"]),
        "user_id": photo.get("user_id"),
        "family_id": photo.get("family_id"),
        "image_url": photo.get("image_url"),
        "content": photo.get("content"),
        "is_available": photo.get("is_available", False),
        "available_after_quiz": photo.get("available_after_quiz", True),
        "created_at": photo.get("created_at"),
        "updated_at": photo.get("updated_at")
    }