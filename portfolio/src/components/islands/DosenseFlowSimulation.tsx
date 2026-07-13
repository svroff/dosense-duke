/**
 * Interactive animated flow-simulation for the Dosense pipeline.
 * Nodes: CT Modality → C-STORE → dcm4chee → Shared Volume → Dosense → MongoDB → Cleanup → CSV Export
 * Controls: play/pause/step, speed slider, animated token, log console.
 */
import { useState, useEffect, useRef, useCallback } from "react";

// Pipeline node definitions
interface PipelineNode {
  id: string;
  label: string;
  sublabel: string;
  color: string;
}

const NODES: PipelineNode[] = [
  { id: "ct", label: "Modalitat CT", sublabel: "C-STORE push", color: "#7dcfff" },
  { id: "cstore", label: "C-STORE", sublabel: "Port 104 (DICOM)", color: "#7dcfff" },
  { id: "dcm4chee", label: "dcm4chee", sublabel: "Receptor DICOM", color: "#bb9af7" },
  { id: "volume", label: "Volum compartit", sublabel: "/data/dicom_storage", color: "#e0af68" },
  { id: "dosense", label: "Dosense", sublabel: "Anàlisi IQ + dosi", color: "#9ece6a" },
  { id: "mongodb", label: "MongoDB", sublabel: "Resultats (port 27017)", color: "#9ece6a" },
  { id: "cleanup", label: "Neteja", sublabel: "Eliminació DICOM", color: "#f7768e" },
  { id: "csv", label: "Exportació CSV", sublabel: "Manual → EuroSafe", color: "#bb9af7" },
];

// Log messages per node
const LOG_MESSAGES: Record<string, string> = {
  ct: "CT envia estudi via C-STORE multi-destí (paral·lel al PACS producció)",
  cstore: "Associació DICOM establerta al port 104 de la VM",
  dcm4chee: "dcm4chee escriu fitxers DICOM a /data/dicom_storage/2026/07/07/Study/Series",
  volume: "Fitxers DICOM escrits al bind-mount compartit entre contenidors",
  dosense: "Dosense detecta nous fitxers, inicia processament (~2 min/sèrie): dosi + IQ + d'",
  mongodb: "Resultats anonimitzats desats a col·leccions MongoDB (connexió 27017)",
  cleanup: "Script de neteja elimina DICOM processats del buffer d'entrada",
  csv: "CSV disponible per revisió i enviament manual a EuroSafe (email/Drive)",
};

interface LogEntry {
  time: string;
  node: string;
  message: string;
}

export default function DosenseFlowSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(-1);
  const [speed, setSpeed] = useState(1500); // ms per step
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString("ca-ES", { hour12: false });
  };

  const addLog = useCallback((nodeIndex: number) => {
    const node = NODES[nodeIndex];
    if (!node) return;
    const entry: LogEntry = {
      time: getTimestamp(),
      node: node.label,
      message: LOG_MESSAGES[node.id],
    };
    setLogs((prev) => [...prev.slice(-50), entry]); // Keep last 50 entries
  }, []);

  const step = useCallback(() => {
    setCurrentNodeIndex((prev) => {
      const next = prev >= NODES.length - 1 ? 0 : prev + 1;
      addLog(next);
      return next;
    });
  }, [addLog]);

  // Auto-play loop
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(step, speed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, step]);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const reset = () => {
    setIsPlaying(false);
    setCurrentNodeIndex(-1);
    setLogs([]);
  };

  return (
    <div className="my-8 rounded-xl border border-[#363b54] bg-[#24283b] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#363b54] flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-['Space_Grotesk'] font-semibold text-sm text-[#c0caf5]">
          Simulació del flux — Pipeline Dosense
        </h3>
        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 text-xs font-['JetBrains_Mono'] rounded border border-[#363b54] bg-[#1a1b26] text-[#7dcfff] hover:border-[#7dcfff] transition-colors"
            aria-label={isPlaying ? "Pausa" : "Reprodueix"}
          >
            {isPlaying ? "⏸ Pausa" : "▶ Play"}
          </button>
          <button
            onClick={step}
            disabled={isPlaying}
            className="px-3 py-1.5 text-xs font-['JetBrains_Mono'] rounded border border-[#363b54] bg-[#1a1b26] text-[#bb9af7] hover:border-[#bb9af7] transition-colors disabled:opacity-40"
            aria-label="Pas endavant"
          >
            ⏭ Pas
          </button>
          <button
            onClick={reset}
            className="px-3 py-1.5 text-xs font-['JetBrains_Mono'] rounded border border-[#363b54] bg-[#1a1b26] text-[#f7768e] hover:border-[#f7768e] transition-colors"
            aria-label="Reinicia"
          >
            ⟲ Reset
          </button>
          <div className="flex items-center gap-2 ml-2">
            <label htmlFor="speed-slider" className="text-xs text-[#565f89] font-['JetBrains_Mono']">
              Velocitat:
            </label>
            <input
              id="speed-slider"
              type="range"
              min="400"
              max="3000"
              step="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-20 accent-[#7dcfff]"
            />
            <span className="text-xs text-[#565f89] font-['JetBrains_Mono'] w-12">
              {(speed / 1000).toFixed(1)}s
            </span>
          </div>
        </div>
      </div>

      {/* Pipeline visualization */}
      <div className="px-4 py-6 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-[700px]">
          {NODES.map((node, i) => (
            <div key={node.id} className="flex items-center">
              {/* Node */}
              <div
                className={`relative flex flex-col items-center justify-center px-3 py-2 rounded-lg border-2 transition-all duration-300 min-w-[90px] ${
                  i === currentNodeIndex
                    ? "scale-110 shadow-lg shadow-current/20"
                    : "scale-100"
                }`}
                style={{
                  borderColor: i === currentNodeIndex ? node.color : "#363b54",
                  backgroundColor: i === currentNodeIndex ? `${node.color}15` : "transparent",
                }}
              >
                {/* Animated token/pulse */}
                {i === currentNodeIndex && (
                  <div
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping"
                    style={{ backgroundColor: node.color }}
                  />
                )}
                <span
                  className="text-xs font-['Space_Grotesk'] font-semibold text-center leading-tight"
                  style={{ color: i === currentNodeIndex ? node.color : "#c0caf5" }}
                >
                  {node.label}
                </span>
                <span className="text-[10px] text-[#565f89] text-center mt-0.5 font-['JetBrains_Mono']">
                  {node.sublabel}
                </span>
              </div>
              {/* Arrow between nodes */}
              {i < NODES.length - 1 && (
                <div className="flex items-center mx-1">
                  <div
                    className="w-4 h-0.5 transition-colors duration-300"
                    style={{
                      backgroundColor: i === currentNodeIndex ? node.color : "#363b54",
                    }}
                  />
                  <div
                    className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] transition-colors duration-300"
                    style={{
                      borderLeftColor: i === currentNodeIndex ? node.color : "#363b54",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Log console */}
      <div className="border-t border-[#363b54]">
        <div className="px-4 py-2 bg-[#1a1b26] border-b border-[#363b54] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#9ece6a] animate-pulse" />
          <span className="text-xs font-['JetBrains_Mono'] text-[#565f89]">Consola de log</span>
          <span className="ml-auto text-xs font-['JetBrains_Mono'] text-[#565f89]">
            {logs.length} entrades
          </span>
        </div>
        <div
          ref={logContainerRef}
          className="h-36 overflow-y-auto bg-[#1a1b26] px-4 py-2 font-['JetBrains_Mono'] text-xs"
        >
          {logs.length === 0 ? (
            <p className="text-[#565f89] italic">
              Prem ▶ Play o ⏭ Pas per iniciar la simulació...
            </p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-2 py-0.5">
                <span className="text-[#565f89] shrink-0">[{log.time}]</span>
                <span className="text-[#bb9af7] shrink-0">{log.node}</span>
                <span className="text-[#c0caf5]">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
