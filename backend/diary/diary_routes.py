from flask import Blueprint, request, jsonify

from backend.diary.diary_service import (
    create_diary_service,
    get_diaries_service,
    get_diary_service,
    update_diary_service,
    delete_diary_service,
    seed_questions_service,
    get_daily_questions_service,
    create_question_diary_service,
    get_question_diaries_service,
    get_question_diary_service,
    get_today_status_service,
    generate_followups_service,
    save_followups_service,
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


# ===== 질문 기반 일기 작성 (오늘의 일기 작성) =====
# 주의: 아래 정적 경로(questions/answers)는 /api/diary/<diary_id> 보다
#       Flask 라우팅 우선순위가 높아 서로 충돌하지 않음.

# 오늘의 질문 조회 API (작성 화면 진입 시 랜덤 질문 받기)

@diary_bp.route("/api/diary/questions", methods=["GET"])
def get_daily_questions():
    count = request.args.get("count", default=3, type=int)

    response, status_code = get_daily_questions_service(count)

    return jsonify(response), status_code


# 기본 질문 시드 API (최초 1회 셋업용)

@diary_bp.route("/api/diary/questions/seed", methods=["POST"])
def seed_questions():
    response, status_code = seed_questions_service()

    return jsonify(response), status_code


# 질문 일기 작성 API (질문에 답변 → 일기 저장)

@diary_bp.route("/api/diary/answers", methods=["POST"])
def create_question_diary():
    payload = request.get_json(silent=True)

    response, status_code = create_question_diary_service(payload)

    return jsonify(response), status_code


# 질문 일기 목록 조회 API (일기 조회 화면용)

@diary_bp.route("/api/diary/answers", methods=["GET"])
def get_question_diaries():
    response, status_code = get_question_diaries_service()

    return jsonify(response), status_code


# 질문 일기 상세 조회 API

@diary_bp.route("/api/diary/answers/<diary_id>", methods=["GET"])
def get_question_diary(diary_id):
    response, status_code = get_question_diary_service(diary_id)

    return jsonify(response), status_code


# 오늘 일기 작성 여부 조회 API (일기 탭 진입 시 완료 알림용)

@diary_bp.route("/api/diary/today", methods=["GET"])
def get_today_status():
    response, status_code = get_today_status_service()

    return jsonify(response), status_code


# AI 꼬리질문 생성 API (저장된 일기 답변을 바탕으로 Gemini가 추가 질문 생성)

@diary_bp.route("/api/diary/answers/<diary_id>/followups", methods=["GET"])
def get_followups(diary_id):
    response, status_code = generate_followups_service(diary_id)

    return jsonify(response), status_code


# AI 꼬리질문 답변 저장 API

@diary_bp.route("/api/diary/answers/<diary_id>/followups", methods=["POST"])
def save_followups(diary_id):
    payload = request.get_json(silent=True)

    response, status_code = save_followups_service(diary_id, payload)

    return jsonify(response), status_code