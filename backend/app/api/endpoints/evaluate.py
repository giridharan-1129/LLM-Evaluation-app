"""
Evaluation Endpoints - WITH DEBUGGING
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, AsyncGenerator
from app.db.database import get_session
from app.services.llm_evaluation import LLMEvaluationService
import asyncio
import json
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

router = APIRouter(prefix="/evaluate", tags=["evaluate"])

class EvaluationRow(BaseModel):
    question: str
    expected_answer: str

class EvaluationRequest(BaseModel):
    system_prompt: str
    user_prompt_template: str
    rows: List[EvaluationRow]
    model_a: str = "gpt-4"
    model_b: str = "deepseek-chat"
    openai_key: str
    deepseek_key: str
    anthropic_key: str = ""

async def evaluate_rows_stream(
    request: EvaluationRequest
) -> AsyncGenerator[str, None]:
    """Stream evaluation results row by row"""
    try:
        # DEBUG: Log the request
        logger.debug(f"=== EVALUATION REQUEST RECEIVED ===")
        logger.debug(f"Model A: {request.model_a}")
        logger.debug(f"Model B: {request.model_b}")
        logger.debug(f"OpenAI Key length: {len(request.openai_key) if request.openai_key else 0}")
        logger.debug(f"DeepSeek Key length: {len(request.deepseek_key) if request.deepseek_key else 0}")
        logger.debug(f"Number of rows: {len(request.rows)}")
        logger.debug(f"System prompt: {request.system_prompt[:50]}...")
        logger.debug(f"User prompt template: {request.user_prompt_template[:50]}...")
        
        # Validate API keys
        if not request.openai_key or not request.deepseek_key:
            logger.error("❌ API keys missing!")
            error_data = {"type": "error", "error": "OpenAI and DeepSeek API keys are required"}
            yield json.dumps(error_data) + "\n"
            return
        
        # Create service with user-provided keys
        logger.debug(f"Creating LLMEvaluationService with keys...")
        llm_service = LLMEvaluationService(
            openai_key=request.openai_key.strip(),
            deepseek_key=request.deepseek_key.strip(),
            anthropic_key=request.anthropic_key.strip()
        )
        
        total_rows = len(request.rows)
        
        # Send start signal
        start_data = {"type": "start", "total_rows": total_rows}
        yield json.dumps(start_data) + "\n"
        logger.info(f"Starting evaluation with {total_rows} rows")
        
        # Process rows ONE BY ONE
        for idx, row in enumerate(request.rows):
            try:
                logger.info(f"=== Processing row {idx + 1}/{total_rows} ===")
                logger.debug(f"Question: {row.question}")
                logger.debug(f"Expected Answer: {row.expected_answer}")
                
                # Call both APIs IN PARALLEL
                result = await llm_service.evaluate_row(
                    system_prompt=request.system_prompt,
                    user_prompt_template=request.user_prompt_template,
                    question=row.question,
                    expected_answer=row.expected_answer,
                    model_a=request.model_a,
                    model_b=request.model_b
                )
                
                logger.debug(f"Result for row {idx + 1}:")
                logger.debug(f"  Model A response: {result['model_a_response'][:100]}")
                logger.debug(f"  Model B response: {result['model_b_response'][:100]}")
                logger.debug(f"  Winner: {result['winner']}")
                
                progress = int(((idx + 1) / total_rows) * 100)
                
                # Stream this result
                response_data = {
                    "type": "row_complete",
                    "row_number": idx + 1,
                    "total_rows": total_rows,
                    "progress": progress,
                    "result": result
                }
                
                yield json.dumps(response_data) + "\n"
                logger.info(f"✅ Row {idx + 1} completed - progress: {progress}%")
                
                await asyncio.sleep(0.05)
                
            except Exception as e:
                logger.error(f"❌ Error processing row {idx + 1}: {str(e)}", exc_info=True)
                response_data = {
                    "type": "row_error",
                    "row_number": idx + 1,
                    "error": str(e)
                }
                yield json.dumps(response_data) + "\n"
        
        # Send completion signal
        complete_data = {"type": "complete", "total_rows": total_rows}
        yield json.dumps(complete_data) + "\n"
        logger.info(f"✅ Evaluation complete: all {total_rows} rows processed")
        
    except Exception as e:
        logger.error(f"❌ Stream error: {str(e)}", exc_info=True)
        error_data = {"type": "error", "error": str(e)}
        yield json.dumps(error_data) + "\n"

@router.post("/rows")
async def evaluate_rows(request: EvaluationRequest):
    """Stream evaluation results"""
    return StreamingResponse(
        evaluate_rows_stream(request),
        media_type="application/x-ndjson",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive"
        }
    )
