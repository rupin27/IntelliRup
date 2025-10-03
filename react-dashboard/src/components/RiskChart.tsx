import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { ThreatData } from "@/types/threat";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface RiskChartProps {
  threats: ThreatData[];
}

const RiskChart = ({ threats }: RiskChartProps) => {
  const chartData = useMemo(() => {
    const riskCounts = {
      High: threats.filter((t) => t.risk === "High").length,
      Medium: threats.filter((t) => t.risk === "Medium").length,
      Low: threats.filter((t) => t.risk === "Low").length,
      Unknown: threats.filter((t) => t.risk === "Unknown").length,
    };

    return [
      { risk: "High", count: riskCounts.High, color: "hsl(0, 85%, 60%)" },
      { risk: "Medium", count: riskCounts.Medium, color: "hsl(33, 100%, 56%)" },
      { risk: "Low", count: riskCounts.Low, color: "hsl(142, 71%, 45%)" },
      { risk: "Unknown", count: riskCounts.Unknown, color: "hsl(215, 20%, 65%)" },
    ];
  }, [threats]);

  return (
    <div className="glass-card rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Risk Distribution</h2>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(229, 20%, 20%)" />
          <XAxis
            dataKey="risk"
            stroke="hsl(215, 20%, 65%)"
            tick={{ fill: "hsl(215, 20%, 65%)" }}
          />
          <YAxis
            stroke="hsl(215, 20%, 65%)"
            tick={{ fill: "hsl(215, 20%, 65%)" }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(229, 25%, 12%)",
              border: "1px solid hsl(229, 20%, 20%)",
              borderRadius: "0.5rem",
              color: "hsl(210, 40%, 98%)",
            }}
            cursor={{ fill: "hsl(229, 20%, 18%)" }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-4 gap-4">
        {chartData.map((item) => (
          <div
            key={item.risk}
            className="text-center p-4 rounded-lg bg-secondary/30 border border-white/5 hover:border-white/20 transition-colors"
          >
            <div
              className="text-3xl font-bold font-mono"
              style={{ color: item.color }}
            >
              {item.count}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{item.risk}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskChart;
