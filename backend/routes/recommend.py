"""
MaterialMind-ECE — Material Recommendation Endpoint
Directly bridges to the Phase 7 MaterialRecommendationEngine.
"""

from fastapi import APIRouter, HTTPException
from backend.recommendation import MaterialRecommendationEngine
from backend.schemas import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendedMaterialItem,
    MaterialRawProperties
)

router = APIRouter(prefix="/api", tags=["ECE Recommendation"])

# Reusable Phase 7 Recommendation Engine instance
recommendation_engine = MaterialRecommendationEngine()

@router.post("/recommend", response_model=RecommendationResponse)
def post_recommend(req: RecommendationRequest):
    """
    Generate heuristic material recommendations across 4 ECE application profiles
    with individual feature contribution point attribution and scientific caveats.
    """
    profile_key = req.application_profile.strip().upper()
    valid_profiles = list(recommendation_engine.profile_configs.keys())
    
    if profile_key not in valid_profiles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid application profile '{req.application_profile}'. Must be one of: {valid_profiles}"
        )

    try:
        res = recommendation_engine.recommend(profile_key, top_n=req.top_n, include_similarity=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation engine error: {str(e)}")

    profile_info = res['profile_info']
    top_df = res['top_materials']
    nearest_map = res['nearest_neighbors']

    recommended_items = []
    contrib_cols = [c for c in top_df.columns if c.startswith('contrib_')]

    for _, row in top_df.iterrows():
        mid = str(row['material_id'])
        raw_props = MaterialRawProperties(
            band_gap=round(float(row['band_gap']), 3),
            poly_total=round(float(row['poly_total']), 3),
            poly_electronic=round(float(row['poly_electronic']), 3),
            ionic_polarization_fraction=round(float(row['ionic_polarization_fraction']), 4),
            density=round(float(row['density']), 3),
            volume=round(float(row['volume']), 2)
        )

        contributions = {c.replace('contrib_', ''): round(float(row[c]), 2) for c in contrib_cols}
        nn_data = nearest_map.get(mid)

        recommended_items.append(RecommendedMaterialItem(
            rank=int(row['rank']),
            material_id=mid,
            formula=str(row['formula']),
            cluster=int(row['cluster']),
            recommendation_score=round(float(row['recommendation_score']), 2),
            raw_properties=raw_props,
            feature_contributions=contributions,
            explanation=str(row['explanation']),
            nearest_neighbor=nn_data
        ))

    return RecommendationResponse(
        application_profile=profile_key,
        profile_name=profile_info['name'],
        description=profile_info['description'],
        disclaimer=res['disclaimer'],
        total_candidates=len(recommendation_engine.df),
        cluster_distribution=res['cluster_distribution'],
        recommendations=recommended_items
    )
