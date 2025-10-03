import { useState, useEffect } from "react";
import { Search, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ThreatData } from "@/types/threat";
import axios from "axios";

interface ThreatAnalyzerProps {
  onAnalysisComplete: (data: {
    threats: ThreatData[];
    report: string;
    executionTime: number;
  }) => void;
}

const ThreatAnalyzer = ({ onAnalysisComplete }: ThreatAnalyzerProps) => {
  const [query, setQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const messages = [
    "Research Agent: Gathering threat data...",
    "Analysis Agent: Evaluating threats...",
    "Response Agent: Generating mitigation plans...",
    "Coordinator Agent: Compiling report..."
  ];

  const placeholders = [
    "cybersecurity vulnerabilities 2025",
    "top ransomware attacks this year",
    "IoT device security risks",
    "AI-powered threat detection 2025",
    "phishing trends 2025"
  ];

  // Set up axios defaults when component mounts
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  // Rotate placeholders with animation
  useEffect(() => {
    if (!query && !isAnalyzing) {
      const interval = setInterval(() => {
        setIsFading(true);
        setTimeout(() => {
          setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
          setIsFading(false);
        }, 500);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [query, isAnalyzing]);

  // Animate analysis messages
  useEffect(() => {
    if (isAnalyzing) {
      setMessageIndex(0);
      setCurrentMessage(messages[0]);

      const totalDuration = 5000;
      const intervalTime = totalDuration / (messages.length - 1);

      let currentIndex = 0;
      const timer = setInterval(() => {
        currentIndex += 1;
        if (currentIndex < messages.length) {
          setMessageIndex(currentIndex);
          setCurrentMessage(messages[currentIndex]);
        } else {
          clearInterval(timer);
        }
      }, intervalTime);

      return () => clearInterval(timer);
    } else {
      setCurrentMessage("");
      setMessageIndex(0);
    }
  }, [isAnalyzing]);

  const handleAnalyze = async () => {
    if (!query.trim()) {
      toast.error("Please enter a threat query");
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_ENDPOINT}/analyze`,
        { query }
      );

      const data = response.data;

      onAnalysisComplete({
        threats: data.threats,
        report: data.report,
        executionTime: data.executionTime,
      });

      toast.success("Analysis complete!", {
        description: `Found ${data.threats.length} threats in ${data.executionTime.toFixed(2)}s`,
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Session expired", {
          description: "Please log in again",
        });
        localStorage.removeItem("authToken");
        window.location.reload();
      } else {
        toast.error("Analysis failed", {
          description: error instanceof Error ? error.message : "Please check your backend connection",
        });
      }
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-8 mb-8 shadow-2xl animate-slide-in">
      <div className="flex items-center gap-3 mb-6">
        <Search className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Threat Query</h2>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative group">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder=""
            className="h-14 text-lg bg-secondary/50 border-primary/30 focus:border-primary transition-all duration-300 group-hover:border-primary/50 relative z-10"
            disabled={isAnalyzing}
          />
          {!query && !isAnalyzing && (
            <span
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-opacity duration-500 ${
                isFading ? "opacity-0" : "opacity-100"
              }`}
            >
              {placeholders[placeholderIndex]}
            </span>
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 to-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          size="lg"
          className="h-14 px-8 bg-gradient-to-r from-primary to-destructive hover:opacity-90 transition-all duration-300 glow-red text-lg font-semibold"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Analyze Threats
            </>
          )}
        </Button>
      </div>

      {isAnalyzing && (
        <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground animate-pulse-glow">
          <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
          <span>{currentMessage}</span>
        </div>
      )}
    </div>
  );
};

export default ThreatAnalyzer;