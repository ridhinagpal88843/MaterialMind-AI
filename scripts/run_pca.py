import os
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.decomposition import PCA
import plotly.express as px
import plotly.graph_objects as go

# Configure Matplotlib styling
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['figure.dpi'] = 300
plt.rcParams['savefig.dpi'] = 300

# 1. Load Data and Scaler
data_path = 'data/processed/materials_clustered.csv'
scaler_path = 'models/final_scaler.joblib'
kmeans_path = 'models/kmeans.joblib'

print(f"Loading data from: {data_path}")
df = pd.read_csv(data_path)
scaler = joblib.load(scaler_path)
kmeans = joblib.load(kmeans_path)

features = ['band_gap', 'poly_total', 'poly_electronic', 'ionic_polarization_fraction', 'density', 'volume']
X_scaled = scaler.transform(df[features])

print(f"Loaded {df.shape[0]} materials across {len(features)} standardized features.")
print(f"Cluster label distribution:\n{df['cluster'].value_counts().sort_index()}")

# 2. Fit PCA
pca = PCA(n_components=6)
X_pca = pca.fit_transform(X_scaled)

evr = pca.explained_variance_ratio_
cum_evr = np.cumsum(evr)

print("\n--- PCA EXPLAINED VARIANCE ---")
for i in range(len(evr)):
    print(f"PC{i+1}: {evr[i]*100:6.2f}% | Cumulative: {cum_evr[i]*100:6.2f}% | Eigenvalue: {pca.explained_variance_[i]:6.3f}")

# 3. Save PCA Coordinates
pca_cols = [f'PC{i+1}' for i in range(6)]
df_pca_coords = pd.DataFrame(X_pca, columns=pca_cols)
df_pca_export = pd.concat([df[['material_id', 'formula', 'cluster']], df_pca_coords], axis=1)

os.makedirs('data/processed', exist_ok=True)
pca_coords_path = 'data/processed/pca_coordinates.csv'
df_pca_export.to_csv(pca_coords_path, index=False)
print(f"\nSaved PCA coordinates to: {pca_coords_path}")

# Add PC1, PC2, PC3 to main dataframe for plotting
df['PC1'] = X_pca[:, 0]
df['PC2'] = X_pca[:, 1]
df['PC3'] = X_pca[:, 2]

# Compute cluster centroids in PCA space
pca_centroids = pca.transform(kmeans.cluster_centers_)

# 4. Generate 2D PCA Plot (PC1 vs PC2)
os.makedirs('outputs/plots', exist_ok=True)

fig, ax = plt.subplots(figsize=(10, 7.5))
cluster_colors = {0: '#2b83ba', 1: '#fdae61', 2: '#2ca02c', 3: '#d7191c'}
cluster_names = {
    0: 'Cluster 0: Dense / Moderate-Gap (N=412)',
    1: 'Cluster 1: Open-Framework / Large Volume (N=248)',
    2: 'Cluster 2: Wide-Gap / Ionic Dielectric (N=388)',
    3: 'Cluster 3: Colossal Permittivity / Narrow-Gap (N=8)'
}

for c in range(4):
    sub = df[df['cluster'] == c]
    ax.scatter(sub['PC1'], sub['PC2'], c=cluster_colors[c], label=cluster_names[c],
               alpha=0.65 if c != 3 else 0.95,
               s=35 if c != 3 else 90,
               edgecolors='k' if c == 3 else 'none',
               linewidth=0.8 if c == 3 else 0,
               zorder=3 if c != 3 else 5)

# Plot Centroids
ax.scatter(pca_centroids[:, 0], pca_centroids[:, 1], c='black', marker='X', s=140, linewidths=1.5,
           edgecolors='white', zorder=6, label='K-Means Cluster Centroids')

# Annotate Centroids
for c in range(4):
    ax.annotate(f'Centroid {c}',
                (pca_centroids[c, 0], pca_centroids[c, 1]),
                xytext=(pca_centroids[c, 0] + 0.3, pca_centroids[c, 1] + 0.3),
                fontsize=9, fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.2', facecolor='white', alpha=0.85, edgecolor='#444'))

# Annotate sample outlier in Cluster 3
sr_ag_p = df[df['formula'] == 'SrAgP'].iloc[0]
ax.annotate('SrAgP (εr=277.8, Eg=0.11 eV)',
            (sr_ag_p['PC1'], sr_ag_p['PC2']),
            xytext=(sr_ag_p['PC1'] - 4.5, sr_ag_p['PC2'] + 0.8),
            arrowprops=dict(arrowstyle='->', color='#d7191c', lw=1.2),
            fontsize=8.5, fontweight='bold', color='#d7191c',
            bbox=dict(boxstyle='round,pad=0.25', facecolor='white', alpha=0.9, edgecolor='#d7191c'))

ax.set_title('MaterialMind-ECE: 2D PCA Latent Space (PC1 vs PC2) with K-Means Clusters', fontsize=13, fontweight='bold', pad=12)
ax.set_xlabel(f'Principal Component 1 ({evr[0]*100:.2f}% Variance)\n[Polarizability ε∞, εr (+) vs Bandgap Eg (-)]', fontsize=10, fontweight='bold')
ax.set_ylabel(f'Principal Component 2 ({evr[1]*100:.2f}% Variance)\n[Ionicity f_ionic, εr (+) vs Unit Cell Volume (-)]', fontsize=10, fontweight='bold')
ax.axhline(0, color='gray', linestyle='--', linewidth=0.8, alpha=0.5)
ax.axvline(0, color='gray', linestyle='--', linewidth=0.8, alpha=0.5)
ax.legend(fontsize=9, loc='upper right', frameon=True, framealpha=0.9)
plt.tight_layout()

pca_2d_path = 'outputs/plots/pca_2d.png'
plt.savefig(pca_2d_path, dpi=300)
plt.close()
print(f"Saved 2D PCA plot to: {pca_2d_path}")

# 5. Generate Interactive 3D PCA Plot (Plotly)
df_plot = df.copy()
df_plot['Cluster_Label'] = df_plot['cluster'].map(cluster_names)

# Custom hover data formatting
df_plot['Hover_Text'] = (
    "<b>Material ID:</b> " + df_plot['material_id'] + "<br>" +
    "<b>Formula:</b> " + df_plot['formula'] + "<br>" +
    "<b>Cluster:</b> " + df_plot['cluster'].astype(str) + "<br>" +
    "<b>Band Gap (Eg):</b> " + df_plot['band_gap'].round(2).astype(str) + " eV<br>" +
    "<b>Total Dielectric (ε_total):</b> " + df_plot['poly_total'].round(2).astype(str) + "<br>" +
    "<b>Electronic Dielectric (ε_elec):</b> " + df_plot['poly_electronic'].round(2).astype(str) + "<br>" +
    "<b>Ionic Fraction (f_ionic):</b> " + df_plot['ionic_polarization_fraction'].round(3).astype(str) + "<br>" +
    "<b>Density:</b> " + df_plot['density'].round(2).astype(str) + " g/cm³<br>" +
    "<b>Volume:</b> " + df_plot['volume'].round(1).astype(str) + " Å³<br>" +
    "<b>PC1:</b> " + df_plot['PC1'].round(2).astype(str) + "<br>" +
    "<b>PC2:</b> " + df_plot['PC2'].round(2).astype(str) + "<br>" +
    "<b>PC3:</b> " + df_plot['PC3'].round(2).astype(str)
)

fig3d = go.Figure()

plotly_colors = {
    0: 'rgb(43, 131, 186)',   # Blue
    1: 'rgb(253, 174, 97)',   # Orange
    2: 'rgb(44, 160, 44)',    # Green
    3: 'rgb(215, 25, 28)'     # Red
}

for c in range(4):
    sub = df_plot[df_plot['cluster'] == c]
    fig3d.add_trace(go.Scatter3d(
        x=sub['PC1'],
        y=sub['PC2'],
        z=sub['PC3'],
        mode='markers',
        name=cluster_names[c],
        marker=dict(
            size=4 if c != 3 else 7,
            color=plotly_colors[c],
            opacity=0.75 if c != 3 else 0.95,
            line=dict(color='black', width=0.5 if c != 3 else 1.5)
        ),
        text=sub['Hover_Text'],
        hoverinfo='text'
    ))

# Add Centroids to 3D plot
fig3d.add_trace(go.Scatter3d(
    x=pca_centroids[:, 0],
    y=pca_centroids[:, 1],
    z=pca_centroids[:, 2],
    mode='markers+text',
    name='Cluster Centroids',
    marker=dict(
        size=8,
        color='black',
        symbol='diamond',
        line=dict(color='white', width=1.5)
    ),
    text=[f"Centroid {c}" for c in range(4)],
    textposition='top center',
    hoverinfo='text'
))

fig3d.update_layout(
    title=dict(
        text=f"<b>MaterialMind-ECE: 3D Material PCA Space</b><br><sup>Total Cumulative Variance Explained = {cum_evr[2]*100:.2f}% (PC1: {evr[0]*100:.1f}%, PC2: {evr[1]*100:.1f}%, PC3: {evr[2]*100:.1f}%) | N = 1,056 Materials</sup>",
        font=dict(size=15, family='Arial')
    ),
    scene=dict(
        xaxis=dict(title=f"PC1 ({evr[0]*100:.1f}%): Polarizability vs Bandgap", backgroundcolor='rgb(245, 247, 250)'),
        yaxis=dict(title=f"PC2 ({evr[1]*100:.1f}%): Ionicity vs Volume", backgroundcolor='rgb(245, 247, 250)'),
        zaxis=dict(title=f"PC3 ({evr[2]*100:.1f}%): Cell Volume vs Density", backgroundcolor='rgb(245, 247, 250)'),
        aspectmode='cube'
    ),
    legend=dict(
        x=0.02, y=0.98,
        bgcolor='rgba(255, 255, 255, 0.85)',
        bordercolor='rgba(0,0,0,0.2)',
        borderwidth=1
    ),
    margin=dict(l=0, r=0, b=0, t=50)
)

pca_3d_path = 'outputs/plots/pca_3d.html'
fig3d.write_html(pca_3d_path, include_plotlyjs='cdn')
print(f"Saved interactive 3D PCA plot to: {pca_3d_path}")

print("\n--- PHASE 5 PCA COMPLETE ---")
print(f"PC1: {evr[0]*100:.2f}% | PC2: {evr[1]*100:.2f}% | PC3: {evr[2]*100:.2f}%")
print(f"Top-3 Cumulative Variance: {cum_evr[2]*100:.2f}%")
