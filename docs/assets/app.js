/**
 * CultureFlows - Main Application
 * Interactive dashboard for cultural dimensions and migration patterns
 */

class CultureFlowsApp {
    constructor() {
        this.data = null;
        this.selectedCountries = { primary: null, secondary: null };
        this.currentYear = 2024;
        this.currentFilter = 'all';
        this.migrationData = {};
        this.culturalDimensions = ['pdi', 'idv', 'mas', 'uai', 'lto', 'ivr'];
        
        this.init();
    }

    async init() {
        try {
            this.updateLoadingText('Loading data...');
            await this.loadData();
            
            this.updateLoadingText('Setting up components...');
            this.setupEventListeners();
            
            this.updateLoadingText('Initializing visualization...');
            this.initializeComponents();
            
            this.updateLoadingText('Ready!');
            setTimeout(() => this.hideLoading(), 500);
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load application: ' + error.message);
        }
    }

    updateLoadingText(text) {
        const loadingText = document.getElementById('loading-text');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    async loadData() {
        try {
            console.log('Loading CSV data...');
            const response = await fetch('./data/masterdata.csv');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const csvText = await response.text();
            console.log('CSV loaded, parsing...');
            
            this.data = this.parseCSV(csvText);
            
            if (!this.data || this.data.length === 0) {
                throw new Error('No data found in CSV file');
            }
            
            console.log('Data parsed successfully:', this.data.length, 'countries');
            this.processData();
            console.log('Data processing complete');
            
        } catch (error) {
            console.error('Error loading data:', error);
            throw new Error('Failed to load CSV data: ' + error.message);
        }
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Skip empty lines
            
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            
            headers.forEach((header, index) => {
                const value = values[index] || '';
                
                // Check if this is a numeric column (year data or cultural dimensions)
                if (header.match(/^\d{4}/) || this.culturalDimensions.includes(header)) {
                    row[header] = value && !isNaN(parseFloat(value)) ? parseFloat(value) : 0;
                } else {
                    row[header] = value;
                }
            });
            
            // Only add rows that have a country name
            if (row.country && row.country.trim()) {
                data.push(row);
            }
        }

        console.log(`Parsed ${data.length} countries from CSV`);
        return data;
    }

    processData() {
        try {
            // Extract migration years and build migration data structure
            const migrationYears = ['1990', '1995', '2000', '2005', '2010', '2015', '2020', '2024'];
            
            this.data.forEach(country => {
                const countryName = country.country;
                if (!countryName) return;
                
                this.migrationData[countryName] = {
                    all: {},
                    male: {},
                    female: {}
                };

                migrationYears.forEach(year => {
                    this.migrationData[countryName].all[year] = country[year] || 0;
                    this.migrationData[countryName].male[year] = country[`${year}_male`] || 0;
                    this.migrationData[countryName].female[year] = country[`${year}_female`] || 0;
                });
            });
            
            console.log('Migration data processed for', Object.keys(this.migrationData).length, 'countries');
        } catch (error) {
            console.error('Error processing data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Year slider
        const yearSlider = document.getElementById('year-slider');
        const yearDisplay = document.getElementById('year-display');
        
        yearSlider.addEventListener('input', (e) => {
            this.currentYear = parseInt(e.target.value);
            yearDisplay.textContent = this.currentYear;
            this.updateMapColors();
        });

        // Migration filter
        const migrationFilter = document.getElementById('migration-filter');
        migrationFilter.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.updateMapColors();
        });

        // Clear selection button
        const clearBtn = document.getElementById('clear-selection');
        clearBtn.addEventListener('click', () => {
            this.clearSelection();
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            if (this.culturalChart) {
                this.culturalChart.resize();
            }
        });
    }

    initializeComponents() {
        console.log('Initializing components...');
        
        // Initialize world map with fallback
        try {
            if (window.WorldMapComponent) {
                console.log('Creating world map component...');
                this.worldMap = new WorldMapComponent('#world-map', {
                    onCountryClick: (countryName) => this.selectCountry(countryName),
                    data: this.data
                });
            } else {
                console.warn('WorldMapComponent not available, creating fallback');
                this.createFallbackMap();
            }
        } catch (error) {
            console.error('Failed to create world map:', error);
            this.createFallbackMap();
        }

        // Initialize charts with fallbacks
        try {
            if (window.CulturalChartComponent) {
                console.log('Creating cultural chart component...');
                this.culturalChart = new CulturalChartComponent('#cultural-chart');
            }
        } catch (error) {
            console.error('Failed to create cultural chart:', error);
        }

        try {
            if (window.MigrationChartComponent) {
                console.log('Creating migration chart component...');
                this.migrationChart = new MigrationChartComponent('#migration-chart');
            }
        } catch (error) {
            console.error('Failed to create migration chart:', error);
        }

        try {
            if (window.DataTableComponent) {
                console.log('Creating data table component...');
                this.dataTable = new DataTableComponent('#data-table');
            }
        } catch (error) {
            console.error('Failed to create data table:', error);
        }

        // Initialize country insights
        try {
            if (window.CountryInsights) {
                console.log('Creating country insights component...');
                this.countryInsights = new CountryInsights('country-insights');
            }
        } catch (error) {
            console.error('Failed to create country insights:', error);
        }

        // Initial map update
        setTimeout(() => {
            console.log('Updating initial map colors...');
            this.updateMapColors();
        }, 1000); // Give components time to initialize
    }

    createFallbackMap() {
        console.log('Creating fallback interactive map...');
        const mapContainer = document.querySelector('#world-map');
        if (!mapContainer) return;

        // Clear existing content
        mapContainer.innerHTML = '';

        // Create simple interactive map
        const svg = d3.select('#world-map');
        svg.attr('viewBox', '0 0 800 500')
           .style('width', '100%')
           .style('height', '100%');

        const g = svg.append('g');

        // Sample countries from our data
        const sampleCountries = this.data.slice(0, 10).map((country, i) => ({
            name: country.country,
            x: 100 + (i % 5) * 150,
            y: 150 + Math.floor(i / 5) * 100,
            data: country
        }));

        // Draw countries as interactive circles
        g.selectAll('circle')
         .data(sampleCountries)
         .enter()
         .append('circle')
         .attr('cx', d => d.x)
         .attr('cy', d => d.y)
         .attr('r', 25)
         .attr('fill', '#2563eb')
         .attr('opacity', 0.7)
         .attr('stroke', '#ffffff')
         .attr('stroke-width', 2)
         .style('cursor', 'pointer')
         .on('click', (event, d) => this.selectCountry(d.name))
         .on('mouseover', function(event, d) {
             d3.select(this).attr('opacity', 1).attr('r', 30);
         })
         .on('mouseout', function(event, d) {
             d3.select(this).attr('opacity', 0.7).attr('r', 25);
         });

        // Add country labels
        g.selectAll('text')
         .data(sampleCountries)
         .enter()
         .append('text')
         .attr('x', d => d.x)
         .attr('y', d => d.y + 40)
         .attr('text-anchor', 'middle')
         .attr('font-size', '11px')
         .attr('font-weight', 'bold')
         .attr('fill', '#374151')
         .text(d => d.name);

        console.log('Fallback map created with', sampleCountries.length, 'countries');
    }

    selectCountry(countryName) {
        const countryData = this.data.find(d => d.country === countryName);
        if (!countryData) return;

        if (!this.selectedCountries.primary) {
            this.selectedCountries.primary = countryData;
            this.updateCountryDisplay('country-1', countryData);
        } else if (!this.selectedCountries.secondary && countryData.country !== this.selectedCountries.primary.country) {
            this.selectedCountries.secondary = countryData;
            this.updateCountryDisplay('country-2', countryData);
        } else if (countryData.country !== this.selectedCountries.primary.country) {
            // Replace secondary country
            this.selectedCountries.secondary = countryData;
            this.updateCountryDisplay('country-2', countryData);
        }

        this.updateCharts();
        this.updateDataTable();
        this.updateMapSelection();
        this.updateInsights();
    }

    updateCountryDisplay(elementId, countryData) {
        const element = document.getElementById(elementId);
        element.classList.add('active');
        
        element.innerHTML = `
            <div class="country-info">
                <div class="country-flag">${this.getCountryFlag(countryData.country)}</div>
                <div class="country-name">${countryData.country}</div>
                <div class="country-region">${countryData.region}</div>
            </div>
        `;
    }

    updateMapColors() {
        if (!this.worldMap) return;

        // Get migration values for current year and filter
        const migrationValues = this.data.map(country => {
            const key = this.currentFilter === 'all' ? 
                this.currentYear.toString() : 
                `${this.currentYear}_${this.currentFilter}`;
            return {
                country: country.country,
                value: country[key] || 0
            };
        });

        // Calculate min/max for color scaling
        const values = migrationValues.map(d => d.value).filter(v => v > 0);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);

        // Update map colors
        this.worldMap.updateColors(migrationValues, minValue, maxValue);
    }

    updateMapSelection() {
        if (!this.worldMap) return;
        
        const selectedCountries = [
            this.selectedCountries.primary?.country,
            this.selectedCountries.secondary?.country
        ].filter(Boolean);
        
        this.worldMap.updateSelection(selectedCountries);
    }

    updateCharts() {
        if (this.culturalChart) {
            const countries = [this.selectedCountries.primary, this.selectedCountries.secondary].filter(Boolean);
            this.culturalChart.update(countries, this.culturalDimensions);
        }

        if (this.migrationChart) {
            const countries = [this.selectedCountries.primary, this.selectedCountries.secondary].filter(Boolean);
            this.migrationChart.update(countries, this.migrationData, this.currentFilter);
        }
    }

    updateDataTable() {
        if (this.dataTable) {
            const countries = [this.selectedCountries.primary, this.selectedCountries.secondary].filter(Boolean);
            this.dataTable.update(countries, this.migrationData, this.currentYear, this.currentFilter);
        }

        // Update table headers
        const country1Header = document.getElementById('country1-header');
        const country2Header = document.getElementById('country2-header');
        
        country1Header.textContent = this.selectedCountries.primary?.country || 'Country 1';
        country2Header.textContent = this.selectedCountries.secondary?.country || 'Country 2';
    }

    updateInsights() {
        if (this.countryInsights) {
            const selectedCountries = [
                this.selectedCountries.primary?.country,
                this.selectedCountries.secondary?.country
            ].filter(Boolean);
            
            this.countryInsights.highlightCountries(selectedCountries);
        }
    }

    clearSelection() {
        this.selectedCountries = { primary: null, secondary: null };
        
        // Reset country displays
        ['country-1', 'country-2'].forEach(id => {
            const element = document.getElementById(id);
            element.classList.remove('active');
            element.innerHTML = `
                <div class="country-placeholder">
                    <span class="placeholder-icon">🌐</span>
                    <p>${id === 'country-1' ? 'Click on a country to view data' : 'Click another country to compare'}</p>
                </div>
            `;
        });

        // Clear charts and table
        this.updateCharts();
        this.updateDataTable();
        this.updateMapSelection();
        this.updateInsights();
    }

    getCountryFlag(countryName) {
        // Comprehensive flag mapping for all countries in dataset
        const flagMap = {
            // Africa
            'Algeria': '🇩🇿',
            'Angola': '🇦🇴',
            'Burkina Faso': '🇧🇫',
            'Egypt': '🇪🇬',
            'Ethiopia': '🇪🇹',
            'Ghana': '🇬🇭',
            'Kenya': '🇰🇪',
            'Libya': '🇱🇾',
            'Malawi': '🇲🇼',
            'Morocco': '🇲🇦',
            'Mozambique': '🇲🇿',
            'Namibia': '🇳🇦',
            'Nigeria': '🇳🇬',
            'Senegal': '🇸🇳',
            'Sierra Leone': '🇸🇱',
            'Tanzania': '🇹🇿',
            'Tunisia': '🇹🇳',
            'Zambia': '🇿🇲',
            
            // Asia
            'Armenia': '🇦🇲',
            'Azerbaijan': '🇦🇿',
            'Bangladesh': '🇧🇩',
            'Bhutan': '🇧🇹',
            'China': '🇨🇳',
            'Georgia': '🇬🇪',
            'Hong Kong': '🇭🇰',
            'India': '🇮🇳',
            'Indonesia': '🇮🇩',
            'Iran': '🇮🇷',
            'Iraq': '🇮🇶',
            'Israel': '🇮🇱',
            'Japan': '🇯🇵',
            'Jordan': '🇯🇴',
            'Kazakhstan': '🇰🇿',
            'Kuwait': '🇰🇼',
            'Lebanon': '🇱🇧',
            'Malaysia': '🇲🇾',
            'Mongolia': '🇲🇳',
            'Nepal': '🇳🇵',
            'Pakistan': '🇵🇰',
            'Philippines': '🇵🇭',
            'Qatar': '🇶🇦',
            'Republic of Korea': '🇰🇷',
            'Saudi Arabia': '🇸🇦',
            'Singapore': '🇸🇬',
            'Sri Lanka': '🇱🇰',
            'Syrian Arab Republic': '🇸🇾',
            'Taiwan': '🇹🇼',
            'Thailand': '🇹🇭',
            'Türkiye': '🇹🇷',
            'United Arab Emirates': '🇦🇪',
            'Viet Nam': '🇻🇳',
            
            // Europe
            'Albania': '🇦🇱',
            'Austria': '🇦🇹',
            'Belarus': '🇧🇾',
            'Belgium': '🇧🇪',
            'Bosnia and Herzegovina': '��',
            'Bulgaria': '🇧🇬',
            'Croatia': '🇭🇷',
            'Czechia': '🇨�',
            'Denmark': '🇩🇰',
            'Estonia': '�🇪',
            'Finland': '🇫�🇮',
            'France': '�🇷',
            'Germany': '🇩🇪',
            'Greece': '🇬🇷',
            'Hungary': '🇭🇺',
            'Iceland': '🇮🇸',
            'Ireland': '🇮🇪',
            'Italy': '🇮🇹',
            'Latvia': '🇱🇻',
            'Lithuania': '🇱🇹',
            'Luxembourg': '🇱🇺',
            'Malta': '🇲🇹',
            'Montenegro': '��',
            'Netherlands': '🇳🇱',
            'North Macedonia': '��',
            'Norway': '🇳🇴',
            'Poland': '��',
            'Portugal': '🇵🇹',
            'Republic of Moldova': '🇲🇩',
            'Romania': '��',
            'Russian Federation': '🇷🇺',
            'Serbia': '🇷🇸',
            'Slovenia': '🇸🇮',
            'Spain': '🇪🇸',
            'Sweden': '🇸🇪',
            'Switzerland': '🇨🇭',
            'Ukraine': '🇺🇦',
            'United Kingdom': '🇬🇧',
            
            // North America
            'Canada': '🇨🇦',
            'Costa Rica': '��',
            'Dominican Republic': '🇩🇴',
            'El Salvador': '🇸🇻',
            'Guatemala': '🇬🇹',
            'Honduras': '��',
            'Jamaica': '🇯🇲',
            'Mexico': '🇲🇽',
            'Panama': '🇵🇦',
            'Puerto Rico': '🇵🇷',
            'Trinidad and Tobago': '�🇹',
            'United States of America': '🇺🇸',
            
            // South America
            'Argentina': '🇦🇷',
            'Bolivia': '🇧🇴',
            'Brazil': '🇧🇷',
            'Chile': '🇨🇱',
            'Colombia': '🇨�',
            'Ecuador': '🇪🇨',
            'Paraguay': '🇵🇾',
            'Peru': '🇵🇪',
            'Suriname': '��',
            'Uruguay': '🇺🇾',
            'Venezuela': '🇻🇪',
            
            // Oceania
            'Australia': '🇦🇺',
            'Fiji': '🇫🇯',
            'New Zealand': '��',
            
            // Special cases
            'South America': '�' // This is a region, not a country
        };
        
        return flagMap[countryName] || '🌍';
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 300);
    }

    showError(message) {
        const loadingOverlay = document.getElementById('loading-overlay');
        const errorOverlay = document.getElementById('error-overlay');
        const errorText = document.getElementById('error-text');
        
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        if (errorOverlay && errorText) {
            errorText.textContent = message;
            errorOverlay.classList.remove('hidden');
            errorOverlay.style.display = 'flex';
        }
        
        console.error('App Error:', message);
    }
}

// Utility functions
window.CultureFlowsUtils = {
    formatNumber: (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString();
    },

    getColorScale: (value, min, max, opacity = 0.7) => {
        if (max === min) return `rgba(37, 99, 235, ${opacity})`;
        
        const normalized = (value - min) / (max - min);
        const finalOpacity = 0.3 + (normalized * 0.4); // Scale from 0.3 to 0.7
        return `rgba(37, 99, 235, ${finalOpacity})`;
    },

    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CultureFlowsApp();
});