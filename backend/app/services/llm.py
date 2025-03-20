from openai import AsyncOpenAI
from app.config import get_settings
from app.schemas.email import LLMResponse

settings = get_settings()
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def summarize_thread(thread_content: str) -> LLMResponse:
    """Summarize an email thread using OpenAI's API."""
    response = await client.chat.completions.create(
        model=settings.MODEL_NAME,
        messages=[
            {"role": "system", "content": "You are a helpful email assistant that summarizes email threads concisely."},
            {"role": "user", "content": f"Please summarize the following email thread:\n\n{thread_content}"}
        ]
    )
    
    return LLMResponse(
        text=response.choices[0].message.content,
        token_usage=response.usage.total_tokens,
        model_name=settings.MODEL_NAME
    )

async def draft_reply(thread_content: str, instruction: str = None) -> LLMResponse:
    """Draft a reply to an email thread using OpenAI's API."""
    prompt = f"Please draft a reply to the following email thread:\n\n{thread_content}"
    if instruction:
        prompt += f"\n\nAdditional instruction: {instruction}"

    response = await client.chat.completions.create(
        model=settings.MODEL_NAME,
        messages=[
            {"role": "system", "content": "You are a helpful email assistant that drafts professional and contextually appropriate email replies."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return LLMResponse(
        text=response.choices[0].message.content,
        token_usage=response.usage.total_tokens,
        model_name=settings.MODEL_NAME
    ) 