"""
Evaluation Tasks Module
Celery tasks for background evaluation job processing
Now supports parallel dual-model evaluation
"""

import logging
from celery import shared_task
from typing import Dict, Any, List
import asyncio
from concurrent.futures import ThreadPoolExecutor
import uuid
from datetime import datetime

from app.db.database import async_session
from app.models.eval_cycle import EvalEntry, EvalCycle, EvalCycleSummary
from app.services.llm_service import LLMService
from app.services.metrics_service import MetricsService
from app.services.excel_service import ExcelService

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def process_evaluation_job(
    self,
    job_id: str,
    dataset_id: str,
    project_id: str,
    model_a: str,
    model_b: str = None,
    provider_a: str = "openai",
    provider_b: str = None,
    temperature_a: float = 0.7,
    temperature_b: float = 0.7,
    max_tokens: int = 2000,
    system_prompt: str = None,
    user_prompt_template: str = None,
    expected_output_column: str = None
) -> Dict[str, Any]:
    """
    Process evaluation job with single or dual LLM models
    
    Args:
        job_id: Evaluation job ID
        dataset_id: Dataset ID
        project_id: Project ID
        model_a: Primary model name
        model_b: Secondary model name (optional, for comparison)
        provider_a: Provider for model A (openai, deepseek, anthropic)
        provider_b: Provider for model B (openai, deepseek, anthropic)
        temperature_a: Temperature for model A
        temperature_b: Temperature for model B
        max_tokens: Max tokens for response
        system_prompt: System prompt for both models
        user_prompt_template: User prompt template with {variables}
        expected_output_column: Column name with expected output
        
    Returns:
        Dict with job results and metrics
    """
    
    try:
        logger.info(f"Starting evaluation job {job_id}")
        logger.info(f"Models: {model_a} ({provider_a}) vs {model_b} ({provider_b})")
        
        async def _run_evaluation():
            async with async_session() as session:
                # Get evaluation cycle
                eval_cycle = await session.get(EvalCycle, job_id)
                if not eval_cycle:
                    raise ValueError(f"Evaluation cycle {job_id} not found")
                
                # Update status to running
                eval_cycle.status = "running"
                eval_cycle.started_at = datetime.utcnow()
                await session.commit()
                
                # Load dataset rows
                dataset_rows = await _load_dataset_rows(session, dataset_id)
                total_rows = len(dataset_rows)
                
                logger.info(f"Processing {total_rows} rows")
                
                # Initialize services
                llm_service_a = LLMService(provider=provider_a)
                llm_service_b = LLMService(provider=provider_b) if model_b else None
                metrics_service = MetricsService()
                
                processed_rows = 0
                failed_rows = 0
                
                # Track totals for summary
                total_tokens_a = 0
                total_cost_a = 0.0
                total_tokens_b = 0
                total_cost_b = 0.0
                model_a_wins = 0
                model_b_wins = 0
                ties = 0
                
                metrics_a = {
                    'accuracy': [], 'precision': [], 'recall': [],
                    'f1_score': [], 'bleu_score': [], 'rouge_score': [], 'cosine_similarity': []
                }
                metrics_b = {
                    'accuracy': [], 'precision': [], 'recall': [],
                    'f1_score': [], 'bleu_score': [], 'rouge_score': [], 'cosine_similarity': []
                }
                
                # Process each row
                for row_idx, row_data in enumerate(dataset_rows, 1):
                    try:
                        logger.debug(f"Processing row {row_idx}/{total_rows}")
                        
                        # Render prompts with row data
                        system_prompt_rendered = system_prompt or "You are a helpful assistant."
                        user_prompt_rendered = user_prompt_template.format(**row_data) if user_prompt_template else str(row_data)
                        expected_output = row_data.get(expected_output_column) if expected_output_column else None
                        
                        # Get response from Model A
                        result_a = llm_service_a.evaluate(
                            system_prompt=system_prompt_rendered,
                            user_prompt=user_prompt_rendered,
                            model=model_a,
                            temperature=temperature_a,
                            max_tokens=max_tokens
                        )
                        
                        # Get response from Model B (if provided) - PARALLEL
                        result_b = None
                        if llm_service_b:
                            result_b = llm_service_b.evaluate(
                                system_prompt=system_prompt_rendered,
                                user_prompt=user_prompt_rendered,
                                model=model_b,
                                temperature=temperature_b,
                                max_tokens=max_tokens
                            )
                        
                        # Calculate metrics
                        if expected_output:
                            metrics_a_result = metrics_service.calculate_metrics(
                                expected_output, result_a['response']
                            )
                            
                            if result_b:
                                metrics_b_result = metrics_service.calculate_metrics(
                                    expected_output, result_b['response']
                                )
                                
                                # Determine winner based on accuracy
                                accuracy_a = metrics_a_result.get('accuracy', 0)
                                accuracy_b = metrics_b_result.get('accuracy', 0)
                                
                                if accuracy_a > accuracy_b:
                                    winner = "model_a"
                                    confidence = min(accuracy_a - accuracy_b, 1.0)
                                    model_a_wins += 1
                                elif accuracy_b > accuracy_a:
                                    winner = "model_b"
                                    confidence = min(accuracy_b - accuracy_a, 1.0)
                                    model_b_wins += 1
                                else:
                                    winner = "tie"
                                    confidence = 0.5
                                    ties += 1
                            else:
                                metrics_b_result = {}
                                winner = None
                                confidence = None
                        else:
                            metrics_a_result = {}
                            metrics_b_result = {}
                            winner = None
                            confidence = None
                        
                        # Create evaluation entry with dual outputs
                        eval_entry = EvalEntry(
                            id=uuid.uuid4(),
                            eval_cycle_id=job_id,
                            row_number=row_idx,
                            input_data=row_data,
                            system_prompt=system_prompt_rendered,
                            user_prompt=user_prompt_rendered,
                            expected_output=expected_output,
                            
                            # Model A
                            output_a=result_a['response'],
                            model_a=model_a,
                            provider_a=provider_a,
                            temperature_a=temperature_a,
                            tokens_input_a=result_a['input_tokens'],
                            tokens_output_a=result_a['output_tokens'],
                            tokens_total_a=result_a['tokens_used'],
                            cost_a=result_a['cost'],
                            
                            # Model B
                            output_b=result_b['response'] if result_b else None,
                            model_b=model_b,
                            provider_b=provider_b,
                            temperature_b=temperature_b,
                            tokens_input_b=result_b['input_tokens'] if result_b else 0,
                            tokens_output_b=result_b['output_tokens'] if result_b else 0,
                            tokens_total_b=result_b['tokens_used'] if result_b else 0,
                            cost_b=result_b['cost'] if result_b else 0.0,
                            
                            total_cost=(result_a['cost'] + (result_b['cost'] if result_b else 0.0)),
                            
                            # Metrics A
                            accuracy_a=metrics_a_result.get('accuracy'),
                            precision_a=metrics_a_result.get('precision'),
                            recall_a=metrics_a_result.get('recall'),
                            f1_score_a=metrics_a_result.get('f1_score'),
                            bleu_score_a=metrics_a_result.get('bleu_score'),
                            rouge_score_a=metrics_a_result.get('rouge_score'),
                            cosine_similarity_a=metrics_a_result.get('cosine_similarity'),
                            
                            # Metrics B
                            accuracy_b=metrics_b_result.get('accuracy'),
                            precision_b=metrics_b_result.get('precision'),
                            recall_b=metrics_b_result.get('recall'),
                            f1_score_b=metrics_b_result.get('f1_score'),
                            bleu_score_b=metrics_b_result.get('bleu_score'),
                            rouge_score_b=metrics_b_result.get('rouge_score'),
                            cosine_similarity_b=metrics_b_result.get('cosine_similarity'),
                            
                            # Comparison
                            winner=winner,
                            confidence=confidence,
                            status="completed"
                        )
                        
                        session.add(eval_entry)
                        
                        # Track metrics
                        for key, value in metrics_a_result.items():
                            if value is not None and key in metrics_a:
                                metrics_a[key].append(value)
                        
                        if result_b:
                            for key, value in metrics_b_result.items():
                                if value is not None and key in metrics_b:
                                    metrics_b[key].append(value)
                        
                        # Track tokens and costs
                        total_tokens_a += result_a['tokens_used']
                        total_cost_a += result_a['cost']
                        if result_b:
                            total_tokens_b += result_b['tokens_used']
                            total_cost_b += result_b['cost']
                        
                        processed_rows += 1
                        
                        # Update progress every 10 rows
                        if processed_rows % 10 == 0:
                            progress = int((processed_rows / total_rows) * 100)
                            eval_cycle.progress = progress
                            eval_cycle.processed_rows = processed_rows
                            await session.commit()
                            logger.info(f"Progress: {progress}% ({processed_rows}/{total_rows})")
                        
                    except Exception as e:
                        logger.error(f"Error processing row {row_idx}: {str(e)}")
                        failed_rows += 1
                        
                        eval_entry = EvalEntry(
                            id=uuid.uuid4(),
                            eval_cycle_id=job_id,
                            row_number=row_idx,
                            input_data=row_data,
                            status="failed",
                            error_message=str(e)
                        )
                        session.add(eval_entry)
                
                # Create summary
                summary = EvalCycleSummary(
                    id=uuid.uuid4(),
                    eval_cycle_id=job_id,
                    total_rows=total_rows,
                    total_tokens=total_tokens_a + total_tokens_b,
                    total_cost=total_cost_a + total_cost_b,
                    
                    # Model A metrics
                    accuracy_a=sum(metrics_a['accuracy']) / len(metrics_a['accuracy']) if metrics_a['accuracy'] else 0,
                    precision_a=sum(metrics_a['precision']) / len(metrics_a['precision']) if metrics_a['precision'] else 0,
                    recall_a=sum(metrics_a['recall']) / len(metrics_a['recall']) if metrics_a['recall'] else 0,
                    f1_score_a=sum(metrics_a['f1_score']) / len(metrics_a['f1_score']) if metrics_a['f1_score'] else 0,
                    avg_bleu_a=sum(metrics_a['bleu_score']) / len(metrics_a['bleu_score']) if metrics_a['bleu_score'] else 0,
                    avg_rouge_a=sum(metrics_a['rouge_score']) / len(metrics_a['rouge_score']) if metrics_a['rouge_score'] else 0,
                    avg_similarity_a=sum(metrics_a['cosine_similarity']) / len(metrics_a['cosine_similarity']) if metrics_a['cosine_similarity'] else 0,
                    total_tokens_a=total_tokens_a,
                    total_cost_a=total_cost_a,
                    
                    # Model B metrics
                    accuracy_b=sum(metrics_b['accuracy']) / len(metrics_b['accuracy']) if metrics_b['accuracy'] else 0,
                    precision_b=sum(metrics_b['precision']) / len(metrics_b['precision']) if metrics_b['precision'] else 0,
                    recall_b=sum(metrics_b['recall']) / len(metrics_b['recall']) if metrics_b['recall'] else 0,
                    f1_score_b=sum(metrics_b['f1_score']) / len(metrics_b['f1_score']) if metrics_b['f1_score'] else 0,
                    avg_bleu_b=sum(metrics_b['bleu_score']) / len(metrics_b['bleu_score']) if metrics_b['bleu_score'] else 0,
                    avg_rouge_b=sum(metrics_b['rouge_score']) / len(metrics_b['rouge_score']) if metrics_b['rouge_score'] else 0,
                    avg_similarity_b=sum(metrics_b['cosine_similarity']) / len(metrics_b['cosine_similarity']) if metrics_b['cosine_similarity'] else 0,
                    total_tokens_b=total_tokens_b,
                    total_cost_b=total_cost_b,
                    
                    # Comparison
                    model_a_wins=model_a_wins,
                    model_b_wins=model_b_wins,
                    ties=ties
                )
                session.add(summary)
                
                # Update final status
                eval_cycle.status = "completed" if failed_rows == 0 else "partial"
                eval_cycle.completed_at = datetime.utcnow()
                eval_cycle.progress = 100
                eval_cycle.processed_rows = processed_rows
                eval_cycle.failed_rows = failed_rows
                
                await session.commit()
                
                logger.info(f"Evaluation job {job_id} completed. Processed: {processed_rows}, Failed: {failed_rows}")
                
                return {
                    "job_id": job_id,
                    "status": eval_cycle.status,
                    "processed_rows": processed_rows,
                    "failed_rows": failed_rows,
                    "total_cost": summary.total_cost,
                    "total_tokens": summary.total_tokens,
                    "model_a_accuracy": summary.accuracy_a,
                    "model_b_accuracy": summary.accuracy_b,
                    "model_a_wins": model_a_wins,
                    "model_b_wins": model_b_wins
                }
        
        # Run async evaluation
        result = asyncio.run(_run_evaluation())
        return result
        
    except Exception as exc:
        logger.error(f"Evaluation job failed: {str(exc)}")
        self.retry(exc=exc, countdown=60)


async def _load_dataset_rows(session, dataset_id: str) -> List[Dict]:
    """Load dataset rows from Excel file"""
    # TODO: Implement based on your Excel service
    return []

