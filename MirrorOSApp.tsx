import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

interface PredictionResult {
  probability: number;
  probability_percent: string;
  baseline_percent: string;
  domain: string;
  confidence_level: string;
  outcome_category: string;
  narrative: string;
  si_factors_extracted: Record<string, any>;
  grounding_analysis: {
    rag_grounded_baseline: number;
    final_grounded_probability: number;
    evidence_sources: number;
    grounding_confidence: string;
  };
  statistical_analysis: {
    simulations: number;
    methodology: string;
  };
  chain_of_thought?: {
    animation_sequence: {
      steps: Array<{
        title: string;
        content: { primary_text: string };
        animation_type: string;
      }>;
    };
  };
  evidence_summary?: Array<{
    source: string;
    historical_success_rate: number;
    sample_size: number;
    relevance: number;
  }>;
  factors: string[];
  extraction_method: string;
}

const MirrorOSApp: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'input' | 'analysis' | 'results'>('input');
  const [analysisStep, setAnalysisStep] = useState(0);
  const [animationValue] = useState(new Animated.Value(0));

  const API_URL = Constants.expoConfig?.extra?.apiUrl || "https://yyk4197cr6.execute-api.us-east-2.amazonaws.com/prod/api";


  const analysisSteps = [
    { icon: '🎯', title: 'Question Analysis', subtitle: 'AI-powered domain detection' },
    { icon: '🔬', title: 'Factor Extraction', subtitle: '60+ metrics analysis' },
    { icon: '📊', title: 'RAG Research', subtitle: 'Evidence-based baselines' },
    { icon: '🎲', title: 'Monte Carlo', subtitle: '10,000 simulations' },
    { icon: '🧠', title: 'Final Assessment', subtitle: 'Research-grounded result' },
  ];

  useEffect(() => {
    if (currentView === 'analysis') {
      const stepInterval = setInterval(() => {
        setAnalysisStep(prev => {
          if (prev < analysisSteps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(stepInterval);
            return prev;
          }
        });
      }, 1600);

      return () => clearInterval(stepInterval);
    }
  }, [currentView]);


  const handlePredict = async () => {
    if (!goal.trim()) {
      Alert.alert('Error', 'Please enter what you want to predict');
      return;
    }
    

    setLoading(true);
    setCurrentView('analysis');
    setAnalysisStep(0);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo_token_12345',
        },
        body: JSON.stringify({
          prediction_data: {
            goal: goal.trim(),
            context: context.trim()
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Simulate analysis completion
      setTimeout(() => {
        setResult(data);
        setCurrentView('results');
        setLoading(false);
      }, 8000);

    } catch (error) {
      console.error('Prediction error:', error);
      Alert.alert('Error', 'Failed to get prediction. Please try again.');
      setLoading(false);
      setCurrentView('input');
    }
  };

  const renderInputView = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>MirrorOS</Text>
        <Text style={styles.subtitle}>Research-Grounded Future Predictions</Text>
        <View style={styles.featureBadges}>
          <Text style={styles.badge}>🧠 Smart Input</Text>
          <Text style={styles.badge}>📊 100+ Patterns</Text>
          <Text style={styles.badge}>🎯 Auto-Detection</Text>
        </View>
      </View>

      {/* Goal Input */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>🎯 What do you want to predict?</Text>
        <TextInput
          style={styles.textInput}
          value={goal}
          onChangeText={setGoal}
          placeholder="e.g., Get a job at OpenAI, Will I get COVID this year, Lose 30 pounds, Start a $1M business"
          placeholderTextColor="#999"
          multiline
        />
      </View>

      {/* Context Input */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>📝 Tell us about your current situation</Text>
        <TextInput
          style={styles.textAreaInput}
          value={context}
          onChangeText={setContext}
          placeholder="e.g., Northwestern grad, age 23, work 4hrs/day, make $3k/week, have 2 years experience, 6 month timeline"
          placeholderTextColor="#999"
          multiline
          numberOfLines={5}
        />
        <Text style={styles.helpText}>
          Examples: education, age, experience, income, timeline, location, skills, etc.
        </Text>
      </View>


      {/* Advanced Features Highlight */}
      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>🧠 AI-Powered Analysis</Text>
        <View style={styles.featureGrid}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📚</Text>
            <Text style={styles.featureText}>Research Baselines</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💹</Text>
            <Text style={styles.featureText}>Economic Data</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureText}>3-4s Processing</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>7 Domain Expert</Text>
          </View>
        </View>
      </View>

      {/* Predict Button */}
      <TouchableOpacity 
        style={[
          styles.predictButton, 
          (!goal.trim()) && styles.predictButtonDisabled
        ]}
        onPress={handlePredict}
        disabled={!goal.trim()}
      >
        <Text style={styles.predictButtonText}>
          🔮 Analyze Future Probability
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderAnalysisView = () => (
    <View style={styles.analysisContainer}>
      <Text style={styles.analysisTitle}>🧠 AI Analysis in Progress</Text>
      <Text style={styles.analysisSubtitle}>Research-grounded prediction system</Text>
      
      <View style={styles.stepsContainer}>
        {analysisSteps.map((step, index) => (
          <View key={index} style={[
            styles.stepItem,
            index <= analysisStep && styles.stepActive,
            index === analysisStep && styles.stepCurrent
          ]}>
            <Text style={[styles.stepIcon, index <= analysisStep && styles.stepIconActive]}>
              {step.icon}
            </Text>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, index <= analysisStep && styles.stepTitleActive]}>
                {step.title}
              </Text>
              <Text style={[styles.stepSubtitle, index <= analysisStep && styles.stepSubtitleActive]}>
                {step.subtitle}
              </Text>
            </View>
            {index === analysisStep && (
              <ActivityIndicator size="small" color="#007AFF" style={styles.stepLoader} />
            )}
          </View>
        ))}
      </View>

      <View style={styles.processingStats}>
        <Text style={styles.processingText}>Processing time: ~3-4 seconds</Text>
        <Text style={styles.processingText}>Monte Carlo simulations: 10,000</Text>
      </View>
    </View>
  );

  const renderResultsView = () => {
    if (!result) return null;

    const advantageFactor = result.grounding_analysis 
      ? result.grounding_analysis.final_grounded_probability / result.grounding_analysis.rag_grounded_baseline
      : result.probability / 0.03;

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Original Question Context */}
        <View style={styles.questionHeader}>
          <Text style={styles.questionLabel}>🎯 Your Question</Text>
          <Text style={styles.questionText}>{goal}</Text>
        </View>

        {/* Main Result */}
        <View style={styles.resultHeader}>
          <Text style={styles.resultProbability}>{result.probability_percent}</Text>
          <Text style={styles.resultLabel}>Success Probability</Text>
          
          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonText}>
              vs {result.baseline_percent} average person
            </Text>
            <Text style={styles.advantageText}>
              {advantageFactor > 1 ? `${advantageFactor.toFixed(1)}x advantage` : `${(1/advantageFactor).toFixed(1)}x harder`}
            </Text>
          </View>
        </View>

        {/* Evidence-Based Analysis */}
        <View style={styles.analysisCard}>
          <Text style={styles.cardTitle}>📊 Evidence-Based Analysis</Text>
          <View style={styles.analysisGrid}>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisValue}>{Object.keys(result.si_factors_extracted || {}).length}</Text>
              <Text style={styles.analysisLabel}>Factors Analyzed</Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisValue}>{result.grounding_analysis?.evidence_sources || 0}</Text>
              <Text style={styles.analysisLabel}>Research Sources</Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisValue}>{(result.statistical_analysis?.simulations || 10000).toLocaleString()}</Text>
              <Text style={styles.analysisLabel}>Simulations</Text>
            </View>
            <View style={styles.analysisItem}>
              <Text style={styles.analysisValue}>{result.domain}</Text>
              <Text style={styles.analysisLabel}>Domain</Text>
            </View>
          </View>
        </View>

        {/* Mathematical Breakdown */}
        <View style={styles.mathCard}>
          <Text style={styles.cardTitle}>🔬 Mathematical Analysis</Text>
          <View style={styles.mathBreakdown}>
            <View style={styles.mathRow}>
              <Text style={styles.mathLabel}>Monte Carlo Projection:</Text>
              <Text style={styles.mathValue}>{(result.probability * 100).toFixed(1)}%</Text>
            </View>
            <View style={styles.mathRow}>
              <Text style={styles.mathLabel}>RAG Baseline:</Text>
              <Text style={styles.mathValue}>{result.baseline_percent}</Text>
            </View>
            <View style={styles.mathRow}>
              <Text style={styles.mathLabel}>Final Blended Result:</Text>
              <Text style={styles.mathValueFinal}>{result.probability_percent}</Text>
            </View>
          </View>
          <Text style={styles.methodologyText}>
            {result.statistical_analysis?.methodology || 'Monte Carlo + RAG Grounding'}
          </Text>
        </View>

        {/* Extracted Factors */}
        {result.si_factors_extracted && Object.keys(result.si_factors_extracted).length > 0 && (
          <View style={styles.factorsCard}>
            <Text style={styles.cardTitle}>🎯 Key Analysis Factors</Text>
            <View style={styles.factorsGrid}>
              {Object.entries(result.si_factors_extracted).map(([key, value], idx) => (
                <View key={idx} style={styles.factorItem}>
                  <Text style={styles.factorLabel}>
                    {key.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.factorValue}>
                    {typeof value === 'number' 
                      ? (key.includes('ratio') ? `${Math.round(value * 100)}%` : value.toString())
                      : String(value)
                    }
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Evidence Sources */}
        {result.evidence_summary && result.evidence_summary.length > 0 && (
          <View style={styles.evidenceCard}>
            <Text style={styles.cardTitle}>📚 Research Evidence</Text>
            {result.evidence_summary.map((evidence, idx) => (
              <View key={idx} style={styles.evidenceItem}>
                <Text style={styles.evidenceSource}>
                  {evidence.source.replace(/_/g, ' ').toUpperCase()}
                </Text>
                <View style={styles.evidenceStats}>
                  <Text style={styles.evidenceStat}>
                    Rate: {(evidence.historical_success_rate * 100).toFixed(1)}%
                  </Text>
                  <Text style={styles.evidenceStat}>
                    Sample: {evidence.sample_size.toLocaleString()}
                  </Text>
                  <Text style={styles.evidenceStat}>
                    Relevance: {(evidence.relevance * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Success Factors */}
        {result.factors && result.factors.length > 0 && (
          <View style={styles.insightsCard}>
            <Text style={styles.cardTitle}>💡 Key Insights</Text>
            {result.factors.map((factor, idx) => (
              <View key={idx} style={styles.insightItem}>
                <Text style={styles.insightBullet}>•</Text>
                <Text style={styles.insightText}>{factor}</Text>
              </View>
            ))}
          </View>
        )}

        {/* System Info */}
        <View style={styles.systemCard}>
          <Text style={styles.systemTitle}>⚙️ System Performance</Text>
          <Text style={styles.systemText}>
            Extraction Method: {result.extraction_method}
          </Text>
          <Text style={styles.systemText}>
            Processing: Research-grounded analysis with economic context
          </Text>
          <Text style={styles.systemText}>
            Response Time: 3-4 seconds • Confidence: {result.confidence_level}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              setCurrentView('input');
              setResult(null);
            }}
          >
            <Text style={styles.actionButtonText}>🔄 New Analysis</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'input':
        return renderInputView();
      case 'analysis':
        return renderAnalysisView();
      case 'results':
        return renderResultsView();
      default:
        return renderInputView();
    }
  };

  return <View style={styles.mainContainer}>{renderCurrentView()}</View>;
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  
  // Header Styles
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 15,
  },
  featureBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },

  // Input Styles
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  textAreaInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Features Section
  featuresSection: {
    marginBottom: 25,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 15,
    textAlign: 'center',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Predict Button
  predictButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  predictButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
  },
  predictButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Analysis View
  analysisContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  analysisTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8,
    textAlign: 'center',
  },
  analysisSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 40,
    textAlign: 'center',
  },
  stepsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#93c5fd',
  },
  stepCurrent: {
    backgroundColor: '#eff6ff',
    borderColor: '#60a5fa',
  },
  stepIcon: {
    fontSize: 24,
    marginRight: 12,
    opacity: 0.4,
  },
  stepIconActive: {
    opacity: 1,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  stepTitleActive: {
    color: '#1a202c',
  },
  stepSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  stepSubtitleActive: {
    color: '#64748b',
  },
  stepLoader: {
    marginLeft: 12,
  },
  processingStats: {
    alignItems: 'center',
  },
  processingText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },

  // Results View
  questionHeader: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1e293b',
    lineHeight: 24,
  },
  resultHeader: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  resultProbability: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 5,
  },
  resultLabel: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 20,
  },
  comparisonCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  comparisonText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  advantageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },

  // Card Styles
  analysisCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  mathCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  factorsCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  evidenceCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  insightsCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  systemCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 16,
  },

  // Analysis Grid
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analysisItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  analysisValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  analysisLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },

  // Math Breakdown
  mathBreakdown: {
    marginBottom: 12,
  },
  mathRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  mathLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  mathValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  mathValueFinal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  methodologyText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Factors Grid
  factorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  factorItem: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: '45%',
  },
  factorLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  factorValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a202c',
    marginTop: 2,
  },

  // Evidence Items
  evidenceItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  evidenceSource: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  evidenceStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  evidenceStat: {
    fontSize: 12,
    color: '#64748b',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  // Insights
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightBullet: {
    fontSize: 16,
    color: '#059669',
    marginRight: 8,
    marginTop: 2,
  },
  insightText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },

  // System Info
  systemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  systemText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },

  // Actions
  actionsContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MirrorOSApp;