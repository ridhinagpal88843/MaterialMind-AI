# MaterialMind-ECE — Phase 5 PCA & 3D Visualization Report

**Project:** MaterialMind-ECE — AI-Based Clustering and Intelligent Selection of Electronic Materials  
**Curriculum Scope:** Unit 3: Machine Learning / AI | Project 7: Material Clustering  
**Dataset:** Materials Project Inorganic Dielectric Benchmark (N = 1,056 materials)  
**Clustering Model:** K-Means ($K = 4$) from Phase 4  
**Feature Space:** 6 Standardized Engineered Descriptors  
**Execution Timestamp:** 2026-09-04  
**Status:** Completed & Validated  

---

## 1. Executive Summary

Phase 5 applies **Principal Component Analysis (PCA)** to the standardized 6-dimensional feature matrix of **1,056 real inorganic materials** (`data/processed/materials_clustered.csv`).

The primary goals of this phase are:
1. **Dimensionality Reduction & Projection:** Transform the 6 correlated physical descriptors into orthogonal, uncorrelated latent axes.
2. **Latent Space Interpretation:** Uncover the fundamental physical and crystallographic governing axes of electronic materials by inspecting the eigenvector loadings.
3. **Cluster Validation & Visualization:** Project the $K = 4$ K-Means clusters into 2D and interactive 3D coordinate spaces to verify geometric separation, cluster compactness, and physical coherence.
4. **Coordinate Export:** Save low-dimensional coordinates for downstream similarity searching and UI visualization.

---

## 2. Eigenvalues & Explained Variance Analysis

The full spectrum of eigenvalues and explained variance ratios across all 6 principal components:

| Principal Component | Eigenvalue ($\lambda_i$) | Explained Variance Ratio (%) | Cumulative Variance (%) | Physical Dominance |
|---|---|---|---|---|
| **PC1** | **2.227** | **37.08%** | **37.08%** | Optical Polarizability vs Bandgap (Penn Model Axis) |
| **PC2** | **1.261** | **21.00%** | **58.08%** | Lattice Ionicity vs Unit Cell Volume |
| **PC3** | **0.996** | **16.58%** | **74.66%** | Crystallographic Volume vs Mass Density |
| **PC4** | 0.840 | 13.99% | 88.65% | Residual Density-Polarization Coupling |
| **PC5** | 0.527 | 8.77% | 97.42% | Bandgap-Density Fine-Grained Trade-offs |
| **PC6** | 0.155 | 2.58% | 100.00% | Residual Permittivity Linear Subspace |

### Variance Sufficiency Assessment
- **Top 2 Components (2D Space):** Explain **58.08%** of total dataset variance.
- **Top 3 Components (3D Space):** Explain **74.66%** of total dataset variance.
- **Honest Scientific Evaluation:**
  - In materials informatics and solid-state data analysis, capturing **74.66% ($\approx 75\%$)** across 3 orthogonal dimensions out of 6 original physical dimensions is **a strong and sufficient representation**.
  - 3 out of every 4 units of total dataset variance are faithfully retained in the 3D projection, successfully capturing the primary physical trade-offs (electronic polarizability, ionic lattice mechanisms, and packing volume).
  - The remaining **25.34%** of variance is distributed across localized structural subtleties in PC4 ($13.99\%$) and PC5 ($8.77\%$). Consequently, while 3D PCA provides an excellent qualitative visualization of material clustering, downstream exact distance/similarity calculations in Phase 6 should utilize the full standardized 6D space.

---

## 3. Principal Component Loadings & Physical Interpretation

The eigenvector loadings matrix (weights of each normalized feature in each principal component):

| Feature Name | PC1 (37.08%) | PC2 (21.00%) | PC3 (16.58%) | PC4 (13.99%) | PC5 (8.77%) | PC6 (2.58%) |
|---|---|---|---|---|---|---|
| **`band_gap`** ($E_g$) | **-0.4401** | +0.3729 | +0.1815 | -0.3067 | +0.7313 | -0.0745 |
| **`poly_total`** ($\varepsilon_r$) | **+0.5210** | +0.3872 | +0.3710 | +0.0483 | -0.0231 | -0.6618 |
| **`poly_electronic`** ($\varepsilon_\infty$) | **+0.5667** | +0.1558 | +0.2801 | -0.3477 | +0.1140 | +0.6650 |
| **`ionic_polarization_fraction`** ($f_{\text{ionic}}$) | -0.2573 | **+0.6044** | +0.2293 | +0.5913 | -0.2382 | +0.3311 |
| **`density`** ($\rho$) | +0.3840 | +0.0763 | **-0.5545** | +0.4927 | +0.5419 | +0.0531 |
| **`volume`** ($V$) | -0.0004 | **-0.5618** | **+0.6252** | +0.4363 | +0.3183 | +0.0422 |

### Rigorous Physical Analysis of Components:

#### **Principal Component 1 (37.08%): Optical Polarizability vs Electronic Bandgap (Penn Model Axis)**
- **Dominant Positive Loadings:** `poly_electronic` (+0.5667), `poly_total` (+0.5210), `density` (+0.3840).
- **Dominant Negative Loading:** `band_gap` (-0.4401).
- **Insignificant Loading:** `volume` (-0.0004).
- **Physical Meaning:**
  PC1 directly reproduces the fundamental quantum-mechanical inverse relationship in electronic materials: **Moss's Rule and the Penn Model**:
  $$\varepsilon_\infty \approx 1 + \left(\frac{\hbar \omega_p}{E_g}\right)^2$$
  - Materials with **high positive PC1**: Possess narrow band gaps, high electronic cloud polarizability ($\varepsilon_\infty$), heavy atomic density, and large static dielectric constants (infrared semiconductors, semi-metals, and heavy metal compounds).
  - Materials with **high negative PC1**: Possess wide band gaps, low electronic polarizability, and lower density (wide-gap optical insulators, fluorides, and oxides).

#### **Principal Component 2 (21.00%): Lattice Ionicity vs Unit Cell Volume**
- **Dominant Positive Loadings:** `ionic_polarization_fraction` (+0.6044), `poly_total` (+0.3872), `band_gap` (+0.3729).
- **Dominant Negative Loading:** `volume` (-0.5618).
- **Physical Meaning:**
  PC2 establishes an axis separating **compact, highly ionic polar dielectrics** from **open-framework, large-volume covalent crystals**:
  - Materials with **high positive PC2**: Strongly ionic crystals where soft optical phonon modes dominate the dielectric response ($f_{\text{ionic}} > 0.60$), with compact unit cells and wide band gaps (e.g. alkali halides, perovskite oxides).
  - Materials with **high negative PC2**: Open-framework, large unit cell crystals ($V > 250\text{ \AA}^3$) with low ionicity and lower static dielectric constants (e.g. molecular-like or layered chalcogenides like $\text{SiSe}_2$, $\text{BI}_3$).

#### **Principal Component 3 (16.58%): Crystallographic Volume vs Gravimetric Mass Density**
- **Dominant Positive Loading:** `volume` (+0.6252), `poly_total` (+0.3710).
- **Dominant Negative Loading:** `density` (-0.5545).
- **Physical Meaning:**
  PC3 represents the **crystallographic packing and mass density trade-off**:
  - Positive PC3: Large unit cell volume with lower mass density (dilute, open lattice structures).
  - Negative PC3: Highly dense, tightly packed crystal structures composed of heavy elements (e.g. Bi, Pb, Hg, Pt, Au compounds with $\rho > 7\text{ g/cm}^3$).

---

## 4. Latent Space Cluster Geometry

Projecting the 1,056 materials and the K-Means cluster centroids into the PC1–PC2–PC3 subspace validates the natural structure discovered in Phase 4:

```
                  PC2 (Ionicity vs Volume)
                           ▲
                           │        [Cluster 2]
                           │   Wide-Gap / Ionic Dielectrics
                           │   (Rb2Te, CdCl2, MnF2)
                           │   (Eg ~ 3.5 eV, f_ionic ~ 0.61)
                           │
       ────────────────────┼─────────────────────────► PC1 (Polarizability vs Bandgap)
       [Cluster 1]         │         [Cluster 0]        [Cluster 3]
  Large Cell Frameworks   │    Dense Semiconductors   Colossal Permittivity
   (SiSe2, SiS2, BI3)      │     (MnI2, LaN, SnSe)      (FeSi, CoSb3, SrAgP)
   (Vol ~ 296 Å³)          │     (Eg ~ 1.1 eV, ρ ~ 5.4) (εr > 100, Eg < 0.3)
                           │
```

1. **Cluster 2 (Wide-Gap / Ionic Dielectrics, N=388):** Occupies the upper-left quadrant (negative PC1, positive PC2). Characterized by wide bandgap and high lattice ionicity.
2. **Cluster 1 (Large-Volume / Open Frameworks, N=248):** Occupies the lower-left quadrant (negative PC1, negative PC2). Characterized by massive unit cell volume and lower dielectric response.
3. **Cluster 0 (Dense Semiconductors, N=412):** Occupies the center and moderate positive PC1 region. Characterized by moderate bandgap ($\sim 1.1\text{ eV}$), high density, and balanced polarization.
4. **Cluster 3 (Colossal Permittivity Group, N=8):** Completely isolated at extreme positive PC1 ($PC1 \in [+4.5, +13.5]$). This visually proves that Cluster 3 is a genuine physical outlier group separated by colossal electronic/static permittivity and ultra-narrow bandgap.

---

## 5. Artifacts Created & Exported

- **[data/processed/pca_coordinates.csv](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/pca_coordinates.csv)**: Full 1,056-row dataset with `material_id`, `formula`, `cluster`, and all 6 principal component coordinates (`PC1` through `PC6`).
- **[outputs/plots/pca_2d.png](file:///c:/Users/HP/Desktop/PROJECT-7/outputs/plots/pca_2d.png)**: High-resolution (300 DPI) 2D scatter plot of PC1 vs PC2 showing cluster distributions, centroids, annotations, and axis explained variance.
- **[outputs/plots/pca_3d.html](file:///c:/Users/HP/Desktop/PROJECT-7/outputs/plots/pca_3d.html)**: Interactive 3D Plotly visualization:
  - All 1,056 materials plotted in 3D coordinate space ($PC1, PC2, PC3$).
  - Color-coded by K-Means cluster.
  - Hover tooltips displaying `material_id`, `formula`, `cluster`, $E_g$, $\varepsilon_{\text{total}}$, $\varepsilon_{\text{elec}}$, $f_{\text{ionic}}$, $\rho$, $V$, and PC coordinates.
  - Fully supports interactive 3D rotation, zooming, panning, and cluster filtering.
- **[notebooks/05_pca_visualization.ipynb](file:///c:/Users/HP/Desktop/PROJECT-7/notebooks/05_pca_visualization.ipynb)**: Complete reproducible interactive Jupyter notebook.
