from fastapi import APIRouter

from app.api.endpoints.auth import router as auth_router
from app.api.endpoints.projects import router as projects_router
from app.api.endpoints.prompts import router as prompts_router
from app.api.endpoints.evaluations import router as evaluations_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(projects_router)
router.include_router(prompts_router)
router.include_router(evaluations_router)
