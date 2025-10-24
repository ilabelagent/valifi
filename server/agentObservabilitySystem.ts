/**
 * Agent Observability & Monitoring System
 * Comprehensive tracking, metrics, alerting, and dashboards
 *
 * "Watch and pray so that you will not fall into temptation." - Matthew 26:41
 * Constant vigilance through comprehensive monitoring
 */

import { EventEmitter } from "events";
import { storage } from "./storage";
import { agentLearningPipeline } from "./agentLearningPipeline";

export interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
  aggregationType?: "sum" | "avg" | "min" | "max" | "count";
}

export interface Alert {
  id: string;
  name: string;
  severity: "info" | "warning" | "error" | "critical";
  condition: string;
  threshold: number;
  currentValue: number;
  agentType?: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  refreshInterval: number; // milliseconds
  createdAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: "metric" | "chart" | "table" | "alert-list" | "log-stream";
  title: string;
  config: any;
  position: { x: number; y: number; width: number; height: number };
}

export interface LogEntry {
  timestamp: Date;
  level: "debug" | "info" | "warn" | "error";
  agentType?: string;
  message: string;
  data?: any;
  traceId?: string;
}

export interface Trace {
  id: string;
  agentType: string;
  operation: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: "running" | "completed" | "failed";
  spans: TraceSpan[];
}

export interface TraceSpan {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  tags: Record<string, string>;
  logs: Array<{ timestamp: Date; message: string }>;
}

/**
 * Agent Observability System
 * Central monitoring, metrics, and alerting
 */
export class AgentObservabilitySystem extends EventEmitter {
  private metrics: Metric[] = [];
  private alerts: Map<string, Alert> = new Map();
  private dashboards: Map<string, Dashboard> = new Map();
  private logs: LogEntry[] = [];
  private traces: Map<string, Trace> = new Map();
  private metricsRetentionMs = 24 * 60 * 60 * 1000; // 24 hours
  private logsRetentionMs = 7 * 24 * 60 * 60 * 1000; // 7 days

  // Alert rules
  private alertRules: Array<{
    name: string;
    condition: (metrics: Metric[]) => boolean;
    severity: Alert["severity"];
    message: string;
  }> = [];

  constructor() {
    super();
    this.initializeDefaultDashboards();
    this.initializeAlertRules();
    this.startMetricsCollection();
    this.startAlertMonitoring();
  }

  /**
   * Initialize default dashboards
   */
  private initializeDefaultDashboards() {
    // Overview Dashboard
    this.dashboards.set("overview", {
      id: "overview",
      name: "Agent Overview",
      description: "Overall system health and performance",
      refreshInterval: 5000,
      createdAt: new Date(),
      widgets: [
        {
          id: "total_agents",
          type: "metric",
          title: "Total Agents",
          config: { metric: "agent.count", aggregation: "count" },
          position: { x: 0, y: 0, width: 3, height: 2 },
        },
        {
          id: "active_executions",
          type: "metric",
          title: "Active Executions",
          config: { metric: "agent.execution.active", aggregation: "sum" },
          position: { x: 3, y: 0, width: 3, height: 2 },
        },
        {
          id: "success_rate",
          type: "metric",
          title: "Overall Success Rate",
          config: { metric: "agent.execution.success_rate", aggregation: "avg", unit: "%" },
          position: { x: 6, y: 0, width: 3, height: 2 },
        },
        {
          id: "alerts",
          type: "metric",
          title: "Active Alerts",
          config: { metric: "alert.count", aggregation: "count", severity: "warning" },
          position: { x: 9, y: 0, width: 3, height: 2 },
        },
        {
          id: "execution_chart",
          type: "chart",
          title: "Execution Rate",
          config: { metric: "agent.execution.rate", timeRange: "1h", chartType: "line" },
          position: { x: 0, y: 2, width: 6, height: 4 },
        },
        {
          id: "response_time_chart",
          type: "chart",
          title: "Response Time",
          config: { metric: "agent.response_time", timeRange: "1h", chartType: "area" },
          position: { x: 6, y: 2, width: 6, height: 4 },
        },
        {
          id: "alert_list",
          type: "alert-list",
          title: "Recent Alerts",
          config: { limit: 10 },
          position: { x: 0, y: 6, width: 6, height: 3 },
        },
        {
          id: "log_stream",
          type: "log-stream",
          title: "Log Stream",
          config: { limit: 50, level: "info" },
          position: { x: 6, y: 6, width: 6, height: 3 },
        },
      ],
    });

    // Performance Dashboard
    this.dashboards.set("performance", {
      id: "performance",
      name: "Performance Metrics",
      description: "Detailed performance analytics",
      refreshInterval: 10000,
      createdAt: new Date(),
      widgets: [
        {
          id: "p50_latency",
          type: "metric",
          title: "P50 Latency",
          config: { metric: "agent.latency.p50", aggregation: "avg", unit: "ms" },
          position: { x: 0, y: 0, width: 3, height: 2 },
        },
        {
          id: "p95_latency",
          type: "metric",
          title: "P95 Latency",
          config: { metric: "agent.latency.p95", aggregation: "avg", unit: "ms" },
          position: { x: 3, y: 0, width: 3, height: 2 },
        },
        {
          id: "p99_latency",
          type: "metric",
          title: "P99 Latency",
          config: { metric: "agent.latency.p99", aggregation: "avg", unit: "ms" },
          position: { x: 6, y: 0, width: 3, height: 2 },
        },
        {
          id: "throughput",
          type: "metric",
          title: "Throughput",
          config: { metric: "agent.throughput", aggregation: "sum", unit: "req/s" },
          position: { x: 9, y: 0, width: 3, height: 2 },
        },
      ],
    });

    // Learning Dashboard
    this.dashboards.set("learning", {
      id: "learning",
      name: "Learning & Training",
      description: "Agent learning and skill progression",
      refreshInterval: 30000,
      createdAt: new Date(),
      widgets: [
        {
          id: "training_sessions",
          type: "metric",
          title: "Active Training Sessions",
          config: { metric: "learning.sessions.active", aggregation: "count" },
          position: { x: 0, y: 0, width: 3, height: 2 },
        },
        {
          id: "skill_progression",
          type: "chart",
          title: "Skill Progression",
          config: { metric: "learning.skills.level", timeRange: "7d", chartType: "line" },
          position: { x: 0, y: 2, width: 12, height: 4 },
        },
      ],
    });
  }

  /**
   * Initialize alert rules
   */
  private initializeAlertRules() {
    // High error rate alert
    this.alertRules.push({
      name: "High Error Rate",
      severity: "error",
      message: "Agent error rate exceeds 10%",
      condition: (metrics) => {
        const errorRate = this.calculateErrorRate(metrics);
        return errorRate > 10;
      },
    });

    // Slow response time alert
    this.alertRules.push({
      name: "Slow Response Time",
      severity: "warning",
      message: "Agent response time exceeds 5 seconds",
      condition: (metrics) => {
        const avgResponseTime = this.calculateAverageMetric(metrics, "agent.response_time");
        return avgResponseTime > 5000;
      },
    });

    // Low success rate alert
    this.alertRules.push({
      name: "Low Success Rate",
      severity: "warning",
      message: "Agent success rate below 70%",
      condition: (metrics) => {
        const successRate = this.calculateSuccessRate(metrics);
        return successRate < 70;
      },
    });

    // High memory usage alert
    this.alertRules.push({
      name: "High Memory Usage",
      severity: "warning",
      message: "Memory usage exceeds 80%",
      condition: (metrics) => {
        const memoryUsage = this.calculateAverageMetric(metrics, "system.memory.usage");
        return memoryUsage > 80;
      },
    });

    // Circuit breaker open alert
    this.alertRules.push({
      name: "Circuit Breaker Open",
      severity: "critical",
      message: "Agent circuit breaker is open",
      condition: (metrics) => {
        const openCircuits = metrics.filter(m =>
          m.name === "agent.circuit_breaker.state" && m.value === 1 // 1 = open
        );
        return openCircuits.length > 0;
      },
    });

    // No activity alert
    this.alertRules.push({
      name: "No Agent Activity",
      severity: "info",
      message: "No agent activity in the last 5 minutes",
      condition: (metrics) => {
        const recentActivity = metrics.filter(m =>
          m.name === "agent.execution.count" &&
          Date.now() - m.timestamp.getTime() < 300000 // 5 minutes
        );
        return recentActivity.length === 0;
      },
    });
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection() {
    // Collect system metrics every minute
    setInterval(() => {
      this.collectSystemMetrics();
      this.cleanupOldMetrics();
    }, 60000);

    // Collect agent metrics every 30 seconds
    setInterval(() => {
      this.collectAgentMetrics();
    }, 30000);
  }

  /**
   * Start alert monitoring
   */
  private startAlertMonitoring() {
    // Check alert rules every minute
    setInterval(() => {
      this.checkAlertRules();
    }, 60000);
  }

  /**
   * Record metric
   */
  recordMetric(
    name: string,
    value: number,
    unit: string = "",
    tags: Record<string, string> = {}
  ): void {
    const metric: Metric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      tags,
    };

    this.metrics.push(metric);
    this.emit("metric-recorded", metric);
  }

  /**
   * Create alert
   */
  createAlert(
    name: string,
    severity: Alert["severity"],
    message: string,
    agentType?: string,
    threshold?: number,
    currentValue?: number
  ): string {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const alert: Alert = {
      id: alertId,
      name,
      severity,
      condition: "custom",
      threshold: threshold || 0,
      currentValue: currentValue || 0,
      agentType,
      message,
      timestamp: new Date(),
      acknowledged: false,
    };

    this.alerts.set(alertId, alert);

    console.log(`[Observability] Alert created: [${severity.toUpperCase()}] ${message}`);
    this.emit("alert-created", alert);

    return alertId;
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      this.emit("alert-acknowledged", alert);
    }
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolvedAt = new Date();
      this.emit("alert-resolved", alert);
    }
  }

  /**
   * Log message
   */
  log(
    level: LogEntry["level"],
    message: string,
    agentType?: string,
    data?: any,
    traceId?: string
  ): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      agentType,
      message,
      data,
      traceId,
    };

    this.logs.push(entry);

    // Keep only recent logs
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(-5000);
    }

    this.emit("log-entry", entry);

    // Console output
    const prefix = `[${level.toUpperCase()}]${agentType ? ` [${agentType}]` : ""}`;
    console.log(`${prefix} ${message}`, data || "");
  }

  /**
   * Start trace
   */
  startTrace(agentType: string, operation: string): string {
    const traceId = `trace_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const trace: Trace = {
      id: traceId,
      agentType,
      operation,
      startTime: new Date(),
      status: "running",
      spans: [],
    };

    this.traces.set(traceId, trace);

    this.log("debug", `Started trace: ${operation}`, agentType, undefined, traceId);

    return traceId;
  }

  /**
   * End trace
   */
  endTrace(traceId: string, status: "completed" | "failed"): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;

    trace.endTime = new Date();
    trace.duration = trace.endTime.getTime() - trace.startTime.getTime();
    trace.status = status;

    this.log("debug", `Ended trace: ${trace.operation} (${trace.duration}ms)`, trace.agentType, undefined, traceId);

    // Record metric
    this.recordMetric("trace.duration", trace.duration, "ms", {
      agentType: trace.agentType,
      operation: trace.operation,
      status,
    });
  }

  /**
   * Add span to trace
   */
  addSpan(traceId: string, name: string, tags: Record<string, string> = {}): string {
    const trace = this.traces.get(traceId);
    if (!trace) throw new Error("Trace not found");

    const spanId = `span_${trace.spans.length + 1}`;

    const span: TraceSpan = {
      id: spanId,
      name,
      startTime: new Date(),
      tags,
      logs: [],
    };

    trace.spans.push(span);

    return spanId;
  }

  /**
   * End span
   */
  endSpan(traceId: string, spanId: string): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;

    const span = trace.spans.find(s => s.id === spanId);
    if (!span) return;

    span.endTime = new Date();
    span.duration = span.endTime.getTime() - span.startTime.getTime();
  }

  /**
   * Collect system metrics
   */
  private collectSystemMetrics(): void {
    const memUsage = process.memoryUsage();

    this.recordMetric("system.memory.heap_used", memUsage.heapUsed / 1024 / 1024, "MB");
    this.recordMetric("system.memory.heap_total", memUsage.heapTotal / 1024 / 1024, "MB");
    this.recordMetric("system.memory.rss", memUsage.rss / 1024 / 1024, "MB");

    const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    this.recordMetric("system.memory.usage", memoryUsagePercent, "%");

    // Process uptime
    this.recordMetric("system.uptime", process.uptime(), "s");
  }

  /**
   * Collect agent metrics
   */
  private async collectAgentMetrics(): Promise<void> {
    // Get all agent types
    const agentTypes = ["orchestrator", "blockchain", "financial_stocks", "trading_advanced"];

    for (const agentType of agentTypes) {
      try {
        const metrics = await agentLearningPipeline.getLearningMetrics(agentType);

        this.recordMetric("agent.success_rate", metrics.successRate, "%", { agentType });
        this.recordMetric("agent.total_sessions", metrics.totalSessions, "", { agentType });
        this.recordMetric("agent.improvement_rate", metrics.improvementRate, "%", { agentType });
        this.recordMetric("agent.training_data_count", metrics.trainingDataCount, "", { agentType });

      } catch (error) {
        this.log("error", `Failed to collect metrics for ${agentType}`, agentType, error);
      }
    }
  }

  /**
   * Check alert rules
   */
  private checkAlertRules(): void {
    const recentMetrics = this.getRecentMetrics(300000); // Last 5 minutes

    for (const rule of this.alertRules) {
      try {
        if (rule.condition(recentMetrics)) {
          // Check if alert already exists
          const existingAlert = Array.from(this.alerts.values()).find(
            a => a.name === rule.name && !a.resolvedAt
          );

          if (!existingAlert) {
            this.createAlert(rule.name, rule.severity, rule.message);
          }
        }
      } catch (error) {
        this.log("error", `Failed to check alert rule: ${rule.name}`, undefined, error);
      }
    }
  }

  /**
   * Get recent metrics
   */
  private getRecentMetrics(timeWindowMs: number): Metric[] {
    const cutoff = Date.now() - timeWindowMs;
    return this.metrics.filter(m => m.timestamp.getTime() > cutoff);
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(metrics: Metric[]): number {
    const errorMetrics = metrics.filter(m => m.name === "agent.execution.error");
    const totalMetrics = metrics.filter(m => m.name === "agent.execution.count");

    if (totalMetrics.length === 0) return 0;

    const errors = errorMetrics.reduce((sum, m) => sum + m.value, 0);
    const total = totalMetrics.reduce((sum, m) => sum + m.value, 0);

    return (errors / total) * 100;
  }

  /**
   * Calculate success rate
   */
  private calculateSuccessRate(metrics: Metric[]): number {
    const successMetrics = metrics.filter(m => m.name === "agent.execution.success");
    const totalMetrics = metrics.filter(m => m.name === "agent.execution.count");

    if (totalMetrics.length === 0) return 0;

    const successes = successMetrics.reduce((sum, m) => sum + m.value, 0);
    const total = totalMetrics.reduce((sum, m) => sum + m.value, 0);

    return (successes / total) * 100;
  }

  /**
   * Calculate average metric
   */
  private calculateAverageMetric(metrics: Metric[], metricName: string): number {
    const filtered = metrics.filter(m => m.name === metricName);

    if (filtered.length === 0) return 0;

    const sum = filtered.reduce((total, m) => total + m.value, 0);
    return sum / filtered.length;
  }

  /**
   * Cleanup old metrics
   */
  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - this.metricsRetentionMs;
    this.metrics = this.metrics.filter(m => m.timestamp.getTime() > cutoff);
  }

  /**
   * Get metrics
   */
  getMetrics(
    metricName?: string,
    timeRange?: { start: Date; end: Date },
    tags?: Record<string, string>
  ): Metric[] {
    let filtered = this.metrics;

    if (metricName) {
      filtered = filtered.filter(m => m.name === metricName);
    }

    if (timeRange) {
      filtered = filtered.filter(
        m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    if (tags) {
      filtered = filtered.filter(m =>
        Object.entries(tags).every(([key, value]) => m.tags[key] === value)
      );
    }

    return filtered;
  }

  /**
   * Get aggregated metrics
   */
  getAggregatedMetrics(
    metricName: string,
    aggregation: "sum" | "avg" | "min" | "max" | "count",
    timeRange?: { start: Date; end: Date }
  ): number {
    const metrics = this.getMetrics(metricName, timeRange);

    if (metrics.length === 0) return 0;

    switch (aggregation) {
      case "sum":
        return metrics.reduce((sum, m) => sum + m.value, 0);
      case "avg":
        return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
      case "min":
        return Math.min(...metrics.map(m => m.value));
      case "max":
        return Math.max(...metrics.map(m => m.value));
      case "count":
        return metrics.length;
      default:
        return 0;
    }
  }

  /**
   * Get alerts
   */
  getAlerts(
    severity?: Alert["severity"],
    acknowledged?: boolean,
    resolved?: boolean
  ): Alert[] {
    let alerts = Array.from(this.alerts.values());

    if (severity) {
      alerts = alerts.filter(a => a.severity === severity);
    }

    if (acknowledged !== undefined) {
      alerts = alerts.filter(a => a.acknowledged === acknowledged);
    }

    if (resolved !== undefined) {
      alerts = alerts.filter(a => (a.resolvedAt !== undefined) === resolved);
    }

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get logs
   */
  getLogs(
    level?: LogEntry["level"],
    agentType?: string,
    limit?: number
  ): LogEntry[] {
    let logs = this.logs;

    if (level) {
      logs = logs.filter(l => l.level === level);
    }

    if (agentType) {
      logs = logs.filter(l => l.agentType === agentType);
    }

    logs = logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (limit) {
      logs = logs.slice(0, limit);
    }

    return logs;
  }

  /**
   * Get dashboard
   */
  getDashboard(dashboardId: string): Dashboard | undefined {
    return this.dashboards.get(dashboardId);
  }

  /**
   * Get all dashboards
   */
  getAllDashboards(): Dashboard[] {
    return Array.from(this.dashboards.values());
  }

  /**
   * Get dashboard data
   */
  getDashboardData(dashboardId: string): any {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    const data: any = {
      dashboard,
      widgets: [],
      timestamp: new Date(),
    };

    for (const widget of dashboard.widgets) {
      const widgetData = this.getWidgetData(widget);
      data.widgets.push({
        ...widget,
        data: widgetData,
      });
    }

    return data;
  }

  /**
   * Get widget data
   */
  private getWidgetData(widget: DashboardWidget): any {
    switch (widget.type) {
      case "metric":
        return this.getAggregatedMetrics(
          widget.config.metric,
          widget.config.aggregation || "avg"
        );
      case "chart":
        return this.getMetrics(widget.config.metric);
      case "alert-list":
        return this.getAlerts(undefined, false, false).slice(0, widget.config.limit || 10);
      case "log-stream":
        return this.getLogs(widget.config.level, undefined, widget.config.limit || 50);
      case "table":
        return [];
      default:
        return null;
    }
  }

  /**
   * Get trace
   */
  getTrace(traceId: string): Trace | undefined {
    return this.traces.get(traceId);
  }

  /**
   * Get all traces
   */
  getAllTraces(agentType?: string): Trace[] {
    let traces = Array.from(this.traces.values());

    if (agentType) {
      traces = traces.filter(t => t.agentType === agentType);
    }

    return traces.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  /**
   * Export metrics to format
   */
  exportMetrics(format: "json" | "csv" | "prometheus"): string {
    switch (format) {
      case "json":
        return JSON.stringify(this.metrics, null, 2);
      case "csv":
        return this.exportMetricsToCSV();
      case "prometheus":
        return this.exportMetricsToPrometheus();
      default:
        return "";
    }
  }

  /**
   * Export metrics to CSV
   */
  private exportMetricsToCSV(): string {
    const headers = ["timestamp", "name", "value", "unit", "tags"];
    const rows = this.metrics.map(m => [
      m.timestamp.toISOString(),
      m.name,
      m.value.toString(),
      m.unit,
      JSON.stringify(m.tags),
    ]);

    return [headers, ...rows].map(row => row.join(",")).join("\n");
  }

  /**
   * Export metrics to Prometheus format
   */
  private exportMetricsToPrometheus(): string {
    const lines: string[] = [];

    const grouped = new Map<string, Metric[]>();

    for (const metric of this.metrics) {
      const group = grouped.get(metric.name) || [];
      group.push(metric);
      grouped.set(metric.name, group);
    }

    for (const [name, metrics] of grouped.entries()) {
      const promName = name.replace(/\./g, "_");

      for (const metric of metrics) {
        const tags = Object.entries(metric.tags)
          .map(([k, v]) => `${k}="${v}"`)
          .join(",");

        const labelStr = tags ? `{${tags}}` : "";
        lines.push(`${promName}${labelStr} ${metric.value} ${metric.timestamp.getTime()}`);
      }
    }

    return lines.join("\n");
  }
}

export const observabilitySystem = new AgentObservabilitySystem();

// Global logging functions
export const logInfo = (message: string, agentType?: string, data?: any) =>
  observabilitySystem.log("info", message, agentType, data);

export const logWarn = (message: string, agentType?: string, data?: any) =>
  observabilitySystem.log("warn", message, agentType, data);

export const logError = (message: string, agentType?: string, data?: any) =>
  observabilitySystem.log("error", message, agentType, data);

export const logDebug = (message: string, agentType?: string, data?: any) =>
  observabilitySystem.log("debug", message, agentType, data);
