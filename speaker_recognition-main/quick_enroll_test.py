import requests

SERVER_URL = "http://localhost:5000"
TEST_WAV = "test_clips/recording2025-11-19 12-33-33.wav"

print(f"Posting {TEST_WAV} to {SERVER_URL}/enroll")
with open(TEST_WAV, 'rb') as f:
    files = {
        # Simulate frontend's `audioFiles` field (single file)
        'audioFiles': ("test.wav", f, 'audio/wav')
    }
    data = {
        'username': 'test_user',
        'clip_number': '1'
    }
    r = requests.post(f"{SERVER_URL}/enroll", files=files, data=data, timeout=10)
    print("Status:", r.status_code)
    try:
        print(r.json())
    except Exception as e:
        print(r.text)
