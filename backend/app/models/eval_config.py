"""
Evaluation Configuration Model
Stores model parameters and settings for evaluations
"""

from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.db.database import Base


class EvalConfiguration(Base):
    """Evaluation configuration model"""
    __tablename__ = "eval_configurations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    model = Column(String(50), nullable=False)  # gpt-4, gpt-3.5-turbo, etc
    temperature = Column(Float, default=0.7)    # 0.0 to 2.0
    max_tokens = Column(Integer, default=2000)
    top_p = Column(Float, default=1.0)
    frequency_penalty = Column(Float, default=0.0)
    presence_penalty = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
