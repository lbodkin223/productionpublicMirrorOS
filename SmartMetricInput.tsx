import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

// Comprehensive metric pattern recognition (matches smart_metric_patterns.py)
const METRIC_PATTERNS = {
  // Physical & Fitness
  HEIGHT: {
    patterns: [
      /(\d+(?:\.\d+)?)\s*(?:feet|ft|foot|')\s*(\d+(?:\.\d+)?)?/i,
      /(\d+(?:\.\d+)?)\s*(?:inches?|in|")/i,
      /(\d+(?:\.\d+)?)\s*(?:cm|centimeters?)/i,
      /(height|tall|how tall).*?(\d+(?:\.\d+)?)/i,
      /(\d+)'\s*(\d+)"/,
    ],
    units: ['feet/inches', 'inches', 'cm', 'meters'],
    defaultUnit: 'feet/inches',
    description: 'Physical height',
  },
  
  WEIGHT: {
    patterns: [
      /(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?)/i,
      /(\d+(?:\.\d+)?)\s*(?:kg|kilograms?)/i,
      /(weigh|weight).*?(\d+(?:\.\d+)?)/i,
      /scale.*?(\d+(?:\.\d+)?)/i,
    ],
    units: ['lbs', 'kg'],
    defaultUnit: 'lbs',
    description: 'Body weight',
  },

  WORKOUT_FREQUENCY: {
    patterns: [
      /(workout|exercise|train|gym).*?(\d+(?:\.\d+)?)\s*(?:times?.*?week|days?.*?week)/i,
      /(\d+(?:\.\d+)?)\s*(?:times?.*?week).*?(workout|exercise|train|gym)/i,
      /gym\s*(\d+)/i,
    ],
    units: ['times per week', 'days per week'],
    defaultUnit: 'times per week',
    description: 'Weekly workout frequency',
  },

  // Academic
  GPA: {
    patterns: [
      /(gpa|grade\s*point).*?(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*gpa/i,
      /grades?.*?(\d+(?:\.\d+)?)/i,
      /academic.*?(\d+(?:\.\d+)?)/i,
    ],
    units: ['4.0 scale', '100 scale'],
    defaultUnit: '4.0 scale',
    description: 'Grade Point Average',
  },

  TEST_SCORE: {
    patterns: [
      /(gmat).*?(\d+)/i,
      /(\d+).*?(gmat)/i,
      /(gre).*?(\d+)/i,
      /(\d+).*?(gre)/i,
      /(lsat).*?(\d+)/i,
      /(mcat).*?(\d+)/i,
      /(sat).*?(\d+)/i,
      /(act).*?(\d+)/i,
      /scored?\s*(\d+).*?(gmat|gre|lsat|mcat|sat|act)/i,
    ],
    units: ['raw score'],
    defaultUnit: 'raw score',
    description: 'Standardized test score',
  },

  // Career
  EXPERIENCE: {
    patterns: [
      /(\d+(?:\.\d+)?)\s*years?.*?(experience|exp|work)/i,
      /(experience|exp|work).*?(\d+(?:\.\d+)?)\s*years?/i,
      /(worked|been working).*?(\d+(?:\.\d+)?)\s*years?/i,
      /career.*?(\d+(?:\.\d+)?)\s*years?/i,
    ],
    units: ['years', 'months'],
    defaultUnit: 'years',
    description: 'Work experience',
  },

  SALARY: {
    patterns: [
      /\$(\d+(?:,\d+)?(?:k|000)?)/i,
      /(salary|income|earn|paid|make).*?\$?(\d+(?:,\d+)?(?:k|000)?)/i,
      /(make|earn).*?\$?(\d+(?:,\d+)?(?:k|000)?)/i,
    ],
    units: ['annual', 'monthly', 'hourly'],
    defaultUnit: 'annual',
    description: 'Salary/income',
  },

  MANAGEMENT: {
    patterns: [
      /(manage|lead|supervise|oversee).*?(\d+)/i,
      /(team\s*size|team).*?(\d+)/i,
      /(\d+).*?(direct\s*)?reports?/i,
      /(\d+)\s*(people|employees|staff|members)/i,
    ],
    units: ['people'],
    defaultUnit: 'people',
    description: 'Team management',
  },

  // Financial
  SAVINGS: {
    patterns: [
      /(saved|savings|cash).*?\$?(\d+(?:,\d+)?(?:k|000)?)/i,
      /\$(\d+(?:,\d+)?(?:k|000)?).*?(saved|savings|cash)/i,
      /(emergency\s*fund|rainy\s*day).*?\$?(\d+(?:,\d+)?(?:k|000)?)/i,
    ],
    units: ['dollars'],
    defaultUnit: 'dollars',
    description: 'Savings amount',
  },

  CREDIT_SCORE: {
    patterns: [
      /(credit\s*score|fico).*?(\d+)/i,
      /(\d+).*?(credit\s*score|fico)/i,
    ],
    units: ['FICO score'],
    defaultUnit: 'FICO score',
    description: 'Credit rating',
  },

  // Business
  REVENUE: {
    patterns: [
      /(revenue|sales).*?\$?(\d+(?:\.\d+)?(?:,\d+)?(?:k|m|000|million)?)/i,
      /\$(\d+(?:\.\d+)?(?:,\d+)?(?:k|m|000|million)?).*?(revenue|sales)/i,
      /(mrr|monthly\s*recurring\s*revenue).*?\$?(\d+(?:\.\d+)?(?:,\d+)?(?:k|000)?)/i,
    ],
    units: ['annual', 'monthly'],
    defaultUnit: 'annual',
    description: 'Business revenue',
  },

  EMPLOYEES: {
    patterns: [
      /(employees|staff|headcount|team\s*size).*?(\d+)/i,
      /(\d+)\s*(employees|staff|people|members)/i,
      /workforce.*?(\d+)/i,
    ],
    units: ['people'],
    defaultUnit: 'people',
    description: 'Number of employees',
  },

  // General
  AGE: {
    patterns: [
      /(i\s*am|age|aged)\s*(\d+)/i,
      /(\d+)\s*(years?\s*old|yo|yrs?\s*old)/i,
      /age.*?(\d+)/i,
    ],
    units: ['years'],
    defaultUnit: 'years',
    description: 'Age',
  },

  TIMELINE: {
    patterns: [
      /(in|within|over)\s*(\d+(?:\.\d+)?)\s*(months?|mos?)/i,
      /(in|within|over)\s*(\d+(?:\.\d+)?)\s*(years?|yrs?)/i,
      /(in|within|over)\s*(\d+(?:\.\d+)?)\s*(weeks?|wks?)/i,
    ],
    units: ['months', 'years', 'weeks', 'days'],
    defaultUnit: 'months',
    description: 'Timeline/deadline',
  },
};

interface MetricItem {
  id: string;
  type: string;
  value: string;
  unit: string;
  isRatio: boolean;
  ratioValue: number;
  originalInput: string;
}

interface SmartMetricInputProps {
  onMetricsChange: (metrics: Record<string, any>) => void;
  initialContext?: string;
}

const SmartMetricInput: React.FC<SmartMetricInputProps> = ({ 
  onMetricsChange,
  initialContext = ''
}) => {
  const [metrics, setMetrics] = useState<MetricItem[]>([]);
  const [textInput, setTextInput] = useState('');
  const [detectedMetrics, setDetectedMetrics] = useState<string[]>([]);

  // Initialize with existing context if provided
  useEffect(() => {
    if (initialContext) {
      parseInitialContext(initialContext);
    }
  }, [initialContext]);

  // Update parent component when metrics change
  useEffect(() => {
    const metricData = convertMetricsToStructuredFormat(metrics);
    onMetricsChange(metricData);
  }, [metrics]);

  const parseInitialContext = (context: string) => {
    const detectedMetricItems: MetricItem[] = [];
    const detected: string[] = [];

    for (const [metricType, config] of Object.entries(METRIC_PATTERNS)) {
      for (const pattern of config.patterns) {
        const match = context.match(pattern);
        if (match) {
          const value = extractNumericValue(match);
          if (value !== null) {
            detectedMetricItems.push({
              id: Date.now().toString() + Math.random(),
              type: metricType,
              value: value.toString(),
              unit: config.defaultUnit,
              isRatio: false,
              ratioValue: 0.5,
              originalInput: match[0],
            });
            detected.push(metricType);
            break; // Only detect once per type
          }
        }
      }
    }

    setMetrics(detectedMetricItems);
    setDetectedMetrics(detected);
  };

  const extractNumericValue = (match: RegExpMatchArray): number | null => {
    for (let i = 1; i < match.length; i++) {
      const group = match[i];
      if (group && /\d/.test(group)) {
        let numStr = group.replace(/[^\d.]/g, '');
        if (numStr) {
          const num = parseFloat(numStr);
          if (!isNaN(num)) {
            // Handle k/m suffixes
            const originalGroup = group.toLowerCase();
            if (originalGroup.includes('k')) return num * 1000;
            if (originalGroup.includes('m') && !originalGroup.includes('million')) return num * 1000000;
            if (originalGroup.includes('000')) return num * 1000;
            return num;
          }
        }
      }
    }
    return null;
  };

  const detectMetricFromInput = (input: string): { type: string; config: any; value: number } | null => {
    const inputLower = input.toLowerCase().trim();
    
    for (const [metricType, config] of Object.entries(METRIC_PATTERNS)) {
      for (const pattern of config.patterns) {
        const match = inputLower.match(pattern);
        if (match) {
          const value = extractNumericValue(match);
          if (value !== null) {
            return { type: metricType, config, value };
          }
        }
      }
    }
    return null;
  };

  const handleTextInputSubmit = () => {
    if (!textInput.trim()) return;

    const detection = detectMetricFromInput(textInput);
    
    if (detection) {
      // Add structured metric
      const newMetric: MetricItem = {
        id: Date.now().toString(),
        type: detection.type,
        value: detection.value.toString(),
        unit: detection.config.defaultUnit,
        isRatio: false,
        ratioValue: 0.5,
        originalInput: textInput.trim(),
      };

      setMetrics(prev => [...prev, newMetric]);
      setDetectedMetrics(prev => [...prev, detection.type]);
    } else {
      // Add qualitative metric with ratio slider
      const newMetric: MetricItem = {
        id: Date.now().toString(),
        type: 'QUALITATIVE',
        value: '',
        unit: 'ratio',
        isRatio: true,
        ratioValue: 0.5,
        originalInput: textInput.trim(),
      };

      setMetrics(prev => [...prev, newMetric]);
    }

    setTextInput('');
  };

  const updateMetric = (id: string, updates: Partial<MetricItem>) => {
    setMetrics(prev => prev.map(metric => 
      metric.id === id ? { ...metric, ...updates } : metric
    ));
  };

  const removeMetric = (id: string) => {
    setMetrics(prev => {
      const updated = prev.filter(metric => metric.id !== id);
      const removedMetric = prev.find(metric => metric.id === id);
      if (removedMetric) {
        setDetectedMetrics(prevDetected => 
          prevDetected.filter(type => type !== removedMetric.type)
        );
      }
      return updated;
    });
  };

  const convertMetricsToStructuredFormat = (metrics: MetricItem[]): Record<string, any> => {
    const result: Record<string, any> = {};
    
    metrics.forEach(metric => {
      if (metric.isRatio) {
        result[`${metric.originalInput.replace(/\s+/g, '_').toLowerCase()}_ratio`] = metric.ratioValue;
      } else {
        const keyName = `${metric.type.toLowerCase()}_${metric.unit.replace(/\s+/g, '_')}`;
        result[keyName] = {
          value: parseFloat(metric.value) || 0,
          unit: metric.unit,
        };
      }
    });

    return result;
  };

  const formatMetricTypeDisplay = (type: string): string => {
    return type.toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const suggestMetricsForInput = (input: string): string[] => {
    const suggestions: string[] = [];
    const inputLower = input.toLowerCase();

    // Domain-based suggestions
    if (inputLower.includes('job') || inputLower.includes('career') || inputLower.includes('work')) {
      suggestions.push('EXPERIENCE', 'SALARY', 'GPA', 'AGE');
    }
    if (inputLower.includes('weight') || inputLower.includes('fitness') || inputLower.includes('workout')) {
      suggestions.push('WEIGHT', 'HEIGHT', 'WORKOUT_FREQUENCY', 'AGE');
    }
    if (inputLower.includes('business') || inputLower.includes('startup') || inputLower.includes('company')) {
      suggestions.push('REVENUE', 'EMPLOYEES', 'EXPERIENCE', 'SAVINGS');
    }
    if (inputLower.includes('school') || inputLower.includes('college') || inputLower.includes('university')) {
      suggestions.push('GPA', 'TEST_SCORE', 'AGE');
    }
    if (inputLower.includes('house') || inputLower.includes('buy') || inputLower.includes('mortgage')) {
      suggestions.push('SAVINGS', 'SALARY', 'CREDIT_SCORE', 'AGE');
    }

    return [...new Set(suggestions)].filter(type => !detectedMetrics.includes(type));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧠 Smart Metric Input</Text>
      <Text style={styles.subtitle}>Add metrics as you type - AI will detect patterns automatically</Text>

      {/* Text Input with Smart Detection */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={textInput}
          onChangeText={setTextInput}
          placeholder="e.g., I am 25 years old, weigh 170 lbs, have a 3.8 GPA..."
          placeholderTextColor="#999"
          multiline
          onSubmitEditing={handleTextInputSubmit}
        />
        <TouchableOpacity 
          style={[styles.addButton, !textInput.trim() && styles.addButtonDisabled]}
          onPress={handleTextInputSubmit}
          disabled={!textInput.trim()}
        >
          <Text style={styles.addButtonText}>Add +</Text>
        </TouchableOpacity>
      </View>

      {/* Metric Suggestions */}
      {textInput.length > 3 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>💡 Suggested Metrics:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.suggestionsList}>
              {suggestMetricsForInput(textInput).slice(0, 5).map(suggestion => (
                <TouchableOpacity
                  key={suggestion}
                  style={styles.suggestionChip}
                  onPress={() => {
                    const config = METRIC_PATTERNS[suggestion as keyof typeof METRIC_PATTERNS];
                    if (config) {
                      setTextInput(prev => `${prev} ${config.description}: `);
                    }
                  }}
                >
                  <Text style={styles.suggestionText}>
                    {formatMetricTypeDisplay(suggestion)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Current Metrics */}
      {metrics.length > 0 && (
        <View style={styles.metricsContainer}>
          <Text style={styles.metricsTitle}>📊 Current Metrics ({metrics.length})</Text>
          
          {metrics.map(metric => (
            <View key={metric.id} style={styles.metricItem}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricType}>
                  {metric.type === 'QUALITATIVE' ? '🎯 ' + metric.originalInput : formatMetricTypeDisplay(metric.type)}
                </Text>
                <TouchableOpacity onPress={() => removeMetric(metric.id)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              {metric.isRatio ? (
                // Ratio Controls for qualitative metrics
                <View style={styles.ratioContainer}>
                  <Text style={styles.ratioLabel}>Rate from 0% to 100%:</Text>
                  <View style={styles.ratioControls}>
                    {[0.1, 0.25, 0.5, 0.75, 0.9].map((value) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.ratioButton,
                          metric.ratioValue === value && styles.ratioButtonActive
                        ]}
                        onPress={() => updateMetric(metric.id, { ratioValue: value })}
                      >
                        <Text style={[
                          styles.ratioButtonText,
                          metric.ratioValue === value && styles.ratioButtonTextActive
                        ]}>
                          {Math.round(value * 100)}%
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.ratioValue}>{Math.round(metric.ratioValue * 100)}%</Text>
                </View>
              ) : (
                // Structured input for quantifiable metrics
                <View style={styles.structuredContainer}>
                  <View style={styles.valueInputContainer}>
                    <TextInput
                      style={styles.valueInput}
                      value={metric.value}
                      onChangeText={(value) => updateMetric(metric.id, { value })}
                      placeholder="Value"
                      keyboardType="numeric"
                    />
                    
                    <View style={styles.unitPickerContainer}>
                      <Picker
                        selectedValue={metric.unit}
                        onValueChange={(unit) => updateMetric(metric.id, { unit })}
                        style={styles.unitPicker}
                      >
                        {METRIC_PATTERNS[metric.type as keyof typeof METRIC_PATTERNS]?.units.map(unit => (
                          <Picker.Item key={unit} label={unit} value={unit} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                  
                  <Text style={styles.originalInput}>"{metric.originalInput}"</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Structured Output Preview */}
      {metrics.length > 0 && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>🔍 Structured Output Preview:</Text>
          <Text style={styles.previewText}>
            {Object.entries(convertMetricsToStructuredFormat(metrics))
              .map(([key, value]) => {
                if (typeof value === 'object' && value.value !== undefined) {
                  return `${key}: ${value.value} ${value.unit}`;
                } else {
                  return `${key}: ${Math.round(Number(value) * 100)}%`;
                }
              })
              .join(', ')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 15,
  },
  
  // Input Section
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
    marginRight: 10,
    backgroundColor: '#f9fafb',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Suggestions
  suggestionsContainer: {
    marginBottom: 15,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 8,
  },
  suggestionsList: {
    flexDirection: 'row',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  suggestionText: {
    fontSize: 12,
    color: '#1d4ed8',
    fontWeight: '500',
  },

  // Metrics Container
  metricsContainer: {
    marginBottom: 15,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  
  // Individual Metric Item
  metricItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a202c',
    flex: 1,
  },
  removeButton: {
    fontSize: 18,
    color: '#dc2626',
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },

  // Ratio Controls
  ratioContainer: {
    alignItems: 'center',
  },
  ratioLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  ratioControls: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  ratioButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    minWidth: 45,
    alignItems: 'center',
  },
  ratioButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  ratioButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  ratioButtonTextActive: {
    color: '#ffffff',
  },
  ratioValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 5,
  },

  // Structured Input
  structuredContainer: {
    gap: 8,
  },
  valueInputContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  valueInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  unitPickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  unitPicker: {
    height: 44,
  },
  originalInput: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Preview
  previewContainer: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
    marginBottom: 5,
  },
  previewText: {
    fontSize: 11,
    color: '#166534',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});

export default SmartMetricInput;