# CultureFlows - Interactive Cultural Dimensions & Migration Dashboard

A modern, interactive web dashboard for exploring cultural dimensions and migration patterns across countries.

## 🌟 Features

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

## 🚀 Quick Start

### Local Development
```bash
# Navigate to website directory
cd website

# Start development server
python3 dev_server.py

# Open browser to http://localhost:8000
```

### GitHub Pages Deployment
1. Push the `website` folder contents to your GitHub repository
2. Enable GitHub Pages in repository settings
3. Select the branch containing your website files
4. Your dashboard will be available at `https://yourusername.github.io/repository-name`

## 📁 Project Structure

```
website/
├── index.html              # Main HTML file
├── assets/
│   ├── styles.css          # Modern CSS styling
│   └── app.js             # Main application logic
├── components/
│   ├── world-map.js       # Interactive world map component
│   ├── cultural-chart.js  # Radar chart for cultural dimensions
│   ├── migration-chart.js # Line chart for migration trends
│   └── data-table.js      # Detailed data comparison table
├── data/
│   └── masterdata.csv     # Processed cultural and migration data
├── dev_server.py          # Local development server
└── README.md             # This file
```

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript, Web Components, CSS3, HTML5
- **Visualization**: D3.js v7, Canvas API for charts
- **Map Data**: TopoJSON world atlas
- **Styling**: Modern CSS with custom properties, responsive design
- **Hosting**: GitHub Pages compatible (static files only)

## 🎨 Design Features

- **Modern UI** with clean, professional aesthetics
- **Responsive design** that works on desktop, tablet, and mobile
- **Smooth animations** and transitions
- **Interactive tooltips** and hover effects
- **Accessible color scheme** with proper contrast ratios
- **Loading states** and error handling

## 📊 Data Sources

- **Cultural Dimensions**: Hofstede's cultural dimensions theory
- **Migration Data**: Processed immigration statistics by country, year, and gender
- **Geographic Data**: World topology from Natural Earth

## 🔧 Customization

### Changing Colors
Edit the CSS custom properties in `assets/styles.css`:
```css
:root {
    --primary-color: #2563eb;    /* Main brand color */
    --accent-color: #06b6d4;     /* Accent highlights */
    /* ... other color variables */
}
```

### Adding New Metrics
1. Update the data processing in `assets/app.js`
2. Modify the chart components to handle new data types
3. Add new rows to the data table component

### Map Customization
The world map component supports:
- Custom color schemes
- Different map projections
- Zoom and pan interactions
- Country selection modes

## 🌍 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📱 Mobile Experience

The dashboard is fully responsive and optimized for mobile devices:
- Touch-friendly interface
- Optimized layouts for small screens
- Smooth gesture support for map interactions

## ⚡ Performance

- **Optimized rendering** with efficient D3.js patterns
- **Lazy loading** of map data
- **Debounced interactions** for smooth performance
- **Minimal dependencies** for fast loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- Hofstede Insights for cultural dimensions framework
- Natural Earth for world geographic data
- D3.js community for visualization tools
- GitHub Pages for free hosting