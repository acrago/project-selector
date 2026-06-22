import type { Model } from "../types";
import type { Workload } from "../hooks/usePerformanceFilters";

export interface LatencyData {
  TTFT: { Mean: number; P90: number; P95: number; P99: number };
  ITL: { Mean: number; P90: number; P95: number; P99: number };
  E2E: { Mean: number; P90: number; P95: number; P99: number };
  TPS: { Mean: number; P90: number; P95: number; P99: number };
}

export interface BenchmarkData {
  hardware: string;
  hardwareCount: number; // Number of GPUs (e.g., 2 for "H100 x 2")
  replicas: number;
  rpsPerReplica: number;
  totalRps: number;
  latency: number; // Legacy field for current filter's latency
  latencyData: LatencyData; // All latency combinations
  workload: Workload; // Workload type for this benchmark
  scenarioId: string;
  configId: string;
  targetInputTokens: number;
  targetOutputTokens: number;
  guidellmVersion: string;
  rhaiisVersion: string;
  vllmVersion: string;
}

// Helper to parse hardware count from hardware string (e.g., "H100 x 2" -> 2)
const parseHardwareCount = (hardware: string): number => {
  const match = hardware.match(/x\s*(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
};

// Generate varied latency data for all metric/percentile combinations
const generateLatencyData = (baseLatency: number, seed: number): LatencyData => {
  // Create variation factors for each metric type
  const ttftFactor = 0.3 + (seed % 20) / 100; // TTFT is typically fastest (30-50% of E2E)
  const itlFactor = 0.05 + (seed % 10) / 200; // ITL is very small per-token latency
  const e2eFactor = 1; // E2E is the base
  // TPS is tokens per second - higher is better, inversely related to latency
  const baseTps = Math.round(1000 / (baseLatency * itlFactor) + (seed % 50));

  // Create percentile multipliers (P99 > P95 > P90 > Mean)
  const meanMultiplier = 0.85;
  const p90Multiplier = 1.0;
  const p95Multiplier = 1.15;
  const p99Multiplier = 1.4;

  return {
    TTFT: {
      Mean: Math.round(baseLatency * ttftFactor * meanMultiplier),
      P90: Math.round(baseLatency * ttftFactor * p90Multiplier),
      P95: Math.round(baseLatency * ttftFactor * p95Multiplier),
      P99: Math.round(baseLatency * ttftFactor * p99Multiplier),
    },
    ITL: {
      Mean: Math.round(baseLatency * itlFactor * meanMultiplier),
      P90: Math.round(baseLatency * itlFactor * p90Multiplier),
      P95: Math.round(baseLatency * itlFactor * p95Multiplier),
      P99: Math.round(baseLatency * itlFactor * p99Multiplier),
    },
    E2E: {
      Mean: Math.round(baseLatency * e2eFactor * meanMultiplier),
      P90: Math.round(baseLatency * e2eFactor * p90Multiplier),
      P95: Math.round(baseLatency * e2eFactor * p95Multiplier),
      P99: Math.round(baseLatency * e2eFactor * p99Multiplier),
    },
    TPS: {
      Mean: Math.round(baseTps * 1.1),  // Mean is typically higher for TPS
      P90: Math.round(baseTps * 1.0),
      P95: Math.round(baseTps * 0.9),   // Lower percentiles are worse for TPS
      P99: Math.round(baseTps * 0.75),
    },
  };
};

// Generate scenario and config IDs
const generateIds = (seed: number, idx: number) => ({
  scenarioId: `SCN-${String(seed * 100 + idx).padStart(5, "0")}`,
  configId: `CFG-${String((seed + idx) * 7).padStart(4, "0")}`,
});

// Generate model-specific benchmark data based on model characteristics
export const generateModelBenchmarks = (model: Model): BenchmarkData[] => {
  // Use model id to create deterministic but varied data
  const seed = model.id.charCodeAt(model.id.length - 1);
  const modelSize = parseInt(model.name.match(/\d+/)?.[0] || "10");
  
  // Different models have different hardware support based on their performance.hardware
  const supportedGpuTypes = model.performance?.hardware || ["H100"];
  
  const benchmarks: BenchmarkData[] = [];
  
  // Version strings based on seed for variety
  const guidellmVersions = ["0.2.0", "0.2.1", "0.3.0"];
  const rhaiisVersions = ["1.0.0", "1.1.0", "1.2.0"];
  const vllmVersions = ["0.6.1", "0.6.2", "0.6.3"];
  
  const getVersions = (idx: number) => ({
    guidellmVersion: guidellmVersions[(seed + idx) % guidellmVersions.length],
    rhaiisVersion: rhaiisVersions[(seed + idx) % rhaiisVersions.length],
    vllmVersion: vllmVersions[(seed + idx) % vllmVersions.length],
  });

  // Target tokens based on workload (will be used for display)
  const getTargetTokens = (workloadType: Workload = "chat") => {
    switch (workloadType) {
      case "chat":
        return { targetInputTokens: 512, targetOutputTokens: 256 };
      case "rag":
        return { targetInputTokens: 4096, targetOutputTokens: 512 };
      case "code_fixing":
        return { targetInputTokens: 1024, targetOutputTokens: 1024 };
      case "long_rag":
        return { targetInputTokens: 10240, targetOutputTokens: 1536 };
      default:
        return { targetInputTokens: 512, targetOutputTokens: 256 };
    }
  };

  const createBenchmark = (
    hardware: string,
    baseLatency: number,
    rpsPerReplica: number,
    idx: number,
    workload: Workload = "chat"
  ): BenchmarkData => {
    const latencyData = generateLatencyData(baseLatency, seed + idx);
    return {
      hardware,
      hardwareCount: parseHardwareCount(hardware),
      replicas: 1,
      rpsPerReplica,
      totalRps: rpsPerReplica,
      latency: latencyData.TTFT.P90, // Default to TTFT P90
      latencyData,
      workload,
      ...generateIds(seed, idx),
      ...getTargetTokens(workload),
      ...getVersions(idx),
    };
  };
  
  // Generate benchmarks with varied distribution per model and workload
  let benchmarkIdx = 0;
  
  // All workload types
  const allWorkloads: Workload[] = ["chat", "rag", "code_fixing", "long_rag"];
  
  // Determine which workloads this model has benchmarks for (with variation)
  // Use seed to create different distributions per model
  const getWorkloadAvailability = (workload: Workload): boolean => {
    const workloadSeed = seed + workload.charCodeAt(0) + workload.charCodeAt(workload.length - 1);
    // Different probability for each workload type
    switch (workload) {
      case "chat": return true; // All models have chat benchmarks
      case "rag": return workloadSeed % 10 < 8; // 80% of models
      case "code_fixing": return workloadSeed % 10 < 6; // 60% of models
      case "long_rag": return workloadSeed % 10 < 4; // 40% of models
    }
  };
  
  // Determine how many hardware configs to include for a workload (1-6 configs)
  const getWorkloadHardwareCount = (workload: Workload, maxConfigs: number): number => {
    const workloadSeed = seed * 3 + workload.charCodeAt(0);
    // Different models get different numbers of hardware configs per workload
    const baseCount = 2 + (workloadSeed % 5); // 2-6 configs
    return Math.min(baseCount, maxConfigs);
  };
  
  // For each workload, generate benchmarks on selected hardware configs
  const generateWorkloadBenchmarks = (
    workload: Workload, 
    hardwareConfigs: { hw: string; baseLatency: number }[]
  ) => {
    // Skip this workload if not available for this model
    if (!getWorkloadAvailability(workload)) {
      return;
    }
    
    // Workload-specific latency multipliers
    const workloadLatencyMultiplier: Record<Workload, number> = {
      chat: 1.0,
      rag: 1.3,
      code_fixing: 1.15,
      long_rag: 1.8,
    };
    
    // Determine how many configs to include for this workload
    const configCount = getWorkloadHardwareCount(workload, hardwareConfigs.length);
    
    // Select which configs to include (use seed for deterministic but varied selection)
    const workloadSeed = seed + workload.charCodeAt(0);
    const startIdx = workloadSeed % Math.max(1, hardwareConfigs.length - configCount + 1);
    const selectedConfigs = hardwareConfigs.slice(startIdx, startIdx + configCount);
    
    // Additionally, randomly skip some configs for more variation
    selectedConfigs.forEach((config, hwIdx) => {
      // Skip some configs based on combined seed (creates sparse distribution)
      const skipChance = (workloadSeed + hwIdx * 7) % 10;
      if (skipChance < 2) return; // ~20% chance to skip each config
      
      const adjustedLatency = Math.floor(config.baseLatency * workloadLatencyMultiplier[workload]);
      const rpsVariation = 1 + ((seed + hwIdx + workload.charCodeAt(0)) % 4);
      
      benchmarks.push(createBenchmark(
        config.hw, 
        adjustedLatency, 
        rpsVariation, 
        benchmarkIdx++, 
        workload
      ));
    });
  };
  
  // H100 configurations
  if (supportedGpuTypes.some(h => h.includes("H100") || h.includes("H200"))) {
    const h100Latency = Math.max(20, 60 - modelSize + (seed % 30));
    const h100Configs = [
      { hw: "H100 x 1", baseLatency: h100Latency },
      { hw: "H100 x 2", baseLatency: Math.floor(h100Latency * 0.7) },
      { hw: "H100 x 4", baseLatency: Math.floor(h100Latency * 0.5) },
      { hw: "H100 x 8", baseLatency: Math.floor(h100Latency * 0.35) },
    ];
    allWorkloads.forEach(workload => generateWorkloadBenchmarks(workload, h100Configs));
  }
  
  // A100 configurations
  if (supportedGpuTypes.some(h => h.includes("A100"))) {
    const a100Latency = Math.max(80, 200 - modelSize * 2 + (seed % 100));
    const a100Configs = [
      { hw: "A100 x 1", baseLatency: a100Latency },
      { hw: "A100 x 2", baseLatency: Math.floor(a100Latency * 0.75) },
      { hw: "A100 x 4", baseLatency: Math.floor(a100Latency * 0.55) },
    ];
    allWorkloads.forEach(workload => generateWorkloadBenchmarks(workload, a100Configs));
  }
  
  // L40S configurations
  if (supportedGpuTypes.some(h => h.includes("L4") || h.includes("L40"))) {
    const l40Latency = Math.max(200, 500 - modelSize * 5 + (seed % 200));
    const l40Configs = [
      { hw: "L40S x 2", baseLatency: l40Latency },
      { hw: "L40S x 4", baseLatency: Math.floor(l40Latency * 0.7) },
    ];
    allWorkloads.forEach(workload => generateWorkloadBenchmarks(workload, l40Configs));
  }
  
  // If no specific hardware, add default configs with variation
  if (benchmarks.length === 0) {
    const defaultLatency = Math.max(50, 150 - modelSize + (seed % 80));
    const defaultConfigs = [
      { hw: "H100 x 1", baseLatency: defaultLatency },
      { hw: "H100 x 2", baseLatency: Math.floor(defaultLatency * 0.7) },
      { hw: "H100 x 4", baseLatency: Math.floor(defaultLatency * 0.5) },
      { hw: "A100 x 2", baseLatency: Math.floor(defaultLatency * 1.1) },
    ];
    allWorkloads.forEach(workload => generateWorkloadBenchmarks(workload, defaultConfigs));
  }
  
  // Sort by latency ascending (fastest first)
  return benchmarks.sort((a, b) => a.latency - b.latency);
};

// Get unique workload types available in the benchmark data
export const getAvailableWorkloads = (benchmarks: BenchmarkData[]): Workload[] => {
  const workloads = new Set<Workload>();
  benchmarks.forEach(b => workloads.add(b.workload));
  // Return in a consistent order
  const order: Workload[] = ["chat", "rag", "code_fixing", "long_rag"];
  return order.filter(w => workloads.has(w));
};

// Get unique hardware configurations available in the benchmark data (optionally filtered by workload)
export const getAvailableHardware = (benchmarks: BenchmarkData[], workload?: Workload): string[] => {
  const filtered = workload 
    ? benchmarks.filter(b => b.workload === workload)
    : benchmarks;
  const hardware = new Set<string>();
  filtered.forEach(b => hardware.add(b.hardware));
  // Return sorted by GPU type then count
  return Array.from(hardware).sort((a, b) => {
    // Sort by GPU type (H100 > A100 > L40S) then by count
    const getGpuPriority = (hw: string) => {
      if (hw.includes('H100')) return 0;
      if (hw.includes('A100')) return 1;
      if (hw.includes('L40')) return 2;
      return 3;
    };
    const priorityDiff = getGpuPriority(a) - getGpuPriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    return a.localeCompare(b);
  });
};

// Apply filters to benchmark data
export const filterBenchmarks = (
  benchmarks: BenchmarkData[],
  options: {
    workload?: Workload;
    hardware?: string[];
    latencyValue?: number;
    rpsValue?: number;
    latencyMetric?: "TTFT" | "ITL" | "E2E" | "TPS";
    latencyPercentile?: "Mean" | "P90" | "P95" | "P99";
  }
): BenchmarkData[] => {
  const { 
    workload = "chat", 
    hardware = [], 
    latencyValue = 893, 
    rpsValue = 1,
    latencyMetric = "TTFT",
    latencyPercentile = "P90"
  } = options;
  
  // Filter by workload type first (ensure string comparison)
  let filtered = benchmarks.filter(row => String(row.workload) === String(workload));
  
  // Filter by hardware if any are selected
  filtered = hardware.length > 0 
    ? filtered.filter(row => hardware.includes(row.hardware))
    : filtered;
  
  // Get the specific latency value based on metric and percentile
  const getLatencyForFilter = (row: BenchmarkData): number => {
    return row.latencyData[latencyMetric][latencyPercentile];
  };
  
  // Filter by latency (workload-specific latency is already in the benchmark)
  // For TPS, higher is better, so filter >= threshold
  // For other metrics (TTFT, ITL, E2E), lower is better, so filter <= threshold
  filtered = filtered.filter(row => {
    const rowLatency = getLatencyForFilter(row);
    if (latencyMetric === "TPS") {
      return rowLatency >= latencyValue; // TPS: keep models with TPS >= threshold
    }
    return rowLatency <= latencyValue; // Latency: keep models with latency <= threshold
  });
  
  // Calculate replicas based on Max RPS: replicas = ceiling(Max RPS / RPS per replica)
  // Then filter by replicas <= rpsValue
  filtered = filtered.filter(row => row.replicas <= rpsValue);
  
  // Calculate derived values
  return filtered
    .map(row => {
      // Calculate replicas: ceiling(Max RPS / RPS per replica)
      const calculatedReplicas = Math.ceil(rpsValue / row.rpsPerReplica);
      // Total RPS = replicas * RPS per replica
      const calculatedTotalRps = calculatedReplicas * row.rpsPerReplica;
      
      // Get the current filter's latency value
      const currentLatency = getLatencyForFilter(row);
      
      return {
        ...row,
        replicas: calculatedReplicas,
        totalRps: calculatedTotalRps,
        latency: currentLatency,
      };
    })
    .sort((a, b) => {
      // For TPS, higher is better, so sort descending
      // For other metrics, lower is better, so sort ascending
      if (latencyMetric === "TPS") {
        return b.latency - a.latency; // Descending for TPS
      }
      return a.latency - b.latency; // Ascending for latency metrics
    });
};
