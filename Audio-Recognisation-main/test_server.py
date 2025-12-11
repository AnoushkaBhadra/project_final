"""
Quick test script to verify the FastAPI server is working
"""

import requests
import json

SERVER_URL = "http://localhost:5000"

print("=" * 60)
print("🧪 Testing FastAPI Server")
print("=" * 60)
print()

# Test 1: Health Check
print("Test 1: Health Check Endpoint")
print(f"GET {SERVER_URL}/health")
try:
    response = requests.get(f"{SERVER_URL}/health", timeout=5)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print("✅ Health check passed")
except Exception as e:
    print(f"❌ Health check failed: {e}")
print()

# Test 2: Root Endpoint
print("Test 2: Root Endpoint")
print(f"GET {SERVER_URL}/")
try:
    response = requests.get(f"{SERVER_URL}/", timeout=5)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print("✅ Root endpoint passed")
except Exception as e:
    print(f"❌ Root endpoint failed: {e}")
print()

# Test 3: Enroll Endpoint (without files - should error)
print("Test 3: Enroll Endpoint (no files - expected to fail)")
print(f"POST {SERVER_URL}/enroll")
try:
    response = requests.post(f"{SERVER_URL}/enroll", timeout=5)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 422:
        print("✅ Correctly rejected request without files")
    else:
        print(f"Response: {response.text}")
except Exception as e:
    print(f"❌ Request failed: {e}")
print()

print("=" * 60)
print("📋 Summary")
print("=" * 60)
print("If all tests passed, the server is working correctly!")
print("You can now use the frontend to upload audio files.")
print()
print("📚 Additional Resources:")
print("  - API Docs: http://localhost:5000/docs")
print("  - ReDoc: http://localhost:5000/redoc")
print("=" * 60)
