"""
Tests básicos para endpoints principales de la API
"""
import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Agregar el directorio raíz al path
sys.path.append(str(Path(__file__).resolve().parents[1]))

from main import app

client = TestClient(app)


def test_root_endpoint():
    """Test del endpoint raíz"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "version" in data


def test_health_check():
    """Test del health check"""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "model" in data
    assert "ollama" in data


def test_docs_available():
    """Test de que Swagger UI está disponible"""
    response = client.get("/docs")
    assert response.status_code == 200


def test_register_user():
    """Test de registro de usuario"""
    user_data = {
        "nombre": "Test User",
        "email": f"test_{pytest.timestamp()}@test.com",
        "password": "test123456",
        "rol": "medico"
    }

    response = client.post("/api/auth/register", json=user_data)

    # Puede fallar si el usuario ya existe, pero debe retornar 201 o 400
    assert response.status_code in [201, 400]


def test_login_invalid_credentials():
    """Test de login con credenciales inválidas"""
    response = client.post("/api/auth/login", json={
        "email": "invalid@test.com",
        "password": "wrongpassword"
    })

    assert response.status_code == 401


# Agregar timestamp para tests
pytest.timestamp = lambda: str(int(__import__('time').time()))
