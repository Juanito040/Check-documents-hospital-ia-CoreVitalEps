"""
Esquemas Pydantic para Consultas (Query)
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class QueryRequest(BaseModel):
    """Esquema para realizar una consulta"""
    question: str = Field(..., min_length=3, max_length=1000)
    category_filter: Optional[str] = Field(None, pattern="^(protocolo|normativa|historia_clinica)$")
    top_k: Optional[int] = Field(None, ge=1, le=20)


class Source(BaseModel):
    """Esquema para una fuente/referencia"""
    document_id: str
    filename: str
    category: str
    chunk_index: int


class QueryResponse(BaseModel):
    """Esquema de respuesta de consulta"""
    answer: str
    sources: List[Source]
    chunks_used: int
    response_time_ms: int
    category_filter: Optional[str] = None


class QueryHistoryItem(BaseModel):
    """Esquema para un item del historial"""
    id: int
    pregunta: str
    respuesta: str
    fecha: datetime
    tiempo_respuesta_ms: int

    class Config:
        from_attributes = True


class QueryHistoryResponse(BaseModel):
    """Esquema para historial de consultas"""
    total: int
    queries: List[QueryHistoryItem]
