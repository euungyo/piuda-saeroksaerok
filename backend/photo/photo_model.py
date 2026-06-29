from datetime import datetime


def create_photo_document(
    user_id,
    family_id,
    image_url,
    content=None,
    original_filename=None,
    stored_filename=None,
):
    now = datetime.utcnow()

    return {
        "user_id": user_id,
        "family_id": family_id,
        "image_url": image_url,
        "original_filename": original_filename,
        "stored_filename": stored_filename,
        "content": content,
        "is_available": False,
        "available_after_quiz": True,
        "created_at": now,
        "updated_at": now,
    }


def photo_to_response(photo):
    return {
        "photo_id": str(photo["_id"]),
        "user_id": photo.get("user_id"),
        "family_id": photo.get("family_id"),
        "image_url": photo.get("image_url"),
        "original_filename": photo.get("original_filename"),
        "stored_filename": photo.get("stored_filename"),
        "content": photo.get("content"),
        "is_available": photo.get("is_available", False),
        "available_after_quiz": photo.get("available_after_quiz", True),
        "created_at": photo.get("created_at"),
        "updated_at": photo.get("updated_at"),
    }