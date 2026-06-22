import type { Column, LatencyMetricType, LatencyPercentileType } from "../types";

export const COLUMN_DEFINITIONS: Column[] = [
  // Hardware group
  {
    id: "replicas",
    label: "Replicas",
    group: "hardware",
    defaultVisible: true,
  },
  {
    id: "totalHardware",
    label: "Total hardware",
    group: "hardware",
    defaultVisible: false,
  },
  // Metadata group
  {
    id: "rpsPerReplica",
    label: "RPS per replica",
    group: "metadata",
    defaultVisible: true,
  },
  {
    id: "totalRps",
    label: "Total RPS",
    group: "metadata",
    defaultVisible: true,
  },
  {
    id: "scenarioId",
    label: "Scenario ID",
    group: "metadata",
    defaultVisible: false,
  },
  {
    id: "configId",
    label: "Config ID",
    group: "metadata",
    defaultVisible: false,
  },
  {
    id: "guidellmVersion",
    label: "GuideLLM version",
    group: "metadata",
    defaultVisible: true,
  },
  {
    id: "rhaiisVersion",
    label: "RHAIS version",
    group: "metadata",
    defaultVisible: true,
  },
  {
    id: "vllmVersion",
    label: "vLLM version",
    group: "metadata",
    defaultVisible: true,
  },
  // Latency group - TTFT
  {
    id: "latency_TTFT_Mean",
    label: "TTFT latency mean",
    group: "latency",
    defaultVisible: true,
    latencyMetric: "TTFT",
    latencyPercentile: "Mean",
  },
  {
    id: "latency_TTFT_P90",
    label: "TTFT latency P90",
    group: "latency",
    defaultVisible: true,
    latencyMetric: "TTFT",
    latencyPercentile: "P90",
  },
  {
    id: "latency_TTFT_P95",
    label: "TTFT latency P95",
    group: "latency",
    defaultVisible: false,
    latencyMetric: "TTFT",
    latencyPercentile: "P95",
  },
  {
    id: "latency_TTFT_P99",
    label: "TTFT latency P99",
    group: "latency",
    defaultVisible: false,
    latencyMetric: "TTFT",
    latencyPercentile: "P99",
  },
  // Latency group - E2E
  {
    id: "latency_E2E_Mean",
    label: "E2E latency mean",
    group: "latency",
    defaultVisible: false,
    latencyMetric: "E2E",
    latencyPercentile: "Mean",
  },
  {
    id: "latency_E2E_P90",
    label: "E2E latency P90",
    group: "latency",
    defaultVisible: false,
    latencyMetric: "E2E",
    latencyPercentile: "P90",
  },
  {
    id: "latency_E2E_P95",
    label: "E2E latency P95",
    group: "latency",
    defaultVisible: false,
    latencyMetric: "E2E",
    latencyPercentile: "P95",
  },
  {
    id: "latency_E2E_P99",
    label: "E2E latency P99",
    group: "latency",
    defaultVisible: false,
    latencyMetric: "E2E",
    latencyPercentile: "P99",
  },
  // Latency group - ITL
  {
    id: "latency_ITL_Mean",
    label: "ITL latency mean",
    group: "latency",
    defaultVisible: false,
    latencyMetric: "ITL",
    latencyPercentile: "Mean",
  },
  {
    id: "latency_ITL_P90",
    label: "ITL latency P90",
    group: "latency",
    defaultVisible: false,
    latencyMetric: "ITL",
    latencyPercentile: "P90",
  },
  {
    id: "latency_ITL_P95",
    label: "ITL latency P95",
    group: "latency",
    defaultVisible: false,
    latencyMetric: "ITL",
    latencyPercentile: "P95",
  },
  {
    id: "latency_ITL_P99",
    label: "ITL latency P99",
    group: "latency",
    defaultVisible: false,
    latencyMetric: "ITL",
    latencyPercentile: "P99",
  },
  // Throughput group - TPS (Tokens Per Second)
  {
    id: "latency_TPS_Mean",
    label: "TPS mean",
    group: "throughput",
    defaultVisible: false,
    latencyMetric: "TPS",
    latencyPercentile: "Mean",
  },
  {
    id: "latency_TPS_P90",
    label: "TPS P90",
    group: "throughput",
    defaultVisible: false,
    latencyMetric: "TPS",
    latencyPercentile: "P90",
  },
  {
    id: "latency_TPS_P95",
    label: "TPS P95",
    group: "throughput",
    defaultVisible: false,
    latencyMetric: "TPS",
    latencyPercentile: "P95",
  },
  {
    id: "latency_TPS_P99",
    label: "TPS P99",
    group: "throughput",
    defaultVisible: false,
    latencyMetric: "TPS",
    latencyPercentile: "P99",
  },
  // Request profile group
  {
    id: "targetInputTokens",
    label: "Target input tokens",
    group: "requestProfile",
    defaultVisible: false,
  },
  {
    id: "targetOutputTokens",
    label: "Target output tokens",
    group: "requestProfile",
    defaultVisible: false,
  },
];

// Get default visible columns based on current latency filter
export const getDefaultVisibleColumns = (
  latencyMetric: LatencyMetricType,
  latencyPercentile: LatencyPercentileType
): string[] => {
  // Hardware configuration is always visible (not in this list)
  const alwaysVisible = [
    "replicas",
    "rpsPerReplica",
    "totalRps",
    "guidellmVersion",
    "rhaiisVersion",
    "vllmVersion",
  ];

  // Only the latency column matching the current filter is visible by default
  // Must match the format used in generateLatencyColumns: `latency_${metric}_${percentile}`
  const latencyColumnId = `latency_${latencyMetric}_${latencyPercentile}`;

  // The TPS (throughput) column matching the current percentile is also visible by default
  const throughputColumnId = `latency_TPS_${latencyPercentile}`;

  return [...alwaysVisible, latencyColumnId, throughputColumnId];
};

// Get column by ID
export const getColumnById = (id: string): Column | undefined => {
  return COLUMN_DEFINITIONS.find(col => col.id === id);
};

// Get columns by group
export const getColumnsByGroup = (group: Column["group"]): Column[] => {
  return COLUMN_DEFINITIONS.filter(col => col.group === group);
};


