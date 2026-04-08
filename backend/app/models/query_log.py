"""
Modelo de Log de Consultas
"""
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.database import Base


class QueryLog(Base):
    """Modelo para registro de consultas realizadas"""

    __tablename__ = "consultas_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario_id = Column(String(36), ForeignKey("usuarios.id"), nullable=False)
    pregunta = Column(Text, nullable=False)
    respuesta = Column(Text)
    docs_referenciados = Column(Text)  # JSON string con IDs de documentos
    tiempo_respuesta_ms = Column(Integer)
    fecha = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relaciones
    usuario = relationship("User", back_populates="consultas")

    def __repr__(self):
        return f"<QueryLog {self.id} - User {self.usuario_id}>"
