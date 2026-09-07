"""
MaterialMind AI — Unified Production Server Runner
Verifies models and compiled frontend, then launches Uvicorn on 0.0.0.0:$PORT.
"""

import os
import sys
import subprocess
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config import (
    HOST,
    PORT,
    FRONTEND_DIST_DIR,
    CLUSTERED_CSV,
    FINAL_SCALER_JOBLIB,
    KMEANS_JOBLIB,
    PCA_COORDINATES_CSV
)

def verify_ml_artifacts():
    print("[1/3] Verifying frozen ML artifacts...")
    artifacts = {
        "K-Means Model": KMEANS_JOBLIB,
        "Final Scaler": FINAL_SCALER_JOBLIB,
        "Clustered Materials Dataset": CLUSTERED_CSV,
        "PCA Coordinates Matrix": PCA_COORDINATES_CSV
    }
    missing = []
    for name, path in artifacts.items():
        if path.exists():
            print(f"  ✓ {name}: {path.name}")
        else:
            print(f"  ✗ {name}: MISSING ({path})")
            missing.append(name)

    if missing:
        print(f"\n[ERROR] Missing required artifacts: {', '.join(missing)}. Aborting.")
        sys.exit(1)
    print("  All ML models verified successfully.\n")

def ensure_frontend_build():
    print("[2/3] Checking compiled React frontend...")
    index_html = FRONTEND_DIST_DIR / "index.html"
    if not index_html.exists():
        print("  frontend/dist not found. Running production build...")
        frontend_dir = PROJECT_ROOT / "frontend"
        try:
            npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
            subprocess.run([npm_cmd, "run", "build"], cwd=str(frontend_dir), check=True)
            print("  ✓ Frontend production build completed successfully.")
        except Exception as e:
            print(f"  ✗ Failed to build frontend: {e}")
            print("    Please run 'npm run build' inside the frontend directory manually.")
            sys.exit(1)
    else:
        print(f"  ✓ Compiled frontend bundle found at {FRONTEND_DIST_DIR}\n")

def start_server():
    print(f"[3/3] Launching MaterialMind AI on http://{HOST}:{PORT}...")
    print("  Press Ctrl+C to stop the server.\n")
    import uvicorn
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=False)

if __name__ == "__main__":
    print("=" * 65)
    print("MATERIALMIND AI — UNIFIED PRODUCTION SERVER")
    print("=" * 65)
    verify_ml_artifacts()
    ensure_frontend_build()
    start_server()
