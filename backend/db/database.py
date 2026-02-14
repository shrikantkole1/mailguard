from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, Any, Dict, List
import os
import json
import logging
from bson import ObjectId
import asyncio

# Initialize logger
logger = logging.getLogger("email_threat_triage")

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "mailguard")
JSON_DB_PATH = os.path.join(os.getcwd(), "backend", "db", "local_db.json")

class SimpleJsonCollection:
    """Mock MongoDB Collection using JSON file storage"""
    def __init__(self, db, name):
        self.db = db
        self.name = name

    def _get_data(self) -> List[Dict]:
        return self.db._load().get(self.name, [])

    def _save_data(self, data: List[Dict]):
        full_db = self.db._load()
        full_db[self.name] = data
        self.db._save(full_db)

    async def find_one(self, query: Dict) -> Optional[Dict]:
        data = self._get_data()
        for item in data:
            match = True
            for k, v in query.items():
                # Handle ObjectId comparison
                if k == "_id" and isinstance(v, str):
                    v = ObjectId(v)
                
                # Check for item existence and value equality
                item_val = item.get(k)
                
                # Special handling for _id which is stored as str but queried as ObjectId
                if k == "_id":
                    if str(item_val) != str(v):
                        match = False; break
                elif item_val != v:
                    match = False; break
            
            if match:
                # Return deep copy to prevent mutation issues, simulate DB
                # Convert _id to ObjectId for compatibility
                res = item.copy()
                if "_id" in res:
                    res["_id"] = ObjectId(res["_id"])
                return res
        return None

    async def insert_one(self, document: Dict):
        data = self._get_data()
        if "_id" not in document:
            document["_id"] = str(ObjectId())
        elif isinstance(document["_id"], ObjectId):
            document["_id"] = str(document["_id"])
            
        data.append(document)
        self._save_data(data)
        
        class InsertResult:
            inserted_id = ObjectId(document["_id"])
        return InsertResult()

    async def update_one(self, query: Dict, update: Dict):
        data = self._get_data()
        updated_count = 0
        
        for item in data:
            match = True
            for k, v in query.items():
                # Simple query matching
                val = item.get(k)
                if k == "_id":
                    if str(val) != str(v): match = False; break
                elif val != v: match = False; break
            
            if match:
                # Apply updates
                if "$set" in update:
                    for uk, uv in update["$set"].items():
                        item[uk] = uv
                updated_count += 1
                break # update_one only updates first match
                
        if updated_count > 0:
            self._save_data(data)
            
        return

class SimpleJsonDB:
    """Mock MongoDB Database"""
    def __init__(self):
        self._ensure_db_file()
    
    def _ensure_db_file(self):
        if not os.path.exists(JSON_DB_PATH):
            os.makedirs(os.path.dirname(JSON_DB_PATH), exist_ok=True)
            with open(JSON_DB_PATH, 'w') as f:
                json.dump({}, f)

    def _load(self) -> Dict:
        try:
            with open(JSON_DB_PATH, 'r') as f:
                # Handle empty files
                content = f.read()
                if not content: return {}
                return json.loads(content)
        except json.JSONDecodeError:
            return {}

    def _save(self, data: Dict):
        with open(JSON_DB_PATH, 'w') as f:
            json.dump(data, f, indent=2, default=str)

    def __getitem__(self, name):
        return SimpleJsonCollection(self, name)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db = None

    async def connect(self):
        """Establish connection to MongoDB or fall back to JSON"""
        try:
            # Short timeout for local dev/demo
            self.client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=2000)
            # Verify connection
            await self.client.admin.command('ping')
            self.db = self.client[DB_NAME]
            logger.info("Connected to MongoDB")
        except Exception as e:
            logger.warning(f"MongoDB not available ({e}). Falling back to local JSON file storage: {JSON_DB_PATH}")
            self.client = None
            self.db = SimpleJsonDB()

    async def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            logger.info("Closed MongoDB connection")

db = Database()

async def get_database():
    """Dependency to get database instance"""
    return db.db
