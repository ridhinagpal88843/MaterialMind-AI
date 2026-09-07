import os
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler

# Set plot styling
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['figure.dpi'] = 300
plt.rcParams['savefig.dpi'] = 300

# 1. Load Dataset from Phase 2
cleaned_path = 'data/processed/materials_cleaned.csv'
print(f"Loading cleaned dataset from: {cleaned_path}")
df = pd.read_csv(cleaned_path)
print(f"Loaded dataset: {df.shape[0]} rows x {df.shape[1]} columns")

# 2. Feature Construction & Evaluation
print("\n--- 1. FEATURE CONSTRUCTION ---")

# (A) ionic_polarization_fraction = poly_ionic / poly_total
df['ionic_polarization_fraction'] = df['poly_ionic'] / df['poly_total']
# Check invalid values
invalid_ionic = df['ionic_polarization_fraction'].isnull().sum() + np.isinf(df['ionic_polarization_fraction']).sum()
print(f"ionic_polarization_fraction invalid count (NaN/Inf): {invalid_ionic}")
print(f"ionic_polarization_fraction range: [{df['ionic_polarization_fraction'].min():.4f}, {df['ionic_polarization_fraction'].max():.4f}]")
print(f"ionic_polarization_fraction mean: {df['ionic_polarization_fraction'].mean():.4f}, median: {df['ionic_polarization_fraction'].median():.4f}")

# (B) refractive_index_squared = n^2
df['refractive_index_squared'] = df['n'] ** 2
invalid_n2 = df['refractive_index_squared'].isnull().sum() + np.isinf(df['refractive_index_squared']).sum()
print(f"refractive_index_squared invalid count (NaN/Inf): {invalid_n2}")
print(f"refractive_index_squared vs poly_electronic correlation: {df['refractive_index_squared'].corr(df['poly_electronic']):.6f}")

# 3. Multicollinearity & Variance Analysis
print("\n--- 2. MULTICOLLINEARITY & VIF ANALYSIS ---")
init_features = ['band_gap', 'poly_total', 'poly_electronic', 'poly_ionic', 'n', 'density', 'volume']

def compute_vif(data, cols):
    X = StandardScaler().fit_transform(data[cols])
    vifs = {}
    for i, col in enumerate(cols):
        y_col = X[:, i]
        x_other = np.delete(X, i, axis=1)
        r2 = np.linalg.lstsq(x_other, y_col, rcond=None)[0]
        y_pred = x_other @ r2
        r2_val = 1.0 - np.sum((y_col - y_pred)**2) / np.sum(y_col**2)
        vif = 1.0 / (1.0 - r2_val) if (1.0 - r2_val) > 1e-10 else np.inf
        vifs[col] = vif
    return vifs

vif_initial = compute_vif(df, init_features)
print("Initial 7 features VIF:")
for k, v in vif_initial.items():
    print(f"  {k:25s}: {v:8.2f}")

# 4. Final Feature Selection
final_features = [
    'band_gap',
    'poly_total',
    'poly_electronic',
    'ionic_polarization_fraction',
    'density',
    'volume'
]
vif_final = compute_vif(df, final_features)
print("\nFinal Selected 6 features VIF:")
for k, v in vif_final.items():
    print(f"  {k:28s}: {v:8.2f}")

# 5. Save Processed Features Dataset
os.makedirs('data/processed', exist_ok=True)
export_cols = ['material_id', 'formula'] + final_features
df_engineered = df[export_cols].copy()
features_eng_path = 'data/processed/features_engineered.csv'
df_engineered.to_csv(features_eng_path, index=False)
print(f"\nSaved engineered features to: {features_eng_path}")

# 6. Fit and Save Final StandardScaler
scaler_final = StandardScaler()
X_final_scaled = scaler_final.fit_transform(df[final_features])
df_final_scaled = pd.DataFrame(X_final_scaled, columns=final_features, index=df.index)

os.makedirs('models', exist_ok=True)
final_scaler_path = 'models/final_scaler.joblib'
joblib.dump(scaler_final, final_scaler_path)
print(f"Saved new final scaler to: {final_scaler_path}")
print(f"Final scaler fitted means: {np.round(scaler_final.mean_, 4)}")
print(f"Final scaler fitted scales: {np.round(scaler_final.scale_, 4)}")

# 7. Generate Visualizations
os.makedirs('outputs/plots', exist_ok=True)

# Plot 1: Final Feature Correlation Heatmap
fig, ax = plt.subplots(figsize=(8.5, 7))
corr_final = df[final_features].corr()
feature_display_names = [
    'Band Gap (Eg)',
    'Total Permittivity (ε_total)',
    'Electronic Permittivity (ε_elec)',
    'Ionic Polariz. Fraction (f_ionic)',
    'Mass Density (ρ)',
    'Unit Cell Volume (V)'
]
corr_display = corr_final.copy()
corr_display.columns = feature_display_names
corr_display.index = feature_display_names

sns.heatmap(corr_display, annot=True, fmt='.2f', cmap='coolwarm', vmin=-1, vmax=1,
            square=True, linewidths=0.8, cbar_kws={"shrink": 0.8}, ax=ax)
ax.set_title('MaterialMind-ECE: Final Selected Features Correlation Matrix (N=1,056)', fontsize=12, fontweight='bold', pad=12)
plt.tight_layout()
plot_corr_path = 'outputs/plots/feature_correlation_final.png'
plt.savefig(plot_corr_path, dpi=300)
plt.close()
print(f"Saved: {plot_corr_path}")

# Plot 2: Distributions of Engineered & Selected Features
fig, axes = plt.subplots(2, 3, figsize=(16, 9))
axes = axes.flatten()

unit_labels = {
    'band_gap': 'Band Gap (eV)',
    'poly_total': 'Total Static Permittivity (ε_total, dimensionless)',
    'poly_electronic': 'Optical Electronic Permittivity (ε_elec, dimensionless)',
    'ionic_polarization_fraction': 'Ionic Polarization Fraction (f_ionic, dimensionless)',
    'density': 'Mass Density (g/cm³)',
    'volume': 'Unit Cell Volume (Å³)'
}

for i, feat in enumerate(final_features):
    ax = axes[i]
    color = '#1b7837' if feat == 'ionic_polarization_fraction' else '#2166ac'
    sns.histplot(df[feat], kde=True, ax=ax, color=color, bins=30, alpha=0.65)
    med = df[feat].median()
    mean = df[feat].mean()
    ax.axvline(med, color='#d95f02', linestyle='-', linewidth=1.5, label=f'Median: {med:.2f}')
    ax.axvline(mean, color='#7570b3', linestyle='--', linewidth=1.5, label=f'Mean: {mean:.2f}')
    ax.set_title(f"{feat}\n({unit_labels[feat]})", fontsize=11, fontweight='bold')
    ax.set_xlabel('Value', fontsize=10)
    ax.set_ylabel('Material Count', fontsize=10)
    ax.legend(fontsize=8, loc='upper right')

plt.suptitle('MaterialMind-ECE: Empirical Distributions of Final Selected Clustering Features (N=1,056)', fontsize=14, fontweight='bold', y=0.98)
plt.tight_layout()
plot_dist_path = 'outputs/plots/feature_distributions_engineered.png'
plt.savefig(plot_dist_path, dpi=300)
plt.close()
print(f"Saved: {plot_dist_path}")

print("\n--- PHASE 3 FEATURE SELECTION COMPLETE ---")
print(f"Features before: {len(init_features)}")
print(f"Features after: {len(final_features)}")
print(f"Features added: ['ionic_polarization_fraction']")
print(f"Features removed: ['poly_ionic', 'n']")
print(f"Features evaluated but rejected: ['refractive_index_squared']")
print(f"Final feature matrix shape: {df_final_scaled.shape}")
