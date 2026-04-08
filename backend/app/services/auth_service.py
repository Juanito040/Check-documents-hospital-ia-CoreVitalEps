"""
Servicio de autenticación
"""
from sqlalchemy.orm import Session
from typing import Optional

from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password


class AuthService:
    """Servicio para operaciones de autenticación"""

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """
        Autenticar usuario con email y contraseña
        Retorna el usuario si las credenciales son correctas, None si no
        """
        user = db.query(User).filter(User.email == email).first()

        if not user:
            return None

        if not user.activo:
            return None

        if not verify_password(password, user.password_hash):
            return None

        return user

    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """
        Crear nuevo usuario
        """
        # Verificar si el email ya existe
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise ValueError("El email ya está registrado")

        # Crear usuario
        user = User(
            nombre=user_data.nombre,
            email=user_data.email,
            password_hash=get_password_hash(user_data.password),
            rol=user_data.rol,
            activo=True
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """
        Obtener usuario por email
        """
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        """
        Obtener usuario por ID
        """
        return db.query(User).filter(User.id == user_id).first()
