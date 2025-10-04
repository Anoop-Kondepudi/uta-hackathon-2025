# Mango Disease Detection Backend

Python FastAPI backend for the Mango Disease Detection system.

## Setup

### Prerequisites
- Python 3.8 or higher
- pip

### Installation

1. **Move your model file**
   ```bash
   # Make sure mango_diseases.pkl is in the backend/ directory
   cp /path/to/mango_diseases.pkl backend/
   ```

2. **Run the setup script**
   ```bash
   cd backend
   ./setup.sh
   ```

   This will:
   - Create a Python virtual environment
   - Install all required dependencies (FastAPI, fastai, torch, etc.)

## Running the Backend

### Option 1: Using the start script (Recommended)
```bash
cd backend
./start_backend.sh
```

### Option 2: Manual start
```bash
cd backend
source venv/bin/activate
python main.py
```

The API will be available at:
- **API Base URL**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Interactive Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc

## API Endpoints

### 1. Health Check
```
GET /
```
Returns server status and model loading state.

### 2. Get Diseases List
```
GET /diseases
```
Returns all diseases the model can detect.

### 3. Predict from File Upload
```
POST /predict
Content-Type: multipart/form-data

Body: file (image file)
```

### 4. Predict from Base64 (Used by Frontend)
```
POST /predict-base64
Content-Type: application/json

Body: 
{
  "image": "data:image/png;base64,..."
}
```

Returns:
```json
{
  "prediction": {
    "disease": "Anthracnose",
    "confidence": 0.87,
    "confidence_percentage": 87.0
  },
  "all_probabilities": [
    {
      "disease": "Anthracnose",
      "probability": 0.87,
      "percentage": 87.0
    },
    ...
  ]
}
```

## Testing the API

### Using curl
```bash
# Health check
curl http://localhost:8000/

# Get diseases list
curl http://localhost:8000/diseases
```

### Using the Interactive Docs
1. Open http://localhost:8000/docs
2. Try out the endpoints directly from the browser

## Troubleshooting

### Model not loading
- Ensure `mango_diseases.pkl` is in the `backend/` directory
- Check the console output for error messages

### Port already in use
- Change the port in `main.py`:
  ```python
  uvicorn.run(app, host="0.0.0.0", port=8001)  # Change 8000 to 8001
  ```

### Dependencies installation fails
- Make sure you're using Python 3.8+
- Try updating pip: `pip install --upgrade pip`
- Install dependencies one by one to identify issues

## Development

### Adding new endpoints
Edit `main.py` and add new routes using FastAPI decorators.

### Modifying CORS settings
Update the `allow_origins` list in `main.py` if you need to allow different origins.

## Notes

- The backend runs on port 8000 by default
- Make sure both the backend (port 8000) and frontend (port 3000) are running
- The frontend proxies requests through `/api/predict-disease` to the Python backend
