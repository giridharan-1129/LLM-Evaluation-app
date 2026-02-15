"""
Evaluation Cycle Models
Represents evaluation runs and individual entries
Now supports dual-model evaluation with separate outputs and metrics
"""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Float, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.database import Base


class EvalCycle(Base):
    """Evaluation cycle model - represents a single evaluation run"""
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
    
    # Relationships
    entries = relationship("EvalEntry", back_populates="eval_cycle", cascade="all, delete-orphan")


class EvalEntry(Base):
    """
    Individual evaluation entry
    Now supports dual-model evaluation with separate outputs and metrics
    """
    __tablename__ = "eval_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    eval_cycle_id = Column(UUID(as_uuid=True), ForeignKey("eval_cycles.id"), nullable=False)
    row_number = Column(Integer, nullable=False)
    
    # Input Data
    input_data = Column(JSON, nullable=False)  # JSON of the row
    system_prompt = Column(Text, nullable=False)
    user_prompt = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=True)
    
    # Model A Output (Primary)
    output_a = Column(Text, nullable=True)
    model_a = Column(String(255), nullable=True)  # e.g., "gpt-4", "deepseek-chat"
    provider_a = Column(String(50), nullable=True)  # openai, deepseek, anthropic
    temperature_a = Column(Float, default=0.7)
    
    # Model B Output (Secondary - for comparison)
    output_b = Column(Text, nullable=True)
    model_b = Column(String(255), nullable=True)  # e.g., "claude-3-sonnet"
    provider_b = Column(String(50), nullable=True)  # openai, deepseek, anthropic
    temperature_b = Column(Float, default=0.7)
    
    # Token Tracking Model A
    tokens_input_a = Column(Integer, default=0)
    tokens_output_a = Column(Integer, default=0)
    tokens_total_a = Column(Integer, default=0)
    
    # Token Tracking Model B
    tokens_input_b = Column(Integer, default=0)
    tokens_output_b = Column(Integer, default=0)
    tokens_total_b = Column(Integer, default=0)
    
    # Cost Tracking
    cost_a = Column(Float, default=0.0)
    cost_b = Column(Float, default=0.0)
    total_cost = Column(Float, default=0.0)
    
    # Latency Tracking
    latency_ms_a = Column(Integer, default=0)
    latency_ms_b = Column(Integer, default=0)
    
    # Metrics for Model A
    accuracy_a = Column(Float, nullable=True)
    precision_a = Column(Float, nullable=True)
    recall_a = Column(Float, nullable=True)
    f1_score_a = Column(Float, nullable=True)
    bleu_score_a = Column(Float, nullable=True)
    rouge_score_a = Column(Float, nullable=True)
    cosine_similarity_a = Column(Float, nullable=True)
    
    # Metrics for Model B
    accuracy_b = Column(Float, nullable=True)
    precision_b = Column(Float, nullable=True)
    recall_b = Column(Float, nullable=True)
    f1_score_b = Column(Float, nullable=True)
    bleu_score_b = Column(Float, nullable=True)
    rouge_score_b = Column(Float, nullable=True)
    cosine_similarity_b = Column(Float, nullable=True)
    
    # Comparison Metrics
    winner = Column(String(50), nullable=True)  # "model_a", "model_b", "tie"
    confidence = Column(Float, nullable=True)  # 0-1, how confident the winner selection is
    
    # Status and Timestamps
    status = Column(String(50), default="pending")  # pending, completed, failed
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    eval_cycle = relationship("EvalCycle", back_populates="entries")


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
    
    # Overall Stats
    total_rows = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    total_cost = Column(Float, default=0.0)
    avg_latency_ms = Column(Integer, default=0)
    
    # Model A Metrics
    accuracy_a = Column(Float, default=0.0)
    precision_a = Column(Float, default=0.0)
    recall_a = Column(Float, default=0.0)
    f1_score_a = Column(Float, default=0.0)
    avg_similarity_a = Column(Float, default=0.0)
    avg_bleu_a = Column(Float, default=0.0)
    avg_rouge_a = Column(Float, default=0.0)
    total_tokens_a = Column(Integer, default=0)
    total_cost_a = Column(Float, default=0.0)
    
    # Model B Metrics
    accuracy_b = Column(Float, default=0.0)
    precision_b = Column(Float, default=0.0)
    recall_b = Column(Float, default=0.0)
    f1_score_b = Column(Float, default=0.0)
    avg_similarity_b = Column(Float, default=0.0)
    avg_bleu_b = Column(Float, default=0.0)
    avg_rouge_b = Column(Float, default=0.0)
    total_tokens_b = Column(Integer, default=0)
    total_cost_b = Column(Float, default=0.0)
    
    # Comparison Results
    model_a_wins = Column(Integer, default=0)  # How many times model A won
    model_b_wins = Column(Integer, default=0)  # How many times model B won
    ties = Column(Integer, default=0)  # How many times tie
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

