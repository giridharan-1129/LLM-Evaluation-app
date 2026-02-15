"""
EvalEntry Model
Stores individual evaluation results for each row in a dataset
Now supports dual-model evaluation with separate outputs and metrics
"""

from sqlalchemy import Column, String, Text, Float, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class EvalEntry(Base):
    """
    Evaluation Entry Model
    Represents one row of evaluation results
    Supports comparing outputs from two different LLM models
    """
    
    __tablename__ = "eval_entries"
    
    # Primary Key
    id = Column(String(36), primary_key=True, index=True)
    
    # Foreign Keys
    job_id = Column(String(36), ForeignKey("eval_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    dataset_id = Column(String(36), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    
    # Input Data
    input_data = Column(JSON, nullable=False)  # Original row from Excel
    system_prompt = Column(Text, nullable=False)
    user_prompt = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=True)
    
    # Model A Output
    output_a = Column(Text, nullable=True)
    model_a = Column(String(255), nullable=True)
    provider_a = Column(String(50), nullable=True)  # openai, deepseek, anthropic
    temperature_a = Column(Float, default=0.7)
    
    # Model B Output
    output_b = Column(Text, nullable=True)
    model_b = Column(String(255), nullable=True)
    provider_b = Column(String(50), nullable=True)  # openai, deepseek, anthropic
    temperature_b = Column(Float, default=0.7)
    
    # Token Tracking
    tokens_input_a = Column(Integer, default=0)
    tokens_output_a = Column(Integer, default=0)
    tokens_total_a = Column(Integer, default=0)
    
    tokens_input_b = Column(Integer, default=0)
    tokens_output_b = Column(Integer, default=0)
    tokens_total_b = Column(Integer, default=0)
    
    # Cost Tracking
    cost_a = Column(Float, default=0.0)
    cost_b = Column(Float, default=0.0)
    total_cost = Column(Float, default=0.0)
    
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
    winner = Column(String(50), nullable=True)  # "model_a", "model_b", or "tie"
    confidence = Column(Float, nullable=True)  # How confident the winner selection is (0-1)
    
    # Status and Timestamps
    status = Column(String(50), default="pending")  # pending, completed, failed
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    job = relationship("EvalJob", back_populates="entries")
    dataset = relationship("Dataset", back_populates="eval_entries")
    
    def __repr__(self):
        return f"<EvalEntry(id={self.id}, job_id={self.job_id}, status={self.status})>"
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "job_id": self.job_id,
            "dataset_id": self.dataset_id,
            "input_data": self.input_data,
            "system_prompt": self.system_prompt,
            "user_prompt": self.user_prompt,
            "expected_output": self.expected_output,
            "output_a": self.output_a,
            "output_b": self.output_b,
            "model_a": self.model_a,
            "model_b": self.model_b,
            "provider_a": self.provider_a,
            "provider_b": self.provider_b,
            "tokens_total_a": self.tokens_total_a,
            "tokens_total_b": self.tokens_total_b,
            "cost_a": self.cost_a,
            "cost_b": self.cost_b,
            "total_cost": self.total_cost,
            "accuracy_a": self.accuracy_a,
            "accuracy_b": self.accuracy_b,
            "winner": self.winner,
            "confidence": self.confidence,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

