import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../lib/api';

export default function APITestScreen({ onBack }) {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [apiHealth, setApiHealth] = useState(null);

  useEffect(() => {
    checkAPIHealth();
  }, []);

  const checkAPIHealth = async () => {
    try {
      console.log('🏥 Checking API health...');
      const health = await apiService.checkHealth();
      setApiHealth(health);
      console.log('✅ API Health:', health);
    } catch (error) {
      console.error('❌ API Health check failed:', error);
      setApiHealth({ status: 'error', message: error.message });
    }
  };

  const runTest = async (testName, testFunction) => {
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Running test: ${testName}`);
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      const testResult = {
        name: testName,
        status: 'success',
        duration: `${duration}ms`,
        data: result,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setTestResults(prev => [testResult, ...prev]);
      console.log(`✅ Test passed: ${testName}`, result);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const testResult = {
        name: testName,
        status: 'error',
        duration: `${duration}ms`,
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setTestResults(prev => [testResult, ...prev]);
      console.error(`❌ Test failed: ${testName}`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const testAPICalls = [
    {
      name: 'Health Check',
      icon: 'heart',
      color: '#10B981',
      test: () => apiService.checkHealth()
    },
    {
      name: 'API Info',
      icon: 'information-circle',
      color: '#3B82F6',
      test: () => apiService.getAPIInfo()
    },
    {
      name: 'Get Clients',
      icon: 'people',
      color: '#8B5CF6',
      test: () => apiService.getClients({ limit: 5 })
    },
    {
      name: 'Get Tasks',
      icon: 'checkmark-circle',
      color: '#F59E0B',
      test: () => apiService.getTasks({ limit: 5 })
    },
    {
      name: 'Get Case Notes',
      icon: 'document-text',
      color: '#EF4444',
      test: () => apiService.getCaseNotes({ limit: 5 })
    },
    {
      name: 'Get Reports',
      icon: 'bar-chart',
      color: '#06B6D4',
      test: () => apiService.getReports({ limit: 5 })
    }
  ];

  const clearResults = () => {
    setTestResults([]);
  };

  const runAllTests = async () => {
    setTestResults([]);
    for (const testCall of testAPICalls) {
      await runTest(testCall.name, testCall.test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      
      {/* Header */}
      <LinearGradient
        colors={['#059669', '#047857']}
        style={styles.header}
      >
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>API Test Console</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      {/* API Health Status */}
      <View style={styles.healthSection}>
        <View style={styles.healthCard}>
          <View style={styles.healthHeader}>
            <Ionicons 
              name={apiHealth?.status === 'healthy' ? 'checkmark-circle' : 'alert-circle'} 
              size={20} 
              color={apiHealth?.status === 'healthy' ? '#10B981' : '#EF4444'} 
            />
            <Text style={styles.healthTitle}>Backend Status</Text>
          </View>
          <Text style={[
            styles.healthStatus, 
            { color: apiHealth?.status === 'healthy' ? '#10B981' : '#EF4444' }
          ]}>
            {apiHealth?.status === 'healthy' ? 'Connected' : 'Disconnected'}
          </Text>
          {apiHealth?.message && (
            <Text style={styles.healthMessage}>{apiHealth.message}</Text>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Test Controls */}
        <View style={styles.controlsSection}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: '#059669' }]}
            onPress={runAllTests}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="play" size={16} color="white" />
            )}
            <Text style={styles.controlButtonText}>Run All Tests</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: '#6B7280' }]}
            onPress={clearResults}
          >
            <Ionicons name="trash" size={16} color="white" />
            <Text style={styles.controlButtonText}>Clear Results</Text>
          </TouchableOpacity>
        </View>

        {/* Individual Test Buttons */}
        <View style={styles.testsSection}>
          <Text style={styles.sectionTitle}>Individual Tests</Text>
          <View style={styles.testGrid}>
            {testAPICalls.map((test, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.testButton, { borderColor: test.color }]}
                onPress={() => runTest(test.name, test.test)}
                disabled={isLoading}
              >
                <Ionicons name={test.icon} size={24} color={test.color} />
                <Text style={[styles.testButtonText, { color: test.color }]}>
                  {test.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Test Results */}
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Test Results ({testResults.length})</Text>
          {testResults.length === 0 ? (
            <View style={styles.emptyResults}>
              <Ionicons name="flask" size={48} color="#9CA3AF" />
              <Text style={styles.emptyResultsText}>No test results yet</Text>
              <Text style={styles.emptyResultsSubtext}>Run some tests to see results here</Text>
            </View>
          ) : (
            testResults.map((result, index) => (
              <View key={index} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={styles.resultTitleRow}>
                    <Ionicons 
                      name={result.status === 'success' ? 'checkmark-circle' : 'close-circle'} 
                      size={16} 
                      color={result.status === 'success' ? '#10B981' : '#EF4444'} 
                    />
                    <Text style={styles.resultTitle}>{result.name}</Text>
                  </View>
                  <Text style={styles.resultTime}>{result.timestamp}</Text>
                </View>
                
                <View style={styles.resultMeta}>
                  <Text style={[
                    styles.resultStatus, 
                    { color: result.status === 'success' ? '#10B981' : '#EF4444' }
                  ]}>
                    {result.status.toUpperCase()}
                  </Text>
                  <Text style={styles.resultDuration}>{result.duration}</Text>
                </View>

                {result.error && (
                  <Text style={styles.resultError}>{result.error}</Text>
                )}

                {result.data && (
                  <View style={styles.resultData}>
                    <Text style={styles.resultDataTitle}>Response:</Text>
                    <Text style={styles.resultDataText} numberOfLines={3}>
                      {JSON.stringify(result.data, null, 2)}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  healthSection: {
    padding: 16,
  },
  healthCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  healthStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  healthMessage: {
    fontSize: 12,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  controlsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  testsSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  testGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  testButton: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  testButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  resultsSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  emptyResultsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  resultTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  resultError: {
    fontSize: 12,
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  resultData: {
    marginTop: 8,
  },
  resultDataTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  resultDataText: {
    fontSize: 11,
    color: '#6B7280',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
    fontFamily: 'monospace',
  },
}); 