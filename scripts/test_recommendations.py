"""
Test and validate Phase 7 Material Recommendation Engine.
Executes all 4 profiles, verifies sanity checks, and exports:
data/processed/recommendation_test_results.csv
"""

import os
import sys
from pathlib import Path

# Add project root to sys.path
project_root = str(Path(__file__).resolve().parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

import pandas as pd
import numpy as np
from backend.recommendation import MaterialRecommendationEngine

def run_tests():
    engine = MaterialRecommendationEngine()
    profiles = ['POWER_ELECTRONICS', 'DIELECTRIC_CAPACITIVE', 'RF_HIGH_FREQUENCY', 'OPTOELECTRONIC']
    
    all_results = []
    print("=" * 70)
    print("MATERIALMIND-ECE — PHASE 7 RECOMMENDATION ENGINE VALIDATION")
    print("=" * 70)
    
    for prof in profiles:
        res = engine.recommend(prof, top_n=5, include_similarity=True)
        top_df = res['top_materials'].copy()
        
        # Sanity Check 1: Top 5 returned with no missing rows
        assert len(top_df) == 5, f"Expected 5 recommendations for {prof}, got {len(top_df)}"
        
        # Sanity Check 2: No duplicate material_ids in Top 5
        assert top_df['material_id'].nunique() == 5, f"Duplicate materials detected in {prof}"
        
        # Sanity Check 3: Scores bounded in [0, 100]
        assert (top_df['recommendation_score'] >= 0.0).all() and (top_df['recommendation_score'] <= 100.0).all(), \
            f"Score out of bounds in {prof}"
            
        # Sanity Check 4: Feature contribution sum consistency
        contrib_cols = [c for c in top_df.columns if c.startswith('contrib_')]
        sum_contribs = top_df[contrib_cols].sum(axis=1)
        discrepancy = np.abs(sum_contribs - top_df['recommendation_score'])
        assert (discrepancy < 1e-4).all(), f"Contributions do not sum to total score in {prof}: max diff {discrepancy.max()}"
        
        # Attach profile column and nearest neighbor info
        for idx, row in top_df.iterrows():
            mid = row['material_id']
            nn_info = res['nearest_neighbors'].get(mid, {})
            
            row_dict = {
                'application_profile': prof,
                'rank': int(row['rank']),
                'material_id': row['material_id'],
                'formula': row['formula'],
                'cluster': int(row['cluster']),
                'recommendation_score': round(float(row['recommendation_score']), 2),
                'band_gap': round(float(row['band_gap']), 3),
                'poly_total': round(float(row['poly_total']), 3),
                'poly_electronic': round(float(row['poly_electronic']), 3),
                'ionic_polarization_fraction': round(float(row['ionic_polarization_fraction']), 4),
                'density': round(float(row['density']), 3),
                'volume': round(float(row['volume']), 2),
                'explanation': row['explanation'],
                'nearest_neighbor_id': nn_info.get('neighbor_id', 'N/A'),
                'nearest_neighbor_formula': nn_info.get('neighbor_formula', 'N/A'),
                'nearest_neighbor_similarity': round(float(nn_info.get('similarity_score', 0.0)), 4),
                'disclaimer': res['disclaimer']
            }
            
            # Add specific contribution columns
            for c in contrib_cols:
                row_dict[c] = round(float(row[c]), 2)
                
            all_results.append(row_dict)
            
        print(f"[PASS] Profile {prof}: passed all sanity checks. Top material: {top_df.iloc[0]['formula']} ({top_df.iloc[0]['material_id']}) - Score {top_df.iloc[0]['recommendation_score']:.2f}")

    # Build final DataFrame
    df_results = pd.DataFrame(all_results)
    
    # Save to data/processed/recommendation_test_results.csv
    out_csv = os.path.join(project_root, 'data', 'processed', 'recommendation_test_results.csv')
    df_results.to_csv(out_csv, index=False)
    print(f"\nSaved test results to: {out_csv} ({len(df_results)} rows)")
    
    return df_results

if __name__ == '__main__':
    run_tests()
