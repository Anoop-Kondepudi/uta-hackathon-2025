# 🥭 Mango Disease Detection - Full Stack Integration

## Overview
Complete integration of the FastAI mango disease detection model with the Next.js frontend.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Next.js       │         │   Next.js        │         │   Python        │
│   Frontend      │────────▶│   API Route      │────────▶│   FastAPI       │
│   (detector)    │         │   (/api/predict) │         │   Backend       │
│                 │◀────────│                  │◀────────│   (port 8000)   │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                                                   │
                                                                   │
                                                                   ▼
                                                          ┌─────────────────┐
                                                          │  mango_diseases │
                                                          │     .pkl        │
                                                          │  (FastAI Model) │
                                                          └─────────────────┘
```

## Setup Instructions

### 1. Backend Setup (Python FastAPI)

```bash
# Navigate to backend directory
cd backend

# Place your model file
# Copy mango_diseases.pkl into the backend/ directory

# Run setup (creates venv and installs dependencies)
./setup.sh

# Start the backend server
./start_backend.sh
```

The backend will start on `http://localhost:8000`

### 2. Frontend Setup (Already done)

The Next.js frontend is already set up. Just make sure it's running:

```bash
# In the project root
npm run dev
```

The frontend runs on `http://localhost:3000`

## How It Works

### Flow:
1. User uploads mango leaf image on `/detector` page
2. Image is converted to base64
3. User clicks "Analyze for Diseases"
4. Frontend shows progress animation (7 seconds with 100+ steps)
5. After animation, Next.js API route `/api/predict-disease` is called
6. Next.js proxies the request to Python backend at `http://localhost:8000/predict-base64`
7. Python FastAPI loads the image and runs FastAI model prediction
8. Results are returned to frontend
9. **AI Results are displayed in a highlighted box** showing:
   - Detected disease
   - Confidence percentage
   - All disease probabilities
   - Raw JSON response (expandable)

### API Response Format:
```json
{
  "prediction": {
    "disease": "Anthracnose",
    "confidence": 0.875,
    "confidence_percentage": 87.5
  },
  "all_probabilities": [
    {
      "disease": "Anthracnose",
      "probability": 0.875,
      "percentage": 87.5
    },
    {
      "disease": "Healthy",
      "probability": 0.08,
      "percentage": 8.0
    },
    ...
  ]
}
```

## Files Created/Modified

### Backend Files (New)
- `backend/main.py` - FastAPI server with model integration
- `backend/requirements.txt` - Python dependencies
- `backend/setup.sh` - Setup script
- `backend/start_backend.sh` - Start script
- `backend/README.md` - Backend documentation

### Frontend Files (Modified)
- `app/api/predict-disease/route.ts` - Next.js API route (proxy to Python)
- `app/detector/page.tsx` - Updated to call API and display results

## Testing

### 1. Test Backend Directly
```bash
# Health check
curl http://localhost:8000/

# Get diseases list
curl http://localhost:8000/diseases

# Interactive API docs
open http://localhost:8000/docs
```

### 2. Test Full Flow
1. Open `http://localhost:3000/detector`
2. Upload a mango leaf image
3. Click "Analyze for Diseases"
4. Wait for progress animation
5. See AI results in highlighted box at top of results section

## What You'll See

The results section now shows:
1. **🤖 AI Model Results (Live)** - Highlighted box with:
   - Detected disease name
   - Confidence percentage
   - All probabilities ranked
   - Expandable raw JSON
2. Original mock data (for comparison)

## Troubleshooting

### Backend not responding
- Check if backend is running: `curl http://localhost:8000/`
- Check terminal for errors
- Ensure `mango_diseases.pkl` is in `backend/` directory

### "Failed to predict disease" error
- Make sure backend is running on port 8000
- Check browser console for detailed error
- Verify model file is loaded (check backend terminal output)

### Port conflicts
- Backend: Change port in `backend/main.py` line: `uvicorn.run(app, host="0.0.0.0", port=8001)`
- Update Next.js API route if you change backend port

## Next Steps

Once you verify it works:
1. Replace mock data with real API results
2. Add disease information lookup (descriptions, treatments)
3. Store prediction history
4. Add confidence threshold warnings
5. Implement result export functionality

## Dependencies

### Backend
- fastapi
- uvicorn
- python-multipart
- fastai
- torch
- torchvision
- pillow

### Frontend (already installed)
- @google/generative-ai (for describe-image feature)

## Important Notes

- Keep both servers running during development
- Backend MUST be started before testing predictions
- API results display in real-time once backend responds
- Mock data still shows for reference/comparison
