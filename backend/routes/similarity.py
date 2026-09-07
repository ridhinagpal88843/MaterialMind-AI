"""
MaterialMind-ECE — Material Similarity Search Endpoint
Directly bridges to the Phase 6 MaterialSimilarityEngine.
"""

from fastapi import APIRouter, HTTPException
from backend.similarity import MaterialSimilarityEngine
from backend.schemas import (
    SimilarityRequest,
    SimilarityResponse,
    SimilarNeighborItem,
    MaterialRawProperties
)

router = APIRouter(prefix="/api", tags=["Material Similarity"])

# Reusable Phase 6 Similarity Engine instance
similarity_engine = MaterialSimilarityEngine()

DISCLAIMER_SIMILARITY = (
    "Relative geometric proximity metric in standardized 6D space (S = 1 / (1 + d)). "
    "This is NOT a probability distribution or likelihood."
)

@router.post("/similar-materials", response_model=SimilarityResponse)
def post_similar_materials(req: SimilarityRequest):
    """
    Find Top-N most similar materials to the query material (by material_id or formula)
    using standardized Euclidean distance and normalized relative similarity scoring.
    """
    query = req.material_id or req.formula
    if not query:
        raise HTTPException(
            status_code=400,
            detail="Must provide either 'material_id' (e.g. 'mp-8062') or 'formula' (e.g. 'SiC')."
        )

    try:
        res = similarity_engine.find_similar(query=query.strip(), top_n=req.top_n)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Similarity computation error: {str(e)}")

    neighbor_items = []
    for _, row in res['neighbors'].iterrows():
        raw_props = MaterialRawProperties(
            band_gap=round(float(row['band_gap']), 3),
            poly_total=round(float(row['poly_total']), 3),
            poly_electronic=round(float(row['poly_electronic']), 3),
            ionic_polarization_fraction=round(float(row['ionic_polarization_fraction']), 4),
            density=round(float(row['density']), 3),
            volume=round(float(row['volume']), 2)
        )
        neighbor_items.append(SimilarNeighborItem(
            material_id=str(row['material_id']),
            formula=str(row['formula']),
            cluster=int(row['cluster']),
            same_cluster=bool(row['same_cluster']),
            euclidean_distance=round(float(row['euclidean_distance']), 4),
            similarity_score=round(float(row['similarity_score']), 4),
            similarity_pct=round(float(row['similarity_pct']), 2),
            raw_properties=raw_props
        ))

    return SimilarityResponse(
        query_material=res['query_material'],
        top_n=req.top_n,
        same_cluster_count=res['same_cluster_count'],
        same_cluster_percentage=res['same_cluster_percentage'],
        neighbors=neighbor_items,
        disclaimer=DISCLAIMER_SIMILARITY
    )
