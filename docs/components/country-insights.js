class CountryInsights {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.clusterData = null;
        this.init();
    }

    async init() {
        try {
            await this.loadClusterData();
            this.render();
        } catch (error) {
            console.error('Failed to initialize insights:', error);
            this.container.innerHTML = '<p style="color: red;">Failed to load insights data</p>';
        }
    }

    async loadClusterData() {
        try {
            // Try src/output first, then data folder as fallback
            let response;
            try {
                response = await fetch('src/output/clustering_results.json');
            } catch (e) {
                response = await fetch('data/clustering_results.json');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.clusterData = await response.json();
            console.log('Loaded cluster data:', this.clusterData);
        } catch (error) {
            console.error('Error loading clustering data:', error);
            throw error;
        }
    }

    render() {
        if (!this.clusterData || !this.clusterData.clusters || Object.keys(this.clusterData.clusters).length === 0) {
            this.container.innerHTML = '<p>No clustering data available</p>';
            return;
        }

        console.log('Rendering insights with clusters:', Object.keys(this.clusterData.clusters).length);

        this.container.innerHTML = `
            <div class="cluster-map-section">
                <div class="map-label">Cluster Distribution</div>
                <svg id="cluster-world-map" class="cluster-mini-map"></svg>
            </div>

            <div class="insights-analysis">
                <div class="cluster-grid-section">
                    <div class="cluster-grid-header">
                        <h4>Interactive Clusters</h4>
                        <p>Click on any cluster to view detailed analysis</p>
                    </div>
                    <div class="clusters-grid">
                        ${Object.entries(this.clusterData.clusters).map(([id, cluster]) => `
                            <div class="cluster-item" data-cluster-id="${id}" style="border: 2px solid ${cluster.color}; cursor: pointer;">
                                <div class="cluster-header" style="background: linear-gradient(135deg, ${cluster.color}15, ${cluster.color}05);">
                                    <div class="cluster-color-dot" style="background: ${cluster.color};"></div>
                                    <h5 style="color: ${cluster.color}; margin: 0;">${cluster.name}</h5>
                                </div>
                                <div class="cluster-summary-info">
                                    <div class="cluster-stat">
                                        <span class="stat-number">${cluster.size}</span>
                                        <span class="stat-label">Countries</span>
                                    </div>
                                    <div class="cluster-stat">
                                        <span class="migration-level-badge" style="background: ${cluster.color}; color: white;">${cluster.migration_level}</span>
                                        <span class="stat-label">${cluster.immigration_ratio_per_1000 ? cluster.immigration_ratio_per_1000.toFixed(1) : 'N/A'}/1000</span>
                                    </div>
                                </div>
                                <div class="cluster-examples">
                                    ${cluster.countries.slice(0, 3).join(' • ')}${cluster.countries.length > 3 ? '...' : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div id="cluster-details" class="cluster-details-panel" style="display: none;">
                    <div class="details-header">
                        <h4>Cluster Details</h4>
                        <button id="close-details" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b;">&times;</button>
                    </div>
                    <div id="cluster-details-content">
                        <!-- Detailed cluster information will be shown here -->
                    </div>
                </div>
            </div>
        `;

        console.log('Insights rendered successfully');
        
        // Render the cluster world map
        this.renderClusterWorldMap();
        
        // Setup map resize behavior
        this.setupMapResize();
        
        // Add event listeners for interactive features
        this.setupEventListeners();
    }

    renderClusterVisualization() {
        const canvas = document.getElementById('cluster-scatter');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        
        // Set canvas size
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width - 20;
        canvas.height = 300;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw scatter plot
        this.drawScatterPlot(ctx, canvas.width, canvas.height);
        
        // Render legend
        this.renderLegend();
    }

    drawScatterPlot(ctx, width, height) {
        const margin = { top: 20, right: 20, bottom: 40, left: 50 };
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;

        // Get PCA data ranges
        const pcaData = this.clusterData.countries;
        const xExtent = d3.extent(pcaData, d => d.pca_x);
        const yExtent = d3.extent(pcaData, d => d.pca_y);

        // Create scales
        const xScale = d3.scaleLinear()
            .domain(xExtent)
            .range([margin.left, margin.left + plotWidth]);
        
        const yScale = d3.scaleLinear()
            .domain(yExtent)
            .range([margin.top + plotHeight, margin.top]);

        // Draw axes
        this.drawAxes(ctx, xScale, yScale, margin, plotWidth, plotHeight);

        // Draw points
        pcaData.forEach(country => {
            const cluster = this.clusterData.clusters[country.cluster];
            const x = xScale(country.pca_x);
            const y = yScale(country.pca_y);

            ctx.fillStyle = cluster.color;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            
            // Add stroke for better visibility
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }

    drawAxes(ctx, xScale, yScale, margin, plotWidth, plotHeight) {
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.font = '12px Inter';
        ctx.fillStyle = '#666';

        // X-axis
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top + plotHeight);
        ctx.lineTo(margin.left + plotWidth, margin.top + plotHeight);
        ctx.stroke();

        // Y-axis
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, margin.top + plotHeight);
        ctx.stroke();

        // Axis labels
        ctx.textAlign = 'center';
        ctx.fillText('Principal Component 1', margin.left + plotWidth / 2, margin.top + plotHeight + 30);
        
        ctx.save();
        ctx.translate(20, margin.top + plotHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Principal Component 2', 0, 0);
        ctx.restore();
    }

    renderLegend() {
        const legendContainer = document.getElementById('cluster-legend');
        if (!legendContainer) return;

        const legendHTML = Object.entries(this.clusterData.clusters).map(([id, cluster]) => `
            <div class="legend-item" data-cluster="${id}">
                <div class="legend-color" style="background-color: ${cluster.color}"></div>
                <div class="legend-text">
                    <span class="legend-name">${cluster.name}</span>
                    <span class="legend-count">${cluster.size} countries</span>
                </div>
            </div>
        `).join('');

        legendContainer.innerHTML = legendHTML;
    }

    

    setupEventListeners() {
        // View toggle buttons
        const toggles = document.querySelectorAll('.viz-toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                toggles.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });

        // Legend hover effects
        const legendItems = document.querySelectorAll('.legend-item');
        legendItems.forEach(item => {
            item.addEventListener('mouseenter', (e) => {
                const clusterId = e.currentTarget.dataset.cluster;
                this.highlightCluster(clusterId);
            });

            item.addEventListener('mouseleave', () => {
                this.clearHighlights();
            });
        });

        // Resize observer for responsive canvas
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                this.renderClusterVisualization();
            });
            resizeObserver.observe(this.container);
        }
    }

    switchView(view) {
        if (view === 'clusters') {
            this.renderClusterView();
        } else {
            this.renderClusterVisualization();
        }
    }

    renderClusterView() {
        const canvas = document.getElementById('cluster-scatter');
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw cluster overview
        const clusters = Object.entries(this.clusterData.clusters);
        const radius = Math.min(canvas.width, canvas.height) / 3;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        clusters.forEach(([id, cluster], index) => {
            const angle = (index / clusters.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius * 0.7;
            const y = centerY + Math.sin(angle) * radius * 0.7;
            const size = Math.sqrt(cluster.size) * 3;
            
            // Draw cluster circle
            ctx.fillStyle = cluster.color;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw cluster label
            ctx.fillStyle = '#333';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(cluster.name, x, y + size + 15);
            ctx.fillText(`${cluster.size} countries`, x, y + size + 30);
        });
    }

    highlightCluster(clusterId) {
        const canvas = document.getElementById('cluster-scatter');
        const ctx = canvas.getContext('2d');
        
        // Redraw with highlighting
        this.renderClusterVisualization();
        
        // Add highlight overlay
        ctx.globalAlpha = 0.3;
        this.clusterData.countries.forEach(country => {
            if (country.cluster != clusterId) {
                const cluster = this.clusterData.clusters[country.cluster];
                const x = country.pca_x;
                const y = country.pca_y;
                
                // Draw dimmed overlay - this would need proper scaling
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1;
    }

    clearHighlights() {
        this.renderClusterVisualization();
    }

    // Public method to highlight countries from map selection
    highlightCountries(countries) {
        if (!countries || countries.length === 0) {
            this.clearHighlights();
            return;
        }

        const canvas = document.getElementById('cluster-scatter');
        const ctx = canvas.getContext('2d');
        
        // Find clusters of selected countries
        const selectedClusters = new Set();
        countries.forEach(country => {
            const countryData = this.clusterData.countries.find(c => c.country === country);
            if (countryData) {
                selectedClusters.add(countryData.cluster);
            }
        });

        // Highlight matching clusters in legend
        const legendItems = document.querySelectorAll('.legend-item');
        legendItems.forEach(item => {
            const clusterId = item.dataset.cluster;
            if (selectedClusters.has(parseInt(clusterId))) {
                item.classList.add('highlighted');
            } else {
                item.classList.remove('highlighted');
            }
        });
    }

    async renderClusterWorldMap() {
        const mapContainer = this.container.querySelector('#cluster-world-map');
        if (!mapContainer) return;

        try {
            // Load world topology data
            const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
            if (!response.ok) throw new Error('Failed to load world data');
            
            const worldData = await response.json();
            
            // Set up SVG dimensions - bigger map with no wasted space
            const container = mapContainer.parentElement;
            const containerRect = container.getBoundingClientRect();
            const width = Math.max(500, containerRect.width - 20);
            const height = 260;
            
            const svg = d3.select(mapContainer)
                .attr('viewBox', `0 0 ${width} ${height}`)
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .style('width', '100%')
                .style('height', '100%');

            // Create projection - larger scale for better visibility
            const scale = Math.min(width / 4, height / 2);
            const projection = d3.geoNaturalEarth1()
                .scale(scale)
                .translate([width / 2, height / 2]);

            const path = d3.geoPath().projection(projection);
            
            // Create country lookup for clusters
            const countryClusterMap = new Map();
            this.clusterData.countries.forEach(country => {
                countryClusterMap.set(country.country, country.cluster);
            });

            // Convert world data to features
            const countries = topojson.feature(worldData, worldData.objects.countries);
            
            // Clear any existing content
            svg.selectAll('*').remove();
            
            // Draw countries
            svg.selectAll('path')
                .data(countries.features)
                .enter()
                .append('path')
                .attr('d', path)
                .attr('class', 'cluster-map-country')
                .style('fill', (d) => {
                    // Try to match country by name
                    const countryName = d.properties.NAME || d.properties.NAME_EN || d.properties.name;
                    
                    // Look for matches in our cluster data
                    let clusterId = null;
                    for (const [country, cluster] of countryClusterMap.entries()) {
                        if (this.normalizeCountryName(countryName) === this.normalizeCountryName(country)) {
                            clusterId = cluster;
                            break;
                        }
                    }
                    
                    if (clusterId !== null && this.clusterData.clusters[clusterId]) {
                        return this.clusterData.clusters[clusterId].color;
                    }
                    return '#e5e7eb'; // Default grey for unmapped countries
                })
                .style('stroke', '#ffffff')
                .style('stroke-width', '0.5')
                .style('opacity', 0.8);
                
        } catch (error) {
            console.error('Failed to render cluster world map:', error);
            // Show a simple fallback
            mapContainer.innerHTML = '<text x="200" y="120" text-anchor="middle" fill="#666" font-size="12">Map unavailable</text>';
        }
    }

    // Add resize listener for dynamic map sizing
    setupMapResize() {
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                setTimeout(() => this.renderClusterWorldMap(), 100);
            });
            
            const mapOverview = this.container.querySelector('.cluster-map-section');
            if (mapOverview) {
                resizeObserver.observe(mapOverview);
            }
        }
    }

    normalizeCountryName(name) {
        if (!name) return '';
        return name.toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/republic of /g, '')
            .replace(/democratic /g, '')
            .replace(/people's /g, '')
            .trim();
    }

    setupEventListeners() {
        // Use the new cluster event listeners method
        this.setupClusterEventListeners();
    }

    showClusterDetails(clusterId) {
        const cluster = this.clusterData.clusters[clusterId];
        if (!cluster) return;

        // Generate extended description based on cluster type
        const extendedDescription = this.getExtendedDescription(cluster.name);

        // Hide the entire insights analysis section
        const insightsAnalysis = this.container.querySelector('.insights-analysis');
        if (insightsAnalysis) insightsAnalysis.style.display = 'none';

        // Create or show the detailed view container that takes the full width
        let detailContainer = this.container.querySelector('.cluster-detail-fullscreen');
        if (!detailContainer) {
            detailContainer = document.createElement('div');
            detailContainer.className = 'cluster-detail-fullscreen';
            this.container.appendChild(detailContainer);
        }

        detailContainer.style.display = 'block';
        detailContainer.innerHTML = `
            <div class="cluster-knowledge-card">
                <div class="knowledge-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 2px solid ${cluster.color};">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div class="cluster-color-dot" style="background: ${cluster.color}; width: 16px; height: 16px; border-radius: 50%;"></div>
                        <h2 style="color: ${cluster.color}; margin: 0; font-size: 1.5rem; font-weight: bold;">${cluster.name}</h2>
                    </div>
                    <button class="close-knowledge-card" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b; padding: 0.35rem; border-radius: 4px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">&times;</button>
                </div>
                
                <div class="knowledge-content" style="display: grid; gap: 1.25rem;">
                    <div class="cluster-description" style="padding: 1.25rem; background: ${cluster.color}08; border-radius: 12px; border-left: 4px solid ${cluster.color};">
                        <h3 style="margin: 0 0 0.75rem 0; color: #333; font-size: 1.1rem;">About ${cluster.name}</h3>
                        <p style="margin: 0 0 1rem 0; color: #555; font-size: 1rem; line-height: 1.6; font-weight: 500;">${cluster.description}</p>
                        <p style="margin: 0; color: #666; font-size: 0.9rem; line-height: 1.5;">${extendedDescription}</p>
                    </div>
                    
                    <div class="cluster-stats-row" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem;">
                        <div class="stat-box" style="text-align: center; padding: 0.5rem; background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-top: 2px solid ${cluster.color};">
                            <div class="stat-value" style="font-size: 1.2rem; font-weight: bold; color: ${cluster.color}; margin-bottom: 0.2rem;">${cluster.size}</div>
                            <div class="stat-label" style="font-size: 0.65rem; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px;">Countries</div>
                        </div>
                        <div class="stat-box" style="text-align: center; padding: 0.5rem; background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-top: 2px solid ${cluster.color};">
                            <div class="stat-value" style="font-size: 1.2rem; font-weight: bold; color: ${cluster.color}; margin-bottom: 0.2rem;">${cluster.immigration_ratio_per_1000?.toFixed(1) || 'N/A'}</div>
                            <div class="stat-label" style="font-size: 0.65rem; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px;">Immigration<br><span style="font-size: 0.6rem; color: #888;">per 1000</span></div>
                        </div>
                        <div class="stat-box" style="text-align: center; padding: 0.5rem; background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-top: 2px solid ${cluster.color};">
                            <div class="migration-badge" style="background: ${cluster.color}; color: white; padding: 0.35rem 0.65rem; border-radius: 5px; font-size: 0.75rem; font-weight: bold; display: inline-block; margin-bottom: 0.2rem;">
                                ${cluster.migration_level}
                            </div>
                            <div class="stat-label" style="font-size: 0.65rem; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px;">Migration</div>
                        </div>
                    </div>

                    <div class="cultural-dimensions" style="margin-top: 0.5rem;">
                        <h3 style="margin: 0 0 0.75rem 0; color: #333; font-size: 1rem; text-align: center;">Cultural Characteristics</h3>
                        <div class="dimensions-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.6rem;">
                            ${this.renderCulturalDimensions(cluster.cultural_profile, cluster.color)}
                        </div>
                    </div>

                    <div class="cluster-countries" style="margin-top: 0.75rem;">
                        <h3 style="margin: 0 0 0.75rem 0; color: #333; font-size: 1rem; text-align: center;">All Countries in ${cluster.name}</h3>
                        <div class="countries-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.5rem;">
                            ${cluster.countries.map(country => `
                                <div class="country-card" style="background: ${cluster.color}12; color: ${cluster.color}; border: 1.5px solid ${cluster.color}30; padding: 0.6rem 0.5rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; text-align: center; transition: all 0.3s ease; cursor: pointer;">
                                    ${country}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add close event listener
        const closeBtn = detailContainer.querySelector('.close-knowledge-card');
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.hideClusterDetails();
        });

        // Add hover effects to country cards
        const countryCards = detailContainer.querySelectorAll('.country-card');
        countryCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-3px) scale(1.02)';
                card.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = 'none';
            });
        });

        // Highlight this cluster on the map
        if (window.worldMapComponent) {
            window.worldMapComponent.highlightCluster(cluster.countries);
        }
    }

    hideClusterDetails() {
        // Show the insights analysis section again
        const insightsAnalysis = this.container.querySelector('.insights-analysis');
        const detailContainer = this.container.querySelector('.cluster-detail-fullscreen');
        
        if (insightsAnalysis) insightsAnalysis.style.display = 'block';
        if (detailContainer) detailContainer.style.display = 'none';

        // Reset map highlighting
        if (window.worldMapComponent) {
            window.worldMapComponent.resetHighlight();
        }
    }

    setupClusterEventListeners() {
        const clusterItems = this.container.querySelectorAll('.cluster-item');
        clusterItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const clusterId = item.dataset.clusterId;
                this.showClusterDetails(clusterId);
            });
            
            // Add hover effects
            item.addEventListener('mouseenter', () => {
                if (!item.classList.contains('expanded')) {
                    item.style.transform = 'translateY(-2px)';
                    item.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }
            });
            
            item.addEventListener('mouseleave', () => {
                if (!item.classList.contains('expanded')) {
                    item.style.transform = 'translateY(0)';
                    item.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }
            });
        });
    }

    getExtendedDescription(clusterName) {
        const descriptions = {
            "Family-First Countries": "These countries prioritize strong family bonds and community ties. People enjoy celebrating life while maintaining close relationships. Think of places where extended families gather often, festivals are community-wide events, and personal happiness is valued alongside collective harmony.",
            
            "Competitive Nations": "Countries where individual achievement and success drive society forward. People work hard to get ahead, value personal accomplishments, and believe in earning their place through effort. Education, career advancement, and measurable achievements are highly respected.",
            
            "Respectful Communities": "Societies built on respect for authority and group cooperation. People work together toward common goals, follow established hierarchies, and value group harmony over individual desires. Decision-making often involves consultation and consensus-building.",
            
            "Social Living Countries": "Places where community life is central to daily existence. Everyone knows their neighbors, local traditions are actively preserved, and social gatherings are frequent and meaningful. People prefer face-to-face relationships and collective celebrations.",
            
            "Structured Societies": "Well-organized countries with clear rules, efficient systems, and strong institutional leadership. People appreciate predictability, proper procedures, and systematic approaches to solving problems. Government and social structures provide stability and order.",
            
            "Quality-of-Life Nations": "Countries that prioritize work-life balance, environmental quality, and citizen wellbeing. People value time with family, personal fulfillment, and creating supportive communities. Success is measured not just by wealth, but by happiness and life satisfaction.",
            
            "Business-Minded Countries": "Global hubs where entrepreneurship, innovation, and commercial success thrive. These places attract international talent, foster startup cultures, and encourage risk-taking in business. Economic opportunity and financial achievement are central to the culture.",
            
            "Traditional Mindset": "Countries deeply rooted in historical customs, established ways of life, and time-tested approaches. People value continuity, respect for elders, and preserving cultural heritage. Change happens gradually, with careful consideration of traditional values."
        };
        
        return descriptions[clusterName] || "This cluster represents a unique combination of cultural characteristics that shape how people in these countries approach life, work, and relationships.";
    }

    renderCulturalDimensions(profile, color) {
        const dimensions = [
            {
                name: "Authority Respect",
                key: "power_distance",
                value: profile.power_distance,
                description: "How much people accept hierarchy and unequal power distribution",
                lowLabel: "Everyone Equal",
                highLabel: "Respect Authority"
            },
            {
                name: "Individual Focus",
                key: "individualism",
                value: profile.individualism,
                description: "Whether people focus on personal goals or group harmony",
                lowLabel: "Group First",
                highLabel: "Self-Reliant"
            },
            {
                name: "Achievement Drive",
                key: "masculinity",
                value: profile.masculinity,
                description: "How much society values competition and material success",
                lowLabel: "Care & Quality",
                highLabel: "Compete & Win"
            },
            {
                name: "Stability Preference",
                key: "uncertainty_avoidance",
                value: profile.uncertainty_avoidance,
                description: "How comfortable people are with uncertainty and change",
                lowLabel: "Embrace Change",
                highLabel: "Prefer Stability"
            },
            {
                name: "Time Perspective",
                key: "long_term_orientation",
                value: profile.long_term_orientation,
                description: "Whether society focuses on future planning or present traditions",
                lowLabel: "Respect Tradition",
                highLabel: "Plan Ahead"
            },
            {
                name: "Life Enjoyment",
                key: "indulgence",
                value: profile.indulgence,
                description: "How much society allows free expression of emotions and desires",
                lowLabel: "Self-Control",
                highLabel: "Enjoy Life"
            }
        ];

        return dimensions.map(dim => {
            const percentage = Math.round(dim.value);
            const isHigh = percentage > 50;
            
            return `
                <div class="dimension-card" style="background: white; border-radius: 6px; padding: 0.65rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border-left: 2px solid ${color};">
                    <div class="dimension-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                        <h5 style="margin: 0; color: #333; font-size: 0.8rem; font-weight: 600;">${dim.name}</h5>
                        <span class="dimension-value" style="font-size: 1rem; font-weight: bold; color: ${color};">${percentage}</span>
                    </div>
                    
                    <div class="dimension-bar" style="width: 100%; height: 4px; background: #e5e7eb; border-radius: 2px; margin-bottom: 0.4rem; overflow: hidden;">
                        <div class="dimension-fill" style="width: ${percentage}%; height: 100%; background: ${color}; transition: width 0.3s ease;"></div>
                    </div>
                    
                    <div class="dimension-labels" style="display: flex; justify-content: space-between; margin-bottom: 0.35rem; font-size: 0.65rem; color: #666;">
                        <span style="font-weight: ${!isHigh ? 'bold' : 'normal'}; color: ${!isHigh ? color : '#666'};">${dim.lowLabel}</span>
                        <span style="font-weight: ${isHigh ? 'bold' : 'normal'}; color: ${isHigh ? color : '#666'};">${dim.highLabel}</span>
                    </div>
                    
                    <p style="margin: 0; font-size: 0.68rem; color: #666; line-height: 1.2;">${dim.description}</p>
                </div>
            `;
        }).join('');
    }


}

// Initialize when DOM is loaded
if (typeof window !== 'undefined') {
    window.CountryInsights = CountryInsights;
}