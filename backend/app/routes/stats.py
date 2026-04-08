"""
Endpoints para estadísticas del sistema (Admin)
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.database import get_db
from app.models.user import User
from app.models.document import Document
from app.models.query_log import QueryLog
from app.core.dependencies import get_current_admin_user
from app.services.vector_store_service import vector_store_service

router = APIRouter()


@router.get("/")
def get_system_stats(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas generales del sistema

    Solo accesible para administradores
    """
    # Estadísticas de usuarios
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.activo == True).count()
    admin_users = db.query(User).filter(User.rol == "admin").count()
    medico_users = db.query(User).filter(User.rol == "medico").count()

    # Estadísticas de documentos
    total_documents = db.query(Document).count()
    active_documents = db.query(Document).filter(Document.estado == "activo").count()

    # Documentos por categoría
    docs_by_category = db.query(
        Document.categoria,
        func.count(Document.id)
    ).filter(Document.estado == "activo").group_by(Document.categoria).all()

    # Estadísticas de consultas
    total_queries = db.query(QueryLog).count()

    # Promedio de tiempo de respuesta
    avg_response_time = db.query(
        func.avg(QueryLog.tiempo_respuesta_ms)
    ).scalar() or 0

    # Consultas por usuario (top 5)
    top_users = db.query(
        User.email,
        func.count(QueryLog.id).label('query_count')
    ).join(QueryLog).group_by(User.email).order_by(
        func.count(QueryLog.id).desc()
    ).limit(5).all()

    # Estadísticas de ChromaDB
    chroma_stats = vector_store_service.get_collection_stats()

    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "admins": admin_users,
            "medicos": medico_users
        },
        "documents": {
            "total": total_documents,
            "active": active_documents,
            "by_category": {cat: count for cat, count in docs_by_category}
        },
        "queries": {
            "total": total_queries,
            "average_response_time_ms": int(avg_response_time),
            "top_users": [{"email": email, "queries": count} for email, count in top_users]
        },
        "vector_store": chroma_stats
    }
