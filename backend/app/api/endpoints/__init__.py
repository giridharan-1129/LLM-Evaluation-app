"""
API Endpoints Router
Combines all endpoint routers
"""

from fastapi import APIRouter
from app.api.endpoints.auth import router as auth_router
from app.api.endpoints.projects import router as projects_router

router = APIRouter()

# Include all routers
router.include_router(auth_router)
router.include_router(projects_router)

__all__ = ["router"]
