#!/usr/bin/env python3
"""
Test 5-day timeline fix with external priors system
Verifies that 5-day job search returns ~0.2% instead of 39.1%
"""

import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from web_search_rag import integrate_web_search_rag
from intelligent_baseline_search import integrate_intelligent_baseline_search
from external_priors import get_external_priors

def test_5day_timeline_fix():
    """Test that 5-day job search baseline is fixed to 0.2% instead of 39.1%"""
    
    print("🧪 TESTING 5-DAY TIMELINE FIX")
    print("=" * 50)
    
    # Test case that was returning 39.1% instead of ~0.2%
    goal_analysis = {
        'objective': 'finding the job within 5 days',
        'domain': 'career',
        'goal': 'job search within 5 days'
    }
    
    si_factors = {
        'age': 25,
        'experience_years': 2,
        'education_score': 85
    }
    
    # Mock monte carlo result (not relevant for this test)
    monte_carlo_result = {
        'projected_probability': 0.5,  # This should be overridden by RAG baseline
        'factors': ['age', 'experience', 'education']
    }
    
    print("🎯 Testing 5-day job search baseline...")
    print(f"   Goal: {goal_analysis['objective']}")
    print(f"   Domain: {goal_analysis['domain']}")
    print()
    
    # Test external priors directly first
    print("📊 Direct external priors test:")
    priors = get_external_priors()
    prior_value, confidence, source = priors.get_baseline_prior(goal_analysis['objective'])
    
    if prior_value:
        print(f"   ✅ External prior returns: {prior_value:.1%}")
        print(f"   📈 Confidence: {confidence}")
        print(f"   🔗 Source: {source}")
    else:
        print(f"   ❌ No external prior found")
    print()
    
    # Test traditional web search RAG 
    print("🔍 Traditional web search RAG test:")
    try:
        rag_result = integrate_web_search_rag(
            monte_carlo_result, 
            goal_analysis, 
            si_factors, 
            use_intelligent_search=False
        )
        
        baseline = rag_result.get('grounded_baseline', 0)
        confidence = rag_result.get('confidence', 'unknown')
        source = rag_result.get('source', 'unknown')
        
        print(f"   📊 RAG baseline: {baseline:.1%}")
        print(f"   📈 Confidence: {confidence}")
        print(f"   🔗 Source: {source}")
        
        # Check if it's in the expected range (0.01-2%)
        if 0.0001 <= baseline <= 0.02:
            print(f"   ✅ Baseline is in expected range (0.01-2%)")
        else:
            print(f"   ❌ Baseline outside expected range: {baseline:.1%}")
            
    except Exception as e:
        print(f"   ❌ Traditional RAG failed: {e}")
    
    print()
    
    # Test intelligent search system 
    print("🧠 Intelligent search system test:")
    try:
        intelligent_result = integrate_intelligent_baseline_search(
            monte_carlo_result,
            goal_analysis, 
            si_factors
        )
        
        baseline = intelligent_result.get('grounded_baseline', 0)
        confidence = intelligent_result.get('confidence', 'unknown')
        source = intelligent_result.get('source', 'unknown')
        
        print(f"   📊 Intelligent baseline: {baseline:.1%}")
        print(f"   📈 Confidence: {confidence}")
        print(f"   🔗 Source: {source}")
        
        # Check if it's in the expected range (0.01-2%)
        if 0.0001 <= baseline <= 0.02:
            print(f"   ✅ Baseline is in expected range (0.01-2%)")
        else:
            print(f"   ❌ Baseline outside expected range: {baseline:.1%}")
            
    except Exception as e:
        print(f"   ❌ Intelligent search failed: {e}")
    
    print()
    print("=" * 50)
    print("🎯 CONCLUSION:")
    if prior_value and 0.0001 <= prior_value <= 0.02:
        print("   ✅ External priors system working correctly")
        print(f"   ✅ 5-day timeline baseline fixed: {prior_value:.1%} (was 39.1%)")
    else:
        print("   ❌ External priors system needs debugging")

if __name__ == "__main__":
    test_5day_timeline_fix()