from fastapi.testclient import TestClient
from backend.main import app
from unittest.mock import patch, AsyncMock

# We need to mock the lifespan context manager or the DB calls within it
# Since TestClient triggers lifespan, we can patch the db methods

@patch("backend.db.database.db.connect", new_callable=AsyncMock)
@patch("backend.db.database.db.close", new_callable=AsyncMock)
def test_health_check(mock_close, mock_connect):
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
