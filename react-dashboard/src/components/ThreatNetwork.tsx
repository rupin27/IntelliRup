import { useEffect, useRef } from "react";
import { Network } from "lucide-react";
import { ThreatData } from "@/types/threat";

interface ThreatNetworkProps {
  threats: ThreatData[];
}

const ThreatNetwork = ({ threats }: ThreatNetworkProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = 400;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const riskColors = {
      High: "#FF4136",
      Medium: "#FF851B",
      Low: "#2ECC40",
    };

    // Create nodes
    const nodes = threats.slice(0, 5).map((threat, i) => ({
      x: (canvas.width / 6) * (i + 1),
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: 30,
      color: riskColors[threat.risk],
      label: threat.title.substring(0, 20) + "...",
      threat,
    }));

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[i + 1].x, nodes[i + 1].y);
        ctx.stroke();
      }

      // Update and draw nodes
      nodes.forEach((node) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x - node.radius < 0 || node.x + node.radius > canvas.width) {
          node.vx *= -1;
        }
        if (node.y - node.radius < 0 || node.y + node.radius > canvas.height) {
          node.vy *= -1;
        }

        // Keep in bounds
        node.x = Math.max(node.radius, Math.min(canvas.width - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(canvas.height - node.radius, node.y));

        // Draw node with glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = node.color;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw inner circle
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(10, 14, 39, 0.8)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius - 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw label
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const shortLabel = node.label.substring(0, 12);
        ctx.fillText(shortLabel, node.x, node.y);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [threats]);

  return (
    <div className="glass-card rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Network className="w-6 h-6 text-accent" />
        <h2 className="text-2xl font-bold">Threat Relationships</h2>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-white/10 bg-background/50">
        <canvas ref={canvasRef} className="w-full" />
        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
          Interactive network visualization - Nodes represent detected threats
        </div>
      </div>

      <div className="mt-4 flex gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-muted-foreground">High Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-muted-foreground">Medium Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-muted-foreground">Low Risk</span>
        </div>
      </div>
    </div>
  );
};

export default ThreatNetwork;
