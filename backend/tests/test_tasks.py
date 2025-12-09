"""
Test task CRUD operations
"""


def test_create_task_authenticated(client, test_user_data, test_task_data):
    """Test creating a task with authentication"""
    # Register and login
    client.post("/auth/register", json=test_user_data)
    login_response = client.post("/auth/login", data={
        "username": test_user_data["email"],
        "password": test_user_data["password"]
    })
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create task
    response = client.post("/tasks/", json=test_task_data, headers=headers)
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == test_task_data["title"]
    assert data["status"] == test_task_data["status"]
    assert "id" in data


def test_create_task_without_auth(client, test_task_data):
    """Test creating task fails without authentication"""
    response = client.post("/tasks/", json=test_task_data)
    assert response.status_code == 401


def test_get_tasks_list(client, test_user_data, test_task_data):
    """Test getting list of user's tasks"""
    # Register, login and create task
    client.post("/auth/register", json=test_user_data)
    login_response = client.post("/auth/login", data={
        "username": test_user_data["email"],
        "password": test_user_data["password"]
    })
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    client.post("/tasks/", json=test_task_data, headers=headers)
    
    # Get tasks
    response = client.get("/tasks/", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_delete_task(client, test_user_data, test_task_data):
    """Test deleting a task"""
    # Setup and create task
    client.post("/auth/register", json=test_user_data)
    login_response = client.post("/auth/login", data={
        "username": test_user_data["email"],
        "password": test_user_data["password"]
    })
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    create_response = client.post("/tasks/", json=test_task_data, headers=headers)
    task_id = create_response.json()["id"]
    
    # Delete task
    response = client.delete(f"/tasks/{task_id}", headers=headers)
    
    assert response.status_code == 204
