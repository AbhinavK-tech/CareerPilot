import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import auth, copilot, dsa, interview

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize SQLite database tables
logger.info("Initializing database tables...")
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CareerPilot AI API",
    description="Multi-Agent Career Copilot Engine powering personalized learning plans and interviews.",
    version="1.0.0",
)

# Enable CORS for React frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for capstone ease of evaluation
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(copilot.router)
app.include_router(dsa.router)
app.include_router(interview.router)

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "app": "CareerPilot AI – Multi-Agent Career Copilot",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
