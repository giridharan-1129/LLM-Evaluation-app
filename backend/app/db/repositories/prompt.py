"""
Prompt Repository
Data access layer for prompts
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from uuid import UUID
from typing import Optional

from app.models.prompt import Prompt, PromptVersion


class PromptRepository:
    """Prompt data access object"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, prompt_id: UUID) -> Optional[Prompt]:
        """Get prompt by ID"""
        stmt = select(Prompt).where(Prompt.id == prompt_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_project_id(
        self, project_id: UUID, page: int = 1, limit: int = 10
    ) -> tuple[list[Prompt], int]:
        """Get prompts by project ID with pagination"""
        # Get total count
        stmt = select(Prompt).where(Prompt.project_id == project_id)
        result = await self.session.execute(stmt)
        total = len(result.scalars().all())

        # Get paginated results
        stmt = (
            select(Prompt)
            .where(Prompt.project_id == project_id)
            .order_by(desc(Prompt.created_at))
            .offset((page - 1) * limit)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        prompts = result.scalars().all()

        return prompts, total

    async def create(
        self, project_id: UUID, name: str, description: Optional[str] = None
    ) -> Prompt:
        """Create new prompt"""
        prompt = Prompt(
            project_id=project_id, name=name, description=description
        )
        self.session.add(prompt)
        await self.session.commit()
        await self.session.refresh(prompt)
        return prompt

    async def update(self, prompt_id: UUID, **kwargs) -> Optional[Prompt]:
        """Update prompt"""
        prompt = await self.get_by_id(prompt_id)
        if not prompt:
            return None

        for key, value in kwargs.items():
            if value is not None:
                setattr(prompt, key, value)

        await self.session.commit()
        await self.session.refresh(prompt)
        return prompt

    async def delete(self, prompt_id: UUID) -> bool:
        """Delete prompt"""
        prompt = await self.get_by_id(prompt_id)
        if not prompt:
            return False

        await self.session.delete(prompt)
        await self.session.commit()
        return True


class PromptVersionRepository:
    """Prompt version data access object"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, version_id: UUID) -> Optional[PromptVersion]:
        """Get prompt version by ID"""
        stmt = select(PromptVersion).where(PromptVersion.id == version_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_prompt_id(
        self, prompt_id: UUID
    ) -> list[PromptVersion]:
        """Get all versions of a prompt"""
        stmt = (
            select(PromptVersion)
            .where(PromptVersion.prompt_id == prompt_id)
            .order_by(desc(PromptVersion.version_number))
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def create(
        self,
        prompt_id: UUID,
        content: str,
        description: Optional[str] = None,
        status: str = "draft",
    ) -> PromptVersion:
        """Create new prompt version"""
        # Get next version number
        stmt = select(PromptVersion).where(PromptVersion.prompt_id == prompt_id)
        result = await self.session.execute(stmt)
        versions = result.scalars().all()
        next_version = len(versions) + 1

        version = PromptVersion(
            prompt_id=prompt_id,
            version_number=next_version,
            content=content,
            description=description,
            status=status,
        )
        self.session.add(version)
        await self.session.commit()
        await self.session.refresh(version)
        return version

    async def update(self, version_id: UUID, **kwargs) -> Optional[PromptVersion]:
        """Update prompt version"""
        version = await self.get_by_id(version_id)
        if not version:
            return None

        for key, value in kwargs.items():
            if value is not None:
                setattr(version, key, value)

        await self.session.commit()
        await self.session.refresh(version)
        return version
