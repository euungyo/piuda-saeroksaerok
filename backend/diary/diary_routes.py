from flask import Blueprint, request, jsonify

from backend.diary.diary_service import (
    create_diary_service,
    get_diaries_service,
    get_diary_service,
    update_diary_service,
    delete_diary_service,
)

diary_bp = Blueprint("diary", __name__)


# 일기 작성 API

@diary_bp.route("/api/diary", methods=["POST"])
def create_diary():
    form_data = request.form or {}
    files = request.files

    response, status_code = create_diary_service(form_data, files)

    return jsonify(response), status_code


# 일기 목록 조회 API

@diary_bp.route("/api/diary", methods=["GET"])
def get_diaries():
    response, status_code = get_diaries_service()

    return jsonify(response), status_code


# 일기 상세 조회 API

@diary_bp.route("/api/diary/<diary_id>", methods=["GET"])
def get_diary(diary_id):
    response, status_code = get_diary_service(diary_id)

    return jsonify(response), status_code


# 일기 수정 API

@diary_bp.route("/api/diary/<diary_id>", methods=["PATCH"])
def update_diary(diary_id):
    form_data = request.form or {}
    files = request.files

    response, status_code = update_diary_service(diary_id, form_data, files)

    return jsonify(response), status_code


# 일기 삭제 API

@diary_bp.route("/api/diary/<diary_id>", methods=["DELETE"])
def delete_diary(diary_id):
    response, status_code = delete_diary_service(diary_id)

    return jsonify(response), status_code