"""
Evaluation Endpoints
Create, manage, and monitor evaluation cycles
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import json

from app.db.database import get_session
from app.schemas.eval import (
    EvalConfigCreate,
    EvalConfigResponse,
    EvalDatasetCreate,
    EvalDatasetResponse,
    EvalCycleCreate,
    EvalCycleResponse,
    EvalCycleDetailResponse,
    EvalCycleProgressResponse,
    EvalEntryResponse,
)
from app.db.repositories.eval import (
    EvalConfigRepository,
    EvalDatasetRepository,
    EvalCycleRepository,
    EvalEntryRepository,
)
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/evaluations", tags=["evaluations"])


# Evaluation Configuration Endpoints
@router.post("/configs", response_model=EvalConfigResponse)
async def create_eval_config(
    project_id: UUID,
    config_data: EvalConfigCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Create evaluation configuration"""
    repo = EvalConfigRepository(session)
    config = await repo.create(
        project_id=project_id,
        model=config_data.model,
        temperature=config_data.temperature,
        max_tokens=config_data.max_tokens,
        top_p=config_data.top_p,
        frequency_penalty=config_data.frequency_penalty,
        presence_penalty=config_data.presence_penalty,
    )
    return config


@router.get("/configs/{project_id}", response_model=EvalConfigResponse)
async def get_eval_config(
    project_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Get evaluation configuration for project"""
    repo = EvalConfigRepository(session)
    config = await repo.get_by_project_id(project_id)

    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuration not found",
        )

    return config


@router.put("/configs/{config_id}", response_model=EvalConfigResponse)
async def update_eval_config(
    config_id: UUID,
    config_data: EvalConfigCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Update evaluation configuration"""
    repo = EvalConfigRepository(session)
    config = await repo.update(
        config_id,
        model=config_data.model,
        temperature=config_data.temperature,
        max_tokens=config_data.max_tokens,
        top_p=config_data.top_p,
        frequency_penalty=config_data.frequency_penalty,
        presence_penalty=config_data.presence_penalty,
    )

    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuration not found",
        )

    return config


# Dataset Endpoints
@router.post("/datasets", response_model=EvalDatasetResponse)
async def create_dataset(
    project_id: UUID,
    dataset_data: EvalDatasetCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Create evaluation dataset"""
    repo = EvalDatasetRepository(session)
    dataset = await repo.create(
        project_id=project_id,
        name=dataset_data.name,
        file_path=dataset_data.file_path,
        total_rows=dataset_data.total_rows,
        column_mappings=dataset_data.column_mappings,
    )
    return dataset


@router.get("/datasets/{project_id}", response_model=list[EvalDatasetResponse])
async def get_project_datasets(
    project_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Get all datasets for project"""
    repo = EvalDatasetRepository(session)
    datasets = await repo.get_by_project_id(project_id)
    return datasets


@router.get("/datasets/{dataset_id}/details", response_model=EvalDatasetResponse)
async def get_dataset_details(
    dataset_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Get dataset details"""
    repo = EvalDatasetRepository(session)
    dataset = await repo.get_by_id(dataset_id)

    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found",
        )

    return dataset


# Evaluation Cycle Endpoints
@router.post("/cycles", response_model=EvalCycleResponse)
async def create_eval_cycle(
    cycle_data: EvalCycleCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Create new evaluation cycle"""
    repo = EvalCycleRepository(session)
    cycle = await repo.create(
        project_id=cycle_data.project_id,
        dataset_id=cycle_data.dataset_id,
        prompt_version_id=cycle_data.prompt_version_id,
        eval_config_id=cycle_data.eval_config_id,
        name=cycle_data.name,
        total_rows=0,  # Will be updated when processing starts
    )
    return cycle


@router.get("/cycles/{cycle_id}", response_model=EvalCycleDetailResponse)
async def get_eval_cycle(
    cycle_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Get evaluation cycle details"""
    repo = EvalCycleRepository(session)
    cycle = await repo.get_by_id(cycle_id)

    if not cycle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation cycle not found",
        )

    # Get entries
    entry_repo = EvalEntryRepository(session)
    entries = await entry_repo.get_by_cycle_id(cycle_id)

    return EvalCycleDetailResponse(
        id=cycle.id,
        project_id=cycle.project_id,
        name=cycle.name,
        dataset_id=cycle.dataset_id,
        prompt_version_id=cycle.prompt_version_id,
        eval_config_id=cycle.eval_config_id,
        status=cycle.status,
        progress=cycle.progress,
        total_rows=cycle.total_rows,
        processed_rows=cycle.processed_rows,
        failed_rows=cycle.failed_rows,
        started_at=cycle.started_at,
        completed_at=cycle.completed_at,
        error_message=cycle.error_message,
        created_at=cycle.created_at,
        entries=[
            EvalEntryResponse(
                id=e.id,
                eval_cycle_id=e.eval_cycle_id,
                row_number=e.row_number,
                input_data=e.input_data,
                system_prompt=e.system_prompt,
                user_prompt=e.user_prompt,
                gpt_response=e.gpt_response,
                tokens_used=e.tokens_used,
                cost=e.cost,
                latency_ms=e.latency_ms,
                created_at=e.created_at,
                updated_at=e.updated_at,
            )
            for e in entries
        ],
    )


@router.get("/cycles/{project_id}/list", response_model=list[EvalCycleResponse])
async def get_project_eval_cycles(
    project_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Get all evaluation cycles for project"""
    repo = EvalCycleRepository(session)
    cycles = await repo.get_by_project_id(project_id)
    return cycles


@router.get("/cycles/{cycle_id}/progress", response_model=EvalCycleProgressResponse)
async def get_eval_cycle_progress(
    cycle_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Get evaluation cycle progress"""
    repo = EvalCycleRepository(session)
    cycle = await repo.get_by_id(cycle_id)

    if not cycle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation cycle not found",
        )

    return EvalCycleProgressResponse(
        id=cycle.id,
        status=cycle.status,
        progress=cycle.progress,
        processed_rows=cycle.processed_rows,
        failed_rows=cycle.failed_rows,
        total_rows=cycle.total_rows,
    )


@router.post("/cycles/{cycle_id}/cancel")
async def cancel_eval_cycle(
    cycle_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Cancel evaluation cycle"""
    repo = EvalCycleRepository(session)
    cycle = await repo.update(cycle_id, status="cancelled")

    if not cycle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluation cycle not found",
        )

    return {"message": "Evaluation cycle cancelled"}


@router.get("/cycles/{cycle_id}/entries", response_model=list[EvalEntryResponse])
async def get_eval_entries(
    cycle_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Get all entries for evaluation cycle"""
    repo = EvalEntryRepository(session)
    entries = await repo.get_by_cycle_id(cycle_id)
    return entries
