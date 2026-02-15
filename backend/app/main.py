"""
FastAPI Main Application
LLM Evaluation Platform Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="LLM Evaluation Platform",
    description="Platform for evaluating and comparing LLM outputs",
    version="1.0.0"
)

# CORS middleware - MUST be before other middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Import and include all routers individually
from app.api.endpoints import auth
from app.api.endpoints import projects
from app.api.endpoints import prompts
from app.api.endpoints import datasets
from app.api.endpoints import evaluations
from app.api.endpoints import metrics_viz
from app.api.endpoints import evaluation_results
from app.api.endpoints import evaluate

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(prompts.router)
app.include_router(datasets.router)
app.include_router(evaluations.router)
app.include_router(metrics_viz.router)
app.include_router(evaluation_results.router)
app.include_router(evaluate.router, prefix="/api/v1")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse(
        status_code=200,
        content={"status": "healthy", "service": "LLM Evaluation Platform"}
    )

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return JSONResponse(
        status_code=200,
        content={
            "message": "LLM Evaluation Platform API",
            "version": "1.0.0",
            "docs": "/docs"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
