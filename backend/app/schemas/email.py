from pydantic import BaseModel
from typing import Optional

class EmailRequest(BaseModel):
    thread_content: str
    instruction: Optional[str] = None
    email_id: str

class EmailResponse(BaseModel):
    content: str
    request_id: str

class EmailSummaryRequest(EmailRequest):
    pass

class EmailDraftRequest(EmailRequest):
    pass

class LLMResponse(BaseModel):
    text: str
    token_usage: int
    model_name: str 