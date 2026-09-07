"""
MaterialMind-ECE — Comprehensive API Test Suite
Automated integration and unit tests for all 10 FastAPI endpoints using TestClient.
"""

import os
import sys
from pathlib import Path

# Add project root to sys.path
project_root = str(Path(__file__).resolve().parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

import unittest
from fastapi.testclient import TestClient
from backend.main import app

class TestMaterialMindAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    # ---------------------------------------------------------------------
    # 1. System & Overview Endpoints
    # ---------------------------------------------------------------------
    def test_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("title", data)
        self.assertEqual(data["status"], "online")

    def test_health_endpoint(self):
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["loaded_models"]["scaler"])
        self.assertTrue(data["loaded_models"]["kmeans"])
        self.assertTrue(data["loaded_models"]["materials_dataset"])
        self.assertTrue(data["loaded_models"]["pca_coordinates"])

    def test_summary_endpoint(self):
        response = self.client.get("/api/summary")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_materials"], 1056)
        self.assertEqual(data["feature_count"], 6)
        self.assertEqual(data["clusters_count"], 4)
        self.assertEqual(data["optimal_k"], 4)
        # Silhouette score verified from Phase 4 artifact
        self.assertEqual(data["silhouette_score"], 0.2351)
        self.assertAlmostEqual(data["pca_cumulative_variance"], 0.7466, places=3)
        self.assertIn("existing DFT-computed raw properties", data["property_terminology_notice"])

    def test_preprocessing_report_endpoint(self):
        response = self.client.get("/api/preprocessing-report")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_rows"], 1056)
        self.assertEqual(data["total_feature_level_outliers"], 406)
        self.assertEqual(data["materials_with_outliers"], 226)
        self.assertIn("100% retained", data["outlier_retention_policy"])

    # ---------------------------------------------------------------------
    # 2. Materials Exploration Endpoints
    # ---------------------------------------------------------------------
    def test_materials_pagination(self):
        response = self.client.get("/api/materials?page=1&page_size=20")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total"], 1056)
        self.assertEqual(data["page"], 1)
        self.assertEqual(data["page_size"], 20)
        self.assertEqual(len(data["materials"]), 20)

    def test_materials_filtering(self):
        # Filter by Cluster 3 (rare cluster, exactly 8 materials)
        response = self.client.get("/api/materials?cluster=3")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total"], 8)
        self.assertEqual(len(data["materials"]), 8)
        for m in data["materials"]:
            self.assertEqual(m["cluster"], 3)

        # Search by formula substring
        response = self.client.get("/api/materials?search=GaN")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(data["total"], 0)
        self.assertTrue(any("gan" in m["formula"].lower() for m in data["materials"]))

    def test_material_detail_separated_features(self):
        # Query known material SiC
        response = self.client.get("/api/material/mp-8062")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["material_id"], "mp-8062")
        self.assertEqual(data["formula"], "SiC")
        self.assertEqual(data["cluster"], 0)
        self.assertIn("descriptive interpretation", data["cluster_interpretation"])

        # Check raw properties and standardized features are distinct separate fields
        self.assertIn("raw_properties", data)
        self.assertIn("standardized_features", data)
        self.assertIn("band_gap", data["raw_properties"])
        self.assertIn("z_band_gap", data["standardized_features"])
        self.assertGreater(data["distance_to_cluster_centroid"], 0.0)

        # 404 for invalid material ID
        err_res = self.client.get("/api/material/nonexistent-id-99999")
        self.assertEqual(err_res.status_code, 404)

    # ---------------------------------------------------------------------
    # 3. Clustering Endpoints
    # ---------------------------------------------------------------------
    def test_clusters_overview(self):
        response = self.client.get("/api/clusters")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["optimal_k"], 4)
        self.assertEqual(len(data["clusters"]), 4)

        cluster_counts = {c["cluster_id"]: c["material_count"] for c in data["clusters"]}
        self.assertEqual(cluster_counts[0], 412)
        self.assertEqual(cluster_counts[1], 248)
        self.assertEqual(cluster_counts[2], 388)
        self.assertEqual(cluster_counts[3], 8)

    def test_cluster_detail(self):
        response = self.client.get("/api/cluster/2")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["cluster"]["cluster_id"], 2)
        self.assertIn("descriptive interpretation", data["cluster"]["description"])
        self.assertEqual(len(data["representative_materials"]), 10)
        self.assertIn("band_gap", data["centroid_raw"])
        self.assertIn("band_gap", data["centroid_standardized"])

        # Invalid cluster ID
        err_res = self.client.get("/api/cluster/10")
        self.assertEqual(err_res.status_code, 404)

    # ---------------------------------------------------------------------
    # 4. PCA Projections Endpoint
    # ---------------------------------------------------------------------
    def test_pca_endpoint(self):
        response = self.client.get("/api/pca")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["total_materials"], 1056)
        self.assertEqual(len(data["coordinates"]), 1056)
        self.assertAlmostEqual(data["cumulative_variance_explained"], 0.7466, places=3)
        self.assertIn("PC1", data["explained_variance_ratio"])
        self.assertIn("band_gap", data["loadings"])

    # ---------------------------------------------------------------------
    # 5. Similarity Search Endpoint
    # ---------------------------------------------------------------------
    def test_similar_materials_endpoint(self):
        payload = {"material_id": "mp-8062", "top_n": 5}
        response = self.client.post("/api/similar-materials", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["query_material"]["material_id"], "mp-8062")
        self.assertEqual(len(data["neighbors"]), 5)
        self.assertEqual(data["same_cluster_count"], 4)
        self.assertEqual(data["same_cluster_percentage"], 80.0)

        # Distances must be ascending
        dists = [n["euclidean_distance"] for n in data["neighbors"]]
        self.assertEqual(dists, sorted(dists))

        # 404 for unknown material
        err_res = self.client.post("/api/similar-materials", json={"material_id": "mp-fake-id"})
        self.assertEqual(err_res.status_code, 404)

    # ---------------------------------------------------------------------
    # 6. Recommendation Screening Endpoint
    # ---------------------------------------------------------------------
    def test_recommend_endpoint_all_profiles(self):
        profiles = ['POWER_ELECTRONICS', 'DIELECTRIC_CAPACITIVE', 'RF_HIGH_FREQUENCY', 'OPTOELECTRONIC']
        for prof in profiles:
            payload = {"application_profile": prof, "top_n": 5}
            response = self.client.post("/api/recommend", json=payload)
            self.assertEqual(response.status_code, 200, f"Failed for profile {prof}")
            data = response.json()
            self.assertEqual(data["application_profile"], prof)
            self.assertEqual(len(data["recommendations"]), 5)
            self.assertIn("HEURISTIC ECE SCREENING", data["disclaimer"])

            # Verify scores in [0, 100] and exact attribution
            for rec in data["recommendations"]:
                score = rec["recommendation_score"]
                self.assertGreaterEqual(score, 0.0)
                self.assertLessEqual(score, 100.0)
                contrib_sum = sum(rec["feature_contributions"].values())
                self.assertAlmostEqual(score, contrib_sum, places=1)

        # Invalid profile
        err_res = self.client.post("/api/recommend", json={"application_profile": "INVALID_PROFILE"})
        self.assertEqual(err_res.status_code, 400)

    # ---------------------------------------------------------------------
    # 7. Comparison Endpoint
    # ---------------------------------------------------------------------
    def test_compare_endpoint(self):
        payload = {"material_ids": ["mp-8062", "mp-468", "mp-871"]}
        response = self.client.post("/api/compare", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["materials"]), 3)
        self.assertEqual(data["cluster_diversity"]["distinct_clusters_count"], 3)

        # Pairwise distance checks
        dists = data["pairwise_euclidean_distances"]
        self.assertEqual(dists["mp-8062"]["mp-8062"], 0.0)
        self.assertEqual(dists["mp-8062"]["mp-468"], dists["mp-468"]["mp-8062"])

        # Error on duplicates
        err_dup = self.client.post("/api/compare", json={"material_ids": ["mp-8062", "mp-8062"]})
        self.assertEqual(err_dup.status_code, 400)

        # Error on missing material
        err_miss = self.client.post("/api/compare", json={"material_ids": ["mp-8062", "mp-unknown"]})
        self.assertEqual(err_miss.status_code, 404)

if __name__ == '__main__':
    unittest.main(verbosity=2)
