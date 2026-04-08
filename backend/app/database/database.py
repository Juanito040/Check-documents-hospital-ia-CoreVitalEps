"""
Configuración de la base de datos SQLite con SQLAlchemy
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pathlib import Path

from app.core.config import settings

# Crear directorio data si no existe
data_dir = Path("data")
data_dir.mkdir(exist_ok=True)

# Configurar engine de SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},  # Necesario para SQLite
    echo=settings.DEBUG  # Mostrar queries SQL en modo debug
)

# Crear session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para modelos
Base = declarative_base()


def get_db():
    """
    Dependency para obtener sesión de base de datos
    Se usa en endpoints FastAPI
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Inicializar base de datos
    Crea todas las tablas definidas en los modelos
    """
    Base.metadata.create_all(bind=engine)
