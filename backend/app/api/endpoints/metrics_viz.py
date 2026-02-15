"""
Metrics Visualization Endpoints
Provides aggregated metrics data for dashboard visualization
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Dict, Any
import logging

from app.db.database import get_session
from app.models.eval_cycle import EvalCycleSummary, EvalEntry, EvalCycle
from app.core.dependencies import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/metrics", tags=["metrics"])


@router.get("/project/{project_id}/summary")
async def get_project_metrics_summary(
    project_id: str,
    db: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get overall metrics summary for a project
    
    Returns:
    - Total evaluations run
    - Average accuracy across all models
    - Total tokens used
    - Total cost
    - Model comparison stats
    """
    try:
        query = select(EvalCycleSummary).join(
            EvalCycle, EvalCycleSummary.eval_cycle_id == EvalCycle.id
        ).where(EvalCycle.project_id == project_id)
        
        result = await db.execute(query)
        summaries = result.scalars().all()
        
        if not summaries:
            return {
                "project_id": project_id,
                "total_evaluations": 0,
                "total_tokens": 0,
                "total_cost": 0.0,
                "avg_accuracy_model_a": 0.0,
                "avg_accuracy_model_b": 0.0,
                "model_a_wins": 0,
                "model_b_wins": 0,
                "ties": 0
            }
        
        # Aggregate metrics
        total_tokens = sum(s.total_tokens for s in summaries)
        total_cost = sum(s.total_cost for s in summaries)
        avg_accuracy_a = sum(s.accuracy_a for s in summaries) / len(summaries) if summaries else 0
        avg_accuracy_b = sum(s.accuracy_b for s in summaries) / len(summaries) if summaries else 0
        total_model_a_wins = sum(s.model_a_wins for s in summaries)
        total_model_b_wins = sum(s.model_b_wins for s in summaries)
        total_ties = sum(s.ties for s in summaries)
        
        return {
            "project_id": project_id,
            "total_evaluations": len(summaries),
            "total_tokens": total_tokens,
            "total_cost": round(total_cost, 6),
            "avg_accuracy_model_a": round(avg_accuracy_a, 4),
            "avg_accuracy_model_b": round(avg_accuracy_b, 4),
            "model_a_wins": total_model_a_wins,
            "model_b_wins": total_model_b_wins,
            "ties": total_ties
        }
        
    except Exception as e:
        logger.error(f"Error getting project metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving metrics")


@router.get("/cycle/{cycle_id}/details")
async def get_cycle_metrics_details(
    cycle_id: str,
    db: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get detailed metrics for a specific evaluation cycle
    """
    try:
        # Get cycle summary
        summary_query = select(EvalCycleSummary).where(
            EvalCycleSummary.eval_cycle_id == cycle_id
        )
        summary_result = await db.execute(summary_query)
        summary = summary_result.scalar_one_or_none()
        
        if not summary:
            raise HTTPException(status_code=404, detail="Evaluation cycle not found")
        
        # Get all entries
        entries_query = select(EvalEntry).where(
            EvalEntry.eval_cycle_id == cycle_id
        )
        entries_result = await db.execute(entries_query)
        entries = entries_result.scalars().all()
        
        # Format entries for visualization
        formatted_entries = []
        for entry in entries:
            formatted_entries.append({
                "row_number": entry.row_number,
                "expected_output": entry.expected_output,
                "output_a": entry.output_a,
                "output_b": entry.output_b,
                "model_a": entry.model_a,
                "model_b": entry.model_b,
                "accuracy_a": entry.accuracy_a,
                "accuracy_b": entry.accuracy_b,
                "winner": entry.winner,
                "confidence": entry.confidence,
                "tokens_a": entry.tokens_total_a,
                "tokens_b": entry.tokens_total_b,
                "cost_a": round(entry.cost_a, 6),
                "cost_b": round(entry.cost_b, 6),
            })
        
        return {
            "cycle_id": cycle_id,
            "summary": {
                "total_rows": summary.total_rows,
                "total_tokens": summary.total_tokens,
                "total_cost": round(summary.total_cost, 6),
                "accuracy_a": round(summary.accuracy_a, 4),
                "accuracy_b": round(summary.accuracy_b, 4),
                "precision_a": round(summary.precision_a, 4),
                "precision_b": round(summary.precision_b, 4),
                "recall_a": round(summary.recall_a, 4),
                "recall_b": round(summary.recall_b, 4),
                "f1_score_a": round(summary.f1_score_a, 4),
                "f1_score_b": round(summary.f1_score_b, 4),
                "bleu_a": round(summary.avg_bleu_a, 4),
                "bleu_b": round(summary.avg_bleu_b, 4),
                "rouge_a": round(summary.avg_rouge_a, 4),
                "rouge_b": round(summary.avg_rouge_b, 4),
                "model_a_wins": summary.model_a_wins,
                "model_b_wins": summary.model_b_wins,
                "ties": summary.ties,
            },
            "entries": formatted_entries,
            "tokens_breakdown": {
                "model_a": summary.total_tokens_a,
                "model_b": summary.total_tokens_b,
            },
            "cost_breakdown": {
                "model_a": round(summary.total_cost_a, 6),
                "model_b": round(summary.total_cost_b, 6),
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting cycle metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving metrics")


@router.get("/project/{project_id}/trends")
async def get_project_metrics_trends(
    project_id: str,
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get metrics trends over time for visualization
    """
    try:
        # Get recent eval cycles
        query = select(EvalCycleSummary).join(
            EvalCycle, EvalCycleSummary.eval_cycle_id == EvalCycle.id
        ).where(
            EvalCycle.project_id == project_id
        ).order_by(
            desc(EvalCycleSummary.created_at)
        ).limit(limit)
        
        result = await db.execute(query)
        summaries = result.scalars().all()
        
        # Format for time-series visualization
        trends = {
            "timestamps": [],
            "accuracy_a": [],
            "accuracy_b": [],
            "cost": [],
            "tokens": []
        }
        
        for summary in reversed(summaries):  # Reverse to get chronological order
            trends["timestamps"].append(summary.created_at.isoformat())
            trends["accuracy_a"].append(round(summary.accuracy_a, 4))
            trends["accuracy_b"].append(round(summary.accuracy_b, 4))
            trends["cost"].append(round(summary.total_cost, 6))
            trends["tokens"].append(summary.total_tokens)
        
        return {
            "project_id": project_id,
            "trends": trends,
            "data_points": len(summaries)
        }
        
    except Exception as e:
        logger.error(f"Error getting trends: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving trends")


@router.get("/cycle/{cycle_id}/comparison")
async def get_cycle_model_comparison(
    cycle_id: str,
    db: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get detailed model-to-model comparison for a cycle
    """
    try:
        # Get summary
        summary_query = select(EvalCycleSummary).where(
            EvalCycleSummary.eval_cycle_id == cycle_id
        )
        summary_result = await db.execute(summary_query)
        summary = summary_result.scalar_one_or_none()
        
        if not summary:
            raise HTTPException(status_code=404, detail="Evaluation cycle not found")
        
        # Calculate win percentages
        total_comparisons = summary.model_a_wins + summary.model_b_wins + summary.ties
        
        return {
            "cycle_id": cycle_id,
            "comparison": {
                "accuracy": {
                    "model_a": round(summary.accuracy_a, 4),
                    "model_b": round(summary.accuracy_b, 4),
                    "difference": round(summary.accuracy_a - summary.accuracy_b, 4)
                },
                "precision": {
                    "model_a": round(summary.precision_a, 4),
                    "model_b": round(summary.precision_b, 4),
                    "difference": round(summary.precision_a - summary.precision_b, 4)
                },
                "recall": {
                    "model_a": round(summary.recall_a, 4),
                    "model_b": round(summary.recall_b, 4),
                    "difference": round(summary.recall_a - summary.recall_b, 4)
                },
                "f1_score": {
                    "model_a": round(summary.f1_score_a, 4),
                    "model_b": round(summary.f1_score_b, 4),
                    "difference": round(summary.f1_score_a - summary.f1_score_b, 4)
                },
                "bleu": {
                    "model_a": round(summary.avg_bleu_a, 4),
                    "model_b": round(summary.avg_bleu_b, 4),
                    "difference": round(summary.avg_bleu_a - summary.avg_bleu_b, 4)
                }
            },
            "win_statistics": {
                "model_a_wins": summary.model_a_wins,
                "model_b_wins": summary.model_b_wins,
                "ties": summary.ties,
                "total_comparisons": total_comparisons,
                "model_a_win_rate": round(summary.model_a_wins / total_comparisons * 100, 2) if total_comparisons > 0 else 0,
                "model_b_win_rate": round(summary.model_b_wins / total_comparisons * 100, 2) if total_comparisons > 0 else 0,
                "tie_rate": round(summary.ties / total_comparisons * 100, 2) if total_comparisons > 0 else 0
            },
            "cost_comparison": {
                "model_a": round(summary.total_cost_a, 6),
                "model_b": round(summary.total_cost_b, 6),
                "total": round(summary.total_cost, 6)
            },
            "tokens_comparison": {
                "model_a": summary.total_tokens_a,
                "model_b": summary.total_tokens_b,
                "total": summary.total_tokens
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting comparison: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving comparison data")

