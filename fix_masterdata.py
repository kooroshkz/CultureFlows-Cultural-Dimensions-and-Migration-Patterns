import pandas as pd
import re

def clean_country_name(name):
    """Clean country names by removing asterisks and content in parentheses"""
    # Remove asterisks
    name = name.replace('*', '')
    
    # Remove content in parentheses
    name = re.sub(r'\s*\([^)]*\)', '', name)
    
    # Clean up extra spaces
    name = name.strip()
    
    return name

def fix_masterdata():
    # Load the current masterdata
    df = pd.read_csv('src/output/masterdata.csv')
    
    print(f"Original data shape: {df.shape}")
    print("\nCountries with asterisks or parentheses:")
    
    # Clean country names
    original_names = df['country'].tolist()
    cleaned_names = []
    
    for name in original_names:
        clean_name = clean_country_name(name)
        if clean_name != name:
            print(f"  {name} -> {clean_name}")
        cleaned_names.append(clean_name)
    
    # Update the dataframe
    df['country'] = cleaned_names
    
    # Check for duplicates after cleaning
    duplicates = df['country'].duplicated()
    if duplicates.any():
        print(f"\nWarning: Found {duplicates.sum()} duplicate countries after cleaning:")
        for dup in df[duplicates]['country'].values:
            print(f"  - {dup}")
    
    # Convert numerical columns to integers (removing decimal points)
    numerical_columns = ['pdi', 'idv', 'mas', 'uai'] + [col for col in df.columns if col.startswith(('199', '200', '201', '202'))]
    
    for col in numerical_columns:
        if col in df.columns:
            # Convert to numeric, handle missing values
            df[col] = pd.to_numeric(df[col], errors='coerce')
            if col in ['pdi', 'idv', 'mas', 'uai']:
                df[col] = df[col].astype('Int64')  # Nullable integer type
            else:
                df[col] = df[col].fillna(0).astype(int)
    
    # Handle lto and ivr columns (they may have missing values)
    for col in ['lto', 'ivr']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            # Keep as float to preserve NaN values
    
    # Save without quotes around values
    df.to_csv('src/output/masterdata.csv', index=False, quoting=0)
    
    print(f"\nFixed masterdata saved!")
    print(f"Final shape: {df.shape}")
    print(f"\nSample of cleaned data:")
    print(df[['country', 'continent', 'pdi', 'idv', '1990', '2024']].head())
    
    return df

def fetch_population_data():
    """Fetch population data for all countries using REST Countries API"""
    import requests
    import time
    
    # Load current masterdata
    df = pd.read_csv('src/output/masterdata.csv')
    
    # Country name mappings for API compatibility
    country_mappings = {
        'United States': 'United States of America',
        'South Korea': 'Korea',
        'North Korea': 'Korea',
        'Czech Republic': 'Czechia',
        'Russia': 'Russian Federation',
        'Bosnia and Herzegovina': 'Bosnia',
        'Trinidad and Tobago': 'Trinidad',
        'United Kingdom': 'United Kingdom of Great Britain and Northern Ireland',
        'Iran': 'Iran',  # Try simple name first
        'Venezuela': 'Venezuela',  # Try simple name first
        'North Macedonia': 'Macedonia',
        'Moldova': 'Moldova (Republic of)',
        'Syria': 'Syrian Arab Republic',
        'Palestine': 'Palestine, State of',
        'Vietnam': 'Viet Nam',
        'Laos': 'Lao People\'s Democratic Republic',
        'Tanzania': 'Tanzania, United Republic of',
        'Democratic Republic of Congo': 'Congo (Democratic Republic of the)',
        'Republic of Congo': 'Congo',
        'Ivory Coast': 'Côte d\'Ivoire',
        'South Sudan': 'South Sudan',
        'Central African Republic': 'Central African Republic'
    }
    
    population_data = {}
    failed_countries = []
    
    print("Fetching population data for all countries...")
    
    for index, row in df.iterrows():
        country = row['country']
        
        # Use mapped name if available
        api_country = country_mappings.get(country, country)
        
        try:
            # Make API request
            url = f"https://restcountries.com/v3.1/name/{api_country}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data and len(data) > 0:
                    population = data[0].get('population', 0)
                    population_data[country] = population
                    print(f"✓ {country}: {population:,}")
                else:
                    failed_countries.append(country)
                    print(f"✗ {country}: No data found")
            else:
                failed_countries.append(country)
                print(f"✗ {country}: API error {response.status_code}")
                
        except Exception as e:
            failed_countries.append(country)
            print(f"✗ {country}: Error - {str(e)}")
        
        # Add small delay to be respectful to the API
        time.sleep(0.1)
    
    # Handle failed countries with fallback data or manual values
    fallback_populations = {
        # Add manual population data for countries that fail API lookup
        # These are approximate 2024 populations
        'Palestine': 5371230,
        'Taiwan': 23588932,
        'Kosovo': 1873160,
        'Vatican City': 825,
        'North Korea': 25971909,
        'South Sudan': 11381378,
        'Iran': 85963481,  # 2024 estimate
        'Venezuela': 28199867,  # 2024 estimate
        'South America': 0,  # This is a region, not a country - set to 0
        'India': 1450935791,  # 2024 estimate (the API returned 0 for some reason)
    }
    
    for country in failed_countries:
        if country in fallback_populations:
            population_data[country] = fallback_populations[country]
            print(f"📝 {country}: Using fallback population {fallback_populations[country]:,}")
        else:
            population_data[country] = 0
            print(f"❌ {country}: No population data available")
    
    # Add population column to dataframe
    df['population'] = df['country'].map(population_data).fillna(0).astype(int)
    
    # Save updated CSV
    df.to_csv('src/output/masterdata.csv', index=False, quoting=0)
    
    print(f"\n✅ Population data added successfully!")
    print(f"Countries processed: {len(population_data)}")
    print(f"Failed countries: {len(failed_countries)}")
    print(f"Updated masterdata.csv saved to src/output/")
    
    return df, failed_countries

def fix_population_data():
    """Fix incorrect population values with correct 2024 estimates"""
    df = pd.read_csv('src/output/masterdata.csv')
    
    # Correct population fixes
    population_corrections = {
        'India': 1450935791,        # 2024 estimate
        'Iran': 85963481,           # 2024 estimate
        'Netherlands': 17533405,    # 2024 estimate
        'South America': 0,         # Region, not country
    }
    
    print("Fixing incorrect population values...")
    for country, correct_pop in population_corrections.items():
        if country in df['country'].values:
            old_pop = df.loc[df['country'] == country, 'population'].iloc[0]
            df.loc[df['country'] == country, 'population'] = correct_pop
            print(f"✓ {country}: {old_pop:,} → {correct_pop:,}")
    
    # Save corrected data
    df.to_csv('src/output/masterdata.csv', index=False, quoting=0)
    print("\n✅ Population corrections saved!")
    return df

if __name__ == "__main__":
    print("=== Fixing masterdata ===")
    df = fix_masterdata()
    
    print("\n" + "="*50)
    print("=== Fetching population data ===")
    df_with_pop, failed = fetch_population_data()
    
    print("\n" + "="*50)
    print("=== Fixing population corrections ===")
    df_final = fix_population_data()
    
    print("\n" + "="*50)
    print("=== Final Summary ===")
    print(f"Total countries: {len(df_final)}")
    print(f"Countries with population data: {(df_final['population'] > 0).sum()}")
    print(f"Average population: {df_final[df_final['population'] > 0]['population'].mean():,.0f}")
    print("\nTop 10 most populous countries:")
    print(df_final.nlargest(10, 'population')[['country', 'population', 'continent']].to_string(index=False))