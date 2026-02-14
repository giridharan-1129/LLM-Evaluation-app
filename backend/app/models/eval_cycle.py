"""
Evaluation Cycle Model
Represents a single evaluation run
"""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from app.db.database import Base


class EvalCycle(Base):
    """Evaluation cycle model"""
    __tablename__ = "eval_cycles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("eval_datasets.id"), nullable=False)
    prompt_version_id = Column(UUID(as_uuid=True), ForeignKey("prompt_versions.id"), nullable=False)
    eval_config_id = Column(UUID(as_uuid=True), ForeignKey("eval_configurations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    progress = Column(Integer, default=0)  # 0-100%
    total_rows = Column(Integer, nullable=False)
    processed_rows = Column(Integer, default=0)
    failed_rows = Column(Integer, default=0)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class EvalEntry(Base):
    """Individual evaluation entry"""
    __tablename__ = "eval_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    eval_cycle_id = Column(UUID(as_uuid=True), ForeignKey("eval_cycles.id"), nullable=False)
    row_number = Column(Integer, nullable=False)
    input_data = Column(String(4096), nullable=False)  # JSON string
    system_prompt = Column(Text, nullable=False)
    user_prompt = Column(Text, nullable=False)
    gpt_response = Column(Text, nullable=True)
    tokens_used = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    latency_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class EvalMetrics(Base):
    """Metrics for evaluation entry"""
    __tablename__ = "eval_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    eval_entry_id = Column(UUID(as_uuid=True), ForeignKey("eval_entries.id"), nullable=False)
    expected_output = Column(Text, nullable=False)
    actual_output = Column(Text, nullable=False)
    similarity_score = Column(Float, default=0.0)  # 0-1
    exact_match = Column(Integer, default=0)  # 0 or 1
    token_f1 = Column(Float, default=0.0)
    bleu_score = Column(Float, default=0.0)
    rouge_score = Column(Float, default=0.0)
    custom_metrics = Column(String(2048), nullable=True)  # JSON
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class EvalCycleSummary(Base):
    """Summary metrics for entire eval cycle"""
    __tablename__ = "eval_cycle_summary"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    eval_cycle_id = Column(UUID(as_uuid=True), ForeignKey("eval_cycles.id"), nullable=False, unique=True)
    total_tokens = Column(Integer, default=0)
    total_cost = Column(Float, default=0.0)
    avg_latency_ms = Column(Integer, default=0)
    accuracy = Column(Float, default=0.0)  # % exact matches
    precision = Column(Float, default=0.0)
    recall = Column(Float, default=0.0)
    f1_score = Column(Float, default=0.0)
    avg_similarity = Column(Float, default=0.0)
    avg_bleu = Column(Float, default=0.0)
    avg_rouge = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
