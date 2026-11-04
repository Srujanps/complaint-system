import requests
import time
import sys

BASE_URL = "http://localhost:8080/api"

users = {
    "citizen": {"username": "citizentest", "password": "password123", "email": "citizen@test.com", "role": "CITIZEN", "fullName": "Citizen User", "phone": "1234567890"},
    "officer": {"username": "officertest", "password": "password123", "email": "officer@test.com", "role": "OFFICER", "fullName": "Officer User", "phone": "1234567891"},
    "vendor": {"username": "vendortest", "password": "password123", "email": "vendor@test.com", "role": "VENDOR", "fullName": "Vendor User", "phone": "1234567892"},
    "admin": {"username": "admintest", "password": "password123", "email": "admin@test.com", "role": "ADMIN", "fullName": "Admin User", "phone": "1234567893"},
    "rep": {"username": "reptest", "password": "password123", "email": "rep@test.com", "role": "REPRESENTATIVE", "fullName": "Rep User", "phone": "1234567894", "constituency": "Main St.", "designation": "MLA"}
}

tokens = {}

def wait_for_server():
    print("Waiting for server to start...")
    for _ in range(30):
        try:
            res = requests.get(f"{BASE_URL}/auth/test")
            if res.status_code == 200:
                print("Server is up!")
                return
        except:
            pass
        time.sleep(2)
    print("Server did not start in time. Exiting.")
    sys.exit(1)

def register_and_login():
    print("--- 1. Registering and Logging in Users ---")
    # 1) Register non-representative users (public endpoint)
    for role in ["citizen", "officer", "vendor", "admin"]:
        data = users[role]
        res = requests.post(f"{BASE_URL}/auth/register", json=data)
        if res.status_code in [200, 201]:
            print(f"Registered {role} successfully.")
        else:
            print(f"Failed to register {role}: {res.text}. Proceeding assuming already exists.")

    # 2) Login non-representative users
    for role in ["citizen", "officer", "vendor", "admin"]:
        data = users[role]
        res = requests.post(f"{BASE_URL}/auth/login", json={"username": data["username"], "password": data["password"]})
        if res.status_code == 200:
            tokens[role] = res.json().get("token")
            print(f"Logged in {role} successfully.")
        else:
            print(f"Failed to login {role}: {res.text}")
            sys.exit(1)

    # 3) Register representative (admin-only)
    rep_data = users["rep"]
    res = requests.post(
        f"{BASE_URL}/auth/register",
        json=rep_data,
        headers={"Authorization": f"Bearer {tokens['admin']}"},
    )
    if res.status_code in [200, 201]:
        print("Registered rep successfully (admin-created).")
    else:
        print(f"Failed to register rep: {res.text}. Proceeding assuming already exists.")

    # 4) Login representative
    res = requests.post(f"{BASE_URL}/auth/login", json={"username": rep_data["username"], "password": rep_data["password"]})
    if res.status_code == 200:
        tokens["rep"] = res.json().get("token")
        print("Logged in rep successfully.")
    else:
        print(f"Failed to login rep: {res.text}")
        sys.exit(1)

def get_auth_headers(role):
    return {"Authorization": f"Bearer {tokens[role]}"}

def admin_flow():
    print("\n--- 2. Admin Flow: Creating Category & Getting Users ---")
    headers = get_auth_headers("admin")
    
    # Create category
    cat_data = {"name": "Road Issue", "description": "Potholes and damages", "baseSeverityWeight": 3}
    res = requests.post(f"{BASE_URL}/admin/categories", json=cat_data, headers=headers)
    cat_id = None
    if res.status_code in [200, 201]:
        print("Category 'Road Issue' created.")
        cat_id = res.json().get("categoryId")
    else:
        print("Category might exist, fetching all categories...")
        res = requests.get(f"{BASE_URL}/admin/categories", headers=headers)
        if res.status_code == 200 and len(res.json()) > 0:
            cat_id = res.json()[0].get("categoryId")

    # Get Vendor ID
    res = requests.get(f"{BASE_URL}/admin/users/role/VENDOR", headers=headers)
    vendor_id = None
    if res.status_code == 200 and len(res.json()) > 0:
        vendor_id = res.json()[0].get("userId")
        print(f"Found Vendor ID: {vendor_id}")
    else:
        print(f"Failed to fetch vendor users: {res.text}")
    
    return cat_id, vendor_id

def citizen_flow(cat_id):
    print("\n--- 3. Citizen Flow: Creating Complaint ---")
    headers = get_auth_headers("citizen")
    
    complaint_data = {
        "title": "Large Pothole",
        "description": "On main street near the park.",
        "categoryId": cat_id,
        "location": "Main St.",
        "latitude": 12.34,
        "longitude": 56.78
    }
    
    res = requests.post(f"{BASE_URL}/complaints/create", json=complaint_data, headers=headers)
    if res.status_code in [200, 201]:
        print("Complaint created successfully.")
        return res.json().get("complaintId")
    else:
        print(f"Failed to create complaint: {res.text}")
        return None

def officer_flow(complaint_id, vendor_id):
    print("\n--- 4. Officer Flow: Assigning Complaint ---")
    headers = get_auth_headers("officer")
    
    assignment_data = {
        "complaintId": complaint_id,
        "vendorId": vendor_id,
        "notes": "Please fix this ASAP."
    }
    
    res = requests.post(f"{BASE_URL}/officer/complaints/assign", json=assignment_data, headers=headers)
    if res.status_code in [200, 201]:
        print(f"SUCCESS: Assigned complaint {complaint_id} to vendor {vendor_id} without 403 error!")
    else:
        print(f"FAILED to assign complaint: {res.text} (Status: {res.status_code})")

def vendor_flow():
    print("\n--- 5. Vendor Flow: Updating Assignment Status ---")
    headers = get_auth_headers("vendor")
    
    res = requests.get(f"{BASE_URL}/vendor/assignments", headers=headers)
    if res.status_code == 200:
        assignments = res.json()
        print(f"Vendor has {len(assignments)} assignments.")
        if len(assignments) > 0:
            assignment_id = assignments[0].get("assignmentId")
            
            # Update to IN_PROGRESS
            update_data = {"status": "IN_PROGRESS", "notes": "Started fixing"}
            res = requests.put(f"{BASE_URL}/vendor/assignments/{assignment_id}/status", json=update_data, headers=headers)
            print(f"Updated status to IN_PROGRESS: {res.status_code}")
            
            # Update to COMPLETED
            update_data = {"status": "COMPLETED", "notes": "Done fixing"}
            res = requests.put(f"{BASE_URL}/vendor/assignments/{assignment_id}/status", json=update_data, headers=headers)
            print(f"Updated status to COMPLETED: {res.status_code}")
    else:
        print(f"Failed to fetch vendor assignments: {res.text}")

def representative_flow(complaint_id):
    print("\n--- 6. Representative Flow: Area Complaints, Priority, Escalation, Remark ---")
    headers = get_auth_headers("rep")

    # Stats
    res = requests.get(f"{BASE_URL}/representative/complaints/stats", headers=headers)
    if res.status_code == 200:
        print(f"Stats: {res.json()}")
    else:
        print(f"Failed to fetch stats: {res.text}")

    # List complaints
    res = requests.get(f"{BASE_URL}/representative/complaints?page=0&size=10", headers=headers)
    if res.status_code == 200:
        data = res.json()
        print(f"Area complaints fetched: {len(data.get('content', []))}")
    else:
        print(f"Failed to fetch area complaints: {res.text}")

    # Set priority
    res = requests.put(f"{BASE_URL}/representative/complaints/{complaint_id}/priority?priority=CRITICAL", headers=headers)
    print(f"Set priority: {res.status_code}")

    # Escalate
    res = requests.put(f"{BASE_URL}/representative/complaints/{complaint_id}/escalate", headers=headers)
    print(f"Escalate: {res.status_code}")

    # Remark (extra feature)
    res = requests.put(f"{BASE_URL}/representative/complaints/{complaint_id}/remark", headers=headers, json={"remark": "Please prioritize this and share daily progress updates."})
    print(f"Remark: {res.status_code}")

def main():
    wait_for_server()
    register_and_login()
    
    cat_id, vendor_id = admin_flow()
    if not vendor_id:
        print("Could not retrieve Vendor ID. Stopping.")
        sys.exit(1)
        
    complaint_id = citizen_flow(cat_id)
    if not complaint_id:
        print("Could not retrieve Complaint ID. Stopping.")
        sys.exit(1)
        
    officer_flow(complaint_id, vendor_id)
    vendor_flow()
    representative_flow(complaint_id)

    print("\n--- End to End Test Completed ---")

if __name__ == "__main__":
    main()
