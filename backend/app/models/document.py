"""
Modelo de Documento
"""
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database.database import Base


class Document(Base):
    """Modelo de Documento indexado en el sistema"""

    __tablename__ = "documentos"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nombre_archivo = Column(String(255), nullable=False)
    categoria = Column(String(50), nullable=False)  # 'protocolo', 'normativa', 'historia_clinica'
    fecha_carga = Column(DateTime, default=datetime.utcnow, nullable=False)
    usuario_id = Column(String(36), ForeignKey("usuarios.id"), nullable=False)
    num_chunks = Column(Integer, default=0)
    estado = Column(String(20), default="activo", nullable=False)  # 'activo' o 'eliminado'

    # Relaciones
    usuario = relationship("User", back_populates="documentos")

    def __repr__(self):
        return f"<Document {self.nombre_archivo} ({self.categoria})>"
