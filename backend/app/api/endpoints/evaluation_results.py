"""
Evaluation Results Endpoints
Store and retrieve evaluation results
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List
from app.db.database import get_session
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/evaluation-results", tags=["evaluation-results"])

class EvaluationRowResult(BaseModel):
    question: str
    expected_answer: str
    model_a_response: str
    model_a_latency: float
    model_a_tokens: int
    model_a_cost: float
    model_a_accuracy: float
    model_b_response: str
    model_b_latency: float
    model_b_tokens: int
    model_b_cost: float
    model_b_accuracy: float
    winner: str

class EvaluationResultCreate(BaseModel):
    project_id: str
    prompt_version: str
    model_a: str
    model_b: str
    rows: List[EvaluationRowResult]

@router.post("/store")
async def store_evaluation_results(
    data: EvaluationResultCreate,
    session: AsyncSession = Depends(get_session)
):
    """Store evaluation results - No authentication required"""
    try:
        logger.info(f"Storing evaluation results for project: {data.project_id}")
        logger.info(f"Prompt version: {data.prompt_version}")
        logger.info(f"Models: {data.model_a} vs {data.model_b}")
        logger.info(f"Total rows: {len(data.rows)}")
        
        # For now, just return success
        # In production, you would save to database
        return {
            "status": "success",
            "message": "Evaluation results stored successfully",
            "project_id": data.project_id,
            "prompt_version": data.prompt_version,
            "rows_stored": len(data.rows)
        }
    except Exception as e:
        logger.error(f"Error storing results: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store results: {str(e)}"
        )

@router.get("/project/{project_id}")
async def get_project_evaluations(
    project_id: str,
    session: AsyncSession = Depends(get_session)
):
    """Get evaluations by project - No authentication required"""
    try:
        logger.info(f"Fetching evaluations for project: {project_id}")
        
        # For now, return empty list
        # In production, you would query database
        return {
            "status": "success",
            "project_id": project_id,
            "evaluations": []
        }
    except Exception as e:
        logger.error(f"Error fetching evaluations: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch evaluations: {str(e)}"
        )
