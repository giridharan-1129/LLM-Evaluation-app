from fastapi import APIRouter
from .auth import router as auth_router
from .datasets import router as datasets_router
from .evaluations import router as evaluations_router
from .metrics_viz import router as metrics_router
from .projects import router as projects_router
from .prompts import router as prompts_router
from .evaluation_results import router as evaluation_results_router
from .evaluate import router as evaluate_router

# Create a combined router
router = APIRouter()

# Include all routers
router.include_router(auth_router)
router.include_router(datasets_router)
router.include_router(evaluations_router)
router.include_router(metrics_router)
router.include_router(projects_router)
router.include_router(prompts_router)
router.include_router(evaluation_results_router)
router.include_router(evaluate_router)

__all__ = [
    "router",
    "auth_router",
    "datasets_router",
    "evaluations_router",
    "metrics_router",
    "projects_router",
    "prompts_router",
    "evaluation_results_router",
    "evaluate_router",
]
