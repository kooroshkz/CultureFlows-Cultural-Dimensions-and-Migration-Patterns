/**
 * Data Table Component
 * Interactive table for displaying detailed country data
 */

class DataTableComponent {
    constructor(selector) {
        this.table = document.querySelector(selector);
        this.tbody = this.table.querySelector('tbody');
        this.countries = [];
        this.migrationData = {};
        this.currentYear = 2024;
        this.currentFilter = 'all';
        
        this.culturalDimensions = {
            'pdi': 'Power Distance Index',
            'idv': 'Individualism vs Collectivism',
            'mas': 'Masculinity vs Femininity',
            'uai': 'Uncertainty Avoidance Index',
            'lto': 'Long-term vs Short-term Orientation',
            'ivr': 'Indulgence vs Restraint'
        };
        
        this.drawEmptyState();
    }

    drawEmptyState() {
        this.tbody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 40px; color: #64748b;">
                    Select countries to view detailed comparison data
                </td>
            </tr>
        `;
    }

    update(countries, migrationData, currentYear, currentFilter) {
        this.countries = countries;
        this.migrationData = migrationData;
        this.currentYear = currentYear;
        this.currentFilter = currentFilter;
        
        if (countries.length === 0) {
            this.drawEmptyState();
            return;
        }

        this.render();
    }

    render() {
        // Clear existing content
        this.tbody.innerHTML = '';
        
        // Prepare data rows
        const rows = this.prepareDataRows();
        
        // Render rows
        rows.forEach(row => {
            const tr = document.createElement('tr');
            
            // Metric name
            const metricCell = document.createElement('td');
            metricCell.innerHTML = `
                <div style="font-weight: 500; color: #374151;">
                    ${row.label}
                </div>
                ${row.description ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${row.description}</div>` : ''}
            `;
            tr.appendChild(metricCell);
            
            // Country 1 data
            const country1Cell = document.createElement('td');
            country1Cell.innerHTML = this.formatCellValue(row.country1, row.type);
            tr.appendChild(country1Cell);
            
            // Country 2 data
            const country2Cell = document.createElement('td');
            country2Cell.innerHTML = this.formatCellValue(row.country2, row.type);
            if (row.type === 'comparison' && row.country1 !== null && row.country2 !== null) {
                country2Cell.style.position = 'relative';
                const comparison = this.getComparisonIndicator(row.country1, row.country2);
                if (comparison) {
                    country2Cell.innerHTML += `<span style="margin-left: 8px; font-size: 12px; color: ${comparison.color};">${comparison.icon}</span>`;
                }
            }
            tr.appendChild(country2Cell);
            
            this.tbody.appendChild(tr);
        });
    }

    prepareDataRows() {
        const rows = [];
        const country1 = this.countries[0] || null;
        const country2 = this.countries[1] || null;
        
        // Basic country information
        rows.push({
            label: 'Country',
            country1: country1?.country || '-',
            country2: country2?.country || '-',
            type: 'text'
        });
        
        rows.push({
            label: 'Region',
            country1: country1?.region || '-',
            country2: country2?.region || '-',
            type: 'text'
        });
        
        rows.push({
            label: 'Continent',
            country1: country1?.continent || '-',
            country2: country2?.continent || '-',
            type: 'text'
        });
        
        // Cultural dimensions
        Object.entries(this.culturalDimensions).forEach(([key, label]) => {
            rows.push({
                label: label,
                description: this.getCulturalDimensionDescription(key),
                country1: country1?.[key] || null,
                country2: country2?.[key] || null,
                type: 'comparison'
            });
        });
        
        return rows;
    }

    formatCellValue(value, type) {
        if (value === null || value === undefined) {
            return '<span style="color: #94a3b8;">-</span>';
        }
        
        switch (type) {
            case 'separator':
                return '<strong style="color: #374151;">—</strong>';
            
            case 'text':
                return `<span style="color: #374151;">${value}</span>`;
            
            case 'comparison':
                return `<span style="color: #374151; font-weight: 500;">${value}</span>`;
            
            case 'migration':
                const formatted = window.CultureFlowsUtils?.formatNumber(value) || value.toLocaleString();
                return `<span style="color: #2563eb; font-weight: 500;">${formatted}</span>`;
            
            case 'percentage':
                const color = value >= 0 ? '#16a34a' : '#dc2626';
                const sign = value >= 0 ? '+' : '';
                return `<span style="color: ${color}; font-weight: 500;">${sign}${value.toFixed(1)}%</span>`;
            
            default:
                return `<span style="color: #374151;">${value}</span>`;
        }
    }

    getComparisonIndicator(value1, value2) {
        if (value1 === null || value2 === null) return null;
        
        const diff = Math.abs(value1 - value2);
        if (diff < 5) {
            return { icon: '≈', color: '#64748b' }; // Similar
        } else if (value2 > value1) {
            return { icon: '↑', color: '#16a34a' }; // Higher
        } else {
            return { icon: '↓', color: '#dc2626' }; // Lower
        }
    }

    getCulturalDimensionDescription(dimension) {
        const descriptions = {
            'pdi': 'How society handles inequality',
            'idv': 'Individual vs group orientation',
            'mas': 'Competition vs cooperation values',
            'uai': 'Tolerance for uncertainty',
            'lto': 'Future vs tradition focus',
            'ivr': 'Gratification vs self-control'
        };
        
        return descriptions[dimension] || '';
    }

    getFilterLabel() {
        switch (this.currentFilter) {
            case 'all': return 'Total';
            case 'male': return 'Male';
            case 'female': return 'Female';
            default: return 'Total';
        }
    }

    getPreviousYear() {
        const years = [1990, 1995, 2000, 2005, 2010, 2015, 2020, 2024];
        const currentIndex = years.indexOf(this.currentYear);
        return currentIndex > 0 ? years[currentIndex - 1] : null;
    }

    calculateGrowth(oldValue, newValue) {
        if (oldValue === 0) {
            return newValue > 0 ? 100 : 0;
        }
        return ((newValue - oldValue) / oldValue) * 100;
    }

    calculateTotalMigration(country) {
        if (!country) return null;
        
        const years = ['1990', '1995', '2000', '2005', '2010', '2015', '2020', '2024'];
        let total = 0;
        
        years.forEach(year => {
            const key = this.currentFilter === 'all' ? year : `${year}_${this.currentFilter}`;
            total += country[key] || 0;
        });
        
        return total;
    }
}

// Make component available globally
window.DataTableComponent = DataTableComponent;