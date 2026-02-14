"""
Evaluation Repository
Data access layer for evaluation configurations, datasets, and cycles
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from uuid import UUID
from typing import Optional

from app.models.eval_config import EvalConfiguration
from app.models.dataset import EvalDataset
from app.models.eval_cycle import EvalCycle, EvalEntry, EvalMetrics, EvalCycleSummary


class EvalConfigRepository:
    """Evaluation configuration repository"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        project_id: UUID,
        model: str,
        temperature: float,
        max_tokens: int,
        top_p: float,
        frequency_penalty: float,
        presence_penalty: float,
    ) -> EvalConfiguration:
        """Create new eval configuration"""
        config = EvalConfiguration(
            project_id=project_id,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            top_p=top_p,
            frequency_penalty=frequency_penalty,
            presence_penalty=presence_penalty,
        )
        self.session.add(config)
        await self.session.commit()
        await self.session.refresh(config)
        return config

    async def get_by_project_id(self, project_id: UUID) -> Optional[EvalConfiguration]:
        """Get active config for project"""
        stmt = select(EvalConfiguration).where(
            (EvalConfiguration.project_id == project_id) &
            (EvalConfiguration.is_active == True)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id(self, config_id: UUID) -> Optional[EvalConfiguration]:
        """Get config by ID"""
        stmt = select(EvalConfiguration).where(EvalConfiguration.id == config_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update(self, config_id: UUID, **kwargs) -> Optional[EvalConfiguration]:
        """Update config"""
        config = await self.get_by_id(config_id)
        if not config:
            return None

        for key, value in kwargs.items():
            if value is not None:
                setattr(config, key, value)

        await self.session.commit()
        await self.session.refresh(config)
        return config


class EvalDatasetRepository:
    """Evaluation dataset repository"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        project_id: UUID,
        name: str,
        file_path: str,
        total_rows: int,
        column_mappings: Optional[str] = None,
    ) -> EvalDataset:
        """Create new dataset"""
        dataset = EvalDataset(
            project_id=project_id,
            name=name,
            file_path=file_path,
            total_rows=total_rows,
            column_mappings=column_mappings,
        )
        self.session.add(dataset)
        await self.session.commit()
        await self.session.refresh(dataset)
        return dataset

    async def get_by_id(self, dataset_id: UUID) -> Optional[EvalDataset]:
        """Get dataset by ID"""
        stmt = select(EvalDataset).where(EvalDataset.id == dataset_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_project_id(self, project_id: UUID) -> list[EvalDataset]:
        """Get all datasets for project"""
        stmt = select(EvalDataset).where(
            EvalDataset.project_id == project_id
        ).order_by(desc(EvalDataset.created_at))
        result = await self.session.execute(stmt)
        return result.scalars().all()


class EvalCycleRepository:
    """Evaluation cycle repository"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        project_id: UUID,
        dataset_id: UUID,
        prompt_version_id: UUID,
        eval_config_id: UUID,
        name: str,
        total_rows: int,
    ) -> EvalCycle:
        """Create new eval cycle"""
        cycle = EvalCycle(
            project_id=project_id,
            dataset_id=dataset_id,
            prompt_version_id=prompt_version_id,
            eval_config_id=eval_config_id,
            name=name,
            total_rows=total_rows,
        )
        self.session.add(cycle)
        await self.session.commit()
        await self.session.refresh(cycle)
        return cycle

    async def get_by_id(self, cycle_id: UUID) -> Optional[EvalCycle]:
        """Get cycle by ID"""
        stmt = select(EvalCycle).where(EvalCycle.id == cycle_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_project_id(self, project_id: UUID) -> list[EvalCycle]:
        """Get all cycles for project"""
        stmt = select(EvalCycle).where(
            EvalCycle.project_id == project_id
        ).order_by(desc(EvalCycle.created_at))
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def update_progress(
        self,
        cycle_id: UUID,
        processed_rows: int,
        failed_rows: int,
        status: Optional[str] = None,
    ) -> Optional[EvalCycle]:
        """Update cycle progress"""
        cycle = await self.get_by_id(cycle_id)
        if not cycle:
            return None

        cycle.processed_rows = processed_rows
        cycle.failed_rows = failed_rows
        cycle.progress = int((processed_rows / cycle.total_rows) * 100)

        if status:
            cycle.status = status

        await self.session.commit()
        await self.session.refresh(cycle)
        return cycle


class EvalEntryRepository:
    """Evaluation entry repository"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        eval_cycle_id: UUID,
        row_number: int,
        input_data: str,
        system_prompt: str,
        user_prompt: str,
        gpt_response: Optional[str] = None,
        tokens_used: int = 0,
        cost: float = 0.0,
        latency_ms: int = 0,
    ) -> EvalEntry:
        """Create new eval entry"""
        entry = EvalEntry(
            eval_cycle_id=eval_cycle_id,
            row_number=row_number,
            input_data=input_data,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            gpt_response=gpt_response,
            tokens_used=tokens_used,
            cost=cost,
            latency_ms=latency_ms,
        )
        self.session.add(entry)
        await self.session.commit()
        await self.session.refresh(entry)
        return entry

    async def get_by_cycle_id(self, cycle_id: UUID) -> list[EvalEntry]:
        """Get all entries for cycle"""
        stmt = select(EvalEntry).where(
            EvalEntry.eval_cycle_id == cycle_id
        ).order_by(EvalEntry.row_number)
        result = await self.session.execute(stmt)
        return result.scalars().all()


class EvalMetricsRepository:
    """Evaluation metrics repository"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        eval_entry_id: UUID,
        expected_output: str,
        actual_output: str,
        similarity_score: float = 0.0,
        exact_match: int = 0,
        token_f1: float = 0.0,
        bleu_score: float = 0.0,
        rouge_score: float = 0.0,
    ) -> EvalMetrics:
        """Create metrics for entry"""
        metrics = EvalMetrics(
            eval_entry_id=eval_entry_id,
            expected_output=expected_output,
            actual_output=actual_output,
            similarity_score=similarity_score,
            exact_match=exact_match,
            token_f1=token_f1,
            bleu_score=bleu_score,
            rouge_score=rouge_score,
        )
        self.session.add(metrics)
        await self.session.commit()
        await self.session.refresh(metrics)
        return metrics


class EvalCycleSummaryRepository:
    """Evaluation cycle summary repository"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_or_update(
        self,
        eval_cycle_id: UUID,
        total_tokens: int,
        total_cost: float,
        avg_latency_ms: int,
        accuracy: float,
        precision: float,
        recall: float,
        f1_score: float,
        avg_similarity: float,
        avg_bleu: float,
        avg_rouge: float,
    ) -> EvalCycleSummary:
        """Create or update summary"""
        stmt = select(EvalCycleSummary).where(
            EvalCycleSummary.eval_cycle_id == eval_cycle_id
        )
        result = await self.session.execute(stmt)
        summary = result.scalar_one_or_none()

        if summary:
            summary.total_tokens = total_tokens
            summary.total_cost = total_cost
            summary.avg_latency_ms = avg_latency_ms
            summary.accuracy = accuracy
            summary.precision = precision
            summary.recall = recall
            summary.f1_score = f1_score
            summary.avg_similarity = avg_similarity
            summary.avg_bleu = avg_bleu
            summary.avg_rouge = avg_rouge
        else:
            summary = EvalCycleSummary(
                eval_cycle_id=eval_cycle_id,
                total_tokens=total_tokens,
                total_cost=total_cost,
                avg_latency_ms=avg_latency_ms,
                accuracy=accuracy,
                precision=precision,
                recall=recall,
                f1_score=f1_score,
                avg_similarity=avg_similarity,
                avg_bleu=avg_bleu,
                avg_rouge=avg_rouge,
            )
            self.session.add(summary)

        await self.session.commit()
        await self.session.refresh(summary)
        return summary

    async def get_by_cycle_id(self, cycle_id: UUID) -> Optional[EvalCycleSummary]:
        """Get summary for cycle"""
        stmt = select(EvalCycleSummary).where(
            EvalCycleSummary.eval_cycle_id == cycle_id
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
