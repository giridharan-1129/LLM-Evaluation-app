"""
Prompt Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.db.database import get_session
from app.schemas.prompt import (
    PromptCreate,
    PromptUpdate,
    PromptResponse,
    PromptDetailResponse,
    PromptVersionCreate,
    PromptVersionResponse,
)
from app.db.repositories.prompt import PromptRepository, PromptVersionRepository
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/prompts", tags=["prompts"])


# Prompt CRUD Endpoints
@router.get("/project/{project_id}", response_model=list[PromptResponse])
async def get_project_prompts(
    project_id: UUID,
    page: int = 1,
    limit: int = 10,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Get all prompts for a project"""
    repo = PromptRepository(session)
    prompts, total = await repo.get_by_project_id(project_id, page, limit)
    return prompts


@router.get("/{prompt_id}", response_model=PromptDetailResponse)
async def get_prompt(
    prompt_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Get prompt with all versions"""
    repo = PromptRepository(session)
    prompt = await repo.get_by_id(prompt_id)
    
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found",
        )
    
    # Get versions
    version_repo = PromptVersionRepository(session)
    versions = await version_repo.get_by_prompt_id(prompt_id)
    
    # Convert to response format
    response = PromptDetailResponse(
        id=prompt.id,
        project_id=prompt.project_id,
        name=prompt.name,
        description=prompt.description,
        is_active=prompt.is_active,
        created_at=prompt.created_at,
        updated_at=prompt.updated_at,
        versions=[
            PromptVersionResponse(
                id=v.id,
                prompt_id=v.prompt_id,
                version_number=v.version_number,
                content=v.content,
                description=v.description,
                status=v.status,
                created_at=v.created_at,
                updated_at=v.updated_at,
            )
            for v in versions
        ],
    )
    return response


@router.post("/", response_model=PromptDetailResponse)
async def create_prompt(
    project_id: UUID,
    prompt_data: PromptCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Create new prompt with initial version"""
    repo = PromptRepository(session)
    
    # Create prompt
    prompt = await repo.create(
        project_id=project_id,
        name=prompt_data.name,
        description=prompt_data.description,
    )
    
    # Create initial version
    version_repo = PromptVersionRepository(session)
    version = await version_repo.create(
        prompt_id=prompt.id,
        content=prompt_data.content,
        status="draft",
    )
    
    return PromptDetailResponse(
        id=prompt.id,
        project_id=prompt.project_id,
        name=prompt.name,
        description=prompt.description,
        is_active=prompt.is_active,
        created_at=prompt.created_at,
        updated_at=prompt.updated_at,
        versions=[
            PromptVersionResponse(
                id=version.id,
                prompt_id=version.prompt_id,
                version_number=version.version_number,
                content=version.content,
                description=version.description,
                status=version.status,
                created_at=version.created_at,
                updated_at=version.updated_at,
            )
        ],
    )


@router.put("/{prompt_id}", response_model=PromptResponse)
async def update_prompt(
    prompt_id: UUID,
    prompt_data: PromptUpdate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Update prompt metadata"""
    repo = PromptRepository(session)
    
    prompt = await repo.update(
        prompt_id,
        name=prompt_data.name,
        description=prompt_data.description,
        is_active=prompt_data.is_active,
    )
    
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found",
        )
    
    return prompt


@router.delete("/{prompt_id}")
async def delete_prompt(
    prompt_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Delete prompt"""
    repo = PromptRepository(session)
    
    success = await repo.delete(prompt_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found",
        )
    
    return {"message": "Prompt deleted successfully"}


# Prompt Version Endpoints
@router.post("/{prompt_id}/versions", response_model=PromptVersionResponse)
async def create_prompt_version(
    prompt_id: UUID,
    version_data: PromptVersionCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Create new version of prompt"""
    # Verify prompt exists
    repo = PromptRepository(session)
    prompt = await repo.get_by_id(prompt_id)
    if not prompt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prompt not found",
        )
    
    version_repo = PromptVersionRepository(session)
    version = await version_repo.create(
        prompt_id=prompt_id,
        content=version_data.content,
        description=version_data.description,
        status=version_data.status,
    )
    
    return version


@router.get("/{prompt_id}/versions", response_model=list[PromptVersionResponse])
async def get_prompt_versions(
    prompt_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Get all versions of a prompt"""
    version_repo = PromptVersionRepository(session)
    versions = await version_repo.get_by_prompt_id(prompt_id)
    return versions
