import { SetURLSearchParams } from "react-router-dom";

export type LatencyMetric = "TTFT" | "ITL" | "E2E" | "TPS";
export type LatencyPercentile = "Mean" | "P90" | "P95" | "P99";
export type Workload = "chat" | "rag" | "code_fixing" | "long_rag";

// Workload options with their display labels
export const WORKLOAD_OPTIONS: { value: Workload; label: string }[] = [
  { value: "chat", label: "Chatbot (512 input | 256 output)" },
  { value: "rag", label: "RAG (4096 input | 512 output)" },
  { value: "code_fixing", label: "Code fixing (1024 input | 1024 output)" },
  { value: "long_rag", label: "Long RAG (10240 input | 1536 output)" },
];

// Default values
export const DEFAULT_WORKLOAD: Workload = "chat";
export const DEFAULT_LATENCY_METRIC: LatencyMetric = "TTFT";
export const DEFAULT_LATENCY_PERCENTILE: LatencyPercentile = "P90";
export const DEFAULT_LATENCY_VALUE = 893;
export const DEFAULT_RPS_VALUE = 1;

export interface PerformanceFiltersState {
  workload: Workload;
  latencyMetric: LatencyMetric;
  latencyPercentile: LatencyPercentile;
  latencyValue: number;
  rpsValue: number;
  hardware: string[];
}

export interface PerformanceFiltersActions {
  setWorkload: (w: Workload) => void;
  setLatencyMetric: (m: LatencyMetric) => void;
  setLatencyPercentile: (p: LatencyPercentile) => void;
  setLatencyValue: (v: number) => void;
  setLatencyFilters: (metric: LatencyMetric, percentile: LatencyPercentile, value: number) => void;
  setRpsValue: (r: number) => void;
  setHardware: (h: string[]) => void;
  resetAll: () => void;
}

// Parse performance filter values from URLSearchParams
export function parsePerformanceFilters(searchParams: URLSearchParams): PerformanceFiltersState {
  return {
    workload: (searchParams.get("workload") as Workload) || DEFAULT_WORKLOAD,
    latencyMetric: (searchParams.get("latencyMetric") as LatencyMetric) || DEFAULT_LATENCY_METRIC,
    latencyPercentile: (searchParams.get("latencyPercentile") as LatencyPercentile) || DEFAULT_LATENCY_PERCENTILE,
    latencyValue: parseInt(searchParams.get("latencyValue") || String(DEFAULT_LATENCY_VALUE)),
    rpsValue: parseInt(searchParams.get("rpsValue") || String(DEFAULT_RPS_VALUE)),
    hardware: searchParams.get("hardware")?.split(",").filter(Boolean) || [],
  };
}

// Create performance filter actions that use the provided setSearchParams
export function createPerformanceFilterActions(
  setSearchParams: SetURLSearchParams
): PerformanceFiltersActions {
  const setWorkload = (w: Workload) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set("workload", w);
      return next;
    });
  };

  const setLatencyMetric = (m: LatencyMetric) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set("latencyMetric", m);
      return next;
    });
  };

  const setLatencyPercentile = (p: LatencyPercentile) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set("latencyPercentile", p);
      return next;
    });
  };

  const setLatencyValue = (v: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set("latencyValue", String(v));
      return next;
    });
  };

  const setLatencyFilters = (metric: LatencyMetric, percentile: LatencyPercentile, value: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set("latencyMetric", metric);
      next.set("latencyPercentile", percentile);
      next.set("latencyValue", String(value));
      return next;
    });
  };

  const setRpsValue = (r: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set("rpsValue", String(r));
      return next;
    });
  };

  const setHardware = (h: string[]) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (h.length > 0) {
        next.set("hardware", h.join(","));
      } else {
        next.delete("hardware");
      }
      return next;
    });
  };

  const resetAll = () => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete("workload");
      next.delete("latencyMetric");
      next.delete("latencyPercentile");
      next.delete("latencyValue");
      next.delete("rpsValue");
      next.delete("hardware");
      return next;
    });
  };

  return {
    setWorkload,
    setLatencyMetric,
    setLatencyPercentile,
    setLatencyValue,
    setLatencyFilters,
    setRpsValue,
    setHardware,
    resetAll,
  };
}

// Legacy hook for backward compatibility - uses useSearchParams internally
// Note: Prefer using parsePerformanceFilters and createPerformanceFilterActions
// directly in components to avoid multiple useSearchParams calls
import { useSearchParams } from "react-router-dom";

export function usePerformanceFilters(): PerformanceFiltersState & PerformanceFiltersActions {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const state = parsePerformanceFilters(searchParams);
  const actions = createPerformanceFilterActions(setSearchParams);

  return {
    ...state,
    ...actions,
  };
}
