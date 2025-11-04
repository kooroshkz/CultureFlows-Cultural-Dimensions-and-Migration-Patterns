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

if __name__ == "__main__":
    df = fix_masterdata()