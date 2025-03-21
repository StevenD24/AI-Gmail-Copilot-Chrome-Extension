from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    MONGODB_URL: str
    DATABASE_NAME: str
    OPENAI_API_KEY: str
    MODEL_NAME: str
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings() 