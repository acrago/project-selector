import { useCallback, useEffect, useRef, useState } from "react";
import { COLUMN_DEFINITIONS, getDefaultVisibleColumns } from "../lib/columnConfig";
import type { LatencyMetricType, LatencyPercentileType } from "../types";

const STORAGE_KEY = "performanceTableColumnPreferences";
const MANUAL_LATENCY_STORAGE_KEY = "performanceTableManualLatencyColumns";
const MANUAL_THROUGHPUT_STORAGE_KEY = "performanceTableManualThroughputColumns";

// Custom hook to track mounted state
const useIsMounted = () => {
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
};

// Helper to check if a column is a latency column
const isLatencyColumn = (columnId: string): boolean => {
  const col = COLUMN_DEFINITIONS.find(c => c.id === columnId);
  return col?.group === 'latency';
};

// Helper to check if a column is a throughput column
const isThroughputColumn = (columnId: string): boolean => {
  const col = COLUMN_DEFINITIONS.find(c => c.id === columnId);
  return col?.group === 'throughput';
};

// Get the latency column ID for a given metric and percentile
// Must match the format in columnConfig.ts: `latency_${metric}_${percentile}`
const getLatencyColumnId = (metric: LatencyMetricType, percentile: LatencyPercentileType): string => {
  return `latency_${metric}_${percentile}`;
};

// Get the TPS (throughput) column ID for a given percentile
// Must match the format in columnConfig.ts: `latency_TPS_${percentile}`
const getThroughputColumnId = (percentile: LatencyPercentileType): string => {
  return `latency_TPS_${percentile}`;
};

export function useColumnPreferences(
  latencyMetric: LatencyMetricType,
  latencyPercentile: LatencyPercentileType
) {
  const isMounted = useIsMounted();
  
  // Track which latency columns the user has manually selected
  const [manualLatencyColumns, setManualLatencyColumns] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(MANUAL_LATENCY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  });

  // Track which throughput columns the user has manually selected
  const [manualThroughputColumns, setManualThroughputColumns] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(MANUAL_THROUGHPUT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  });

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    // Initialize from localStorage or defaults
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure the current filter's TPS column is included if not already present
          // This handles the case where localStorage was saved before TPS auto-visibility was added
          const throughputColId = `latency_TPS_${latencyPercentile}`;
          if (!parsed.includes(throughputColId)) {
            return [...parsed, throughputColId];
          }
          return parsed;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return getDefaultVisibleColumns(latencyMetric, latencyPercentile);
  });

  // Track the previous latency filter to detect changes
  const prevLatencyRef = useRef({ metric: latencyMetric, percentile: latencyPercentile });

  // Update visible columns when latency filter changes
  useEffect(() => {
    // Don't update if unmounted
    if (!isMounted.current) return;
    
    const prevMetric = prevLatencyRef.current.metric;
    const prevPercentile = prevLatencyRef.current.percentile;
    const prevLatencyColId = getLatencyColumnId(prevMetric, prevPercentile);
    const newLatencyColId = getLatencyColumnId(latencyMetric, latencyPercentile);
    const prevThroughputColId = getThroughputColumnId(prevPercentile);
    const newThroughputColId = getThroughputColumnId(latencyPercentile);

    // Only update if the latency filter actually changed
    if (prevMetric !== latencyMetric || prevPercentile !== latencyPercentile) {
      setVisibleColumns(prev => {
        // Remove the old auto-visible latency column (unless it was manually selected)
        let updated = prev.filter(colId => {
          if (colId === prevLatencyColId && !manualLatencyColumns.includes(colId)) {
            return false; // Remove old auto-visible latency column
          }
          // Remove the old auto-visible throughput column (unless it was manually selected)
          if (colId === prevThroughputColId && !manualThroughputColumns.includes(colId)) {
            return false; // Remove old auto-visible throughput column
          }
          return true;
        });

        // Add the new latency column if not already present
        if (!updated.includes(newLatencyColId)) {
          updated = [...updated, newLatencyColId];
        }

        // Add the new throughput column if not already present
        if (!updated.includes(newThroughputColId)) {
          updated = [...updated, newThroughputColId];
        }

        return updated;
      });

      // Update the ref
      prevLatencyRef.current = { metric: latencyMetric, percentile: latencyPercentile };
    }
  }, [latencyMetric, latencyPercentile, manualLatencyColumns, manualThroughputColumns, isMounted]);

  // Save to localStorage whenever visibleColumns changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleColumns));
    } catch {
      // Ignore storage errors
    }
  }, [visibleColumns]);

  // Save manual latency columns to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MANUAL_LATENCY_STORAGE_KEY, JSON.stringify(manualLatencyColumns));
    } catch {
      // Ignore storage errors
    }
  }, [manualLatencyColumns]);

  // Save manual throughput columns to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MANUAL_THROUGHPUT_STORAGE_KEY, JSON.stringify(manualThroughputColumns));
    } catch {
      // Ignore storage errors
    }
  }, [manualThroughputColumns]);

  const toggleColumn = useCallback((columnId: string) => {
    setVisibleColumns(prev => {
      const isCurrentlyVisible = prev.includes(columnId);
      
      // Track manual selections for latency columns
      if (isLatencyColumn(columnId)) {
        if (isCurrentlyVisible) {
          // User is hiding a latency column - remove from manual selections
          setManualLatencyColumns(manual => manual.filter(id => id !== columnId));
        } else {
          // User is showing a latency column - add to manual selections
          setManualLatencyColumns(manual => 
            manual.includes(columnId) ? manual : [...manual, columnId]
          );
        }
      }
      
      // Track manual selections for throughput columns
      if (isThroughputColumn(columnId)) {
        if (isCurrentlyVisible) {
          // User is hiding a throughput column - remove from manual selections
          setManualThroughputColumns(manual => manual.filter(id => id !== columnId));
        } else {
          // User is showing a throughput column - add to manual selections
          setManualThroughputColumns(manual => 
            manual.includes(columnId) ? manual : [...manual, columnId]
          );
        }
      }
      
      if (isCurrentlyVisible) {
        return prev.filter(id => id !== columnId);
      } else {
        return [...prev, columnId];
      }
    });
  }, []);

  const setVisibleColumnsList = useCallback((columns: string[]) => {
    setVisibleColumns(columns);
  }, []);

  const restoreDefaults = useCallback(() => {
    const defaults = getDefaultVisibleColumns(latencyMetric, latencyPercentile);
    setVisibleColumns(defaults);
    // Clear manual latency and throughput selections when restoring defaults
    setManualLatencyColumns([]);
    setManualThroughputColumns([]);
  }, [latencyMetric, latencyPercentile]);

  const isColumnVisible = useCallback((columnId: string) => {
    return visibleColumns.includes(columnId);
  }, [visibleColumns]);

  return {
    visibleColumns,
    toggleColumn,
    setVisibleColumns: setVisibleColumnsList,
    restoreDefaults,
    isColumnVisible,
  };
}

