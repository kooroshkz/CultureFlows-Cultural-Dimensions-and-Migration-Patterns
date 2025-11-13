#!/usr/bin/env python3
"""
Analyze cluster cultural profiles based on Hofstede's dimensions
"""

import json

def analyze_clusters():
    with open('../data/clustering_results.json', 'r') as f:
        data = json.load(f)
    
    print("=== CULTURAL PROFILE ANALYSIS ===\n")
    
    for cluster_id, cluster in data['clusters'].items():
        profile = cluster['cultural_profile']
        countries = cluster['countries']
        
        print(f"📊 CLUSTER {cluster_id}: {cluster['name']}")
        print(f"Countries ({cluster['size']}): {', '.join(countries[:5])}{'...' if len(countries) > 5 else ''}")
        print(f"Migration: {cluster['migration_level']} ({cluster['immigration_ratio_per_1000']:.1f}/1000)")
        
        # Hofstede dimensions analysis
        pdi = profile['power_distance']
        idv = profile['individualism']
        mas = profile['masculinity']
        uai = profile['uncertainty_avoidance']
        lto = profile['long_term_orientation']
        ivr = profile['indulgence']
        
        print(f"\nCultural Dimensions:")
        print(f"  Power Distance: {pdi:.1f} ({'High' if pdi > 60 else 'Medium' if pdi > 40 else 'Low'})")
        print(f"  Individualism: {idv:.1f} ({'High' if idv > 60 else 'Medium' if idv > 40 else 'Low'})")
        print(f"  Masculinity: {mas:.1f} ({'High' if mas > 60 else 'Medium' if mas > 40 else 'Low'})")
        print(f"  Uncertainty Avoidance: {uai:.1f} ({'High' if uai > 60 else 'Medium' if uai > 40 else 'Low'})")
        print(f"  Long-term Orientation: {lto:.1f} ({'High' if lto > 60 else 'Medium' if lto > 40 else 'Low'})")
        print(f"  Indulgence: {ivr:.1f} ({'High' if ivr > 60 else 'Medium' if ivr > 40 else 'Low'})")
        
        # Cultural interpretation
        print(f"\n🎯 Cultural Characteristics:")
        
        # Hierarchy (Power Distance)
        if pdi > 60:
            print(f"  • Hierarchical society - clear social ranks and authority")
        elif pdi < 40:
            print(f"  • Egalitarian society - flat social structure")
        else:
            print(f"  • Moderate hierarchy")
            
        # Social structure (Individualism)
        if idv > 60:
            print(f"  • Individualistic - personal achievement, self-reliance")
        elif idv < 40:
            print(f"  • Collectivistic - group loyalty, family/community first")
        else:
            print(f"  • Balanced individual/group focus")
            
        # Achievement style (Masculinity)
        if mas > 60:
            print(f"  • Achievement-oriented - competition, success, assertiveness")
        elif mas < 40:
            print(f"  • Relationship-oriented - cooperation, quality of life, caring")
        else:
            print(f"  • Balanced achievement/relationship focus")
            
        # Risk tolerance (Uncertainty Avoidance)
        if uai > 60:
            print(f"  • Rule-following - prefer structure, predictability, formal systems")
        elif uai < 40:
            print(f"  • Risk-tolerant - comfortable with ambiguity, flexible")
        else:
            print(f"  • Moderate risk tolerance")
            
        # Time perspective (Long-term Orientation)
        if lto > 60:
            print(f"  • Future-focused - planning, adaptation, perseverance")
        elif lto < 40:
            print(f"  • Tradition-focused - respect for customs, immediate results")
        else:
            print(f"  • Balanced time perspective")
            
        # Lifestyle (Indulgence)
        if ivr > 60:
            print(f"  • Expressive - free expression, optimism, enjoying life")
        elif ivr < 40:
            print(f"  • Restrained - controlled desires, social norms, duty")
        else:
            print(f"  • Moderate expression")
        
        print("\n" + "="*80 + "\n")

if __name__ == "__main__":
    analyze_clusters()