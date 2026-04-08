"""
Esquemas Pydantic para Usuario
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Esquema base de usuario"""
    email: EmailStr
    nombre: str = Field(..., min_length=2, max_length=100)
    rol: str = Field(..., pattern="^(medico|admin|enfermero)$")


class UserCreate(UserBase):
    """Esquema para crear usuario"""
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    """Esquema para actualizar usuario"""
    nombre: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    rol: Optional[str] = Field(None, pattern="^(medico|admin|enfermero)$")
    activo: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=6)


class UserResponse(UserBase):
    """Esquema de respuesta de usuario"""
    id: str
    activo: bool

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Esquema para login"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Esquema de token JWT"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Datos contenidos en el token"""
    user_id: Optional[str] = None
    email: Optional[str] = None
    rol: Optional[str] = None
