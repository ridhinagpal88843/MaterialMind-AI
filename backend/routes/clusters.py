"""
MaterialMind-ECE — K-Means Clustering Endpoints
Exposes cluster profiles, descriptive interpretations, and centroid proximities.
"""

import json
import os
import joblib
import pandas as pd
import numpy as np
from fastapi import APIRouter, HTTPException

from backend.config import (
    CLUSTERED_CSV,
    CLUSTER_PROFILES_CSV,
    FINAL_SCALER_JOBLIB,
    KMEANS_JOBLIB,
    CLUSTERING_METRICS_JSON,
    FEATURES,
    CLUSTER_INTERPRETATIONS
)
from backend.schemas import (
    ClustersResponse,
    ClusterProfileItem,
    ClusterDetailResponse,
    MaterialListItem
)

router = APIRouter(prefix="/api", tags=["Clustering"])

df_materials = pd.read_csv(CLUSTERED_CSV)
df_profiles = pd.read_csv(CLUSTER_PROFILES_CSV)
scaler = joblib.load(FINAL_SCALER_JOBLIB)
kmeans = joblib.load(KMEANS_JOBLIB)

X_scaled = scaler.transform(df_materials[FEATURES])

@router.get("/clusters", response_model=ClustersResponse)
def get_clusters():
    """
    Retrieve all 4 K-Means cluster profiles with feature means, medians, and descriptive interpretations.
    """
    silhouette = None
    if os.path.exists(CLUSTERING_METRICS_JSON):
        try:
            with open(CLUSTERING_METRICS_JSON, 'r', encoding='utf-8') as f:
                metrics_data = json.load(f)
                silhouette = metrics_data.get('silhouette_score')
        except Exception:
            pass

    cluster_items = []
    for _, row in df_profiles.iterrows():
        cid = int(row['cluster_id'])
        interp = CLUSTER_INTERPRETATIONS.get(cid, {
            "label": f"Cluster {cid}",
            "description": f"Cluster {cid} (descriptive interpretation)",
            "characteristic_summary": ""
        })

        means = {f: round(float(row[f"{f}_mean"]), 4) for f in FEATURES}
        medians = {f: round(float(row[f"{f}_median"]), 4) for f in FEATURES}

        cluster_items.append(ClusterProfileItem(
            cluster_id=cid,
            material_count=int(row['material_count']),
            percentage=float(row['percentage']),
            label=interp['label'],
            description=interp['description'],
            characteristic_summary=interp['characteristic_summary'],
            feature_means=means,
            feature_medians=medians
        ))

    return ClustersResponse(
        optimal_k=int(kmeans.n_clusters),
        silhouette_score=silhouette,
        clusters=cluster_items
    )

@router.get("/cluster/{cluster_id}", response_model=ClusterDetailResponse)
def get_cluster_detail(cluster_id: int):
    """
    Retrieve details for a specific cluster (0 to 3), including centroid coordinates
    (in both standardized and raw space) and the 10 representative materials closest to the centroid.
    """
    if cluster_id < 0 or cluster_id >= kmeans.n_clusters:
        raise HTTPException(
            status_code=404,
            detail=f"Cluster ID {cluster_id} not found. Valid cluster IDs are 0 to {kmeans.n_clusters - 1}."
        )

    profile_row = df_profiles[df_profiles['cluster_id'] == cluster_id].iloc[0]
    interp = CLUSTER_INTERPRETATIONS.get(cluster_id, {
        "label": f"Cluster {cluster_id}",
        "description": f"Cluster {cluster_id} (descriptive interpretation)",
        "characteristic_summary": ""
    })

    means = {f: round(float(profile_row[f"{f}_mean"]), 4) for f in FEATURES}
    medians = {f: round(float(profile_row[f"{f}_median"]), 4) for f in FEATURES}

    cluster_profile = ClusterProfileItem(
        cluster_id=cluster_id,
        material_count=int(profile_row['material_count']),
        percentage=float(profile_row['percentage']),
        label=interp['label'],
        description=interp['description'],
        characteristic_summary=interp['characteristic_summary'],
        feature_means=means,
        feature_medians=medians
    )

    # Standardized centroid
    centroid_std = kmeans.cluster_centers_[cluster_id]
    centroid_std_dict = {f: round(float(centroid_std[i]), 4) for i, f in enumerate(FEATURES)}

    # Inverse transform to get raw centroid coordinates
    centroid_raw = scaler.inverse_transform(centroid_std.reshape(1, -1))[0]
    centroid_raw_dict = {f: round(float(centroid_raw[i]), 4) for i, f in enumerate(FEATURES)}

    # Find representative materials closest to centroid
    cluster_indices = df_materials.index[df_materials['cluster'] == cluster_id].tolist()
    cluster_vectors = X_scaled[cluster_indices]
    dists_to_centroid = np.linalg.norm(cluster_vectors - centroid_std, axis=1)

    # Sort indices by distance
    sorted_order = np.argsort(dists_to_centroid)[:10]
    top_rep_indices = [cluster_indices[i] for i in sorted_order]

    representative_materials = []
    for idx in top_rep_indices:
        row = df_materials.iloc[idx]
        representative_materials.append(MaterialListItem(
            material_id=row['material_id'],
            formula=row['formula'],
            cluster=cluster_id,
            band_gap=round(float(row['band_gap']), 3),
            poly_total=round(float(row['poly_total']), 3),
            poly_electronic=round(float(row['poly_electronic']), 3),
            ionic_polarization_fraction=round(float(row['ionic_polarization_fraction']), 4),
            density=round(float(row['density']), 3),
            volume=round(float(row['volume']), 2)
        ))

    return ClusterDetailResponse(
        cluster=cluster_profile,
        centroid_standardized=centroid_std_dict,
        centroid_raw=centroid_raw_dict,
        representative_materials=representative_materials
    )
