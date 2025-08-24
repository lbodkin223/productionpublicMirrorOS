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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

// Temporary: Use direct ALB endpoint until API Gateway integration is fixed
const API_BASE_URL = 'http://mirroros-alb-1426709742.us-east-2.elb.amazonaws.com/api';

function MirrorOSApp() {
  const [goalText, setGoalText] = useState('');
  const [contextText, setContextText] = useState('');
  const [domain, setDomain] = useState('auto');
  const [confidenceLevel, setConfidenceLevel] = useState('standard');
  const [enhancedGrounding, setEnhancedGrounding] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [showChainOfThought, setShowChainOfThought] = useState(false);

  // Get demo authentication token on app load
  useEffect(() => {
    const getDemoToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/demo-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ demo: true })
        });

        const data = await response.json();
        if (response.ok && data.access_token) {
          setAuthToken(data.access_token);
        } else {
          console.error('Failed to get demo token:', data);
        }
      } catch (error) {
        console.error('Demo login error:', error);
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
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          goal: goalText.trim(),
          context: contextText.trim(),
          domain: domain,
          confidence_level: confidenceLevel,
          enhanced_grounding: enhancedGrounding
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({
          probability: data.probability || 0.5,
          narrative: data.narrative || data.explanation || 'Prediction completed successfully.',
          chain_of_thought: data.chain_of_thought,
          factors: data.factors,
          risks: data.risks,
          statistical_analysis: data.statistical_analysis,
          grounding_data: data.grounding_data
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

          <View style={styles.optionsRow}>
            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Domain</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={domain}
                  onValueChange={setDomain}
                  style={styles.picker}
                >
                  <Picker.Item label="Auto-detect" value="auto" />
                  <Picker.Item label="Career" value="career" />
                  <Picker.Item label="Dating" value="dating" />
                  <Picker.Item label="Travel" value="travel" />
                  <Picker.Item label="Finance" value="finance" />
                  <Picker.Item label="Health" value="health" />
                </Picker>
              </View>
            </View>

            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Confidence</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={confidenceLevel}
                  onValueChange={setConfidenceLevel}
                  style={styles.picker}
                >
                  <Picker.Item label="Standard (90%)" value="standard" />
                  <Picker.Item label="High (95%)" value="high" />
                  <Picker.Item label="Conservative (99%)" value="conservative" />
                </Picker>
              </View>
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
              <Text style={styles.resultText}>{result.narrative}</Text>
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
                        <Text style={styles.stepTitle}>🧠 {step.step_name}</Text>
                        <Text style={styles.stepDescription}>{step.description}</Text>
                        {step.weight && <Text style={styles.stepWeight}>Weight: {step.weight}%</Text>}
                      </View>
                    ))}
                    
                    {result.statistical_analysis && (
                      <View style={styles.analysisSection}>
                        <Text style={styles.analysisTitle}>📊 Statistical Analysis</Text>
                        <Text style={styles.analysisText}>
                          Base Success Rate: {(result.statistical_analysis.base_success_rate * 100).toFixed(1)}%
                        </Text>
                        <Text style={styles.analysisText}>
                          Sample Size: {result.statistical_analysis.sample_size} studies
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
            
            <TouchableOpacity style={styles.clearButton} onPress={clearResult}>
              <Text style={styles.clearButtonText}>🗑️ Clear</Text>
            </TouchableOpacity>
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
  },
  optionGroup: {
    flex: 1,
    marginHorizontal: 5,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 40,
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
    marginBottom: 10,
    textAlign: 'center',
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  clearButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
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
});

export default MirrorOSApp;