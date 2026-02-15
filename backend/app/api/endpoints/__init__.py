"""
API Endpoints Package
Combines all routers into a single main router
"""

from fastapi import APIRouter

# Import individual routers
from app.api.endpoints import auth, projects, prompts, datasets, evaluations, metrics_viz

# Create main router
router = APIRouter()

# Include all sub-routers
router.include_router(auth.router)
router.include_router(projects.router)
router.include_router(prompts.router)
router.include_router(datasets.router)
router.include_router(evaluations.router)
router.include_router(metrics_viz.router)

__all__ = ["router"]
