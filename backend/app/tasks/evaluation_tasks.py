"""
Evaluation Tasks Module
Celery tasks for asynchronous evaluation job processing
"""

import logging
from typing import Dict, Any, List
from uuid import UUID
from datetime import datetime
import asyncio

from app.tasks.celery_app import celery_app
from app.services.excel_service import ExcelService
from app.services.llm_service import LLMService
from app.services.metrics_service import MetricsService
from app.db.database import engine, async_session
from app.db.repositories.eval import (
    EvalCycleRepository,
    EvalEntryRepository,
    EvalMetricsRepository,
    EvalCycleSummaryRepository,
    EvalConfigRepository,
    EvalDatasetRepository,
)
from app.db.repositories.prompt import PromptVersionRepository

logger = logging.getLogger(__name__)


@celery_app.task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    name="app.tasks.evaluation_tasks.process_evaluation_job"
)
def process_evaluation_job(
    self,
    job_id: str,
    dataset_id: str,
    prompt_version_id: str,
    eval_config_id: str,
    project_id: str,
):
    """
    Main task: Process an evaluation job
    
    This task:
    1. Loads the dataset (Excel file)
    2. Gets the prompt template
    3. Gets LLM configuration
    4. For each row in dataset:
       - Renders prompt with data
       - Calls LLM
       - Stores response
       - Calculates metrics
    5. Aggregates metrics
    6. Updates job status
    
    Args:
        job_id: UUID of the evaluation job
        dataset_id: UUID of the dataset (Excel file)
        prompt_version_id: UUID of the prompt version
        eval_config_id: UUID of the evaluation config
        project_id: UUID of the project
    """
    
    try:
        logger.info(f"Starting evaluation job {job_id}")
        
        # This will run asynchronously using asyncio
        asyncio.run(
            _process_evaluation_job_async(
                job_id=UUID(job_id),
                dataset_id=UUID(dataset_id),
                prompt_version_id=UUID(prompt_version_id),
                eval_config_id=UUID(eval_config_id),
                project_id=UUID(project_id),
            )
        )
        
        logger.info(f"Evaluation job {job_id} completed successfully")
        return {"status": "completed", "job_id": job_id}
        
    except Exception as exc:
        logger.error(f"Error processing evaluation job {job_id}: {str(exc)}")
        
        # Retry up to 3 times with exponential backoff
        raise self.retry(exc=exc)


async def _process_evaluation_job_async(
    job_id: UUID,
    dataset_id: UUID,
    prompt_version_id: UUID,
    eval_config_id: UUID,
    project_id: UUID,
):
    """
    Async implementation of evaluation job processing
    """
    
    # Create database session
    async with async_session() as session:
        try:
            # Initialize repositories
            job_repo = EvalCycleRepository(session)
            entry_repo = EvalEntryRepository(session)
            metrics_repo = EvalMetricsRepository(session)
            summary_repo = EvalCycleSummaryRepository(session)
            config_repo = EvalConfigRepository(session)
            dataset_repo = EvalDatasetRepository(session)
            prompt_repo = PromptVersionRepository(session)
            
            # Get job from database
            job = await job_repo.get_by_id(job_id)
            if not job:
                raise Exception(f"Job {job_id} not found")
            
            logger.info(f"Job found: {job.name}")
            
            # Update job status to running
            await job_repo.update_progress(job_id, 0, 0, "running")
            logger.info(f"Job status updated to: running")
            
            # Get evaluation config
            eval_config = await config_repo.get_by_id(eval_config_id)
            if not eval_config:
                raise Exception(f"Eval config {eval_config_id} not found")
            
            logger.info(f"Eval config loaded: {eval_config.model}")
            
            # Get prompt version
            prompt_version = await prompt_repo.get_by_id(prompt_version_id)
            if not prompt_version:
                raise Exception(f"Prompt version {prompt_version_id} not found")
            
            logger.info(f"Prompt loaded: {prompt_version.content[:100]}...")
            
            # Parse Excel dataset
            try:
                dataset = await dataset_repo.get_by_id(dataset_id)
                if not dataset:
                    raise Exception(f"Dataset {dataset_id} not found")
                
                headers, data_rows, total_rows = ExcelService.parse_excel_file(
                    dataset.file_path
                )
                logger.info(f"Dataset parsed: {total_rows} rows")
                
            except Exception as e:
                logger.error(f"Error parsing dataset: {str(e)}")
                await job_repo.update_progress(job_id, 0, 0, "failed")
                raise
            
            # Initialize LLM service
            try:
                llm_service = LLMService(provider="openai")
                logger.info("LLM service initialized")
            except Exception as e:
                logger.error(f"Error initializing LLM service: {str(e)}")
                await job_repo.update_progress(job_id, 0, 0, "failed")
                raise
            
            # Process each row
            processed_rows = 0
            failed_rows = 0
            total_tokens = 0
            total_cost = 0.0
            all_metrics = []
            
            for row_idx, data_row in enumerate(data_rows):
                try:
                    logger.debug(f"Processing row {row_idx + 1}/{total_rows}")
                    
                    # Render prompt with data from this row
                    user_prompt = ExcelService.render_prompt_template(
                        prompt_version.content,
                        data_row
                    )
                    
                    logger.debug(f"Prompt rendered: {user_prompt[:100]}...")
                    
                    # Call LLM
                    llm_response = llm_service.evaluate(
                        system_prompt="You are a helpful assistant",
                        user_prompt=user_prompt,
                        model=eval_config.model,
                        temperature=eval_config.temperature,
                        max_tokens=eval_config.max_tokens,
                    )
                    
                    logger.debug(f"LLM response: {llm_response['response'][:100]}...")
                    
                    # Store entry in database
                    entry = await entry_repo.create(
                        eval_cycle_id=job_id,
                        row_number=row_idx + 1,
                        input_data=str(data_row),
                        system_prompt="You are a helpful assistant",
                        user_prompt=user_prompt,
                        gpt_response=llm_response["response"],
                        tokens_used=llm_response["tokens_used"],
                        cost=llm_response["cost"],
                        latency_ms=0,
                    )
                    
                    logger.debug(f"Entry stored: {entry.id}")
                    
                    # Calculate metrics (if ground truth is available)
                    if "expected_response" in data_row:
                        metrics = MetricsService.calculate_metrics(
                            actual=llm_response["response"],
                            expected=data_row["expected_response"],
                        )
                        
                        # Store metrics
                        await metrics_repo.create(
                            eval_entry_id=entry.id,
                            expected_output=data_row["expected_response"],
                            actual_output=llm_response["response"],
                            similarity_score=metrics.get("cosine_similarity", 0.0),
                            exact_match=int(metrics.get("exact_match", 0)),
                            token_f1=metrics.get("token_f1", 0.0),
                            bleu_score=metrics.get("bleu_score", 0.0),
                            rouge_score=metrics.get("rouge_score", 0.0),
                        )
                        
                        all_metrics.append(metrics)
                        logger.debug(f"Metrics stored for row {row_idx + 1}")
                    
                    # Update totals
                    processed_rows += 1
                    total_tokens += llm_response["tokens_used"]
                    total_cost += llm_response["cost"]
                    
                    # Update job progress every 10 rows
                    if (row_idx + 1) % 10 == 0:
                        await job_repo.update_progress(
                            job_id,
                            processed_rows,
                            failed_rows,
                            "running"
                        )
                        logger.info(f"Progress: {processed_rows}/{total_rows} rows processed")
                    
                except Exception as e:
                    logger.error(f"Error processing row {row_idx + 1}: {str(e)}")
                    failed_rows += 1
                    continue
            
            # Calculate aggregated metrics
            if all_metrics:
                aggregated = MetricsService.aggregate_metrics(
                    [{"exact_match": m.get("exact_match", 0), 
                       "token_f1": m.get("token_f1", 0.0),
                       "bleu_score": m.get("bleu_score", 0.0),
                       "rouge_score": m.get("rouge_score", 0.0),
                       "cosine_similarity": m.get("cosine_similarity", 0.0)}
                     for m in all_metrics]
                )
                
                accuracy = aggregated.get("accuracy", 0.0)
                avg_token_f1 = aggregated.get("avg_token_f1", 0.0)
                avg_bleu = aggregated.get("avg_bleu_score", 0.0)
                avg_rouge = aggregated.get("avg_rouge_score", 0.0)
            else:
                accuracy = 0.0
                avg_token_f1 = 0.0
                avg_bleu = 0.0
                avg_rouge = 0.0
            
            # Store aggregated metrics
            await summary_repo.create_or_update(
                eval_cycle_id=job_id,
                total_tokens=total_tokens,
                total_cost=total_cost,
                avg_latency_ms=0,
                accuracy=accuracy,
                precision=accuracy,
                recall=accuracy,
                f1_score=accuracy,
                avg_similarity=aggregated.get("avg_cosine_similarity", 0.0) if all_metrics else 0.0,
                avg_bleu=avg_bleu,
                avg_rouge=avg_rouge,
            )
            
            logger.info(f"Aggregated metrics stored")
            
            # Update job status to completed
            await job_repo.update_progress(
                job_id,
                processed_rows,
                failed_rows,
                "completed"
            )
            
            logger.info(
                f"Job {job_id} completed. "
                f"Processed: {processed_rows}, Failed: {failed_rows}, "
                f"Total tokens: {total_tokens}, Total cost: ${total_cost:.6f}"
            )
            
            # Update job completed_at
            await session.commit()
            
        except Exception as e:
            logger.error(f"Error in async evaluation: {str(e)}")
            
            # Update job status to failed
            try:
                job_repo = EvalCycleRepository(session)
                await job_repo.update_progress(job_id, 0, 0, "failed")
            except:
                pass
            
            raise

