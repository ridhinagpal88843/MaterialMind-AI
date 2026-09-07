"""
MaterialMind-ECE — FastAPI Main Application
Central application entry point, lifespan management, CORS middleware, and router registration.
"""

import sys
from pathlib import Path

# Ensure project root is on sys.path
project_root = str(Path(__file__).resolve().parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.config import (
    API_TITLE,
    API_VERSION,
    API_DESCRIPTION,
    CLUSTERED_CSV,
    FINAL_SCALER_JOBLIB,
    KMEANS_JOBLIB,
    PCA_COORDINATES_CSV,
    FRONTEND_DIST_DIR,
    HOST,
    PORT
)
from backend.schemas import HealthResponse
from backend.routes.materials import router as materials_router
from backend.routes.clusters import router as clusters_router
from backend.routes.pca import router as pca_router
from backend.routes.similarity import router as similarity_router
from backend.routes.recommend import router as recommend_router
from backend.routes.compare import router as compare_router

def get_artifact_status():
    return {
        "scaler": FINAL_SCALER_JOBLIB.exists(),
        "kmeans": KMEANS_JOBLIB.exists(),
        "materials_dataset": CLUSTERED_CSV.exists(),
        "pca_coordinates": PCA_COORDINATES_CSV.exists()
    }

loaded_status = get_artifact_status()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager to verify precomputed models and artifacts on startup.
    Ensures zero retraining occurs during server runtime.
    """
    print("=" * 60)
    print("STARTING MATERIALMIND-ECE FASTAPI BACKEND SERVICE")
    print("=" * 60)

    current_status = get_artifact_status()
    for k, v in current_status.items():
        status_str = "LOADED" if v else "MISSING"
        print(f"  Artifact check -> {k}: [{status_str}]")

    print("\nServer initialized successfully. Ready to accept incoming requests.\n")
    yield
    print("Shutting down MaterialMind-ECE backend service.")

app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=API_DESCRIPTION,
    lifespan=lifespan
)

# Configure Cross-Origin Resource Sharing (CORS) for frontend client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Sub-Routers
app.include_router(materials_router)
app.include_router(clusters_router)
app.include_router(pca_router)
app.include_router(similarity_router)
app.include_router(recommend_router)
app.include_router(compare_router)

@app.get("/api/health", response_model=HealthResponse, tags=["System"])
def get_health():
    """System health check and loaded artifact verification."""
    status = get_artifact_status()
    all_ok = all(status.values())
    return HealthResponse(
        status="healthy" if all_ok else "degraded",
        api_version=API_VERSION,
        loaded_models=status
    )

# Static Asset Serving for Compiled Frontend (Production)
assets_dir = FRONTEND_DIST_DIR / "assets"
if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

@app.get("/", tags=["System"])
def root(request: Request):
    """
    Root endpoint:
    - Serves the interactive MaterialMind AI React SPA when requested by web browsers (Accept: text/html).
    - Returns JSON system metadata when requested by API clients, automated test suites, or curl.
    """
    accept = request.headers.get("accept", "")
    index_path = FRONTEND_DIST_DIR / "index.html"
    if "text/html" in accept and index_path.exists():
        return FileResponse(index_path)
    return {
        "title": API_TITLE,
        "version": API_VERSION,
        "docs_url": "/docs",
        "openapi_url": "/openapi.json",
        "status": "online",
        "notice": "HEURISTIC ECE SCREENING — NOT EXPERIMENTAL VALIDATION."
    }

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    fav_path = FRONTEND_DIST_DIR / "favicon.ico"
    if fav_path.exists():
        return FileResponse(fav_path)
    return Response(status_code=204)

# Catch-all Route for Client-Side SPA Routing (HTML5 History API)
@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(full_path: str):
    """
    Fallback for client-side React routes (e.g. /explorer, /universe, /clusters, /similarity, /compare).
    Ensures direct browser navigation and page refreshes work without 404s.
    """
    # Exclude API endpoints that were not matched (they will have 404 from FastAPI)
    if full_path.startswith("api/") or full_path == "api":
        return Response(content='{"detail":"Not Found"}', media_type="application/json", status_code=404)

    index_path = FRONTEND_DIST_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return Response(
        content=f'{{"detail":"Resource not found: {full_path}"}}',
        media_type="application/json",
        status_code=404
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=False)
