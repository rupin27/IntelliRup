import { useState } from "react";
import { Shield, Activity, Clock, AlertTriangle } from "lucide-react";
import ThreatAnalyzer from "@/components/ThreatAnalyzer";
import MetricsPanel from "@/components/MetricsPanel";
import ThreatTable from "@/components/ThreatTable";
import RiskChart from "@/components/RiskChart";
import ThreatNetwork from "@/components/ThreatNetwork";
import { ThreatData } from "@/types/threat";
import { formatMarkdownBold } from "@/lib/utils";

const Index = () => {
  const [analysisData, setAnalysisData] = useState<{
    threats: ThreatData[];
    report: string;
    executionTime: number;
  } | null>(null);

  const handleAnalysisComplete = (data: {
    threats: ThreatData[];
    report: string;
    executionTime: number;
  }) => {
    setAnalysisData(data);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 pb-17 max-w-7xl">
        {/* Header */}
        <header className="mb-12 text-center animate-slide-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold gradient-text" style={{ lineHeight: 'normal' }}>
              Cyber Threat Intelligence
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Analyze recent cybersecurity threats with AI-powered insights
          </p>
        </header>

        {/* Threat Analyzer Input */}
        <ThreatAnalyzer onAnalysisComplete={handleAnalysisComplete} />

        {/* Results Section */}
        {analysisData && (
          <div className="space-y-8 animate-slide-in">
            {/* Metrics Panel */}
            <MetricsPanel
              executionTime={analysisData.executionTime}
              threatCount={analysisData.threats.length}
              threats={analysisData.threats}
            />

            {/* Threat Report */}
            <div className="glass-card rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Threat Analysis Report</h2>
              </div>
              <div className="prose prose-invert max-w-none">
                <div 
                  className="bg-secondary/50 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: formatMarkdownBold(analysisData.report) }}
                />
              </div>
            </div>

            {/* Threat Table */}
            <ThreatTable threats={analysisData.threats} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RiskChart threats={analysisData.threats} />
              <ThreatNetwork threats={analysisData.threats} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
