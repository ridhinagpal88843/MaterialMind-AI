import os
import sys

# Ensure workspace root is in python path
workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if workspace_root not in sys.path:
    sys.path.insert(0, workspace_root)

import pandas as pd
from backend.similarity import MaterialSimilarityEngine

engine = MaterialSimilarityEngine(
    data_path=os.path.join(workspace_root, 'data/processed/materials_clustered.csv'),
    scaler_path=os.path.join(workspace_root, 'models/final_scaler.joblib')
)

test_materials = [
    'mp-8062',   # SiC  (Cluster 0)
    'mp-1602',   # SiS2 (Cluster 1)
    'mp-468',    # AlF3 (Cluster 2)
    'mp-871',    # FeSi (Cluster 3)
    'mp-830'     # GaN  (Cluster 0)
]

all_results = []
summary_stats = []

print("=" * 70)
print("MATERIALMIND-ECE: PHASE 6 SIMILARITY ENGINE TEST SUITE")
print("=" * 70)

for mid in test_materials:
    out = engine.find_similar(mid, top_n=5)
    qm = out['query_material']
    same_pct = out['same_cluster_percentage']
    
    summary_stats.append({
        'query_id': qm['material_id'],
        'query_formula': qm['formula'],
        'query_cluster': qm['cluster'],
        'same_cluster_count': out['same_cluster_count'],
        'same_cluster_percentage': same_pct
    })
    
    print(f"\n>>> QUERY: {qm['formula']} ({qm['material_id']}) | Cluster: {qm['cluster']} | Same-Cluster Agreement: {same_pct}%")
    print(f"    Properties: Eg={qm['band_gap']} eV, eps_r={qm['poly_total']}, eps_inf={qm['poly_electronic']}, f_ionic={qm['ionic_polarization_fraction']}, rho={qm['density']} g/cm3, Vol={qm['volume']} A3")
    print("-" * 70)
    
    neighbors = out['neighbors']
    for rank, (_, r) in enumerate(neighbors.iterrows(), 1):
        print(f"  #{rank} {r['formula']:8s} ({r['material_id']:9s}) | Cluster: {r['cluster']} (Match: {r['same_cluster']}) | Dist: {r['euclidean_distance']:6.4f} | SimScore: {r['similarity_score']:6.4f}")
        print(f"      [Eg: {r['band_gap']} eV, eps_r: {r['poly_total']}, f_ionic: {r['ionic_polarization_fraction']}, rho: {r['density']} g/cm3, Vol: {r['volume']} A3]")
        
        all_results.append({
            'query_material_id': qm['material_id'],
            'query_formula': qm['formula'],
            'query_cluster': qm['cluster'],
            'rank': rank,
            'neighbor_material_id': r['material_id'],
            'neighbor_formula': r['formula'],
            'neighbor_cluster': r['cluster'],
            'same_cluster': r['same_cluster'],
            'euclidean_distance': r['euclidean_distance'],
            'similarity_score': r['similarity_score'],
            'band_gap': r['band_gap'],
            'poly_total': r['poly_total'],
            'poly_electronic': r['poly_electronic'],
            'ionic_polarization_fraction': r['ionic_polarization_fraction'],
            'density': r['density'],
            'volume': r['volume']
        })

df_res = pd.DataFrame(all_results)
out_dir = os.path.join(workspace_root, 'data/processed')
os.makedirs(out_dir, exist_ok=True)
res_csv_path = os.path.join(out_dir, 'similarity_test_results.csv')
df_res.to_csv(res_csv_path, index=False)
print("\n" + "=" * 70)
print(f"Saved test results to: {res_csv_path}")

df_summary = pd.DataFrame(summary_stats)
print("\n--- SAME-CLUSTER AGREEMENT SUMMARY ---")
print(df_summary.to_string(index=False))

total_same_cluster = df_res['same_cluster'].mean() * 100
print(f"\nOverall Top-5 Same-Cluster Agreement across all 5 test queries: {total_same_cluster:.1f}%")
