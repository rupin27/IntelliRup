import { Clock, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ThreatData } from "@/types/threat";
import { useEffect, useState } from "react";

interface MetricsPanelProps {
  executionTime: number;
  threatCount: number;
  threats: ThreatData[];
}

const MetricsPanel = ({ executionTime, threatCount, threats }: MetricsPanelProps) => {
  const [animatedTime, setAnimatedTime] = useState(0);
  const [animatedCount, setAnimatedCount] = useState(0);

  const highRiskCount = threats.filter((t) => t.risk === "High").length;
  const mediumRiskCount = threats.filter((t) => t.risk === "Medium").length;
  const lowRiskCount = threats.filter((t) => t.risk === "Low").length;
  const unknownRiskCount = threats.filter((t) => t.risk === "Unknown").length;

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const timeIncrement = executionTime / steps;
    const countIncrement = threatCount / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setAnimatedTime(Math.min(timeIncrement * currentStep, executionTime));
      setAnimatedCount(Math.min(Math.floor(countIncrement * currentStep), threatCount));

      if (currentStep >= steps) clearInterval(interval);
    }, duration / steps);

    return () => clearInterval(interval);
  }, [executionTime, threatCount]);

  const metrics = [
    {
      label: "Execution Time",
      value: `${animatedTime.toFixed(2)}s`,
      icon: Clock,
      color: "text-cyber-blue",
      glow: "glow-blue",
    },
    {
      label: "Threats Detected",
      value: animatedCount,
      icon: Shield,
      color: "text-primary",
      glow: "",
    },
    {
      label: "High Risk",
      value: highRiskCount,
      icon: AlertTriangle,
      color: "text-destructive",
      glow: "",
    },
    {
      label: "Medium Risk",
      value: mediumRiskCount,
      icon: AlertTriangle,
      color: "text-warning",
      glow: "",
    },
    {
      label: "Low Risk",
      value: lowRiskCount,
      icon: CheckCircle,
      color: "text-success",
      glow: "",
    },
    {
      label: "Unknown Risk",
      value: unknownRiskCount,
      icon: Shield,
      color: "text-muted-foreground",
      glow: "",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {metrics.map((metric, index) => (
        <Card
          key={metric.label}
          className="glass-card p-6 hover:scale-105 transition-transform duration-300 animate-slide-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex flex-col items-center text-center gap-3">
            <metric.icon className={`w-8 h-8 ${metric.color} ${metric.glow}`} />
            <div>
              <p className="text-3xl font-bold font-mono">{metric.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{metric.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MetricsPanel;
