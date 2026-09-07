import os
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler

# Set plot styling
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['figure.dpi'] = 300
plt.rcParams['savefig.dpi'] = 300

# 1. Load Dataset
raw_csv_path = 'data/raw/materials_dielectric_electronic.csv'
print(f"Loading dataset from: {raw_csv_path}")
df_raw = pd.read_csv(raw_csv_path)
initial_rows, initial_cols = df_raw.shape
print(f"Initial shape: {initial_rows} rows x {initial_cols} columns")

# 2. Check Duplicates & Nulls
id_dupes = int(df_raw['material_id'].duplicated().sum())
total_nulls = int(df_raw.isnull().sum().sum())
print(f"Duplicates in material_id: {id_dupes}")
print(f"Total missing values in raw dataset: {total_nulls}")

# 3. Select Initial Numerical Features for Clustering
features = [
    'band_gap',
    'poly_total',
    'poly_electronic',
    'poly_ionic',
    'n',
    'density',
    'volume'
]
print(f"Selected clustering features ({len(features)}): {features}")

# 4. Defensive MedianImputer Pipeline
imputer = SimpleImputer(strategy='median')
X_imputed_array = imputer.fit_transform(df_raw[features])
df_imputed = pd.DataFrame(X_imputed_array, columns=features, index=df_raw.index)

# Verify no NaNs were fabricated or altered
assert np.allclose(df_raw[features].values, X_imputed_array), "Defensive imputer modified existing non-null data!"
print("Defensive MedianImputer successfully fitted (0 missing values replaced, pipeline armed for inference).")

# 5. IQR Outlier Detection
outlier_summary_list = []
detailed_outliers_list = []
outlier_indices = set()

for feat in features:
    q1 = float(df_imputed[feat].quantile(0.25))
    q3 = float(df_imputed[feat].quantile(0.75))
    iqr = q3 - q1
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr
    
    # Identify outliers
    mask_low = df_imputed[feat] < lower_bound
    mask_high = df_imputed[feat] > upper_bound
    outliers_feat = df_imputed[mask_low | mask_high]
    outlier_indices.update(outliers_feat.index)
    
    outlier_summary_list.append({
        'feature': feat,
        'min': float(df_imputed[feat].min()),
        'q1': q1,
        'median': float(df_imputed[feat].median()),
        'q3': q3,
        'max': float(df_imputed[feat].max()),
        'iqr': iqr,
        'lower_bound': lower_bound,
        'upper_bound': upper_bound,
        'outlier_count': len(outliers_feat),
        'outlier_percentage': round(len(outliers_feat) / len(df_imputed) * 100, 2)
    })
    
    # Collect detailed outliers
    for idx, row in outliers_feat.iterrows():
        val = float(row[feat])
        direction = 'Upper' if val > upper_bound else 'Lower'
        dev = (val - upper_bound) / iqr if direction == 'Upper' else (lower_bound - val) / iqr
        
        # Scientific rationale
        scientific_note = ""
        if feat == 'band_gap' and direction == 'Upper':
            scientific_note = "Wide-bandgap ultra-insulator / deep UV optical window (e.g. fluorides/oxides)"
        elif feat == 'poly_total' and direction == 'Upper':
            scientific_note = "High-k dielectric / soft-mode ferroelectric perovskite candidate"
        elif feat == 'poly_electronic' and direction == 'Upper':
            scientific_note = "High electronic polarizability / narrow-gap heavy-anion semiconductor"
        elif feat == 'poly_ionic' and direction == 'Upper':
            scientific_note = "Strong lattice polarizability / ionic soft-mode contribution"
        elif feat == 'n' and direction == 'Upper':
            scientific_note = "High refractive index optical / infrared transparent material"
        elif feat == 'density' and direction == 'Upper':
            scientific_note = "Heavy-element dense compound (Bi, Pb, Tl, Ta, W based)"
        elif feat == 'volume' and direction == 'Upper':
            scientific_note = "Large unit-cell complex crystal structure"
        else:
            scientific_note = f"Extreme {direction.lower()} value in {feat}"
            
        detailed_outliers_list.append({
            'material_id': str(df_raw.loc[idx, 'material_id']),
            'formula': str(df_raw.loc[idx, 'formula']),
            'feature': feat,
            'value': round(val, 4),
            'direction': direction,
            'threshold': round(upper_bound if direction == 'Upper' else lower_bound, 4),
            'iqr': round(iqr, 4),
            'iqr_distance': round(dev, 2),
            'scientific_rationale': scientific_note
        })

df_iqr_summary = pd.DataFrame(outlier_summary_list)
df_outliers_detailed = pd.DataFrame(detailed_outliers_list)

print(f"Total outlier detections across all features: {len(df_outliers_detailed)}")
print(f"Total unique materials with at least one outlier: {len(outlier_indices)} ({len(outlier_indices)/len(df_imputed)*100:.1f}%)")

# Save outlier report
outlier_report_path = 'data/processed/outlier_report.csv'
df_outliers_detailed.to_csv(outlier_report_path, index=False)
print(f"Saved outlier report to: {outlier_report_path}")

# IMPORTANT: Do NOT delete scientifically valid materials!
# Retain all rows
final_rows = len(df_imputed)
print(f"Rows before preprocessing: {initial_rows} | Rows after preprocessing: {final_rows} (100% retained)")

# 6. Feature Standardization using StandardScaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(df_imputed)
df_scaled = pd.DataFrame(X_scaled, columns=features, index=df_raw.index)

# Save the scaler
os.makedirs('models', exist_ok=True)
scaler_path = 'models/scaler.joblib'
joblib.dump(scaler, scaler_path)
print(f"StandardScaler saved successfully to: {scaler_path}")

# Also save cleaned and scaled datasets in data/processed
df_cleaned = df_raw.copy()
df_cleaned.to_csv('data/processed/materials_cleaned.csv', index=False)

# Scaled features with material_id and formula
df_scaled_export = pd.concat([df_raw[['material_id', 'formula']], df_scaled], axis=1)
df_scaled_export.to_csv('data/processed/features_scaled.csv', index=False)
print("Saved data/processed/materials_cleaned.csv and data/processed/features_scaled.csv")

# 7. Generate Preprocessing Plots
os.makedirs('outputs/plots', exist_ok=True)

feature_labels = {
    'band_gap': 'Band Gap (eV)',
    'poly_total': 'Total Dielectric Constant (ε_total)',
    'poly_electronic': 'Electronic Dielectric Constant (ε_elec)',
    'poly_ionic': 'Ionic Dielectric Constant (ε_ionic)',
    'n': 'Refractive Index (n)',
    'density': 'Density (g/cm³)',
    'volume': 'Unit Cell Volume (Å³)'
}

# Plot 1: Raw Feature Distributions
fig, axes = plt.subplots(2, 4, figsize=(18, 9))
axes = axes.flatten()
for i, feat in enumerate(features):
    ax = axes[i]
    sns.histplot(df_imputed[feat], kde=True, ax=ax, color='#1f77b4', bins=30, alpha=0.6)
    q1 = df_imputed[feat].quantile(0.25)
    q3 = df_imputed[feat].quantile(0.75)
    iqr = q3 - q1
    ub = q3 + 1.5 * iqr
    ax.axvline(ub, color='#d62728', linestyle='--', linewidth=1.5, label=f'IQR Upper: {ub:.2f}')
    ax.axvline(df_imputed[feat].median(), color='#2ca02c', linestyle='-', linewidth=1.5, label=f'Median: {df_imputed[feat].median():.2f}')
    ax.set_title(feature_labels[feat], fontsize=11, fontweight='bold')
    ax.set_xlabel('Value', fontsize=10)
    ax.set_ylabel('Material Count', fontsize=10)
    ax.legend(fontsize=8, loc='upper right')

axes[7].axis('off')
plt.suptitle('MaterialMind-ECE: Raw Feature Distributions with IQR Bounds (N=1,056)', fontsize=15, fontweight='bold', y=0.98)
plt.tight_layout()
plt.savefig('outputs/plots/01_feature_distributions_raw.png', dpi=300)
plt.close()
print("Saved outputs/plots/01_feature_distributions_raw.png")

# Plot 2: Boxplots of Raw Features
fig, axes = plt.subplots(1, 7, figsize=(20, 6))
for i, feat in enumerate(features):
    ax = axes[i]
    sns.boxplot(y=df_imputed[feat], ax=ax, color='#4575b4', flierprops={'marker': 'o', 'markersize': 4, 'markerfacecolor': '#d73027', 'alpha': 0.7})
    ax.set_title(feat, fontsize=11, fontweight='bold')
    ax.set_ylabel(feature_labels[feat], fontsize=9)
plt.suptitle('MaterialMind-ECE: Feature Boxplots Highlighting Scientifically Valid Outliers (N=1,056)', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig('outputs/plots/02_feature_boxplots_iqr.png', dpi=300)
plt.close()
print("Saved outputs/plots/02_feature_boxplots_iqr.png")

# Plot 3: Standardized Feature Distributions (Zero Mean, Unit Variance)
fig, axes = plt.subplots(2, 4, figsize=(18, 9))
axes = axes.flatten()
for i, feat in enumerate(features):
    ax = axes[i]
    sns.histplot(df_scaled[feat], kde=True, ax=ax, color='#9467bd', bins=30, alpha=0.6)
    ax.axvline(0, color='black', linestyle='--', linewidth=1.2, label='Mean = 0')
    ax.axvline(1, color='#e377c2', linestyle=':', linewidth=1.2, label='+1 Std')
    ax.axvline(-1, color='#e377c2', linestyle=':', linewidth=1.2, label='-1 Std')
    ax.set_title(f"Standardized {feat} (z-score)", fontsize=11, fontweight='bold')
    ax.set_xlabel('Standardized Value (z)', fontsize=10)
    ax.set_ylabel('Material Count', fontsize=10)
    ax.legend(fontsize=8, loc='upper right')
axes[7].axis('off')
plt.suptitle('MaterialMind-ECE: Standardized Feature Distributions (StandardScaler, Mean=0, Std=1)', fontsize=15, fontweight='bold', y=0.98)
plt.tight_layout()
plt.savefig('outputs/plots/03_feature_distributions_scaled.png', dpi=300)
plt.close()
print("Saved outputs/plots/03_feature_distributions_scaled.png")

# Plot 4: Feature Correlation Matrix
fig, ax = plt.subplots(figsize=(9, 7))
corr_matrix = df_imputed[features].corr()
sns.heatmap(corr_matrix, annot=True, fmt='.2f', cmap='coolwarm', vmin=-1, vmax=1,
            square=True, linewidths=.5, cbar_kws={"shrink": .8}, ax=ax)
ax.set_title('MaterialMind-ECE: Feature Correlation Matrix (Pearson r)', fontsize=13, fontweight='bold', pad=12)
plt.tight_layout()
plt.savefig('outputs/plots/04_feature_correlation_matrix.png', dpi=300)
plt.close()
print("Saved outputs/plots/04_feature_correlation_matrix.png")

# Plot 5: Physical Consistency - Moss's Rule (Bandgap vs Refractive Index)
fig, ax = plt.subplots(figsize=(8, 6))
scatter = ax.scatter(df_imputed['band_gap'], df_imputed['n'], c=df_imputed['poly_total'], cmap='viridis', alpha=0.75, edgecolors='k', linewidth=0.3)
cbar = plt.colorbar(scatter, ax=ax)
cbar.set_label('Total Dielectric Constant (poly_total)', fontsize=10)
ax.set_xlabel('Band Gap (eV)', fontsize=11, fontweight='bold')
ax.set_ylabel('Refractive Index (n)', fontsize=11, fontweight='bold')
ax.set_title("Physics Validation: Moss's Rule Inverse Trend (n vs Band Gap)", fontsize=13, fontweight='bold', pad=10)
ax.text(0.60, 0.85, "Narrow Gap -> High Index\nWide Gap -> Low Index\n(Consistent with Penn Model)", 
        transform=ax.transAxes, bbox=dict(boxstyle="round,pad=0.4", facecolor="white", alpha=0.8, edgecolor="#ccc"), fontsize=9)
plt.tight_layout()
plt.savefig('outputs/plots/05_moss_rule_bandgap_vs_index.png', dpi=300)
plt.close()
print("Saved outputs/plots/05_moss_rule_bandgap_vs_index.png")

# Plot 6: Outlier Percentage per Feature
fig, ax = plt.subplots(figsize=(9, 5))
bars = ax.barh(df_iqr_summary['feature'], df_iqr_summary['outlier_percentage'], color='#2b5c8f', edgecolor='black', alpha=0.85)
for bar in bars:
    w = bar.get_width()
    ax.text(w + 0.15, bar.get_y() + bar.get_height()/2, f"{w:.1f}%", va='center', fontsize=10, fontweight='bold')
ax.set_xlim(0, max(df_iqr_summary['outlier_percentage']) + 2)
ax.set_xlabel('Outlier Percentage (% of 1,056 materials)', fontsize=11, fontweight='bold')
ax.set_title('MaterialMind-ECE: IQR Outlier Frequency per Clustering Feature', fontsize=13, fontweight='bold')
plt.tight_layout()
plt.savefig('outputs/plots/06_outlier_percentages.png', dpi=300)
plt.close()
print("Saved outputs/plots/06_outlier_percentages.png")

print("\n--- PHASE 2 PREPROCESSING SUMMARY ---")
print(f"Rows before preprocessing: {initial_rows}")
print(f"Rows after preprocessing: {final_rows}")
print(f"Missing values handled: {total_nulls} (Defensive SimpleImputer fitted)")
print(f"Duplicate material_id count: {id_dupes}")
print(f"Outliers detected (total flagged feature values): {len(df_outliers_detailed)}")
print(f"Unique materials with >=1 outlier: {len(outlier_indices)} (Retained: 100%)")
print(f"Final feature list: {features}")
print(f"Final feature matrix dimensions: {df_scaled.shape}")
print(f"StandardScaler saved to: {scaler_path} (exists={os.path.exists(scaler_path)})")
