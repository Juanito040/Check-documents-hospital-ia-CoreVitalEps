"""
Middleware para logging de requests
"""
import logging
import time
from fastapi import Request

logger = logging.getLogger(__name__)


async def log_requests_middleware(request: Request, call_next):
    """
    Middleware para registrar todas las peticiones HTTP
    """
    start_time = time.time()

    # Log de request
    logger.info(f"📥 {request.method} {request.url.path}")

    # Procesar request
    response = await call_next(request)

    # Calcular tiempo de procesamiento
    process_time = time.time() - start_time
    process_time_ms = int(process_time * 1000)

    # Log de response
    logger.info(
        f"📤 {request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time_ms}ms"
    )

    # Agregar header con tiempo de procesamiento
    response.headers["X-Process-Time"] = str(process_time_ms)

    return response
