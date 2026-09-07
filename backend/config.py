"""
MaterialMind-ECE — Backend Configuration
Centralized configuration, paths, and metadata constants for FastAPI service.
"""

import os
from pathlib import Path

# Base Paths
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent

DATA_DIR = PROJECT_ROOT / "data"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
MODELS_DIR = PROJECT_ROOT / "models"
FRONTEND_DIST_DIR = PROJECT_ROOT / "frontend" / "dist"

# Server Host & Dynamic Port (Supports Render/Railway/Fly.io/Heroku $PORT)
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))

# Data Files
CLUSTERED_CSV = PROCESSED_DATA_DIR / "materials_clustered.csv"
CLUSTER_PROFILES_CSV = PROCESSED_DATA_DIR / "cluster_profiles.csv"
PCA_COORDINATES_CSV = PROCESSED_DATA_DIR / "pca_coordinates.csv"
CLUSTERING_METRICS_JSON = PROCESSED_DATA_DIR / "clustering_metrics.json"

# Model Files
FINAL_SCALER_JOBLIB = MODELS_DIR / "final_scaler.joblib"
KMEANS_JOBLIB = MODELS_DIR / "kmeans.joblib"

# API Metadata
API_TITLE = "MaterialMind-ECE REST API"
API_VERSION = "1.0.0"
API_DESCRIPTION = (
    "Production REST API for MaterialMind-ECE: AI-Based Clustering and Intelligent "
    "Selection of Electronic Materials. Provides endpoints for data exploration, K-Means "
    "cluster profiles, PCA coordinate projections, nearest-neighbor physical similarity "
    "search, transparent heuristic ECE screening, and multi-material comparisons."
)

# Core Feature Definitions
FEATURES = [
    'band_gap',
    'poly_total',
    'poly_electronic',
    'ionic_polarization_fraction',
    'density',
    'volume'
]

# Descriptive Cluster Interpretations from Phase 4
# Note: Treated as descriptive cluster interpretations, not experimentally validated material classes.
CLUSTER_INTERPRETATIONS = {
    0: {
        "label": "Cluster 0",
        "description": "Narrow-to-moderate bandgap, dense semiconductor-like group (descriptive interpretation)",
        "characteristic_summary": "Moderate band gap (~1.13 eV), elevated electronic polarizability (~9.88), and high mass density (~5.43 g/cm3)."
    },
    1: {
        "label": "Cluster 1",
        "description": "Large-unit-cell, open-framework crystal group (descriptive interpretation)",
        "characteristic_summary": "Exceptionally large unit cell volume (~296.2 A^3 vs dataset mean 166.4 A^3), moderate band gap (~1.59 eV), and moderate density (~3.37 g/cm3)."
    },
    2: {
        "label": "Cluster 2",
        "description": "Wide-bandgap insulator-like / ionic-dielectric group (descriptive interpretation)",
        "characteristic_summary": "Highest band gap (~3.54 eV), highest ionic polarization fraction (~0.614), lowest electronic polarizability (~3.32), and compact unit cell."
    },
    3: {
        "label": "Cluster 3",
        "description": "Ultra-high-permittivity / near-metallic narrow-gap group (descriptive interpretation)",
        "characteristic_summary": "Colossal static permittivity (~175.8), colossal electronic polarizability (~115.5), ultra-narrow band gap (~0.26 eV), and high density (~6.32 g/cm3)."
    }
}
