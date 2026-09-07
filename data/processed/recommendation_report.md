# MaterialMind-ECE — Phase 7 Material Recommendation Engine Report

**Project:** MaterialMind-ECE — AI-Based Clustering and Intelligent Selection of Electronic Materials  
**Curriculum Scope:** Unit 3: Machine Learning / AI | Project 7: Material Clustering  
**Dataset:** Materials Project Inorganic Dielectric Benchmark ($N = 1,056$ materials)  
**Execution Timestamp:** 2026-09-04  
**Status:** Validated & Completed  

---

> [!CAUTION]
> ### MANDATORY SCIENTIFIC DISCLAIMER
> **HEURISTIC ECE SCREENING — NOT EXPERIMENTAL VALIDATION.**  
> This recommendation engine provides heuristic material-level screening across the 1,056-material database using DFT-computed ground-state descriptors (`band_gap`, `poly_total`, `poly_electronic`, `ionic_polarization_fraction`, `density`, `volume`).  
> The system **DOES NOT** predict device-level operational properties such as breakdown voltage, critical breakdown field, RF loss tangent ($\tan \delta$), insertion loss, high-frequency dispersion, signal propagation delay, parasitic capacitance, carrier mobility, switching frequency, or component lifetime.

---

## 1. Executive Summary

Phase 7 builds the **Transparent ECE Material Recommendation Engine** for **MaterialMind-ECE**. Rather than relying on black-box scoring or unmeasured device attributes, the engine implements four **transparent, fully documented heuristic screening profiles**:

1. **`POWER_ELECTRONICS`**: Higher band gap is used as an **electronic robustness screening criterion. It is not a prediction of breakdown voltage or critical breakdown field**, combined with moderate dielectric response and structural density.
2. **`DIELECTRIC_CAPACITIVE`**: High static permittivity ($\varepsilon_r$), high lattice ionic polarization fraction ($f_{\text{ionic}}$), and solid physical ceramic packaging density ($\rho$).
3. **`RF_HIGH_FREQUENCY`**: A higher band gap is used as a **heuristic insulating-character screening criterion. The model does not predict RF leakage, dielectric loss, or high-frequency device performance**. Low-to-moderate dielectric permittivity is used only as a heuristic material-level screening criterion relevant to RF applications, combined with optical/electronic polarization dominance ($1 - f_{\text{ionic}}$).
4. **`OPTOELECTRONIC`**: Evaluates band gap as a **band-gap compatibility screening criterion** in the visible-to-near-infrared spectrum ($1.0 - 3.0\text{ eV}$), alongside high optical dielectric response ($\varepsilon_\infty = n^2$) and crystalline density.

All weights and normalization functions are strictly open and sum to $100.0$. Every recommendation provides feature-level point attribution summing exactly to the final score, paired with nearest-neighbor physical similarity lookups from Phase 6.

---

## 2. Mathematical Formulation & Weighting Methodology

Each application profile score $S \in [0, 100]$ is computed as:
$$S = \sum_{i=1}^{m} w_i \cdot s_i, \quad \text{where } \sum_{i=1}^{m} w_i = 100.0 \text{ and } s_i \in [0, 1.0]$$

Individual feature contribution points are defined as $C_i = w_i \cdot s_i$, guaranteeing:
$$\sum_{i=1}^{m} C_i = S \quad (\text{exact attribution})$$

---

### 2.1 Profile 1: `POWER_ELECTRONICS`

* **Higher Band Gap ($w_1 = 50.0\text{ pts}$):**  
  Higher band gap is used as an electronic robustness screening criterion. It is not a prediction of breakdown voltage or critical breakdown field:
  $$s_{E_g} = \frac{E_g - \min(E_g)}{\max(E_g) - \min(E_g)}$$
* **Moderate Dielectric Constant ($w_2 = 30.0\text{ pts}$):**  
  Target $\varepsilon_r \approx 10.0$ ($\sigma = 8.0$), typical of wide-bandgap matrices:
  $$s_{\varepsilon_r} = \exp\left(-\frac{1}{2}\left(\frac{\varepsilon_r - 10.0}{8.0}\right)^2\right)$$
* **Suitable Structural Density ($w_3 = 20.0\text{ pts}$):**  
  Target $\rho \approx 4.5\text{ g/cm}^3$ ($\sigma = 1.5$):
  $$s_\rho = \exp\left(-\frac{1}{2}\left(\frac{\rho - 4.5}{1.5}\right)^2\right)$$

---

### 2.2 Profile 2: `DIELECTRIC_CAPACITIVE`

* **High Total Permittivity ($w_1 = 45.0\text{ pts}$):**  
  Log-normalized over $\varepsilon_r \in [2.08, 277.78]$:
  $$s_{\varepsilon_r} = \frac{\ln(\varepsilon_r) - \ln(\min(\varepsilon_r))}{\ln(\max(\varepsilon_r)) - \ln(\min(\varepsilon_r))}$$
* **High Ionic Polarization Fraction ($w_2 = 35.0\text{ pts}$):**  
  Soft-mode lattice polarization screening:
  $$s_{f_{\text{ionic}}} = \frac{f_{\text{ionic}} - \min(f_{\text{ionic}})}{\max(f_{\text{ionic}}) - \min(f_{\text{ionic}})}$$
* **Solid Ceramic Density ($w_3 = 20.0\text{ pts}$):**  
  Compact packaging density:
  $$s_\rho = \frac{\rho - \min(\rho)}{\max(\rho) - \min(\rho)}$$

---

### 2.3 Profile 3: `RF_HIGH_FREQUENCY`

* **Low-to-Moderate Permittivity ($w_1 = 35.0\text{ pts}$):**  
  Heuristic material-level screening centered at $\varepsilon_r \approx 5.5$ ($\sigma = 3.0$):
  $$s_{\varepsilon_r} = \exp\left(-\frac{1}{2}\left(\frac{\varepsilon_r - 5.5}{3.0}\right)^2\right)$$
* **Electronic Polarization Dominance ($w_2 = 35.0\text{ pts}$):**  
  Optical electronic fraction $f_{\text{elec}} = 1.0 - f_{\text{ionic}} = \varepsilon_\infty / \varepsilon_r$:
  $$s_{\text{elec}} = \frac{f_{\text{elec}} - \min(f_{\text{elec}})}{\max(f_{\text{elec}}) - \min(f_{\text{elec}})}$$
* **Insulating Band Gap ($w_3 = 30.0\text{ pts}$):**  
  A higher band gap is used as a heuristic insulating-character screening criterion. The model does not predict RF leakage, dielectric loss, or high-frequency device performance:
  $$s_{E_g} = \frac{E_g - \min(E_g)}{\max(E_g) - \min(E_g)}$$

---

### 2.4 Profile 4: `OPTOELECTRONIC`

* **Band-Gap Compatibility Screening ($w_1 = 40.0\text{ pts}$):**  
  Target centered at $E_g \approx 1.8\text{ eV}$ ($\sigma = 0.8\text{ eV}$):
  $$s_{E_g} = \exp\left(-\frac{1}{2}\left(\frac{E_g - 1.8}{0.8}\right)^2\right)$$
* **Strong Optical Permittivity / Refractive Index ($w_2 = 40.0\text{ pts}$):**  
  Log-normalized optical dielectric constant $\varepsilon_\infty = n^2$:
  $$s_{\varepsilon_\infty} = \frac{\ln(\varepsilon_\infty) - \ln(\min(\varepsilon_\infty))}{\ln(\max(\varepsilon_\infty)) - \ln(\min(\varepsilon_\infty))}$$
* **Structural Density Suitability ($w_3 = 20.0\text{ pts}$):**  
  Target crystalline density $\rho \approx 5.5\text{ g/cm}^3$ ($\sigma = 2.0$):
  $$s_\rho = \exp\left(-\frac{1}{2}\left(\frac{\rho - 5.5}{2.0}\right)^2\right)$$

---

## 3. Recommendation Results & Feature Attribution

### 3.1 Profile 1: `POWER_ELECTRONICS`
* **Cluster Distribution:** Cluster 2 (100% — 5/5). Wide-bandgap insulating halides dominate this electronic robustness screening.

| Rank | Material ID | Formula | Cluster | Score | $E_g$ (eV) | $\varepsilon_r$ | $\rho$ ($\text{g/cm}^3$) | $C_{E_g}$ (/50) | $C_{\varepsilon_r}$ (/30) | $C_\rho$ (/20) | Nearest Neighbor | Similarity |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|:---:|
| **#1** | [`mp-5588`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{BaSiF}_6$ | 2 | **93.80** | 7.42 | 8.78 | 4.21 | 44.52 | 29.65 | 19.63 | $\text{CsCaF}_3$ (`mp-7104`) | 0.7226 |
| **#2** | [`mp-13947`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{Rb}_2\text{HfF}_6$ | 2 | **92.59** | 7.13 | 9.51 | 4.66 | 42.75 | 29.94 | 19.89 | $\text{Cs}_2\text{HfF}_6$ (`mp-13948`) | 0.7688 |
| **#3** | [`mp-13948`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{Cs}_2\text{HfF}_6$ | 2 | **92.37** | 7.23 | 9.40 | 4.96 | 43.36 | 29.92 | 19.09 | $\text{Rb}_2\text{HfF}_6$ (`mp-13947`) | 0.7688 |
| **#4** | [`mp-7104`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{CsCaF}_3$ | 2 | **89.97** | 6.90 | 9.20 | 3.97 | 41.35 | 29.85 | 18.77 | $\text{RbAlF}_4$ (`mp-5479`) | 0.7754 |
| **#5** | [`mp-8402`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{RbMgF}_3$ | 2 | **87.46** | 6.94 | 6.48 | 3.94 | 41.60 | 27.23 | 18.64 | $\text{RbAlF}_4$ (`mp-5479`) | 0.6841 |

---

### 3.2 Profile 2: `DIELECTRIC_CAPACITIVE`
* **Cluster Distribution:** Cluster 3 (40% — 2/5), Cluster 0 (40% — 2/5), Cluster 2 (20% — 1/5).

| Rank | Material ID | Formula | Cluster | Score | $\varepsilon_r$ | $f_{\text{ionic}}$ | $\rho$ ($\text{g/cm}^3$) | $C_{\varepsilon_r}$ (/45) | $C_{\text{ion}}$ (/35) | $C_\rho$ (/20) | Nearest Neighbor | Similarity |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|:---:|
| **#1** | [`mp-27891`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{Bi}_2\text{SO}_2$ | 3 | **93.81** | 259.32 | 0.9586 | 8.74 | 44.37 | 34.52 | 14.93 | $\text{Na}_2\text{TlSb}$ (`mp-866132`) | 0.1573 |
| **#2** | [`mp-614013`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{CsSnI}_3$ | 0 | **81.41** | 169.58 | 0.9567 | 4.23 | 40.46 | 34.45 | 6.50 | $\text{Na}_2\text{TlSb}$ (`mp-866132`) | 0.2576 |
| **#3** | [`mp-5606`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{AlTlF}_4$ | 2 | **79.69** | 96.91 | 0.9720 | 5.76 | 35.32 | 35.00 | 9.37 | $\text{Tl}_2\text{SnCl}_6$ (`mp-27832`) | 0.3034 |
| **#4** | [`mp-866132`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{Na}_2\text{TlSb}$ | 3 | **78.08** | 172.52 | 0.7892 | 5.59 | 40.62 | 28.42 | 9.04 | $\text{CsSnI}_3$ (`mp-614013`) | 0.2576 |
| **#5** | [`mp-2114`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{YN}$ | 0 | **78.00** | 120.01 | 0.8714 | 5.74 | 37.28 | 31.38 | 9.33 | $\text{RbHgF}_3$ (`mp-7482`) | 0.2833 |

---

### 3.3 Profile 3: `RF_HIGH_FREQUENCY`
* **Cluster Distribution:** Cluster 2 (100% — 5/5). Boron nitride polymorphs and borates dominate due to low dielectric constant and minimal lattice dispersion.

| Rank | Material ID | Formula | Cluster | Score | $\varepsilon_r$ | $f_{\text{elec}}$ | $E_g$ (eV) | $C_{\varepsilon_r}$ (/35) | $C_{\text{elec}}$ (/35) | $C_{E_g}$ (/30) | Nearest Neighbor | Similarity |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|:---:|
| **#1** | [`mp-3589`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{BPO}_4$ | 2 | **78.44** | 4.91 | 0.5275 | 7.26 | 34.33 | 17.99 | 26.13 | $\text{NaPF}_6$ (`mp-10474`) | 0.5985 |
| **#2** | [`mp-604884`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{BN}$ *(poly 1)* | 2 | **76.62** | 5.08 | 0.7559 | 4.42 | 34.66 | 26.21 | 15.75 | $\text{BN}$ (`mp-984`) | 0.8902 |
| **#3** | [`mp-13150`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{BN}$ *(poly 2)* | 2 | **76.35** | 4.90 | 0.7612 | 4.39 | 34.31 | 26.40 | 15.64 | $\text{BN}$ (`mp-604884`) | 0.8337 |
| **#4** | [`mp-984`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{BN}$ *(poly 3)* | 2 | **76.14** | 4.68 | 0.7628 | 4.48 | 33.72 | 26.46 | 15.97 | $\text{BN}$ (`mp-604884`) | 0.8902 |
| **#5** | [`mp-306`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{B}_2\text{O}_3$ | 2 | **76.09** | 4.79 | 0.5679 | 6.30 | 34.03 | 19.44 | 22.62 | $\text{SiO}_2$ (`mp-554089`) | 0.6516 |

---

### 3.4 Profile 4: `OPTOELECTRONIC`
* **Cluster Distribution:** Cluster 0 (100% — 5/5). Mid-bandgap covalent and optoelectronic semiconductors occupy all top positions.

| Rank | Material ID | Formula | Cluster | Score | $E_g$ (eV) | $\varepsilon_\infty$ | $\rho$ ($\text{g/cm}^3$) | $C_{E_g}$ (/40) | $C_{\varepsilon_\infty}$ (/40) | $C_\rho$ (/20) | Nearest Neighbor | Similarity |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|:---:|
| **#1** | [`mp-3924`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{LiNbO}_2$ | 0 | **71.75** | 1.58 | 8.70 | 5.53 | 38.52 | 13.24 | 20.00 | $\text{BaTiO}_3$ (`mp-5986`) | 0.7175 |
| **#2** | [`mp-510625`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{CrCuO}_2$ | 0 | **71.19** | 1.67 | 7.25 | 5.32 | 39.48 | 11.80 | 19.92 | $\text{AgI}$ (`mp-22925`) | 0.6850 |
| **#3** | [`mp-762`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{PtS}_2$ | 0 | **71.19** | 1.54 | 10.14 | 6.20 | 37.94 | 14.45 | 18.80 | $\text{BaTiO}_3$ (`mp-2998`) | 0.6866 |
| **#4** | [`mp-5513`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{Tl}_3\text{VS}_4$ | 0 | **70.99** | 1.95 | 7.38 | 5.82 | 39.30 | 11.94 | 19.74 | $\text{BiTeCl}$ (`mp-28944`) | 0.7101 |
| **#5** | [`mp-28797`](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/materials_clustered.csv) | $\text{YHSe}$ | 0 | **70.75** | 1.51 | 8.77 | 5.56 | 37.46 | 13.30 | 19.99 | $\text{NaRhO}_2$ (`mp-8830`) | 0.7433 |

---

## 4. Sanity Checks & Quality Assurance

All verification tests passed unequivocally:
1. **Bounded Scores:** All recommendation scores lie strictly within $[0.00, 100.00]$.
2. **Completeness:** Exactly 5 recommendations generated for each of the 4 profiles (20 total rows).
3. **No Duplicates:** All materials within the Top 5 of each profile are unique.
4. **Attribution Exactness:** $\sum C_i = S$ with discrepancy $< 10^{-4}$ across all 20 rows.
5. **Deterministic Ordering:** Ties are broken deterministically by band gap and material ID.

---

## 5. Artifacts Generated & Exported

1. **[backend/recommendation.py](file:///c:/Users/HP/Desktop/PROJECT-7/backend/recommendation.py)**: Reusable Python engine module containing `MaterialRecommendationEngine`.
2. **[data/processed/recommendation_test_results.csv](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/recommendation_test_results.csv)**: Complete 20-row test output log with all 6 final feature values, contributions, and nearest neighbors.
3. **[data/processed/recommendation_report.md](file:///c:/Users/HP/Desktop/PROJECT-7/data/processed/recommendation_report.md)**: This technical documentation.
4. **[notebooks/07_recommendation_engine.ipynb](file:///c:/Users/HP/Desktop/PROJECT-7/notebooks/07_recommendation_engine.ipynb)**: Executable Jupyter notebook with interactive analysis and visualizations.
