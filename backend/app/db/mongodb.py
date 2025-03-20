from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings

settings = get_settings()

client = None

async def connect_to_mongo():
    global client
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    return client[settings.DATABASE_NAME]

async def close_mongo_connection():
    if client:
        client.close()

async def get_database():
    return client[settings.DATABASE_NAME] 