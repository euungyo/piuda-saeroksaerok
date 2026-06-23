from bson import ObjectId
from backend.db import db

diaries = db.diaries
questions = db.questions            # 일상 질문 풀
question_diaries = db.question_diaries   # 질문에 답해 작성한 일기


def insert_diary(doc):
    return diaries.insert_one(doc)


def find_all_diaries():
    return list(
        diaries.find().sort("createdAt", -1)
    )


def find_diary_by_id(diary_id):
    return diaries.find_one({
        "_id": ObjectId(diary_id)
    })


def update_diary_by_id(diary_id, update_fields):
    return diaries.update_one(
        {"_id": ObjectId(diary_id)},
        {"$set": update_fields}
    )


def delete_diary_by_id(diary_id):
    return diaries.delete_one({
        "_id": ObjectId(diary_id)
    })


# --- 질문(questions) 풀 ---

# 기본 질문 일괄 삽입 (시드용)
def insert_questions(docs):
    return questions.insert_many(docs)


# 등록된 질문 개수
def count_questions():
    return questions.count_documents({})


# 질문 풀에서 랜덤 N개 추출
def find_random_questions(count):
    return list(
        questions.aggregate([
            {"$sample": {"size": count}}
        ])
    )


# id로 질문 단건 조회
def find_question_by_id(question_id):
    return questions.find_one({
        "_id": ObjectId(question_id)
    })


# --- 질문 일기(question_diaries) ---

# 질문에 답해 작성한 일기 저장
def insert_question_diary(doc):
    return question_diaries.insert_one(doc)


# 질문 일기 목록 조회 (최신순)
def find_all_question_diaries():
    return list(
        question_diaries.find().sort("createdAt", -1)
    )


# id로 질문 일기 단건 조회
def find_question_diary_by_id(diary_id):
    return question_diaries.find_one({
        "_id": ObjectId(diary_id)
    })


# 특정 기간(start <= createdAt < end)에 작성된 질문 일기 개수
def count_question_diaries_between(start, end):
    return question_diaries.count_documents({
        "createdAt": {"$gte": start, "$lt": end}
    })