#!/usr/bin/env python3
"""
FastAPI backend for Mango Disease Detection
"""
from fastapi import FastAPI, UploadFile, HTTPException, File
from fastapi.middleware.cors import CORSMiddleware
import io
from PIL import Image
import base64
from typing import Dict, List
from pathlib import Path
from contextlib import asynccontextmanager
import uvicorn
import torch
import pickle

# Global variable to store the model
learn = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup, cleanup on shutdown"""
    global learn
    print("🥭 Loading mango disease detection model...")
    try:
        # Model is in the project root directory
        model_path = Path(__file__).parent.parent / "mango_diseases.pkl"
        print(f"📂 Looking for model at: {model_path}")
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found at {model_path}")
        
        print("🔧 Loading model trained on GPU (loading to CPU)...")
        
        # Workaround for FastAI 2.8.4 bug - load directly with torch
        import torch
        
        # Load model directly with torch, mapping GPU tensors to CPU
        print("📦 Loading pickle file...")
        learn = torch.load(model_path, map_location='cpu', weights_only=False)
        
        # Ensure everything is on CPU and in evaluation mode
        if hasattr(learn, 'model'):
            learn.model = learn.model.cpu()
            learn.model.eval()
            print("✅ Model moved to CPU and set to evaluation mode")
        
        if hasattr(learn, 'dls') and hasattr(learn.dls, 'cpu'):
            learn.dls.cpu()
            print("✅ Data loaders moved to CPU")
        
        print("✅ Model loaded successfully!")
        print(f"📋 Detectable diseases: {', '.join(learn.dls.vocab)}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        import traceback
        traceback.print_exc()
        raise
    
    yield  # Server is running
    
    # Cleanup (if needed)
    print("👋 Shutting down...")

app = FastAPI(title="Mango Disease Detection API", lifespan=lifespan)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Mango Disease Detection API",
        "model_loaded": learn is not None
    }

@app.get("/diseases")
async def get_diseases():
    """Get list of diseases the model can detect"""
    if learn is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    return {
        "diseases": list(learn.dls.vocab),
        "count": len(learn.dls.vocab)
    }

@app.post("/predict")
async def predict_disease(file: UploadFile = File(...)):
    """
    Predict disease from uploaded image file
    """
    if learn is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Read the uploaded file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Make prediction
        pred_class, pred_idx, probs = learn.predict(image)
        
        # Prepare all probabilities
        all_probabilities = []
        for disease, prob in zip(learn.dls.vocab, probs):
            all_probabilities.append({
                "disease": str(disease),
                "probability": float(prob),
                "percentage": float(prob * 100)
            })
        
        # Sort by probability (highest first)
        all_probabilities.sort(key=lambda x: x['probability'], reverse=True)
        
        return {
            "prediction": {
                "disease": str(pred_class),
                "confidence": float(probs[pred_idx]),
                "confidence_percentage": float(probs[pred_idx] * 100)
            },
            "all_probabilities": all_probabilities
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict-base64")
async def predict_disease_base64(data: Dict[str, str]):
    """
    Predict disease from base64 encoded image
    """
    if learn is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        print("🔍 Received prediction request")
        
        # Get base64 string from request
        base64_string = data.get("image", "")
        print(f"📊 Base64 string length: {len(base64_string)}")
        
        # Remove data URL prefix if present
        if "base64," in base64_string:
            base64_string = base64_string.split("base64,")[1]
            print("✂️  Removed data URL prefix")
        
        # Decode base64 to image
        image_bytes = base64.b64decode(base64_string)
        print(f"📦 Decoded {len(image_bytes)} bytes")
        
        image = Image.open(io.BytesIO(image_bytes))
        print(f"🖼️  Image opened: {image.size}, mode: {image.mode}")
        
        # Convert RGBA to RGB if needed
        if image.mode == 'RGBA':
            print("🔄 Converting RGBA to RGB")
            image = image.convert('RGB')
        
        # Make prediction
        print("🤖 Running model prediction...")
        pred_class, pred_idx, probs = learn.predict(image)
        print(f"✅ Prediction complete: {pred_class}")
        
        # Prepare all probabilities
        all_probabilities = []
        for disease, prob in zip(learn.dls.vocab, probs):
            all_probabilities.append({
                "disease": str(disease),
                "probability": float(prob),
                "percentage": float(prob * 100)
            })
        
        # Sort by probability (highest first)
        all_probabilities.sort(key=lambda x: x['probability'], reverse=True)
        
        return {
            "prediction": {
                "disease": str(pred_class),
                "confidence": float(probs[pred_idx]),
                "confidence_percentage": float(probs[pred_idx] * 100)
            },
            "all_probabilities": all_probabilities
        }
        
    except Exception as e:
        print(f"❌ Prediction error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/weather")
async def get_weather_data():
    """
    Get weather forecast for the next 2 weeks (14 days) based on user's location.
    Returns temperature ranges and rain probability for each day.
    """
    try:
        from weather import get_location, get_weather, get_weather_description
        
        print("🌍 Fetching location...")
        location = get_location()
        
        if not location:
            raise HTTPException(status_code=500, detail="Could not determine location")
        
        print(f"📍 Location: {location['city']}, {location['country']}")
        print("☁️ Fetching weather data...")
        
        weather_data = get_weather(location['latitude'], location['longitude'])
        
        if not weather_data:
            raise HTTPException(status_code=500, detail="Could not fetch weather data")
        
        # Format the response
        daily = weather_data['daily']
        forecast = []
        
        for i in range(len(daily['time'])):
            date = daily['time'][i]
            forecast.append({
                'date': date,
                'temp_max': daily['temperature_2m_max'][i],
                'temp_min': daily['temperature_2m_min'][i],
                'rain_probability': daily['precipitation_probability_max'][i],
                'precipitation': daily['precipitation_sum'][i],
                'weather_code': daily['weather_code'][i],
                'weather_description': get_weather_description(daily['weather_code'][i]),
                'wind_speed_max': daily['wind_speed_10m_max'][i],
                'uv_index_max': daily['uv_index_max'][i]
            })
        
        return {
            'location': location,
            'current': weather_data['current'],
            'forecast': forecast
        }
        
    except Exception as e:
        print(f"❌ Weather error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Weather error: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting Mango Disease Detection API...")
    print("📍 API will be available at: http://localhost:8000")
    print("📖 API docs will be available at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
