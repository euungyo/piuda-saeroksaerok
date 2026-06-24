from datetime import datetime
from bson import ObjectId

from backend.db import db
from backend.exceptions import CustomException
from backend.error_code import ErrorCode
from backend.photo.photo_model import (
    create_photo_document,
    photo_to_response
)

PhotoCollection = db["photos"]


def create_photo(user_id, family_id, image_url, content=None):
    if not user_id:
        raise CustomException(ErrorCode.INVALID_REQUEST)

    if not family_id:
        raise CustomException(ErrorCode.INVALID_REQUEST)

    if not image_url:
        raise CustomException(ErrorCode.PHOTO_IMAGE_REQUIRED)

    photo = create_photo_document(
        user_id=user_id,
        family_id=family_id,
        image_url=image_url,
        content=content
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

    result = PhotoCollection.delete_one(
        {"_id": ObjectId(photo_id)}
    )

    if result.deleted_count == 0:
        raise CustomException(ErrorCode.PHOTO_NOT_FOUND)

    return {
        "photo_id": photo_id
    }