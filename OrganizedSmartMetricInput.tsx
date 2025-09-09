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

interface MetricDefinition {
  key: string;
  label: string;
  unit: string;
  placeholder: string;
}

interface DomainMetrics {
  [domain: string]: MetricDefinition[];
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

interface OrganizedSmartMetricInputProps {
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

const OrganizedSmartMetricInput: React.FC<OrganizedSmartMetricInputProps> = ({ onMetricsChange }) => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [qualitativeMetrics, setQualitativeMetrics] = useState<QualitativeMetric[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
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

  // Organized quantitative metrics by domain
  const domainMetrics: DomainMetrics = {
    personal: [
      { key: 'age', label: 'Age', unit: 'years', placeholder: '25' },
      { key: 'height_inches', label: 'Height', unit: 'inches', placeholder: '70' },
      { key: 'weight_current_lbs', label: 'Current Weight', unit: 'lbs', placeholder: '150' },
      { key: 'weight_target_lbs', label: 'Target Weight', unit: 'lbs', placeholder: '140' },
    ],
    
    fitness: [
      { key: 'workouts_per_week', label: 'Workouts Per Week', unit: 'times', placeholder: '4' },
      { key: 'bench_press_lbs', label: 'Bench Press Max', unit: 'lbs', placeholder: '185' },
      { key: 'deadlift_lbs', label: 'Deadlift Max', unit: 'lbs', placeholder: '275' },
      { key: 'squat_lbs', label: 'Squat Max', unit: 'lbs', placeholder: '225' },
      { key: 'marathon_time_minutes', label: 'Marathon Time', unit: 'minutes', placeholder: '240' },
      { key: 'miles_per_week', label: 'Running Miles Per Week', unit: 'miles', placeholder: '20' },
      { key: 'body_fat_percent', label: 'Body Fat Percentage', unit: 'percent', placeholder: '15' },
    ],
    
    academic: [
      { key: 'gpa_current', label: 'Current GPA', unit: '4.0 scale', placeholder: '3.5' },
      { key: 'gpa_target', label: 'Target GPA', unit: '4.0 scale', placeholder: '3.8' },
      { key: 'gmat_score', label: 'GMAT Score', unit: 'points', placeholder: '650' },
      { key: 'gre_score', label: 'GRE Score', unit: 'points', placeholder: '320' },
      { key: 'lsat_score', label: 'LSAT Score', unit: 'points', placeholder: '165' },
      { key: 'mcat_score', label: 'MCAT Score', unit: 'points', placeholder: '515' },
      { key: 'sat_score', label: 'SAT Score', unit: 'points', placeholder: '1400' },
      { key: 'study_hours_per_week', label: 'Study Hours Per Week', unit: 'hours', placeholder: '20' },
      { key: 'class_credits', label: 'Credit Hours', unit: 'credits', placeholder: '15' },
    ],
    
    finance: [
      { key: 'current_salary', label: 'Current Salary', unit: 'annual', placeholder: '75000' },
      { key: 'target_salary', label: 'Target Salary', unit: 'annual', placeholder: '100000' },
      { key: 'net_worth_current', label: 'Current Net Worth', unit: 'dollars', placeholder: '50000' },
      { key: 'monthly_savings', label: 'Monthly Savings', unit: 'dollars', placeholder: '2000' },
      { key: 'credit_score', label: 'Credit Score', unit: 'score', placeholder: '750' },
      { key: 'debt_total', label: 'Total Debt', unit: 'dollars', placeholder: '25000' },
      { key: 'investment_portfolio', label: 'Investment Portfolio', unit: 'dollars', placeholder: '15000' },
      { key: 'apr_rate', label: 'APR Rate', unit: 'percent', placeholder: '4.5' },
      { key: 'down_payment', label: 'Down Payment Available', unit: 'dollars', placeholder: '50000' },
    ],
    
    career: [
      { key: 'experience_years', label: 'Years Experience', unit: 'years', placeholder: '5' },
      { key: 'projects_completed', label: 'Projects Completed', unit: 'count', placeholder: '12' },
      { key: 'team_size_managed', label: 'Team Size Managed', unit: 'people', placeholder: '8' },
      { key: 'certifications_count', label: 'Professional Certifications', unit: 'count', placeholder: '3' },
      { key: 'work_hours_per_week', label: 'Work Hours Per Week', unit: 'hours', placeholder: '45' },
      { key: 'companies_worked', label: 'Companies Worked At', unit: 'count', placeholder: '3' },
    ],
    
    business: [
      { key: 'startup_funding', label: 'Startup Funding Needed', unit: 'dollars', placeholder: '100000' },
      { key: 'current_revenue', label: 'Current Monthly Revenue', unit: 'dollars', placeholder: '5000' },
      { key: 'target_revenue', label: 'Target Monthly Revenue', unit: 'dollars', placeholder: '50000' },
      { key: 'current_employees', label: 'Current Employees', unit: 'people', placeholder: '5' },
      { key: 'target_employees', label: 'Target Employees', unit: 'people', placeholder: '25' },
      { key: 'burn_rate_monthly', label: 'Monthly Burn Rate', unit: 'dollars', placeholder: '10000' },
      { key: 'customer_acquisition_cost', label: 'Customer Acquisition Cost', unit: 'dollars', placeholder: '50' },
      { key: 'lifetime_value', label: 'Customer Lifetime Value', unit: 'dollars', placeholder: '500' },
      { key: 'conversion_rate', label: 'Conversion Rate', unit: 'percent', placeholder: '2.5' },
    ],
    
    cooking: [
      { key: 'cooking_temp_fahrenheit', label: 'Cooking Temperature', unit: 'fahrenheit', placeholder: '375' },
      { key: 'cooking_time_minutes', label: 'Cooking Time', unit: 'minutes', placeholder: '45' },
      { key: 'recipe_servings', label: 'Recipe Servings', unit: 'servings', placeholder: '6' },
      { key: 'prep_time_minutes', label: 'Prep Time', unit: 'minutes', placeholder: '30' },
      { key: 'ingredient_cost', label: 'Ingredient Cost', unit: 'dollars', placeholder: '25' },
      { key: 'calories_per_serving', label: 'Calories Per Serving', unit: 'calories', placeholder: '350' },
    ],
    
    travel: [
      { key: 'travel_budget', label: 'Travel Budget', unit: 'dollars', placeholder: '3000' },
      { key: 'trip_duration_days', label: 'Trip Duration', unit: 'days', placeholder: '10' },
      { key: 'flight_cost', label: 'Flight Cost', unit: 'dollars', placeholder: '800' },
      { key: 'hotel_cost_per_night', label: 'Hotel Cost Per Night', unit: 'dollars', placeholder: '150' },
      { key: 'countries_visited', label: 'Countries Visited', unit: 'count', placeholder: '12' },
      { key: 'miles_traveled', label: 'Miles to Travel', unit: 'miles', placeholder: '5000' },
    ],
    
    health: [
      { key: 'blood_pressure_systolic', label: 'Blood Pressure (Systolic)', unit: 'mmHg', placeholder: '120' },
      { key: 'blood_pressure_diastolic', label: 'Blood Pressure (Diastolic)', unit: 'mmHg', placeholder: '80' },
      { key: 'heart_rate_resting', label: 'Resting Heart Rate', unit: 'bpm', placeholder: '65' },
      { key: 'cholesterol_total', label: 'Total Cholesterol', unit: 'mg/dL', placeholder: '180' },
      { key: 'sleep_hours_per_night', label: 'Sleep Hours Per Night', unit: 'hours', placeholder: '7.5' },
      { key: 'water_intake_ounces', label: 'Daily Water Intake', unit: 'ounces', placeholder: '64' },
      { key: 'steps_per_day', label: 'Steps Per Day', unit: 'steps', placeholder: '8000' },
    ],
    
    dating: [
      { key: 'dates_per_month', label: 'Dates Per Month', unit: 'dates', placeholder: '4' },
      { key: 'dating_app_matches', label: 'Dating App Matches', unit: 'matches', placeholder: '10' },
      { key: 'relationship_length_months', label: 'Longest Relationship', unit: 'months', placeholder: '18' },
      { key: 'social_events_per_week', label: 'Social Events Per Week', unit: 'events', placeholder: '3' },
      { key: 'dating_budget_monthly', label: 'Monthly Dating Budget', unit: 'dollars', placeholder: '400' },
    ],
    
    timeline: [
      { key: 'timeline_months', label: 'Prediction Timeline', unit: 'months', placeholder: '12' },
      { key: 'timeline_weeks', label: 'Prediction Timeline', unit: 'weeks', placeholder: '24' },
      { key: 'timeline_days', label: 'Prediction Timeline', unit: 'days', placeholder: '90' },
      { key: 'milestone_frequency_weeks', label: 'Milestone Check-in', unit: 'weeks', placeholder: '4' },
    ],
  };

  const addMetric = () => {
    if (!selectedDomain || !selectedMetric || !currentValue.trim()) return;

    const metricDef = domainMetrics[selectedDomain]?.find(m => m.key === selectedMetric);
    if (!metricDef) return;

    const newMetric: Metric = {
      id: Date.now().toString(),
      domain: selectedDomain,
      key: metricDef.key,
      label: metricDef.label,
      value: currentValue.trim(),
      unit: metricDef.unit,
    };

    const updatedMetrics = [...metrics, newMetric];
    setMetrics(updatedMetrics);
    setCurrentValue('');
    
    // Update parent with clean context string
    updateParentContext(updatedMetrics, qualitativeMetrics);
  };

  const removeMetric = (id: string) => {
    const updatedMetrics = metrics.filter(m => m.id !== id);
    setMetrics(updatedMetrics);
    updateParentContext(updatedMetrics, qualitativeMetrics);
  };

  const updateParentContext = (metricsList: Metric[], qualitativeList?: QualitativeMetric[]) => {
    try {
      // Create clean context string: "age: 23 years, weight_current_lbs: 140 lbs, motivation_ratio: 0.8, motivation_weight: 0.6"
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
      // Fallback to just quantitative metrics
      const fallbackContext = metricsList
        .map(m => `${m.key}: ${m.value} ${m.unit}`)
        .join(', ');
      onMetricsChange(fallbackContext);
    }
  };

  const getCurrentMetricDef = () => {
    if (!selectedDomain || !selectedMetric) return null;
    return domainMetrics[selectedDomain]?.find(m => m.key === selectedMetric);
  };

  const addQualitativeMetric = () => {
    try {
      if (!qualitativeTag.trim()) return;

      // Sanitize tag name
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
      
      // Update parent with new qualitative metrics
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

  const updateTimelineMetric = (value: string, unit: string) => {
    if (!value.trim()) return;
    
    const timelineMetric: Metric = {
      id: 'timeline_selection',
      domain: 'timeline',
      key: `timeline_${unit}`,
      label: 'Prediction Timeline',
      value: value.trim(),
      unit: unit,
      type: 'quantitative'
    };
    
    // Remove any existing timeline metric and add new one
    const updatedMetrics = [...metrics.filter(m => !m.key.startsWith('timeline_')), timelineMetric];
    setMetrics(updatedMetrics);
    updateParentContext(updatedMetrics, qualitativeMetrics);
    
    // Clear the input
    setTimelineValue('');
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
            type: 'quantitative'
          };
          
          // Remove any existing gender metric and add new one
          const updatedMetrics = [...metrics.filter(m => m.key !== 'gender'), genderMetric];
          setMetrics(updatedMetrics);
          updateParentContext(updatedMetrics, qualitativeMetrics);
        }}
      />
      
      {/* Timeline Selection - Prominent */}
      <View style={styles.timelineSection}>
        <Text style={styles.timelineSectionTitle}>⏰ Prediction Timeline</Text>
        <Text style={styles.timelineSectionDescription}>
          When do you want to achieve this? Longer timelines generally improve success probability.
        </Text>
        
        <View style={styles.timelineInputRow}>
          <TextInput
            style={styles.timelineValueInput}
            placeholder="Enter time..."
            value={timelineValue}
            onChangeText={setTimelineValue}
            keyboardType="numeric"
          />
          
          <CustomDropdown
            label=""
            value={timelineUnit}
            placeholder="Unit"
            options={[
              { label: 'Days', value: 'days' },
              { label: 'Weeks', value: 'weeks' },
              { label: 'Months', value: 'months' },
              { label: 'Years', value: 'years' },
            ]}
            onSelect={(unit) => {
              setTimelineUnit(unit);
              if (timelineValue.trim()) {
                updateTimelineMetric(timelineValue, unit);
              }
            }}
          />
          
          <TouchableOpacity
            style={[styles.addTimelineButton, !timelineValue.trim() && styles.addTimelineButtonDisabled]}
            onPress={() => updateTimelineMetric(timelineValue, timelineUnit)}
            disabled={!timelineValue.trim()}
          >
            <Text style={styles.addTimelineButtonText}>Set</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Domain Selection */}
      <CustomDropdown
        label="📂 Domain"
        value={selectedDomain}
        placeholder="Select Domain..."
        options={Object.keys(domainMetrics).map(domain => ({
          label: domain.charAt(0).toUpperCase() + domain.slice(1),
          value: domain
        }))}
        onSelect={(value) => {
          setSelectedDomain(value);
          setSelectedMetric(''); // Reset metric when domain changes
        }}
      />

      {/* Metric Selection */}
      {selectedDomain && (
        <CustomDropdown
          label="🎯 Metric"
          value={selectedMetric}
          placeholder="Select Metric..."
          options={domainMetrics[selectedDomain]?.map(metric => ({
            label: `${metric.label} (${metric.unit})`,
            value: metric.key
          })) || []}
          onSelect={setSelectedMetric}
        />
      )}

      {/* Value Input */}
      {selectedMetric && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            📝 Value {getCurrentMetricDef() && `(${getCurrentMetricDef()!.unit})`}
          </Text>
          <View style={styles.valueInputContainer}>
            <TextInput
              style={styles.valueInput}
              value={currentValue}
              onChangeText={setCurrentValue}
              placeholder={getCurrentMetricDef()?.placeholder || 'Enter value...'}
              keyboardType="numeric"
              placeholderTextColor="#999"
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

      {/* Current Metrics */}
      {metrics.length > 0 && (
        <View style={styles.metricsContainer}>
          <Text style={styles.metricsTitle}>📋 Your Metrics ({metrics.length})</Text>
          
          {metrics.map(metric => (
            <View key={metric.id} style={styles.metricRow}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricDomain}>
                  {metric.domain.charAt(0).toUpperCase() + metric.domain.slice(1)}
                </Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{metric.value} {metric.unit}</Text>
              </View>
              
              <TouchableOpacity
                onPress={() => removeMetric(metric.id)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Qualitative Metrics Section */}
      <View style={styles.qualitativeContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎯 Qualitative Factors</Text>
          <TouchableOpacity
            style={styles.addQualitativeButton}
            onPress={() => setShowQualitativeForm(true)}
          >
            <Text style={styles.addQualitativeButtonText}>+ Add Custom</Text>
          </TouchableOpacity>
        </View>

        {/* Qualitative Metrics List */}
        {qualitativeMetrics.length > 0 && (
          <View style={styles.qualitativeList}>
            {qualitativeMetrics.map(metric => (
              <View key={metric.id} style={styles.qualitativeRow}>
                <View style={styles.qualitativeInfo}>
                  <Text style={styles.qualitativeTag}>
                    {metric.tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                  <Text style={styles.qualitativeValues}>
                    Effect: {(metric.confidence * 100).toFixed(0)}% • Weight: {(metric.weight * 100).toFixed(0)}%
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeQualitativeButton}
                  onPress={() => removeQualitativeMetric(metric.id)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Qualitative Form Modal */}
        <Modal
          visible={showQualitativeForm}
          transparent
          animationType="slide"
          onRequestClose={() => setShowQualitativeForm(false)}
        >
          <View style={styles.qualitativeModalOverlay}>
            <View style={styles.qualitativeModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Qualitative Factor</Text>
                <TouchableOpacity onPress={() => setShowQualitativeForm(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.qualitativeForm}>
                <Text style={styles.label}>Factor Name</Text>
                <TextInput
                  style={styles.tagInput}
                  placeholder="e.g., motivation, confidence, determination"
                  value={qualitativeTag}
                  onChangeText={setQualitativeTag}
                  autoCapitalize="none"
                />

                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>
                    Effect on Probability: {(qualitativeConfidence * 100).toFixed(0)}%
                  </Text>
                  <Text style={styles.sliderDescription}>
                    How much does this factor help/hurt your chances?
                  </Text>
                  <View style={styles.sliderRow}>
                    <Text style={styles.sliderMinLabel}>Hurts (0%)</Text>
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
                    <Text style={styles.sliderMaxLabel}>Helps (100%)</Text>
                  </View>
                </View>

                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>
                    Weight in Equation: {(qualitativeWeight * 100).toFixed(0)}%
                  </Text>
                  <Text style={styles.sliderDescription}>
                    How important is this factor for your specific prediction?
                  </Text>
                  <View style={styles.sliderRow}>
                    <Text style={styles.sliderMinLabel}>Minor (0%)</Text>
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
                    <Text style={styles.sliderMaxLabel}>Critical (100%)</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.addQualitativeConfirmButton, !qualitativeTag.trim() && styles.addButtonDisabled]}
                  onPress={addQualitativeMetric}
                  disabled={!qualitativeTag.trim()}
                >
                  <Text style={styles.addButtonText}>Add Factor</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

      {/* Preview */}
      {(metrics.length > 0 || qualitativeMetrics.length > 0) && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>📝 Context Preview:</Text>
          <Text style={styles.previewText}>
            {[
              ...metrics.map(m => `${m.key}: ${m.value} ${m.unit}`),
              ...qualitativeMetrics.map(q => `${q.tag}_ratio: ${q.confidence.toFixed(2)}, ${q.tag}_weight: ${q.weight.toFixed(2)}`)
            ].join(', ')}
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
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 24,
    textAlign: 'center',
  },
  
  // Timeline Section Styles
  timelineSection: {
    backgroundColor: '#fff7ed',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  timelineSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  timelineSectionDescription: {
    fontSize: 14,
    color: '#78716c',
    marginBottom: 16,
    lineHeight: 20,
  },
  timelineInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineValueInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#374151',
  },
  addTimelineButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  addTimelineButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  addTimelineButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Input containers
  inputContainer: {
    marginBottom: 24,
  },
  
  // Custom dropdown styles
  dropdownContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    paddingLeft: 4,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
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
    width: 30,
    height: 30,
    textAlign: 'center',
    lineHeight: 30,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  selectedOption: {
    backgroundColor: '#f0fdf4',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  selectedOptionText: {
    color: '#059669',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#059669',
    fontWeight: 'bold',
  },
  
  // Value input
  valueInputContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  valueInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    height: 56,
  },
  addButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    minWidth: 80,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Metrics list
  metricsContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  metricsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    paddingLeft: 4,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricInfo: {
    flex: 1,
  },
  metricDomain: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a202c',
  },
  removeButton: {
    backgroundColor: '#ef4444',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Preview
  previewContainer: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginTop: 8,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#15803d',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 12,
    color: '#166534',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  
  // Qualitative Metrics Styles
  qualitativeContainer: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  addQualitativeButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addQualitativeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  qualitativeList: {
    marginTop: 12,
  },
  qualitativeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  qualitativeInfo: {
    flex: 1,
  },
  qualitativeTag: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  qualitativeValues: {
    fontSize: 13,
    color: '#64748b',
  },
  removeQualitativeButton: {
    backgroundColor: '#ef4444',
    borderRadius: 6,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  
  // Qualitative Modal Styles
  qualitativeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qualitativeModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  qualitativeForm: {
    padding: 20,
  },
  tagInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
    marginBottom: 24,
    height: 52,
  },
  
  // Slider Styles
  sliderContainer: {
    marginBottom: 24,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  sliderDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 12,
  },
  sliderMinLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'left',
  },
  sliderMaxLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'right',
  },
  addQualitativeConfirmButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
});

export default OrganizedSmartMetricInput;