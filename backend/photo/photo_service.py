from datetime import datetime
from bson import ObjectId

import os
import uuid
from werkzeug.utils import secure_filename

from backend.db import db
from backend.exceptions import CustomException
from backend.error_code import ErrorCode
from backend.photo.photo_model import (
    create_photo_document,
    photo_to_response
)
from datetime import datetime

PhotoCollection = db["photos"]

UPLOAD_FOLDER = "backend/uploads"


def create_photo(user_id, family_id, image, content=None):
    if not user_id:
        raise CustomException(ErrorCode.INVALID_REQUEST)

    if not family_id:
        raise CustomException(ErrorCode.INVALID_REQUEST)

    if not image:
        raise CustomException(ErrorCode.PHOTO_IMAGE_REQUIRED)

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    original_filename = secure_filename(image.filename)

    if not original_filename:
        raise CustomException(ErrorCode.PHOTO_IMAGE_REQUIRED)

    extension = os.path.splitext(original_filename)[1]
    stored_filename = f"{uuid.uuid4()}{extension}"

    save_path = os.path.join(UPLOAD_FOLDER, stored_filename)
    image.save(save_path)

    image_url = f"/uploads/{stored_filename}"

    photo = create_photo_document(
        user_id=user_id,
        family_id=family_id,
        image_url=image_url,
        content=content,
        original_filename=original_filename,
        stored_filename=stored_filename
    )

    result = PhotoCollection.insert_one(photo)
    photo["_id"] = result.inserted_id

    return photo_to_response(photo)


def get_photos_by_family(family_id):
    photos = PhotoCollection.find(
        {"family_id": family_id}
    ).sort("created_at", -1)

    return [photo_to_response(photo) for photo in photos]


def get_available_photos_by_family(family_id):
    photos = PhotoCollection.find(
        {
            "family_id": family_id,
            "is_available": True
        }
    ).sort("created_at", -1)

    return [photo_to_response(photo) for photo in photos]


def get_photo_by_id(photo_id):
    if not ObjectId.is_valid(photo_id):
        raise CustomException(ErrorCode.INVALID_ID_FORMAT)

    photo = PhotoCollection.find_one(
        {"_id": ObjectId(photo_id)}
    )

    if not photo:
        raise CustomException(ErrorCode.PHOTO_NOT_FOUND)

    return photo_to_response(photo)


def unlock_photo(photo_id):
    if not ObjectId.is_valid(photo_id):
        raise CustomException(ErrorCode.INVALID_ID_FORMAT)

    result = PhotoCollection.update_one(
        {"_id": ObjectId(photo_id)},
        {
            "$set": {
                "is_available": True,
                "updated_at": datetime.utcnow()
            }
        }
    )

    if result.matched_count == 0:
        raise CustomException(ErrorCode.PHOTO_NOT_FOUND)

    photo = PhotoCollection.find_one(
        {"_id": ObjectId(photo_id)}
    )

    return photo_to_response(photo)


def delete_photo(photo_id):
    if not ObjectId.is_valid(photo_id):
        raise CustomException(ErrorCode.INVALID_ID_FORMAT)

    photo = PhotoCollection.find_one(
        {"_id": ObjectId(photo_id)}
    )

    if not photo:
        raise CustomException(ErrorCode.PHOTO_NOT_FOUND)

    stored_filename = photo.get("stored_filename")

    if stored_filename:
        file_path = os.path.join(UPLOAD_FOLDER, stored_filename)

        if os.path.exists(file_path):
            os.remove(file_path)

    result = PhotoCollection.delete_one(
        {"_id": ObjectId(photo_id)}
    )

    if result.deleted_count == 0:
        raise CustomException(ErrorCode.PHOTO_NOT_FOUND)

    return {
        "photo_id": photo_id
    }

def unlock_today_photos(family_id):
    if not family_id:
        raise CustomException(ErrorCode.INVALID_REQUEST)

    today_start = datetime.combine(datetime.utcnow().date(), time.min)
    today_end = datetime.combine(datetime.utcnow().date(), time.max)

    result = PhotoCollection.update_many(
        {
            "family_id": family_id,
            "created_at": {
                "$gte": today_start,
                "$lte": today_end
            }
        },
        {
            "$set": {
                "is_available": True,
                "updated_at": datetime.utcnow()
            }
        }
    )

    return {
        "unlocked_count": result.modified_count
    }