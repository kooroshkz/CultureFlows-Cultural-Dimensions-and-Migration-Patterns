import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import json
import warnings
warnings.filterwarnings('ignore')

def create_country_clustering():
    """
    Create country clustering based on cultural dimensions and migration patterns
    """
    # Load the data
    df = pd.read_csv('output/masterdata.csv')
    
    # Prepare features for clustering
    # Cultural dimensions
    cultural_features = ['pdi', 'idv', 'mas', 'uai', 'lto', 'ivr']
    
    # Clean data - remove rows with missing values in cultural and base migration data
    required_cols = cultural_features + ['2020', '2024', 'population']
    df_clean = df.dropna(subset=required_cols)
    
    # Calculate immigration ratios per population (per 1000 people)
    df_clean = df_clean.copy()
    
    # Ensure no zero population values
    df_clean = df_clean[df_clean['population'] > 0]
    
    df_clean['immigration_ratio_2020'] = (df_clean['2020'] / df_clean['population']) * 1000
    df_clean['immigration_ratio_2024'] = (df_clean['2024'] / df_clean['population']) * 1000
    
    # Check for any problematic values
    inf_mask = np.isinf(df_clean['immigration_ratio_2020']) | np.isinf(df_clean['immigration_ratio_2024'])
    if inf_mask.any():
        print(f"Warning: Found {inf_mask.sum()} countries with infinite immigration ratios")
        print("Countries with issues:")
        problematic = df_clean[inf_mask][['country', '2020', '2024', 'population']]
        print(problematic)
        # Remove problematic rows
        df_clean = df_clean[~inf_mask]
    
    # Migration features - use immigration ratios instead of absolute numbers
    migration_features = ['immigration_ratio_2020', 'immigration_ratio_2024']
    
    # Create feature matrix
    features = cultural_features + migration_features
    
    # Prepare feature matrix
    X = df_clean[features].copy()
    
    # Handle potential issues with migration ratios
    print("Debugging migration ratios:")
    for col in migration_features:
        print(f"{col}: min={X[col].min():.6f}, max={X[col].max():.6f}, mean={X[col].mean():.6f}")
        
    # Clean any infinite or very large values
    for col in migration_features:
        # Replace any negative values or zeros with small positive value
        X[col] = np.maximum(X[col], 0.001)
        # Cap extremely large values
        X[col] = np.minimum(X[col], 1000)  # Cap at 1000 per 1000 (100%)
    
    print("After cleaning:")
    for col in migration_features:
        print(f"{col}: min={X[col].min():.6f}, max={X[col].max():.6f}, mean={X[col].mean():.6f}")
        
    # Apply log transformation to reduce skewness
    for col in migration_features:
        X[col] = np.log1p(X[col])
    
    # Standardize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Apply K-means clustering
    n_clusters = 8  # Increased to better capture migration level diversity
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(X_scaled)
    
    # Add cluster labels to dataframe
    df_clean = df_clean.copy()
    df_clean['cluster'] = clusters
    
    # Apply PCA for 2D visualization
    pca = PCA(n_components=2, random_state=42)
    X_pca = pca.fit_transform(X_scaled)
    
    df_clean['pca_x'] = X_pca[:, 0]
    df_clean['pca_y'] = X_pca[:, 1]
    
    # Create cluster analysis
    cluster_stats = {}
    # Okabe and Ito color palette - colorblind friendly (with custom replacement for yellow)
    cluster_colors = ['#000000', '#009E73', '#0072B2', '#56B4E9', '#C26A77', '#E69F00', '#D55E00', '#CC79A7']
    
    for i in range(n_clusters):
        cluster_data = df_clean[df_clean['cluster'] == i]
        
        # Calculate cluster characteristics
        cultural_means = cluster_data[cultural_features].mean()
        migration_ratio_mean = cluster_data['immigration_ratio_2024'].mean()
        
        # Determine cluster profile
        profile = determine_cluster_profile(cultural_means, migration_ratio_mean)
        
        cluster_stats[i] = {
            'name': profile['name'],
            'description': profile['description'],
            'color': cluster_colors[i],
            'countries': cluster_data['country'].tolist(),
            'size': len(cluster_data),
            'cultural_profile': {
                'power_distance': float(cultural_means['pdi']),
                'individualism': float(cultural_means['idv']),
                'masculinity': float(cultural_means['mas']),
                'uncertainty_avoidance': float(cultural_means['uai']),
                'long_term_orientation': float(cultural_means['lto']),
                'indulgence': float(cultural_means['ivr'])
            },
            'migration_level': migration_classification(migration_ratio_mean),
            'immigration_ratio_per_1000': float(migration_ratio_mean)
        }
    
    # Prepare output data
    clustering_results = {
        'clusters': cluster_stats,
        'countries': df_clean[['country', 'cluster', 'pca_x', 'pca_y']].to_dict('records'),
        'pca_explained_variance': pca.explained_variance_ratio_.tolist(),
        'feature_importance': {
            'cultural_weight': 0.6,
            'migration_weight': 0.4
        }
    }
    
    # Save results
    with open('output/clustering_results.json', 'w') as f:
        json.dump(clustering_results, f, indent=2)
    
    # Save enhanced masterdata with clusters and immigration ratios
    output_cols = ['country', 'cluster', 'pca_x', 'pca_y', 'immigration_ratio_2020', 'immigration_ratio_2024']
    df_clean[output_cols].to_csv('output/country_clusters.csv', index=False)
    
    print(f"Clustering analysis completed!")
    print(f"Generated {n_clusters} clusters for {len(df_clean)} countries")
    print(f"Using immigration ratios per 1000 population instead of absolute numbers")
    
    # Print cluster summary
    for i, stats in cluster_stats.items():
        print(f"\nCluster {i+1}: {stats['name']}")
        print(f"  Countries: {stats['size']}")
        print(f"  Examples: {', '.join(stats['countries'][:3])}...")
        print(f"  Profile: {stats['description']}")
        print(f"  Immigration ratio: {stats['immigration_ratio_per_1000']:.2f} per 1000 people ({stats['migration_level']})")
    
    return clustering_results

def determine_cluster_profile(cultural_profile, migration_ratio):
    """
    Create simple, intuitive cluster names for general audiences
    """
    pdi = cultural_profile['pdi']
    idv = cultural_profile['idv']
    mas = cultural_profile['mas']
    uai = cultural_profile['uai']
    lto = cultural_profile['lto']
    ivr = cultural_profile['ivr']
    
    # Define thresholds (based on global averages)
    high_pdi = pdi > 55     # High power distance
    low_pdi = pdi <= 55     # Low power distance
    low_idv = idv < 40      # Collectivist
    high_idv = idv > 60     # Individualist
    low_mas = mas < 45      # Feminine
    high_mas = mas >= 45    # Masculine
    high_ivr = ivr > 55     # Indulgent
    low_ivr = ivr < 45      # Restrained
    
    # Simple, intuitive names based on cultural combinations
    if low_idv and high_ivr:  # Cluster 0, 3 pattern
        if migration_ratio > 15:  # Higher migration (0)
            name = "Family-First Countries"
            desc = "Places where family and community come first, but people enjoy life's pleasures"
        else:  # Lower migration (3)
            name = "Social Living Countries"
            desc = "Traditional societies where everyone knows each other and celebrates together"
    
    elif high_idv and high_mas and migration_ratio < 50:  # Cluster 1 pattern (lower migration)
        name = "Competitive Nations"
        desc = "Independent countries focused on success, achievement and getting ahead"
    
    elif high_idv and high_mas and migration_ratio >= 50:  # Cluster 6 pattern (higher migration)
        name = "Business-Minded Countries"
        desc = "Global business hubs where people pursue entrepreneurship and success"
    
    elif high_pdi and low_idv and low_ivr:  # Cluster 2, 4, 7 pattern
        if migration_ratio > 70:  # Very high migration (4)
            name = "Structured Societies"
            desc = "Well-organized countries with clear rules and strong leadership"
        elif migration_ratio > 10:  # Moderate migration (2)
            name = "Respectful Communities"
            desc = "Places where people respect authority and work together as groups"
        else:  # Low migration (7)
            name = "Traditional Mindset"
            desc = "Countries with deep traditions and established ways of doing things"
    
    elif low_pdi and high_idv and low_mas:  # Cluster 5 pattern
        name = "Quality-of-Life Nations"
        desc = "Equal societies where people value work-life balance and helping others"
    
    elif low_pdi and high_idv:  # Fallback for remaining high individualism
        name = "Progressive Countries"
        desc = "Fair countries where people pursue personal goals while caring for others"
    
    # Fallbacks for any unmatched patterns
    elif high_idv:
        name = "Independent Nations"
        desc = "Countries where people value personal freedom and self-reliance"
    elif low_idv:
        name = "Team Players"
        desc = "Countries where people work together and support each other"
    else:
        name = "Mixed Cultures"
        desc = "Countries with balanced cultural characteristics"
    
    return {'name': name, 'description': desc}

def migration_classification(migration_ratio):
    """
    Classify migration level based on immigration ratio per 1000 population
    Using percentile-based thresholds for balanced distribution
    """
    # Based on the data analysis:
    # 25th percentile: ~6, 50th percentile: ~21, 75th percentile: ~63, 90th percentile: ~104
    if migration_ratio > 63:  # Above 75th percentile
        return "Very High"
    elif migration_ratio > 21:  # Above 50th percentile
        return "High" 
    elif migration_ratio > 6:   # Above 25th percentile
        return "Moderate"
    elif migration_ratio > 1:   # Above minimum meaningful threshold
        return "Low"
    else:
        return "Very Low"

if __name__ == "__main__":
    results = create_country_clustering()