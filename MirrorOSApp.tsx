import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Switch,
  Share,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

// Use environment-configured API URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.20.35.3:8080';

// Debug logging
console.log('🔍 API_BASE_URL:', API_BASE_URL);
console.log('🔍 EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);

function MirrorOSApp() {
  const [goalText, setGoalText] = useState('');
  const [contextText, setContextText] = useState('');
  const [domain, setDomain] = useState('auto');
  const [confidenceLevel, setConfidenceLevel] = useState('standard');
  const [enhancedGrounding, setEnhancedGrounding] = useState(true);
  const [llmDomainDetection, setLlmDomainDetection] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [showChainOfThought, setShowChainOfThought] = useState(false);

  // Set demo authentication token on app load (simplified auth)
  useEffect(() => {
    const getDemoToken = async () => {
      try {
        // Set demo token directly for now (bypasses auth complexity)
        setAuthToken('demo-token-mobile-2025');
        console.log('✅ Demo authentication set');
      } catch (error) {
        console.log('Auth setup error (proceeding anyway):', error);
        setAuthToken('demo-token-mobile-2025'); // Fallback
      }
    };

    getDemoToken();
  }, []);

  const handlePredict = async () => {
    if (!goalText.trim()) {
      Alert.alert('Input Required', 'Please enter a goal to predict');
      return;
    }

    setLoading(true);
    try {
      // First get demo token if we don't have one
      if (!authToken) {
        try {
          const authResponse = await fetch(`${API_BASE_URL}/auth/demo-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ demo: true })
          });
          const authData = await authResponse.json();
          if (authResponse.ok && authData.access_token) {
            setAuthToken(authData.access_token);
            // Retry prediction with token
            return handlePredict();
          }
        } catch (authError) {
          console.error('Auth error:', authError);
        }
      }

      // Make real API prediction call
      console.log('🚀 Making request to:', `${API_BASE_URL}/predict`);
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: JSON.stringify({
          prediction_data: {
            goal: goalText.trim(),
            context: contextText.trim(),
            domain: domain,
            confidence_level: confidenceLevel,
            enhanced_grounding: enhancedGrounding,
            use_llm_domain_detection: llmDomainDetection
          }
        })
      });

      const data = await response.json();
      console.log('📦 Raw response data:', JSON.stringify(data, null, 2));
      console.log('🔍 Confidence interval check:', data.confidence_interval);
      console.log('🔍 Probability comparison check:', data.probability_comparison);
      console.log('🎯 Response probability:', data.probability);
      console.log('🧮 Math breakdown:', data.math_breakdown);
      
      if (response.ok) {
        setResult({
          probability: data.probability || 0.5,
          narrative: data.narrative || data.explanation || 'Prediction completed successfully.',
          chain_of_thought: data.chain_of_thought,
          math_breakdown: data.math_breakdown,
          factors: data.factors || data.top_factors,
          risks: data.risks || data.risk_factors,
          statistical_analysis: data.statistical_analysis,
          grounding_data: data.grounding_data,
          key_success_factors: data.key_success_factors,
          domain: data.domain || 'general',
          confidence_level: data.confidence_level || 'standard',
          outcome_category: data.outcome_category,
          confidence_interval: data.confidence_interval,
          probability_comparison: data.probability_comparison,
          si_factors_extracted: data.si_factors_extracted
        });
      } else {
        throw new Error(data.error || 'Prediction failed');
      }
    } catch (error) {
      console.error('Prediction error:', error);
      Alert.alert('Error', 'Prediction failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateShareableOdds = async () => {
    if (!result) return;
    
    try {
      console.log('🎨 Generating shareable odds...');
      const response = await fetch(`${API_BASE_URL}/shareable-odds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: JSON.stringify({
          prediction_data: {
            goal: goalText.trim(),
            context: contextText.trim(),
            user_name: 'MirrorOS User'
          }
        })
      });

      const data = await response.json();
      console.log('📦 Shareable odds response:', data);
      
      if (response.ok && data.sharing_data) {
        const shareText = data.sharing_data.sharing_text?.medium || 
                         `🔮 My MirrorOS prediction: ${Math.round(result.probability * 100)}% success probability for my goal!`;
        
        await Share.share({
          message: `${shareText}\n\n🚀 Predicted with MirrorOS - AI-powered goal achievement analysis`,
          title: 'My MirrorOS Prediction'
        });
      } else {
        Alert.alert('Share Error', 'Could not generate shareable content');
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Share Error', 'Could not share prediction');
    }
  };

  const clearResult = () => {
    setResult(null);
    setGoalText('');
    setContextText('');
    setShowChainOfThought(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>🔮 MirrorOS</Text>
          <Text style={styles.subtitle}>AI-Powered Future Prediction</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>What's your goal?</Text>
          <TextInput
            style={styles.textInput}
            value={goalText}
            onChangeText={setGoalText}
            placeholder="I want to get a software engineering job at Google within 6 months..."
            multiline={true}
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Context (Timeline, Budget, Background)</Text>
          <TextInput
            style={styles.smallTextInput}
            value={contextText}
            onChangeText={setContextText}
            placeholder="23-year-old Northwestern grad, working 10 hrs/week, living in SF..."
            multiline={true}
            numberOfLines={2}
            textAlignVertical="top"
          />

          <View style={styles.optionsSection}>
            <Text style={styles.sectionLabel}>Domain Selection</Text>
            <View style={styles.emojiButtonGrid}>
              <TouchableOpacity 
                style={[styles.emojiButton, domain === 'auto' && styles.emojiButtonSelected]}
                onPress={() => setDomain('auto')}
              >
                <Text style={styles.emojiButtonIcon}>🤖</Text>
                <Text style={styles.emojiButtonLabel}>Auto</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.emojiButton, domain === 'finance' && styles.emojiButtonSelected]}
                onPress={() => setDomain('finance')}
              >
                <Text style={styles.emojiButtonIcon}>💰</Text>
                <Text style={styles.emojiButtonLabel}>Finance</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.emojiButton, domain === 'career' && styles.emojiButtonSelected]}
                onPress={() => setDomain('career')}
              >
                <Text style={styles.emojiButtonIcon}>💼</Text>
                <Text style={styles.emojiButtonLabel}>Career</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.emojiButton, domain === 'dating' && styles.emojiButtonSelected]}
                onPress={() => setDomain('dating')}
              >
                <Text style={styles.emojiButtonIcon}>💕</Text>
                <Text style={styles.emojiButtonLabel}>Dating</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.emojiButton, domain === 'academic' && styles.emojiButtonSelected]}
                onPress={() => setDomain('academic')}
              >
                <Text style={styles.emojiButtonIcon}>🎓</Text>
                <Text style={styles.emojiButtonLabel}>Academic</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.emojiButton, domain === 'fitness' && styles.emojiButtonSelected]}
                onPress={() => setDomain('fitness')}
              >
                <Text style={styles.emojiButtonIcon}>💪</Text>
                <Text style={styles.emojiButtonLabel}>Fitness</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.emojiButton, domain === 'travel' && styles.emojiButtonSelected]}
                onPress={() => setDomain('travel')}
              >
                <Text style={styles.emojiButtonIcon}>✈️</Text>
                <Text style={styles.emojiButtonLabel}>Travel</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionLabel}>Confidence Level</Text>
            <View style={styles.confidenceButtonRow}>
              <TouchableOpacity 
                style={[styles.confidenceButton, confidenceLevel === 'standard' && styles.confidenceButtonSelected]}
                onPress={() => setConfidenceLevel('standard')}
              >
                <Text style={styles.confidenceButtonIcon}>🟢</Text>
                <Text style={styles.confidenceButtonLabel}>Low</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confidenceButton, confidenceLevel === 'high' && styles.confidenceButtonSelected]}
                onPress={() => setConfidenceLevel('high')}
              >
                <Text style={styles.confidenceButtonIcon}>🟡</Text>
                <Text style={styles.confidenceButtonLabel}>Medium</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confidenceButton, confidenceLevel === 'conservative' && styles.confidenceButtonSelected]}
                onPress={() => setConfidenceLevel('conservative')}
              >
                <Text style={styles.confidenceButtonIcon}>🔴</Text>
                <Text style={styles.confidenceButtonLabel}>High</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Enhanced Grounding</Text>
            <Switch
              value={enhancedGrounding}
              onValueChange={setEnhancedGrounding}
              trackColor={{ false: '#ccc', true: '#007AFF' }}
              thumbColor={enhancedGrounding ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>LLM Domain Detection</Text>
            <Switch
              value={llmDomainDetection}
              onValueChange={setLlmDomainDetection}
              trackColor={{ false: '#ccc', true: '#007AFF' }}
              thumbColor={llmDomainDetection ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handlePredict}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>🚀 Predict Future</Text>
            )}
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>🎯 Prediction Result</Text>
            
            <View style={styles.resultCard}>
              <Text style={styles.probabilityText}>
                Success Probability: {Math.round(result.probability * 100)}%
              </Text>
              
              {/* Confidence Interval Display */}
              {result.confidence_interval && Array.isArray(result.confidence_interval) && result.confidence_interval.length === 2 && (
                <Text style={styles.confidenceText}>
                  Range: {(result.confidence_interval[0] * 100).toFixed(1)}% - {(result.confidence_interval[1] * 100).toFixed(1)}%
                </Text>
              )}
              
              {/* Baseline Comparison Display */}
              {result.probability_comparison && (
                <View style={styles.comparisonSection}>
                  <Text style={styles.comparisonText}>
                    Your odds: {Math.round(result.probability * 100)}% | Average person: {Math.round(result.probability_comparison.baseline * 100)}%
                  </Text>
                  {result.probability_comparison.improvement_factor && (
                    <Text style={styles.advantageText}>
                      {result.probability_comparison.improvement_factor > 1 
                        ? `${result.probability_comparison.improvement_factor.toFixed(1)}x better` 
                        : `${(1/result.probability_comparison.improvement_factor).toFixed(1)}x harder`}
                    </Text>
                  )}
                </View>
              )}
              
              {/* SI Factors Breakdown Display */}
              {result.si_factors_extracted && Object.keys(result.si_factors_extracted).length > 0 && (
                <View style={styles.siFactorsSection}>
                  <Text style={styles.siFactorsTitle}>🔬 Analysis Factors</Text>
                  {Object.entries(result.si_factors_extracted).map(([key, value], idx) => (
                    <View key={idx} style={styles.siFactorRow}>
                      <Text style={styles.siFactorLabel}>
                        {key.replace(/_/g, ' ').replace(/ratio/g, '').trim().toUpperCase()}:
                      </Text>
                      <Text style={styles.siFactorValue}>
                        {typeof value === 'number' 
                          ? (key.includes('ratio') ? `${Math.round(value * 100)}%` : value.toString())
                          : value
                        }
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Domain and Confidence Info - Fixed styling */}
              <View style={styles.metadataRow}>
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>Domain:</Text>
                  <Text style={styles.metadataValue}>{result.domain || 'general'}</Text>
                </View>
                {result.outcome_category && (
                  <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Outcome:</Text>
                    <Text style={styles.metadataValue}>{result.outcome_category.replace(/_/g, ' ')}</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.resultText}>{result.narrative}</Text>
              
              {result.key_success_factors && result.key_success_factors.length > 0 && (
                <View style={styles.successFactorsSection}>
                  <Text style={styles.successFactorsTitle}>🎯 Key Success Factors:</Text>
                  {result.key_success_factors.map((factor, idx) => (
                    <Text key={idx} style={styles.successFactorText}>• {factor}</Text>
                  ))}
                </View>
              )}
            </View>

            {result.chain_of_thought && (
              <View style={styles.chainOfThoughtSection}>
                <TouchableOpacity 
                  style={styles.toggleButton}
                  onPress={() => setShowChainOfThought(!showChainOfThought)}
                >
                  <Text style={styles.toggleButtonText}>
                    🔍 {showChainOfThought ? 'Hide' : 'Show'} Chain of Thought
                  </Text>
                </TouchableOpacity>

                {showChainOfThought && (
                  <View style={styles.chainContent}>
                    {result.chain_of_thought.reasoning_steps && result.chain_of_thought.reasoning_steps.map((step, index) => (
                      <View key={index} style={styles.reasoningStep}>
                        <Text style={styles.stepDescription}>{step}</Text>
                      </View>
                    ))}
                    
                    {result.math_breakdown && (
                      <View style={styles.analysisSection}>
                        <Text style={styles.analysisTitle}>🔢 Mathematical Analysis</Text>
                        <Text style={styles.analysisText}>
                          Base Probability: {(result.math_breakdown.base_probability * 100).toFixed(1)}%
                        </Text>
                        <Text style={styles.analysisText}>
                          Final Score: {result.math_breakdown.logit_score?.toFixed(3)} logits
                        </Text>
                        <Text style={styles.analysisText}>
                          Final Probability: {(result.math_breakdown.final_probability * 100).toFixed(1)}%
                        </Text>
                        
                        {result.math_breakdown.positive_factors && result.math_breakdown.positive_factors.length > 0 && (
                          <View style={styles.factorSection}>
                            <Text style={styles.factorTitle}>✅ Positive Factors:</Text>
                            {result.math_breakdown.positive_factors.map((factor, idx) => (
                              <Text key={idx} style={styles.factorText}>
                                • {factor.name}: +{(factor.contribution * 100).toFixed(1)}%
                              </Text>
                            ))}
                          </View>
                        )}
                        
                        {result.math_breakdown.negative_factors && result.math_breakdown.negative_factors.length > 0 && (
                          <View style={styles.factorSection}>
                            <Text style={styles.factorTitle}>⚠️ Negative Factors:</Text>
                            {result.math_breakdown.negative_factors.map((factor, idx) => (
                              <Text key={idx} style={styles.factorText}>
                                • {factor.name}: {(factor.contribution * 100).toFixed(1)}%
                              </Text>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
            
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.shareButton} onPress={generateShareableOdds}>
                <Text style={styles.shareButtonText}>📤 Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.clearButton} onPress={clearResult}>
                <Text style={styles.clearButtonText}>🗑️ Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            MirrorOS v2.0 • Built with Expo & React Native
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  inputSection: {
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    minHeight: 80,
    marginBottom: 15,
  },
  smallTextInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    minHeight: 60,
    marginBottom: 15,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  optionGroup: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    height: 50,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#333',
    marginTop: -8,
    marginBottom: -8,
  },
  optionsSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emojiButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  emojiButton: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  emojiButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
  },
  emojiButtonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  emojiButtonLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  confidenceButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  confidenceButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    padding: 12,
    alignItems: 'center',
  },
  confidenceButtonSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
  },
  confidenceButtonIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  confidenceButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultSection: {
    padding: 20,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  resultCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  probabilityText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  confidenceText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  comparisonSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  comparisonText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  advantageText: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginTop: 10,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 5,
  },
  metadataItem: {
    flex: 1,
    alignItems: 'center',
  },
  metadataLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 2,
  },
  metadataValue: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 16,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  chainOfThoughtSection: {
    marginTop: 15,
  },
  toggleButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chainContent: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
  },
  reasoningStep: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 5,
  },
  stepWeight: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  analysisSection: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#e8f4ff',
    borderRadius: 8,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  factorSection: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 6,
  },
  factorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  factorText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
    paddingLeft: 5,
  },
  successFactorsSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  successFactorsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  successFactorText: {
    fontSize: 13,
    color: '#2E7D32',
    marginBottom: 2,
  },
  siFactorsSection: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  siFactorsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  siFactorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  siFactorLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    flex: 1,
  },
  siFactorValue: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'right',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default MirrorOSApp;