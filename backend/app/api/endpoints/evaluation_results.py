"""
Evaluation Results Endpoints
Simple storage that doesn't require complex FK relationships
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

# In-memory storage for evaluations (in production, use database)
evaluations_store = {}

@router.post("/store")
async def store_evaluation_results(
    data: EvaluationResultCreate,
    session: AsyncSession = Depends(get_session)
):
    """Store evaluation results in memory"""
    try:
        logger.info(f"Storing evaluation results for project: {data.project_id}")
        
        # Calculate totals
        total_tokens = sum(r.model_a_tokens + r.model_b_tokens for r in data.rows)
        total_cost = sum(r.model_a_cost + r.model_b_cost for r in data.rows)
        
        evaluation_id = f"{data.project_id}_{len(evaluations_store)}"
        
        evaluations_store[evaluation_id] = {
            "project_id": data.project_id,
            "prompt_version": data.prompt_version,
            "model_a": data.model_a,
            "model_b": data.model_b,
            "total_rows": len(data.rows),
            "total_tokens": total_tokens,
            "total_cost": total_cost,
            "rows": data.rows,
            "timestamp": __import__('datetime').datetime.utcnow().isoformat()
        }
        
        logger.info(f"✅ Stored evaluation {evaluation_id} with {len(data.rows)} rows")
        
        return {
            "status": "success",
            "message": "Evaluation results stored successfully",
            "evaluation_id": evaluation_id,
            "project_id": data.project_id,
            "rows_stored": len(data.rows),
            "total_tokens": total_tokens,
            "total_cost": float(total_cost)
        }
    except Exception as e:
        logger.error(f"❌ Error storing results: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to store results: {str(e)}"
        )

@router.get("/project/{project_id}")
async def get_project_evaluations(
    project_id: str,
    session: AsyncSession = Depends(get_session)
):
    """Get evaluations by project"""
    try:
        logger.info(f"Fetching evaluations for project: {project_id}")
        
        # Filter evaluations by project_id
        project_evals = [
            {
                "id": eval_id,
                "prompt_version": ev["prompt_version"],
                "model_a": ev["model_a"],
                "model_b": ev["model_b"],
                "total_rows": ev["total_rows"],
                "total_tokens": ev["total_tokens"],
                "total_cost": ev["total_cost"],
                "timestamp": ev["timestamp"]
            }
            for eval_id, ev in evaluations_store.items()
            if ev["project_id"] == project_id
        ]
        
        logger.info(f"✅ Found {len(project_evals)} evaluations for project {project_id}")
        
        return {
            "status": "success",
            "project_id": project_id,
            "evaluations": project_evals
        }
    except Exception as e:
        logger.error(f"❌ Error fetching evaluations: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch evaluations: {str(e)}"
        )

@router.get("/{evaluation_id}")
async def get_evaluation_details(
    evaluation_id: str,
    session: AsyncSession = Depends(get_session)
):
    """Get detailed results of an evaluation"""
    try:
        if evaluation_id not in evaluations_store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evaluation not found"
            )
        
        ev = evaluations_store[evaluation_id]
        
        return {
            "status": "success",
            "evaluation_id": evaluation_id,
            "project_id": ev["project_id"],
            "prompt_version": ev["prompt_version"],
            "model_a": ev["model_a"],
            "model_b": ev["model_b"],
            "total_rows": ev["total_rows"],
            "total_tokens": ev["total_tokens"],
            "total_cost": ev["total_cost"],
            "rows": [
                {
                    "question": r.question,
                    "expected_answer": r.expected_answer,
                    "model_a_response": r.model_a_response,
                    "model_a_tokens": r.model_a_tokens,
                    "model_a_cost": r.model_a_cost,
                    "model_a_accuracy": r.model_a_accuracy,
                    "model_b_response": r.model_b_response,
                    "model_b_tokens": r.model_b_tokens,
                    "model_b_cost": r.model_b_cost,
                    "model_b_accuracy": r.model_b_accuracy,
                    "winner": r.winner
                }
                for r in ev["rows"]
            ]
        }
    except Exception as e:
        logger.error(f"❌ Error fetching evaluation: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch evaluation: {str(e)}"
        )
