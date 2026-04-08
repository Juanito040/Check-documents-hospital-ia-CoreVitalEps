"""
Script para inicializar la base de datos
Crea todas las tablas y un usuario administrador por defecto
"""
import os
import sys
from pathlib import Path

# Agregar el directorio actual al path
sys.path.append(str(Path(__file__).parent))

from app.database.database import init_db, SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Credenciales del admin leídas desde variables de entorno
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@corevital.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")


def create_default_admin():
    """Crear usuario administrador por defecto"""
    if not ADMIN_PASSWORD:
        logger.error("❌ Variable ADMIN_PASSWORD no definida en .env. No se creará el admin.")
        return

    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if existing_admin:
            logger.info("✅ Usuario administrador ya existe")
            return

        admin = User(
            nombre="Administrador",
            email=ADMIN_EMAIL,
            password_hash=get_password_hash(ADMIN_PASSWORD),
            rol="admin",
            activo=True
        )
        db.add(admin)
        db.commit()
        logger.info("✅ Usuario administrador creado exitosamente")
        logger.info(f"   Email: {ADMIN_EMAIL}")
    except Exception as e:
        logger.error(f"❌ Error al crear administrador: {e}")
        db.rollback()
    finally:
        db.close()


def main():
    """Función principal"""
    logger.info("🔧 Inicializando base de datos...")

    # Crear tablas
    init_db()
    logger.info("✅ Tablas creadas exitosamente")

    # Crear admin por defecto
    create_default_admin()

    logger.info("✅ Base de datos inicializada correctamente")


if __name__ == "__main__":
    main()
