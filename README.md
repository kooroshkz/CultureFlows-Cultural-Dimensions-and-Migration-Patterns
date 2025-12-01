# CultureFlows - Interactive Cultural Dimensions & Migration Dashboard

A modern, interactive web dashboard for exploring cultural dimensions and migration patterns across countries.

## Features

### Interactive World Map
- **Color-coded countries** based on migration rates with adjustable transparency (30% to 70%)
- **Year slider** to explore data from 1990 to 2024 in 5-year increments
- **Migration filter** to view All, Male, or Female immigration data
- **Click-to-select** countries for detailed analysis

### Cultural Dimensions Analysis
- **Radar charts** displaying Hofstede's 6 cultural dimensions:
  - Power Distance Index (PDI)
  - Individualism vs Collectivism (IDV)
  - Masculinity vs Femininity (MAS)
  - Uncertainty Avoidance Index (UAI)
  - Long-term vs Short-term Orientation (LTO)
  - Indulgence vs Restraint (IVR)

### Migration Trends
- **Line charts** showing migration trends over time
- **Comparative analysis** between selected countries
- **Dynamic filtering** by gender and time period

### Detailed Data Comparison
- **Side-by-side comparison** of up to 2 countries
- **Comprehensive metrics** including cultural dimensions and migration statistics
- **Growth calculations** and trend indicators

##  Quick Start

### Local Development
```bash
# Start development server (serves from /docs)
python3 dev_server.py

# Open browser to http://localhost:8000
```


## 📁 Project Structure

```
CultureFlows/
├── docs/                   # GitHub Pages website (single source of truth)
│   ├── index.html          # Main HTML file
│   ├── assets/
│   │   ├── styles.css      # Modern CSS styling
│   │   └── app.js         # Main application logic
│   ├── components/
│   │   ├── world-map.js   # Interactive world map component
│   │   ├── cultural-chart.js # Radar chart for cultural dimensions
│   │   ├── migration-chart.js # Line chart for migration trends
│   │   └── data-table.js  # Detailed data comparison table
│   └── data/
│       └── masterdata.csv # Processed cultural and migration data
├── src/                    # Data processing and analysis scripts
├── dev_server.py          # Local development server (serves from /docs)
└── README.md             # This file
```

## Technology Stack

- **Frontend**: Vanilla JavaScript, Web Components, CSS3, HTML5
- **Visualization**: D3.js v7, Canvas API for charts
- **Map Data**: TopoJSON world atlas
- **Styling**: Modern CSS with custom properties, responsive design
- **Hosting**: GitHub Pages compatible (static files only)

## Data Sources

- **Cultural Dimensions**: Hofstede's cultural dimensions theory
- **Migration Data**: Processed immigration statistics by country, year, and gender
- **Geographic Data**: World topology from Natural Earth
