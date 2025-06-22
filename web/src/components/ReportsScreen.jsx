'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { 
  ArrowLeft, 
  BarChart3, 
  Calendar, 
  FileText, 
  PieChart, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  RefreshCw,
  Sparkles,
  Loader2,
  Users
} from 'lucide-react';
import APIService from '../lib/api';
import logger from '../lib/logger';

export default function ReportsScreen({ user, onBack }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState({
    type: 'monthly',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    quarter: Math.ceil((new Date().getMonth() + 1) / 3)
  });
  const [generatedReport, setGeneratedReport] = useState(null);
  const [showReportViewer, setShowReportViewer] = useState(false);

  useEffect(() => {
    loadReports();
    checkServiceStatus();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setReports([]);
    } catch (error) {
      logger.error('Failed to load reports', error, 'Reports');
    } finally {
      setLoading(false);
    }
  };

  const checkServiceStatus = async () => {
    try {
      const status = await APIService.getReportServiceStatus();
      setServiceStatus(status);
    } catch (error) {
      logger.error('Failed to check service status', error, 'Reports');
    }
  };

  const generateMonthlyReport = async () => {
    try {
      setLoading(true);
      const response = await APIService.generateMonthlyCaseSummary(
        selectedPeriod.month, 
        selectedPeriod.year
      );
      
      if (response.report) {
        setGeneratedReport({
          report: response.report,
          title: 'Monthly Case Summary',
          type: 'monthly'
        });
        setShowReportViewer(true);
      }
      
      logger.success('Monthly report generated successfully', 'Reports');
    } catch (error) {
      logger.error('Failed to generate monthly report', error, 'Reports');
      alert('Failed to generate monthly report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateQuarterlyReport = async () => {
    try {
      setLoading(true);
      const response = await APIService.generateQuarterlyOutcomeReport(
        selectedPeriod.quarter, 
        selectedPeriod.year
      );
      
      if (response.report) {
        setGeneratedReport({
          report: response.report,
          title: 'Quarterly Outcome Report',
          type: 'quarterly'
        });
        setShowReportViewer(true);
      }
      
      logger.success('Quarterly report generated successfully', 'Reports');
    } catch (error) {
      logger.error('Failed to generate quarterly report', error, 'Reports');
      alert('Failed to generate quarterly report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const quarters = [
    { value: 1, label: 'Q1 (Jan-Mar)' },
    { value: 2, label: 'Q2 (Apr-Jun)' },
    { value: 3, label: 'Q3 (Jul-Sep)' },
    { value: 4, label: 'Q4 (Oct-Dec)' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const isAIAnalysisFailed = generatedReport?.report?.ai_insights?.summary?.includes('AI analysis failed') || 
                            generatedReport?.report?.ai_insights?.executive_summary?.includes('AI analysis failed');

  if (showReportViewer && generatedReport) {
    return (
      <ReportViewer
        report={generatedReport}
        onBack={() => {
          setShowReportViewer(false);
          setGeneratedReport(null);
        }}
        isAIAnalysisFailed={isAIAnalysisFailed}
      />
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-white/20 bg-white/80 backdrop-blur-sm px-6 shadow-lg">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          className="h-10 w-10 bg-white/70 border-white/30 hover:bg-white/90"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <PieChart className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            AI Reports
          </h1>
        </div>
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={checkServiceStatus}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-6 p-6">
        {serviceStatus && (
          <Card className="bg-white/80 backdrop-blur-sm border-white/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {serviceStatus.service_healthy ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                AI Report Service
              </CardTitle>
              <CardDescription>
                {serviceStatus.message || 'Checking service status...'}
              </CardDescription>
            </CardHeader>
            {serviceStatus.claude_ai_configured && (
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <Sparkles className="h-4 w-4" />
                    AI-Powered Analysis
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <BarChart3 className="h-4 w-4" />
                    Database Integration
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <BarChart3 className="h-5 w-5" />
                Monthly Case Summary
              </CardTitle>
              <CardDescription>
                AI analysis of monthly case management activities, trends, and insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="month">Month</Label>
                  <Select
                    value={selectedPeriod.month.toString()}
                    onValueChange={(value) => 
                      setSelectedPeriod({ ...selectedPeriod, month: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select
                    value={selectedPeriod.year.toString()}
                    onValueChange={(value) => 
                      setSelectedPeriod({ ...selectedPeriod, year: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={generateMonthlyReport}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Monthly Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/30 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <TrendingUp className="h-5 w-5" />
                Quarterly Outcome Report
              </CardTitle>
              <CardDescription>
                Strategic quarterly analysis with performance metrics and outcome trends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quarter">Quarter</Label>
                  <Select
                    value={selectedPeriod.quarter.toString()}
                    onValueChange={(value) => 
                      setSelectedPeriod({ ...selectedPeriod, quarter: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {quarters.map(quarter => (
                        <SelectItem key={quarter.value} value={quarter.value.toString()}>
                          {quarter.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select
                    value={selectedPeriod.year.toString()}
                    onValueChange={(value) => 
                      setSelectedPeriod({ ...selectedPeriod, year: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={generateQuarterlyReport}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Generate Quarterly Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <Sparkles className="h-5 w-5" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-emerald-100 p-2">
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-medium text-emerald-900">Smart Analysis</h4>
                  <p className="text-sm text-emerald-700">
                    AI analyzes patterns and trends in your case management data
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-teal-100 p-2">
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-medium text-teal-900">Actionable Insights</h4>
                  <p className="text-sm text-teal-700">
                    Get recommendations and improvement suggestions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-cyan-100 p-2">
                  <FileText className="h-4 w-4 text-cyan-600" />
                </div>
                <div>
                  <h4 className="font-medium text-cyan-900">HIPAA Compliant</h4>
                  <p className="text-sm text-cyan-700">
                    Privacy-preserving analysis with secure data handling
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReportViewer({ report, onBack, isAIAnalysisFailed }) {
  const [activeTab, setActiveTab] = useState('overview');

  const MetricCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <Card className="bg-white/80 backdrop-blur-sm border-white/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          </div>
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
      </CardContent>
    </Card>
  );

  const InsightCard = ({ title, items, icon: Icon, isError = false }) => (
    <Card className={`bg-white/80 backdrop-blur-sm border-white/30 ${isError ? 'border-red-200 bg-red-50/50' : ''}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isError ? 'text-red-600' : 'text-gray-900'}`}>
          <Icon className={`h-5 w-5 ${isError ? 'text-red-600' : 'text-blue-600'}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items && items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={index} className={`flex items-start gap-2 ${isError ? 'text-red-700' : 'text-gray-700'}`}>
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isError ? 'bg-red-400' : 'bg-blue-400'}`} />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No {title.toLowerCase()} available</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-white/20 bg-white/80 backdrop-blur-sm px-6 shadow-lg">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          className="h-10 w-10 bg-white/70 border-white/30 hover:bg-white/90"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
        </div>
        <div className="ml-auto">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {isAIAnalysisFailed && (
        <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-medium text-red-900">AI Analysis Unavailable</h3>
              <p className="text-sm text-red-700">
                The Claude AI model is currently unavailable. The system has been updated to use Claude 3.5 Sonnet. Report data is still available below.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-white/20 bg-white/50">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'insights', name: 'AI Insights', icon: Sparkles }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-white/30">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {report.report.report_type === 'monthly_case_summary' ? 'Monthly Case Summary' : 'Quarterly Outcome Report'}
                    </CardTitle>
                    <CardDescription className="text-lg font-medium text-emerald-600">
                      {report.report.period}
                    </CardDescription>
                    <p className="text-sm text-gray-600 mt-1">
                      Generated on {new Date(report.report.generated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    report.report.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {report.report.status === 'completed' ? 'Complete' : 'Failed'}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {(report.report.summary || report.report.metrics) && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {report.report.summary && (
                  <>
                    <MetricCard title="Total Clients" value={report.report.summary.total_clients} icon={Users} color="blue" />
                    <MetricCard title="Active Cases" value={report.report.summary.active_cases} icon={FileText} color="green" />
                    <MetricCard title="Case Notes" value={report.report.summary.total_case_notes} icon={FileText} color="purple" />
                    <MetricCard title="Completed Tasks" value={report.report.summary.completed_tasks} icon={CheckCircle} color="yellow" />
                  </>
                )}
                {report.report.metrics && (
                  <>
                    <MetricCard title="Task Completion Rate" value={`${report.report.metrics.task_completion_rate}%`} icon={TrendingUp} color="green" />
                    <MetricCard title="Notes per Client" value={report.report.metrics.case_notes_per_client?.toFixed(1) || '0'} icon={FileText} color="purple" />
                  </>
                )}
              </div>
            )}

            {(report.report.ai_insights?.summary || report.report.ai_insights?.executive_summary) && (
              <Card className={`bg-white/80 backdrop-blur-sm border-white/30 ${isAIAnalysisFailed ? 'border-red-200 bg-red-50/50' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className={`h-5 w-5 ${isAIAnalysisFailed ? 'text-red-600' : 'text-yellow-600'}`} />
                    AI Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-gray-700 leading-relaxed ${isAIAnalysisFailed ? 'text-red-700' : ''}`}>
                    {report.report.ai_insights.summary || report.report.ai_insights.executive_summary}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            {report.report.ai_insights ? (
              <div className="grid gap-6 md:grid-cols-2">
                {report.report.ai_insights.key_insights && (
                  <InsightCard title="Key Insights" items={report.report.ai_insights.key_insights} icon={BarChart3} isError={isAIAnalysisFailed} />
                )}
                {report.report.ai_insights.recommendations && (
                  <InsightCard title="Recommendations" items={report.report.ai_insights.recommendations} icon={Sparkles} isError={isAIAnalysisFailed} />
                )}
                {report.report.ai_insights.notable_trends && (
                  <InsightCard title="Notable Trends" items={report.report.ai_insights.notable_trends} icon={TrendingUp} isError={isAIAnalysisFailed} />
                )}
                {report.report.ai_insights.outcome_trends && (
                  <InsightCard title="Outcome Trends" items={report.report.ai_insights.outcome_trends} icon={BarChart3} isError={isAIAnalysisFailed} />
                )}
                {report.report.ai_insights.success_factors && (
                  <InsightCard title="Success Factors" items={report.report.ai_insights.success_factors} icon={CheckCircle} isError={isAIAnalysisFailed} />
                )}
                {report.report.ai_insights.improvement_areas && (
                  <InsightCard title="Improvement Areas" items={report.report.ai_insights.improvement_areas} icon={AlertCircle} isError={isAIAnalysisFailed} />
                )}
              </div>
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm border-white/30">
                <CardContent className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Insights Available</h3>
                  <p className="text-gray-600">
                    AI analysis is currently unavailable. Please check the AI service configuration.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 