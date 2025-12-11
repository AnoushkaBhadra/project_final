# 🎙️ Audio Recognition System - Complete Guide

## 📋 Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [How It Works](#how-it-works)
- [API Documentation](#api-documentation)
- [Frontend Components](#frontend-components)
- [Backend Implementation](#backend-implementation)
- [Troubleshooting](#troubleshooting)
- [Customization](#customization)
- [Next Steps](#next-steps)

---

## 📖 Overview

This is a **Speaker Recognition System** that allows users to:
1. **Train** a voice model by recording 4 audio clips (5-10 seconds each)
2. **Test** voice recognition with new recordings (3-10 seconds)
3. **Upload** recordings to a FastAPI backend server for processing

The application uses a **React + TypeScript frontend** for the user interface and a **FastAPI backend** to receive and store audio files.

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Browser MediaRecorder API** - Audio recording

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Python-multipart** - File upload handling
- **CORS Middleware** - Cross-origin support

---

## 📁 Project Structure

```
project/
├── Backend (Python/FastAPI)
│   ├── server.py                   # Main FastAPI server
│   ├── requirements.txt            # Python dependencies
│   ├── test_server.py             # Server testing script
│   └── uploaded_audio/            # Uploaded files directory (auto-created)
│
├── Frontend (React/TypeScript)
│   ├── src/
│   │   ├── components/
│   │   │   ├── TrainingCard.tsx   # Voice training component
│   │   │   └── TestingCard.tsx    # Voice testing component
│   │   ├── App.tsx                # Main app component
│   │   └── index.css              # Tailwind styles
│   ├── package.json               # Node.js dependencies
│   ├── tsconfig.json              # TypeScript config
│   └── vite.config.ts             # Vite config
│
├── Utilities
│   └── start.bat                  # Quick start script (Windows)
│
└── README.md                      # This file
```

---

## 📦 Installation

### Prerequisites
- **Python 3.8+** - [Download](https://www.python.org/)
- **Node.js 16+** - [Download](https://nodejs.org/)
- Modern web browser with microphone access

### 1. Install Python Dependencies

```bash
# Navigate to project directory
cd "c:\Users\Admin\Downloads\new UI project\project"

# Install FastAPI and dependencies
pip install -r requirements.txt
```

**requirements.txt contains:**
- `fastapi==0.115.5`
- `uvicorn[standard]==0.32.1`
- `python-multipart==0.0.18`
- `requests==2.32.3`

### 2. Install Node.js Dependencies (if not already installed)

```bash
# Install frontend dependencies
npm install
```

---

## 🚀 Running the Application

### Option 1: Quick Start (Windows)

**Double-click or run:**
```bash
start.bat
```

This will:
- Check for Python and Node.js
- Install dependencies if needed
- Start FastAPI backend in a new window (port 5000)
- Start React frontend in a new window (port 5173)

### Option 2: Manual Start

**Terminal 1 - FastAPI Backend:**
```bash
cd "c:\Users\Admin\Downloads\new UI project\project"
python server.py
```

You should see:
```
============================================================
🎙️  Audio Recognition FastAPI Server
============================================================
📁 Upload folder: C:\...\uploaded_audio
🌐 Server URL: http://localhost:5000
📚 API Docs: http://localhost:5000/docs
📖 ReDoc: http://localhost:5000/redoc
============================================================
```

**Terminal 2 - React Frontend:**
```bash
cd "c:\Users\Admin\Downloads\new UI project\project"
npm run dev
```

You should see:
```
  VITE v5.4.2  ready in 342 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🎯 How It Works

### User Flow

#### 1. Training Phase (Left Card)
1. Click **"Start Recording"** button
2. Speak clearly for 5-10 seconds
3. Click **"Stop Recording"**
4. Repeat 3 more times (total of 4 clips required)
5. **Click "Upload Training Clips"** button
6. Files are sent to backend and saved

#### 2. Testing Phase (Right Card)
1. Record at least 3 training clips first
2. Click **"Record Test Sample"** button
3. Speak for 3-10 seconds
4. Click **"Stop & Analyze"**
5. **Click "Upload Test Clip"** button
6. File is sent to backend for processing

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                       │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │  TrainingCard    │        │  TestingCard     │          │
│  │                  │        │                  │          │
│  │  🎤 Record 4     │        │  🎤 Record 1     │          │
│  │     clips        │        │     test clip    │          │
│  │                  │        │                  │          │
│  │  [Upload Button] │        │  [Upload Button] │          │
│  └────────┬─────────┘        └────────┬─────────┘          │
│           │                           │                     │
└───────────┼───────────────────────────┼─────────────────────┘
            │                           │
            │   HTTP POST /enroll       │
            │   multipart/form-data     │
            │   audioFiles field        │
            │                           │
            ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI Server)                   │
│                                                              │
│  POST /enroll                                               │
│  ├─ Receives audioFiles (List[UploadFile])                 │
│  ├─ Validates files                                         │
│  ├─ Saves to uploaded_audio/ folder with timestamps        │
│  └─ Returns JSON response                                  │
│                                                              │
│  Saved Files:                                               │
│  📁 uploaded_audio/                                         │
│     ├─ 20251208_210500_training_clip_1.webm                │
│     ├─ 20251208_210500_training_clip_2.webm                │
│     ├─ 20251208_210500_training_clip_3.webm                │
│     ├─ 20251208_210500_training_clip_4.webm                │
│     └─ 20251208_210530_test_clip.webm                      │
└─────────────────────────────────────────────────────────────┘
```

### Important Notes

⚠️ **Manual Upload**: Recordings do **NOT** automatically upload. You must click the upload button after recording.

✅ **Upload Triggers**:
- Training: Click "Upload Training Clips" (appears after 4 clips recorded)
- Testing: Click "Upload Test Clip" (appears after test recording)

---

## 📚 API Documentation

### Endpoints

#### `POST /enroll`
Upload audio files for enrollment.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Field Name: `audioFiles` (accepts multiple files)
- File Format: `audio/webm`

**Example FormData:**
```javascript
const formData = new FormData();
formData.append('audioFiles', blob1, 'training_clip_1.webm');
formData.append('audioFiles', blob2, 'training_clip_2.webm');
formData.append('audioFiles', blob3, 'training_clip_3.webm');
formData.append('audioFiles', blob4, 'training_clip_4.webm');
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Successfully uploaded 4 audio file(s)",
  "filesProcessed": 4,
  "files": [
    {
      "filename": "20251208_210500_training_clip_1.webm",
      "original_name": "training_clip_1.webm",
      "size": 15234,
      "content_type": "audio/webm"
    }
  ],
  "timestamp": "20251208_210500"
}
```

**Response (Error - 400):**
```json
{
  "detail": "No audio files found in request"
}
```

#### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "message": "FastAPI server is running",
  "upload_folder": "C:\\...\\uploaded_audio",
  "api_version": "1.0.0"
}
```

#### `GET /`
API information endpoint.

**Response:**
```json
{
  "name": "Audio Recognition API",
  "version": "1.0.0",
  "endpoints": {
    "POST /enroll": "Upload audio files for enrollment",
    "GET /health": "Health check",
    "GET /docs": "Interactive API documentation",
    "GET /redoc": "ReDoc API documentation"
  }
}
```

#### `GET /docs`
Interactive Swagger UI documentation (browser-based).

#### `GET /redoc`
Alternative ReDoc documentation (browser-based).

---

## 🎨 Frontend Components

### TrainingCard Component
**File:** `src/components/TrainingCard.tsx`

**Features:**
- Records 4 training clips (5-10 seconds each)
- Visual timer with color coding:
  - 🟡 Yellow: Under 5 seconds (too short)
  - 🟢 Green: 5-10 seconds (valid)
  - Auto-stops at 10 seconds
- Displays all recorded clips with file size
- Delete individual clips or clear all
- Upload button (appears when 4 clips completed)
- Upload status with color-coded feedback

**State Management:**
```typescript
const [trainingClips, setTrainingClips] = useState<Blob[]>([]);
const [isRecording, setIsRecording] = useState(false);
const [recordingTime, setRecordingTime] = useState(0);
const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
```

**Upload Function:**
```typescript
const uploadToServer = async () => {
  const formData = new FormData();
  trainingClips.forEach((clip, index) => {
    formData.append('audioFiles', clip, `training_clip_${index + 1}.webm`);
  });
  
  const response = await fetch('http://localhost:5000/enroll', {
    method: 'POST',
    body: formData,
  });
  // Handle response...
};
```

### TestingCard Component
**File:** `src/components/TestingCard.tsx`

**Features:**
- Requires 3+ training clips before use
- Records single test clip (3-10 seconds)
- Visual timer
- Play recorded clip before upload
- Simulated recognition result (match/no-match)
- Upload button (appears after recording)
- Upload status with color-coded feedback

**State Management:**
```typescript
const [testClip, setTestClip] = useState<Blob | null>(null);
const [recognitionResult, setRecognitionResult] = useState<'match' | 'no-match' | null>(null);
const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
```

---

## ⚙️ Backend Implementation

### FastAPI Server
**File:** `server.py`

**Key Features:**
- CORS enabled for all origins (configurable)
- Automatic folder creation
- Timestamp-based file naming
- File size tracking
- Comprehensive error handling
- Detailed logging

**Main Endpoint Implementation:**
```python
@app.post("/enroll")
async def enroll_audio(audioFiles: List[UploadFile] = File(...)):
    try:
        if not audioFiles:
            raise HTTPException(status_code=400, detail="No audio files found")
        
        saved_files = []
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        for file in audioFiles:
            filename = f"{timestamp}_{file.filename}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            
            with open(filepath, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            file_size = os.path.getsize(filepath)
            saved_files.append({
                "filename": filename,
                "original_name": file.filename,
                "size": file_size,
                "content_type": file.content_type
            })
        
        return {
            "status": "success",
            "message": f"Successfully uploaded {len(saved_files)} audio file(s)",
            "filesProcessed": len(saved_files),
            "files": saved_files,
            "timestamp": timestamp
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**CORS Configuration:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific URLs in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔧 Troubleshooting

### Frontend Issues

#### Microphone Not Accessible
**Symptoms:** Error message "Could not access microphone"

**Solutions:**
1. Grant microphone permissions in browser
2. Check browser settings: `chrome://settings/content/microphone`
3. Ensure HTTPS or localhost (required for MediaRecorder API)
4. Try different browser

#### Upload Button Disabled
**Symptoms:** Cannot click upload button

**Solutions:**
1. Ensure all 4 training clips are recorded
2. Check browser console for errors (F12)
3. Verify recording time meets minimum duration (5s for training, 3s for test)

#### CORS Errors
**Symptoms:** Network errors mentioning CORS

**Solutions:**
1. Ensure backend server is running
2. Check CORS middleware is enabled in `server.py`
3. For production, update `allow_origins` to match your frontend URL

### Backend Issues

#### Port 5000 Already in Use
**Symptoms:** "Address already in use" error

**Solutions:**
```python
# In server.py, change port:
uvicorn.run(app, host="0.0.0.0", port=5001)

# Then update frontend URLs in:
# - TrainingCard.tsx (line ~141)
# - TestingCard.tsx (line ~131)
const response = await fetch('http://localhost:5001/enroll', {
```

#### Python Dependencies Not Found
**Symptoms:** "ModuleNotFoundError: No module named 'fastapi'"

**Solutions:**
```bash
# Install dependencies
pip install -r requirements.txt

# Or install individually
pip install fastapi uvicorn python-multipart requests
```

#### Files Not Saving
**Symptoms:** Upload succeeds but no files in folder

**Solutions:**
1. Check server console for error messages
2. Verify write permissions on project folder
3. Check absolute path in server logs
4. Look for `uploaded_audio/` folder in project directory

### Testing the Server

Run the test script to verify server is working:
```bash
python test_server.py
```

**Expected output:**
```
🧪 Testing FastAPI Server
Test 1: Health Check Endpoint
✅ Health check passed

Test 2: Root Endpoint
✅ Root endpoint passed

Test 3: Enroll Endpoint (no files - expected to fail)
✅ Correctly rejected request without files
```

---

## 🎨 Customization

### Change Server Endpoint
**Current:** `http://localhost:5000/enroll`

**To change:**

1. Update backend (`server.py`):
```python
@app.post("/your-custom-endpoint")
async def your_custom_handler(audioFiles: List[UploadFile] = File(...)):
    # ... implementation
```

2. Update frontend:
```typescript
// In TrainingCard.tsx (line ~141)
const response = await fetch('http://localhost:5000/your-custom-endpoint', {

// In TestingCard.tsx (line ~131)
const response = await fetch('http://localhost:5000/your-custom-endpoint', {
```

### Add User Identification
**Frontend (in upload functions):**
```typescript
const formData = new FormData();
formData.append('userId', 'user123');
formData.append('sessionId', Date.now().toString());
trainingClips.forEach((clip, index) => {
  formData.append('audioFiles', clip, `training_clip_${index + 1}.webm`);
});
```

**Backend (server.py):**
```python
from fastapi import Form

@app.post("/enroll")
async def enroll_audio(
    audioFiles: List[UploadFile] = File(...),
    userId: str = Form(None),
    sessionId: str = Form(None)
):
    print(f"Processing upload for user: {userId}, session: {sessionId}")
    # ... rest of implementation
```

### Change File Upload Field Name
**Current:** `audioFiles`

**To change:**

1. Frontend:
```typescript
formData.append('yourFieldName', clip, filename);
```

2. Backend:
```python
@app.post("/enroll")
async def enroll_audio(yourFieldName: List[UploadFile] = File(...)):
```

### Modify Recording Duration
**Current:** Training (5-10s), Testing (3-10s)

**To change (TrainingCard.tsx):**
```typescript
const MIN_DURATION = 5;  // Change minimum
const MAX_DURATION = 10; // Change maximum
```

**To change (TestingCard.tsx):**
```typescript
const MIN_DURATION = 3;  // Change minimum
const MAX_DURATION = 10; // Change maximum
```

---

## 🚀 Next Steps

### Immediate
- ✅ Start the servers using `start.bat`
- ✅ Test recording and uploading
- ✅ Verify files in `uploaded_audio/` folder
- ✅ Explore API docs at `http://localhost:5000/docs`

### Development Enhancements
1. **Voice Recognition**
   - Implement actual speaker recognition algorithm
   - Integrate with audio processing libraries (librosa, pyAudio, etc.)
   - Train ML model for voice comparison

2. **Authentication**
   - Add user authentication (JWT tokens)
   - Implement user sessions
   - Secure endpoints with authentication

3. **Database Integration**
   - Store audio metadata in database
   - Track user recordings
   - Implement audio file relationships

4. **File Management**
   - Add file cleanup policies
   - Implement storage limits
   - Add file compression

5. **UI Improvements**
   - Add progress bars for uploads
   - Implement audio waveform visualization
   - Add playback controls for all clips

6. **Production Ready**
   - Configure CORS for specific domains
   - Add rate limiting
   - Implement proper error logging
   - Add file validation (format, size, duration)
   - Deploy to production server

---

## 📞 Support & Resources

- **API Documentation:** http://localhost:5000/docs
- **Alternative Docs:** http://localhost:5000/redoc
- **Test Script:** `python test_server.py`
- **Browser Console:** F12 (for frontend debugging)
- **Server Logs:** Check terminal running `server.py`

---

## 📄 License

This project is for educational and development purposes.

---

**🎉 Happy Coding!**

For questions or issues, check the troubleshooting section or review the server logs and browser console for detailed error messages.
