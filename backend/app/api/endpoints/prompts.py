"""
Prompt Endpoints
Handles prompt CRUD operations and versioning
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from uuid import UUID
from app.db.database import get_session
from app.db.repositories.prompt import PromptRepository
from app.models.prompt import Prompt, PromptVersion
import os

router = APIRouter(prefix="/api/v1/prompts", tags=["prompts"])


class PromptCreate(BaseModel):
    """Prompt creation schema"""
    name: str
    description: str


class PromptVersionCreate(BaseModel):
    """Prompt version creation schema"""
    version_number: str
    content: str
    description: str


class ImprovePromptRequest(BaseModel):
    """Improve prompt request"""
    prompt_text: str


class PromptResponse(BaseModel):
    """Prompt response schema"""
    id: UUID
    name: str
    description: str
    created_at: str

    class Config:
        from_attributes = True


# ===== ROUTES WITH STATIC PATHS (MUST COME FIRST) =====

@router.post("/improve")
async def improve_prompt(
    request: ImprovePromptRequest,
    session: AsyncSession = Depends(get_session),
):
    """
    Improve a prompt using DeepSeek API
    """
    try:
        from app.services.llm_service import LLMService
        
        deepseek_key = os.getenv("DEEPSEEK_API_KEY")
        if not deepseek_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="DeepSeek API key not configured"
            )
        
        llm_service = LLMService()
        improved_prompt = await llm_service.improve_prompt_with_deepseek(
            request.prompt_text,
            api_key=deepseek_key
        )
        
        return {
            "original": request.prompt_text,
            "improved": improved_prompt,
            "status": "success"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to improve prompt: {str(e)}"
        )


@router.get("/project/{project_id}")
async def get_prompts_by_project(
    project_id: UUID,
    page: int = 1,
    limit: int = 10,
    session: AsyncSession = Depends(get_session),
):
    """Get all prompts for a project"""
    try:
        repo = PromptRepository(session)
        prompts = await repo.get_by_project(project_id, page, limit)
        return {
            "prompts": prompts,
            "page": page,
            "limit": limit,
            "total": len(prompts)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ===== ROUTES WITH DYNAMIC PATHS (COME AFTER) =====

@router.post("")
async def create_prompt(
    prompt_data: PromptCreate,
    session: AsyncSession = Depends(get_session),
):
    """Create a new prompt"""
    try:
        repo = PromptRepository(session)
        prompt = await repo.create(
            name=prompt_data.name,
            description=prompt_data.description
        )
        await session.commit()
        return prompt
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{prompt_id}")
async def get_prompt(
    prompt_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    """Get a specific prompt"""
    try:
        repo = PromptRepository(session)
        prompt = await repo.get_by_id(prompt_id)
        if not prompt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Prompt not found"
            )
        return prompt
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/{prompt_id}/versions")
async def create_prompt_version(
    prompt_id: UUID,
    version_data: PromptVersionCreate,
    session: AsyncSession = Depends(get_session),
):
    """Create a new version of a prompt"""
    try:
        repo = PromptRepository(session)
        version = await repo.create_version(
            prompt_id=prompt_id,
            version_number=version_data.version_number,
            content=version_data.content,
            description=version_data.description
        )
        await session.commit()
        return version
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{prompt_id}")
async def delete_prompt(
    prompt_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    """Delete a prompt"""
    try:
        repo = PromptRepository(session)
        await repo.delete(prompt_id)
        await session.commit()
        return {"status": "success", "message": "Prompt deleted"}
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
