import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../lib/api';

const { width } = Dimensions.get('window');

export default function ReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [serviceStatus, setServiceStatus] = useState(null);

  useEffect(() => {
    loadReports();
    checkServiceStatus();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      // For now, we'll generate some sample report data
      // In a real app, you might fetch previously generated reports
      setReports([]);
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const checkServiceStatus = async () => {
    try {
      const status = await apiService.getReportServiceStatus();
      setServiceStatus(status);
    } catch (error) {
      console.error('Error checking service status:', error);
    }
  };

  const generateMonthlyReport = async () => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    try {
      setLoading(true);
      const response = await apiService.generateMonthlyCaseSummary(month, year);
      
      if (response.report) {
        navigation.navigate('ReportViewer', {
          report: response.report,
          title: 'Monthly Case Summary'
        });
      }
    } catch (error) {
      console.error('Error generating monthly report:', error);
      Alert.alert('Error', 'Failed to generate monthly report');
    } finally {
      setLoading(false);
    }
  };

  const generateQuarterlyReport = async () => {
    const currentDate = new Date();
    const quarter = Math.ceil((currentDate.getMonth() + 1) / 3);
    const year = currentDate.getFullYear();

    try {
      setLoading(true);
      const response = await apiService.generateQuarterlyOutcomeReport(quarter, year);
      
      if (response.report) {
        navigation.navigate('ReportViewer', {
          report: response.report,
          title: 'Quarterly Outcome Report'
        });
      }
    } catch (error) {
      console.error('Error generating quarterly report:', error);
      Alert.alert('Error', 'Failed to generate quarterly report');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    await checkServiceStatus();
    setRefreshing(false);
  };

  const ReportCard = ({ icon, title, description, onPress, color = '#3B82F6' }) => (
    <TouchableOpacity
      style={[styles.reportCard, { borderLeftColor: color }]}
      onPress={onPress}
      disabled={loading}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const ServiceStatusCard = () => (
    <View style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <Ionicons 
          name={serviceStatus?.service_healthy ? "checkmark-circle" : "alert-circle"} 
          size={20} 
          color={serviceStatus?.service_healthy ? "#10B981" : "#EF4444"} 
        />
        <Text style={styles.statusTitle}>AI Report Service</Text>
      </View>
      <Text style={styles.statusText}>
        {serviceStatus?.message || 'Checking service status...'}
      </Text>
      {serviceStatus?.claude_ai_configured && (
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Available Features:</Text>
          <View style={styles.feature}>
            <Ionicons name="analytics" size={16} color="#10B981" />
            <Text style={styles.featureText}>AI-Powered Analysis</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="server" size={16} color="#10B981" />
            <Text style={styles.featureText}>Database Integration</Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Reports</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Ionicons 
            name="refresh" 
            size={24} 
            color="#1F2937" 
            style={refreshing ? { transform: [{ rotate: '180deg' }] } : {}}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Service Status */}
        {serviceStatus && <ServiceStatusCard />}

        {/* Report Generation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generate New Reports</Text>
          <Text style={styles.sectionSubtitle}>
            Create AI-powered insights from your case management data
          </Text>

          <ReportCard
            icon="bar-chart"
            title="Monthly Case Summary"
            description="AI analysis of monthly case management activities, trends, and insights"
            onPress={generateMonthlyReport}
            color="#3B82F6"
          />

          <ReportCard
            icon="trending-up"
            title="Quarterly Outcome Report"
            description="Strategic quarterly analysis of client outcomes and performance metrics"
            onPress={generateQuarterlyReport}
            color="#10B981"
          />
        </View>

        {/* Recent Reports Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          {reports.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No Reports Yet</Text>
              <Text style={styles.emptyStateText}>
                Generate your first AI-powered report using the options above
              </Text>
            </View>
          ) : (
            reports.map((report, index) => (
              <ReportCard
                key={index}
                icon="document-text"
                title={report.title}
                description={`Generated on ${new Date(report.generated_at).toLocaleDateString()}`}
                onPress={() => navigation.navigate('ReportViewer', { report })}
                color="#8B5CF6"
              />
            ))
          )}
        </View>

        {/* AI Features Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>AI-Powered Insights</Text>
          <View style={styles.infoCard}>
            <Ionicons name="brain" size={20} color="#3B82F6" />
            <Text style={styles.infoText}>
              Reports are generated using Claude AI to provide intelligent analysis of your case data
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text style={styles.infoText}>
              All data processing complies with HIPAA and privacy regulations
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Generating AI Report...</Text>
          </View>
        </View>
      )}
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  featuresContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    fontSize: 16,
    color: '#1F2937',
    marginTop: 12,
    textAlign: 'center',
  },
});
