/**
 * Migration Chart Component
 * Line chart for displaying migration trends over time
 */

class MigrationChartComponent {
    constructor(selector) {
        this.container = d3.select(selector);
        this.countries = [];
        this.migrationData = {};
        this.currentFilter = 'all';
        
        this.margin = { top: 20, right: 60, bottom: 40, left: 60 };
        this.colors = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#c2410c'];
        
        this.years = ['1990', '1995', '2000', '2005', '2010', '2015', '2020', '2024'];
        
        this.setupSVG();
        this.drawEmptyState();
    }

    setupSVG() {
        // Clear any existing content
        this.container.selectAll('*').remove();
        
        // Get container dimensions
        const containerNode = this.container.node();
        const rect = containerNode.getBoundingClientRect();
        this.width = rect.width - this.margin.left - this.margin.right;
        this.height = rect.height - this.margin.top - this.margin.bottom;
        
        // Create SVG
        this.svg = this.container
            .append('svg')
            .attr('width', rect.width)
            .attr('height', rect.height);
        
        // Create main group
        this.g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        
        // Create scales
        this.xScale = d3.scaleLinear()
            .domain([1990, 2024])
            .range([0, this.width]);
        
        this.yScale = d3.scaleLinear()
            .range([this.height, 0]);
        
        // Create line generator
        this.line = d3.line()
            .x(d => this.xScale(d.year))
            .y(d => this.yScale(d.value))
            .curve(d3.curveMonotoneX);
        
        // Create axes
        this.xAxis = d3.axisBottom(this.xScale)
            .tickFormat(d3.format('d'))
            .ticks(8);
        
        this.yAxis = d3.axisLeft(this.yScale)
            .tickFormat(d => window.CultureFlowsUtils?.formatNumber(d) || d);
        
        // Add axis groups
        this.g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${this.height})`);
        
        this.g.append('g')
            .attr('class', 'y-axis');
        
        // Add axis labels
        this.g.append('text')
            .attr('class', 'x-label')
            .attr('transform', `translate(${this.width / 2}, ${this.height + 35})`)
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#64748b')
            .text('Year');
        
        this.g.append('text')
            .attr('class', 'y-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', -40)
            .attr('x', -this.height / 2)
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#64748b')
            .text('Migration Count');
    }

    drawEmptyState() {
        // Clear any existing lines
        this.g.selectAll('.line-group').remove();
        this.g.selectAll('.legend').remove();
        
        // Hide axes
        this.g.select('.x-axis').style('opacity', 0);
        this.g.select('.y-axis').style('opacity', 0);
        
        // Draw placeholder text
        this.g.append('text')
            .attr('class', 'empty-state')
            .attr('x', this.width / 2)
            .attr('y', this.height / 2 - 10)
            .style('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('fill', '#64748b')
            .text('Select countries to view');
        
        this.g.append('text')
            .attr('class', 'empty-state')
            .attr('x', this.width / 2)
            .attr('y', this.height / 2 + 15)
            .style('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('fill', '#64748b')
            .text('migration trends');
    }

    update(countries, migrationData, currentFilter) {
        this.countries = countries;
        this.migrationData = migrationData;
        this.currentFilter = currentFilter;
        
        if (countries.length === 0) {
            this.drawEmptyState();
            return;
        }

        this.draw();
    }

    draw() {
        // Remove empty state
        this.g.selectAll('.empty-state').remove();
        
        // Show axes
        this.g.select('.x-axis').style('opacity', 1);
        this.g.select('.y-axis').style('opacity', 1);
        
        // Prepare data
        const chartData = this.prepareData();
        
        // Update scales
        this.updateScales(chartData);
        
        // Update axes
        this.g.select('.x-axis')
            .transition()
            .duration(300)
            .call(this.xAxis);
        
        this.g.select('.y-axis')
            .transition()
            .duration(300)
            .call(this.yAxis);
        
        // Draw lines
        this.drawLines(chartData);
        
        // Draw legend
        this.drawLegend();
    }

    prepareData() {
        return this.countries.map(country => {
            const countryName = country.country;
            const countryData = this.migrationData[countryName];
            
            if (!countryData) return { country: countryName, data: [] };
            
            const data = this.years.map(year => ({
                year: parseInt(year),
                value: countryData[this.currentFilter][year] || 0
            }));
            
            return {
                country: countryName,
                data: data
            };
        });
    }

    updateScales(chartData) {
        // Get all values for Y scale domain
        const allValues = chartData.flatMap(d => d.data.map(point => point.value));
        const maxValue = d3.max(allValues) || 100;
        const minValue = d3.min(allValues) || 0;
        
        // Add some padding to the Y scale
        const padding = (maxValue - minValue) * 0.1;
        this.yScale.domain([Math.max(0, minValue - padding), maxValue + padding]);
    }

    drawLines(chartData) {
        // Bind data to line groups
        const lineGroups = this.g.selectAll('.line-group')
            .data(chartData, d => d.country);
        
        // Remove old groups
        lineGroups.exit().remove();
        
        // Add new groups
        const newGroups = lineGroups.enter()
            .append('g')
            .attr('class', 'line-group');
        
        // Merge old and new
        const allGroups = newGroups.merge(lineGroups);
        
        // Draw lines
        allGroups.each((d, i, nodes) => {
            const group = d3.select(nodes[i]);
            const color = this.colors[i % this.colors.length];
            
            // Draw line
            const line = group.selectAll('.line')
                .data([d.data]);
            
            line.enter()
                .append('path')
                .attr('class', 'line')
                .merge(line)
                .transition()
                .duration(300)
                .attr('d', this.line)
                .attr('fill', 'none')
                .attr('stroke', color)
                .attr('stroke-width', 2)
                .attr('stroke-linecap', 'round');
            
            // Draw points
            const points = group.selectAll('.point')
                .data(d.data);
            
            points.enter()
                .append('circle')
                .attr('class', 'point')
                .attr('r', 0)
                .merge(points)
                .transition()
                .duration(300)
                .attr('cx', d => this.xScale(d.year))
                .attr('cy', d => this.yScale(d.value))
                .attr('r', 3)
                .attr('fill', color)
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 2);
            
            points.exit().remove();
            
            // Add hover effects
            group.selectAll('.point')
                .on('mouseover', (event, d) => {
                    // Enlarge point
                    d3.select(event.currentTarget)
                        .transition()
                        .duration(100)
                        .attr('r', 5);
                    
                    // Show tooltip
                    this.showTooltip(event, d, color);
                })
                .on('mouseout', (event, d) => {
                    // Reset point size
                    d3.select(event.currentTarget)
                        .transition()
                        .duration(100)
                        .attr('r', 3);
                    
                    // Hide tooltip
                    this.hideTooltip();
                });
        });
    }

    drawLegend() {
        // Remove existing legend
        this.g.selectAll('.legend').remove();
        
        if (this.countries.length === 0) return;
        
        const legend = this.g.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${this.width - 150}, 20)`);
        
        const legendItems = legend.selectAll('.legend-item')
            .data(this.countries)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => `translate(0, ${i * 20})`);
        
        // Legend color boxes
        legendItems.append('rect')
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', (d, i) => this.colors[i % this.colors.length]);
        
        // Legend text
        legendItems.append('text')
            .attr('x', 18)
            .attr('y', 6)
            .attr('dy', '0.35em')
            .style('font-size', '12px')
            .style('fill', '#374151')
            .text(d => d.country);
    }

    showTooltip(event, data, color) {
        // Create or update tooltip
        let tooltip = d3.select('body').select('.migration-tooltip');
        
        if (tooltip.empty()) {
            tooltip = d3.select('body')
                .append('div')
                .attr('class', 'migration-tooltip tooltip')
                .style('position', 'absolute')
                .style('background', 'rgba(0, 0, 0, 0.9)')
                .style('color', 'white')
                .style('padding', '8px 12px')
                .style('border-radius', '6px')
                .style('font-size', '12px')
                .style('pointer-events', 'none')
                .style('z-index', 1000);
        }
        
        tooltip
            .style('opacity', 1)
            .html(`
                <div style="border-left: 3px solid ${color}; padding-left: 8px;">
                    <strong>Year: ${data.year}</strong><br/>
                    Migration: ${window.CultureFlowsUtils?.formatNumber(data.value) || data.value}
                </div>
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
    }

    hideTooltip() {
        d3.select('.migration-tooltip').style('opacity', 0);
    }

    // Handle resize
    resize() {
        this.setupSVG();
        if (this.countries.length > 0) {
            this.draw();
        } else {
            this.drawEmptyState();
        }
    }
}

// Make component available globally
window.MigrationChartComponent = MigrationChartComponent;