"""
MaterialMind-ECE — Reusable ECE Material Recommendation Engine
Transparent, physics-grounded heuristic screening across 4 ECE application profiles:
1. POWER_ELECTRONICS
2. DIELECTRIC_CAPACITIVE
3. RF_HIGH_FREQUENCY
4. OPTOELECTRONIC

DISCLAIMER:
HEURISTIC ECE SCREENING — NOT EXPERIMENTAL VALIDATION.
This engine screens materials using available DFT physical features. It does not predict
unmeasured device properties such as breakdown voltage, loss tangent, mobility, or lifetime.
"""

import os
import sys
from pathlib import Path

# Add project root to sys.path to enable backend package imports
project_root = str(Path(__file__).resolve().parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

import numpy as np
import pandas as pd
from backend.similarity import MaterialSimilarityEngine

DISCLAIMER_TEXT = "HEURISTIC ECE SCREENING — NOT EXPERIMENTAL VALIDATION."

class MaterialRecommendationEngine:
    def __init__(self, data_path="data/processed/materials_clustered.csv"):
        """
        Initialize the recommendation engine with clustered materials dataset.
        """
        if not os.path.exists(data_path):
            alt_data = os.path.join("..", data_path)
            if os.path.exists(alt_data):
                data_path = alt_data
            else:
                raise FileNotFoundError(f"Dataset not found at: {data_path}")

        self.data_path = data_path
        self.df = pd.read_csv(self.data_path)
        
        # Ensure 6 physical features are present
        self.features = [
            'band_gap',
            'poly_total',
            'poly_electronic',
            'ionic_polarization_fraction',
            'density',
            'volume'
        ]
        for feat in self.features:
            if feat not in self.df.columns:
                raise ValueError(f"Required feature '{feat}' missing from dataset.")

        # Precompute min/max bounds for transparent normalization
        self.bounds = {
            feat: (float(self.df[feat].min()), float(self.df[feat].max()))
            for feat in self.features
        }
        
        # Optional similarity engine instance for contextual neighborhood lookup
        try:
            self.similarity_engine = MaterialSimilarityEngine(data_path=self.data_path)
        except Exception:
            self.similarity_engine = None

        # Profile definitions with documented weights and rationale
        self.profile_configs = {
            'POWER_ELECTRONICS': {
                'name': 'Power Electronics',
                'description': 'Screens materials for power switching and high-voltage substrates. Higher band gap is used as an electronic robustness screening criterion. It is not a prediction of breakdown voltage or critical breakdown field.',
                'weights': {
                    'higher_band_gap': 50.0,
                    'moderate_dielectric_constant': 30.0,
                    'suitable_density': 20.0
                },
                'rationales': {
                    'higher_band_gap': 'Higher band gap is used as an electronic robustness screening criterion (50 pts). It is not a prediction of breakdown voltage or critical breakdown field.',
                    'moderate_dielectric_constant': 'Moderate permittivity screening around eps_r ~ 10 (30 pts). Prevents extreme field concentration without introducing excessive capacitive parasitics.',
                    'suitable_density': 'Structural density screening around rho ~ 4.5 g/cm3 (20 pts). Filters out extremely porous or heavy actinide matrices.'
                }
            },
            'DIELECTRIC_CAPACITIVE': {
                'name': 'Dielectric / Capacitive Energy Storage',
                'description': 'Screens materials for high capacitive energy density based on high static dielectric permittivity, dominant lattice ionic polarizability, and solid ceramic density.',
                'weights': {
                    'high_permittivity': 45.0,
                    'high_ionic_polarization': 35.0,
                    'solid_density': 20.0
                },
                'rationales': {
                    'high_permittivity': 'Log-scaled total permittivity screening (45 pts). Prioritizes large static dielectric constant (poly_total) across orders of magnitude.',
                    'high_ionic_polarization': 'High ionic polarization fraction screening (35 pts). Captures low-frequency soft-mode lattice polarization crucial for electrostatic charge storage.',
                    'solid_density': 'Solid ceramic density screening (20 pts). Prefers dense, void-free crystal structures for high volumetric packaging density.'
                }
            },
            'RF_HIGH_FREQUENCY': {
                'name': 'RF & High-Frequency Electronics',
                'description': 'Screens materials for RF substrates and antenna packages. A higher band gap is used as a heuristic insulating-character screening criterion. The model does not predict RF leakage, dielectric loss, or high-frequency device performance.',
                'weights': {
                    'moderate_permittivity': 35.0,
                    'electronic_polarization_dominance': 35.0,
                    'insulating_band_gap': 30.0
                },
                'rationales': {
                    'moderate_permittivity': 'Heuristic permittivity screening around eps_r ~ 5.5 (35 pts). Favors low-to-moderate dielectric response relevant to RF substrate propagation.',
                    'electronic_polarization_dominance': 'Dominant electronic polarization fraction (1 - f_ionic) (35 pts). Favors materials where fast optical response dominates over dispersive ionic modes.',
                    'insulating_band_gap': 'A higher band gap is used as a heuristic insulating-character screening criterion (30 pts). The model does not predict RF leakage, dielectric loss, or high-frequency device performance.'
                }
            },
            'OPTOELECTRONIC': {
                'name': 'Optoelectronics & Photonics',
                'description': 'Screens materials for photonic, optical detector, and solar applications using a band-gap compatibility screening criterion (1.0–3.0 eV), strong optical dielectric response (poly_electronic), and crystalline density.',
                'weights': {
                    'band_gap_compatibility': 40.0,
                    'strong_optical_permittivity': 40.0,
                    'structural_density': 20.0
                },
                'rationales': {
                    'band_gap_compatibility': 'Band-gap compatibility screening criterion targeted around Eg ~ 1.8 eV (40 pts). Selects materials with gaps matching visible/near-IR optoelectronic spectra.',
                    'strong_optical_permittivity': 'Log-scaled electronic dielectric constant (poly_electronic = n^2) (40 pts). Favors materials with high optical polarizability and refractive index for light confinement.',
                    'structural_density': 'Solid crystalline density screening around rho ~ 5.5 g/cm3 (20 pts). Favors high-quality crystalline solids.'
                }
            }
        }

    def get_profiles(self):
        """Return metadata for all available application profiles."""
        return self.profile_configs

    def compute_scores(self, profile_name):
        """
        Compute transparent recommendation scores and feature attribution points
        for all materials in the database for the given application profile.
        """
        profile_key = profile_name.upper()
        if profile_key not in self.profile_configs:
            valid_keys = list(self.profile_configs.keys())
            raise ValueError(f"Unknown profile '{profile_name}'. Must be one of: {valid_keys}")

        df = self.df.copy()
        
        if profile_key == 'POWER_ELECTRONICS':
            # Sub-scores in [0, 1]
            # 1. Higher band gap (min-max)
            bg_min, bg_max = self.bounds['band_gap']
            s_bg = (df['band_gap'] - bg_min) / (bg_max - bg_min)
            
            # 2. Moderate dielectric constant: target 10.0, sigma=8.0
            s_eps = np.exp(-0.5 * ((df['poly_total'] - 10.0) / 8.0) ** 2)
            
            # 3. Suitable density: target 4.5 g/cm3, sigma=1.5
            s_rho = np.exp(-0.5 * ((df['density'] - 4.5) / 1.5) ** 2)
            
            c_bg = 50.0 * s_bg
            c_eps = 30.0 * s_eps
            c_rho = 20.0 * s_rho
            total_score = c_bg + c_eps + c_rho
            
            contributions = pd.DataFrame({
                'contrib_higher_band_gap': c_bg,
                'contrib_moderate_dielectric_constant': c_eps,
                'contrib_suitable_density': c_rho
            })
            
            def make_explanation(row):
                return (f"Electronic robustness screening Eg={row['band_gap']:.2f} eV ({row['contrib_higher_band_gap']:.1f}/50 pts, not breakdown prediction), "
                        f"moderate dielectric constant eps_r={row['poly_total']:.2f} ({row['contrib_moderate_dielectric_constant']:.1f}/30 pts), "
                        f"and solid packaging density rho={row['density']:.2f} g/cm3 ({row['contrib_suitable_density']:.1f}/20 pts).")

        elif profile_key == 'DIELECTRIC_CAPACITIVE':
            # 1. High permittivity: log-scaled
            eps_min, eps_max = self.bounds['poly_total']
            s_eps = (np.log(df['poly_total']) - np.log(eps_min)) / (np.log(eps_max) - np.log(eps_min))
            
            # 2. High ionic polarization fraction
            ion_min, ion_max = self.bounds['ionic_polarization_fraction']
            s_ion = (df['ionic_polarization_fraction'] - ion_min) / (ion_max - ion_min)
            
            # 3. Solid density
            rho_min, rho_max = self.bounds['density']
            s_rho = (df['density'] - rho_min) / (rho_max - rho_min)
            
            c_eps = 45.0 * s_eps
            c_ion = 35.0 * s_ion
            c_rho = 20.0 * s_rho
            total_score = c_eps + c_ion + c_rho
            
            contributions = pd.DataFrame({
                'contrib_high_permittivity': c_eps,
                'contrib_high_ionic_polarization': c_ion,
                'contrib_solid_density': c_rho
            })
            
            def make_explanation(row):
                return (f"High dielectric constant eps_r={row['poly_total']:.2f} ({row['contrib_high_permittivity']:.1f}/45 pts), "
                        f"prominent lattice ionicity f_ionic={row['ionic_polarization_fraction']:.3f} ({row['contrib_high_ionic_polarization']:.1f}/35 pts), "
                        f"and compact ceramic density rho={row['density']:.2f} g/cm3 ({row['contrib_solid_density']:.1f}/20 pts).")

        elif profile_key == 'RF_HIGH_FREQUENCY':
            # 1. Low-to-moderate permittivity: target 5.5, sigma=3.0
            s_eps = np.exp(-0.5 * ((df['poly_total'] - 5.5) / 3.0) ** 2)
            
            # 2. Dominant electronic response: f_elec = 1.0 - ionic_fraction
            f_elec = 1.0 - df['ionic_polarization_fraction']
            f_elec_min, f_elec_max = f_elec.min(), f_elec.max()
            s_elec = (f_elec - f_elec_min) / (f_elec_max - f_elec_min)
            
            # 3. Insulating band gap
            bg_min, bg_max = self.bounds['band_gap']
            s_bg = (df['band_gap'] - bg_min) / (bg_max - bg_min)
            
            c_eps = 35.0 * s_eps
            c_elec = 35.0 * s_elec
            c_bg = 30.0 * s_bg
            total_score = c_eps + c_elec + c_bg
            
            contributions = pd.DataFrame({
                'contrib_moderate_permittivity': c_eps,
                'contrib_electronic_polarization_dominance': c_elec,
                'contrib_insulating_band_gap': c_bg
            })
            
            def make_explanation(row):
                return (f"Moderate permittivity eps_r={row['poly_total']:.2f} ({row['contrib_moderate_permittivity']:.1f}/35 pts), "
                        f"electronic optical polarizability dominance f_elec={(1.0 - row['ionic_polarization_fraction']):.3f} ({row['contrib_electronic_polarization_dominance']:.1f}/35 pts), "
                        f"and heuristic insulating-character screening Eg={row['band_gap']:.2f} eV ({row['contrib_insulating_band_gap']:.1f}/30 pts).")

        elif profile_key == 'OPTOELECTRONIC':
            # 1. Band gap compatibility: target 1.8 eV, sigma=0.8 eV
            s_bg = np.exp(-0.5 * ((df['band_gap'] - 1.8) / 0.8) ** 2)
            
            # 2. High optical/electronic permittivity: log-scaled poly_electronic
            pe_min, pe_max = self.bounds['poly_electronic']
            s_pe = (np.log(df['poly_electronic']) - np.log(pe_min)) / (np.log(pe_max) - np.log(pe_min))
            
            # 3. Structural density: target 5.5, sigma=2.0
            s_rho = np.exp(-0.5 * ((df['density'] - 5.5) / 2.0) ** 2)
            
            c_bg = 40.0 * s_bg
            c_pe = 40.0 * s_pe
            c_rho = 20.0 * s_rho
            total_score = c_bg + c_pe + c_rho
            
            contributions = pd.DataFrame({
                'contrib_band_gap_compatibility': c_bg,
                'contrib_strong_optical_permittivity': c_pe,
                'contrib_structural_density': c_rho
            })
            
            def make_explanation(row):
                return (f"Band-gap compatibility Eg={row['band_gap']:.2f} eV in optoelectronic window ({row['contrib_band_gap_compatibility']:.1f}/40 pts), "
                        f"high optical permittivity eps_inf={row['poly_electronic']:.2f} ({row['contrib_strong_optical_permittivity']:.1f}/40 pts), "
                        f"and suitable crystal density rho={row['density']:.2f} g/cm3 ({row['contrib_structural_density']:.1f}/20 pts).")

        # Clamp total score strictly in [0, 100]
        total_score = np.clip(total_score, 0.0, 100.0)
        df['recommendation_score'] = total_score
        
        # Combine contributions
        for col in contributions.columns:
            df[col] = contributions[col]
            
        df['explanation'] = df.apply(make_explanation, axis=1)
        df['disclaimer'] = DISCLAIMER_TEXT
        
        # Sort descending by score, breaking ties by band_gap or material_id deterministically
        df = df.sort_values(by=['recommendation_score', 'band_gap', 'material_id'], ascending=[False, False, True]).reset_index(drop=True)
        df['rank'] = df.index + 1
        
        return df

    def recommend(self, profile_name, top_n=5, include_similarity=True):
        """
        Return Top-N material recommendations for a given application profile.
        
        Returns:
        --------
        dict containing:
            - 'profile_key': str
            - 'profile_info': dict with profile metadata
            - 'disclaimer': scientific disclaimer text
            - 'top_materials': pd.DataFrame with Top-N materials and feature contributions
            - 'cluster_distribution': dict counting recommendations per cluster
            - 'nearest_neighbors': dict mapping material_id to its closest physical neighbor
        """
        profile_key = profile_name.upper()
        df_ranked = self.compute_scores(profile_key)
        top_df = df_ranked.head(top_n).copy()
        
        # Cluster distribution of recommendations
        cluster_dist = top_df['cluster'].value_counts().to_dict()
        
        # Optional nearest neighbors
        nearest_neighbors = {}
        if include_similarity and self.similarity_engine is not None:
            for _, row in top_df.iterrows():
                mid = row['material_id']
                try:
                    sim_res = self.similarity_engine.find_similar(mid, top_n=1)
                    if len(sim_res['neighbors']) > 0:
                        closest = sim_res['neighbors'].iloc[0]
                        nearest_neighbors[mid] = {
                            'neighbor_id': closest['material_id'],
                            'neighbor_formula': closest['formula'],
                            'neighbor_cluster': int(closest['cluster']),
                            'euclidean_distance': float(closest['euclidean_distance']),
                            'similarity_score': float(closest['similarity_score'])
                        }
                except Exception:
                    pass

        return {
            'profile_key': profile_key,
            'profile_info': self.profile_configs[profile_key],
            'disclaimer': DISCLAIMER_TEXT,
            'top_materials': top_df,
            'cluster_distribution': cluster_dist,
            'nearest_neighbors': nearest_neighbors
        }

if __name__ == '__main__':
    engine = MaterialRecommendationEngine()
    print("Testing MaterialRecommendationEngine across all 4 profiles:")
    for prof in ['POWER_ELECTRONICS', 'DIELECTRIC_CAPACITIVE', 'RF_HIGH_FREQUENCY', 'OPTOELECTRONIC']:
        res = engine.recommend(prof, top_n=5)
        print(f"\n==================== {prof} ====================")
        print(f"Disclaimer: {res['disclaimer']}")
        print(f"Cluster Distribution: {res['cluster_distribution']}")
        for _, row in res['top_materials'].iterrows():
            print(f"Rank {row['rank']}: {row['formula']} ({row['material_id']}) | Score: {row['recommendation_score']:.2f} | Cluster: {row['cluster']}")
            print(f"  Explanation: {row['explanation']}")
