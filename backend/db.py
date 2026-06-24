from pymongo import MongoClient

from backend.config import MONGO_URI, MONGO_DB_NAME


_client = None


def get_client():
    """Return a shared MongoClient (lazy singleton)."""
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    return _client


def get_db():
    """Return the project database handle. Use this in feature code."""
    return get_client()[MONGO_DB_NAME]


def ping():
    """Verify MongoDB is reachable. Raises if it is not."""
    get_client().admin.command("ping")


# diary 코드 호환용: `from backend.db import db`
db = get_db()
