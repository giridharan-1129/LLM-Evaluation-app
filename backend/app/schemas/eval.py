"""
Evaluation Schemas
Pydantic models for evaluation configuration, datasets, and cycles
"""

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional


# Evaluation Configuration Schemas
class EvalConfigBase(BaseModel):
    """Base eval config schema"""
    model: str = Field(..., description="Model name (gpt-4, gpt-3.5-turbo)")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=2000, ge=1, le=4000)
    top_p: float = Field(default=1.0, ge=0.0, le=1.0)
    frequency_penalty: float = Field(default=0.0, ge=-2.0, le=2.0)
    presence_penalty: float = Field(default=0.0, ge=-2.0, le=2.0)


class EvalConfigCreate(EvalConfigBase):
    """Create eval config schema"""
    pass


class EvalConfigResponse(EvalConfigBase):
    """Eval config response schema"""
    id: UUID
    project_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Dataset Schemas
class EvalDatasetBase(BaseModel):
    """Base dataset schema"""
    name: str = Field(..., min_length=1, max_length=255)
    total_rows: int = Field(..., ge=1)
    column_mappings: Optional[str] = None


class EvalDatasetCreate(EvalDatasetBase):
    """Create dataset schema"""
    file_path: str


class EvalDatasetResponse(EvalDatasetBase):
    """Dataset response schema"""
    id: UUID
    project_id: UUID
    file_path: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Evaluation Entry Schemas
class EvalEntryBase(BaseModel):
    """Base eval entry schema"""
    row_number: int
    input_data: str
    system_prompt: str
    user_prompt: str


class EvalEntryResponse(EvalEntryBase):
    """Eval entry response schema"""
    id: UUID
    eval_cycle_id: UUID
    gpt_response: Optional[str] = None
    tokens_used: int
    cost: float
    latency_ms: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Evaluation Metrics Schemas
class EvalMetricsBase(BaseModel):
    """Base metrics schema"""
    expected_output: str
    actual_output: str
    similarity_score: float = Field(default=0.0, ge=0.0, le=1.0)
    exact_match: int = Field(default=0)
    token_f1: float = Field(default=0.0)
    bleu_score: float = Field(default=0.0)
    rouge_score: float = Field(default=0.0)


class EvalMetricsResponse(EvalMetricsBase):
    """Metrics response schema"""
    id: UUID
    eval_entry_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# Evaluation Cycle Summary Schemas
class EvalCycleSummaryBase(BaseModel):
    """Base summary schema"""
    total_tokens: int
    total_cost: float
    avg_latency_ms: int
    accuracy: float = Field(ge=0.0, le=1.0)
    precision: float = Field(ge=0.0, le=1.0)
    recall: float = Field(ge=0.0, le=1.0)
    f1_score: float = Field(ge=0.0, le=1.0)
    avg_similarity: float = Field(ge=0.0, le=1.0)
    avg_bleu: float = Field(ge=0.0, le=1.0)
    avg_rouge: float = Field(ge=0.0, le=1.0)


class EvalCycleSummaryResponse(EvalCycleSummaryBase):
    """Summary response schema"""
    id: UUID
    eval_cycle_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Evaluation Cycle Schemas
class EvalCycleBase(BaseModel):
    """Base eval cycle schema"""
    name: str = Field(..., min_length=1, max_length=255)
    dataset_id: UUID
    prompt_version_id: UUID
    eval_config_id: UUID


class EvalCycleCreate(EvalCycleBase):
    """Create eval cycle schema"""
    pass


class EvalCycleResponse(EvalCycleBase):
    """Eval cycle response schema"""
    id: UUID
    project_id: UUID
    status: str  # pending, running, completed, failed
    progress: int  # 0-100%
    total_rows: int
    processed_rows: int
    failed_rows: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class EvalCycleDetailResponse(EvalCycleResponse):
    """Eval cycle with summary"""
    summary: Optional[EvalCycleSummaryResponse] = None
    entries: Optional[list[EvalEntryResponse]] = []


class EvalCycleProgressResponse(BaseModel):
    """Eval cycle progress response"""
    id: UUID
    status: str
    progress: int
    processed_rows: int
    failed_rows: int
    total_rows: int
    estimated_time_remaining_seconds: Optional[int] = None
