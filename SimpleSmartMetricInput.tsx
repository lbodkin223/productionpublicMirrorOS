import React, { useState } from 'react';
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

interface MetricSuggestion {
  key: string;
  label: string;
  units: string[];
  defaultUnit: string;
}

interface Metric {
  id: string;
  key: string;
  label: string;
  value: string;
  unit: string;
}

interface SimpleSmartMetricInputProps {
  onMetricsChange: (contextString: string) => void;
}

const SimpleSmartMetricInput: React.FC<SimpleSmartMetricInputProps> = ({ onMetricsChange }) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [currentValue, setCurrentValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Simple metric suggestions
  const metricSuggestions: MetricSuggestion[] = [
    { key: 'age', label: 'Age', units: ['years'], defaultUnit: 'years' },
    { key: 'weight_current', label: 'Current Weight', units: ['lbs', 'kg'], defaultUnit: 'lbs' },
    { key: 'weight_target', label: 'Target Weight', units: ['lbs', 'kg'], defaultUnit: 'lbs' },
    { key: 'height', label: 'Height', units: ['feet/inches', 'inches', 'cm'], defaultUnit: 'feet/inches' },
    { key: 'gpa', label: 'GPA', units: ['4.0 scale', '100 scale'], defaultUnit: '4.0 scale' },
    { key: 'experience_years', label: 'Years Experience', units: ['years'], defaultUnit: 'years' },
    { key: 'salary', label: 'Salary', units: ['annual', 'monthly', 'hourly'], defaultUnit: 'annual' },
    { key: 'savings', label: 'Savings', units: ['dollars'], defaultUnit: 'dollars' },
    { key: 'workout_frequency', label: 'Workouts Per Week', units: ['times per week'], defaultUnit: 'times per week' },
    { key: 'study_hours', label: 'Study Hours Per Week', units: ['hours per week'], defaultUnit: 'hours per week' },
    { key: 'work_hours', label: 'Work Hours Per Week', units: ['hours per week'], defaultUnit: 'hours per week' },
    { key: 'gmat_score', label: 'GMAT Score', units: ['score'], defaultUnit: 'score' },
    { key: 'gre_score', label: 'GRE Score', units: ['score'], defaultUnit: 'score' },
    { key: 'credit_score', label: 'Credit Score', units: ['score'], defaultUnit: 'score' },
    { key: 'months_timeline', label: 'Timeline', units: ['months', 'years', 'weeks'], defaultUnit: 'months' },
  ];

  const handleValueChange = (value: string) => {
    setCurrentValue(value);
    setShowSuggestions(value.length > 0 && /^\d/.test(value)); // Show suggestions if starts with number
  };

  const addMetric = (suggestion: MetricSuggestion) => {
    if (!currentValue.trim()) return;

    const newMetric: Metric = {
      id: Date.now().toString(),
      key: suggestion.key,
      label: suggestion.label,
      value: currentValue.trim(),
      unit: suggestion.defaultUnit,
    };

    const updatedMetrics = [...metrics, newMetric];
    setMetrics(updatedMetrics);
    setCurrentValue('');
    setShowSuggestions(false);
    
    // Update parent with clean context string
    updateParentContext(updatedMetrics);
  };

  const removeMetric = (id: string) => {
    const updatedMetrics = metrics.filter(m => m.id !== id);
    setMetrics(updatedMetrics);
    updateParentContext(updatedMetrics);
  };

  const updateMetricUnit = (id: string, newUnit: string) => {
    const updatedMetrics = metrics.map(m => 
      m.id === id ? { ...m, unit: newUnit } : m
    );
    setMetrics(updatedMetrics);
    updateParentContext(updatedMetrics);
  };

  const updateParentContext = (metricsList: Metric[]) => {
    // Create simple, clean context string: "age: 23 years, weight: 140 lbs"
    const contextString = metricsList
      .map(m => `${m.key}: ${m.value} ${m.unit}`)
      .join(', ');
    
    onMetricsChange(contextString);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Add Your Metrics</Text>
      
      {/* Input Box */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={currentValue}
          onChangeText={handleValueChange}
          placeholder="Enter a number (e.g., 23, 140, 3.8)..."
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
      </View>

      {/* Suggestions */}
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>What does this number represent?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.suggestionsList}>
              {metricSuggestions.map(suggestion => (
                <TouchableOpacity
                  key={suggestion.key}
                  style={styles.suggestionChip}
                  onPress={() => addMetric(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion.label}</Text>
                  <Text style={styles.suggestionUnit}>({suggestion.defaultUnit})</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Current Metrics */}
      {metrics.length > 0 && (
        <View style={styles.metricsContainer}>
          <Text style={styles.metricsTitle}>📋 Your Metrics ({metrics.length})</Text>
          
          {metrics.map(metric => (
            <View key={metric.id} style={styles.metricRow}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{metric.value}</Text>
              </View>
              
              <View style={styles.metricControls}>
                {/* Unit Picker */}
                <View style={styles.unitPickerContainer}>
                  <Picker
                    selectedValue={metric.unit}
                    onValueChange={(unit) => updateMetricUnit(metric.id, unit)}
                    style={styles.unitPicker}
                  >
                    {metricSuggestions
                      .find(s => s.key === metric.key)?.units
                      .map(unit => (
                        <Picker.Item key={unit} label={unit} value={unit} />
                      )) || []
                    }
                  </Picker>
                </View>
                
                {/* Remove Button */}
                <TouchableOpacity
                  onPress={() => removeMetric(metric.id)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Preview */}
      {metrics.length > 0 && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>📝 Context Preview:</Text>
          <Text style={styles.previewText}>
            {metrics.map(m => `${m.key}: ${m.value} ${m.unit}`).join(', ')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 12,
  },
  
  // Input
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  
  // Suggestions
  suggestionsContainer: {
    marginBottom: 16,
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1e40af',
    marginBottom: 8,
  },
  suggestionsList: {
    flexDirection: 'row',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3b82f6',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1e40af',
  },
  suggestionUnit: {
    fontSize: 10,
    color: '#6b7280',
  },
  
  // Metrics
  metricsContainer: {
    marginBottom: 12,
  },
  metricsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
  },
  metricControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unitPickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    minWidth: 100,
  },
  unitPicker: {
    height: 40,
  },
  removeButton: {
    backgroundColor: '#ef4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Preview
  previewContainer: {
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#15803d',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 11,
    color: '#166534',
    fontStyle: 'italic',
  },
});

export default SimpleSmartMetricInput;