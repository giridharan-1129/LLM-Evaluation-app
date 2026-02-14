"""
Dataset Model
Represents uploaded Excel files with evaluation data
"""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.db.database import Base


class EvalDataset(Base):
    """Evaluation dataset model"""
    __tablename__ = "eval_datasets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)  # Path to uploaded Excel file
    total_rows = Column(Integer, nullable=False)
    column_mappings = Column(String(512), nullable=True)  # JSON mapping
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
