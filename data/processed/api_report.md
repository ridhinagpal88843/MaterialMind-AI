# MaterialMind-ECE — Phase 8 FastAPI Backend API Report

**Project:** MaterialMind-ECE — AI-Based Clustering and Intelligent Selection of Electronic Materials  
**Curriculum Scope:** Unit 3: Machine Learning / AI | Project 7: Material Clustering  
**Backend Framework:** FastAPI 0.141.1 + Uvicorn 0.51.0 + Pydantic v2  
**Execution Timestamp:** 2026-09-04  
**Status:** Completed & Validated (13 of 13 Automated Tests Passing)  

---

> [!CAUTION]
> ### MANDATORY SCIENTIFIC & TERMINOLOGY DISCLAIMER
> **HEURISTIC ECE SCREENING — NOT EXPERIMENTAL VALIDATION.**  
> All properties served across these endpoints are **existing DFT-computed raw properties and engineered descriptors** (`band_gap`, `poly_total`, `poly_electronic`, `ionic_polarization_fraction`, `density`, `volume`).  
> The API **DOES NOT** predict device-level or operational properties such as breakdown voltage, critical breakdown field, RF loss tangent ($\tan \delta$), insertion loss, high-frequency dispersion, signal propagation delay, parasitic capacitance, carrier mobility, switching frequency, or component lifetime.  
> All cluster physical descriptions are treated as **descriptive cluster interpretations**, not experimentally validated material classes.

---

## 1. Executive Summary

Phase 8 establishes the complete REST API for **MaterialMind-ECE**, bridging the raw data, preprocessing artifacts, unsupervised K-Means clusters, PCA coordinate projections, physical similarity engine, and heuristic ECE screening engine into a modular, production-ready backend service.

### Core Architectural Principles:
1. **Zero Retraining on Startup:** The API loads validated precomputed artifacts from `models/` and `data/processed/`. No retraining of K-Means, refitting of scalers, or recomputation of PCA occurs during server execution.
2. **Direct Engine Reuse:**
   - Physical similarity queries (`POST /api/similar-materials`) directly call the validated Phase 6 [backend/similarity.py](file:///c:/Users/HP/Desktop/PROJECT-7/backend/similarity.py) engine.
   - ECE application recommendations (`POST /api/recommend`) directly call the validated Phase 7 [backend/recommendation.py](file:///c:/Users/HP/Desktop/PROJECT-7/backend/recommendation.py) engine.
3. **Separated Feature Spaces:** Material detail and comparison endpoints strictly expose `raw_properties` and `standardized_features` as distinct, typed sub-objects.
4. **Artifact-Driven Metadata:** Silhouette score ($0.2351$) and clustering metrics are read dynamically from [data/processed/clustering_metrics.json](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/clustering_metrics.json).

---

## 2. API Endpoints Specification

### 2.1 System & Metadata
| Endpoint | Method | Description | Response Model |
|---|:---:|---|---|
| `/` | `GET` | Service root with documentation links and operational notice | `dict` |
| `/api/health` | `GET` | Health status and verification of loaded model artifacts | `HealthResponse` |
| `/api/summary` | `GET` | Overall dataset statistics, cluster metrics, and PCA variance | `SummaryResponse` |
| `/api/preprocessing-report` | `GET` | Audit summary of median imputer, IQR outliers (406 detections, 100% retained), and scaler | `PreprocessingReportResponse` |

### 2.2 Material Exploration
| Endpoint | Method | Parameters | Description | Response Model |
|---|:---:|---|---|---|
| `/api/materials` | `GET` | `page` (int, default=1)<br>`page_size` (int, default=50)<br>`cluster` (int, 0–3)<br>`search` (str)<br>`sort_by` (str)<br>`sort_order` ("asc"/"desc") | Paginated materials query with search, cluster filtering, and multi-field sorting | `MaterialListResponse` |
| `/api/material/{id}` | `GET` | `material_id` (str, path) | Retrieves full material record with separated raw and standardized features plus distance to cluster centroid | `MaterialDetailResponse` |

### 2.3 Unsupervised Clusters (K=4)
| Endpoint | Method | Parameters | Description | Response Model |
|---|:---:|---|---|---|
| `/api/clusters` | `GET` | None | Full profiles of all 4 clusters (sizes, feature means, medians, descriptive interpretations) | `ClustersResponse` |
| `/api/cluster/{id}` | `GET` | `cluster_id` (int, path: 0–3) | Centroid coordinates (raw & standardized) and Top-10 representative materials closest to centroid | `ClusterDetailResponse` |

### 2.4 Dimensionality Reduction (PCA)
| Endpoint | Method | Parameters | Description | Response Model |
|---|:---:|---|---|---|
| `/api/pca` | `GET` | None | 2D/3D PCA coordinates (`PC1`, `PC2`, `PC3`) for all 1,056 materials, explained variance ratios, and loadings matrix | `PCAResponse` |

### 2.5 Similarity, Recommendation & Comparison
| Endpoint | Method | Request Payload | Description | Response Model |
|---|:---:|---|---|---|
| `/api/similar-materials` | `POST` | `{"material_id": "mp-8062", "top_n": 5}` | Calls Phase 6 `MaterialSimilarityEngine` for Euclidean nearest neighbors in 6D standardized space | `SimilarityResponse` |
| `/api/recommend` | `POST` | `{"application_profile": "POWER_ELECTRONICS", "top_n": 5}` | Calls Phase 7 `MaterialRecommendationEngine` for heuristic screening across 4 profiles with feature attribution | `RecommendationResponse` |
| `/api/compare` | `POST` | `{"material_ids": ["mp-8062", "mp-468", "mp-871"]}` | Side-by-side comparison of 2–5 materials with pairwise Euclidean distance matrix | `ComparisonResponse` |

---

## 3. Automated Test Suite Results (`tests/test_api.py`)

All 13 automated tests executed and passed:

```text
test_root_endpoint .................................................... [PASS] (HTTP 200, online status)
test_health_endpoint .................................................. [PASS] (HTTP 200, all 4 artifacts loaded)
test_summary_endpoint ................................................. [PASS] (HTTP 200, 1056 mats, Sil=0.2351, PCA=74.66%)
test_preprocessing_report_endpoint .................................... [PASS] (HTTP 200, 406 outliers across 226 materials)
test_materials_pagination ............................................. [PASS] (HTTP 200, pagination slices validated)
test_materials_filtering .............................................. [PASS] (HTTP 200, cluster=3 returns 8 mats, formula search)
test_material_detail_separated_features ............................... [PASS] (HTTP 200, raw/standardized separation, 404 handling)
test_clusters_overview ................................................ [PASS] (HTTP 200, sizes: 412, 248, 388, 8)
test_cluster_detail ................................................... [PASS] (HTTP 200, centroids & 10 reps, 404 on invalid ID)
test_pca_endpoint ..................................................... [PASS] (HTTP 200, 1056 coordinates, variance verified)
test_similar_materials_endpoint ....................................... [PASS] (HTTP 200, Top 5 ascending distances, 404 handling)
test_recommend_endpoint_all_profiles .................................. [PASS] (HTTP 200, all 4 profiles, scores in [0, 100], disclaimers)
test_compare_endpoint ................................................. [PASS] (HTTP 200, pairwise distance symmetry, 400 on dups)

----------------------------------------------------------------------
Ran 13 tests in 0.770s

OK
```

---

## 4. Codebase Organization & Generated Files

```
PROJECT-7/
├── backend/
│   ├── __init__.py
│   ├── main.py                  # FastAPI application, CORS middleware, lifespan events
│   ├── config.py                # File paths, cluster descriptive interpretations, constants
│   ├── schemas.py               # Strongly typed Pydantic v2 request/response models
│   ├── similarity.py            # Phase 6 MaterialSimilarityEngine (reused directly)
│   ├── recommendation.py        # Phase 7 MaterialRecommendationEngine (reused directly)
│   └── routes/
│       ├── __init__.py
│       ├── materials.py         # /api/summary, /api/preprocessing-report, /api/materials, /api/material/{id}
│       ├── clusters.py          # /api/clusters, /api/cluster/{id}
│       ├── pca.py               # /api/pca
│       ├── similarity.py        # /api/similar-materials
│       ├── recommend.py         # /api/recommend
│       └── compare.py           # /api/compare
├── scripts/
│   ├── run_server.py            # Uvicorn server launcher
│   └── test_recommendations.py  # Phase 7 validation script
├── tests/
│   └── test_api.py              # Automated 13-test FastAPI integration suite
└── data/processed/
    ├── clustering_metrics.json  # Validated Phase 4 clustering metrics (optimal K=4, Silhouette=0.2351)
    └── api_report.md            # Complete API technical documentation
```
