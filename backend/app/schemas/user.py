"""
User Schemas
Pydantic models for request/response validation
"""

from pydantic import BaseModel, Field, EmailStr, field_validator
from uuid import UUID
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr = Field(..., description="User email")
    name: str = Field(..., min_length=1, max_length=255, description="User name")


class UserCreate(UserBase):
    """User creation schema"""
    password: str = Field(..., min_length=8, max_length=72, description="User password (max 72 bytes for bcrypt)")
    confirm_password: str = Field(..., min_length=8, max_length=72, description="Confirm password")

    @field_validator('password')
    @classmethod
    def validate_password_length(cls, v):
        """Ensure password is not longer than 72 bytes"""
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password must be 72 bytes or less')
        return v


class LoginCredentials(BaseModel):
    """Login credentials schema"""
    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., description="User password")


class UserUpdate(BaseModel):
    """User update schema"""
    email: EmailStr | None = None
    name: str | None = None


class UserResponse(BaseModel):
    """User response schema"""
    id: UUID
    email: str
    name: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Token response schema"""
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: UserResponse
