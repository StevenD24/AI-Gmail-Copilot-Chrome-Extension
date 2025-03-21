from fastapi import APIRouter, HTTPException, Depends
from app.schemas.email import EmailRequest, EmailResponse
from app.services.llm import summarize_thread, draft_reply
from app.models.request_log import RequestLog
from app.db.mongodb import get_database
from datetime import datetime

router = APIRouter()

@router.post("/summarize", response_model=EmailResponse)
async def summarize_email(request: EmailRequest, db=Depends(get_database)):
    try:
        # Create request log
        request_log = RequestLog(
            request_type="summarize",
            email_id=request.email_id,
            content_length=len(request.thread_content)
        )
        await db.request_logs.insert_one(request_log.dict())

        # Process the request
        summary = await summarize_thread(request.thread_content)

        # Update log with success
        await db.request_logs.update_one(
            {"id": request_log.id},
            {
                "$set": {
                    "status": "completed",
                    "completion_time": datetime.utcnow()
                }
            }
        )

        return EmailResponse(content=summary.text, request_id=request_log.id)

    except Exception as e:
        # Update log with error
        await db.request_logs.update_one(
            {"id": request_log.id},
            {
                "$set": {
                    "status": "error",
                    "error_message": str(e)
                }
            }
        )
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/draft-reply", response_model=EmailResponse)
async def create_draft_reply(request: EmailRequest, db=Depends(get_database)):
    try:
        # Create request log
        request_log = RequestLog(
            request_type="draft_reply",
            email_id=request.email_id,
            content_length=len(request.thread_content),
            instruction=request.instruction
        )
        await db.request_logs.insert_one(request_log.dict())

        # Process the request
        reply = await draft_reply(request.thread_content, request.instruction)

        # Update log with success
        await db.request_logs.update_one(
            {"id": request_log.id},
            {
                "$set": {
                    "status": "completed",
                    "completion_time": datetime.utcnow()
                }
            }
        )

        return EmailResponse(content=reply.text, request_id=request_log.id)

    except Exception as e:
        # Update log with error
        await db.request_logs.update_one(
            {"id": request_log.id},
            {
                "$set": {
                    "status": "error",
                    "error_message": str(e)
                }
            }
        )
        raise HTTPException(status_code=500, detail=str(e)) 