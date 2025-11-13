/**
 * Hofstede Cultural Dimensions Explainer Component
 * Educational component explaining each cultural dimension in simple terms
 */

class HofstedeExplainerComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Hofstede explainer container not found');
            return;
        }
        
        this.dimensions = this.getDimensionsData();
        this.render();
    }

    getDimensionsData() {
        return [
            {
                code: 'pdi',
                name: 'Power Distance Index',
                icon: '',
                color: '#3b82f6',
                shortDesc: 'Acceptance of unequal power distribution',
                explanation: 'This measures how much people accept that power is distributed unequally in society. In high Power Distance cultures, people respect hierarchy and accept that some individuals have more authority than others. In low Power Distance cultures, people prefer equality and question authority.',
                highScore: {
                    label: 'High Score means',
                    examples: 'People accept hierarchical systems, respect authority figures, and are comfortable with clear power structures. Employees expect to be told what to do.',
                    countries: 'Malaysia, Slovakia, Guatemala'
                },
                lowScore: {
                    label: 'Low Score means',
                    examples: 'People prefer flat organizational structures, question authority, and believe everyone should have equal rights. Employees expect to be consulted.',
                    countries: 'Austria, Israel, Denmark'
                },
                realLife: 'Think about how people interact with their boss. In high PDI cultures, you might address them formally and rarely question decisions. In low PDI cultures, you might call them by their first name and openly discuss ideas.'
            },
            {
                code: 'idv',
                name: 'Individualism vs Collectivism',
                icon: '',
                color: '#10b981',
                shortDesc: 'Individual goals vs. group harmony',
                explanation: 'This dimension describes whether people prioritize personal goals and independence (individualism) or group harmony and loyalty (collectivism). It shapes how people make decisions, build relationships, and define success.',
                highScore: {
                    label: 'High Score (Individualistic)',
                    examples: 'People value personal freedom, independence, and self-reliance. "I" is more important than "we". Personal achievements are celebrated, and people are expected to take care of themselves.',
                    countries: 'United States, Australia, United Kingdom'
                },
                lowScore: {
                    label: 'Low Score (Collectivistic)',
                    examples: 'People value group harmony, family loyalty, and community bonds. "We" is more important than "I". Decisions consider the group\'s well-being, and people expect mutual support.',
                    countries: 'Guatemala, Ecuador, Panama'
                },
                realLife: 'Imagine choosing a job. In individualistic cultures, you might prioritize salary and career growth. In collectivistic cultures, you might consider how the decision affects your family or choose a job that brings honor to your community.'
            },
            {
                code: 'mas',
                name: 'Masculinity vs Femininity',
                icon: '',
                color: '#f59e0b',
                shortDesc: 'Competition vs. caring for others',
                explanation: 'This dimension describes what motivates people: competition and achievement (masculine) or cooperation and quality of life (feminine). Despite the names, this isn\'t about gender but about what values a society emphasizes.',
                highScore: {
                    label: 'High Score (Masculine)',
                    examples: 'Society values assertiveness, competition, achievement, and material success. People are motivated by being the best and winning. Clear gender roles are more traditional.',
                    countries: 'Slovakia, Japan, Hungary'
                },
                lowScore: {
                    label: 'Low Score (Feminine)',
                    examples: 'Society values cooperation, modesty, caring for others, and quality of life. People prioritize work-life balance and helping others. Gender roles are more fluid.',
                    countries: 'Sweden, Norway, Netherlands'
                },
                realLife: 'Consider workplace culture. In masculine cultures, employees might compete for promotions and celebrate individual success. In feminine cultures, teams might focus on consensus, collaboration, and ensuring everyone\'s well-being.'
            },
            {
                code: 'uai',
                name: 'Uncertainty Avoidance Index',
                icon: '',
                color: '#ef4444',
                shortDesc: 'Comfort with unknown situations',
                explanation: 'This measures how comfortable people are with uncertainty, ambiguity, and unpredictable situations. It affects how people plan, make rules, and react to change.',
                highScore: {
                    label: 'High Score means',
                    examples: 'People prefer structure, clear rules, and detailed plans. They feel anxious about uncertainty and try to control the future through laws, regulations, and traditions. Change is stressful.',
                    countries: 'Greece, Portugal, Uruguay'
                },
                lowScore: {
                    label: 'Low Score means',
                    examples: 'People are comfortable with ambiguity and flexible plans. They accept that life is unpredictable and adapt easily to change. Fewer rules are needed, and innovation is welcome.',
                    countries: 'Singapore, Denmark, Sweden'
                },
                realLife: 'Think about planning a vacation. In high UAI cultures, you might book everything in advance with detailed itineraries. In low UAI cultures, you might be comfortable with spontaneous plans and last-minute changes.'
            },
            {
                code: 'lto',
                name: 'Long-term vs Short-term Orientation',
                icon: '',
                color: '#8b5cf6',
                shortDesc: 'Focus on future vs. present traditions',
                explanation: 'This dimension describes whether a society focuses on future rewards and planning (long-term) or respects traditions and expects quick results (short-term). It influences how people save money, educate children, and view success.',
                highScore: {
                    label: 'High Score (Long-term)',
                    examples: 'People value perseverance, thrift, and adapting to change. They save for the future, invest in long-term goals, and are willing to delay gratification. Education and hard work are seen as paths to future success.',
                    countries: 'South Korea, Japan, China'
                },
                lowScore: {
                    label: 'Low Score (Short-term)',
                    examples: 'People value traditions, social obligations, and quick results. They focus on the present, expect immediate outcomes, and maintain time-honored practices. Respect for tradition is important.',
                    countries: 'Ghana, Egypt, Trinidad and Tobago'
                },
                realLife: 'Consider business decisions. In long-term oriented cultures, companies might invest heavily in research for future innovations. In short-term oriented cultures, businesses might focus on quarterly results and maintaining traditional practices.'
            },
            {
                code: 'ivr',
                name: 'Indulgence vs Restraint',
                icon: '',
                color: '#06b6d4',
                shortDesc: 'Freedom to enjoy life vs. strict control',
                explanation: 'This dimension measures whether a society allows people to freely enjoy life and have fun (indulgence) or believes in controlling desires through strict social norms (restraint). It affects attitudes toward leisure, happiness, and personal freedom.',
                highScore: {
                    label: 'High Score (Indulgent)',
                    examples: 'People feel free to pursue happiness and enjoy life. They value leisure time, express themselves freely, and believe in personal gratification. Optimism and positive emotions are encouraged.',
                    countries: 'Venezuela, Mexico, New Zealand'
                },
                lowScore: {
                    label: 'Low Score (Restrained)',
                    examples: 'People believe impulses should be controlled through strict social norms. They prioritize duty over pleasure, are more pessimistic, and don\'t emphasize leisure. Self-discipline is valued.',
                    countries: 'Pakistan, Egypt, Latvia'
                },
                realLife: 'Think about attitudes toward fun. In indulgent cultures, taking time off for hobbies and socializing is normal and encouraged. In restrained cultures, people might feel guilty about leisure and believe work and duty should come first.'
            }
        ];
    }

    render() {
        this.container.innerHTML = `
            <div class="hofstede-explainer">
                <div class="explainer-header">
                    <div class="header-content-explainer">
                        <h2>Understanding Hofstede's Cultural Dimensions</h2>
                        <p class="subtitle">A simple guide to the six dimensions that shape how cultures differ around the world</p>
                    </div>
                    <div class="header-info">
                        <div class="info-badge">
                            <span>6 Dimensions</span>
                        </div>
                        <div class="info-badge">
                            <span>100+ Countries</span>
                        </div>
                    </div>
                </div>

                <div class="dimensions-grid-explainer">
                    ${this.dimensions.map(dimension => this.renderDimensionCard(dimension)).join('')}
                </div>

                <div class="explainer-footer">
                    <div class="footer-content">
                        <h3>Why This Matters</h3>
                        <p>Understanding these cultural dimensions helps us appreciate why people from different countries might think and act differently. There's no "better" or "worse" - just different ways of organizing society. These differences affect everything from how businesses operate to how families make decisions to how people build relationships.</p>
                        <div class="fun-fact">
                            <p><strong>Fun Fact:</strong> These dimensions were developed by Dutch social psychologist Geert Hofstede based on research with over 100,000 IBM employees in 76 countries between 1967 and 1973. The framework has since been used in countless studies worldwide!</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addInteractivity();
    }

    renderDimensionCard(dimension) {
        return `
            <div class="dimension-card-explainer" data-dimension="${dimension.code}">
                <div class="card-header-explainer" style="border-left: 4px solid ${dimension.color};">
                    <div class="header-left">
                        <span class="dimension-icon">${dimension.icon}</span>
                        <div class="header-text">
                            <h3>${dimension.name}</h3>
                            <p class="short-desc">${dimension.shortDesc}</p>
                        </div>
                    </div>
                    <button class="expand-btn" aria-label="Expand details">
                        <span class="expand-icon">▼</span>
                    </button>
                </div>

                <div class="card-content-explainer">
                    <div class="explanation-section">
                        <h4>What is it?</h4>
                        <p>${dimension.explanation}</p>
                    </div>

                    <div class="scores-comparison">
                        <div class="score-section high-score" style="border-color: ${dimension.color};">
                            <div class="score-header" style="background: ${dimension.color};">
                                <span class="score-label">${dimension.highScore.label}</span>
                            </div>
                            <p class="score-description">${dimension.highScore.examples}</p>
                            <div class="example-countries">
                                <span class="countries-label">Examples:</span>
                                <span class="countries-list">${dimension.highScore.countries}</span>
                            </div>
                        </div>

                        <div class="score-section low-score" style="border-color: ${dimension.color};">
                            <div class="score-header" style="background: ${dimension.color};">
                                <span class="score-label">${dimension.lowScore.label}</span>
                            </div>
                            <p class="score-description">${dimension.lowScore.examples}</p>
                            <div class="example-countries">
                                <span class="countries-label">Examples:</span>
                                <span class="countries-list">${dimension.lowScore.countries}</span>
                            </div>
                        </div>
                    </div>

                    <div class="real-life-example">
                        <h4>Real-Life Example</h4>
                        <p>${dimension.realLife}</p>
                    </div>
                </div>
            </div>
        `;
    }

    addInteractivity() {
        const cards = this.container.querySelectorAll('.dimension-card-explainer');
        
        cards.forEach(card => {
            const expandBtn = card.querySelector('.expand-btn');
            const content = card.querySelector('.card-content-explainer');
            const icon = card.querySelector('.expand-icon');

            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isExpanded = card.classList.contains('expanded');
                
                // Close all other cards
                cards.forEach(c => {
                    if (c !== card) {
                        c.classList.remove('expanded');
                        c.querySelector('.expand-icon').textContent = '▼';
                    }
                });

                // Toggle current card
                card.classList.toggle('expanded');
                icon.textContent = isExpanded ? '▼' : '▲';

                // Smooth scroll to card if expanding
                if (!isExpanded) {
                    setTimeout(() => {
                        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 100);
                }
            });

            // Also allow clicking on the header to expand/collapse
            const header = card.querySelector('.card-header-explainer');
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                expandBtn.click();
            });
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('hofstede-explainer')) {
            window.hofstedeExplainer = new HofstedeExplainerComponent('hofstede-explainer');
        }
    });
} else {
    if (document.getElementById('hofstede-explainer')) {
        window.hofstedeExplainer = new HofstedeExplainerComponent('hofstede-explainer');
    }
}
