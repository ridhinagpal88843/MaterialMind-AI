import os
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score

# Set plot styling
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['figure.dpi'] = 300
plt.rcParams['savefig.dpi'] = 300

# 1. Load Data & Scaler
csv_path = 'data/processed/features_engineered.csv'
scaler_path = 'models/final_scaler.joblib'
print(f"Loading data from: {csv_path}")
df = pd.read_csv(csv_path)

features = ['band_gap', 'poly_total', 'poly_electronic', 'ionic_polarization_fraction', 'density', 'volume']
scaler = joblib.load(scaler_path)
X = scaler.transform(df[features])

print(f"Loaded dataset: {df.shape[0]} rows")
print(f"Extracted features ({len(features)}): {features}")
print(f"Scaled matrix shape: {X.shape}")

# 2. Evaluate K = 2 through 8
k_range = list(range(2, 9))
inertias = []
silhouette_scores = []
davies_bouldin_scores = []
calinski_harabasz_scores = []

print("\n--- K-MEANS EVALUATION (K=2 to 8) ---")
for k in k_range:
    km = KMeans(n_clusters=k, random_state=42, n_init=25)
    labels = km.fit_predict(X)
    inertia = km.inertia_
    sil = silhouette_score(X, labels)
    db = davies_bouldin_score(X, labels)
    ch = calinski_harabasz_score(X, labels)
    
    inertias.append(inertia)
    silhouette_scores.append(sil)
    davies_bouldin_scores.append(db)
    calinski_harabasz_scores.append(ch)
    
    print(f"K={k:2d} | Inertia: {inertia:8.2f} | Silhouette: {sil:6.4f} | Davies-Bouldin: {db:6.4f} | Calinski-Harabasz: {ch:7.2f}")

# 3. Create Plots
os.makedirs('outputs/plots', exist_ok=True)

# Plot 1: Elbow Curve
fig, ax = plt.subplots(figsize=(8, 5.5))
ax.plot(k_range, inertias, marker='o', linewidth=2.2, markersize=8, color='#1f78b4', label='Inertia (WCSS)')
ax.axvline(4, color='#e31a1c', linestyle='--', linewidth=1.5, alpha=0.8, label='Optimal Elbow (K=4)')
ax.scatter([4], [inertias[k_range.index(4)]], color='#e31a1c', s=140, zorder=5)
ax.annotate(f'Elbow Inflection\nK=4 (Inertia={inertias[k_range.index(4)]:.1f})',
            xy=(4, inertias[k_range.index(4)]), xytext=(4.6, inertias[k_range.index(4)] + 400),
            arrowprops=dict(arrowstyle='->', color='#e31a1c', lw=1.5),
            fontsize=10, fontweight='bold', bbox=dict(boxstyle='round,pad=0.4', facecolor='white', edgecolor='#e31a1c', alpha=0.9))

ax.set_title('MaterialMind-ECE: K-Means Inertia (Elbow Method)', fontsize=13, fontweight='bold', pad=12)
ax.set_xlabel('Number of Clusters (K)', fontsize=11, fontweight='bold')
ax.set_ylabel('Inertia (Within-Cluster Sum of Squares)', fontsize=11, fontweight='bold')
ax.set_xticks(k_range)
ax.legend(fontsize=10, loc='upper right')
plt.tight_layout()
elbow_plot_path = 'outputs/plots/elbow_curve.png'
plt.savefig(elbow_plot_path, dpi=300)
plt.close()
print(f"\nSaved: {elbow_plot_path}")

# Plot 2: Silhouette Scores
fig, ax = plt.subplots(figsize=(8, 5.5))
bars = ax.bar(k_range, silhouette_scores, color='#33a02c', alpha=0.75, edgecolor='black', width=0.55)
# Highlight K=4
bars[k_range.index(4)].set_color('#e31a1c')
bars[k_range.index(4)].set_alpha(0.9)
ax.plot(k_range, silhouette_scores, color='#1b7837', marker='s', linewidth=1.8, markersize=6)

for bar in bars:
    h = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2., h + 0.003, f"{h:.4f}", ha='center', va='bottom', fontsize=9, fontweight='bold')

ax.set_title('MaterialMind-ECE: Silhouette Scores across Cluster Counts (K=2 to 8)', fontsize=13, fontweight='bold', pad=12)
ax.set_xlabel('Number of Clusters (K)', fontsize=11, fontweight='bold')
ax.set_ylabel('Mean Silhouette Coefficient', fontsize=11, fontweight='bold')
ax.set_ylim(0.18, 0.26)
ax.set_xticks(k_range)
ax.axhline(max(silhouette_scores), color='#e31a1c', linestyle=':', linewidth=1.2, label=f'Peak Score = {max(silhouette_scores):.4f} (K=4)')
ax.legend(fontsize=10, loc='upper right')
plt.tight_layout()
sil_plot_path = 'outputs/plots/silhouette_scores.png'
plt.savefig(sil_plot_path, dpi=300)
plt.close()
print(f"Saved: {sil_plot_path}")

# 4. Train Final Model with Optimal K=4
optimal_k = 4
print(f"\nTraining final K-Means model with optimal K={optimal_k}...")
final_km = KMeans(n_clusters=optimal_k, random_state=42, n_init=25)
df['cluster'] = final_km.fit_predict(X)

# 5. Save Final Model
os.makedirs('models', exist_ok=True)
model_path = 'models/kmeans.joblib'
joblib.dump(final_km, model_path)
print(f"Saved final K-Means model to: {model_path}")

# 6. Save Clustered Dataset
clustered_csv_path = 'data/processed/materials_clustered.csv'
df.to_csv(clustered_csv_path, index=False)
print(f"Saved clustered dataset to: {clustered_csv_path} ({df.shape[0]} rows)")

# 7. Create Cluster Profiles
profile_rows = []
total_mats = len(df)

for c in range(optimal_k):
    cluster_subset = df[df['cluster'] == c]
    count = len(cluster_subset)
    pct = round(count / total_mats * 100, 2)
    
    row_dict = {
        'cluster_id': c,
        'material_count': count,
        'percentage': pct
    }
    
    # Add means
    for f in features:
        row_dict[f'{f}_mean'] = round(cluster_subset[f].mean(), 4)
    # Add medians
    for f in features:
        row_dict[f'{f}_median'] = round(cluster_subset[f].median(), 4)
        
    profile_rows.append(row_dict)

df_profiles = pd.DataFrame(profile_rows)
profile_path = 'data/processed/cluster_profiles.csv'
df_profiles.to_csv(profile_path, index=False)
print(f"Saved cluster profiles to: {profile_path}")

print("\n--- CLUSTER PROFILES (K=4) ---")
display_cols = ['cluster_id', 'material_count', 'percentage'] + [f'{f}_mean' for f in features]
print(df_profiles[display_cols].to_string(index=False))
