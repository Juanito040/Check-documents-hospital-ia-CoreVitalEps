"""
Modelo de Usuario
"""
from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
import uuid

from app.database.database import Base


class User(Base):
    """Modelo de Usuario del sistema"""

    __tablename__ = "usuarios"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nombre = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(20), nullable=False)  # 'medico', 'admin' o 'enfermero'
    activo = Column(Boolean, default=True, nullable=False)

    # Relaciones
    documentos = relationship("Document", back_populates="usuario")
    consultas = relationship("QueryLog", back_populates="usuario")

    def __repr__(self):
        return f"<User {self.email} ({self.rol})>"
