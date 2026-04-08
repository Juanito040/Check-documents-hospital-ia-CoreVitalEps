"""
Esquemas Pydantic para Documento
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class DocumentBase(BaseModel):
    """Esquema base de documento"""
    nombre_archivo: str
    categoria: str = Field(..., pattern="^(protocolo|normativa|historia_clinica)$")


class DocumentCreate(DocumentBase):
    """Esquema para crear documento"""
    pass


class DocumentResponse(DocumentBase):
    """Esquema de respuesta de documento"""
    id: str
    fecha_carga: datetime
    usuario_id: str
    num_chunks: int
    estado: str

    class Config:
        from_attributes = True


class DocumentList(BaseModel):
    """Esquema para lista de documentos"""
    total: int
    documents: list[DocumentResponse]


class DocumentUploadResponse(BaseModel):
    """Respuesta de carga de documento"""
    message: str
    document_id: str
    filename: str
    chunks_created: int
    category: str
