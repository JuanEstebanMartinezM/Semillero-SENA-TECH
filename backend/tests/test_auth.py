"""
Test authentication endpoints
"""


def test_health_check(client):
    """Test API is running"""
    response = client.get("/health")
    assert response.status_code == 200


def test_register_user_success(client, test_user_data):
    """Test user registration with valid data"""
    response = client.post("/auth/register", json=test_user_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == test_user_data["email"]
    assert "id" in data
    assert "password" not in data  # Password should not be returned


def test_register_duplicate_email(client, test_user_data):
    """Test registration fails with duplicate email"""
    # First registration
    client.post("/auth/register", json=test_user_data)
    
    # Try to register again with same email
    response = client.post("/auth/register", json=test_user_data)
    
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


def test_login_success(client, test_user_data):
    """Test login with correct credentials"""
    # Register user first
    client.post("/auth/register", json=test_user_data)
    
    # Login
    login_data = {
        "username": test_user_data["email"],
        "password": test_user_data["password"]
    }
    response = client.post("/auth/login", data=login_data)
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, test_user_data):
    """Test login fails with wrong password"""
    # Register user
    client.post("/auth/register", json=test_user_data)
    
    # Try login with wrong password
    login_data = {
        "username": test_user_data["email"],
        "password": "WrongPassword123!"
    }
    response = client.post("/auth/login", data=login_data)
    
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    """Test login fails for non-existent user"""
    login_data = {
        "username": "nonexistent@davivienda.com",
        "password": "Test123!@#"
    }
    response = client.post("/auth/login", data=login_data)
    
    assert response.status_code == 401
