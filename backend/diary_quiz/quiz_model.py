import json
import random
import os

_DATA_PATH = os.path.join(os.path.dirname(__file__), "quiz_data.json")

_quiz_data = None


def _load():
    global _quiz_data
    if _quiz_data is None:
        with open(_DATA_PATH, encoding="utf-8") as f:
            _quiz_data = json.load(f)
    return _quiz_data


def get_random_question(quiz_type=None):
    data = _load()

    if quiz_type and quiz_type in data:
        pool = data[quiz_type]
    else:
        pool = []
        for questions in data.values():
            pool.extend(questions)

    return random.choice(pool) if pool else None
