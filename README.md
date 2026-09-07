# 🧠 MaterialMind AI

### Intelligent Material Clustering & Selection System for Engineering Applications

**MaterialMind AI** is an AI powered material intelligence platform that uses **Machine Learning, clustering, dimensionality reduction, similarity analysis, and application-specific recommendation algorithms** to help engineers explore and select materials for different electronic and engineering applications.

🌐 **Live Application:** https://materialmind-ai.onrender.com/

---

## 🚀 Overview

Selecting the right material for an engineering application can require comparing hundreds or thousands of materials across multiple physical, electronic, and structural properties.

**MaterialMind AI** simplifies this process by transforming complex material property data into an interactive platform where users can:

* 🔬 Explore a large material dataset
* 📊 Visualize material relationships using PCA
* 🧩 Discover material clusters using K-Means
* 🔎 Search and inspect individual materials
* 🤝 Find materials similar to a selected material
* ⚡ Recommend materials for specific ECE applications
* 📈 Compare important material properties
* 🧠 Understand why a material is recommended

The system combines **unsupervised machine learning + similarity analysis + domain-specific recommendation logic** into a single engineering-focused platform.

---

# ✨ Key Features

## 1. 🧩 AI Based Material Clustering

MaterialMind AI applies **K-Means clustering** to group materials according to their underlying physical and electronic properties.

The current system uses **4 material clusters**.

This allows materials with similar characteristics to be grouped together without requiring predefined labels.

### Clustering Pipeline

```text
Raw Material Dataset
        ↓
Data Cleaning
        ↓
Feature Engineering
        ↓
Feature Scaling
        ↓
K-Means Clustering
        ↓
Material Clusters
```

---

## 2. 📐 PCA-Based Dimensionality Reduction

High dimensional material property data is difficult to visualize directly.

MaterialMind AI uses **Principal Component Analysis (PCA)** to reduce the feature space and visualize relationships between materials.

### PCA Results

| Component      | Explained Variance |
| -------------- | -----------------: |
| PC1            |             37.08% |
| PC2            |             21.00% |
| PC3            |             16.58% |
| **Cumulative** |         **74.66%** |

The application provides both:

* 📊 2D PCA visualization
* 🧊 Interactive 3D PCA visualization

The 3D visualization allows users to rotate, zoom, and explore the material distribution interactively.

# 🔬 Material Features

The ML pipeline uses six key engineered features:

| Feature                       | Description                                 |
| ----------------------------- | ------------------------------------------- |
| `band_gap`                    | Electronic band gap of the material         |
| `poly_total`                  | Total polarizability-related property       |
| `poly_electronic`             | Electronic contribution to polarizability   |
| `ionic_polarization_fraction` | Fraction associated with ionic polarization |
| `density`                     | Material density                            |
| `volume`                      | Material volume                             |

These features provide a combination of **electronic, polarization, structural, and physical information** for material analysis.


# 🤖 Machine Learning Pipeline

The complete ML workflow consists of:

```text
Material Dataset
      │
      ▼
Data Preprocessing
      │
      ▼
Feature Engineering
      │
      ▼
Feature Selection
      │
      ▼
StandardScaler
      │
      ▼
K-Means Clustering
      │
      ▼
PCA Analysis
      │
      ▼
Similarity Engine
      │
      ▼
ECE Recommendation Engine
```


# 🔎 Material Similarity Engine

MaterialMind AI includes a dedicated **Material Similarity Engine** that allows users to identify materials with similar property profiles.

Instead of searching manually through thousands of materials, the system compares the selected material against the available material space and returns the most relevant alternatives.

### Example

```text
Selected Material
       ↓
Feature Representation
       ↓
Similarity Calculation
       ↓
Rank Similar Materials
       ↓
Top Alternatives
```

This can be particularly useful when an engineer needs a **replacement or alternative material** with comparable characteristics.

---

# ⚡ ECE Material Recommendation Engine

One of the main objectives of MaterialMind AI is to move beyond generic clustering and provide **application oriented material recommendations**.

The system currently supports application profiles including:

### 🔋 Power Electronics

Prioritizes:

* Band Gap
* Permittivity
* Density

**Weighting:**

```text
Band Gap       → 50%
Permittivity   → 30%
Density        → 20%
```

---

### 🧱 Dielectric / Capacitive Applications

Prioritizes:

* Permittivity
* Ionic Polarization Fraction
* Density

**Weighting:**

```text
Permittivity              → 45%
Ionic Fraction            → 35%
Density                   → 20%
```

---

### 📡 RF / High-Frequency Applications

Prioritizes:

* Permittivity
* Electronic Dominance
* Band Gap

**Weighting:**

```text
Permittivity        → 35%
Electronic Dominance → 35%
Band Gap             → 30%
```

---

### 💡 Optoelectronic Applications

Prioritizes:

* Band Gap
* Optical Index
* Density

**Weighting:**

```text
Band Gap       → 40%
Optical Index  → 40%
Density        → 20%
```

---

# 🏆 Recommendation Examples

The recommendation engine can rank candidate materials according to their suitability for a selected engineering application.

Example candidates generated during development include:

### Power Electronics

```text
1. BaSiF6
2. Rb2HfF6
3. Cs2HfF6
4. CsCaF3
5. RbMgF3
```

### Dielectric / Capacitive

```text
1. Bi2SO2
2. CsSnI3
3. AlTlF4
4. Na2TlSb
```

The ranking is generated using the application's **property specific scoring profile**, rather than simply selecting the nearest material in feature space.

---

# 📊 Dataset

The processed dataset contains approximately:

**1,056 materials**

The engineered feature dataset contains:

```text
Rows    → 1,056
Features → 6 selected ML features
```

After clustering, each material is assigned a cluster label.

```text
Material
   │
   ├── Material ID
   ├── Chemical Formula
   ├── Physical Properties
   ├── Electronic Properties
   └── Cluster Label
```

---

# 🛠️ Tech Stack

## Machine Learning

* Python
* Pandas
* NumPy
* Scikit-learn
* K-Means Clustering
* PCA
* StandardScaler
* Joblib

## Data Processing

* Feature Engineering
* Data Cleaning
* Feature Selection
* Numerical Standardization

## Visualization

* Plotly
* Matplotlib
* Interactive 3D visualization

## Backend

* Python
* FastAPI

## Frontend

* Modern web interface
* Interactive material exploration
* Data visualization
* Application-specific recommendations

## Deployment

* Render
* GitHub

---

# 📁 Project Structure

```text
MaterialMind-AI/
│
├── backend/
│   ├── similarity.py
│   ├── recommendation_engine.py
│   └── ...
│
├── data/
│   ├── raw/
│   └── processed/
│       ├── features_engineered.csv
│       └── materials_clustered.csv
│
├── models/
│   ├── scaler.joblib
│   └── kmeans.joblib
│
├── outputs/
│   └── plots/
│       ├── pca_2d.png
│       └── pca_3d.html
│
├── frontend/
│   └── ...
│
├── requirements.txt
├── README.md
└── ...
```

---

# 🧪 ML Model Details

### K-Means

```text
Algorithm       : K-Means
Number of clusters : 4
Input features  : 6
```

### Feature Scaling

A `StandardScaler` is used before clustering to ensure that features with different numerical scales do not disproportionately influence the clustering algorithm.

### PCA

PCA is applied after feature preprocessing to create lower dimensional representations for visualization and exploratory analysis.

---

# 📈 Why Clustering?

Traditional material selection often involves manually comparing individual properties.

Clustering provides another perspective:

> **Which materials naturally behave similarly based on their combined properties?**

This enables engineers to discover groups of materials that may not be obvious from examining individual properties independently.


# 🎯 Why MaterialMind AI?

MaterialMind AI combines three important capabilities:

### 1. Discover

Use clustering to discover naturally occurring material groups.

### 2. Explore

Use PCA and interactive visualizations to understand the material landscape.

### 3. Decide

Use similarity analysis and application-specific scoring to identify promising materials.

```text
             MATERIALMIND AI
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
   DISCOVER      EXPLORE       DECIDE
   Clustering      PCA       Recommendation
       │            │            │
       └────────────┼────────────┘
                    ▼
          Intelligent Material
              Selection
```

# 🌐 Live Demo

Try the deployed application:

**https://materialmind-ai.onrender.com/**

The deployed platform provides an interactive interface for exploring the MaterialMind AI pipeline.


# 🔮 Future Improvements

MaterialMind AI can be extended with several advanced capabilities:

* 🧠 Deep-learning-based material embeddings
* 🔬 Graph Neural Networks for crystal structures
* 🧪 Crystal structure visualization
* 📚 Integration with larger materials databases
* ⚡ More ECE application profiles
* 🎯 Multi-objective optimization
* 🧬 Generative material discovery
* 📊 Advanced explainable AI
* 🔍 Natural-language material search
* 🧠 LLM-powered engineering assistant
* 📈 Additional clustering algorithms such as DBSCAN and hierarchical clustering
* 🧪 Experimental-property validation



# ⚠️ Disclaimer

MaterialMind AI is intended as an **engineering research and decision support tool**.

Recommendations generated by the system should be treated as computational suggestions and should be validated using appropriate experimental data, simulations, literature, and engineering constraints before real-world deployment.



# 👩‍💻 Author

**Ridhi**

Engineering / Machine Learning Project

---

# ⭐ Project Vision

> **MaterialMind AI aims to make material discovery and selection more intelligent, visual, and application-aware by combining machine learning with engineering domain knowledge.**

If you find this project interesting, consider ⭐ starring the repository!

---

## 📜 License

This project is intended for academic and educational purposes. Add an appropriate open-source license if you plan to distribute the source code publicly.
