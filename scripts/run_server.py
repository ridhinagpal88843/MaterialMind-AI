"""
MaterialMind-ECE — Server Launcher
Launches the FastAPI backend service using Uvicorn.
"""

import sys
import uvicorn
from pathlib import Path

# Add project root to sys.path
project_root = str(Path(__file__).resolve().parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

if __name__ == '__main__':
    print("Starting MaterialMind-ECE backend server on http://127.0.0.1:8000 ...")
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False, log_level="info")
