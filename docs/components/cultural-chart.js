/**
 * Cultural Chart Component
 * Radar chart for displaying cultural dimensions
 */

class CulturalChartComponent {
    constructor(selector) {
        this.canvas = document.querySelector(selector);
        this.ctx = this.canvas.getContext('2d');
        this.countries = [];
        this.dimensions = [];
        
        this.colors = [
            '#2563eb', // Primary blue
            '#dc2626', // Red
            '#16a34a', // Green
            '#ca8a04', // Yellow
            '#9333ea', // Purple
            '#c2410c'  // Orange
        ];

        this.setupCanvas();
        this.drawEmptyState();
    }

    setupCanvas() {
        // Set canvas size
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Set actual size in memory (scaled up for retina)
        const scale = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * scale;
        this.canvas.height = rect.height * scale;
        
        // Scale the canvas back down using CSS
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Scale the drawing context so everything draws at the correct size
        this.ctx.scale(scale, scale);
        
        // Set logical dimensions
        this.width = rect.width;
        this.height = rect.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.radius = Math.min(this.width, this.height) * 0.35;
    }

    drawEmptyState() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw placeholder text
        this.ctx.fillStyle = '#64748b';
        this.ctx.font = '16px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Select countries to view', this.centerX, this.centerY - 10);
        this.ctx.fillText('cultural dimensions', this.centerX, this.centerY + 10);
    }

    update(countries, dimensions) {
        this.countries = countries;
        this.dimensions = dimensions;
        
        if (countries.length === 0) {
            this.drawEmptyState();
            return;
        }

        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw radar grid
        this.drawRadarGrid();
        
        // Draw dimension labels
        this.drawDimensionLabels();
        
        // Draw country data
        this.countries.forEach((country, index) => {
            this.drawCountryData(country, index);
        });
        
        // Draw legend
        this.drawLegend();
    }

    drawRadarGrid() {
        const numLevels = 5;
        const angleStep = (Math.PI * 2) / this.dimensions.length;
        
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.lineWidth = 1;
        
        // Draw concentric circles
        for (let level = 1; level <= numLevels; level++) {
            const levelRadius = (this.radius * level) / numLevels;
            
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, levelRadius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Draw level labels
            if (level < numLevels) {
                this.ctx.fillStyle = '#94a3b8';
                this.ctx.font = '10px Inter, sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    (level * 20).toString(),
                    this.centerX + levelRadius * Math.cos(-Math.PI / 2),
                    this.centerY + levelRadius * Math.sin(-Math.PI / 2) - 5
                );
            }
        }
        
        // Draw radial lines
        this.dimensions.forEach((dimension, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const endX = this.centerX + this.radius * Math.cos(angle);
            const endY = this.centerY + this.radius * Math.sin(angle);
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX, this.centerY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        });
    }

    drawDimensionLabels() {
        const angleStep = (Math.PI * 2) / this.dimensions.length;
        const labelDistance = this.radius + 30;
        
        this.ctx.fillStyle = '#374151';
        this.ctx.font = '12px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const dimensionNames = {
            'pdi': 'Power Distance',
            'idv': 'Individualism',
            'mas': 'Masculinity',
            'uai': 'Uncertainty Avoidance',
            'lto': 'Long-term Orientation',
            'ivr': 'Indulgence vs Restraint'
        };
        
        this.dimensions.forEach((dimension, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const labelX = this.centerX + labelDistance * Math.cos(angle);
            const labelY = this.centerY + labelDistance * Math.sin(angle);
            
            // Adjust text alignment based on position
            if (Math.cos(angle) > 0.1) {
                this.ctx.textAlign = 'left';
            } else if (Math.cos(angle) < -0.1) {
                this.ctx.textAlign = 'right';
            } else {
                this.ctx.textAlign = 'center';
            }
            
            this.ctx.fillText(
                dimensionNames[dimension] || dimension.toUpperCase(),
                labelX,
                labelY
            );
        });
    }

    drawCountryData(country, countryIndex) {
        const angleStep = (Math.PI * 2) / this.dimensions.length;
        const color = this.colors[countryIndex % this.colors.length];
        
        // Create path points
        const points = this.dimensions.map((dimension, index) => {
            const value = country[dimension] || 0;
            const normalizedValue = Math.min(value / 100, 1); // Normalize to 0-1
            const distance = this.radius * normalizedValue;
            const angle = index * angleStep - Math.PI / 2;
            
            return {
                x: this.centerX + distance * Math.cos(angle),
                y: this.centerY + distance * Math.sin(angle)
            };
        });
        
        // Draw filled area
        this.ctx.fillStyle = color + '20'; // Add transparency
        this.ctx.beginPath();
        points.forEach((point, index) => {
            if (index === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        });
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw border
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw points
        this.ctx.fillStyle = color;
        points.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawLegend() {
        if (this.countries.length === 0) return;
        
        const legendX = 20;
        const legendY = 20;
        const itemHeight = 20;
        
        this.ctx.font = '12px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        
        this.countries.forEach((country, index) => {
            const y = legendY + index * itemHeight;
            const color = this.colors[index % this.colors.length];
            
            // Draw color indicator
            this.ctx.fillStyle = color;
            this.ctx.fillRect(legendX, y - 6, 12, 12);
            
            // Draw country name
            this.ctx.fillStyle = '#374151';
            this.ctx.fillText(country.country, legendX + 20, y);
        });
    }

    // Handle window resize
    resize() {
        this.setupCanvas();
        if (this.countries.length > 0) {
            this.draw();
        } else {
            this.drawEmptyState();
        }
    }
}

// Make component available globally
window.CulturalChartComponent = CulturalChartComponent;