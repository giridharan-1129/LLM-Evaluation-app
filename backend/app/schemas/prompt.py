"""
Prompt Schemas
Pydantic models for request/response validation
"""

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class PromptVersionBase(BaseModel):
    """Base prompt version schema"""
    content: str = Field(..., min_length=1, description="Prompt content/text")
    description: str | None = Field(None, description="Version description")
    status: str = Field(default="draft", description="Status: draft, published, archived")


class PromptVersionCreate(PromptVersionBase):
    """Create prompt version schema"""
    pass


class PromptVersionResponse(PromptVersionBase):
    """Prompt version response schema"""
    id: UUID
    prompt_id: UUID
    version_number: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PromptBase(BaseModel):
    """Base prompt schema"""
    name: str = Field(..., min_length=1, max_length=255, description="Prompt name")
    description: str | None = Field(None, description="Prompt description")


class PromptCreate(PromptBase):
    """Create prompt schema"""
    content: str = Field(..., min_length=1, description="Initial prompt content")


class PromptUpdate(BaseModel):
    """Update prompt schema"""
    name: str | None = None
    description: str | None = None
    is_active: bool | None = None


class PromptResponse(PromptBase):
    """Prompt response schema"""
    id: UUID
    project_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PromptDetailResponse(PromptResponse):
    """Prompt with versions response"""
    versions: list[PromptVersionResponse] = []
