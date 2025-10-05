# FarmPro.Tech - Cloudflare Tunnel Setup Guide

## ✅ Current Status
- Cloudflared installed
- Tunnel created: `farmpro` (ID: 54026a12-80a9-4414-b0a0-d1cb39d69dbc)
- Configuration file created
- Application built and ready

## 🔧 DNS Configuration Required

### Step 1: Update Cloudflare DNS Records

Go to your Cloudflare Dashboard → DNS → Records for **farmpro.tech**

#### Delete these A records:
- ❌ A record: `@` or `farmpro.tech` → 129.107.192.138
- ❌ A record: `www` → 129.107.192.138

#### Add these CNAME records:

**Record 1 (Root domain):**
```
Type: CNAME
Name: farmpro.tech (or @)
Target: 54026a12-80a9-4414-b0a0-d1cb39d69dbc.cfargotunnel.com
Proxy: Enabled (Orange Cloud)
TTL: Auto
```

**Record 2 (WWW subdomain):**
```
Type: CNAME
Name: www
Target: 54026a12-80a9-4414-b0a0-d1cb39d69dbc.cfargotunnel.com
Proxy: Enabled (Orange Cloud)
TTL: Auto
```

## 🚀 Starting Your Application

### Option 1: Complete Automated Startup (Recommended)
```bash
./start_all.sh
```

This will start:
- Next.js frontend (port 3000)
- Python backend
- Cloudflare tunnel

### Option 2: Manual Startup

**Install PM2 (if not installed):**
```bash
npm install -g pm2
```

**Start Frontend:**
```bash
pm2 start npm --name "farmpro" -- start
```

**Start Backend:**
```bash
pm2 start "python3 /Users/anoopkondepudi/Desktop/hackathon/backend/main.py" --name "farmpro-backend"
```

**Start Tunnel:**
```bash
pm2 start cloudflared --name "farmpro-tunnel" -- tunnel run farmpro
```

**Save processes:**
```bash
pm2 save
```

### Option 3: Test Tunnel Manually (for debugging)
```bash
cloudflared tunnel run farmpro
```

## 📊 Managing Your Services

**View all running services:**
```bash
pm2 list
```

**View logs:**
```bash
pm2 logs farmpro          # Frontend logs
pm2 logs farmpro-backend  # Backend logs
pm2 logs farmpro-tunnel   # Tunnel logs
```

**Restart a service:**
```bash
pm2 restart farmpro
pm2 restart farmpro-backend
pm2 restart farmpro-tunnel
```

**Stop all services:**
```bash
pm2 stop all
```

**Start on boot:**
```bash
pm2 startup
# Follow the command it gives you (run with sudo)
pm2 save
```

## 🔍 Troubleshooting

**Check tunnel status:**
```bash
cloudflared tunnel info farmpro
```

**Test local connection:**
```bash
curl http://localhost:3000
```

**Check if services are running:**
```bash
pm2 status
```

**View detailed logs:**
```bash
pm2 logs --lines 100
```

## ✨ Benefits of Cloudflare Tunnel

✅ No port forwarding needed
✅ Works with dynamic IP addresses
✅ Automatic SSL/TLS encryption
✅ DDoS protection from Cloudflare
✅ More secure (no exposed ports)
✅ Easier to manage

## 🌐 Accessing Your Site

Once DNS propagates (5-30 minutes):
- https://farmpro.tech
- https://www.farmpro.tech

Both will work automatically!

## 📝 Important Files

- **Tunnel Config:** `~/.cloudflared/config.yml`
- **Tunnel Credentials:** `~/.cloudflared/54026a12-80a9-4414-b0a0-d1cb39d69dbc.json`
- **Frontend:** `/Users/anoopkondepudi/Desktop/hackathon`
- **Backend:** `/Users/anoopkondepudi/Desktop/hackathon/backend`

## 🔐 Security Notes

- Keep tunnel credentials file secure
- Never commit `.cloudflared/` directory to git
- Tunnel credentials give access to your domain

## 🆘 Need Help?

If something doesn't work:
1. Check PM2 logs: `pm2 logs`
2. Verify DNS changes in Cloudflare dashboard
3. Test tunnel: `cloudflared tunnel run farmpro`
4. Check if Next.js builds: `npm run build`
5. Verify backend runs: `python3 backend/main.py`
