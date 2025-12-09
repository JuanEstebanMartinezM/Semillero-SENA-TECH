"""
Test security features
"""


def test_password_is_hashed(client, test_user_data, db_session):
    """Test that passwords are stored hashed, not plain text"""
    from models.user import User
    
    # Register user
    client.post("/auth/register", json=test_user_data)
    
    # Check database
    user = db_session.query(User).filter(User.email == test_user_data["email"]).first()
    
    assert user is not None
    assert user.hashed_password != test_user_data["password"]
    assert user.hashed_password.startswith("$2b$")  # bcrypt hash


def test_jwt_token_required(client):
    """Test that protected endpoints require JWT token"""
    response = client.get("/tasks/")
    assert response.status_code == 401


def test_invalid_jwt_token(client):
    """Test that invalid JWT token is rejected"""
    headers = {"Authorization": "Bearer invalid_token_here"}
    response = client.get("/tasks/", headers=headers)
    assert response.status_code == 401
