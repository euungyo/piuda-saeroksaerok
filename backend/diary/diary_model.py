from bson import ObjectId
from backend.db import db

diaries = db.diaries


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