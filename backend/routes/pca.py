"""
MaterialMind-ECE — PCA Projections & Dimensionality Reduction Endpoints
Provides 2D/3D PCA coordinates, explained variance ratios, and feature loadings
for interactive visualization on the frontend.
"""

import pandas as pd
from fastapi import APIRouter, HTTPException

from backend.config import PCA_COORDINATES_CSV
from backend.schemas import PCAResponse, PCAPoint

router = APIRouter(prefix="/api", tags=["Dimensionality Reduction (PCA)"])

# Verified PCA parameters from Phase 5
EXPLAINED_VARIANCE_RATIO = {
    "PC1": 0.3708,
    "PC2": 0.2100,
    "PC3": 0.1658
}
CUMULATIVE_VARIANCE = 0.7466

LOADINGS = {
    "band_gap": {"PC1": -0.4401, "PC2": 0.3729, "PC3": 0.1815},
    "poly_total": {"PC1": 0.5210, "PC2": 0.3872, "PC3": 0.3710},
    "poly_electronic": {"PC1": 0.5667, "PC2": 0.1558, "PC3": 0.2801},
    "ionic_polarization_fraction": {"PC1": -0.2573, "PC2": 0.6044, "PC3": 0.2293},
    "density": {"PC1": 0.3840, "PC2": 0.0763, "PC3": -0.5545},
    "volume": {"PC1": -0.0004, "PC2": -0.5618, "PC3": 0.6252}
}

@router.get("/pca", response_model=PCAResponse)
def get_pca():
    """
    Return 3D PCA coordinates for all 1,056 materials, along with explained variance
    ratios and feature loadings matrix for client-side rendering.
    """
    if not PCA_COORDINATES_CSV.exists():
        raise HTTPException(status_code=500, detail="PCA coordinates artifact not found on server.")

    df_pca = pd.read_csv(PCA_COORDINATES_CSV)

    coordinates = []
    for _, row in df_pca.iterrows():
        coordinates.append(PCAPoint(
            material_id=str(row['material_id']),
            formula=str(row['formula']),
            cluster=int(row['cluster']),
            pc1=round(float(row['PC1']), 4),
            pc2=round(float(row['PC2']), 4),
            pc3=round(float(row['PC3']), 4)
        ))

    return PCAResponse(
        total_materials=len(coordinates),
        explained_variance_ratio=EXPLAINED_VARIANCE_RATIO,
        cumulative_variance_explained=CUMULATIVE_VARIANCE,
        loadings=LOADINGS,
        coordinates=coordinates
    )
