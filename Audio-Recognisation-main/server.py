"""
FastAPI server for handling audio file uploads
Receives audio files at the /enroll endpoint
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List
import os
from datetime import datetime
import shutil

app = FastAPI(title="Audio Recognition API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directory to store uploaded files (always inside project dir)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploaded_audio")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Allow overriding backend port via env var (e.g., BACKEND_PORT or PORT)
BACKEND_PORT = int(os.environ.get('BACKEND_PORT') or os.environ.get('PORT') or 5000)


@app.post("/enroll")
async def enroll_audio(audioFiles: List[UploadFile] = File(...)):
    """
    Handle audio file uploads from the frontend
    Expects: multipart/form-data with 'audioFiles' field
    """
    try:
        if not audioFiles:
            raise HTTPException(
                status_code=400,
                detail="No audio files found in request"
            )
        
        saved_files = []
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Save each uploaded file
        for idx, file in enumerate(audioFiles):
            if file.filename == "":
                continue
                
            # Create unique filename with timestamp
            filename = f"{timestamp}_{file.filename}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            
            # Save file to disk
            with open(filepath, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Get file size for logging
            file_size = os.path.getsize(filepath)
            saved_files.append({
                "filename": filename,
                "original_name": file.filename,
                "size": file_size,
                "content_type": file.content_type
            })
            
            print(f"✓ Saved: {filename} ({file_size} bytes)")
        
        if not saved_files:
            raise HTTPException(
                status_code=400,
                detail="No valid files were uploaded"
            )
        
        # Return success response
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "message": f"Successfully uploaded {len(saved_files)} audio file(s)",
                "filesProcessed": len(saved_files),
                "files": saved_files,
                "timestamp": timestamp
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error processing upload: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Server error: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "FastAPI server is running",
        "upload_folder": os.path.abspath(UPLOAD_FOLDER),
        "api_version": "1.0.0"
    }


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Audio Recognition API",
        "version": "1.0.0",
        "endpoints": {
            "POST /enroll": "Upload audio files for enrollment",
            "GET /health": "Health check",
            "GET /docs": "Interactive API documentation",
            "GET /redoc": "ReDoc API documentation"
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    print("=" * 60)
    print("🎙️  Audio Recognition FastAPI Server")
    print("=" * 60)
    print(f"📁 Upload folder: {os.path.abspath(UPLOAD_FOLDER)}")
    print(f"🌐 Server URL: http://localhost:{BACKEND_PORT}")
    print(f"📚 API Docs: http://localhost:{BACKEND_PORT}/docs")
    print(f"📖 ReDoc: http://localhost:{BACKEND_PORT}/redoc")
    print("\nEndpoints:")
    print("  - POST /enroll  → Upload audio files")
    print("  - GET  /health  → Health check")
    print("  - GET  /        → API info")
    print("=" * 60)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=BACKEND_PORT,
        log_level="info"
    )
