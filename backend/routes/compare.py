"""
MaterialMind-ECE — Material Comparison Endpoint
Enables multi-material side-by-side property comparison and pairwise distance analysis.
"""

import joblib
import pandas as pd
import numpy as np
from fastapi import APIRouter, HTTPException

from backend.config import CLUSTERED_CSV, FINAL_SCALER_JOBLIB, FEATURES
from backend.schemas import (
    ComparisonRequest,
    ComparisonResponse,
    ComparisonItem,
    MaterialRawProperties,
    MaterialStandardizedFeatures
)

router = APIRouter(prefix="/api", tags=["Material Comparison"])

df_materials = pd.read_csv(CLUSTERED_CSV)
scaler = joblib.load(FINAL_SCALER_JOBLIB)
X_scaled = scaler.transform(df_materials[FEATURES])
id_to_idx = {mid: i for i, mid in enumerate(df_materials['material_id'])}

@router.post("/compare", response_model=ComparisonResponse)
def post_compare(req: ComparisonRequest):
    """
    Compare 2 to 5 materials side-by-side with raw properties, standardized descriptors,
    and pairwise Euclidean distance matrix in 6D standardized space.
    """
    requested_ids = [mid.strip() for mid in req.material_ids]
    
    # Check for duplicates in request
    if len(set(requested_ids)) < len(requested_ids):
        raise HTTPException(status_code=400, detail="Duplicate material IDs in comparison request.")

    # Validate existence
    missing = [mid for mid in requested_ids if mid not in id_to_idx]
    if missing:
        raise HTTPException(
            status_code=404,
            detail=f"Materials not found in database: {missing}"
        )

    items = []
    vectors = []
    clusters = []

    for mid in requested_ids:
        idx = id_to_idx[mid]
        row = df_materials.iloc[idx]
        z_vec = X_scaled[idx]
        vectors.append(z_vec)
        clusters.append(int(row['cluster']))

        raw_props = MaterialRawProperties(
            band_gap=round(float(row['band_gap']), 3),
            poly_total=round(float(row['poly_total']), 3),
            poly_electronic=round(float(row['poly_electronic']), 3),
            ionic_polarization_fraction=round(float(row['ionic_polarization_fraction']), 4),
            density=round(float(row['density']), 3),
            volume=round(float(row['volume']), 2)
        )

        std_props = MaterialStandardizedFeatures(
            z_band_gap=round(float(z_vec[0]), 4),
            z_poly_total=round(float(z_vec[1]), 4),
            z_poly_electronic=round(float(z_vec[2]), 4),
            z_ionic_polarization_fraction=round(float(z_vec[3]), 4),
            z_density=round(float(z_vec[4]), 4),
            z_volume=round(float(z_vec[5]), 4)
        )

        items.append(ComparisonItem(
            material_id=mid,
            formula=str(row['formula']),
            cluster=int(row['cluster']),
            raw_properties=raw_props,
            standardized_features=std_props
        ))

    # Compute pairwise Euclidean distance matrix
    pairwise_dists = {}
    for i, id_a in enumerate(requested_ids):
        pairwise_dists[id_a] = {}
        for j, id_b in enumerate(requested_ids):
            dist = float(np.linalg.norm(vectors[i] - vectors[j]))
            pairwise_dists[id_a][id_b] = round(dist, 4)

    # Cluster diversity summary
    unique_clusters = list(set(clusters))
    cluster_diversity = {
        "distinct_clusters_count": len(unique_clusters),
        "clusters_represented": sorted(unique_clusters),
        "all_same_cluster": len(unique_clusters) == 1
    }

    return ComparisonResponse(
        materials=items,
        pairwise_euclidean_distances=pairwise_dists,
        cluster_diversity=cluster_diversity
    )
