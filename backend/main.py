#!/usr/bin/env python3
"""
FastAPI backend for Mango Disease Detection
"""
import io
import os
import json
import base64
from typing import Dict
from pathlib import Path
from contextlib import asynccontextmanager

import torch
import uvicorn
from PIL import Image
from fastapi import FastAPI, UploadFile, HTTPException, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from backend .env first
backend_env = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=backend_env)

# Also load from .env.local in parent directory for compatibility
env_path = Path(__file__).parent.parent / ".env.local"
load_dotenv(dotenv_path=env_path)

# Load from .env.production if it exists
prod_env = Path(__file__).parent.parent / ".env.production"
load_dotenv(dotenv_path=prod_env)

# Global variable to store the model
learn = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup, cleanup on shutdown"""
    global learn
    print("🥭 Loading mango disease detection model...")
    try:
        # Model is in the backend directory
        model_path = Path(__file__).parent / "mango_diseases.pkl"
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found at {model_path}")
        
        # Load model with torch, mapping GPU tensors to CPU
        learn = torch.load(model_path, map_location='cpu', weights_only=False)
        
        # Ensure everything is on CPU and in evaluation mode
        if hasattr(learn, 'model'):
            learn.model = learn.model.cpu()
            learn.model.eval()
        
        if hasattr(learn, 'dls') and hasattr(learn.dls, 'cpu'):
            learn.dls.cpu()
        
        print(f"✅ Model loaded: {', '.join(learn.dls.vocab)}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        raise
    
    yield
    
    print("👋 Shutting down...")

app = FastAPI(title="Mango Disease Detection API", lifespan=lifespan)

# Enable CORS for Next.js frontend
# Allow both local development and production URLs
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://uta-hackathon-2025.onrender.com",  # Production URL
    "https://farmpro.tech",
    "https://www.farmpro.tech"
]

# Add any additional origins from environment variable
if os.environ.get("ALLOWED_ORIGINS"):
    allowed_origins.extend(os.environ.get("ALLOWED_ORIGINS").split(","))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
        # Get base64 string and remove data URL prefix if present
        base64_string = data.get("image", "")
        if "base64," in base64_string:
            base64_string = base64_string.split("base64,")[1]
        
        # Decode base64 to image
        image_bytes = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert RGBA to RGB if needed
        if image.mode == 'RGBA':
            image = image.convert('RGB')
        
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

@app.get("/weather")
async def get_weather_data():
    """
    Get weather forecast for the next 2 weeks based on user's location.
    """
    try:
        from weather import get_location, get_weather, get_weather_description
        
        location = get_location()
        if not location:
            raise HTTPException(status_code=500, detail="Could not determine location")
        
        weather_data = get_weather(location['latitude'], location['longitude'])
        if not weather_data:
            raise HTTPException(status_code=500, detail="Could not fetch weather data")
        
        # Format the response
        daily = weather_data['daily']
        forecast = []
        
        for i in range(len(daily['time'])):
            forecast.append({
                'date': daily['time'][i],
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
        raise HTTPException(status_code=500, detail=f"Weather error: {str(e)}")

@app.post("/generate-two-week-schedule")
async def generate_two_week_schedule(weather_data: Dict):
    """
    Generate 2-week mango farming schedule based on weather data.
    """
    try:
        from google import generativeai as genai
        
        # Configure Gemini AI
        api_key = os.getenv("GOOGLE_GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API key not configured")
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Generate 2-week plan based on weather
        two_week_prompt = f"""You are an expert mango farming advisor. Based on the following weather data for the next 2 weeks, create a detailed daily task schedule for mango cultivation.

Weather Data:
Location: {weather_data['location']['city']}, {weather_data['location']['region']}, {weather_data['location']['country']}

Forecast:
{chr(10).join([f"Date: {day['date']}, Temp: {day['temp_min']}°F-{day['temp_max']}°F, Rain: {day['rain_probability']}%, Precipitation: {day['precipitation']}mm, Conditions: {day['weather_description']}, Wind: {day['wind_speed_max']}mph, UV: {day['uv_index_max']}" for day in weather_data['forecast']])}

Important Guidelines:
1. DO NOT schedule fertilizer, pesticide, or foliar spray applications on days with >30% rain probability or expected precipitation
2. DO NOT water on rainy days
3. Schedule spraying on calm days (wind <10mph) with no rain
4. Consider UV index for worker safety and plant stress
5. High temperatures (>95°F) - limit strenuous work and increase irrigation
6. Plan pruning and harvesting on dry, clear days

Return a JSON object with this structure:
{{
  "schedule": [
    {{
      "date": "YYYY-MM-DD",
      "tasks": ["task1", "task2", ...],
      "reason": "Explanation for why these tasks are assigned (or why no tasks if empty)",
      "weather_consideration": "Brief note about weather impact"
    }}
  ]
}}

Be specific about tasks like:
- Irrigation scheduling
- Fertilizer application (type and timing)
- Pesticide/fungicide spraying (specific to mango diseases)
- Pruning
- Harvesting readiness checks
- Soil maintenance
- Weed control

Only return the JSON object, no additional text."""

        two_week_response = model.generate_content(two_week_prompt)
        two_week_plan_text = two_week_response.text.strip()
        
        # Clean up the response to extract JSON
        if "```json" in two_week_plan_text:
            two_week_plan_text = two_week_plan_text.split("```json")[1].split("```")[0].strip()
        elif "```" in two_week_plan_text:
            two_week_plan_text = two_week_plan_text.split("```")[1].split("```")[0].strip()
        
        two_week_plan = json.loads(two_week_plan_text)
        
        return {
            "two_week_plan": two_week_plan,
            "location": weather_data['location']
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Schedule generation error: {str(e)}")

@app.post("/generate-annual-plan")
async def generate_annual_plan(weather_data: Dict):
    """
    Generate annual mango cultivation overview.
    """
    try:
        from google import generativeai as genai
        
        # Configure Gemini AI
        api_key = os.getenv("GOOGLE_GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="Gemini API key not configured")
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Generate annual plan
        annual_prompt = f"""You are an expert mango farming advisor. Create a comprehensive annual mango cultivation calendar.

Location: {weather_data['location']['city']}, {weather_data['location']['region']}, {weather_data['location']['country']}
Climate Zone: Subtropical/Temperate

Provide a month-by-month overview for mango cultivation including:
- Flowering season
- Fruit development stages
- Harvest timing
- Pruning schedules
- Major fertilization periods
- Pest and disease management cycles
- Irrigation planning
- Soil preparation

Return a JSON object with this structure:
{{
  "annual_overview": [
    {{
      "month": "January",
      "stage": "Flowering/Vegetative/Harvest/etc",
      "key_activities": ["activity1", "activity2", ...],
      "notes": "Important considerations for this month"
    }}
  ],
  "harvest_windows": ["Month1", "Month2"],
  "critical_periods": [
    {{
      "period": "Description",
      "months": ["Month1", "Month2"],
      "importance": "Why this period is critical"
    }}
  ]
}}

Consider the local climate zone for {weather_data['location']['city']}, {weather_data['location']['region']}.
Only return the JSON object, no additional text."""

        annual_response = model.generate_content(annual_prompt)
        annual_plan_text = annual_response.text.strip()
        
        # Clean up the response to extract JSON
        if "```json" in annual_plan_text:
            annual_plan_text = annual_plan_text.split("```json")[1].split("```")[0].strip()
        elif "```" in annual_plan_text:
            annual_plan_text = annual_plan_text.split("```")[1].split("```")[0].strip()
        
        annual_plan = json.loads(annual_plan_text)
        
        return {
            "annual_plan": annual_plan,
            "location": weather_data['location']
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Annual plan generation error: {str(e)}")

if __name__ == "__main__":
    # Get port from environment variable (for Render deployment) or default to 8001
    port = int(os.environ.get("PORT", 8001))
    print("🚀 Starting Mango Disease Detection API...")
    print(f"📍 API will be available at: http://0.0.0.0:{port}")
    print(f"📖 API docs will be available at: http://0.0.0.0:{port}/docs")
    uvicorn.run(app, host="0.0.0.0", port=port)
