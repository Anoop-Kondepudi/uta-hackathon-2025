# 🚀 FarmPro.Tech - Simple Startup Guide

## How to Run Everything (with visible logs)

You need to run **3 separate terminal windows** - one for each service:

### Terminal 1: Frontend (Next.js)
```bash
./start_frontend.sh
```
This runs your Next.js app on port 3000. You'll see all frontend logs here.

### Terminal 2: Backend (Python)
```bash
./start_backend.sh
```
This runs your Python FastAPI backend. You'll see all backend logs here.

### Terminal 3: Cloudflare Tunnel
```bash
./start_tunnel.sh
```
This runs the Cloudflare tunnel that connects your local server to farmpro.tech. You'll see connection logs here.

---

## 📝 What Each Script Does

- `start_frontend.sh` - Just runs `npm start` (shows logs in terminal)
- `start_backend.sh` - Just runs `python3 main.py` (shows logs in terminal)
- `start_tunnel.sh` - Just runs `cloudflared tunnel run farmpro` (shows logs in terminal)

**Note:** `chmod +x` just makes files executable - it doesn't run anything in the background!

---

## 🛑 How to Stop

In each terminal window, press: **Ctrl+C**

---

## 🔍 What You'll See

**Frontend Terminal:**
```
✓ Ready in 2.1s
○ Local: http://localhost:3000
```

**Backend Terminal:**
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Tunnel Terminal:**
```
INF Registered tunnel connection
INF Starting metrics server
```

---

## 🌐 Accessing Your Site

Once all 3 terminals are running:
- Local: http://localhost:3000
- Online: https://farmpro.tech (after DNS propagates)

---

## ⚠️ Important

- Keep all 3 terminal windows open while the site is running
- If you close a terminal, that service stops
- To restart, just run the script again

---

## 📊 Checking Status

**Is frontend running?**
```bash
curl http://localhost:3000
```

**Is backend running?**
```bash
curl http://localhost:8000
```

**Is tunnel running?**
Check the tunnel terminal - should see "Registered tunnel connection"
