# MaterialMind-ECE — Phase 6 Material Similarity Engine Report

**Project:** MaterialMind-ECE — AI-Based Clustering and Intelligent Selection of Electronic Materials  
**Curriculum Scope:** Unit 3: Machine Learning / AI | Project 7: Material Clustering  
**Dataset:** Materials Project Inorganic Dielectric Benchmark (N = 1,056 materials)  
**Feature Space:** 6 Standardized Descriptors via `models/final_scaler.joblib`  
**Execution Timestamp:** 2026-09-04  
**Status:** Completed & Validated  

---

## 1. Executive Summary

Phase 6 implements the **Nearest-Neighbor Material Similarity Engine** for **MaterialMind-ECE**. 

Given any query material (by `material_id` or `formula`), the engine identifies the Top-$K$ closest materials in the finalized 6-dimensional standardized physical descriptor space:
$$\mathbf{z} = [z_{E_g}, z_{\varepsilon_r}, z_{\varepsilon_\infty}, z_{f_{\text{ionic}}}, z_\rho, z_V]$$

The engine is encapsulated in the production-ready module [backend/similarity.py](file:///c:/Users/HP/Desktop/PROJECT-7/backend/similarity.py). Validation was performed across 5 representative materials spanning all 4 K-Means clusters, achieving an overall **88.0% Top-5 same-cluster neighbor coherence**.

---

## 2. Mathematical Methodology & Metric Formulation

### 2.1 Distance Metric: Standardized Euclidean Distance
Because physical features have disparate units and dynamic ranges (e.g. volume up to $597\text{ \AA}^3$ vs band gap $0.1 - 8.3\text{ eV}$), raw Euclidean distance would be dominated by cell volume. Every feature is first standardized using the fitted scaler parameters:
$$z_i = \frac{x_i - \mu_i}{\sigma_i}$$

The pairwise distance between a query material $u$ and candidate material $v$ is computed as the Euclidean metric ($L_2$ norm) in $\mathbb{R}^6$:
$$d(u, v) = \|\mathbf{z}_u - \mathbf{z}_v\|_2 = \sqrt{\sum_{i=1}^{6} \left(z_u^{(i)} - z_v^{(i)}\right)^2}$$

### 2.2 Normalized Similarity Score Formulation
To provide an intuitive, human-interpretable similarity measure where closer materials have higher scores:
$$S(u, v) = \frac{1}{1 + d(u, v)}$$
$$\text{Similarity Percentage} = S(u, v) \times 100\%$$

#### Mathematical Properties:
1. **Bounded:** Strictly bounded in the open interval $(0, 1.0]$.
2. **Identity of Indiscernibles:** If $d(u, v) = 0$ (identical physical coordinates), $S(u, v) = 1.0$ (100% similarity).
3. **Monotonicity:** As distance $d \to \infty$, $S \to 0$ monotonically.
4. **Scale Invariance:** Independent of arbitrary neighborhood sizes or candidate batch counts.

> **CRITICAL SCIENTIFIC DISCLAIMER**:  
> The similarity score $S(u, v)$ is a **relative geometric proximity metric**, **NOT a probability, likelihood, or posterior probability**. It does not sum to 1 across the database ($\sum_v S \neq 1$) and should never be interpreted as a probability distribution.

---

## 3. Benchmark Query Evaluation (5 Test Materials)

The similarity engine was tested against 5 diverse materials representing distinct electronic, optical, and structural classes:

### Test 1: $\text{SiC}$ (`mp-8062`) — Cluster 0 (Semiconductor / Power Electronics)
- **Query Properties:** $E_g = 1.37\text{ eV}$, $\varepsilon_r = 10.36$, $\varepsilon_\infty = 7.00$, $f_{\text{ionic}} = 0.324$, $\rho = 3.17\text{ g/cm}^3$, $V = 21.00\text{ \AA}^3$.
- **Same-Cluster Agreement:** **80.0%** (4 of 5 neighbors share Cluster 0).

| Rank | Material ID | Formula | Cluster | Distance ($d$) | Similarity Score ($S$) | $E_g$ (eV) | $\varepsilon_r$ | $f_{\text{ionic}}$ | $\rho$ ($\text{g/cm}^3$) | $V$ ($\text{\AA}^3$) | Same Cluster? |
|---|---|---|---|---|---|---|---|---|---|---|---|
| #1 | `mp-12558` | $\text{LiMgAs}$ | 0 | 0.5308 | 0.6533 (65.3%) | 1.37 | 12.97 | 0.3816 | 2.94 | 59.97 | **True** |
| #2 | `mp-10182` | $\text{LiZnP}$ | 0 | 0.6096 | 0.6213 (62.1%) | 1.34 | 16.32 | 0.3830 | 3.59 | 47.72 | **True** |
| #3 | `mp-7140` | $\text{SiC}$ (poly) | 2 | 0.6195 | 0.6175 (61.7%) | 2.30 | 10.58 | 0.3308 | 3.17 | 42.01 | False (Boundary) |
| #4 | `mp-5693` | $\text{NaCrS}_2$ | 0 | 0.6525 | 0.6051 (60.5%) | 0.98 | 13.53 | 0.3681 | 3.18 | 72.55 | **True** |
| #5 | `mp-4026` | $\text{KCrS}_2$ | 0 | 0.6560 | 0.6039 (60.4%) | 1.16 | 11.64 | 0.3351 | 3.12 | 82.73 | **True** |

*Physical Note:* The 3rd nearest neighbor to $\text{SiC}$ (`mp-8062`) is an alternative crystallographic polymorph of $\text{SiC}$ (`mp-7140`). Because `mp-7140` has a slightly wider DFT gap ($2.30\text{ eV}$), K-Means assigned it to the adjacent Cluster 2, demonstrating that continuous Euclidean similarity captures physical relationships across discrete cluster boundaries.

---

### Test 2: $\text{SiS}_2$ (`mp-1602`) — Cluster 1 (Open-Framework / Large Volume)
- **Query Properties:** $E_g = 3.07\text{ eV}$, $\varepsilon_r = 4.02$, $\varepsilon_\infty = 3.14$, $f_{\text{ionic}} = 0.219$, $\rho = 1.62\text{ g/cm}^3$, $V = 189.62\text{ \AA}^3$.
- **Same-Cluster Agreement:** **100.0%** (5 of 5 neighbors share Cluster 1).

| Rank | Material ID | Formula | Cluster | Distance ($d$) | Similarity Score ($S$) | $E_g$ (eV) | $\varepsilon_r$ | $f_{\text{ionic}}$ | $\rho$ ($\text{g/cm}^3$) | $V$ ($\text{\AA}^3$) | Same Cluster? |
|---|---|---|---|---|---|---|---|---|---|---|---|
| #1 | `mp-1771` | $\text{NO}_2$ | 1 | 0.4842 | 0.6738 (67.4%) | 2.69 | 2.58 | 0.1357 | 1.65 | 185.01 | **True** |
| #2 | `mp-27724` | $\text{BPS}_4$ | 1 | 0.5370 | 0.6506 (65.1%) | 2.26 | 4.06 | 0.1970 | 1.61 | 175.19 | **True** |
| #3 | `mp-553896` | $\text{K}_3\text{MoF}_6$ | 1 | 0.7506 | 0.5712 (57.1%) | 3.35 | 2.70 | 0.2519 | 2.78 | 195.09 | **True** |
| #4 | `mp-760375` | $\text{Li}_3\text{VS}_4$ | 1 | 0.7806 | 0.5616 (56.2%) | 1.88 | 4.15 | 0.2386 | 1.57 | 211.22 | **True** |
| #5 | `mp-27987` | $\text{BrF}_5$ | 1 | 0.9203 | 0.5208 (52.1%) | 3.44 | 3.16 | 0.3101 | 2.88 | 201.90 | **True** |

---

### Test 3: $\text{AlF}_3$ (`mp-468`) — Cluster 2 (Wide-Bandgap Ionic Insulator)
- **Query Properties:** $E_g = 7.60\text{ eV}$, $\varepsilon_r = 4.99$, $\varepsilon_\infty = 1.94$, $f_{\text{ionic}} = 0.611$, $\rho = 3.02\text{ g/cm}^3$, $V = 92.31\text{ \AA}^3$.
- **Same-Cluster Agreement:** **100.0%** (5 of 5 neighbors share Cluster 2).

| Rank | Material ID | Formula | Cluster | Distance ($d$) | Similarity Score ($S$) | $E_g$ (eV) | $\varepsilon_r$ | $f_{\text{ionic}}$ | $\rho$ ($\text{g/cm}^3$) | $V$ ($\text{\AA}^3$) | Same Cluster? |
|---|---|---|---|---|---|---|---|---|---|---|---|
| #1 | `mp-9143` | $\text{LiPF}_6$ | 2 | 0.4336 | 0.6976 (69.8%) | 7.54 | 6.05 | 0.6893 | 2.70 | 93.60 | **True** |
| #2 | `mp-14232` | $\text{LiBO}_2$ | 2 | 0.4773 | 0.6769 (67.7%) | 7.28 | 8.16 | 0.6409 | 2.80 | 59.07 | **True** |
| #3 | `mp-4608` | $\text{KPF}_6$ | 2 | 0.5951 | 0.6269 (62.7%) | 7.02 | 5.95 | 0.6874 | 2.70 | 113.15 | **True** |
| #4 | `mp-3448` | $\text{KMgF}_3$ | 2 | 0.6588 | 0.6029 (60.3%) | 6.95 | 6.88 | 0.7006 | 3.00 | 66.60 | **True** |
| #5 | `mp-3042` | $\text{K}_2\text{SiF}_6$ | 2 | 0.7087 | 0.5852 (58.5%) | 7.22 | 5.95 | 0.6874 | 2.61 | 140.36 | **True** |

---

### Test 4: $\text{FeSi}$ (`mp-871`) — Cluster 3 (Colossal Permittivity Group)
- **Query Properties:** $E_g = 0.18\text{ eV}$, $\varepsilon_r = 112.34$, $\varepsilon_\infty = 90.79$, $f_{\text{ionic}} = 0.192$, $\rho = 6.33\text{ g/cm}^3$, $V = 88.13\text{ \AA}^3$.
- **Same-Cluster Agreement:** **60.0%** (3 of 5 neighbors share Cluster 3; 2 nearest boundary materials belong to Cluster 0).

| Rank | Material ID | Formula | Cluster | Distance ($d$) | Similarity Score ($S$) | $E_g$ (eV) | $\varepsilon_r$ | $f_{\text{ionic}}$ | $\rho$ ($\text{g/cm}^3$) | $V$ ($\text{\AA}^3$) | Same Cluster? |
|---|---|---|---|---|---|---|---|---|---|---|---|
| #1 | `mp-8281` | $\text{Ba(CdAs)}_2$ | 3 | 0.8849 | 0.5305 (53.1%) | 0.16 | 110.48 | 0.1163 | 5.96 | 142.72 | **True** |
| #2 | `mp-14791` | $\text{Ge}_2\text{Te}_5\text{As}_2$ | 0 | 3.1330 | 0.2420 (24.2%) | 0.41 | 79.70 | 0.1892 | 6.08 | 254.78 | False (Boundary) |
| #3 | `mp-1317` | $\text{CoSb}_3$ | 3 | 3.3211 | 0.2314 (23.1%) | 0.17 | 92.27 | 0.1122 | 7.44 | 378.68 | **True** |
| #4 | `mp-510624` | $\text{SrFeO}_3$ | 0 | 3.6467 | 0.2152 (21.5%) | 0.33 | 70.86 | 0.2463 | 5.31 | 59.86 | False (Boundary) |
| #5 | `mp-7771` | $\text{Sr(CdAs)}_2$ | 3 | 4.0993 | 0.1961 (19.6%) | 0.14 | 149.16 | 0.0809 | 5.77 | 132.99 | **True** |

*Physical Note:* Because Cluster 3 contains only 8 materials in the entire database, the 2nd and 4th closest neighbors are the most extreme boundary members of Cluster 0 ($\text{Ge}_2\text{Te}_5\text{As}_2$ and $\text{SrFeO}_3$), which also possess high dielectric constants ($\varepsilon_r \sim 70–80$) and narrow bandgaps ($E_g < 0.4\text{ eV}$).

---

### Test 5: $\text{GaN}$ (`mp-830`) — Cluster 0 (High-Frequency Semiconductor)
- **Query Properties:** $E_g = 1.57\text{ eV}$, $\varepsilon_r = 10.96$, $\varepsilon_\infty = 6.09$, $f_{\text{ionic}} = 0.444$, $\rho = 5.92\text{ g/cm}^3$, $V = 23.48\text{ \AA}^3$.
- **Same-Cluster Agreement:** **100.0%** (5 of 5 neighbors share Cluster 0).

| Rank | Material ID | Formula | Cluster | Distance ($d$) | Similarity Score ($S$) | $E_g$ (eV) | $\varepsilon_r$ | $f_{\text{ionic}}$ | $\rho$ ($\text{g/cm}^3$) | $V$ ($\text{\AA}^3$) | Same Cluster? |
|---|---|---|---|---|---|---|---|---|---|---|---|
| #1 | `mp-4280` | $\text{GaCuO}_2$ | 0 | 0.4386 | 0.6951 (69.5%) | 0.98 | 10.50 | 0.4438 | 6.05 | 45.40 | **True** |
| #2 | `mp-8830` | $\text{NaRhO}_2$ | 0 | 0.4494 | 0.6899 (69.0%) | 1.38 | 10.99 | 0.3703 | 5.82 | 45.09 | **True** |
| #3 | `mp-19225` | $\text{FeAgO}_2$ | 0 | 0.4882 | 0.6719 (67.2%) | 1.13 | 13.49 | 0.4633 | 6.28 | 51.78 | **True** |
| #4 | `mp-28797` | $\text{YHSe}$ | 0 | 0.4923 | 0.6701 (67.0%) | 1.51 | 14.74 | 0.4050 | 5.56 | 50.45 | **True** |
| #5 | `mp-5986` | $\text{BaTiO}_3$ | 0 | 0.5217 | 0.6572 (65.7%) | 1.73 | 11.53 | 0.4874 | 5.74 | 67.52 | **True** |

---

## 4. Same-Cluster Agreement Analysis

| Query Material ID | Formula | Query Cluster | Top-5 Same-Cluster Matches | Same-Cluster Percentage |
|---|---|---|---|---|
| `mp-8062` | $\text{SiC}$ | Cluster 0 | 4 / 5 | **80.0%** |
| `mp-1602` | $\text{SiS}_2$ | Cluster 1 | 5 / 5 | **100.0%** |
| `mp-468` | $\text{AlF}_3$ | Cluster 2 | 5 / 5 | **100.0%** |
| `mp-871` | $\text{FeSi}$ | Cluster 3 | 3 / 5 | **60.0%** |
| `mp-830` | $\text{GaN}$ | Cluster 0 | 5 / 5 | **100.0%** |
| **Overall Mean** | — | — | **22 / 25** | **88.0%** |

### Key Observations:
1. **High Cluster Coherence (88.0%):** In 4 out of 5 queries, 80% to 100% of nearest neighbors belong to the exact same cluster. This confirms that K-Means discovered natural, compact clusters that accurately reflect continuous metric proximity in standardized 6D space.
2. **Boundary Sensitivity:** Where cluster discordance occurs (e.g. `SiC` polymorphs between Cluster 0 and Cluster 2, or `FeSi` adjacent to high-permittivity members of Cluster 0), the continuous distance metric correctly bridges cluster boundaries, making it an ideal complement to discrete clustering for material recommendations.

---

## 5. Artifacts Created & Exported

1. **[backend/similarity.py](file:///c:/Users/HP/Desktop/PROJECT-7/backend/similarity.py)**: Reusable Python engine module containing `MaterialSimilarityEngine`.
2. **[data/processed/similarity_test_results.csv](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/similarity_test_results.csv)**: Complete 25-row test output log covering all 5 benchmark queries and their Top-5 neighbors.
3. **[data/processed/similarity_report.md](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/similarity_report.md)**: This technical documentation.
4. **[notebooks/06_similarity_engine.ipynb](file:///c:/Users/HP/Desktop/PROJECT-7/notebooks/06_similarity_engine.ipynb)**: Interactive Jupyter notebook with complete test execution and analysis.
