"""
MaterialMind-ECE — Pydantic Request and Response Schemas
Strongly typed schemas for API serialization, validation, and documentation.
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

# -------------------------------------------------------------------------
# Common & Health Schemas
# -------------------------------------------------------------------------
class HealthResponse(BaseModel):
    status: str = Field(..., example="healthy")
    api_version: str = Field(..., example="1.0.0")
    loaded_models: Dict[str, bool] = Field(..., example={"scaler": True, "kmeans": True, "similarity": True, "recommendation": True})

class SummaryResponse(BaseModel):
    total_materials: int = Field(..., example=1056)
    feature_count: int = Field(..., example=6)
    features: List[str] = Field(..., example=['band_gap', 'poly_total', 'poly_electronic', 'ionic_polarization_fraction', 'density', 'volume'])
    clusters_count: int = Field(..., example=4)
    optimal_k: int = Field(..., example=4)
    silhouette_score: Optional[float] = Field(None, example=0.2351)
    inertia: Optional[float] = Field(None, example=3425.07)
    pca_cumulative_variance: float = Field(..., example=0.7466)
    property_terminology_notice: str = Field(
        ...,
        example="Properties are existing DFT-computed raw properties and engineered descriptors. No unmeasured device properties are predicted."
    )

class PreprocessingReportResponse(BaseModel):
    dataset_name: str
    total_rows: int
    missing_value_imputation: str
    outlier_detection_method: str
    total_feature_level_outliers: int
    materials_with_outliers: int
    outlier_retention_policy: str
    feature_scaling_method: str
    final_clustering_features: List[str]

# -------------------------------------------------------------------------
# Material Schemas
# -------------------------------------------------------------------------
class MaterialRawProperties(BaseModel):
    band_gap: float = Field(..., description="Band gap in eV")
    poly_total: float = Field(..., description="Average total dielectric constant (eps_r)")
    poly_electronic: float = Field(..., description="Average electronic dielectric constant (eps_inf)")
    ionic_polarization_fraction: float = Field(..., description="Fraction of static response from ionic polarization")
    density: float = Field(..., description="Mass density in g/cm3")
    volume: float = Field(..., description="Unit cell volume in A^3")

class MaterialStandardizedFeatures(BaseModel):
    z_band_gap: float
    z_poly_total: float
    z_poly_electronic: float
    z_ionic_polarization_fraction: float
    z_density: float
    z_volume: float

class MaterialListItem(BaseModel):
    material_id: str
    formula: str
    cluster: int
    band_gap: float
    poly_total: float
    poly_electronic: float
    ionic_polarization_fraction: float
    density: float
    volume: float

class MaterialListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    materials: List[MaterialListItem]

class MaterialDetailResponse(BaseModel):
    material_id: str
    formula: str
    cluster: int
    cluster_interpretation: str
    raw_properties: MaterialRawProperties
    standardized_features: MaterialStandardizedFeatures
    distance_to_cluster_centroid: float

# -------------------------------------------------------------------------
# Cluster Schemas
# -------------------------------------------------------------------------
class ClusterProfileItem(BaseModel):
    cluster_id: int
    material_count: int
    percentage: float
    label: str
    description: str
    characteristic_summary: str
    feature_means: Dict[str, float]
    feature_medians: Dict[str, float]

class ClustersResponse(BaseModel):
    optimal_k: int
    silhouette_score: Optional[float]
    clusters: List[ClusterProfileItem]

class ClusterDetailResponse(BaseModel):
    cluster: ClusterProfileItem
    centroid_standardized: Dict[str, float]
    centroid_raw: Dict[str, float]
    representative_materials: List[MaterialListItem]

# -------------------------------------------------------------------------
# PCA Schemas
# -------------------------------------------------------------------------
class PCAPoint(BaseModel):
    material_id: str
    formula: str
    cluster: int
    pc1: float
    pc2: float
    pc3: float

class PCAResponse(BaseModel):
    total_materials: int
    explained_variance_ratio: Dict[str, float]
    cumulative_variance_explained: float
    loadings: Dict[str, Dict[str, float]]
    coordinates: List[PCAPoint]

# -------------------------------------------------------------------------
# Similarity Schemas
# -------------------------------------------------------------------------
class SimilarityRequest(BaseModel):
    material_id: Optional[str] = Field(None, example="mp-8062")
    formula: Optional[str] = Field(None, example="SiC")
    top_n: int = Field(5, ge=1, le=50, example=5)

class SimilarNeighborItem(BaseModel):
    material_id: str
    formula: str
    cluster: int
    same_cluster: bool
    euclidean_distance: float
    similarity_score: float
    similarity_pct: float
    raw_properties: MaterialRawProperties

class SimilarityResponse(BaseModel):
    query_material: Dict[str, Any]
    top_n: int
    same_cluster_count: int
    same_cluster_percentage: float
    neighbors: List[SimilarNeighborItem]
    disclaimer: str

# -------------------------------------------------------------------------
# Recommendation Schemas
# -------------------------------------------------------------------------
class RecommendationRequest(BaseModel):
    application_profile: str = Field(..., example="POWER_ELECTRONICS")
    top_n: int = Field(5, ge=1, le=50, example=5)

class RecommendedMaterialItem(BaseModel):
    rank: int
    material_id: str
    formula: str
    cluster: int
    recommendation_score: float
    raw_properties: MaterialRawProperties
    feature_contributions: Dict[str, float]
    explanation: str
    nearest_neighbor: Optional[Dict[str, Any]] = None

class RecommendationResponse(BaseModel):
    application_profile: str
    profile_name: str
    description: str
    disclaimer: str
    total_candidates: int
    cluster_distribution: Dict[int, int]
    recommendations: List[RecommendedMaterialItem]

# -------------------------------------------------------------------------
# Comparison Schemas
# -------------------------------------------------------------------------
class ComparisonRequest(BaseModel):
    material_ids: List[str] = Field(..., min_length=2, max_length=5, example=["mp-8062", "mp-468", "mp-871"])

class ComparisonItem(BaseModel):
    material_id: str
    formula: str
    cluster: int
    raw_properties: MaterialRawProperties
    standardized_features: MaterialStandardizedFeatures

class ComparisonResponse(BaseModel):
    materials: List[ComparisonItem]
    pairwise_euclidean_distances: Dict[str, Dict[str, float]]
    cluster_diversity: Dict[str, Any]
