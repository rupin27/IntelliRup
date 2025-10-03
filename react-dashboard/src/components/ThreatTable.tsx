import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, ArrowUpDown } from "lucide-react";
import { ThreatData } from "@/types/threat";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ThreatTableProps {
  threats: ThreatData[];
}

type SortField = "title" | "risk";
type SortDirection = "asc" | "desc";

const ThreatTable = ({ threats }: ThreatTableProps) => {
  const [sortField, setSortField] = useState<SortField>("risk");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const riskOrder = { High: 4, Medium: 3, Low: 2, Unknown: 1 };

  const sortedThreats = useMemo(() => {
    return [...threats].sort((a, b) => {
      let comparison = 0;
      if (sortField === "risk") {
        comparison = riskOrder[a.risk] - riskOrder[b.risk];
      } else {
        comparison = a.title.localeCompare(b.title);
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [threats, sortField, sortDirection]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "bg-destructive/20 text-destructive border-destructive/50 hover:bg-destructive/30";
      case "Medium":
        return "bg-warning/20 text-warning border-warning/50 hover:bg-warning/30";
      case "Low":
        return "bg-success/20 text-success border-success/50 hover:bg-success/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/50";
    }
  };

  const downloadCSV = () => {
    const headers = ["Title", "URL", "Risk", "Snippet"];
    const rows = threats.map((t) => [
      `"${t.title}"`,
      `"${t.url}"`,
      t.risk,
      `"${t.snippet}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "threats.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast.success("CSV downloaded successfully");
  };

  return (
    <div className="glass-card rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Threat Summary</h2>
          <Badge variant="secondary" className="font-mono">
            {threats.length} threats
          </Badge>
        </div>
        <Button
          onClick={downloadCSV}
          variant="outline"
          className="border-primary/30 hover:border-primary hover:bg-primary/10"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-lg border border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-secondary/50">
              <TableHead className="text-foreground font-semibold">
                <button
                  onClick={() => toggleSort("title")}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  Title
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                <button
                  onClick={() => toggleSort("risk")}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  Risk
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </TableHead>
              <TableHead className="text-foreground font-semibold">Snippet</TableHead>
              <TableHead className="text-foreground font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedThreats.map((threat, index) => (
              <TableRow
                key={index}
                className="border-white/10 hover:bg-secondary/30 transition-colors animate-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell className="font-medium max-w-md">
                  <div className="truncate" title={threat.title}>
                    {threat.title}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRiskColor(threat.risk)}>{threat.risk}</Badge>
                </TableCell>
                <TableCell className="max-w-lg">
                  <div className="truncate text-muted-foreground" title={threat.snippet}>
                    {threat.snippet}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <a href={threat.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ThreatTable;
