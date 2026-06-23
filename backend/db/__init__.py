from backend.config import MONGO_DB_NAME
from backend.db import mongo


# diary 코드 호환용: `from backend.db import db`
# 통합 클라이언트(backend.db.mongo)를 공유하고, DB명은 .env의 MONGO_DB_NAME 사용.
db = mongo.get_client()[MONGO_DB_NAME]
