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
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ReportViewerScreen({ route, navigation }) {
  const { report, title } = route.params;
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Check if AI analysis failed
  const isAIAnalysisFailed = report?.ai_insights?.executive_summary?.includes('AI analysis failed') || 
                            report?.ai_insights?.summary?.includes('AI analysis failed');

  const shareReport = async () => {
    try {
      const reportText = `${title}\n\nGenerated: ${new Date(report.generated_at).toLocaleDateString()}\n\nSummary: ${report.ai_insights?.summary || report.ai_insights?.executive_summary || 'No summary available'}`;
      
      await Share.share({
        message: reportText,
        title: title,
      });
    } catch (error) {
      console.error('Error sharing report:', error);
      Alert.alert('Error', 'Failed to share report');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // In a real app, you would regenerate the report here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const ErrorBanner = () => {
    if (!isAIAnalysisFailed) return null;
    
    return (
      <View style={styles.errorBanner}>
        <Ionicons name="warning" size={20} color="#EF4444" />
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>AI Analysis Unavailable</Text>
          <Text style={styles.errorText}>
            The Claude AI model is currently unavailable. The system has been updated to use Claude 3.5 Sonnet. Report data is still available below.
          </Text>
        </View>
      </View>
    );
  };

  const MetricCard = ({ title, value, subtitle, color = '#3B82F6', icon }) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        {icon && <Ionicons name={icon} size={18} color={color} />}
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );

  const InsightCard = ({ title, items, icon, isError = false }) => (
    <View style={[styles.insightCard, isError && styles.errorInsightCard]}>
      <View style={styles.insightHeader}>
        <Ionicons 
          name={isError ? "warning" : icon} 
          size={20} 
          color={isError ? "#EF4444" : "#3B82F6"} 
        />
        <Text style={[styles.insightTitle, isError && styles.errorInsightTitle]}>{title}</Text>
      </View>
      {items && items.length > 0 ? (
        items.map((item, index) => (
          <View key={index} style={styles.insightItem}>
            <View style={[styles.bulletPoint, isError && styles.errorBulletPoint]} />
            <Text style={[styles.insightText, isError && styles.errorInsightText]}>{item}</Text>
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
      {/* Error Banner */}
      <ErrorBanner />

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
        <View style={[
          styles.statusBadge, 
          { backgroundColor: report.status === 'completed' ? '#10B981' : '#EF4444' }
        ]}>
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
              icon="people"
              color="#3B82F6"
            />
            <MetricCard
              title="Active Cases"
              value={report.summary.active_cases}
              icon="briefcase"
              color="#10B981"
            />
            <MetricCard
              title="Case Notes"
              value={report.summary.total_case_notes}
              icon="document-text"
              color="#8B5CF6"
            />
            <MetricCard
              title="Completed Tasks"
              value={report.summary.completed_tasks}
              icon="checkmark-circle"
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
              icon="trending-up"
              color="#10B981"
            />
            <MetricCard
              title="Notes per Client"
              value={report.metrics.case_notes_per_client.toFixed(1)}
              icon="document"
              color="#8B5CF6"
            />
          </View>
          
          {report.metrics.case_type_distribution && (
            <View style={styles.distributionSection}>
              <Text style={styles.subsectionTitle}>Case Type Distribution</Text>
              {Object.entries(report.metrics.case_type_distribution).map(([type, count]) => (
                <View key={type} style={styles.distributionItem}>
                  <View style={styles.distributionIcon}>
                    <Ionicons name="folder" size={16} color="#6B7280" />
                  </View>
                  <Text style={styles.distributionType}>{type}</Text>
                  <Text style={styles.distributionCount}>{count} cases</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* AI Summary */}
      {(report.ai_insights?.summary || report.ai_insights?.executive_summary) && (
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>AI Summary</Text>
          <View style={[styles.summaryCard, isAIAnalysisFailed && styles.errorSummaryCard]}>
            <Ionicons 
              name={isAIAnalysisFailed ? "warning" : "bulb"} 
              size={20} 
              color={isAIAnalysisFailed ? "#EF4444" : "#F59E0B"} 
            />
            <Text style={[styles.summaryText, isAIAnalysisFailed && styles.errorSummaryText]}>
              {report.ai_insights.summary || report.ai_insights.executive_summary}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderInsights = () => (
    <View style={styles.tabContent}>
      {/* Error Banner */}
      <ErrorBanner />

      {report.ai_insights ? (
        <>
          {/* Key Insights */}
          {report.ai_insights.key_insights && (
            <InsightCard
              title="Key Insights"
              items={report.ai_insights.key_insights}
              icon="analytics"
              isError={isAIAnalysisFailed}
            />
          )}

          {/* Recommendations */}
          {report.ai_insights.recommendations && (
            <InsightCard
              title="Recommendations"
              items={report.ai_insights.recommendations}
              icon="lightbulb"
              isError={isAIAnalysisFailed}
            />
          )}

          {/* Notable Trends */}
          {report.ai_insights.notable_trends && (
            <InsightCard
              title="Notable Trends"
              items={report.ai_insights.notable_trends}
              icon="trending-up"
              isError={isAIAnalysisFailed}
            />
          )}

          {/* Quarterly Specific Insights */}
          {report.ai_insights.outcome_trends && (
            <InsightCard
              title="Outcome Trends"
              items={report.ai_insights.outcome_trends}
              icon="bar-chart"
              isError={isAIAnalysisFailed}
            />
          )}

          {report.ai_insights.success_factors && (
            <InsightCard
              title="Success Factors"
              items={report.ai_insights.success_factors}
              icon="trophy"
              isError={isAIAnalysisFailed}
            />
          )}

          {report.ai_insights.improvement_areas && (
            <InsightCard
              title="Improvement Areas"
              items={report.ai_insights.improvement_areas}
              icon="construct"
              isError={isAIAnalysisFailed}
            />
          )}

          {report.ai_insights.strategic_recommendations && (
            <InsightCard
              title="Strategic Recommendations"
              items={report.ai_insights.strategic_recommendations}
              icon="compass"
              isError={isAIAnalysisFailed}
            />
          )}

          {/* Performance Indicators */}
          {report.ai_insights.performance_indicators && (
            <View style={styles.performanceSection}>
              <Text style={styles.sectionTitle}>Performance Indicators</Text>
              {Object.entries(report.ai_insights.performance_indicators).map(([key, value]) => (
                <View key={key} style={styles.performanceItem}>
                  <Text style={styles.performanceLabel}>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                  <View style={[
                    styles.performanceValue,
                    { backgroundColor: value === 'positive' || value === 'improved' || value === 'optimal' ? '#10B981' : 
                                      value === 'negative' || value === 'declined' ? '#EF4444' : '#6B7280' }
                  ]}>
                    <Text style={styles.performanceText}>{value}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={styles.noDataContainer}>
          <Ionicons name="analytics" size={64} color="#9CA3AF" />
          <Text style={styles.noDataTitle}>No AI Insights Available</Text>
          <Text style={styles.noDataText}>
            AI analysis is currently unavailable. Please check the AI service configuration.
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
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <TouchableOpacity style={styles.shareButton} onPress={shareReport}>
          <Ionicons name="share" size={24} color="#374151" />
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
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
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
  distributionIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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
  performanceValue: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  performanceText: {
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
  errorBanner: {
    backgroundColor: '#FFF3F3',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginRight: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorInsightCard: {
    borderColor: '#EF4444',
  },
  errorInsightTitle: {
    color: '#EF4444',
  },
  errorBulletPoint: {
    backgroundColor: '#EF4444',
  },
  errorInsightText: {
    color: '#EF4444',
  },
  errorSummaryCard: {
    borderColor: '#EF4444',
  },
  errorSummaryText: {
    color: '#EF4444',
  },
}); 