import React from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DataListToggle,
  Divider,
  Grid,
  GridItem,
  Label,
  LabelGroup,
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  MenuSearch,
  MenuSearchInput,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  PageSection,
  Panel,
  PanelMain,
  PanelMainBody,
  Popover,
  SearchInput,
  Slider,
  Tab,
  TabTitleText,
  Tabs,
  TextInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartColumn, faUndo } from '@fortawesome/free-solid-svg-icons';
import {
  InnerScrollContainer,
  Table,
  Tbody,
  Td,
  Th,
  ThProps,
  Thead,
  Tr,
} from '@patternfly/react-table';
import {
  ColumnsIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import { useDocumentTitle } from '../../utils/useDocumentTitle';
import { useFeatureFlags } from '../../utils/FeatureFlagsContext';
import { MODELS } from '../../../data/models';
import { DEFAULT_LATENCY_METRIC, DEFAULT_LATENCY_PERCENTILE, DEFAULT_LATENCY_VALUE, DEFAULT_RPS_VALUE, DEFAULT_WORKLOAD, WORKLOAD_OPTIONS, usePerformanceFilters } from '../../../hooks/usePerformanceFilters';
import { filterBenchmarks, generateModelBenchmarks, getAvailableHardware, getAvailableWorkloads } from '../../../lib/benchmarks';
import ReactECharts from 'echarts-for-react';
import { useColumnPreferences } from '../../../hooks/useColumnPreferences';
import { COLUMN_DEFINITIONS, getColumnById, getDefaultVisibleColumns } from '../../../lib/columnConfig';
import type { BenchmarkData } from '../../../lib/benchmarks';
import ValidatedModelIcon from '@app/assets/validated-model.svg';
import RedHatIcon from '@app/assets/the-hat.svg';
import GenericModelSvgIcon from '@app/assets/generic-model-icon.svg';

// Helper function to get display name (removes repo prefix like "RedHatAI/")
const getDisplayName = (name: string): string => {
  const slashIndex = name.lastIndexOf('/');
  return slashIndex !== -1 ? name.substring(slashIndex + 1) : name;
};

// Simple markdown to HTML converter
const markdownToHtml = (markdown: string): string => {
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Unordered lists
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    // Wrap consecutive list items in ul tags
    .replace(/(<li>.*<\/li>\n?)+/gim, '<ul>$&</ul>')
    // Ordered lists
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    // Line breaks
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br>');
  
  // Wrap in paragraph tags
  html = '<p>' + html + '</p>';
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/gim, '');
  html = html.replace(/<p>(<h[1-6]>)/gim, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/gim, '$1');
  html = html.replace(/<p>(<ul>)/gim, '$1');
  html = html.replace(/(<\/ul>)<\/p>/gim, '$1');
  html = html.replace(/<p>(<pre>)/gim, '$1');
  html = html.replace(/(<\/pre>)<\/p>/gim, '$1');
  
  return html;
};

type ModelDetailsProps = Record<string, never>;

// Workload labels for scenario display
const WORKLOAD_LABELS: Record<string, string> = {
  chat: "Chatbot (512 input / 256 output)",
  rag: "RAG (4096 input / 512 output)",
  code_fixing: "Code fixing (1024 input / 1024 output)",
  long_rag: "Long RAG (10240 input / 1536 output)",
};

const ModelDetails: React.FunctionComponent<ModelDetailsProps> = () => {
  const { modelSlug } = useParams<{ modelSlug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useFeatureFlags();
  
  // Find the model by ID (modelSlug is actually modelId from ModelCatalog navigation)
  const model = MODELS.find(m => m.id === modelSlug);
  
  // Performance filters from URL
  const {
    workload,
    latencyMetric,
    latencyPercentile,
    latencyValue,
    rpsValue,
    hardware,
    setWorkload,
    setLatencyFilters,
    setRpsValue,
    setHardware,
    resetAll: resetPerformanceFilters,
  } = usePerformanceFilters();
  
  // Check if model is validated (only validated models have Performance tab)
  const isValidated = model?.category === 'validated';
  
  
  // Memoized catalog URL that preserves filters but removes details-page-specific params
  const catalogUrl = React.useMemo(() => {
    const catalogParams = new URLSearchParams(searchParams);
    catalogParams.delete('tab'); // Remove details-page-specific param
    const paramString = catalogParams.toString();
    return `/ai-hub/models/catalog${paramString ? `?${paramString}` : ''}`;
  }, [searchParams]);
  
  // Active tab state - check URL param for tab selection
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = React.useState<string | number>(() => {
    if (tabParam === 'performance' && isValidated) {
      return 1;
    }
    return 0;
  });
  
  // Column preferences for performance table
  const {
    visibleColumns,
    setVisibleColumns,
  } = useColumnPreferences(latencyMetric, latencyPercentile);
  
  // Reorder visible columns so latency columns appear after Total RPS
  const orderedVisibleColumns = React.useMemo(() => {
    // Define the desired order: pre-latency columns, then latency, then throughput, then rest
    const preLatencyColumns = ['replicas', 'totalHardware', 'rpsPerReplica', 'totalRps'];
    const latencyColumns = visibleColumns.filter(colId => {
      const col = getColumnById(colId);
      return col?.group === 'latency';
    });
    const throughputColumns = visibleColumns.filter(colId => {
      const col = getColumnById(colId);
      return col?.group === 'throughput';
    });
    const otherColumns = visibleColumns.filter(colId => {
      const col = getColumnById(colId);
      return col?.group !== 'latency' && col?.group !== 'throughput' && !preLatencyColumns.includes(colId);
    });
    
    // Build ordered list: pre-latency columns (in order), then latency, then throughput, then other
    const ordered: string[] = [];
    
    // Add pre-latency columns in their defined order
    for (const colId of preLatencyColumns) {
      if (visibleColumns.includes(colId)) {
        ordered.push(colId);
      }
    }
    
    // Add latency columns
    ordered.push(...latencyColumns);
    
    // Add throughput columns (after latency)
    ordered.push(...throughputColumns);
    
    // Add remaining columns (metadata like versions, request profile, etc.)
    ordered.push(...otherColumns);
    
    return ordered;
  }, [visibleColumns]);
  
  // Customize columns modal state
  const [isCustomizeColumnsOpen, setIsCustomizeColumnsOpen] = React.useState(false);
  const [expandedGroups, setExpandedGroups] = React.useState<string[]>(['hardware', 'metadata', 'latency', 'throughput', 'requestProfile']);
  const [tempVisibleColumns, setTempVisibleColumns] = React.useState<string[]>([]);
  
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };
  
  // Open modal and initialize temp state
  const openCustomizeColumnsModal = () => {
    setTempVisibleColumns([...visibleColumns]);
    setIsCustomizeColumnsOpen(true);
  };
  
  // Toggle column in temp state
  const toggleTempColumn = (columnId: string) => {
    setTempVisibleColumns(prev => 
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };
  
  // Check if column is visible in temp state
  const isTempColumnVisible = (columnId: string) => tempVisibleColumns.includes(columnId);
  
  // Apply changes and close modal
  const handleUpdateColumns = () => {
    // Apply temp state to actual visible columns
    setVisibleColumns([...tempVisibleColumns]);
    setIsCustomizeColumnsOpen(false);
  };
  
  // Cancel and discard changes
  const handleCancelColumns = () => {
    setTempVisibleColumns([]);
    setIsCustomizeColumnsOpen(false);
  };
  
  // Restore defaults in temp state
  const handleRestoreDefaults = () => {
    const defaults = getDefaultVisibleColumns(latencyMetric, latencyPercentile);
    setTempVisibleColumns(defaults);
  };

  // Table sort state - default to sorting by the current latency column
  const [activeSortIndex, setActiveSortIndex] = React.useState<number | null>(() => {
    // Try to compute initial sort index
    const latencyColId = `latency_${latencyMetric}_${latencyPercentile}`;
    const colIndex = orderedVisibleColumns.findIndex(colId => colId === latencyColId);
    return colIndex !== -1 ? colIndex + 1 : null;
  });
  const [activeSortDirection, setActiveSortDirection] = React.useState<'asc' | 'desc' | null>(() => {
    // Set initial direction based on metric type
    return latencyMetric === 'TPS' ? 'desc' : 'asc';
  });

  // Update sort when latency filter changes or when orderedVisibleColumns updates
  React.useLayoutEffect(() => {
    // Build the latency column ID from current filter (must match format in columnConfig.ts)
    const latencyColId = `latency_${latencyMetric}_${latencyPercentile}`;
    
    // Find the index of this column in orderedVisibleColumns
    const colIndex = orderedVisibleColumns.findIndex(colId => colId === latencyColId);
    
    if (colIndex !== -1) {
      // Column index is offset by 1 because Hardware is column 0
      setActiveSortIndex(colIndex + 1);
      // For TPS, higher is better, so sort descending (highest first)
      // For latency metrics, lower is better, so sort ascending (lowest first)
      setActiveSortDirection(latencyMetric === 'TPS' ? 'desc' : 'asc');
    }
  }, [latencyMetric, latencyPercentile, orderedVisibleColumns]);

  // Table overflow detection for conditional sticky column
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const [hasTableOverflow, setHasTableOverflow] = React.useState(false);

  // Workload dropdown state
  const [isWorkloadOpen, setIsWorkloadOpen] = React.useState(false);
  const workloadMenuRef = React.useRef<HTMLDivElement>(null);
  
  // Hardware dropdown state (hardware values come from benchmark data)
  const [isHardwareOpen, setIsHardwareOpen] = React.useState(false);
  const [hardwareSearchValue, setHardwareSearchValue] = React.useState('');
  const hardwareMenuRef = React.useRef<HTMLDivElement>(null);
  
  // Close hardware menu on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hardwareMenuRef.current && !hardwareMenuRef.current.contains(event.target as Node)) {
        setIsHardwareOpen(false);
      }
    };
    if (isHardwareOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isHardwareOpen]);
  
  // Latency and RPS panel dropdown state
  const [isLatencyOpen, setIsLatencyOpen] = React.useState(false);
  const [isRpsOpen, setIsRpsOpen] = React.useState(false);
  const latencyPanelRef = React.useRef<HTMLDivElement>(null);
  const rpsPanelRef = React.useRef<HTMLDivElement>(null);
  
  // Local state for latency panel (pending values before Apply)
  const [pendingLatencyMetric, setPendingLatencyMetric] = React.useState(latencyMetric);
  const [pendingLatencyPercentile, setPendingLatencyPercentile] = React.useState(latencyPercentile);
  const [pendingLatencyValue, setPendingLatencyValue] = React.useState(latencyValue);
  // Store initial values when panel opens (for Reset)
  const latencyInitialValuesRef = React.useRef({ metric: latencyMetric, percentile: latencyPercentile, value: latencyValue });
  // Metric and Percentile dropdown state within latency panel
  const [isMetricSelectOpen, setIsMetricSelectOpen] = React.useState(false);
  const [isPercentileSelectOpen, setIsPercentileSelectOpen] = React.useState(false);
  const metricMenuRef = React.useRef<HTMLDivElement>(null);
  const percentileMenuRef = React.useRef<HTMLDivElement>(null);
  
  // Local state for RPS panel
  const [pendingRpsValue, setPendingRpsValue] = React.useState(rpsValue);
  const rpsInitialValueRef = React.useRef(rpsValue);
  
  // When opening latency panel, store initial values and sync pending state
  const handleOpenLatencyPanel = () => {
    if (!isLatencyOpen) {
      latencyInitialValuesRef.current = { metric: latencyMetric, percentile: latencyPercentile, value: latencyValue };
      setPendingLatencyMetric(latencyMetric);
      setPendingLatencyPercentile(latencyPercentile);
      setPendingLatencyValue(latencyValue);
    }
    setIsLatencyOpen(!isLatencyOpen);
  };
  
  // When opening RPS panel, store initial value and sync pending state
  const handleOpenRpsPanel = () => {
    if (!isRpsOpen) {
      rpsInitialValueRef.current = rpsValue;
      setPendingRpsValue(rpsValue);
    }
    setIsRpsOpen(!isRpsOpen);
  };
  
  // Apply latency filters
  const handleApplyLatency = () => {
    setLatencyFilters(pendingLatencyMetric, pendingLatencyPercentile, pendingLatencyValue);
    setIsLatencyOpen(false);
  };
  
  // Reset latency to values when panel was opened
  const handleResetLatency = () => {
    setPendingLatencyMetric(latencyInitialValuesRef.current.metric);
    setPendingLatencyPercentile(latencyInitialValuesRef.current.percentile);
    setPendingLatencyValue(latencyInitialValuesRef.current.value);
  };
  
  // Apply RPS filter
  const handleApplyRps = () => {
    setRpsValue(pendingRpsValue);
    setIsRpsOpen(false);
  };
  
  // Reset RPS to value when panel was opened
  const handleResetRps = () => {
    setPendingRpsValue(rpsInitialValueRef.current);
  };
  
  // Close panels when clicking outside (discard pending changes)
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (latencyPanelRef.current && !latencyPanelRef.current.contains(event.target as Node)) {
        setIsLatencyOpen(false);
      }
      if (rpsPanelRef.current && !rpsPanelRef.current.contains(event.target as Node)) {
        setIsRpsOpen(false);
      }
      if (workloadMenuRef.current && !workloadMenuRef.current.contains(event.target as Node)) {
        setIsWorkloadOpen(false);
      }
      // Close metric/percentile menus when clicking outside their container
      if (metricMenuRef.current && !metricMenuRef.current.contains(event.target as Node)) {
        setIsMetricSelectOpen(false);
      }
      if (percentileMenuRef.current && !percentileMenuRef.current.contains(event.target as Node)) {
        setIsPercentileSelectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useDocumentTitle(model ? `${getDisplayName(model.name)} - Model Details` : 'Model Details');

  // Generate all benchmarks for the model (unfiltered) to determine available workloads
  const allBenchmarks = React.useMemo(() => {
    if (!model || !isValidated) return [];
    return generateModelBenchmarks(model);
  }, [model, isValidated]);

  // Get available workload types from the benchmark data
  const availableWorkloads = React.useMemo(() => {
    return getAvailableWorkloads(allBenchmarks);
  }, [allBenchmarks]);

  // Filter workload options to only show those with benchmark data
  const filteredWorkloadOptions = React.useMemo(() => {
    return WORKLOAD_OPTIONS.filter(opt => availableWorkloads.includes(opt.value));
  }, [availableWorkloads]);

  // Get available hardware options for the selected workload
  const hardwareOptions = React.useMemo(() => {
    return getAvailableHardware(allBenchmarks, workload);
  }, [allBenchmarks, workload]);

  // Filter hardware options based on search value
  const filteredHardwareOptions = React.useMemo(() => {
    if (!hardwareOptions) return [];
    return hardwareOptions.filter(hw => 
      hw.toLowerCase().includes(hardwareSearchValue.toLowerCase())
    );
  }, [hardwareOptions, hardwareSearchValue]);

  // Auto-select a valid workload if current one isn't available
  React.useEffect(() => {
    if (availableWorkloads.length > 0 && !availableWorkloads.includes(workload)) {
      setWorkload(availableWorkloads[0]);
    }
  }, [availableWorkloads, workload, setWorkload]);

  // Clear invalid hardware selections when workload changes
  React.useEffect(() => {
    if (hardware.length > 0 && hardwareOptions.length > 0) {
      const validHardware = hardware.filter(h => hardwareOptions.includes(h));
      if (validHardware.length !== hardware.length) {
        setHardware(validHardware);
      }
    }
  }, [hardware, hardwareOptions, setHardware]);

  // Generate filtered benchmarks for display
  const benchmarks = React.useMemo(() => {
    if (!model || !isValidated) return [];
    return filterBenchmarks(allBenchmarks, {
      workload,
      hardware,
      latencyValue,
      rpsValue,
      latencyMetric,
      latencyPercentile,
    });
  }, [model, isValidated, allBenchmarks, workload, hardware, latencyValue, rpsValue, latencyMetric, latencyPercentile]);

  // Get sortable value for a benchmark based on column
  const getSortableValue = React.useCallback((benchmark: BenchmarkData, columnIndex: number): string | number => {
    // Column 0 is always hardware configuration
    if (columnIndex === 0) {
      return benchmark.hardware;
    }
    
    // Get the column ID from ordered visible columns (offset by 1 for hardware column)
    const colId = orderedVisibleColumns[columnIndex - 1];
    if (!colId) return '';
    
    const col = getColumnById(colId);
    if (!col) return '';
    
    // Handle latency columns
    if (col.group === 'latency' && col.latencyMetric && col.latencyPercentile) {
      return benchmark.latencyData[col.latencyMetric][col.latencyPercentile];
    }
    
    // Handle throughput columns (TPS)
    if (col.group === 'throughput' && col.latencyMetric && col.latencyPercentile) {
      return benchmark.latencyData[col.latencyMetric][col.latencyPercentile];
    }
    
    // Handle metadata columns
    if (col.group === 'metadata') {
      const rawValue = benchmark[col.id as keyof BenchmarkData];
      if (typeof rawValue === 'object' && rawValue !== null && 'TTFT' in rawValue) {
        return '';
      }
      return typeof rawValue === 'number' ? rawValue : String(rawValue);
    }
    
    // Handle hardware columns
    if (col.group === 'hardware') {
      if (col.id === 'replicas') return benchmark.replicas;
      if (col.id === 'totalHardware') return benchmark.hardwareCount * benchmark.replicas;
    }
    
    // Handle request profile columns
    if (col.group === 'requestProfile') {
      if (col.id === 'targetInputTokens') return benchmark.targetInputTokens;
      if (col.id === 'targetOutputTokens') return benchmark.targetOutputTokens;
    }
    
    return '';
  }, [orderedVisibleColumns]);

  // Sort benchmarks based on active sort
  const sortedBenchmarks = React.useMemo(() => {
    if (activeSortIndex === null || activeSortDirection === null) {
      return benchmarks;
    }
    
    return [...benchmarks].sort((a, b) => {
      const aValue = getSortableValue(a, activeSortIndex);
      const bValue = getSortableValue(b, activeSortIndex);
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        // Numeric sort
        return activeSortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        // String sort
        const aStr = String(aValue);
        const bStr = String(bValue);
        return activeSortDirection === 'asc' 
          ? aStr.localeCompare(bStr) 
          : bStr.localeCompare(aStr);
      }
    });
  }, [benchmarks, activeSortIndex, activeSortDirection, getSortableValue]);

  // Detect table overflow to conditionally make first column sticky
  React.useEffect(() => {
    const checkOverflow = () => {
      if (tableContainerRef.current) {
        const hasOverflow = tableContainerRef.current.scrollWidth > tableContainerRef.current.clientWidth;
        setHasTableOverflow(hasOverflow);
      }
    };

    // Initial check
    checkOverflow();

    // Observe resize changes
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (tableContainerRef.current) {
      resizeObserver.observe(tableContainerRef.current);
    }

    // Also check on window resize
    window.addEventListener('resize', checkOverflow);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', checkOverflow);
    };
  }, [visibleColumns, sortedBenchmarks]); // Re-check when columns or data changes

  // Get sort params for a column
  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex as number,
      direction: activeSortDirection as 'asc' | 'desc',
      // For TPS, default to descending (highest first); for latency, default to ascending (lowest first)
      defaultDirection: latencyMetric === 'TPS' ? 'desc' : 'asc'
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex
  });

  // Find related compression models (same base model, different quantization levels)
  const compressionModels = React.useMemo(() => {
    if (!model || !isValidated) return [];
    
    // Helper to extract base model name by removing quantization suffixes
    // Handles patterns like: -FP8, -FP8-dynamic, .w4a16, -quantized.w4a16, etc.
    const getBaseName = (name: string): string => {
      return name
        .replace(/[-.](?:FP8|FP16|INT4|INT8)(?:-dynamic)?$/i, '') // Remove -FP8, -FP8-dynamic, etc.
        .replace(/-quantized\.w\d+a\d+$/i, '')  // Remove -quantized.w4a16
        .replace(/\.w\d+a\d+$/i, '');           // Remove .w4a16
    };
    
    const currentBaseName = getBaseName(model.name);
    
    // Find other validated models with the same base name but different tensorType
    const related = MODELS.filter(m => {
      if (m.id === model.id || m.category !== 'validated') {
        return false;
      }
      
      const otherBaseName = getBaseName(m.name);
      
      // Check if base names match and tensor types differ
      return currentBaseName === otherBaseName && m.tensorType !== model.tensorType;
    });
    
    return related.slice(0, 3); // Limit to 3 related models
  }, [model, isValidated]);

  // Get all compression models including current model for the inference metrics chart
  const allCompressionModels = React.useMemo(() => {
    if (!model || !isValidated) return [];
    return [model, ...compressionModels];
  }, [model, isValidated, compressionModels]);

  // State for inference metrics chart
  const [selectedMetricTab, setSelectedMetricTab] = React.useState<'E2E' | 'ITL' | 'TTFT' | 'TPS'>('E2E');
  const [selectedChartHardware, setSelectedChartHardware] = React.useState<string>('');
  const [isChartHardwareOpen, setIsChartHardwareOpen] = React.useState(false);
  const chartHardwareMenuRef = React.useRef<HTMLDivElement>(null);
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  const [, setChartWidth] = React.useState(800);

  // Sync chart hardware selection with table hardware filter
  React.useEffect(() => {
    if (hardware.length > 0 && !selectedChartHardware) {
      setSelectedChartHardware(hardware[0]);
    } else if (hardware.length === 0 && selectedChartHardware) {
      // If hardware filter is cleared, try to keep current selection or use first available
      const availableHardware = getAvailableHardware(allBenchmarks, workload);
      if (availableHardware.length > 0) {
        setSelectedChartHardware(availableHardware[0]);
      } else {
        setSelectedChartHardware('');
      }
    }
  }, [hardware, allBenchmarks, workload, selectedChartHardware]);

  // Initialize chart hardware selection when hardware options become available
  React.useEffect(() => {
    if (!selectedChartHardware && hardwareOptions.length > 0) {
      // Prefer the first selected hardware from table, or first available
      setSelectedChartHardware(hardware.length > 0 ? hardware[0] : hardwareOptions[0]);
    }
  }, [hardwareOptions, hardware, selectedChartHardware]);

  // Close chart hardware menu on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chartHardwareMenuRef.current && !chartHardwareMenuRef.current.contains(event.target as Node)) {
        setIsChartHardwareOpen(false);
      }
    };
    if (isChartHardwareOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChartHardwareOpen]);

  // Calculate chart width based on container
  React.useEffect(() => {
    // Only run if we have compression models (section will be visible)
    if (!isValidated || allCompressionModels.length < 2) return;

    const updateChartWidth = () => {
      if (chartContainerRef.current) {
        const containerWidth = chartContainerRef.current.offsetWidth || chartContainerRef.current.clientWidth;
        if (containerWidth > 0) {
          const newWidth = Math.max(600, containerWidth); // Min 600px, use full container width
          setChartWidth(newWidth);
        }
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(() => {
      updateChartWidth();
      // Also try after delays as fallback
      setTimeout(updateChartWidth, 100);
      setTimeout(updateChartWidth, 300);
    });

    // Use ResizeObserver for better performance
    let resizeObserver: ResizeObserver | null = null;
    if (chartContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateChartWidth();
      });
      resizeObserver.observe(chartContainerRef.current);
    }

    // Also listen to window resize as fallback
    window.addEventListener('resize', updateChartWidth);
    
    return () => {
      cancelAnimationFrame(rafId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener('resize', updateChartWidth);
    };
  }, [isValidated, allCompressionModels.length, selectedChartHardware]); // Recalculate when section visibility changes

  // Generate chart data for inference metrics across compressions
  const inferenceMetricsChartData = React.useMemo(() => {
    if (!model || !isValidated || allCompressionModels.length < 2 || !selectedChartHardware) {
      return [];
    }

    // Color palette for different compression levels
    // First color (blue) is reserved for current model
    const colors = [
      '#0066cc', // Blue for current model
      '#3e8635', // Green
      '#2c9eaf', // Teal/Cyan
      '#f0ab00', // Orange/Gold
      '#795600', // Brown
      '#6a6e73', // Grey
    ];

    const chartData: Array<{ name: string; data: Array<{ x: number; y: number }>; color: string; isCurrent: boolean }> = [];

    // Sort models to ensure current model is first
    const sortedModels = [...allCompressionModels].sort((a, b) => {
      if (a.id === model.id) return -1;
      if (b.id === model.id) return 1;
      return 0;
    });

    sortedModels.forEach((compModel, index) => {
      const isCurrent = compModel.id === model.id;
      
      // Generate benchmarks for this compression model
      const modelBenchmarks = generateModelBenchmarks(compModel);
      
      // Get all benchmarks for this hardware and workload (no filtering by latency/RPS)
      const hardwareBenchmarks = modelBenchmarks.filter(b => 
        b.hardware === selectedChartHardware && b.workload === workload
      );

      if (hardwareBenchmarks.length === 0) {
        return;
      }

      // Get base metric value from the first benchmark
      const baseBenchmark = hardwareBenchmarks[0];
      const baseMetricValue = baseBenchmark.latencyData[selectedMetricTab]['Mean'];
      // Create data points for RPS range 1-10
      // Simulate how metric changes with RPS (latency typically increases with RPS)
      const dataPoints: Array<{ x: number; y: number }> = [];
      
      for (let rps = 1; rps <= 10; rps++) {
        let metricValue: number;
        
        if (selectedMetricTab === 'TPS') {
          // Throughput: generally decreases slightly as RPS increases (more load)
          // Use a slight degradation factor
          const degradationFactor = 1 - (rps - 1) * 0.02; // 2% decrease per RPS
          metricValue = Math.max(baseMetricValue * degradationFactor, baseMetricValue * 0.8);
        } else {
          // Latency metrics: generally increase as RPS increases (more load)
          // Use a scaling factor based on RPS
          const scalingFactor = 1 + (rps - 1) * 0.08; // 8% increase per RPS
          metricValue = baseMetricValue * scalingFactor;
        }
        
        dataPoints.push({ 
          x: rps, 
          y: Math.round(metricValue) 
        });
      }

      if (dataPoints.length > 0) {
        const displayName = getDisplayName(compModel.name);
        const compressionLabel = compModel.tensorType ? `-${compModel.tensorType}` : '';
        // Use first color (blue) for current model, others get subsequent colors
        const colorIndex = isCurrent ? 0 : (index > 0 ? index : index + 1);
        chartData.push({
          name: `${displayName}${compressionLabel}`,
          data: dataPoints,
          color: colors[colorIndex % colors.length],
          isCurrent: isCurrent,
        });
      }
    });

    return chartData;
  }, [model, isValidated, allCompressionModels, selectedChartHardware, workload, selectedMetricTab]);

  // Check if we should show the inference metrics section
  const shouldShowInferenceMetrics = React.useMemo(() => {
    return isValidated && 
           allCompressionModels.length >= 2 && 
           inferenceMetricsChartData.length > 0;
  }, [isValidated, allCompressionModels.length, inferenceMetricsChartData.length]);

  if (!model) {
    return (
      <PageSection>
        <Title headingLevel="h1" size="2xl">Model Not Found</Title>
        <p>The requested model could not be found.</p>
        <Button variant="primary" onClick={() => navigate('/ai-hub/models/catalog')}>
          Back to Model Catalog
        </Button>
      </PageSection>
    );
  }



  return (
    <PageSection isFilled style={{ padding: 0, minHeight: '100vh' }}>
      {/* Breadcrumbs */}
      <PageSection style={{ paddingBottom: 0 }}>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link 
              to={catalogUrl}
              onClick={() => {
                // Set flag to indicate returning from details page
                sessionStorage.setItem("returnedFromDetails", "true");
                
                // Store current performance filters for catalog to restore
                const perfFilters = JSON.stringify({
                  performanceFiltersEnabled: searchParams.get("perfFilter") === "true",
                  workload,
                  latencyMetric,
                  latencyPercentile,
                  latencyValue,
                  rpsValue,
                  hardware,
                  modelName: getDisplayName(model.name)
                });
                sessionStorage.setItem("catalogPerfFilters", perfFilters);
              }}
            >
              Model catalog
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{getDisplayName(model.name)}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>

      {/* Header */}
      <PageSection style={{ paddingTop: '1rem', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            {/* Icon */}
            <div 
              style={{ 
                width: '56px', 
                height: '56px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}
              dangerouslySetInnerHTML={{ __html: model.category === 'validated' ? ValidatedModelIcon : (model.provider === 'Red Hat' ? RedHatIcon : GenericModelSvgIcon) }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <Title headingLevel="h1" size="2xl" style={{ margin: 0 }}>
                  {getDisplayName(model.name)}
                </Title>
                {model.category === 'validated' ? (
                  <Popover
                    bodyContent={
                      <div style={{ padding: '0.5rem' }}>
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>
                          Validated models are benchmarked for performance and quality using leading open source evaluation datasets.
                        </p>
                      </div>
                    }
                  >
                    <Label variant="filled" color="purple" style={{ cursor: 'pointer' }} icon={<FontAwesomeIcon icon={faChartColumn} />}>
                      Validated
                    </Label>
                  </Popover>
                ) : model.category === 'redhat' ? (
                  <Popover
                    bodyContent={
                      <div style={{ padding: '0.5rem' }}>
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>
                          Red Hat models with full support and legal indemnification.
                        </p>
                      </div>
                    }
                  >
                    <Label variant="filled" color="grey" style={{ cursor: 'pointer' }}>
                      Red Hat
                    </Label>
                  </Popover>
                ) : null}
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                Provided by {model.provider}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="primary">Deploy model</Button>
            <Button variant="secondary">Register model</Button>
          </div>
        </div>
      </PageSection>

      {/* Tabs - only show tab bar for validated models (which have multiple tabs) */}
      {isValidated && (
        <PageSection type="tabs" aria-label="Model details tabs section" style={{ paddingBottom: 0 }}>
          <Tabs
            activeKey={activeTab}
            onSelect={(_, key) => setActiveTab(key)}
            aria-label="Model details tabs"
            usePageInsets
          >
            <Tab eventKey={0} title={<TabTitleText>Overview</TabTitleText>} />
            <Tab eventKey={1} title={<TabTitleText>Performance Insights</TabTitleText>} />
          </Tabs>
        </PageSection>
      )}

      {/* Tab Content */}
      {(activeTab === 0 || !isValidated) && (
        <PageSection style={{ paddingTop: '1.5rem' }}>
            <Grid hasGutter>
              {/* Left Column */}
              <GridItem span={8}>
                {/* Short Description Card */}
                <Card style={{ marginBottom: '1rem' }}>
                  <CardHeader>
                    <Title headingLevel="h3" size="md">Description</Title>
                  </CardHeader>
                  <CardBody>
                    <p style={{ margin: 0, color: '#6A6E73' }}>{model.description}</p>
                  </CardBody>
                </Card>

                {/* Model Card (Hugging Face style markdown) */}
                <Card>
                  <CardHeader>
                    <Title headingLevel="h3" size="md">Model Card</Title>
                  </CardHeader>
                  <CardBody>
                    {model.modelCard ? (
                      <div 
                        style={{ 
                          maxHeight: '600px', 
                          overflowY: 'auto',
                          fontSize: '0.875rem',
                          lineHeight: '1.6',
                          padding: '1rem',
                          backgroundColor: '#fafafa',
                          border: '1px solid #d2d2d2',
                          borderRadius: '4px'
                        }}
                        dangerouslySetInnerHTML={{ __html: markdownToHtml(model.modelCard) }}
                      />
                    ) : (
                      <div style={{ color: '#6A6E73', fontStyle: 'italic' }}>
                        Model card not available
                      </div>
                    )}
                  </CardBody>
                </Card>
              </GridItem>

              {/* Right Column - Metadata */}
              <GridItem span={4}>
                <Card>
                  <CardHeader>
                    <Title headingLevel="h3" size="md">Metadata</Title>
                  </CardHeader>
                  <CardBody>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#6A6E73', marginBottom: '0.25rem' }}>Provider</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{model.provider}</div>
                      </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#6A6E73', marginBottom: '0.25rem' }}>License</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{model.license}</div>
                      </div>
                      {model.metrics && (
                        <>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#6A6E73', marginBottom: '0.25rem' }}>Accuracy</div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                              {model.metrics.accuracy > 0 ? `${model.metrics.accuracy}%` : 'N/A'}
                            </div>
                                </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#6A6E73', marginBottom: '0.25rem' }}>Quality</div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                              {model.metrics.quality > 0 ? `${model.metrics.quality}%` : 'N/A'}
                            </div>
                          </div>
                        </>
                      )}
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#6A6E73', marginBottom: '0.25rem' }}>Last Updated</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{model.updatedAt}</div>
                                    </div>
                                  </div>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
        </PageSection>
      )}
      
      {isValidated && activeTab === 1 && (
        <PageSection style={{ paddingTop: '1.5rem' }}>
              {/* Hardware Configuration Card - includes filters and benchmarks table */}
              <Card style={{ marginBottom: '1rem', overflow: 'visible' }}>
                <CardHeader>
                  <div>
                    <Title headingLevel="h3" size="md">Hardware configuration</Title>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#6A6E73', fontSize: '0.875rem' }}>
                      Compare the performance metrics of hardware configurations to determine the most suitable option for deployment.
                    </p>
                  </div>
                </CardHeader>
                <CardBody style={{ overflow: 'visible' }}>
                <Toolbar>
                  <ToolbarContent>
                    <ToolbarGroup>
                      {/* Workload Type */}
                      <ToolbarItem>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
                          <div ref={workloadMenuRef} style={{ position: 'relative' }}>
                            <MenuToggle
                              onClick={() => setIsWorkloadOpen(!isWorkloadOpen)}
                              isExpanded={isWorkloadOpen}
                              style={{ height: '56px' }}
                            >
                              <><span style={{ fontWeight: 500 }}>Scenario:</span> {WORKLOAD_LABELS[workload] || workload}</>
                          </MenuToggle>
                            {isWorkloadOpen && (
                              <Menu 
                                role="listbox" 
                                onSelect={(_, itemId) => { 
                                if (itemId && typeof itemId === 'string') {
                                  setWorkload(itemId as typeof workload); 
                                }
                                setIsWorkloadOpen(false); 
                              }}
                                selected={workload}
                                style={{ position: 'absolute', top: '100%', left: 0, zIndex: 9999, minWidth: '100%' }}
                              >
                                <MenuContent>
                                  <MenuList>
                                    {filteredWorkloadOptions.map((option) => (
                                      <MenuItem key={option.value} itemId={option.value}>
                                        {WORKLOAD_LABELS[option.value]}
                                      </MenuItem>
                                    ))}
                                  </MenuList>
                                </MenuContent>
                              </Menu>
                            )}
                          </div>
                          <Popover
                            bodyContent={<span>Select a predefined scenario used to measure and compare model performance.<br /><br />Each scenario uses fixed input and output token lengths. Scenario names approximate common use cases and do not describe model capabilities.</span>}
                          >
                            <Button variant="plain" aria-label="Workload help" style={{ padding: '0.25rem' }}>
                              <OutlinedQuestionCircleIcon />
                            </Button>
                        </Popover>
                          <Divider orientation={{ default: 'vertical' }} style={{ height: '56px', marginLeft: '0.25rem', marginRight: '0' }} />
                        </div>
                      </ToolbarItem>
                      
                      {/* Latency */}
                      <ToolbarItem>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
                          <div ref={latencyPanelRef} style={{ position: 'relative' }}>
                            <MenuToggle 
                              onClick={handleOpenLatencyPanel}
                              isExpanded={isLatencyOpen}
                              style={{ height: '56px' }}
                            >
                              <><span style={{ fontWeight: 500 }}>Latency:</span> {isLatencyOpen ? pendingLatencyMetric : latencyMetric} at {isLatencyOpen ? pendingLatencyPercentile : latencyPercentile} ≤ {isLatencyOpen ? pendingLatencyValue : latencyValue}ms</>
                                    </MenuToggle>
                            {isLatencyOpen && (
                              <Panel 
                                variant="raised" 
                                style={{ 
                                  position: 'absolute', 
                                  top: '100%', 
                                  left: 0, 
                                  zIndex: 9999,
                                  minWidth: '450px'
                                }}
                              >
                                <PanelMain>
                                  <PanelMainBody>
                                    {/* Row 1: Metric and Percentile dropdowns */}
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                                      <div ref={metricMenuRef} style={{ position: 'relative', flex: 1 }}>
                                        <MenuToggle 
                                          onClick={() => { setIsMetricSelectOpen(!isMetricSelectOpen); setIsPercentileSelectOpen(false); }}
                                          isExpanded={isMetricSelectOpen}
                                          style={{ width: '100%' }}
                                        >
                                          <span style={{ fontWeight: 500 }}>Metric:</span> {pendingLatencyMetric}
                                    </MenuToggle>
                                        {isMetricSelectOpen && (
                                          <Menu 
                                            role="listbox" 
                                            onSelect={(_, itemId) => { 
                                              const previousMetric = pendingLatencyMetric;
                                              setPendingLatencyMetric(itemId as any); 
                                              setIsMetricSelectOpen(false);
                                              // Reset slider when switching between TPS and other metrics
                                              // For TPS: higher is better, so start with low threshold (min)
                                              // For latency metrics: lower is better, so start with high threshold (max)
                                              if (itemId === 'TPS' && previousMetric !== 'TPS') {
                                                setPendingLatencyValue(20); // min value for TPS
                                              } else if (itemId !== 'TPS' && previousMetric === 'TPS') {
                                                setPendingLatencyValue(893); // max value for latency metrics
                                              }
                                            }}
                                            selected={pendingLatencyMetric}
                                            style={{ position: 'absolute', top: '100%', left: 0, zIndex: 9999, minWidth: '320px' }}
                                          >
                                            <MenuContent>
                                              <MenuList>
                                                <MenuItem itemId="TTFT" description="Time until the model starts responding. Best for interactive experiences.">
                                                  TTFT (time to first token)
                                                </MenuItem>
                                                <MenuItem itemId="E2E" description="Total time to generate the full response. Best for summarization, batch jobs, and code generation.">
                                                  E2E (end-to-end)
                                                </MenuItem>
                                                <MenuItem itemId="ITL" description="Time between tokens during generation. Important for smooth streaming and audio.">
                                                  ITL (inter-token latency)
                                                </MenuItem>
                                              </MenuList>
                                            </MenuContent>
                                          </Menu>
                                        )}
                                      </div>
                                      <div ref={percentileMenuRef} style={{ position: 'relative', flex: 1, marginLeft: '0.5rem' }}>
                                        <MenuToggle 
                                          onClick={() => { setIsPercentileSelectOpen(!isPercentileSelectOpen); setIsMetricSelectOpen(false); }}
                                          isExpanded={isPercentileSelectOpen}
                                          style={{ width: '100%' }}
                                        >
                                          <span style={{ fontWeight: 500 }}>Percentile:</span> {pendingLatencyPercentile}
                                        </MenuToggle>
                                        {isPercentileSelectOpen && (
                                          <Menu 
                                            role="listbox" 
                                            onSelect={(_, itemId) => { setPendingLatencyPercentile(itemId as any); setIsPercentileSelectOpen(false); }}
                                            selected={pendingLatencyPercentile}
                                            style={{ position: 'absolute', top: '100%', left: 0, zIndex: 9999, minWidth: '100%' }}
                                          >
                                            <MenuContent>
                                              <MenuList>
                                                <MenuItem itemId="Mean">Mean</MenuItem>
                                                <MenuItem itemId="P90">P90</MenuItem>
                                                <MenuItem itemId="P95">P95</MenuItem>
                                                <MenuItem itemId="P99">P99</MenuItem>
                                              </MenuList>
                                            </MenuContent>
                                          </Menu>
                                        )}
                              </div>
                                      <Popover bodyContent={<span>Select the latency measure used for benchmarking - percentile or mean.<br /><br /><b>P90, P95, P99:</b> The selected percentage of requests must meet the latency threshold.<br /><b>Mean:</b> The average latency across all requests.</span>}>
                                        <Button variant="plain" aria-label="Percentile help" style={{ padding: '0.25rem' }}>
                                          <OutlinedQuestionCircleIcon />
                                        </Button>
                                      </Popover>
                                    </div>
                                    {/* Row 2: Slider with input */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                <Slider
                                            value={pendingLatencyValue}
                                            onChange={(_, value) => setPendingLatencyValue(Math.round(value as number))}
                                  min={20}
                                  max={893}
                                            areCustomStepsContinuous
                                            customSteps={[{ value: 20, label: '20' }, { value: 893, label: '893' }]}
                                />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <TextInput
                                    type="number"
                                            value={pendingLatencyValue.toString()}
                                            onChange={(_, value) => {
                                              const numVal = parseInt(value) || 0;
                                              setPendingLatencyValue(Math.max(20, Math.min(893, numVal)));
                                            }}
                                            style={{ width: '80px' }}
                                          />
                                          <span style={{ padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '0.875rem' }}>{pendingLatencyMetric === 'TPS' ? 'tok/s' : 'ms'}</span>
                                </div>
                              </div>
                                    </div>
                                    {/* Row 3: Apply and Reset buttons */}
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                      <Button variant="primary" onClick={handleApplyLatency}>
                                  Apply
                                </Button>
                                      <Button variant="link" onClick={handleResetLatency}>
                                  Reset
                                </Button>
                              </div>
                                  </PanelMainBody>
                                </PanelMain>
                              </Panel>
                            )}
                            </div>
                          <Popover
                            bodyContent={<span>
                                  Filter performance benchmarks by measured latency.<br /><br />
                                  <ul style={{ margin: '0 0 0 1.25rem', padding: 0, listStyleType: 'disc' }}>
                                    <li><b>Metric:</b> Select the latency metric (TTFT, E2E, or ITL) to evaluate.</li>
                                    <li><b>Percentile:</b> Choose how strictly the model must meet the target. For example, P90 means 90% of requests must meet the selected threshold.</li>
                                    <li><b>Threshold:</b> Set the maximum latency in milliseconds. Models exceeding this value are excluded.</li>
                                  </ul>
                                </span>}
                          >
                            <Button variant="plain" aria-label="Latency help" style={{ padding: '0.25rem' }}>
                              <OutlinedQuestionCircleIcon />
                            </Button>
                        </Popover>
                        </div>
                      </ToolbarItem>
                      
                      {/* Max RPS */}
                      <ToolbarItem>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
                          <div ref={rpsPanelRef} style={{ position: 'relative' }}>
                            <MenuToggle 
                              onClick={handleOpenRpsPanel}
                              isExpanded={isRpsOpen}
                              style={{ height: '56px' }}
                            >
                              <span style={{ fontWeight: 500 }}>Max RPS:</span> {isRpsOpen ? pendingRpsValue : rpsValue}
                            </MenuToggle>
                            {isRpsOpen && (
                              <Panel 
                                variant="raised" 
                                style={{ 
                                  position: 'absolute', 
                                  top: '100%', 
                                  left: 0, 
                                  zIndex: 9999,
                                  minWidth: '350px'
                                }}
                              >
                                <PanelMain>
                                  <PanelMainBody>
                                    {/* Row 1: Slider with input */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                              <Slider
                                            value={pendingRpsValue}
                                            onChange={(_, value) => setPendingRpsValue(Math.round(value as number))}
                                min={1}
                                max={50}
                                            customSteps={[{ value: 1, label: '1' }, { value: 50, label: '50' }]}
                                            areCustomStepsContinuous
                              />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <TextInput
                                  type="number"
                                            value={pendingRpsValue.toString()}
                                            onChange={(_, value) => {
                                              const numVal = parseInt(value) || 1;
                                              setPendingRpsValue(Math.min(50, Math.max(1, numVal)));
                                            }}
                                            style={{ width: '80px' }}
                                />
                              </div>
                                      </div>
                                    </div>
                                    {/* Row 2: Apply and Reset buttons */}
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                      <Button variant="primary" onClick={handleApplyRps}>
                                  Apply
                                </Button>
                                      <Button variant="link" onClick={handleResetRps}>
                                  Reset
                                </Button>
                              </div>
                                  </PanelMainBody>
                                </PanelMain>
                              </Panel>
                            )}
                            </div>
                          <Popover
                            bodyContent="Set your target traffic load in requests per second (RPS). This value is used to calculate the optimal deployment size (number of replicas) for reliable performance."
                          >
                            <Button variant="plain" aria-label="RPS help" style={{ padding: '0.25rem' }}>
                              <OutlinedQuestionCircleIcon />
                            </Button>
                          </Popover>
                          <Divider orientation={{ default: 'vertical' }} style={{ height: '56px', marginLeft: '0.25rem', marginRight: '0' }} />
                        </div>
                      </ToolbarItem>
                      
                      {/* Hardware */}
                      <ToolbarItem>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
                          <div ref={hardwareMenuRef} style={{ position: 'relative' }}>
                            <MenuToggle
                              onClick={() => setIsHardwareOpen(!isHardwareOpen)}
                              isExpanded={isHardwareOpen}
                              style={{ height: '56px' }}
                            >
                              Hardware {hardware.length > 0 && <Badge isRead>{hardware.length}</Badge>}
                          </MenuToggle>
                            {isHardwareOpen && (
                              <Menu
                                onSelect={(_event, itemId) => {
                                  const hw = itemId as string;
                                  if (hardware.includes(hw)) {
                                    setHardware(hardware.filter(h => h !== hw));
                                  } else {
                                    setHardware([...hardware, hw]);
                                  }
                                }}
                                selected={hardware}
                                style={{ 
                                  position: 'absolute', 
                                  top: '100%', 
                                  left: 0, 
                                  zIndex: 9999,
                                  minWidth: '300px',
                                  boxShadow: 'var(--pf-t--global--box-shadow--md)',
                                  backgroundColor: 'var(--pf-t--global--background--color--primary--default)'
                                }}
                              >
                                <MenuSearch>
                                  <MenuSearchInput>
                                    <SearchInput
                                      placeholder="Search hardware"
                                      value={hardwareSearchValue}
                                      aria-label="Filter hardware options"
                                      onChange={(_event, value) => setHardwareSearchValue(value)}
                                      onClear={() => setHardwareSearchValue('')}
                                    />
                                  </MenuSearchInput>
                                </MenuSearch>
                                <Divider />
                                <MenuContent>
                                  <MenuList>
                                    {filteredHardwareOptions.length === 0 ? (
                                      <MenuItem isDisabled>No results found</MenuItem>
                                    ) : (
                                      filteredHardwareOptions.map((hw) => (
                                        <MenuItem 
                                          key={hw}
                                          itemId={hw}
                                          hasCheckbox
                                          isSelected={hardware.includes(hw)}
                                        >
                                          {hw}
                                        </MenuItem>
                                      ))
                                    )}
                                  </MenuList>
                                </MenuContent>
                              </Menu>
                            )}
                          </div>
                          <Popover
                            bodyContent="Select the desired hardware configuration used for benchmarking. The format of hardware is [GPU type] x [number of GPUs per replica]. Example, A100 x 1"
                          >
                            <Button variant="plain" aria-label="Hardware help" style={{ padding: '0.25rem' }}>
                              <OutlinedQuestionCircleIcon />
                            </Button>
                        </Popover>
                        </div>
                      </ToolbarItem>
                      
                      {/* Customize columns - only on details page */}
                      <ToolbarItem>
                        <Button variant="link" onClick={openCustomizeColumnsModal} icon={<ColumnsIcon />}>
                          Customize columns
                        </Button>
                      </ToolbarItem>
                    </ToolbarGroup>
                  </ToolbarContent>
                </Toolbar>

                {/* Filter Chips Bar - Performance filters only */}
                {(workload !== DEFAULT_WORKLOAD || 
                  latencyMetric !== DEFAULT_LATENCY_METRIC || 
                  latencyPercentile !== DEFAULT_LATENCY_PERCENTILE || 
                  latencyValue !== DEFAULT_LATENCY_VALUE || 
                  rpsValue !== DEFAULT_RPS_VALUE || 
                  hardware.length > 0) && (
                  <Toolbar style={{ '--pf-v6-c-toolbar--RowGap': '0' } as React.CSSProperties}>
                    <ToolbarContent>
                      <ToolbarGroup variant="filter-group" style={{ flexWrap: 'wrap', rowGap: '0.5rem' }}>
                        {/* Workload Chip */}
                        {workload !== DEFAULT_WORKLOAD && (
                          <ToolbarItem>
                            <LabelGroup>
                              <Label 
                                onClose={() => setWorkload(DEFAULT_WORKLOAD)}
                                closeBtn={
                                  <button
                                    type="button"
                                    aria-label="Reset workload filter"
                                    onClick={() => setWorkload(DEFAULT_WORKLOAD)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0', display: 'inline-flex', alignItems: 'center' }}
                                  >
                                    <FontAwesomeIcon icon={faUndo} style={{ fontSize: '0.625rem' }} />
                                  </button>
                                }
                              >
                                {`Scenario: ${WORKLOAD_LABELS[workload] || workload}`}
                              </Label>
                            </LabelGroup>
                          </ToolbarItem>
                        )}
                        {/* Latency Chips */}
                        {(latencyMetric !== DEFAULT_LATENCY_METRIC || latencyPercentile !== DEFAULT_LATENCY_PERCENTILE || latencyValue !== DEFAULT_LATENCY_VALUE) && (
                          <ToolbarItem>
                            <div className="pf-v6-c-label-group pf-m-category">
                              <div className="pf-v6-c-label-group__main">
                                <span className="pf-v6-c-label-group__label">Latency</span>
                                <ul className="pf-v6-c-label-group__list" role="list">
                                  <li className="pf-v6-c-label-group__list-item"><Label>Metric: {latencyMetric}</Label></li>
                                  <li className="pf-v6-c-label-group__list-item"><Label>Percentile: {latencyPercentile}</Label></li>
                                  <li className="pf-v6-c-label-group__list-item"><Label>{latencyMetric === 'TPS' ? `≥ ${latencyValue} tok/s` : `≤ ${latencyValue}ms`}</Label></li>
                                </ul>
                        </div>
                              <div className="pf-v6-c-label-group__close" style={{ marginLeft: '0.25rem', paddingLeft: 0, alignSelf: 'center' }}>
                                <button
                                  type="button"
                                  aria-label="Reset latency filters"
                                  onClick={() => {
                                    setLatencyFilters(DEFAULT_LATENCY_METRIC, DEFAULT_LATENCY_PERCENTILE, DEFAULT_LATENCY_VALUE);
                                  }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0', display: 'inline-flex', alignItems: 'center' }}
                                >
                                  <FontAwesomeIcon icon={faUndo} style={{ fontSize: '0.625rem' }} />
                                </button>
                              </div>
                            </div>
                          </ToolbarItem>
                        )}
                        {/* Max RPS Chip */}
                        {rpsValue !== DEFAULT_RPS_VALUE && (
                          <ToolbarItem>
                            <LabelGroup>
                              <Label 
                                onClose={() => setRpsValue(DEFAULT_RPS_VALUE)}
                                closeBtn={
                                  <button
                                    type="button"
                                    aria-label="Reset RPS filter"
                                    onClick={() => setRpsValue(DEFAULT_RPS_VALUE)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0', display: 'inline-flex', alignItems: 'center' }}
                                  >
                                    <FontAwesomeIcon icon={faUndo} style={{ fontSize: '0.625rem' }} />
                                  </button>
                                }
                              >
                                Max RPS: {rpsValue}
                              </Label>
                            </LabelGroup>
                          </ToolbarItem>
                        )}
                        {/* Hardware chips */}
                        {hardware.length > 0 && (
                          <ToolbarItem>
                            <LabelGroup categoryName="Hardware" isClosable onClick={() => setHardware([])}>
                              {hardware.map(hw => (
                                <Label key={hw} onClose={() => setHardware(hardware.filter(h => h !== hw))}>{hw}</Label>
                              ))}
                            </LabelGroup>
                          </ToolbarItem>
                        )}
                      </ToolbarGroup>
                    </ToolbarContent>
                    {/* Reset all filters button */}
                    <ToolbarContent style={{ paddingTop: '0.5rem' }}>
                      <ToolbarItem>
                        <Button variant="link" isInline onClick={resetPerformanceFilters}>
                          Reset all filters
                        </Button>
                      </ToolbarItem>
                    </ToolbarContent>
                  </Toolbar>
                )}
                        
              {/* Performance Table */}
              {benchmarks.length > 0 ? (
                    <InnerScrollContainer>
                      <div ref={tableContainerRef} style={{ width: '100%' }}>
                      <Table aria-label="Performance benchmarks table" variant="compact">
                        <Thead>
                          <Tr>
                            <Th 
                              sort={getSortParams(0)}
                              isStickyColumn={hasTableOverflow}
                              hasRightBorder={hasTableOverflow}
                              stickyMinWidth="200px"
                              modifier="nowrap"
                              tooltip={null}
                              info={{ popover: 'The hardware configuration used for benchmarking, including the GPU type and the number of GPUs per replica.' }}
                            >
                              Hardware
                            </Th>
                            {orderedVisibleColumns.map((colId, colIndex) => {
                              const col = getColumnById(colId);
                              if (!col) return null;
                              
                              // Define popovers for specific columns
                              const columnPopovers: Record<string, React.ReactNode> = {
                                'replicas': 'The number of replicas required to support the specified maximum requests per second (Max RPS).',
                                'totalHardware': 'The total number of GPUs across all replicas (hardware count × replicas).',
                                'totalRps': <span>The total traffic capacity, measured in requests per second, supported by the recommended number of replicas.<br /><br /><b>Note:</b> Because we cannot use fractional GPUs, requirements are rounded up (example, 1.2 becomes 2), which might result in a higher total RPS than your defined maximum.</span>,
                                'guidellmVersion': 'The GuideLLM profiler version used to execute benchmarks for this configuration.',
                                'rhaiisVersion': 'The Red Hat AI Inference Server (RHAIIS) version used to generate these performance results.',
                                'vllmVersion': 'The vLLM inference engine version used to generate these performance results.',
                              };
                              
                              // Help text for throughput (TPS) columns
                              const throughputHelpText = 'Throughput measured in tokens per second (tok/s). Higher values indicate faster token generation.';
                              
                              // Get popover content - use throughput help for TPS columns
                              const popoverContent = col.group === 'throughput' 
                                ? throughputHelpText 
                                : columnPopovers[col.id];
                              
                              return (
                                <Th 
                                  key={colId} 
                                  sort={getSortParams(colIndex + 1)} 
                                  modifier="nowrap"
                                  tooltip={null}
                                  info={popoverContent ? { popover: popoverContent } : undefined}
                                >
                                  {col.label}
                                </Th>
                              );
                            })}
                          </Tr>
                        </Thead>
                        <Tbody>
                          {sortedBenchmarks.map((benchmark) => (
                            <Tr key={`${benchmark.scenarioId}-${benchmark.workload}`}>
                              <Td
                                isStickyColumn={hasTableOverflow}
                                hasRightBorder={hasTableOverflow}
                                stickyMinWidth="200px"
                                modifier="nowrap"
                              >
                                <div style={{ fontWeight: 500 }}>{benchmark.hardware}</div>
                              </Td>
                              {orderedVisibleColumns.map(colId => {
                                const col = getColumnById(colId);
                                if (!col) return null;
                                
                                // Handle latency columns
                                if (col.group === 'latency' && col.latencyMetric && col.latencyPercentile) {
                                  const value = benchmark.latencyData[col.latencyMetric][col.latencyPercentile];
                                  return <Td key={colId}>{value}ms</Td>;
                                }
                                
                                // Handle throughput columns (TPS)
                                if (col.group === 'throughput' && col.latencyMetric && col.latencyPercentile) {
                                  const value = benchmark.latencyData[col.latencyMetric][col.latencyPercentile];
                                  return <Td key={colId}>{value} tok/s</Td>;
                                }
                                
                                // Handle metadata columns
                                if (col.group === 'metadata') {
                                  const rawValue = benchmark[col.id as keyof BenchmarkData];
                                  // Filter out LatencyData type
                                  if (typeof rawValue === 'object' && rawValue !== null && 'TTFT' in rawValue) {
                                    return null;
                                  }
                                  return <Td key={colId}>{String(rawValue)}</Td>;
                                }
                                
                                // Handle hardware columns (replicas, totalHardware)
                                if (col.group === 'hardware') {
                                  if (col.id === 'replicas') {
                                    return <Td key={colId}>{benchmark.replicas}</Td>;
                                  }
                                  if (col.id === 'totalHardware') {
                                    return <Td key={colId}>{benchmark.hardwareCount * benchmark.replicas}</Td>;
                                  }
                                }
                                
                                // Handle request profile columns
                                if (col.group === 'requestProfile') {
                                  if (col.id === 'targetInputTokens') {
                                    return <Td key={colId}>{benchmark.targetInputTokens}</Td>;
                                  }
                                  if (col.id === 'targetOutputTokens') {
                                    return <Td key={colId}>{benchmark.targetOutputTokens}</Td>;
                                  }
                                }
                                
                                return null;
                              })}
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </div>
                    </InnerScrollContainer>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6A6E73' }}>
                  No benchmark data available for the selected filters.
                </div>
              )}
                </CardBody>
              </Card>

              {/* Compression Level Comparison and Inference Metrics */}
              {(compressionModels.length > 0 || shouldShowInferenceMetrics) && (
                <Card style={{ marginBottom: '1rem', overflow: 'visible' }}>
                  <CardHeader>
                    <Title headingLevel="h3" size="md">Compression level comparison</Title>
                    <p style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      View benchmark performance of this model's available compression levels.
                    </p>
                  </CardHeader>
                  <CardBody style={{ overflow: 'visible', paddingBottom: '2rem' }}>
                    {/* Compression level comparison */}
                    {compressionModels.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: shouldShowInferenceMetrics ? '2rem' : '0' }}>
                        {/* Current model */}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem' }}>
                          <div 
                            style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                            dangerouslySetInnerHTML={{ __html: ValidatedModelIcon }}
                          />
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                              {getDisplayName(model.name)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <Label color="green" isCompact>{model.tensorType}</Label>
                              <Label color="grey" isCompact>Current model</Label>
                            </div>
                          </div>
                        </div>
                        
                        {/* Related compression models */}
                        {compressionModels.map(compModel => (
                          <React.Fragment key={compModel.id}>
                            {/* Divider */}
                            <div style={{ width: '1px', backgroundColor: 'var(--pf-t--global--border--color--default)', margin: '0.5rem 0' }} />
                            
                            {/* Model item */}
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem' }}>
                              <div 
                                style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                dangerouslySetInnerHTML={{ __html: ValidatedModelIcon }}
                              />
                              <div>
                                <Button 
                                  variant="link" 
                                  isInline 
                                  style={{ fontWeight: 500, fontSize: '0.875rem', padding: 0, marginBottom: '0.25rem', textAlign: 'left' }}
                                  onClick={() => {
                                    const params = new URLSearchParams();
                                    searchParams.forEach((value, key) => {
                                      params.set(key, value);
                                    });
                                    params.set('tab', 'performance');
                                    navigate(`/ai-assets/models/${compModel.id}?${params.toString()}`);
                                  }}
                                >
                                  {getDisplayName(compModel.name)}
                                </Button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <Label color="green" isCompact>{compModel.tensorType}</Label>
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    {/* Inference metrics across compressions */}
                    {shouldShowInferenceMetrics && (
                      <>
                        <div style={{ marginTop: compressionModels.length > 0 ? '2rem' : '0', overflow: 'visible' }}>
                          <Title headingLevel="h4" size="md" style={{ marginBottom: '0.5rem' }}>Inference metrics across compressions</Title>
                          <p style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            Select a hardware configuration to view the inference metrics of models at various compression levels.
                          </p>
                          {/* Hardware configuration dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Hardware configuration:</span>
                        <div ref={chartHardwareMenuRef} style={{ position: 'relative' }}>
                          <MenuToggle
                            onClick={() => setIsChartHardwareOpen(!isChartHardwareOpen)}
                            isExpanded={isChartHardwareOpen}
                            style={{ minWidth: '250px' }}
                          >
                            {selectedChartHardware || 'Select hardware'}
                          </MenuToggle>
                          {isChartHardwareOpen && (
                            <Menu
                              onSelect={(_event, itemId) => {
                                if (typeof itemId === 'string') {
                                  setSelectedChartHardware(itemId);
                                  setIsChartHardwareOpen(false);
                                }
                              }}
                              selected={selectedChartHardware}
                              style={{ 
                                position: 'absolute', 
                                top: '100%', 
                                left: 0, 
                                zIndex: 9999,
                                minWidth: '250px'
                              }}
                            >
                              <MenuContent>
                                <MenuList>
                                  {hardwareOptions.map(hw => (
                                    <MenuItem key={hw} itemId={hw}>
                                      {hw}
                                    </MenuItem>
                                  ))}
                                </MenuList>
                              </MenuContent>
                            </Menu>
                          )}
                        </div>
                      </div>
                      <Popover
                        headerContent="Can't find what you're looking for?"
                        bodyContent="The Inference metrics table uses the filters applied to the Hardware configuration table. Adjust or clear the filters to see more options here."
                      >
                        <Button variant="link" isInline icon={<OutlinedQuestionCircleIcon />}>
                          Can't find what you're looking for?
                        </Button>
                      </Popover>
                    </div>

                    {/* Metric tabs */}
                    <Tabs
                      activeKey={selectedMetricTab}
                      onSelect={(_, key) => setSelectedMetricTab(key as typeof selectedMetricTab)}
                      style={{ marginBottom: '1.5rem', backgroundColor: 'transparent' }}
                    >
                      <Tab eventKey="E2E" title={<TabTitleText>E2E latency (ms)</TabTitleText>} />
                      <Tab eventKey="ITL" title={<TabTitleText>Inter-token latency (ms)</TabTitleText>} />
                      <Tab eventKey="TTFT" title={<TabTitleText>Time to first token latency (ms)</TabTitleText>} />
                      <Tab eventKey="TPS" title={<TabTitleText>Throughput (tok/s)</TabTitleText>} />
                    </Tabs>

                    {/* Line chart */}
                    {inferenceMetricsChartData.length > 0 ? (
                      <div style={{ width: '100%', height: '400px', marginBottom: '1rem' }}>
                        <ReactECharts
                          option={{
                            tooltip: {
                              trigger: 'axis',
                              formatter: (params: any) => {
                                let tooltip = `<strong>RPS: ${params[0].value[0]}</strong><br/>`;
                                params.forEach((param: any) => {
                                  const unit = selectedMetricTab === 'TPS' ? ' tok/s' : ' ms';
                                  tooltip += `${param.marker} ${param.seriesName}: ${param.value[1]}${unit}<br/>`;
                                });
                                return tooltip;
                              }
                            },
                            legend: {
                              data: inferenceMetricsChartData.map(series => 
                                series.isCurrent ? `${series.name} (Current model)` : series.name
                              ),
                              bottom: 0,
                              type: 'scroll'
                            },
                            xAxis: {
                              type: 'value',
                              min: 1,
                              max: 10,
                              name: 'Request per second (RPS)',
                              nameLocation: 'middle',
                              nameGap: 30,
                              axisLabel: {
                                formatter: '{value}'
                              }
                            },
                            yAxis: {
                              type: 'value',
                              name: selectedMetricTab === 'TPS' ? 'Throughput (tok/s)' : `${selectedMetricTab} latency (ms)`,
                              nameLocation: 'middle',
                              nameGap: 50
                            },
                            series: inferenceMetricsChartData.map(series => ({
                              name: series.isCurrent ? `${series.name} (Current model)` : series.name,
                              data: series.data.map(point => [point.x, point.y]),
                              type: 'line',
                              smooth: true,
                              itemStyle: {
                                color: series.color
                              },
                              lineStyle: {
                                width: series.isCurrent ? 3 : 2
                              }
                            })),
                            grid: {
                              left: '10%',
                              right: '10%',
                              bottom: '20%',
                              top: '10%',
                              containLabel: true
                            }
                          }}
                          style={{ height: '100%', width: '100%' }}
                        />
                      </div>
                    ) : (
                      <div style={{ 
                        padding: '3rem', 
                        textAlign: 'center', 
                        color: 'var(--pf-t--global--text--color--subtle)',
                        backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                        borderRadius: '4px',
                        marginBottom: '1rem'
                      }}>
                        N/A
                      </div>
                    )}

                        </div>
                      </>
                    )}
                  </CardBody>
                </Card>
              )}
        </PageSection>
      )}

      {/* Customize Columns Modal */}
      <Modal
        variant={ModalVariant.small}
        title="Customize columns"
        isOpen={isCustomizeColumnsOpen}
        onClose={handleCancelColumns}
      >
        <ModalHeader>
          <Title headingLevel="h2" size="xl">Customize columns</Title>
          <p style={{ color: 'var(--pf-t--global--text--color--subtle)', marginTop: '0.5rem' }}>
            Manage the columns that appear in the hardware configuration table.
          </p>
        </ModalHeader>
        <ModalBody style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <Button variant="link" isInline onClick={handleRestoreDefaults} style={{ marginBottom: '1rem' }}>
            Restore default columns
          </Button>
          <DataList aria-label="Customize columns" isCompact>
            {([
              { id: 'hardware', label: 'Hardware' },
              { id: 'metadata', label: 'Metadata' },
              { id: 'latency', label: 'Latency' },
              { id: 'throughput', label: 'Throughput' },
              { id: 'requestProfile', label: 'Request profile' }
            ] as const).flatMap((group) => {
              const groupColumns = COLUMN_DEFINITIONS.filter(col => col.group === group.id);
              if (groupColumns.length === 0) return [];
              
              const isExpanded = expandedGroups.includes(group.id);
              
              // Return group header + column items (when expanded)
              return [
                // Group header - expandable (no DataListContent needed since columns are separate items)
                <DataListItem 
                  key={`group-${group.id}`}
                  aria-labelledby={`group-label-${group.id}`} 
                  isExpanded={isExpanded}
                >
                  <DataListItemRow>
                    <DataListToggle
                      onClick={() => toggleGroup(group.id)}
                      isExpanded={isExpanded}
                      id={`toggle-${group.id}`}
                    />
                    <DataListItemCells
                      dataListCells={[
                        <DataListCell key="name">
                          <span id={`group-label-${group.id}`} style={{ fontSize: 'var(--pf-t--global--font--size--body--default)' }}>{group.label}</span>
                        </DataListCell>
                      ]}
                    />
                  </DataListItemRow>
                </DataListItem>,
                // Column checkboxes - non-expandable with hidden toggle for alignment
                ...(isExpanded ? groupColumns.map((col) => (
                  <DataListItem key={col.id} aria-labelledby={`col-label-${col.id}`}>
                    <DataListItemRow>
                      <DataListToggle
                        id={`toggle-col-${col.id}`}
                        buttonProps={{
                          disabled: true,
                          'aria-hidden': 'true',
                          style: { visibility: 'hidden' }
                        }}
                      />
                      <DataListItemCells
                        dataListCells={[
                          <DataListCell key="checkbox">
                      <Checkbox
                              id={`col-${col.id}`}
                              label={<span id={`col-label-${col.id}`}>{col.label}</span>}
                              isChecked={isTempColumnVisible(col.id)}
                              onChange={() => toggleTempColumn(col.id)}
                            />
                          </DataListCell>
                        ]}
                      />
                    </DataListItemRow>
                  </DataListItem>
                )) : [])
              ];
            })}
          </DataList>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleUpdateColumns}>
            Update
        </Button>
          <Button variant="link" onClick={handleCancelColumns}>
            Cancel
        </Button>
      </ModalFooter>
    </Modal>
    </PageSection>
);
};

export default ModelDetails;
