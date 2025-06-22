"""
AI-powered report analysis service using Claude API
"""
import logging
import os
from typing import Dict, Any
from datetime import datetime
import json
from anthropic import Anthropic
from config.database import get_supabase

logger = logging.getLogger(__name__)

class ReportAnalysisService:
    def __init__(self):
        self.logger = logger
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        self.client = None
        
        if self.anthropic_key:
            try:
                self.client = Anthropic(api_key=self.anthropic_key)
                logger.info("✅ Claude AI client initialized")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Claude AI client: {e}")
        else:
            logger.warning("⚠️ ANTHROPIC_API_KEY not found")
    
    def is_healthy(self) -> bool:
        """Check if service is healthy"""
        return bool(self.anthropic_key and self.client)
    
    async def generate_monthly_case_summary(self, user_id: str, month: int, year: int) -> Dict[str, Any]:
        """Generate AI-powered monthly case summary report"""
        try:
            logger.info(f"📊 Generating monthly case summary for {month}/{year}")
            
            # Get data from database
            case_data = await self._get_monthly_case_data(user_id, month, year)
            
            if not case_data["clients"]:
                return {
                    "report_type": "monthly_case_summary",
                    "period": f"{month:02d}/{year}",
                    "status": "no_data",
                    "message": "No case data found for this period",
                    "generated_at": datetime.utcnow().isoformat()
                }
            
            # Generate AI report
            ai_analysis = await self._generate_ai_case_summary(case_data)
            
            # Compile final report
            report = {
                "report_type": "monthly_case_summary",
                "period": f"{month:02d}/{year}",
                "status": "completed",
                "generated_at": datetime.utcnow().isoformat(),
                "summary": {
                    "total_clients": len(case_data["clients"]),
                    "new_clients": len([c for c in case_data["clients"] if c.get("is_new_this_month", False)]),
                    "active_cases": len([c for c in case_data["clients"] if c.get("status") == "active"]),
                    "total_case_notes": len(case_data["case_notes"]),
                    "completed_tasks": len([t for t in case_data["tasks"] if t.get("status") == "completed"])
                },
                "ai_insights": ai_analysis
            }
            
            logger.info("✅ Monthly case summary generated successfully")
            return report
            
        except Exception as e:
            logger.error(f"❌ Error generating monthly case summary: {e}")
            raise
    
    async def generate_quarterly_outcome_report(self, user_id: str, quarter: int, year: int) -> Dict[str, Any]:
        """Generate AI-powered quarterly outcome report"""
        try:
            logger.info(f"📈 Generating quarterly outcome report for Q{quarter}/{year}")
            
            # Get quarterly data
            outcome_data = await self._get_quarterly_outcome_data(user_id, quarter, year)
            
            if not outcome_data["clients"]:
                return {
                    "report_type": "quarterly_outcome",
                    "period": f"Q{quarter} {year}",
                    "status": "no_data",
                    "message": "No outcome data found for this quarter",
                    "generated_at": datetime.utcnow().isoformat()
                }
            
            # Generate AI analysis
            ai_analysis = await self._generate_ai_outcome_analysis(outcome_data, quarter, year)
            
            # Calculate metrics
            metrics = self._calculate_quarterly_metrics(outcome_data)
            
            # Compile final report
            report = {
                "report_type": "quarterly_outcome",
                "period": f"Q{quarter} {year}",
                "status": "completed",
                "generated_at": datetime.utcnow().isoformat(),
                "metrics": metrics,
                "ai_insights": ai_analysis
            }
            
            logger.info("✅ Quarterly outcome report generated successfully")
            return report
            
        except Exception as e:
            logger.error(f"❌ Error generating quarterly outcome report: {e}")
            raise
    
    async def _get_monthly_case_data(self, user_id: str, month: int, year: int) -> Dict[str, Any]:
        """Fetch monthly case data from database"""
        try:
            supabase = get_supabase()
            
            # Calculate date range
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1)
            else:
                end_date = datetime(year, month + 1, 1)
            
            start_str = start_date.isoformat()
            end_str = end_date.isoformat()
            
            # Get clients data
            clients_result = supabase.table("clients").select("*").execute()
            clients = clients_result.data or []
            
            # Mark new clients for this month
            for client in clients:
                try:
                    created_at = datetime.fromisoformat(client.get("created_at", "").replace("Z", "+00:00"))
                    client["is_new_this_month"] = start_date <= created_at < end_date
                except:
                    client["is_new_this_month"] = False
            
            # Get case notes for the month
            case_notes = []
            try:
                notes_result = supabase.table("case_notes").select("*").gte("created_at", start_str).lt("created_at", end_str).execute()
                case_notes = notes_result.data or []
            except:
                logger.info("📝 Case notes table not found or empty")
            
            # Get tasks for the month
            tasks = []
            try:
                tasks_result = supabase.table("tasks").select("*").gte("created_at", start_str).lt("created_at", end_str).execute()
                tasks = tasks_result.data or []
            except:
                logger.info("✅ Tasks table not found or empty")
            
            return {
                "period": f"{month:02d}/{year}",
                "date_range": {"start": start_str, "end": end_str},
                "clients": clients,
                "case_notes": case_notes,
                "tasks": tasks
            }
            
        except Exception as e:
            logger.error(f"❌ Error fetching monthly case data: {e}")
            raise
    
    async def _get_quarterly_outcome_data(self, user_id: str, quarter: int, year: int) -> Dict[str, Any]:
        """Fetch quarterly outcome data from database"""
        try:
            supabase = get_supabase()
            
            # Calculate quarter date range
            start_month = (quarter - 1) * 3 + 1
            start_date = datetime(year, start_month, 1)
            
            if quarter == 4:
                end_date = datetime(year + 1, 1, 1)
            else:
                end_month = quarter * 3 + 1
                end_date = datetime(year, end_month, 1)
            
            start_str = start_date.isoformat()
            end_str = end_date.isoformat()
            
            # Get all clients
            clients_result = supabase.table("clients").select("*").execute()
            clients = clients_result.data or []
            
            # Get case notes for the quarter
            case_notes = []
            try:
                notes_result = supabase.table("case_notes").select("*").gte("created_at", start_str).lt("created_at", end_str).execute()
                case_notes = notes_result.data or []
            except:
                logger.info("📝 Case notes table not found or empty")
            
            # Get tasks for the quarter  
            tasks = []
            try:
                tasks_result = supabase.table("tasks").select("*").gte("created_at", start_str).lt("created_at", end_str).execute()
                tasks = tasks_result.data or []
            except:
                logger.info("✅ Tasks table not found or empty")
            
            return {
                "period": f"Q{quarter} {year}",
                "date_range": {"start": start_str, "end": end_str},
                "clients": clients,
                "case_notes": case_notes,
                "tasks": tasks
            }
            
        except Exception as e:
            logger.error(f"❌ Error fetching quarterly outcome data: {e}")
            raise
    
    async def _generate_ai_case_summary(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate AI-powered case summary using Claude"""
        try:
            if not self.client:
                return {
                    "summary": "AI analysis unavailable - Anthropic API key not configured",
                    "key_insights": ["Configure ANTHROPIC_API_KEY to enable AI analysis"],
                    "recommendations": ["Set up Claude API access for intelligent reports"],
                    "service_available": False
                }
            
            prompt = f"""Analyze this social work case management data and provide JSON insights:

DATA SUMMARY:
- Total Clients: {len(case_data['clients'])}
- New Clients: {len([c for c in case_data['clients'] if c.get('is_new_this_month')])}
- Active Cases: {len([c for c in case_data['clients'] if c.get('status') == 'active'])}
- Case Notes: {len(case_data['case_notes'])}
- Tasks: {len(case_data['tasks'])} ({len([t for t in case_data['tasks'] if t.get('status') == 'completed'])} completed)

Provide analysis in this JSON format:
{{
    "summary": "Brief executive summary (2-3 sentences)",
    "key_insights": ["Insight 1", "Insight 2", "Insight 3"],
    "recommendations": ["Rec 1", "Rec 2", "Rec 3"],
    "notable_trends": ["Trend 1", "Trend 2"],
    "service_available": true
}}"""
            
            # Call Claude API
            response = self.client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=1500,
                temperature=0.3,
                messages=[{"role": "user", "content": prompt}]
            )
            
            ai_content = response.content[0].text
            
            # Try to parse JSON response
            try:
                return json.loads(ai_content)
            except json.JSONDecodeError:
                return {
                    "summary": ai_content[:300] + "..." if len(ai_content) > 300 else ai_content,
                    "key_insights": ["AI analysis completed"],
                    "recommendations": ["Review AI response format"],
                    "service_available": True
                }
            
        except Exception as e:
            logger.error(f"❌ AI analysis failed: {e}")
            return {
                "summary": f"AI analysis failed: {str(e)}",
                "key_insights": ["AI service error occurred"],
                "recommendations": ["Check Claude API configuration"],
                "service_available": False
            }
    
    async def _generate_ai_outcome_analysis(self, outcome_data: Dict[str, Any], quarter: int, year: int) -> Dict[str, Any]:
        """Generate AI-powered outcome analysis using Claude"""
        try:
            if not self.client:
                return {
                    "executive_summary": "AI analysis unavailable - Anthropic API key not configured",
                    "outcome_trends": ["Configure ANTHROPIC_API_KEY to enable AI analysis"],
                    "success_factors": ["Set up Claude API access"],
                    "improvement_areas": ["Enable AI-powered insights"],
                    "strategic_recommendations": ["Configure Claude API for quarterly analysis"],
                    "service_available": False
                }
            
            # Calculate metrics for AI prompt
            total_clients = len(outcome_data["clients"])
            active_clients = len([c for c in outcome_data["clients"] if c.get("status") == "active"])
            case_types = {}
            for client in outcome_data["clients"]:
                case_type = client.get("case_type", "Other")
                case_types[case_type] = case_types.get(case_type, 0) + 1
            
            prompt = f"""Analyze Q{quarter} {year} social work outcomes and provide strategic insights in JSON:

QUARTERLY METRICS:
- Total Clients: {total_clients}
- Active Cases: {active_clients}
- Case Types: {case_types}
- Case Notes: {len(outcome_data["case_notes"])}
- Tasks: {len(outcome_data["tasks"])} ({len([t for t in outcome_data["tasks"] if t.get("status") == "completed"])} completed)

Provide strategic analysis in this JSON format:
{{
    "executive_summary": "High-level Q{quarter} summary (3-4 sentences)",
    "outcome_trends": ["Trend 1", "Trend 2", "Trend 3"],
    "success_factors": ["Success 1", "Success 2", "Success 3"],
    "improvement_areas": ["Area 1", "Area 2", "Area 3"],
    "strategic_recommendations": ["Strategic rec 1", "Strategic rec 2", "Strategic rec 3"],
    "performance_indicators": {{
        "client_satisfaction_trend": "positive",
        "case_resolution_efficiency": "improved",
        "workload_management": "optimal"
    }},
    "service_available": true
}}"""
            
            # Call Claude API
            response = self.client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=2000,
                temperature=0.3,
                messages=[{"role": "user", "content": prompt}]
            )
            
            ai_content = response.content[0].text
            
            # Try to parse JSON response
            try:
                return json.loads(ai_content)
            except json.JSONDecodeError:
                return {
                    "executive_summary": ai_content[:400] + "..." if len(ai_content) > 400 else ai_content,
                    "outcome_trends": ["AI analysis completed"],
                    "success_factors": ["Data processing successful"],
                    "improvement_areas": ["Response format needs adjustment"],
                    "strategic_recommendations": ["Review AI output parsing"],
                    "performance_indicators": {
                        "client_satisfaction_trend": "stable",
                        "case_resolution_efficiency": "maintained",
                        "workload_management": "manageable"
                    },
                    "service_available": True
                }
            
        except Exception as e:
            logger.error(f"❌ AI outcome analysis failed: {e}")
            return {
                "executive_summary": f"AI analysis failed: {str(e)}",
                "outcome_trends": ["AI service error"],
                "success_factors": ["Data collection successful"],
                "improvement_areas": ["AI service configuration"],
                "strategic_recommendations": ["Check Claude API setup"],
                "performance_indicators": {
                    "client_satisfaction_trend": "unknown",
                    "case_resolution_efficiency": "unknown",
                    "workload_management": "unknown"
                },
                "service_available": False
            }
    
    def _calculate_quarterly_metrics(self, outcome_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate key quarterly metrics"""
        try:
            total_clients = len(outcome_data["clients"])
            active_clients = len([c for c in outcome_data["clients"] if c.get("status") == "active"])
            
            # Case type distribution
            case_types = {}
            for client in outcome_data["clients"]:
                case_type = client.get("case_type", "Other")
                case_types[case_type] = case_types.get(case_type, 0) + 1
            
            # Task completion rate
            total_tasks = len(outcome_data["tasks"])
            completed_tasks = len([t for t in outcome_data["tasks"] if t.get("status") == "completed"])
            task_completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            
            # Case notes per client average
            case_notes_per_client = len(outcome_data["case_notes"]) / total_clients if total_clients > 0 else 0
            
            return {
                "total_clients": total_clients,
                "active_clients": active_clients,
                "case_type_distribution": case_types,
                "task_completion_rate": round(task_completion_rate, 2),
                "total_case_notes": len(outcome_data["case_notes"]),
                "case_notes_per_client": round(case_notes_per_client, 2),
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks
            }
            
        except Exception as e:
            logger.error(f"❌ Error calculating quarterly metrics: {e}")
            return {}
