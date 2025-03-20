from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId

class RequestLog(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_type: str  # 'summarize' or 'draft_reply'
    email_id: str
    content_length: int
    instruction: Optional[str] = None
    status: str = "pending"  # pending, completed, error
    error_message: Optional[str] = None
    completion_time: Optional[datetime] = None
    token_usage: Optional[int] = None 