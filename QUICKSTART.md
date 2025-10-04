# 🚀 Quick Start Guide

## Prerequisites
1. ✅ Node.js installed
2. ✅ Python 3.8+ installed
3. ✅ Your `mango_diseases.pkl` model file

## Step-by-Step Setup

### 1️⃣ Copy Your Model File
```bash
cp /path/to/your/mango_diseases.pkl backend/
```

### 2️⃣ Setup Backend
```bash
cd backend
./setup.sh
cd ..
```

### 3️⃣ Check Everything
```bash
./check_setup.sh
```

### 4️⃣ Start Backend (Terminal 1)
```bash
cd backend
./start_backend.sh
```

You should see:
```
🥭 Loading mango disease detection model...
✅ Model loaded successfully!
📋 Detectable diseases: [list of diseases]
🚀 Starting Mango Disease Detection API...
```

### 5️⃣ Start Frontend (Terminal 2)
```bash
npm run dev
```

### 6️⃣ Test It!

1. Open: http://localhost:3000/detector
2. Upload a mango leaf image
3. Click "Analyze for Diseases"
4. Wait for the progress animation
5. See the **AI Model Results** box with real predictions!

## 🎯 What to Expect

The results will show:
- **🤖 AI Model Results (Live)** - Your actual model's predictions
  - Detected disease
  - Confidence percentage
  - All probabilities
  - Raw JSON response
- Mock data below (for reference)

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
lsof -i :8000

# If needed, kill the process
kill -9 <PID>
```

### Model not found
```bash
# Verify model file location
ls -lh backend/mango_diseases.pkl

# If not there, copy it again
cp /path/to/mango_diseases.pkl backend/
```

### "Failed to predict disease"
- Make sure backend is running (check Terminal 1)
- Visit http://localhost:8000/docs to test API directly
- Check browser console for errors

## 📚 Documentation

- Full guide: `INTEGRATION_GUIDE.md`
- Backend docs: `backend/README.md`
- API documentation: http://localhost:8000/docs (when running)

## 🎉 That's It!

You now have a fully integrated AI-powered mango disease detection system!
