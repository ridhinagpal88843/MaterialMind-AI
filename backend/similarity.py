"""
MaterialMind-ECE — Reusable Material Similarity Engine
Computes nearest-neighbor material similarity using Euclidean distance
in the standardized 6-feature physical descriptor space.
"""

import os
import joblib
import pandas as pd
import numpy as np

class MaterialSimilarityEngine:
    def __init__(self,
                 data_path="data/processed/materials_clustered.csv",
                 scaler_path="models/final_scaler.joblib"):
        """
        Initialize the similarity engine with preprocessed clustered data
        and the fitted StandardScaler.
        """
        if not os.path.exists(data_path):
            # Try alternate path relative to root
            alt_data = os.path.join("..", data_path)
            if os.path.exists(alt_data):
                data_path = alt_data
            else:
                raise FileNotFoundError(f"Dataset not found at: {data_path}")
                
        if not os.path.exists(scaler_path):
            alt_scaler = os.path.join("..", scaler_path)
            if os.path.exists(alt_scaler):
                scaler_path = alt_scaler
            else:
                raise FileNotFoundError(f"Scaler artifact not found at: {scaler_path}")
                
        self.data_path = data_path
        self.scaler_path = scaler_path
        self.features = [
            'band_gap',
            'poly_total',
            'poly_electronic',
            'ionic_polarization_fraction',
            'density',
            'volume'
        ]
        
        # Load dataset and scaler
        self.df = pd.read_csv(self.data_path)
        self.scaler = joblib.load(self.scaler_path)
        
        # Compute standardized matrix (N x 6)
        self.X_scaled = self.scaler.transform(self.df[self.features])
        
        # Precompute lookup index maps
        self.id_to_idx = {mid: i for i, mid in enumerate(self.df['material_id'])}
        
    def get_material_info(self, query):
        """Retrieve material row by material_id or formula."""
        if query in self.id_to_idx:
            idx = self.id_to_idx[query]
            return self.df.iloc[idx], idx
        
        # Try search by formula
        matches = self.df[self.df['formula'].str.lower() == query.lower()]
        if len(matches) > 0:
            idx = matches.index[0]
            return matches.iloc[0], idx
            
        raise ValueError(f"Material '{query}' not found in dataset of {len(self.df)} materials.")
        
    def find_similar(self, query, top_n=5):
        """
        Find top_n most similar materials to the query material.
        
        Parameters:
        -----------
        query : str
            material_id (e.g. 'mp-8062') or chemical formula (e.g. 'SiC').
        top_n : int, default=5
            Number of nearest neighbors to retrieve.
            
        Returns:
        --------
        dict containing:
            - 'query_material': dict with query material details
            - 'neighbors': pd.DataFrame of Top-N similar materials
            - 'same_cluster_count': int
            - 'same_cluster_percentage': float
        """
        query_row, query_idx = self.get_material_info(query)
        query_vec = self.X_scaled[query_idx]
        query_id = query_row['material_id']
        query_cluster = query_row['cluster']
        
        # Compute Euclidean distance in standardized 6D space: d = sqrt(sum((z_u - z_v)^2))
        diffs = self.X_scaled - query_vec
        dists = np.linalg.norm(diffs, axis=1)
        
        # Mask out the query material itself
        dists[query_idx] = np.inf
        
        # Get indices of top_n closest materials
        top_indices = np.argsort(dists)[:top_n]
        
        results = []
        for idx in top_indices:
            row = self.df.iloc[idx]
            dist = dists[idx]
            
            # Relative normalized similarity score: S = 1 / (1 + d)
            # strictly bounded in (0, 1] where d=0 -> S=1.0
            similarity_score = 1.0 / (1.0 + dist)
            same_cluster = (row['cluster'] == query_cluster)
            
            res_dict = {
                'material_id': row['material_id'],
                'formula': row['formula'],
                'cluster': int(row['cluster']),
                'same_cluster': bool(same_cluster),
                'euclidean_distance': round(float(dist), 4),
                'similarity_score': round(float(similarity_score), 4),
                'similarity_pct': round(float(similarity_score) * 100, 2),
                'band_gap': round(float(row['band_gap']), 3),
                'poly_total': round(float(row['poly_total']), 3),
                'poly_electronic': round(float(row['poly_electronic']), 3),
                'ionic_polarization_fraction': round(float(row['ionic_polarization_fraction']), 4),
                'density': round(float(row['density']), 3),
                'volume': round(float(row['volume']), 2)
            }
            results.append(res_dict)
            
        df_results = pd.DataFrame(results)
        same_cluster_count = int(df_results['same_cluster'].sum())
        same_cluster_pct = round((same_cluster_count / top_n) * 100, 2)
        
        return {
            'query_material': {
                'material_id': query_row['material_id'],
                'formula': query_row['formula'],
                'cluster': int(query_cluster),
                'band_gap': round(float(query_row['band_gap']), 3),
                'poly_total': round(float(query_row['poly_total']), 3),
                'poly_electronic': round(float(query_row['poly_electronic']), 3),
                'ionic_polarization_fraction': round(float(query_row['ionic_polarization_fraction']), 4),
                'density': round(float(query_row['density']), 3),
                'volume': round(float(query_row['volume']), 2)
            },
            'neighbors': df_results,
            'same_cluster_count': same_cluster_count,
            'same_cluster_percentage': same_cluster_pct
        }

if __name__ == '__main__':
    engine = MaterialSimilarityEngine()
    print(f"Similarity Engine initialized with {len(engine.df)} materials.")
    res = engine.find_similar('mp-8062', top_n=5)
    print(f"\nQuery: {res['query_material']['formula']} ({res['query_material']['material_id']}) - Cluster {res['query_material']['cluster']}")
    print(res['neighbors'][['material_id', 'formula', 'cluster', 'euclidean_distance', 'similarity_score', 'same_cluster']])
