from flask import Blueprint, request, jsonify

from backend.photo.photo_service import (
    create_photo,
    get_photos_by_family,
    get_available_photos_by_family,
    get_photo_by_id,
    unlock_photo,
    delete_photo
)

photo_bp = Blueprint(
    "photo",
    __name__,
    url_prefix="/api/photos"
)


@photo_bp.route("", methods=["POST"])
def create_photo_route():
    data = request.get_json()

    photo = create_photo(
        user_id=data.get("user_id"),
        family_id=data.get("family_id"),
        image_url=data.get("image_url"),
        content=data.get("content")
    )

    return jsonify({
        "success": True,
        "message": "사진이 등록되었습니다.",
        "data": photo
    }), 201


@photo_bp.route("/family/<family_id>", methods=["GET"])
def get_photos_by_family_route(family_id):
    photos = get_photos_by_family(family_id)

    return jsonify({
        "success": True,
        "message": "사진 목록 조회 성공",
        "data": photos
    }), 200


@photo_bp.route("/family/<family_id>/available", methods=["GET"])
def get_available_photos_by_family_route(family_id):
    photos = get_available_photos_by_family(family_id)

    return jsonify({
        "success": True,
        "message": "열람 가능한 사진 조회 성공",
        "data": photos
    }), 200


@photo_bp.route("/<photo_id>", methods=["GET"])
def get_photo_by_id_route(photo_id):
    photo = get_photo_by_id(photo_id)

    return jsonify({
        "success": True,
        "message": "사진 조회 성공",
        "data": photo
    }), 200


@photo_bp.route("/<photo_id>/unlock", methods=["PATCH"])
def unlock_photo_route(photo_id):
    photo = unlock_photo(photo_id)

    return jsonify({
        "success": True,
        "message": "사진 열람 가능 처리 완료",
        "data": photo
    }), 200


@photo_bp.route("/<photo_id>", methods=["DELETE"])
def delete_photo_route(photo_id):
    result = delete_photo(photo_id)

    return jsonify({
        "success": True,
        "message": "사진 삭제 성공",
        "data": result
    }), 200