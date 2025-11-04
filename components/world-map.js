/**
 * World Map Component
 * Interactive SVG world map with migration data visualization
 */

class WorldMapComponent {
    constructor(selector, options = {}) {
        this.container = d3.select(selector);
        this.options = {
            onCountryClick: options.onCountryClick || (() => {}),
            data: options.data || []
        };
        
        this.width = 800;
        this.height = 500;
        this.selectedCountries = [];
        this.colorData = new Map();
        
        this.init();
    }

    async init() {
        try {
            await this.loadWorldData();
            this.setupSVG();
            this.createMap();
            this.setupTooltip();
        } catch (error) {
            console.error('Failed to initialize world map:', error);
        }
    }

    async loadWorldData() {
        try {
            console.log('Loading world map data...');
            // Load world topology data from a CDN
            const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
            
            if (!response.ok) {
                throw new Error(`Failed to load world data: ${response.status}`);
            }
            
            this.worldData = await response.json();
            console.log('World map data loaded successfully');
        } catch (error) {
            console.warn('Failed to load world data, using fallback:', error);
            // Fallback: create a simple world map
            this.worldData = null;
        }
    }

    setupSVG() {
        // Clear any existing content
        this.container.selectAll('*').remove();
        
        // Create SVG with responsive viewBox
        this.svg = this.container
            .append('svg')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .style('width', '100%')
            .style('height', '100%');

        // Create projection
        this.projection = d3.geoNaturalEarth1()
            .scale(130)
            .translate([this.width / 2, this.height / 2]);

        this.path = d3.geoPath().projection(this.projection);

        // Create zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.5, 8])
            .on('zoom', (event) => {
                this.svg.selectAll('path')
                    .attr('transform', event.transform);
            });

        this.svg.call(this.zoom);

        // Create main group for countries
        this.countriesGroup = this.svg.append('g').attr('class', 'countries');
    }

    createMap() {
        if (this.worldData) {
            this.createWorldMap();
        } else {
            this.createFallbackMap();
        }
    }

    createWorldMap() {
        const countries = topojson.feature(this.worldData, this.worldData.objects.countries);
        
        this.countriesGroup
            .selectAll('path')
            .data(countries.features)
            .enter()
            .append('path')
            .attr('class', 'country')
            .attr('d', this.path)
            .attr('fill', '#e2e8f0')
            .attr('stroke', '#cbd5e1')
            .attr('stroke-width', 0.5)
            .style('cursor', 'pointer')
            .on('mouseover', (event, d) => this.handleMouseOver(event, d))
            .on('mouseout', (event, d) => this.handleMouseOut(event, d))
            .on('click', (event, d) => this.handleClick(event, d));
    }

    createFallbackMap() {
        console.log('Creating fallback map...');
        
        // Simple fallback visualization - create rectangles for major regions
        const regions = [
            { name: 'North America', x: 100, y: 150, width: 200, height: 100, countries: ['United States', 'Canada', 'Mexico'] },
            { name: 'South America', x: 200, y: 300, width: 120, height: 150, countries: ['Brazil', 'Argentina', 'Chile'] },
            { name: 'Europe', x: 400, y: 120, width: 100, height: 80, countries: ['Germany', 'France', 'United Kingdom'] },
            { name: 'Africa', x: 420, y: 200, width: 120, height: 200, countries: ['Ethiopia', 'Kenya', 'Nigeria', 'Egypt'] },
            { name: 'Asia', x: 500, y: 100, width: 200, height: 200, countries: ['China', 'India', 'Japan'] },
            { name: 'Oceania', x: 650, y: 350, width: 80, height: 60, countries: ['Australia', 'New Zealand'] }
        ];

        this.countriesGroup
            .selectAll('rect')
            .data(regions)
            .enter()
            .append('rect')
            .attr('class', 'country fallback')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('width', d => d.width)
            .attr('height', d => d.height)
            .attr('fill', '#e2e8f0')
            .attr('stroke', '#cbd5e1')
            .attr('stroke-width', 1)
            .attr('rx', 5)
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                // Cycle through countries in the region
                const availableCountries = d.countries.filter(country => 
                    this.options.data.find(dataCountry => dataCountry.country === country)
                );
                
                if (availableCountries.length > 0) {
                    const randomCountry = availableCountries[Math.floor(Math.random() * availableCountries.length)];
                    this.options.onCountryClick(randomCountry);
                }
            })
            .on('mouseover', (event, d) => this.handleMouseOver(event, d))
            .on('mouseout', (event, d) => this.handleMouseOut(event, d));

        // Add region labels
        this.countriesGroup
            .selectAll('text')
            .data(regions)
            .enter()
            .append('text')
            .attr('x', d => d.x + d.width / 2)
            .attr('y', d => d.y + d.height / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#64748b')
            .attr('font-size', '12px')
            .attr('font-weight', '500')
            .style('pointer-events', 'none')
            .text(d => d.name);
    }

    setupTooltip() {
        this.tooltip = d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.9)')
            .style('color', 'white')
            .style('padding', '8px 12px')
            .style('border-radius', '6px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('z-index', 1000);
    }

    handleMouseOver(event, d) {
        const countryName = this.getCountryName(d);
        const migrationValue = this.getMigrationValue(countryName);
        
        // Highlight country/region
        d3.select(event.currentTarget)
            .attr('stroke', '#2563eb')
            .attr('stroke-width', 2);

        // Show tooltip
        let tooltipContent = `<strong>${countryName}</strong>`;
        
        if (d.countries) {
            // Fallback region
            tooltipContent += `<br/>Click to select a country`;
        } else {
            // Real country
            tooltipContent += `<br/>Migration: ${window.CultureFlowsUtils?.formatNumber(migrationValue) || migrationValue}`;
        }
        
        this.tooltip
            .style('opacity', 1)
            .html(tooltipContent)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
    }

    handleMouseOut(event, d) {
        const countryName = this.getCountryName(d);
        const isSelected = this.selectedCountries.includes(countryName);
        
        // Reset country appearance if not selected
        if (!isSelected) {
            d3.select(event.currentTarget)
                .attr('stroke', '#cbd5e1')
                .attr('stroke-width', 0.5);
        }

        // Hide tooltip
        this.tooltip.style('opacity', 0);
    }

    handleClick(event, d) {
        const countryName = this.getCountryName(d);
        this.options.onCountryClick(countryName);
    }

    getCountryName(d) {
        // Handle fallback regions
        if (d.name && d.countries) {
            return d.name;
        }
        
        // Try to match country name from properties
        if (d.properties) {
            return d.properties.NAME || d.properties.NAME_EN || d.properties.name || 'Unknown';
        }
        return d.name || 'Unknown';
    }

    getMigrationValue(countryName) {
        return this.colorData.get(countryName) || 0;
    }

    updateColors(migrationValues, minValue, maxValue) {
        // Update color data map
        this.colorData.clear();
        migrationValues.forEach(d => {
            this.colorData.set(d.country, d.value);
        });

        // Update country colors
        this.countriesGroup
            .selectAll('.country')
            .attr('fill', (d) => {
                const countryName = this.getCountryName(d);
                const value = this.getMigrationValue(countryName);
                
                if (value === 0) return '#f1f5f9';
                
                return window.CultureFlowsUtils?.getColorScale(value, minValue, maxValue) || '#e2e8f0';
            });
    }

    updateSelection(selectedCountries) {
        this.selectedCountries = selectedCountries;
        
        // Update all countries
        this.countriesGroup
            .selectAll('.country')
            .attr('stroke', (d) => {
                const countryName = this.getCountryName(d);
                return this.selectedCountries.includes(countryName) ? '#2563eb' : '#cbd5e1';
            })
            .attr('stroke-width', (d) => {
                const countryName = this.getCountryName(d);
                return this.selectedCountries.includes(countryName) ? 2 : 0.5;
            });
    }

    // Public methods for external control
    zoomToCountry(countryName) {
        const country = this.countriesGroup
            .selectAll('.country')
            .filter(d => this.getCountryName(d) === countryName);
        
        if (!country.empty()) {
            const bounds = this.path.bounds(country.datum());
            const dx = bounds[1][0] - bounds[0][0];
            const dy = bounds[1][1] - bounds[0][1];
            const x = (bounds[0][0] + bounds[1][0]) / 2;
            const y = (bounds[0][1] + bounds[1][1]) / 2;
            const scale = Math.min(8, 0.9 / Math.max(dx / this.width, dy / this.height));
            const translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];

            this.svg.transition()
                .duration(750)
                .call(this.zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
        }
    }

    resetZoom() {
        this.svg.transition()
            .duration(750)
            .call(this.zoom.transform, d3.zoomIdentity);
    }
}

// Make component available globally
window.WorldMapComponent = WorldMapComponent;