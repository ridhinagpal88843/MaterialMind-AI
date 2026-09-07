# MaterialMind-ECE — Phase 2 Preprocessing Report

**Project:** MaterialMind-ECE — AI-Based Clustering and Intelligent Selection of Electronic Materials  
**Curriculum Scope:** Unit 2: Data and Preprocessing | Project 7: Material Clustering  
**Dataset:** Materials Project Inorganic Dielectric & Electronic Benchmark (Petousis et al., Nature Sci. Data)  
**Execution Timestamp:** 2026-09-04  
**Status:** Completed & Validated  

---

## 1. Executive Summary

Phase 2 establishes the data preprocessing, cleaning, defensive imputation, outlier auditing, and standardization pipeline for **MaterialMind-ECE**. 

The pipeline ingests the staged benchmark dataset of **1,056 real inorganic materials** and prepares an engineered numerical feature matrix for downstream unsupervised learning (K-Means clustering and PCA in subsequent phases).

### Core Pipeline Metrics
| Metric | Specification | Observed Value | Status |
|---|---|---|---|
| **Raw Materials Ingested** | 1,056 rows | 1,056 rows | Verified |
| **Processed Materials Retained** | 100% retention policy | 1,056 rows | 100% Retained |
| **Missing Values in Staged Data** | 0 missing values | 0 missing values | Clean |
| **Defensive Median Imputation** | Pre-fitted for inference pipeline | Armed (`SimpleImputer`) | Complete |
| **Duplicate `material_id` Count** | 0 duplicates | 0 duplicates | Verified Unique |
| **Clustering Features Selected** | 7 numerical physical/electronic descriptors | 7 features | Confirmed |
| **Outlier Detection Method** | $1.5 \times \text{IQR}$ rule | 406 detections (226 unique materials) | Reported & Retained |
| **Feature Scaling** | Zero-mean, unit-variance | Mean $\approx 0.0$, Std $= 1.0$ | Verified |
| **Saved Model Artifact** | `models/scaler.joblib` | 1,055 bytes | Exported & Tested |
| **Processed Feature Matrix** | $(N, D) = (1056, 7)$ | $1056 \times 7$ float64 | Staged |

---

## 2. Dataset Integrity Audit

The raw benchmark dataset (`data/raw/materials_dielectric_electronic.csv`) was subjected to structural and type integrity audits:

1. **Row & Column Dimensions:** Exactly 1,056 rows and 17 columns representing diverse inorganic crystal chemistries across all 7 crystal systems (cubic, tetragonal, orthorhombic, hexagonal, trigonal, monoclinic, triclinic).
2. **Missing Value Audit:** An exhaustive null check across all 17 attributes revealed **0 null, NaN, or infinite values**. 
3. **Primary Key Integrity:** The Materials Project identifier (`material_id`, e.g., `mp-441`, `mp-22881`) was verified for uniqueness across all 1,056 entries. **Duplicate count: 0**.

---

## 3. Defensive MedianImputer Pipeline

Although the benchmark dataset contains zero missing values, robust machine learning architecture demands defensive programming against real-world degradation. During inference (e.g., in the Phase 8 FastAPI web interface or Phase 7 material recommendation engine), external queries or novel experimental entries may possess missing fields.

- **Imputation Strategy:** Scikit-Learn's `SimpleImputer(strategy='median')` was fitted on the 7 numerical clustering features of the 1,056 materials.
- **Defensive Property:** The median is robust against skewed distributions and extreme values compared to the mean.
- **Integrity Guarantee:** A strict validation check (`np.allclose(df_raw[features].values, X_imputed)`) confirmed that **no existing values were modified or fabricated**. The imputer is serialized within the preprocessing design to arm downstream inference pipelines.

---

## 4. Selected Clustering Features (ECE Rationale)

In accordance with Phase 2 specifications, 7 fundamental physical, optical, dielectric, and structural features were selected for clustering electronic materials:

| Feature Name | Symbol / Equation | Physical & ECE Engineering Relevance |
|---|---|---|
| **`band_gap`** | $E_g$ (eV) | Fundamental electronic descriptor determining electrical conductivity regime: semiconductors ($0.1 \le E_g \le 3.0\text{ eV}$) vs wide-bandgap insulators ($E_g > 3.0\text{ eV}$) for power electronics (GaN, SiC, AlN). |
| **`poly_total`** | $\varepsilon_r$ (static permittivity) | Total dielectric constant governing capacitive energy storage, gate dielectric insulation (high-$\kappa$ vs low-$\kappa$), and charge screening in MOS capacitors. |
| **`poly_electronic`** | $\varepsilon_\infty$ (optical permittivity) | High-frequency optical response originating solely from electronic polarization; determines index of refraction ($n \approx \sqrt{\varepsilon_\infty}$) and optical dispersion. |
| **`poly_ionic`** | $\varepsilon_{\text{ionic}} = \varepsilon_r - \varepsilon_\infty$ | Lattice/phonon polarization contribution; quantifies soft-mode vibrational polarizability critical for identifying ferroelectrics and piezoelectric transducers. |
| **`n`** | $n$ (refractive index) | Optical refractive index governing light propagation speed, photonic confinement, anti-reflective coatings, and optical waveguides. |
| **`density`** | $\rho$ ($\text{g/cm}^3$) | Mass density derived from crystallographic unit cell mass and volume; crucial for weight-sensitive aerospace/satellite electronics and acoustic impedance matching. |
| **`volume`** | $V$ ($\text{\AA}^3$) | Unit cell volume reflecting crystal packing density, atomic radii, and structural complexity. |

---

## 5. IQR Outlier Analysis & Scientific Retention Policy

### 5.1 Methodology
Outlier detection was performed using the standard non-parametric **Interquartile Range (IQR)** rule:
$$\text{IQR} = Q_3 - Q_1$$
$$\text{Lower Threshold} = Q_1 - 1.5 \times \text{IQR}$$
$$\text{Upper Threshold} = Q_3 + 1.5 \times \text{IQR}$$

### 5.2 Outlier Distribution Summary
| Feature | Min | $Q_1$ (25%) | Median | $Q_3$ (75%) | Max | IQR | Lower Bound | Upper Bound | Outliers Flagged | Outlier % |
|---|---|---|---|---|---|---|---|---|---|---|
| **`band_gap`** | 0.110 | 0.890 | 1.730 | 2.885 | 8.320 | 1.995 | -2.102 | 5.878 | 35 | 3.31% |
| **`poly_total`** | 2.080 | 7.558 | 10.540 | 15.482 | 277.780 | 7.925 | -4.330 | 27.370 | 82 | 7.77% |
| **`poly_electronic`** | 1.630 | 3.130 | 4.790 | 7.440 | 256.840 | 4.310 | -3.335 | 13.905 | 85 | 8.05% |
| **`poly_ionic`** | 0.000 | 3.215 | 4.930 | 7.920 | 248.590 | 4.705 | -3.842 | 14.978 | 83 | 7.86% |
| **`n`** | 1.280 | 1.770 | 2.190 | 2.730 | 16.030 | 0.960 | 0.330 | 4.170 | 55 | 5.21% |
| **`density`** | 0.747 | 3.034 | 3.930 | 5.136 | 11.451 | 2.102 | -0.119 | 8.288 | 29 | 2.75% |
| **`volume`** | 13.981 | 96.262 | 145.945 | 212.106 | 597.341 | 115.844 | -77.504 | 385.873 | 37 | 3.50% |

- **Total Feature-Level Outliers Detected:** 406 instances
- **Unique Materials Flagged with $\ge 1$ Outlier:** 226 materials (21.40% of the dataset)
- **Detailed Outlier Log:** Saved in `data/processed/outlier_report.csv` with 406 itemized rows detailing material ID, formula, feature, value, threshold, and scientific context.

### 5.3 Scientific Retention Rationale (Why Outliers Are NOT Deleted)
In standard data cleaning, statistical outliers are frequently discarded as presumed sensor noise or measurement errors. **In material physics, this practice is scientifically invalid**:

1. **High-$\kappa$ Dielectrics ($\varepsilon_r > 27.37$):** Materials such as $\text{BaTiO}_3$, $\text{SrTiO}_3$, and $\text{PbTiO}_3$ possess colossal dielectric constants up to 277.78 due to soft phonon vibrational modes. Deleting these would discard the most technologically valuable dielectric capacitor materials.
2. **Ultra-Wide Bandgap Insulators ($E_g > 5.88\text{ eV}$):** Compounds such as $\text{BeF}_2$ ($E_g = 8.32\text{ eV}$), $\text{AlF}_3$ ($E_g = 7.60\text{ eV}$), and $\text{BeO}$ ($E_g = 6.85\text{ eV}$) represent deep-UV transparent windows and high-breakdown gate insulators.
3. **Heavy Dense Elements ($\rho > 8.29\text{ g/cm}^3$):** Materials containing heavy p-block or d-block elements (Bi, Pb, Tl, Ta, W) naturally have densities up to $11.45\text{ g/cm}^3$.
4. **Physical Law Compliance (Moss's Rule):** The materials with extreme refractive index ($n > 4.17$) and extreme $\varepsilon_\infty$ possess narrow band gaps, obeying Moss's empirical law ($n^4 \cdot E_g \approx \text{constant}$). They represent real narrow-gap infrared semiconductors.

**Conclusion:** All 1,056 materials are **100% retained** for downstream clustering.

---

## 6. Feature Standardization (StandardScaler)

Because clustering algorithms rely on geometric distance calculations (such as Euclidean distance $d(u,v) = \sqrt{\sum (u_i - v_i)^2}$), raw variables with large numerical magnitudes (e.g., volume up to 597 $\text{\AA}^3$ or dielectric constant up to 277) would disproportionately overpower variables with smaller ranges (e.g., band gap 0.1–8.3 eV or refractive index 1.2–16.0).

To place all physical dimensions on an egalitarian geometric scale, `StandardScaler` was fitted and applied:
$$z = \frac{x - \mu}{\sigma}$$

### Scaler Parameters Exported to `models/scaler.joblib`:
| Feature | Fitted Mean ($\mu$) | Fitted Scale ($\sigma$) |
|---|---|---|
| `band_gap` | 2.1194 eV | 1.6042 eV |
| `poly_total` | 14.7779 | 19.4261 |
| `poly_electronic` | 7.2480 | 13.0488 |
| `poly_ionic` | 7.5298 | 12.8855 |
| `n` | 2.4349 | 1.1483 |
| `density` | 4.1868 $\text{g/cm}^3$ | 1.6685 $\text{g/cm}^3$ |
| `volume` | 166.4204 $\text{\AA}^3$ | 97.3789 $\text{\AA}^3$ |

**Post-Scaling Verification:**
- Scaled feature means: $[0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000]$
- Scaled feature standard deviations: $[1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000, 1.0000]$

---

## 7. Generated Visualizations

All preprocessing plots have been rendered at 300 DPI and stored inside `outputs/plots/`:

1. **`01_feature_distributions_raw.png`**: Multi-panel histograms with KDE curves, showing raw empirical distributions, medians, and $1.5 \times \text{IQR}$ upper thresholds.
2. **`02_feature_boxplots_iqr.png`**: Standard box-and-whisker plots depicting quartiles, whiskers, and individual extreme material data points.
3. **`03_feature_distributions_scaled.png`**: Post-standardization distribution profiles confirming zero centering ($\mu = 0$) and unit spread ($\sigma = 1$).
4. **`04_feature_correlation_matrix.png`**: Pearson correlation heatmap showing strong physical couplings (e.g., $r = +0.89$ between `poly_total` and `poly_ionic`, $r = -0.56$ between `band_gap` and `poly_electronic`).
5. **`05_moss_rule_bandgap_vs_index.png`**: Scatter plot illustrating Moss's Rule / Penn Model inverse relationship between refractive index $n$ and band gap $E_g$.
6. **`06_outlier_percentages.png`**: Horizontal bar chart comparing outlier frequencies across all 7 clustering features.

---

## 8. Artifacts Summary Checklist

- [x] **`models/scaler.joblib`**: Fitted `StandardScaler` artifact verified for deployment.
- [x] **`data/processed/outlier_report.csv`**: Full 406-row itemized outlier audit.
- [x] **`data/processed/preprocessing_report.md`**: This comprehensive academic documentation.
- [x] **`data/processed/materials_cleaned.csv`**: 1,056-row verified cleaned dataset with all 17 attributes.
- [x] **`data/processed/features_scaled.csv`**: Standardized $1056 \times 7$ feature matrix with identifiers.
- [x] **`notebooks/02_preprocessing.ipynb`**: End-to-end reproducible interactive preprocessing notebook.
- [x] **`outputs/plots/`**: 6 publication-ready diagnostic plots.
