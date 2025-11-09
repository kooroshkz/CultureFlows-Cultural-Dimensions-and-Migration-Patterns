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
    cluster_colors = ['#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#F39C12', '#1ABC9C', '#E67E22', '#34495E']
    
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

def determine_cluster_profile(cultural_means, migration_level):
    """
    Determine cluster profile based on all 6 Hofstede cultural dimensions
    """
    pdi = cultural_means['pdi']  # Power Distance
    idv = cultural_means['idv']  # Individualism
    mas = cultural_means['mas']  # Masculinity
    uai = cultural_means['uai']  # Uncertainty Avoidance  
    lto = cultural_means['lto']  # Long-term Orientation
    ivr = cultural_means['ivr']  # Indulgence vs Restraint
    
    # More comprehensive cultural categorization using all dimensions
    
    # Western Individualistic Patterns
    if idv > 80 and pdi < 45:
        if uai < 50 and mas > 60:
            name = "Anglo Individualistic"
            desc = "Very high individualism, competitive, low uncertainty avoidance"
        elif uai > 65:
            name = "Germanic Structured"
            desc = "High individualism but rule-oriented and structured"
        else:
            name = "Western Democratic"
            desc = "High individualism with democratic values"
    
    # Nordic Pattern
    elif idv > 65 and pdi < 35 and uai < 50 and ivr > 65:
        name = "Nordic Egalitarian"
        desc = "High individualism, very low hierarchy, flexible, indulgent"
    
    # East Asian Pattern
    elif idv < 30 and lto > 70:
        if pdi > 70:
            name = "East Asian Hierarchical"
            desc = "Collectivistic, hierarchical, long-term oriented"
        else:
            name = "East Asian Balanced"
            desc = "Collectivistic, moderate hierarchy, long-term focused"
    
    # Traditional/Conservative Patterns
    elif idv < 35 and pdi > 65:
        if uai > 70:
            name = "Traditional Conservative"
            desc = "Collectivistic, hierarchical, high uncertainty avoidance"
        elif mas > 60:
            name = "Patriarchal Traditional"
            desc = "Collectivistic, hierarchical, masculine values"
        else:
            name = "Community Hierarchical"
            desc = "Collectivistic, hierarchical but adaptable"
    
    # Latin Patterns
    elif idv < 45 and pdi > 55 and uai > 75:
        name = "Latin Structured"
        desc = "Collectivistic, hierarchical, very high uncertainty avoidance"
    
    # African/Communal Pattern
    elif idv < 25 and pdi > 60 and uai < 60:
        name = "Communal Flexible"
        desc = "Very collectivistic, hierarchical but adaptable"
    
    # Post-Soviet Pattern
    elif idv < 50 and pdi > 80 and uai > 85:
        name = "Post-Authoritarian"
        desc = "Collectivistic legacy, very high hierarchy, extremely structured"
    
    # Balanced/Moderate Patterns
    elif 35 <= idv <= 65 and 35 <= pdi <= 65:
        if lto > 65:
            name = "Balanced Long-term"
            desc = "Moderate individualism and hierarchy, long-term oriented"
        elif uai > 70:
            name = "Balanced Structured"
            desc = "Moderate values but high need for structure"
        else:
            name = "Balanced Democratic"
            desc = "Moderate values across cultural dimensions"
    
    # European Social Democratic
    elif idv > 55 and pdi < 50 and uai > 60 and ivr < 60:
        name = "European Social Democratic"
        desc = "Individualistic but structured, moderate hierarchy, restrained"
    
    # Default for unusual combinations
    else:
        # Determine dominant characteristics
        characteristics = []
        if idv > 60:
            characteristics.append("individualistic")
        elif idv < 30:
            characteristics.append("collectivistic")
        
        if pdi > 60:
            characteristics.append("hierarchical")
        elif pdi < 40:
            characteristics.append("egalitarian")
            
        if uai > 70:
            characteristics.append("structured")
        elif uai < 40:
            characteristics.append("flexible")
            
        if lto > 70:
            characteristics.append("long-term focused")
        elif lto < 30:
            characteristics.append("tradition-focused")
        
        name = "Mixed Cultural Pattern"
        desc = f"Unique combination: {', '.join(characteristics) if characteristics else 'balanced across dimensions'}"
    
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