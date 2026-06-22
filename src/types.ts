export type Category = "validated" | "redhat" | "other" | null;
export type Workload = "chat" | "rag";
export type LatencyMetricType = "TTFT" | "ITL" | "E2E" | "TPS";
export type LatencyPercentileType = "Mean" | "P90" | "P95" | "P99";
export type SortKey = "latency" | "updated" | string;
export type SortDirection = "asc" | "desc" | null;

export interface LatencyData {
  TTFT: { Mean: number; P90: number; P95: number; P99: number };
  ITL:  { Mean: number; P90: number; P95: number; P99: number };
  E2E:  { Mean: number; P90: number; P95: number; P99: number };
  TPS:  { Mean: number; P90: number; P95: number; P99: number };
}

export interface BenchmarkData {
  hardware: string;           // e.g., "H100 x 2"
  hardwareCount: number;      // Number of GPUs
  replicas: number;           // Calculated replicas
  rpsPerReplica: number;      // Throughput per replica
  totalRps: number;           // replicas × rpsPerReplica
  latency: number;            // Current filter's latency value
  latencyData: LatencyData;   // All metric/percentile combinations
  scenarioId: string;         // e.g., "SCN-00102"
  configId: string;           // e.g., "CFG-0042"
  targetInputTokens: number;  // Based on workload
  targetOutputTokens: number; // Based on workload
  guidellmVersion: string;
  rhaiisVersion: string;
  vllmVersion: string;
}

export interface ModelMetrics {
  accuracy: number;
  quality: number;
}

export interface ModelPerformance {
  workload: string;
  latency: string;
  rps: string;
  hardware: string[];
}

export interface Model {
  id: string;
  name: string;
  category: Category;
  provider: string;
  license: string;
  task: string | string[];
  language: string | string[];
  description: string;
  createdAt: string; // Original publish date (from createTimeSinceEpoch)
  updatedAt: string; // Last update date (from lastUpdateTimeSinceEpoch)
  metrics: ModelMetrics;
  performance?: ModelPerformance;
  modelCard?: string; // Markdown content for Hugging Face-style model card
  tensorType?: string; // e.g., "FP8", "FP16", "INT4", "INT8"
}

export interface Column {
  id: string;
  label: string;
  group: "hardware" | "metadata" | "latency" | "throughput" | "requestProfile";
  defaultVisible: boolean;
  latencyMetric?: LatencyMetricType;
  latencyPercentile?: LatencyPercentileType;
  tooltip?: string;
}

export interface FilterState {
  workload: Workload;
  latencyMetric: LatencyMetricType;
  latencyPercentile: LatencyPercentileType;
  latencyValue: number;
  rpsValue: number;
  hardware: string[];
}

