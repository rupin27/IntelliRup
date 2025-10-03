export interface ThreatData {
  title: string;
  url: string;
  risk: "High" | "Medium" | "Low" | "Unknown";
  snippet: string;
}

export interface AnalysisResult {
  threats: ThreatData[];
  report: string;
  executionTime: number;
}
