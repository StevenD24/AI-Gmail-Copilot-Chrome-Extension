from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import email
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(title="Gmail Copilot API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Prometheus instrumentation before the app starts
Instrumentator().instrument(app).expose(app)

# Event handlers for database connection
@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

# Include routers
app.include_router(email.router, prefix="/api/v1", tags=["email"])