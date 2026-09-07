# MaterialMind AI — Production Deployment Guide

This repository contains the complete production-ready source code, frozen machine learning artifacts, and compiled React frontend for **MaterialMind AI** (*"Intelligent Material Clustering & Selection System"*).

The application is architected for **Unified Single-Server Deployment**: FastAPI serves both the high-performance ML REST API (`/api/*`) and the compiled React single-page application (`/` and all client-side routes) from a single container or server on port `8000` (or dynamic cloud `$PORT`).

---

## 🚀 Quick Deployment Options

| Platform | Deployment Type | Est. Setup Time | Recommended Use |
| :--- | :--- | :---: | :--- |
| **[Render.com](#1-deploy-to-rendercom-recommended)** | 1-Click Cloud Service (Free/Standard) | 2 mins | Cloud hosting with automated HTTPS |
| **[Docker / Compose](#2-docker-container-deployment)** | Multi-stage Docker Container | 1 min | Any VPS, Cloud Run, AWS, or local server |
| **[Railway / Fly.io](#3-railway--flyio-deployment)** | Git Push / Procfile | 2 mins | Zero-config continuous deployment |
| **[Local Production](#4-local-production-server)** | Native Python Uvicorn Runner | 10 secs | Local high-speed testing or intranet |

---

## 1. Deploy to Render.com (Recommended)

Render can deploy the unified full-stack application directly from your GitHub repository: [`https://github.com/ridhinagpal88843/MaterialMind-AI`](https://github.com/ridhinagpal88843/MaterialMind-AI).

### Option A: 1-Click Blueprint (Using `render.yaml`)
1. Log in to [dashboard.render.com](https://dashboard.render.com/).
2. Click **New +** → **Blueprint**.
3. Connect your repository: `ridhinagpal88843/MaterialMind-AI`.
4. Render will automatically detect `render.yaml` and set up the Web Service:
   - **Environment:** Docker
   - **Health Check Path:** `/api/health`
   - **Plan:** Free (or Starter)
5. Click **Apply**. Once deployed, Render provides your live URL (e.g., `https://materialmind-ai.onrender.com`).

### Option B: Manual Web Service
1. On Render, click **New +** → **Web Service**.
2. Select your repository: `ridhinagpal88843/MaterialMind-AI`.
3. Configure settings:
   - **Name:** `materialmind-ai`
   - **Region:** Choose closest to your users (e.g., Oregon / Frankfurt / Singapore)
   - **Branch:** `main`
   - **Runtime:** `Docker` (or `Python 3`)
   - **If Python Runtime:**
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path:** `/api/health`
4. Click **Create Web Service**.

---

## 2. Docker Container Deployment

The included multi-stage [Dockerfile](file:///c:/Users/HP/Desktop/PROJECT-7/Dockerfile) compiles the frontend in a Node 20 environment and packages it into a lightweight Python 3.11-slim container with all models and datasets.

### Build and Run with Docker
```bash
# 1. Build the production image
docker build -t materialmind-ai:latest .

# 2. Run container on port 8000
docker run -d -p 8000:8000 --name materialmind-app materialmind-ai:latest
```
Access the application at: `http://localhost:8000/`.

### Run with Docker Compose
```bash
docker compose up -d --build
```
Check health: `http://localhost:8000/api/health`

---

## 3. Railway / Fly.io Deployment

### Deploying to Railway
1. Go to [railway.app](https://railway.app/) and create a new project.
2. Select **Deploy from GitHub repo** and pick `ridhinagpal88843/MaterialMind-AI`.
3. Railway automatically detects either the [Dockerfile](file:///c:/Users/HP/Desktop/PROJECT-7/Dockerfile) or the [Procfile](file:///c:/Users/HP/Desktop/PROJECT-7/Procfile) and injects `$PORT`.
4. Generate a public domain under **Settings** → **Networking**.

### Deploying to Fly.io
```bash
fly launch
fly deploy
```

---

## 4. Local Production Server

To run the unified production build locally without Docker:
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Launch production runner
python scripts/run_production.py
```
This checks all ML artifacts, verifies the built frontend, and starts Uvicorn on `http://0.0.0.0:8000`.

---

## 5. Git Repository Management

To commit and push all code, models, and deployment configurations to your repository:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Add remote origin
git remote add origin https://github.com/ridhinagpal88843/MaterialMind-AI.git

# 3. Stage all files
git add .

# 4. Commit
git commit -m "feat: complete MaterialMind AI production deployment bundle"

# 5. Push to GitHub
git branch -M main
git push -u origin main
```

---

## 6. System Architecture & Frozen Artifacts

| Component | Technology | Path / Artifact |
| :--- | :--- | :--- |
| **API Framework** | FastAPI 0.115+ | `backend/main.py` |
| **Frontend Framework** | React 18 + Vite 6 + Tailwind CSS | `frontend/` (Compiled to `frontend/dist/`) |
| **Motion Engine** | Framer Motion 11 + Canvas 2D | `frontend/src/components/OrbitingSphere.jsx` |
| **Clustering Model** | Scikit-Learn K-Means ($K=4$) | `models/kmeans.joblib` *(Frozen)* |
| **Feature Scaler** | Standard Scaler (6D space) | `models/final_scaler.joblib` *(Frozen)* |
| **Material Dataset** | 1,056 DFT Materials | `data/processed/materials_clustered.csv` *(Frozen)* |
| **PCA Projections** | 3 principal components (74.66%) | `data/processed/pca_coordinates.csv` *(Frozen)* |

---

## 7. Operational & Scientific Notice
> **HEURISTIC ECE SCREENING — NOT EXPERIMENTAL VALIDATION.**  
> MaterialMind uses DFT-computed material descriptors and heuristic multi-criteria scoring to screen candidate materials. Results are intended for scientific exploration and candidate prioritization, not as direct experimental predictions of device-level operational parameters.
