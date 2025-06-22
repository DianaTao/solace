import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ReportViewerScreen({ route, navigation }) {
  const { report, title } = route.params;
  const [activeTab, setActiveTab] = useState('insights');

  const shareReport = async () => {
    try {
      const reportText = `${title}\n\nGenerated: ${new Date(report.generated_at).toLocaleDateString()}\n\nSummary: ${report.ai_insights?.summary || 'No summary available'}`;
      
      await Share.share({
        message: reportText,
        title: title,
      });
    } catch (error) {
      console.error('Error sharing report:', error);
      Alert.alert('Error', 'Failed to share report');
    }
  };

  const MetricCard = ({ title, value, subtitle, color = '#3B82F6' }) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );

  const InsightCard = ({ title, items, icon }) => (
    <View style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <Ionicons name={icon} size={20} color="#3B82F6" />
        <Text style={styles.insightTitle}>{title}</Text>
      </View>
      {items && items.length > 0 ? (
        items.map((item, index) => (
          <View key={index} style={styles.insightItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.insightText}>{item}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noInsightText}>No {title.toLowerCase()} available</Text>
      )}
    </View>
  );

  const TabButton = ({ id, label, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Report Header */}
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <Text style={styles.reportType}>
            {report.report_type === 'monthly_case_summary' ? 'Monthly Case Summary' : 'Quarterly Outcome Report'}
          </Text>
          <Text style={styles.reportPeriod}>{report.period}</Text>
          <Text style={styles.reportDate}>
            Generated on {new Date(report.generated_at).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: report.status === 'completed' ? '#10B981' : '#EF4444' }]}>
          <Text style={styles.statusText}>
            {report.status === 'completed' ? 'Complete' : 'Failed'}
          </Text>
        </View>
      </View>

      {/* Summary Metrics */}
      {report.summary && (
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Total Clients"
              value={report.summary.total_clients}
              color="#3B82F6"
            />
            <MetricCard
              title="Active Cases"
              value={report.summary.active_cases}
              color="#10B981"
            />
            <MetricCard
              title="Case Notes"
              value={report.summary.total_case_notes}
              color="#8B5CF6"
            />
            <MetricCard
              title="Completed Tasks"
              value={report.summary.completed_tasks}
              color="#F59E0B"
            />
          </View>
        </View>
      )}

      {/* Quarterly Metrics */}
      {report.metrics && (
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Task Completion Rate"
              value={`${report.metrics.task_completion_rate}%`}
              color="#10B981"
            />
            <MetricCard
              title="Notes per Client"
              value={report.metrics.case_notes_per_client.toFixed(1)}
              color="#8B5CF6"
            />
          </View>
          
          {report.metrics.case_type_distribution && (
            <View style={styles.distributionSection}>
              <Text style={styles.subsectionTitle}>Case Type Distribution</Text>
              {Object.entries(report.metrics.case_type_distribution).map(([type, count]) => (
                <View key={type} style={styles.distributionItem}>
                  <Text style={styles.distributionType}>{type}</Text>
                  <Text style={styles.distributionCount}>{count} cases</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* AI Summary */}
      {report.ai_insights?.summary && (
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>AI Summary</Text>
          <View style={styles.summaryCard}>
            <Ionicons name="bulb" size={20} color="#F59E0B" />
            <Text style={styles.summaryText}>{report.ai_insights.summary}</Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderInsights = () => (
    <View style={styles.tabContent}>
      {report.ai_insights ? (
        <>
          {/* Key Insights */}
          <InsightCard
            title="Key Insights"
            items={report.ai_insights.key_insights}
            icon="analytics"
          />

          {/* Recommendations */}
          <InsightCard
            title="Recommendations"
            items={report.ai_insights.recommendations}
            icon="lightbulb"
          />

          {/* Notable Trends */}
          {report.ai_insights.notable_trends && (
            <InsightCard
              title="Notable Trends"
              items={report.ai_insights.notable_trends}
              icon="trending-up"
            />
          )}

          {/* Quarterly Specific Insights */}
          {report.ai_insights.outcome_trends && (
            <InsightCard
              title="Outcome Trends"
              items={report.ai_insights.outcome_trends}
              icon="bar-chart"
            />
          )}

          {report.ai_insights.success_factors && (
            <InsightCard
              title="Success Factors"
              items={report.ai_insights.success_factors}
              icon="checkmark-circle"
            />
          )}

          {report.ai_insights.improvement_areas && (
            <InsightCard
              title="Areas for Improvement"
              items={report.ai_insights.improvement_areas}
              icon="arrow-up-circle"
            />
          )}

          {report.ai_insights.strategic_recommendations && (
            <InsightCard
              title="Strategic Recommendations"
              items={report.ai_insights.strategic_recommendations}
              icon="compass"
            />
          )}

          {/* Performance Indicators */}
          {report.ai_insights.performance_indicators && (
            <View style={styles.performanceSection}>
              <Text style={styles.sectionTitle}>Performance Indicators</Text>
              {Object.entries(report.ai_insights.performance_indicators).map(([indicator, value]) => (
                <View key={indicator} style={styles.performanceItem}>
                  <Text style={styles.performanceLabel}>
                    {indicator.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                  <View style={[
                    styles.performanceBadge,
                    {
                      backgroundColor: 
                        value === 'positive' || value === 'improved' || value === 'optimal' ? '#10B981' :
                        value === 'stable' || value === 'maintained' || value === 'manageable' ? '#F59E0B' :
                        '#EF4444'
                    }
                  ]}>
                    <Text style={styles.performanceValue}>{value}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={styles.noDataContainer}>
          <Ionicons name="information-circle-outline" size={48} color="#9CA3AF" />
          <Text style={styles.noDataTitle}>No AI Insights Available</Text>
          <Text style={styles.noDataText}>
            AI analysis is not available for this report.
          </Text>
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
        <Text style={styles.headerTitle}>{title}</Text>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={shareReport}
        >
          <Ionicons name="share-outline" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TabButton
          id="overview"
          label="Overview"
          isActive={activeTab === 'overview'}
          onPress={() => setActiveTab('overview')}
        />
        <TabButton
          id="insights"
          label="AI Insights"
          isActive={activeTab === 'insights'}
          onPress={() => setActiveTab('insights')}
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'overview' ? renderOverview() : renderInsights()}
      </ScrollView>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  shareButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  reportHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reportInfo: {
    flex: 1,
  },
  reportType: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  reportPeriod: {
    fontSize: 18,
    fontWeight: '500',
    color: '#3B82F6',
    marginBottom: 8,
  },
  reportDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 16,
  },
  metricsSection: {
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    flex: 1,
    minWidth: (width - 52) / 2,
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
  metricTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  distributionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  distributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  distributionType: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  distributionCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
    marginLeft: 12,
    flex: 1,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginTop: 7,
    marginRight: 12,
    flexShrink: 0,
  },
  insightText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    flex: 1,
  },
  noInsightText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  performanceSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  performanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  performanceLabel: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  performanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  performanceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 