# Motor is an async Python driver for MongoDB that works with asyncio
# It's built on top of PyMongo but provides async/await support
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings

# Get application settings (MongoDB URL, database name, etc.)
settings = get_settings()

# Global MongoDB client instance
# Using a global client is a common pattern in FastAPI applications
# as it allows reuse of the connection across requests
client = None

async def connect_to_mongo():
    """
    Establishes connection to MongoDB using Motor's async client.
    This function should be called during application startup.
    
    Returns:
        AsyncIOMotorDatabase: The database instance
    """
    global client
    # Create an async MongoDB client
    # Motor handles connection pooling and async operations automatically
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    # Return the specific database instance
    return client[settings.DATABASE_NAME]

async def close_mongo_connection():
    """
    Closes the MongoDB connection.
    This function should be called during application shutdown.
    """
    if client:
        # Properly close the client connection
        client.close()

async def get_database():
    """
    Dependency function to get the database instance.
    Used by FastAPI's dependency injection system to provide database access to routes.
    
    Returns:
        AsyncIOMotorDatabase: The database instance for performing async operations
    """
    return client[settings.DATABASE_NAME] 