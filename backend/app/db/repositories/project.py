"""
Project Repository
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from uuid import UUID
from typing import Optional

from app.models.project import Project


class ProjectRepository:
    """Project data access object"""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, project_id: UUID) -> Optional[Project]:
        """Get project by ID"""
        stmt = select(Project).where(Project.id == project_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_user_id(
        self, user_id: UUID, page: int = 1, limit: int = 10
    ) -> tuple[list[Project], int]:
        """Get projects by user ID with pagination"""
        stmt = select(Project).where(Project.user_id == user_id)
        
        # Get total count
        count_stmt = select(Project).where(Project.user_id == user_id)
        count_result = await self.session.execute(count_stmt)
        total = len(count_result.scalars().all())

        # Get paginated results
        stmt = stmt.order_by(desc(Project.created_at))
        stmt = stmt.offset((page - 1) * limit).limit(limit)
        result = await self.session.execute(stmt)
        projects = result.scalars().all()

        return projects, total

    async def create(
        self, user_id: UUID, name: str, description: Optional[str] = None
    ) -> Project:
        """Create new project"""
        project = Project(
            user_id=user_id, name=name, description=description
        )
        self.session.add(project)
        await self.session.commit()
        await self.session.refresh(project)
        return project

    async def update(self, project_id: UUID, **kwargs) -> Optional[Project]:
        """Update project"""
        project = await self.get_by_id(project_id)
        if not project:
            return None

        for key, value in kwargs.items():
            if value is not None:
                setattr(project, key, value)

        await self.session.commit()
        await self.session.refresh(project)
        return project

    async def delete(self, project_id: UUID) -> bool:
        """Delete project"""
        project = await self.get_by_id(project_id)
        if not project:
            return False

        await self.session.delete(project)
        await self.session.commit()
        return True
