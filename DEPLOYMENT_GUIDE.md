# 🚀 Deployment Guide - Magic AI Lab

This guide provides step-by-step instructions for deploying your Magic AI Lab application with both frontend (React + Vite) and backend (FastAPI).

---

## 📋 Table of Contents
1. [Deployment Options](#deployment-options)
2. [Option 1: Deploy to Vercel (Frontend) + Render (Backend)](#option-1-vercel--render-recommended)
3. [Option 2: Deploy to Netlify (Frontend) + Railway (Backend)](#option-2-netlify--railway)
4. [Option 3: Deploy Everything to a VPS (DigitalOcean/AWS)](#option-3-vps-deployment)
5. [Time Estimates](#time-estimates)

---

## 🎯 Deployment Options

### **Recommended: Option 1 - Vercel + Render**
- **Frontend**: Vercel (Free tier available)
- **Backend**: Render (Free tier available)
- **Best for**: Quick deployment, automatic CI/CD, free hosting
- **Time**: 20-30 minutes

---

## Option 1: Vercel + Render (Recommended)

### **Part A: Deploy Backend to Render** ⏱️ 10-15 minutes

#### Step 1: Prepare Backend for Deployment
1. Create a `render.yaml` file in the root directory:
```yaml
services:
  - type: web
    name: magic-ai-lab-backend
    env: python
    buildCommand: "pip install -r backend/requirements.txt"
    startCommand: "uvicorn backend.main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
```

2. Update `backend/requirements.txt` to include specific versions:
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pandas==2.1.3
scikit-learn==1.3.2
python-multipart==0.0.6
openpyxl==3.1.2
```

#### Step 2: Deploy to Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `magic-ai-lab-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
5. Click **"Create Web Service"**
6. Wait 5-10 minutes for deployment
7. **Copy the backend URL** (e.g., `https://magic-ai-lab-backend.onrender.com`)

#### Step 3: Update CORS Settings
After deployment, you'll need to update the backend CORS settings to allow your frontend domain.

---

### **Part B: Deploy Frontend to Vercel** ⏱️ 10-15 minutes

#### Step 1: Prepare Frontend for Deployment
1. Create a `.env.production` file in the root directory:
```env
VITE_API_URL=https://magic-ai-lab-backend.onrender.com
```

2. Update your API calls in the frontend to use the environment variable.
   - Find all instances of `http://localhost:8000` in your `src` folder
   - Replace with `import.meta.env.VITE_API_URL || 'http://localhost:8000'`

3. Create a `vercel.json` file in the root directory:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Step 2: Build the Frontend Locally (Optional - for testing)
```bash
npm run build
```

#### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://magic-ai-lab-backend.onrender.com` (your Render backend URL)
6. Click **"Deploy"**
7. Wait 3-5 minutes for deployment
8. Your app will be live at `https://your-app-name.vercel.app`

#### Step 4: Update Backend CORS
Go back to your `backend/main.py` and update CORS origins:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-app-name.vercel.app"  # Add your Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push this change to trigger a new deployment on Render.

---

## Option 2: Netlify + Railway

### **Part A: Deploy Backend to Railway** ⏱️ 10-15 minutes

#### Step 1: Prepare for Railway
1. Create a `railway.json` file:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn backend.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. Create a `Procfile` in the root:
```
web: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

#### Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app) and sign up/login
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect Python
5. Add environment variables if needed
6. Click **"Deploy"**
7. Copy the generated URL

---

### **Part B: Deploy Frontend to Netlify** ⏱️ 10-15 minutes

#### Step 1: Prepare for Netlify
1. Create a `netlify.toml` file:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

2. Create `.env.production`:
```env
VITE_API_URL=https://your-railway-backend-url.railway.app
```

#### Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select your repository
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Railway backend URL
6. Click **"Deploy site"**

---

## Option 3: VPS Deployment (DigitalOcean/AWS/Linode)

### **Full Stack on One Server** ⏱️ 45-60 minutes

#### Step 1: Set Up Server
1. Create a Ubuntu 22.04 droplet/instance
2. SSH into your server:
```bash
ssh root@your-server-ip
```

#### Step 2: Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Python
apt install -y python3 python3-pip python3-venv

# Install Nginx
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx
```

#### Step 3: Clone and Setup Backend
```bash
# Create app directory
mkdir -p /var/www/magic-ai-lab
cd /var/www/magic-ai-lab

# Clone your repository
git clone https://github.com/yourusername/your-repo.git .

# Setup Python virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

#### Step 4: Setup Backend Service
Create `/etc/systemd/system/magic-ai-backend.service`:
```ini
[Unit]
Description=Magic AI Lab Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/magic-ai-lab
Environment="PATH=/var/www/magic-ai-lab/venv/bin"
ExecStart=/var/www/magic-ai-lab/venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
systemctl enable magic-ai-backend
systemctl start magic-ai-backend
```

#### Step 5: Build and Setup Frontend
```bash
cd /var/www/magic-ai-lab

# Install dependencies
npm install

# Build
npm run build

# Move build to Nginx directory
cp -r dist /var/www/magic-ai-lab-frontend
```

#### Step 6: Configure Nginx
Create `/etc/nginx/sites-available/magic-ai-lab`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/magic-ai-lab-frontend;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/magic-ai-lab /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### Step 7: Setup SSL (Optional but Recommended)
```bash
certbot --nginx -d your-domain.com
```

---

## ⏱️ Time Estimates

### Option 1: Vercel + Render
- **Backend Setup**: 10-15 minutes
- **Frontend Setup**: 10-15 minutes
- **Configuration & Testing**: 5-10 minutes
- **Total**: **25-40 minutes**

### Option 2: Netlify + Railway
- **Backend Setup**: 10-15 minutes
- **Frontend Setup**: 10-15 minutes
- **Configuration & Testing**: 5-10 minutes
- **Total**: **25-40 minutes**

### Option 3: VPS Deployment
- **Server Setup**: 15-20 minutes
- **Backend Setup**: 10-15 minutes
- **Frontend Setup**: 10-15 minutes
- **Nginx Configuration**: 5-10 minutes
- **SSL Setup**: 5 minutes
- **Total**: **45-65 minutes**

---

## 🎯 Recommended Approach

**For Beginners**: Use **Option 1 (Vercel + Render)**
- ✅ Easiest setup
- ✅ Free tier available
- ✅ Automatic deployments from GitHub
- ✅ Built-in SSL
- ✅ No server management

**For Advanced Users**: Use **Option 3 (VPS)**
- ✅ Full control
- ✅ Better performance
- ✅ Can scale easily
- ✅ One server for everything

---

## 📝 Post-Deployment Checklist

- [ ] Backend is accessible and returns data
- [ ] Frontend loads correctly
- [ ] API calls work from frontend to backend
- [ ] CORS is configured correctly
- [ ] File uploads work
- [ ] All features function as expected
- [ ] SSL certificate is active (HTTPS)
- [ ] Environment variables are set correctly

---

## 🐛 Common Issues

### Issue 1: CORS Errors
**Solution**: Make sure your backend CORS settings include your frontend domain.

### Issue 2: API Not Found (404)
**Solution**: Check that `VITE_API_URL` environment variable is set correctly.

### Issue 3: Build Fails
**Solution**: Make sure all dependencies are in `package.json` and `requirements.txt`.

### Issue 4: Backend Crashes on Render Free Tier
**Solution**: Render free tier spins down after inactivity. First request may take 30-60 seconds.

---

## 🎉 You're Done!

Your Magic AI Lab is now live and accessible to the world! 🌍

For questions or issues, check the logs:
- **Vercel**: Dashboard → Your Project → Deployments → View Logs
- **Render**: Dashboard → Your Service → Logs
- **VPS**: `journalctl -u magic-ai-backend -f`
