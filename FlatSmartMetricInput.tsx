import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import Slider from '@react-native-community/slider';

// Same interfaces as before
interface MetricDefinition {
  key: string;
  label: string;
  unit: string;
  placeholder: string;
  domain: string; // Add domain info
}

interface Metric {
  id: string;
  domain: string;
  key: string;
  label: string;
  value: string;
  unit: string;
  type?: 'quantitative' | 'qualitative';
}

interface QualitativeMetric {
  id: string;
  tag: string;
  confidence: number; // 0-1 (effect on probability)
  weight: number; // 0-1 (importance to overall equation)
}

interface FlatSmartMetricInputProps {
  onMetricsChange: (contextString: string) => void;
}

interface DropdownProps {
  label: string;
  value: string;
  placeholder: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
}

const CustomDropdown: React.FC<DropdownProps> = ({ label, value, placeholder, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View style={styles.dropdownContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
      >
        <Text style={[styles.dropdownText, !selectedOption && styles.placeholderText]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {label}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === value && styles.selectedOption
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setIsOpen(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    item.value === value && styles.selectedOptionText
                  ]}>
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              style={styles.optionsList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const FlatSmartMetricInput: React.FC<FlatSmartMetricInputProps> = ({ onMetricsChange }) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [qualitativeMetrics, setQualitativeMetrics] = useState<QualitativeMetric[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [currentValue, setCurrentValue] = useState('');
  
  // Demographic selections  
  const [selectedGender, setSelectedGender] = useState<string>('');
  
  // Timeline selections
  const [timelineValue, setTimelineValue] = useState<string>('');
  const [timelineUnit, setTimelineUnit] = useState<string>('months');
  
  // Qualitative metric form state
  const [showQualitativeForm, setShowQualitativeForm] = useState(false);
  const [qualitativeTag, setQualitativeTag] = useState('');
  const [qualitativeConfidence, setQualitativeConfidence] = useState(0.5);
  const [qualitativeWeight, setQualitativeWeight] = useState(0.5);

  // Flattened metrics list (no domain hierarchy)
  const allMetrics: MetricDefinition[] = [
    // Personal
    { key: 'age', label: '👤 Age', unit: 'years', placeholder: '25', domain: 'personal' },
    { key: 'height_inches', label: '📏 Height', unit: 'inches', placeholder: '70', domain: 'personal' },
    { key: 'weight_current_lbs', label: '⚖️ Current Weight', unit: 'lbs', placeholder: '150', domain: 'personal' },
    
    // Fitness
    { key: 'workouts_per_week', label: '💪 Workouts Per Week', unit: 'times', placeholder: '4', domain: 'fitness' },
    { key: 'bench_press_lbs', label: '🏋️ Bench Press Max', unit: 'lbs', placeholder: '185', domain: 'fitness' },
    { key: 'marathon_time_minutes', label: '🏃 Marathon Time', unit: 'minutes', placeholder: '240', domain: 'fitness' },
    
    // Academic
    { key: 'gpa_current', label: '🎓 Current GPA', unit: '4.0 scale', placeholder: '3.5', domain: 'academic' },
    { key: 'gmat_score', label: '📊 GMAT Score', unit: 'points', placeholder: '650', domain: 'academic' },
    { key: 'gre_score', label: '📈 GRE Score', unit: 'points', placeholder: '320', domain: 'academic' },
    
    // Finance
    { key: 'current_salary', label: '💰 Current Salary', unit: 'annual', placeholder: '75000', domain: 'finance' },
    { key: 'net_worth_current', label: '💎 Net Worth', unit: 'dollars', placeholder: '50000', domain: 'finance' },
    { key: 'credit_score', label: '💳 Credit Score', unit: 'score', placeholder: '750', domain: 'finance' },
    
    // Career
    { key: 'experience_years', label: '💼 Years Experience', unit: 'years', placeholder: '5', domain: 'career' },
    { key: 'projects_completed', label: '📋 Projects Completed', unit: 'count', placeholder: '12', domain: 'career' },
    
    // Business
    { key: 'current_revenue', label: '💸 Monthly Revenue', unit: 'dollars', placeholder: '5000', domain: 'business' },
    { key: 'current_employees', label: '👥 Current Employees', unit: 'people', placeholder: '5', domain: 'business' },
  ];

  const addMetric = () => {
    if (!selectedMetric || !currentValue.trim()) return;

    const metricDef = allMetrics.find(m => m.key === selectedMetric);
    if (!metricDef) return;

    const newMetric: Metric = {
      id: Date.now().toString(),
      domain: metricDef.domain,
      key: metricDef.key,
      label: metricDef.label,
      value: currentValue.trim(),
      unit: metricDef.unit,
    };

    const updatedMetrics = [...metrics, newMetric];
    setMetrics(updatedMetrics);
    setCurrentValue('');
    setSelectedMetric(''); // Reset selection
    
    updateParentContext(updatedMetrics, qualitativeMetrics);
  };

  const removeMetric = (id: string) => {
    const updatedMetrics = metrics.filter(m => m.id !== id);
    setMetrics(updatedMetrics);
    updateParentContext(updatedMetrics, qualitativeMetrics);
  };

  const updateParentContext = (metricsList: Metric[], qualitativeList?: QualitativeMetric[]) => {
    try {
      const quantitativeContext = metricsList
        .map(m => `${m.key}: ${m.value} ${m.unit}`)
        .join(', ');
      
      const qualitativeContext = (qualitativeList || qualitativeMetrics)
        .filter(q => q && q.tag && typeof q.confidence === 'number' && typeof q.weight === 'number')
        .map(q => `${q.tag}_ratio: ${q.confidence.toFixed(2)}, ${q.tag}_weight: ${q.weight.toFixed(2)}`)
        .join(', ');
      
      const fullContext = [quantitativeContext, qualitativeContext]
        .filter(s => s && s.length > 0)
        .join(', ');
      
      onMetricsChange(fullContext);
    } catch (error) {
      console.error('Error updating parent context:', error);
      const fallbackContext = metricsList
        .map(m => `${m.key}: ${m.value} ${m.unit}`)
        .join(', ');
      onMetricsChange(fallbackContext);
    }
  };

  const addQualitativeMetric = () => {
    try {
      if (!qualitativeTag.trim()) return;

      const sanitizedTag = qualitativeTag.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
      if (!sanitizedTag) return;

      const newQualitativeMetric: QualitativeMetric = {
        id: Date.now().toString(),
        tag: sanitizedTag,
        confidence: qualitativeConfidence,
        weight: qualitativeWeight,
      };

      const updatedQualitativeMetrics = [...qualitativeMetrics, newQualitativeMetric];
      setQualitativeMetrics(updatedQualitativeMetrics);
      setQualitativeTag('');
      setQualitativeConfidence(0.5);
      setQualitativeWeight(0.5);
      setShowQualitativeForm(false);
      
      updateParentContext(metrics, updatedQualitativeMetrics);
    } catch (error) {
      console.error('Error adding qualitative metric:', error);
      setShowQualitativeForm(false);
    }
  };

  const removeQualitativeMetric = (id: string) => {
    const updatedQualitativeMetrics = qualitativeMetrics.filter(q => q.id !== id);
    setQualitativeMetrics(updatedQualitativeMetrics);
    updateParentContext(metrics, updatedQualitativeMetrics);
  };

  const getCurrentMetricDef = () => {
    return allMetrics.find(m => m.key === selectedMetric);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Add Your Metrics</Text>
      
      {/* Gender Selection */}
      <CustomDropdown
        label="👤 Gender (Optional)"
        value={selectedGender}
        placeholder="Select gender for better predictions..."
        options={[
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
          { label: 'Other', value: 'other' },
          { label: 'Prefer not to say', value: 'not_specified' },
        ]}
        onSelect={(value) => {
          setSelectedGender(value);
          // Add gender to context immediately when selected
          const genderMetric: Metric = {
            id: 'gender_selection',
            domain: 'demographic',
            key: 'gender',
            label: 'Gender',
            value: value,
            unit: 'category',
          };
          
          // Remove any existing gender metric and add new one
          const updatedMetrics = [...metrics.filter(m => m.key !== 'gender'), genderMetric];
          setMetrics(updatedMetrics);
          updateParentContext(updatedMetrics, qualitativeMetrics);
        }}
      />
      
      {/* Single Metric Selection (No Domain) */}
      <CustomDropdown
        label="🎯 Select Metric"
        value={selectedMetric}
        placeholder="Choose any metric..."
        options={allMetrics.map(metric => ({
          label: `${metric.label} (${metric.unit})`,
          value: metric.key
        }))}
        onSelect={setSelectedMetric}
      />

      {/* Value Input */}
      {selectedMetric && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>💯 Value</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.valueInput}
              placeholder={getCurrentMetricDef()?.placeholder || ''}
              value={currentValue}
              onChangeText={setCurrentValue}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.addButton, (!currentValue.trim()) && styles.addButtonDisabled]}
              onPress={addMetric}
              disabled={!currentValue.trim()}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Current Metrics List */}
      {metrics.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Current Metrics</Text>
          <ScrollView style={styles.metricsList} nestedScrollEnabled>
            {metrics.map((metric) => (
              <View key={metric.id} style={styles.metricItem}>
                <View style={styles.metricInfo}>
                  <Text style={styles.metricLabel}>{metric.label}</Text>
                  <Text style={styles.metricValue}>
                    {metric.value} {metric.unit}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeMetric(metric.id)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Qualitative Metrics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎨 Qualitative Factors</Text>
        <Text style={styles.sectionDescription}>
          Add custom factors that affect your prediction with confidence and weight sliders
        </Text>
        
        {/* Add Custom Button */}
        <TouchableOpacity
          style={styles.addQualitativeButton}
          onPress={() => setShowQualitativeForm(true)}
        >
          <Text style={styles.addQualitativeButtonText}>+ Add Custom Factor</Text>
        </TouchableOpacity>

        {/* Current Qualitative Metrics */}
        {qualitativeMetrics.length > 0 && (
          <ScrollView style={styles.qualitativeList} nestedScrollEnabled>
            {qualitativeMetrics.map((qMetric) => (
              <View key={qMetric.id} style={styles.qualitativeItem}>
                <View style={styles.qualitativeInfo}>
                  <Text style={styles.qualitativeTag}>{qMetric.tag}</Text>
                  <Text style={styles.qualitativeDetails}>
                    Effect: {(qMetric.confidence * 100).toFixed(0)}% • Weight: {(qMetric.weight * 100).toFixed(0)}%
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeQualitativeMetric(qMetric.id)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Qualitative Form Modal */}
      <Modal
        visible={showQualitativeForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowQualitativeForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Custom Factor</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowQualitativeForm(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Custom Tag Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>🏷️ Custom Factor Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., motivation level, past experience, connections"
                value={qualitativeTag}
                onChangeText={setQualitativeTag}
                multiline
              />
            </View>

            {/* Confidence Slider */}
            <View style={styles.sliderContainer}>
              <Text style={styles.label}>📊 Effect on Success ({(qualitativeConfidence * 100).toFixed(0)}%)</Text>
              <Text style={styles.sliderDescription}>
                How much does this factor increase or decrease your probability of success?
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={qualitativeConfidence}
                onValueChange={setQualitativeConfidence}
                minimumTrackTintColor="#3b82f6"
                maximumTrackTintColor="#e5e7eb"
                thumbTintColor="#3b82f6"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>Hurts (0%)</Text>
                <Text style={styles.sliderLabelText}>Neutral (50%)</Text>
                <Text style={styles.sliderLabelText}>Helps (100%)</Text>
              </View>
            </View>

            {/* Weight Slider */}
            <View style={styles.sliderContainer}>
              <Text style={styles.label}>⚖️ Importance Weight ({(qualitativeWeight * 100).toFixed(0)}%)</Text>
              <Text style={styles.sliderDescription}>
                How important is this factor to the overall equation?
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={qualitativeWeight}
                onValueChange={setQualitativeWeight}
                minimumTrackTintColor="#10b981"
                maximumTrackTintColor="#e5e7eb"
                thumbTintColor="#10b981"
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>Minor (0%)</Text>
                <Text style={styles.sliderLabelText}>Moderate (50%)</Text>
                <Text style={styles.sliderLabelText}>Critical (100%)</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowQualitativeForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, !qualitativeTag.trim() && styles.saveButtonDisabled]}
              onPress={addQualitativeMetric}
              disabled={!qualitativeTag.trim()}
            >
              <Text style={styles.saveButtonText}>Add Factor</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  dropdownArrow: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalClose: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedOption: {
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  selectedOptionText: {
    color: '#2563eb',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  valueInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#374151',
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  metricsList: {
    maxHeight: 200,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 2,
  },
  removeButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  removeButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addQualitativeButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addQualitativeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  qualitativeList: {
    maxHeight: 200,
  },
  qualitativeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fef7ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e879f9',
  },
  qualitativeInfo: {
    flex: 1,
  },
  qualitativeTag: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7c3aed',
  },
  qualitativeDetails: {
    fontSize: 12,
    color: '#a855f7',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    minHeight: 44,
    textAlignVertical: 'top',
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default FlatSmartMetricInput;