"""
Endpoints de autenticación
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.user import UserCreate, UserResponse, UserLogin, Token
from app.services.auth_service import AuthService
from app.core.security import create_access_token
from app.core.dependencies import get_current_user
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registrar nuevo usuario
    """
    try:
        user = AuthService.create_user(db, user_data)
        logger.info(f"Usuario registrado: {user.email}")
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error al registrar usuario: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al registrar usuario"
        )


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login de usuario
    Retorna token JWT si las credenciales son correctas
    """
    user = AuthService.authenticate_user(db, credentials.email, credentials.password)

    if not user:
        logger.warning(f"Intento de login fallido: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Crear token JWT
    access_token = create_access_token(
        data={
            "sub": user.id,
            "email": user.email,
            "rol": user.rol
        }
    )

    logger.info(f"Login exitoso: {user.email}")

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Obtener información del usuario actual
    """
    return current_user
