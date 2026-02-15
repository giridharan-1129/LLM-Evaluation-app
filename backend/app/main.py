"""
FastAPI Main Application
LLM Evaluation Platform Backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.api.endpoints import (
    auth,
    projects,
    prompts,
    datasets,
    evaluations,
    metrics_viz
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="LLM Evaluation Platform",
    description="Platform for evaluating and comparing LLM outputs",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(prompts.router)
app.include_router(datasets.router)
app.include_router(evaluations.router)
app.include_router(metrics_viz.router)

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

