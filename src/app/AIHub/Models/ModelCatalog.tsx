import * as React from 'react';
import {
  Alert,
  AlertActionCloseButton,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Divider,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Gallery,
  GalleryItem,
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
  Select,
  SelectList,
  SelectOption,
  Slider,
  Switch,
  TextInput,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  AngleLeftIcon,
  AngleRightIcon,
  OutlinedQuestionCircleIcon,
  SearchIcon,
} from '@patternfly/react-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartColumn, faUndo } from '@fortawesome/free-solid-svg-icons';
import { useDocumentTitle } from '../../utils/useDocumentTitle';
import { useFeatureFlags } from '../../utils/FeatureFlagsContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DEFAULT_LATENCY_METRIC, DEFAULT_LATENCY_PERCENTILE, DEFAULT_LATENCY_VALUE, DEFAULT_RPS_VALUE, DEFAULT_WORKLOAD, type LatencyMetric, type LatencyPercentile, WORKLOAD_OPTIONS, type Workload } from '../../../hooks/usePerformanceFilters';
import { filterBenchmarks, generateModelBenchmarks } from '../../../lib/benchmarks';
import { MODELS } from '../../../data/models';
import type { Category, Model } from '../../../types';
import { useColumnPreferences } from '../../../hooks/useColumnPreferences';
import { COLUMN_DEFINITIONS } from '../../../lib/columnConfig';
import ValidatedModelIcon from '@app/assets/validated-model.svg';
import RedHatIcon from '@app/assets/the-hat.svg';
import GenericModelSvgIcon from '@app/assets/generic-model-icon.svg';
import { MCPCatalogIcon } from '@app/Home/icons';

interface ModelCard {
  id: string;
  name: string;
  description: string;
  accuracy?: string;
  hardware?: string;
  rps?: string;
  ttft?: string;
  benchmarks?: number;
  validated?: boolean;
  provider: string;
  task: string[];
  additionalTasks?: string[];
  license: string;
  language: string[];
}

// Helper function to get display name (removes repo prefix like "RedHatAI/")
const getDisplayName = (name: string): string => {
  const slashIndex = name.lastIndexOf('/');
  return slashIndex !== -1 ? name.substring(slashIndex + 1) : name;
};

// Display formatter for task labels
// - "text-generation" → "Text generation"
// - "text-to-text" → "Text-to-text" (keeps "-to-" pattern)
// - "question-answering" → "Question answering"
const formatTaskLabel = (task: string): string => {
  // Check if task contains "-to-" pattern (e.g., text-to-text, image-to-text)
  if (task.includes('-to-')) {
    // Keep the "-to-" pattern, just capitalize the first letter
    return task.charAt(0).toUpperCase() + task.slice(1);
  }
  
  // For other tasks, replace hyphens with spaces and capitalize first letter
  return task
    .split('-')
    .map((word, index) => index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
    .join(' ');
};

// Display formatter for language codes (e.g., "en" → "English")
const formatLanguageLabel = (lang: string): string => {
  const languageMap: Record<string, string> = {
    'en': 'English',
    'zh': 'Chinese',
    'multilingual': 'Multilingual',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'ja': 'Japanese',
    'ko': 'Korean',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ar': 'Arabic',
    'it': 'Italian',
    'hi': 'Hindi',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'nl': 'Dutch',
    'cs': 'Czech',
  };
  return languageMap[lang.toLowerCase()] || lang.charAt(0).toUpperCase() + lang.slice(1);
};

// Display formatter for provider names (already properly formatted, but normalize if needed)
const formatProviderLabel = (provider: string): string => {
  return provider; // Providers are already properly formatted in the data
};

// Minimal scrollbar styling - uses thin scrollbars and respects OS settings
const scrollbarStyles = `
  .pf-v6-c-page__main-section,
  .catalog-scrollable {
    scrollbar-width: thin;
    scrollbar-color: auto;
  }
`;

// Workload labels for scenario display
const WORKLOAD_LABELS: Record<string, string> = {
  chat: "Chatbot (512 input / 256 output)",
  rag: "RAG (4096 input / 512 output)",
  code_fixing: "Code fixing (1024 input / 1024 output)",
  long_rag: "Long RAG (10240 input / 1536 output)",
};

interface ModelCatalogProps {
  isTabContent?: boolean;
}

const ModelCatalog: React.FunctionComponent<ModelCatalogProps> = ({ isTabContent = false }) => {
  useDocumentTitle('Model Catalog');
  useFeatureFlags();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Performance filters - use local state (not URL) to avoid navigation conflicts
  // Initialize from sessionStorage if returning from details page
  const [performanceFiltersEnabled, setPerformanceFiltersEnabled] = React.useState(() => {
    try {
      const stored = sessionStorage.getItem("catalogPerfFilters");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.performanceFiltersEnabled ?? false;
      }
    } catch { /* ignore */ }
    return false;
  });
  const [workload, setWorkload] = React.useState<Workload>(() => {
    try {
      const stored = sessionStorage.getItem("catalogPerfFilters");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.workload ?? DEFAULT_WORKLOAD;
      }
    } catch { /* ignore */ }
    return DEFAULT_WORKLOAD;
  });
  const [latencyMetric, setLatencyMetric] = React.useState<LatencyMetric>(() => {
    try {
      const stored = sessionStorage.getItem("catalogPerfFilters");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.latencyMetric ?? DEFAULT_LATENCY_METRIC;
      }
    } catch { /* ignore */ }
    return DEFAULT_LATENCY_METRIC;
  });
  const [latencyPercentile, setLatencyPercentile] = React.useState<LatencyPercentile>(() => {
    try {
      const stored = sessionStorage.getItem("catalogPerfFilters");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.latencyPercentile ?? DEFAULT_LATENCY_PERCENTILE;
      }
    } catch { /* ignore */ }
    return DEFAULT_LATENCY_PERCENTILE;
  });
  const [latencyValue, setLatencyValue] = React.useState(() => {
    try {
      const stored = sessionStorage.getItem("catalogPerfFilters");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.latencyValue ?? DEFAULT_LATENCY_VALUE;
      }
    } catch { /* ignore */ }
    return DEFAULT_LATENCY_VALUE;
  });
  const [rpsValue, setRpsValue] = React.useState(() => {
    try {
      const stored = sessionStorage.getItem("catalogPerfFilters");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.rpsValue ?? DEFAULT_RPS_VALUE;
      }
    } catch { /* ignore */ }
    return DEFAULT_RPS_VALUE;
  });
  const [hardware, setHardware] = React.useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem("catalogPerfFilters");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.hardware ?? [];
      }
    } catch { /* ignore */ }
    return [];
  });
  
  // Read model name from sessionStorage during initialization (before it gets cleared)
  const initialModelName = React.useMemo(() => {
    try {
      const stored = sessionStorage.getItem("catalogPerfFilters");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.modelName ?? '';
      }
    } catch { /* ignore */ }
    return '';
  }, []);
  
  // Clear sessionStorage after reading (one-time restore)
  React.useEffect(() => {
    sessionStorage.removeItem("catalogPerfFilters");
  }, []);
  
  // Toggle handler - resets filters to defaults when turning ON
  const handleTogglePerformanceFilters = React.useCallback((enabled: boolean) => {
      if (enabled) {
      // Reset all filters to defaults when turning ON
      setWorkload(DEFAULT_WORKLOAD);
      setLatencyMetric(DEFAULT_LATENCY_METRIC);
      setLatencyPercentile(DEFAULT_LATENCY_PERCENTILE);
      setLatencyValue(DEFAULT_LATENCY_VALUE);
      setRpsValue(DEFAULT_RPS_VALUE);
      setHardware([]);
      // Clear any stored filters so they don't accidentally restore
      sessionStorage.removeItem("catalogPerfFilters");
    }
    setPerformanceFiltersEnabled(enabled);
  }, []);
  
  // Combined latency filter setter
  const setLatencyFilters = React.useCallback((metric: LatencyMetric, percentile: LatencyPercentile, value: number) => {
    setLatencyMetric(metric);
    setLatencyPercentile(percentile);
    setLatencyValue(value);
  }, []);
  
  // Reset all performance filters
  const resetPerformanceFilters = React.useCallback(() => {
    setWorkload(DEFAULT_WORKLOAD);
    setLatencyMetric(DEFAULT_LATENCY_METRIC);
    setLatencyPercentile(DEFAULT_LATENCY_PERCENTILE);
    setLatencyValue(DEFAULT_LATENCY_VALUE);
    setRpsValue(DEFAULT_RPS_VALUE);
    setHardware([]);
  }, []);

  // State for filters
  const [selectedTasks, setSelectedTasks] = React.useState<string[]>(() => 
    searchParams.get("tasks")?.split(",").filter(Boolean) || []
  );
  const [selectedProviders, setSelectedProviders] = React.useState<string[]>(() => 
    searchParams.get("providers")?.split(",").filter(Boolean) || []
  );
  const [selectedLicenses, setSelectedLicenses] = React.useState<string[]>(() => 
    searchParams.get("licenses")?.split(",").filter(Boolean) || []
  );
  const [selectedLanguages, setSelectedLanguages] = React.useState<string[]>(() => 
    searchParams.get("languages")?.split(",").filter(Boolean) || []
  );
  const [selectedTensorTypes, setSelectedTensorTypes] = React.useState<string[]>(() => 
    searchParams.get("tensorTypes")?.split(",").filter(Boolean) || []
  );

  // Search state
  const [search, setSearchState] = React.useState(() => searchParams.get("search") || "");
  const [searchInput, setSearchInput] = React.useState(() => searchParams.get("search") || "");
  
  // Sync search to URL
  const setSearch = React.useCallback((value: string) => {
    setSearchState(value);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value.trim()) {
        next.set("search", value.trim());
      } else {
        next.delete("search");
      }
      return next;
    });
  }, [setSearchParams]);

  // Category state - read from URL
  const categoryFromUrl = searchParams.get("category") as Category | null;
  const [category, setCategoryState] = React.useState<Category | null>(categoryFromUrl);
  
  // Sync category to URL
  const setCategory = React.useCallback((newCategory: Category | null) => {
    setCategoryState(newCategory);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (newCategory === null) {
        next.delete("category");
      } else {
        next.set("category", newCategory);
      }
      return next;
    });
  }, [setSearchParams]);

  // Sort dropdown state
  const [isSortOpen, setIsSortOpen] = React.useState(false);
  const [sortOption, setSortOption] = React.useState<'latency' | 'updated'>('latency');

  // Workload dropdown state
  const [isWorkloadOpen, setIsWorkloadOpen] = React.useState(false);
  const workloadMenuRef = React.useRef<HTMLDivElement>(null);
  
  // Hardware dropdown state (hardware values come from usePerformanceFilters hook)
  const [isHardwareOpen, setIsHardwareOpen] = React.useState(false);
  const [hardwareSearchValue, setHardwareSearchValue] = React.useState('');
  const hardwareMenuRef = React.useRef<HTMLDivElement>(null);
  const hardwareOptions = ['H100 x 1', 'H100 x 2', 'H100 x 4', 'A100 x 1', 'A100 x 2', 'A100 x 4', 'L40S x 2', 'L40S x 4'];
  const filteredHardwareOptions = hardwareOptions.filter(hw => 
    hw.toLowerCase().includes(hardwareSearchValue.toLowerCase())
  );
  
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

  // Sync category state with URL on mount/URL changes (but don't update if it's the same to avoid blinking)
  React.useEffect(() => {
    const urlCategory = searchParams.get("category") as Category | null;
    if (urlCategory !== category) {
      setCategoryState(urlCategory);
    }
  }, [searchParams]);

  const [showAllTasks, setShowAllTasks] = React.useState(false);
  const [showAllProviders, setShowAllProviders] = React.useState(false);
  const [showAllLicenses, setShowAllLicenses] = React.useState(false);
  const [showAllLanguages, setShowAllLanguages] = React.useState(false);
  
  
  // Alert state for filter changes
  const [showFilterChangedAlert, setShowFilterChangedAlert] = React.useState(false);
  const [alertModelName, setAlertModelName] = React.useState<string>('');
  const mountTime = React.useRef<number>(Date.now());
  
  // Column preferences for performance table
  const {
    toggleColumn,
    restoreDefaults,
    isColumnVisible,
  } = useColumnPreferences(latencyMetric, latencyPercentile);
  
  // Customize columns modal state
  const [isCustomizeColumnsOpen, setIsCustomizeColumnsOpen] = React.useState(false);
  
  // Check for return from details page on mount
  React.useEffect(() => {
    const returnedFromDetails = sessionStorage.getItem("returnedFromDetails");
    const storedState = sessionStorage.getItem("catalogFilterState");
    
    // Clear the return flag immediately
    sessionStorage.removeItem("returnedFromDetails");
    
    // Only check if user just returned from details AND performance toggle is ON
    if (returnedFromDetails === "true" && performanceFiltersEnabled && storedState) {
      try {
        const stored = JSON.parse(storedState);
        
        // Compare performance filters only
        const filtersChanged = 
          stored.workload !== workload ||
          stored.latencyMetric !== latencyMetric ||
          stored.latencyPercentile !== latencyPercentile ||
          stored.latencyValue !== latencyValue ||
          stored.rpsValue !== rpsValue ||
          JSON.stringify(stored.hardware || []) !== JSON.stringify(hardware);
        
        if (filtersChanged) {
          // Use model name read during initialization (before sessionStorage was cleared)
          setAlertModelName(initialModelName);
          setShowFilterChangedAlert(true);
          // Reset mount time for grace period
          mountTime.current = Date.now();
        }
      } catch {
        // Invalid stored state, ignore
      }
    }
    
    // Clean up stored state after checking
      sessionStorage.removeItem("catalogFilterState");
  }, []); // Only run on mount
  
  // Dismiss alert when toggle is turned off
  React.useEffect(() => {
    if (showFilterChangedAlert && !performanceFiltersEnabled) {
      setShowFilterChangedAlert(false);
    }
  }, [showFilterChangedAlert, performanceFiltersEnabled]);
  
  // Dismiss alert when any filter changes (with 500ms grace period after mount)
  React.useEffect(() => {
    // Don't dismiss within 500ms of mount (grace period for React state settling)
    if (Date.now() - mountTime.current < 500) {
      return;
    }
    
    // Dismiss alert when user changes any filter
    if (showFilterChangedAlert) {
        setShowFilterChangedAlert(false);
      }
  }, [showFilterChangedAlert, workload, latencyMetric, latencyPercentile, latencyValue, rpsValue, hardware, selectedTasks, selectedProviders, selectedLicenses, selectedLanguages, selectedTensorTypes, search, category]);
  
  // Search state for filter categories
  const [taskSearch, setTaskSearch] = React.useState('');
  const [providerSearch, setProviderSearch] = React.useState('');
  const [licenseSearch, setLicenseSearch] = React.useState('');
  const [languageSearch, setLanguageSearch] = React.useState('');
  
  // State to track current benchmark index for each model
  const [benchmarkIndices, setBenchmarkIndices] = React.useState<Record<string, number>>({});
  
  // Modal state for benchmark information
  const [isBenchmarkModalOpen, setIsBenchmarkModalOpen] = React.useState(false);
  
  // Modal state for feature not available
  const [isFeatureModalOpen, setIsFeatureModalOpen] = React.useState(false);

  // Helper to store filter state before navigating to details
  const storeFilterStateForAlert = () => {
    // Dismiss alert when navigating to details page
    setShowFilterChangedAlert(false);
    
    // Store current filter state in sessionStorage for alert detection
    const filterState = JSON.stringify({
      workload, latencyMetric, latencyPercentile, 
      latencyValue, rpsValue, hardware,
      tasks: selectedTasks, providers: selectedProviders, licenses: selectedLicenses,
      languages: selectedLanguages, tensorTypes: selectedTensorTypes, search
    });
    sessionStorage.setItem("catalogFilterState", filterState);
    
    // Also store performance filters separately for restoration when returning
    const perfFilters = JSON.stringify({
      performanceFiltersEnabled,
      workload, latencyMetric, latencyPercentile,
      latencyValue, rpsValue, hardware
    });
    sessionStorage.setItem("catalogPerfFilters", perfFilters);
  };

  // Model name click handler - navigate to model details
  const handleModelNameClick = (modelId: string) => {
    storeFilterStateForAlert();
    
    // Create URL with current filters (use local state for current values)
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (performanceFiltersEnabled) params.set("perfFilter", "true");
    if (search.trim()) params.set("search", search.trim());
    if (selectedTasks.length > 0) params.set("tasks", selectedTasks.join(","));
    if (selectedProviders.length > 0) params.set("providers", selectedProviders.join(","));
    if (selectedLicenses.length > 0) params.set("licenses", selectedLicenses.join(","));
    if (selectedLanguages.length > 0) params.set("languages", selectedLanguages.join(","));
    if (selectedTensorTypes.length > 0) params.set("tensorTypes", selectedTensorTypes.join(","));
    params.set("workload", workload);
    params.set("latencyMetric", latencyMetric);
    params.set("latencyPercentile", latencyPercentile);
    params.set("latencyValue", latencyValue.toString());
    params.set("rpsValue", rpsValue.toString());
    if (hardware.length > 0) params.set("hardware", hardware.join(","));
    
    navigate(`/ai-assets/models/${modelId}?${params.toString()}`);
  };

  // Use real MODELS data - convert to ModelCard format for compatibility

  // Dynamically generate filter options from MODELS data
  const taskOptions = React.useMemo(() => {
    const allTasks = MODELS.flatMap(model => 
      Array.isArray(model.task) ? model.task : [model.task]
    );
    return Array.from(new Set(allTasks)).sort();
  }, []);

  const providerOptions = React.useMemo(() => {
    const allProviders = MODELS.map(model => model.provider);
    return Array.from(new Set(allProviders)).sort();
  }, []);

  const licenseOptions = React.useMemo(() => {
    const allLicenses = MODELS.map(model => model.license);
    return Array.from(new Set(allLicenses)).sort();
  }, []);

  const languageOptions = React.useMemo(() => {
    const allLanguages = MODELS.flatMap(model => 
      Array.isArray(model.language) ? model.language : (typeof model.language === 'string' ? model.language.split(',').map(l => l.trim()) : ['en'])
    );
    return Array.from(new Set(allLanguages)).sort();
  }, []);

  // Tensor type options - fixed order
  const tensorTypeOptions = ['FP8', 'FP16', 'INT4', 'INT8'];

  // Helper functions to filter options based on search
  const FILTER_COLLAPSE_THRESHOLD = 5;

  const getFilteredTasks = () => {
    const filtered = taskOptions.filter(task => 
      formatTaskLabel(task).toLowerCase().includes(taskSearch.toLowerCase())
    );
    return showAllTasks ? filtered : filtered.slice(0, FILTER_COLLAPSE_THRESHOLD);
  };

  const getFilteredProviders = () => {
    const filtered = providerOptions.filter(provider => 
      formatProviderLabel(provider).toLowerCase().includes(providerSearch.toLowerCase())
    );
    return showAllProviders ? filtered : filtered.slice(0, FILTER_COLLAPSE_THRESHOLD);
  };

  const getFilteredLicenses = () => {
    const filtered = licenseOptions.filter(license => 
      license.toLowerCase().includes(licenseSearch.toLowerCase())
    );
    return showAllLicenses ? filtered : filtered.slice(0, FILTER_COLLAPSE_THRESHOLD);
  };

  const getFilteredLanguages = () => {
    const filtered = languageOptions.filter(language => 
      formatLanguageLabel(language).toLowerCase().includes(languageSearch.toLowerCase())
    );
    return showAllLanguages ? filtered : filtered.slice(0, FILTER_COLLAPSE_THRESHOLD);
  };


  // Pagination state for "Load more" functionality
  const [visibleCount, setVisibleCount] = React.useState(10);
  
  // Dynamic cards per row calculation
  const galleryContainerRef = React.useRef<HTMLDivElement>(null);
  const [cardsPerRow, setCardsPerRow] = React.useState(3);
  
  // Reset visible count when filters/category change
  React.useEffect(() => {
    setVisibleCount(10);
  }, [search, category, selectedTasks, selectedProviders, selectedLicenses, selectedLanguages, selectedTensorTypes, performanceFiltersEnabled]);

  // Check if any filters or search are active (including performance toggle)
  const hasActiveFiltersOrSearch = React.useMemo(() => {
    return search.trim() !== '' || 
           selectedTasks.length > 0 || 
           selectedProviders.length > 0 || 
           selectedLicenses.length > 0 || 
           selectedLanguages.length > 0 ||
           selectedTensorTypes.length > 0 ||
           performanceFiltersEnabled;
  }, [search, selectedTasks, selectedProviders, selectedLicenses, selectedLanguages, selectedTensorTypes, performanceFiltersEnabled]);

  // Determine if grouped view should be shown (for dynamic cards per row calculation)
  const shouldShowGroupedView = category === null && !hasActiveFiltersOrSearch;
  
  // Effect to calculate cards per row when grouped view is visible
  React.useEffect(() => {
    if (!shouldShowGroupedView) return;
    
    const calculateCardsPerRow = () => {
      if (galleryContainerRef.current) {
        const containerWidth = galleryContainerRef.current.offsetWidth;
        const cardMinWidth = 280; // matches Gallery minWidths
        const gutter = 16; // PatternFly default gutter
        // Calculate how many cards fit: (containerWidth + gutter) / (cardMinWidth + gutter)
        const count = Math.floor((containerWidth + gutter) / (cardMinWidth + gutter));
        setCardsPerRow(Math.max(1, count)); // At least 1 card
      }
    };
    
    // Use requestAnimationFrame to ensure DOM is ready after navigation
    const rafId = requestAnimationFrame(() => {
      calculateCardsPerRow();
    });
    
    const resizeObserver = new ResizeObserver(calculateCardsPerRow);
    if (galleryContainerRef.current) {
      resizeObserver.observe(galleryContainerRef.current);
    }
    
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [shouldShowGroupedView]);

  // Filter functions using real Model type
  const filteredModels = React.useMemo(() => {
    let filtered = [...MODELS];
    
    // Search filter
    if (search.trim()) {
      const searchLower = search.trim().toLowerCase();
      filtered = filtered.filter(model => 
        model.name.toLowerCase().includes(searchLower) ||
        model.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Category filter
    if (category !== null) {
      filtered = filtered.filter(model => model.category === category);
    }
    
    // Sidebar filters
    if (selectedTasks.length > 0) {
      filtered = filtered.filter(model => {
        const modelTask = Array.isArray(model.task) ? model.task : [model.task];
        return modelTask.some(t => selectedTasks.includes(t));
      });
    }
    if (selectedProviders.length > 0) {
      filtered = filtered.filter(model => selectedProviders.includes(model.provider));
    }
    if (selectedLicenses.length > 0) {
      filtered = filtered.filter(model => selectedLicenses.includes(model.license));
    }
    if (selectedLanguages.length > 0) {
      filtered = filtered.filter(model => {
        const modelLang = Array.isArray(model.language) ? model.language : [model.language];
        return modelLang.some(l => selectedLanguages.includes(l));
      });
    }
    if (selectedTensorTypes.length > 0) {
      filtered = filtered.filter(model => model.tensorType && selectedTensorTypes.includes(model.tensorType));
    }
    
    // Performance filters (only when toggle is ON) - use local state for instant reactivity
    if (performanceFiltersEnabled) {
      filtered = filtered.filter(model => {
        // Only validated models have benchmarks
        if (model.category !== 'validated') return false;
        
        // Generate benchmarks for this model
        const benchmarks = generateModelBenchmarks(model);
        
        // Filter benchmarks based on performance criteria (use local state)
        const filteredBenchmarks = filterBenchmarks(benchmarks, {
          workload: workload,
          hardware: hardware,
          latencyValue: latencyValue,
          rpsValue: rpsValue,
          latencyMetric: latencyMetric,
          latencyPercentile: latencyPercentile,
        });
        
        // Model passes if it has at least one matching benchmark
        return filteredBenchmarks.length > 0;
      });
    }
    
    // Sorting logic
    if (performanceFiltersEnabled) {
      // When performance toggle is ON, use sortOption
      if (sortOption === 'latency') {
        // Sort by latency/TPS - get value from first benchmark (already sorted by filterBenchmarks)
        filtered.sort((a, b) => {
          const benchmarksA = generateModelBenchmarks(a);
          const benchmarksB = generateModelBenchmarks(b);
          const filteredA = filterBenchmarks(benchmarksA, { workload: workload, hardware: hardware, latencyValue: latencyValue, rpsValue: rpsValue, latencyMetric: latencyMetric, latencyPercentile: latencyPercentile });
          const filteredB = filterBenchmarks(benchmarksB, { workload: workload, hardware: hardware, latencyValue: latencyValue, rpsValue: rpsValue, latencyMetric: latencyMetric, latencyPercentile: latencyPercentile });
          
          // Get value from first benchmark (filterBenchmarks already sorts appropriately)
          const getFirstBenchmarkValue = (benchmarks: any[]) => {
            if (benchmarks.length === 0) return latencyMetric === 'TPS' ? 0 : Infinity;
            // Use the latency field which is set based on current filter's metric/percentile
            return benchmarks[0].latency || (latencyMetric === 'TPS' ? 0 : Infinity);
          };
          
          const valueA = getFirstBenchmarkValue(filteredA);
          const valueB = getFirstBenchmarkValue(filteredB);
          
          // For TPS: higher is better, so sort descending (b - a)
          // For latency metrics: lower is better, so sort ascending (a - b)
          if (latencyMetric === 'TPS') {
            return valueB - valueA; // Descending for TPS (highest first)
          }
          return valueA - valueB; // Ascending for latency (lowest first)
        });
      } else {
        // Sort by recent publish (createdAt descending)
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
      }
    } else {
      // When performance toggle is OFF, sort by publish date (createdAt) descending
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
    }
    
    return filtered;
  }, [search, category, selectedTasks, selectedProviders, selectedLicenses, selectedLanguages, selectedTensorTypes,
      performanceFiltersEnabled, workload, hardware, latencyValue, rpsValue, latencyMetric, latencyPercentile, sortOption]);

  const getValidatedModels = React.useMemo(() => 
    filteredModels.filter(model => model.category === 'validated'), 
    [filteredModels]
  );
  const getRedHatModels = React.useMemo(() => 
    filteredModels.filter(model => model.category === 'redhat'), 
    [filteredModels]
  );
  const getCommunityModels = React.useMemo(() => 
    filteredModels.filter(model => model.category === 'other'), 
    [filteredModels]
  );
  
  // Helper function for backward compatibility
  const getFilteredModels = (): ModelCard[] => {
    // Convert Model[] to ModelCard[] for compatibility with existing renderModelCard
    return filteredModels.map((model: Model) => {
      // Handle task as string or string[]
      const taskArray: string[] = Array.isArray(model.task) ? model.task : [model.task];
      // Handle language as string or string[]
      const langArray: string[] = Array.isArray(model.language) ? model.language : (typeof model.language === 'string' ? model.language.split(',').map(l => l.trim()) : ['en']);
      
      // Calculate actual benchmark count for validated models
      const benchmarkCount = model.category === 'validated' 
        ? generateModelBenchmarks(model).length 
        : undefined;
      
      return {
      id: model.id,
      name: model.name,
      description: model.description,
      accuracy: model.metrics.accuracy > 0 ? `${model.metrics.accuracy}%` : undefined,
      hardware: model.performance?.hardware?.[0] || undefined,
      rps: model.performance?.rps || undefined,
      ttft: model.performance?.latency || undefined,
      benchmarks: benchmarkCount,
      validated: model.category === 'validated',
      provider: model.provider,
        task: taskArray,
      license: model.license,
        language: langArray,
      };
    });
  };

  // Filter handlers - sync to URL
  const handleTaskFilter = React.useCallback((task: string, checked: boolean) => {
    setSelectedTasks(prev => {
      const newTasks = checked ? [...prev, task] : prev.filter(t => t !== task);
      setSearchParams(prevParams => {
        const next = new URLSearchParams(prevParams);
        if (newTasks.length > 0) {
          next.set("tasks", newTasks.join(","));
        } else {
          next.delete("tasks");
        }
        return next;
      });
      return newTasks;
    });
  }, [setSearchParams]);

  const handleProviderFilter = React.useCallback((provider: string, checked: boolean) => {
    setSelectedProviders(prev => {
      const newProviders = checked ? [...prev, provider] : prev.filter(p => p !== provider);
      setSearchParams(prevParams => {
        const next = new URLSearchParams(prevParams);
        if (newProviders.length > 0) {
          next.set("providers", newProviders.join(","));
        } else {
          next.delete("providers");
        }
        return next;
      });
      return newProviders;
    });
  }, [setSearchParams]);

  const handleLicenseFilter = React.useCallback((license: string, checked: boolean) => {
    setSelectedLicenses(prev => {
      const newLicenses = checked ? [...prev, license] : prev.filter(l => l !== license);
      setSearchParams(prevParams => {
        const next = new URLSearchParams(prevParams);
        if (newLicenses.length > 0) {
          next.set("licenses", newLicenses.join(","));
        } else {
          next.delete("licenses");
        }
        return next;
      });
      return newLicenses;
    });
  }, [setSearchParams]);

  const handleLanguageFilter = React.useCallback((language: string, checked: boolean) => {
    setSelectedLanguages(prev => {
      const newLanguages = checked ? [...prev, language] : prev.filter(l => l !== language);
      setSearchParams(prevParams => {
        const next = new URLSearchParams(prevParams);
        if (newLanguages.length > 0) {
          next.set("languages", newLanguages.join(","));
        } else {
          next.delete("languages");
        }
        return next;
      });
      return newLanguages;
    });
  }, [setSearchParams]);

  const handleTensorTypeFilter = React.useCallback((tensorType: string, checked: boolean) => {
    setSelectedTensorTypes(prev => {
      const newTensorTypes = checked ? [...prev, tensorType] : prev.filter(t => t !== tensorType);
      setSearchParams(prevParams => {
        const next = new URLSearchParams(prevParams);
        if (newTensorTypes.length > 0) {
          next.set("tensorTypes", newTensorTypes.join(","));
      } else {
          next.delete("tensorTypes");
        }
        return next;
      });
      return newTensorTypes;
    });
  }, [setSearchParams]);


  // Helper to get filtered benchmarks for a model - same logic as details page
  // Uses local state for instant reactivity
  const getFilteredBenchmarksForModel = (modelId: string): any[] => {
    const originalModel = MODELS.find(m => m.id === modelId);
    if (!originalModel || originalModel.category !== 'validated') return [];
    
    // Step 1: Generate benchmarks (same as details page)
    const benchmarks = generateModelBenchmarks(originalModel);
    
    // Step 2: Filter benchmarks with local filter values
    return filterBenchmarks(benchmarks, {
      workload: workload,
      hardware: hardware,
      latencyValue: latencyValue,
      rpsValue: rpsValue,
      latencyMetric: latencyMetric,
      latencyPercentile: latencyPercentile
    });
  };

  // Reset benchmark indices when local filters change
  React.useEffect(() => {
    setBenchmarkIndices({});
  }, [workload, hardware, latencyValue, rpsValue, latencyMetric, latencyPercentile]);

  // Functions to handle benchmark navigation
  const getCurrentBenchmarkIndex = (modelId: string) => {
    return benchmarkIndices[modelId] || 1; // Default to 1 (1-indexed for display)
  };

  const handleBenchmarkNavigation = (modelId: string, direction: 'left' | 'right', maxCount: number) => {
    if (maxCount <= 0) return;
    
    setBenchmarkIndices(prev => {
      const currentIndex = prev[modelId] || 1;
      let newIndex = currentIndex;
      
      if (direction === 'right') {
        newIndex = currentIndex < maxCount ? currentIndex + 1 : 1; // Wrap to 1 after max
      } else {
        newIndex = currentIndex > 1 ? currentIndex - 1 : maxCount; // Wrap to max before 1
      }
      
      return {
        ...prev,
        [modelId]: newIndex
      };
    });
  };

  // Render model card
  const renderModelCard = (model: ModelCard) => {
    // Get all labels for model cards - task + provider + language
    const formattedTasks = model.task.map(t => formatTaskLabel(t));
    const formattedLanguages = model.language.map(l => formatLanguageLabel(l));
    
    // Use model.id as key - filter changes are handled by React's normal re-render
    // Don't include filter values or benchmark index in key as it causes unnecessary remounts
    const cardKey = model.id;
    
    return (
    <GalleryItem key={cardKey}>
      <Card style={{ height: '100%' }}>
        <CardHeader style={{ paddingBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div 
              style={{ 
                width: '56px', 
                height: '56px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0,
                padding: (!model.validated && model.provider !== 'Red Hat') ? '4px' : 0,
                boxSizing: 'border-box'
              }}
              dangerouslySetInnerHTML={{ __html: model.validated ? ValidatedModelIcon : (model.provider === 'Red Hat' ? RedHatIcon : GenericModelSvgIcon) }}
            />
            {model.validated ? (
              <Popover bodyContent="Validated models are benchmarked for performance and quality using leading open source evaluation datasets.">
                <Label variant="filled" color="purple" style={{ cursor: 'pointer' }} icon={<FontAwesomeIcon icon={faChartColumn} />}>
                  Validated
                </Label>
              </Popover>
            ) : model.provider === 'Red Hat' ? (
              <Popover bodyContent="Red Hat models with full support and legal indemnification.">
                <Label variant="filled" color="grey" style={{ cursor: 'pointer' }}>
                  Red Hat
                </Label>
              </Popover>
            ) : null}
          </div>
        </CardHeader>
          <CardBody style={{ paddingTop: '0.5rem', display: 'flex', flexDirection: 'column' }}>
          {/* Title area with min-height for B-2 layout alignment */}
          <div style={{ 
            minHeight: model.validated && performanceFiltersEnabled ? '3rem' : 'auto',
            display: 'flex',
            alignItems: 'flex-start'
          }}>
          <Button
            variant="link"
            isInline
            onClick={() => handleModelNameClick(model.id)}
            style={{ 
              fontSize: '0.875rem', 
                fontWeight: '500',
              marginBottom: '0.5rem',
              padding: '0.25rem 0',
              textAlign: 'left',
              height: 'auto',
              lineHeight: '1.2',
              textDecoration: 'none'
            }}
          >
                {getDisplayName(model.name)}
          </Button>
          </div>
            
            {/* Description - shown for non-validated models OR validated models when toggle is OFF */}
          {(!model.validated || (model.validated && !performanceFiltersEnabled)) && (
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#6a6e73', 
              marginBottom: '1rem',
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {model.description}
            </p>
          )}
          
          {/* "View X benchmarks" link - for validated models when toggle is OFF */}
          {model.validated && !performanceFiltersEnabled && (
            <div style={{ marginBottom: '1rem' }}>
              <Button 
                variant="link"
                isInline
                style={{ fontSize: '0.875rem', padding: 0 }}
                onClick={() => {
                  storeFilterStateForAlert();
                  const params = new URLSearchParams();
                  if (category) params.set("category", category);
                  // Don't set perfFilter - keep toggle OFF when returning
                  if (search.trim()) params.set("search", search.trim());
                  if (selectedTasks.length > 0) params.set("tasks", selectedTasks.join(","));
                  if (selectedProviders.length > 0) params.set("providers", selectedProviders.join(","));
                  if (selectedLicenses.length > 0) params.set("licenses", selectedLicenses.join(","));
                  if (selectedLanguages.length > 0) params.set("languages", selectedLanguages.join(","));
                  if (selectedTensorTypes.length > 0) params.set("tensorTypes", selectedTensorTypes.join(","));
                  params.set("tab", "performance");
                  navigate(`/ai-assets/models/${model.id}?${params.toString()}`);
                }}
              >
                {`View ${model.benchmarks} benchmarks →`}
              </Button>
                </div>
          )}

          {/* Benchmark section - ONLY for validated models when toggle is ON */}
          {model.validated && performanceFiltersEnabled && (() => {
            // Get filtered benchmarks using same logic as details page
            const filteredBenchmarks = getFilteredBenchmarksForModel(model.id);
            const benchmarkCount = filteredBenchmarks.length;
            
            // No benchmarks match filters
            if (benchmarkCount === 0) {
              return (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '2.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                      No benchmarks match filters
                    </span>
                </div>
              </div>
              );
            }
            
            // Get current benchmark (0-indexed for array access)
            const currentDisplayIndex = Math.min(getCurrentBenchmarkIndex(model.id), benchmarkCount);
            const currentBenchmark = filteredBenchmarks[currentDisplayIndex - 1];
            
            if (!currentBenchmark) return null;
            
            // Parse hardware string like "H100 x 8"
            const hwParts = currentBenchmark.hardware.split(' x ');
            const hwType = hwParts[0] || currentBenchmark.hardware;
            const hwCount = hwParts[1] || '1';
            
            // Get latency based on current filter metric/percentile (use local state)
            const latencyDisplayValue = currentBenchmark.latencyData[latencyMetric][latencyPercentile];
            const latencyLabel = latencyMetric === 'TTFT' 
              ? <span><b>TTFT (time to first token):</b> Time until the model starts responding. Best for interactive experiences.</span>
              : latencyMetric === 'ITL' 
                ? <span><b>ITL (inter-token latency):</b> Average time between consecutive tokens. Best for streaming experiences.</span>
                : <span><b>E2E (end-to-end latency):</b> Total time from request to complete response. Best for batch processing.</span>;
            const latencyUnit = latencyMetric === 'TPS' ? 'tok/s' : 'ms';
            
            return (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', fontSize: '0.875rem' }}>
                    <span style={{ flex: '1', minWidth: '80px' }}>
                      <span style={{ fontWeight: '500' }}>{hwType}</span>
                      <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}> x </span>
                      <span style={{ fontWeight: '500' }}>{hwCount}</span>
                    </span>
                    <span style={{ flex: '1', minWidth: '60px', fontWeight: '500' }}>{currentBenchmark.replicas}</span>
                    <span style={{ flex: '1', minWidth: '80px', textAlign: 'right' }}>
                      <span style={{ fontWeight: '500' }}>{latencyDisplayValue}</span>
                      <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}> {latencyUnit}</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', fontSize: '0.75rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                    <span style={{ flex: '1', minWidth: '80px' }}>Hardware</span>
                    <span style={{ flex: '1', minWidth: '60px' }}>Replicas</span>
                    <span style={{ flex: '1', minWidth: '80px', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
                      {latencyMetric}
                      <Popover bodyContent={latencyLabel}>
                        <OutlinedQuestionCircleIcon style={{ fontSize: '0.75rem', color: 'var(--pf-t--global--text--color--subtle)', cursor: 'pointer' }} />
                      </Popover>
                  </span>
                </div>
            </div>

                {/* Benchmark navigation */}
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6a6e73' }}>
                    {currentDisplayIndex} of {benchmarkCount} <Button variant="link" isInline style={{ fontSize: '0.875rem', padding: 0, textDecoration: 'underline' }} onClick={() => {
                      storeFilterStateForAlert();
                    const params = new URLSearchParams();
                    if (category) params.set("category", category);
                    if (performanceFiltersEnabled) params.set("perfFilter", "true");
                    if (search.trim()) params.set("search", search.trim());
                    if (selectedTasks.length > 0) params.set("tasks", selectedTasks.join(","));
                    if (selectedProviders.length > 0) params.set("providers", selectedProviders.join(","));
                    if (selectedLicenses.length > 0) params.set("licenses", selectedLicenses.join(","));
                    if (selectedLanguages.length > 0) params.set("languages", selectedLanguages.join(","));
                    if (selectedTensorTypes.length > 0) params.set("tensorTypes", selectedTensorTypes.join(","));
                    params.set("workload", workload);
                    params.set("latencyMetric", latencyMetric);
                    params.set("latencyPercentile", latencyPercentile);
                    params.set("latencyValue", latencyValue.toString());
                    params.set("rpsValue", rpsValue.toString());
                    if (hardware.length > 0) params.set("hardware", hardware.join(","));
                      params.set("tab", "performance");
                    navigate(`/ai-assets/models/${model.id}?${params.toString()}`);
                  }}>benchmarks</Button>
                </span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <Button 
                    variant="plain" 
                    style={{ padding: '0.125rem', minWidth: 'auto', height: 'auto' }}
                      onClick={() => handleBenchmarkNavigation(model.id, 'left', benchmarkCount)}
                  >
                    <AngleLeftIcon style={{ fontSize: '0.75rem' }} />
                  </Button>
                  <Button 
                    variant="plain" 
                    style={{ padding: '0.125rem', minWidth: 'auto', height: 'auto' }}
                      onClick={() => handleBenchmarkNavigation(model.id, 'right', benchmarkCount)}
                  >
                    <AngleRightIcon style={{ fontSize: '0.75rem' }} />
                  </Button>
                </div>
              </div>
              </>
            );
          })()}
        </CardBody>
        <CardFooter>
          {/* Labels section - using LabelGroup with numLabels for truncation */}
          <LabelGroup numLabels={2}>
            {/* Task labels */}
            {formattedTasks.map((task, index) => (
              <Label key={`task-${index}`} variant="outline">{task}</Label>
            ))}
            {/* Provider label */}
            <Label variant="outline">{formatProviderLabel(model.provider)}</Label>
            {/* Language labels (if more than just English) */}
            {formattedLanguages.length > 1 || (formattedLanguages.length === 1 && model.language[0] !== 'en') ? (
              formattedLanguages.map((lang, index) => (
                <Label key={`lang-${index}`} variant="outline">{lang}</Label>
              ))
            ) : null}
          </LabelGroup>
        </CardFooter>
      </Card>
    </GalleryItem>
  );
  };

  const content = (
    <>
      {/* Header - Only show when not tab content */}
      {!isTabContent && (
        <div style={{ padding: '1.5rem', paddingBottom: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Title headingLevel="h1" size="2xl" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ background: '#daf2f2', borderRadius: '20px', padding: '4px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MCPCatalogIcon size={32} />
          </div>
          Catalog
        </Title>
        </div>
        <p style={{ color: '#6A6E73', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Discover models provided by Red Hat and other providers that are available for your organization to register, deploy, and customize.
        </p>
      </div>
      )}
      
        <div style={{ display: 'flex', width: '100%' }}>
        {/* Filter Panel - Fixed Width */}
        <div 
          className="catalog-scrollable"
          style={{ 
            borderRight: '1px solid #d2d2d2',
            flex: '0 0 320px',
            overflowY: 'auto',
            height: 'calc(100vh - 150px)',
            position: 'sticky',
            top: 0,
            alignSelf: 'flex-start'
          }}
        >
          {/* Filter Sidebar */}
          <div style={{ padding: '1.5rem 1.5rem 1.5rem 1.5rem' }}>
            {/* Explore model performance card - Always visible */}
            <Card isCompact style={{ marginBottom: '1.5rem' }}>
              <CardBody>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FontAwesomeIcon icon={faChartColumn} style={{ fontSize: '1rem', color: 'var(--pf-t--global--icon--color--status--info--default)' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                      Model performance view
                    </span>
                  </div>
                  <Switch
                    id="performance-filters"
                    isChecked={performanceFiltersEnabled}
                    onChange={(_event, checked) => handleTogglePerformanceFilters(checked)}
                    aria-label="Enable performance filters"
                  />
                </div>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#6b7280', 
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  Enable performance filters, display model benchmark data, and exclude unvalidated models.
                </p>
              </CardBody>
            </Card>

            {/* Filter Sections */}
                  {/* Task Filter */}
                  <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                Task
                  </div>
              <SearchInput
                    placeholder="Search task"
                value={taskSearch}
                onChange={(_event, value) => setTaskSearch(value)}
                onClear={() => setTaskSearch('')}
                style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}
              />
              {getFilteredTasks().map(task => (
                <div key={task} style={{ marginBottom: '0.5rem' }}>
                  <Checkbox
                    id={`task-${task}`}
                        label={formatTaskLabel(task)}
                    isChecked={selectedTasks.includes(task)}
                    onChange={(_event, checked) => handleTaskFilter(task, checked)}
                  />
                </div>
              ))}
              {taskOptions.length > 6 && (
                <Button 
                  variant="link" 
                  isInline 
                  style={{ fontSize: '0.875rem', padding: 0 }}
                  onClick={() => setShowAllTasks(!showAllTasks)}
                >
                  {showAllTasks ? 'Show less' : 'Show more'}
                </Button>
              )}
            </div>

            <Divider style={{ marginBottom: '1rem' }} />

            {/* Provider Filter */}
            <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                Provider
                  </div>
              <SearchInput
                    placeholder="Search provider"
                value={providerSearch}
                onChange={(_event, value) => setProviderSearch(value)}
                onClear={() => setProviderSearch('')}
                style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}
              />
              {getFilteredProviders().map(provider => (
                <div key={provider} style={{ marginBottom: '0.5rem' }}>
                  <Checkbox
                    id={`provider-${provider}`}
                        label={formatProviderLabel(provider)}
                    isChecked={selectedProviders.includes(provider)}
                    onChange={(_event, checked) => handleProviderFilter(provider, checked)}
                  />
                </div>
              ))}
                  {providerOptions.length > FILTER_COLLAPSE_THRESHOLD && (
                    <Button 
                      variant="link" 
                      isInline 
                      style={{ fontSize: '0.875rem', padding: 0 }}
                      onClick={() => setShowAllProviders(!showAllProviders)}
                    >
                      {showAllProviders ? 'Show less' : 'Show more'}
                    </Button>
                  )}
            </div>

            <Divider style={{ marginBottom: '1rem' }} />

            {/* License Filter */}
            <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                License
                  </div>
              <SearchInput
                    placeholder="Search license"
                value={licenseSearch}
                onChange={(_event, value) => setLicenseSearch(value)}
                onClear={() => setLicenseSearch('')}
                style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}
              />
              {getFilteredLicenses().map(license => (
                <div key={license} style={{ marginBottom: '0.5rem' }}>
                  <Checkbox
                    id={`license-${license}`}
                    label={license}
                    isChecked={selectedLicenses.includes(license)}
                    onChange={(_event, checked) => handleLicenseFilter(license, checked)}
                  />
                </div>
              ))}
                  {licenseOptions.length > FILTER_COLLAPSE_THRESHOLD && (
                    <Button 
                      variant="link" 
                      isInline 
                      style={{ fontSize: '0.875rem', padding: 0 }}
                      onClick={() => setShowAllLicenses(!showAllLicenses)}
                    >
                      {showAllLicenses ? 'Show less' : 'Show more'}
                    </Button>
                  )}
            </div>

            <Divider style={{ marginBottom: '1rem' }} />

            {/* Language Filter */}
            <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                Language
                  </div>
              <SearchInput
                    placeholder="Search language"
                value={languageSearch}
                onChange={(_event, value) => setLanguageSearch(value)}
                onClear={() => setLanguageSearch('')}
                style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}
              />
              {getFilteredLanguages().map(language => (
                <div key={language} style={{ marginBottom: '0.5rem' }}>
                  <Checkbox
                    id={`language-${language}`}
                        label={formatLanguageLabel(language)}
                    isChecked={selectedLanguages.includes(language)}
                    onChange={(_event, checked) => handleLanguageFilter(language, checked)}
                  />
                </div>
              ))}
                  {languageOptions.length > FILTER_COLLAPSE_THRESHOLD && (
                    <Button 
                      variant="link" 
                      isInline 
                      style={{ fontSize: '0.875rem', padding: 0 }}
                      onClick={() => setShowAllLanguages(!showAllLanguages)}
                    >
                      {showAllLanguages ? 'Show less' : 'Show more'}
                    </Button>
                  )}
                </div>

                <Divider style={{ marginBottom: '1rem' }} />

            {/* Tensor Type Filter */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                Tensor type
                    </div>
              {tensorTypeOptions.map(tensorType => (
                <div key={tensorType} style={{ marginBottom: '0.5rem' }}>
                      <Checkbox
                    id={`tensorType-${tensorType}`}
                        label={tensorType}
                    isChecked={selectedTensorTypes.includes(tensorType)}
                    onChange={(_event, checked) => handleTensorTypeFilter(tensorType, checked)}
                      />
                    </div>
                  ))}
                </div>
                    </div>
                </div>

        {/* Content Area - Flexible Width */}
        <div 
          className="catalog-scrollable"
          style={{ 
            overflowY: 'auto', 
            overflowX: 'hidden',
            height: 'calc(100vh - 150px)',
            flex: '1 1 0%',
            minWidth: 0
          }}
        >
          {/* Main Content */}
          <div style={{ padding: '1.5rem' }}>
            {/* Search Input - always visible */}
            <div style={{ marginBottom: (!performanceFiltersEnabled && (selectedTasks.length > 0 || selectedProviders.length > 0 || selectedLicenses.length > 0 || selectedLanguages.length > 0 || selectedTensorTypes.length > 0)) ? '0' : '1rem' }}>
              <SearchInput
                placeholder="Filter by name or description"
                value={searchInput}
                onChange={(_event, value) => {
                  setSearchInput(value);
                }}
                onSearch={(_event, value) => {
                  setSearch(value || '');
                }}
                onClear={() => {
                  setSearchInput('');
                  setSearch('');
                }}
                style={{ width: '600px' }}
              />
            </div>

            {/* Filter chips toolbar - when performance toggle is OFF and has filters */}
            {(!performanceFiltersEnabled && (selectedTasks.length > 0 || selectedProviders.length > 0 || selectedLicenses.length > 0 || selectedLanguages.length > 0 || selectedTensorTypes.length > 0)) && (
            <div key="filter-chips-off" style={{ marginTop: '1rem' }}>
              <Toolbar id="search-toolbar">
              {/* First row: All chips */}
              <ToolbarContent>
                <ToolbarGroup variant="filter-group" style={{ flexWrap: 'wrap', rowGap: '0.5rem' }}>
                  {/* Task chips */}
                  {selectedTasks.length > 0 && (
                    <ToolbarItem>
                      <LabelGroup categoryName="Task" isClosable onClick={() => setSelectedTasks([])}>
                        {selectedTasks.map(task => (
                          <Label key={task} onClose={() => handleTaskFilter(task, false)}>{formatTaskLabel(task)}</Label>
                        ))}
                      </LabelGroup>
                    </ToolbarItem>
                  )}
                  {/* Provider chips */}
                  {selectedProviders.length > 0 && (
                    <ToolbarItem>
                      <LabelGroup categoryName="Provider" isClosable onClick={() => setSelectedProviders([])}>
                        {selectedProviders.map(provider => (
                          <Label key={provider} onClose={() => handleProviderFilter(provider, false)}>{formatProviderLabel(provider)}</Label>
                        ))}
                      </LabelGroup>
                    </ToolbarItem>
                  )}
                  {/* License chips */}
                  {selectedLicenses.length > 0 && (
                    <ToolbarItem>
                      <LabelGroup categoryName="License" isClosable onClick={() => setSelectedLicenses([])}>
                        {selectedLicenses.map(license => (
                          <Label key={license} onClose={() => handleLicenseFilter(license, false)}>{license}</Label>
                        ))}
                      </LabelGroup>
                    </ToolbarItem>
                  )}
                  {/* Language chips */}
                  {selectedLanguages.length > 0 && (
                    <ToolbarItem>
                      <LabelGroup categoryName="Language" isClosable onClick={() => setSelectedLanguages([])}>
                        {selectedLanguages.map(lang => (
                          <Label key={lang} onClose={() => handleLanguageFilter(lang, false)}>{formatLanguageLabel(lang)}</Label>
                        ))}
                      </LabelGroup>
                    </ToolbarItem>
                  )}
                  {/* Tensor type chips */}
                  {selectedTensorTypes.length > 0 && (
                    <ToolbarItem>
                      <LabelGroup categoryName="Tensor type" isClosable onClick={() => setSelectedTensorTypes([])}>
                        {selectedTensorTypes.map(tensorType => (
                          <Label key={tensorType} onClose={() => handleTensorTypeFilter(tensorType, false)}>{tensorType}</Label>
                        ))}
                      </LabelGroup>
                    </ToolbarItem>
                  )}
                </ToolbarGroup>
              </ToolbarContent>
              {/* Second row: Reset all filters button */}
              <ToolbarContent>
                <ToolbarItem>
                  <Button variant="link" isInline onClick={() => {
                    setSearch('');
                    setSearchInput('');
                    setSelectedTasks([]);
                    setSelectedProviders([]);
                    setSelectedLicenses([]);
                    setSelectedLanguages([]);
                    setSelectedTensorTypes([]);
                  }}>
                    Reset all filters
                  </Button>
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
            </div>
            )}

            {/* Performance Toolbar - use display instead of conditional rendering to prevent blink */}
            <div style={{ display: performanceFiltersEnabled ? 'block' : 'none', marginTop: '0.5rem' }}>
                <Title headingLevel="h3" size="lg" style={{ marginBottom: '0.5rem' }}>
                  Workload and performance constraints
                </Title>
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
                                onSelect={(_, itemId) => { setWorkload(itemId as any); setIsWorkloadOpen(false); }}
                                selected={workload}
                                style={{ position: 'absolute', top: '100%', left: 0, zIndex: 9999, minWidth: '100%' }}
                              >
                                <MenuContent>
                                  <MenuList>
                                    {WORKLOAD_OPTIONS.map((option) => (
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
                    </ToolbarGroup>
                  </ToolbarContent>
                </Toolbar>
              </div>

            {/* Filter Chips Toolbar - shown below performance toolbar when toggle is ON */}
            <Toolbar 
              id="filter-chips-toolbar"
              style={{ display: performanceFiltersEnabled ? 'block' : 'none' }}
            >
              {/* First row: All chips mixed together */}
              <ToolbarContent>
                <ToolbarGroup variant="filter-group" style={{ flexWrap: 'wrap', rowGap: '0.5rem' }}>
                  {/* Task chips */}
                  {selectedTasks.length > 0 && (
                    <ToolbarItem>
                      <LabelGroup categoryName="Task" isClosable onClick={() => setSelectedTasks([])}>
                {selectedTasks.map(task => (
                          <Label key={task} onClose={() => handleTaskFilter(task, false)}>{formatTaskLabel(task)}</Label>
                        ))}
                      </LabelGroup>
                    </ToolbarItem>
                  )}
                  {/* Provider chips */}
                  {selectedProviders.length > 0 && (
                    <ToolbarItem>
                      <LabelGroup categoryName="Provider" isClosable onClick={() => setSelectedProviders([])}>
                {selectedProviders.map(provider => (
                          <Label key={provider} onClose={() => handleProviderFilter(provider, false)}>{formatProviderLabel(provider)}</Label>
                        ))}
                      </LabelGroup>
                    </ToolbarItem>
                  )}
                  {/* License chips */}
                  {selectedLicenses.length > 0 && (
                    <ToolbarItem>
                      <LabelGroup categoryName="License" isClosable onClick={() => setSelectedLicenses([])}>
                {selectedLicenses.map(license => (
                          <Label key={license} onClose={() => handleLicenseFilter(license, false)}>{license}</Label>
                        ))}
                      </LabelGroup>
                    </ToolbarItem>
                  )}
                  {/* Language chips */}
                  {selectedLanguages.length > 0 && (
                    <ToolbarItem>
                      <LabelGroup categoryName="Language" isClosable onClick={() => setSelectedLanguages([])}>
                        {selectedLanguages.map(lang => (
                          <Label key={lang} onClose={() => handleLanguageFilter(lang, false)}>{formatLanguageLabel(lang)}</Label>
                        ))}
                      </LabelGroup>
                    </ToolbarItem>
                  )}
                  {/* Tensor type chips */}
                  {selectedTensorTypes.length > 0 && (
                    <ToolbarItem>
                      <LabelGroup categoryName="Tensor type" isClosable onClick={() => setSelectedTensorTypes([])}>
                        {selectedTensorTypes.map(tensorType => (
                          <Label key={tensorType} onClose={() => handleTensorTypeFilter(tensorType, false)}>{tensorType}</Label>
                        ))}
                      </LabelGroup>
                    </ToolbarItem>
                  )}
                  {/* Workload Chip with undo icon */}
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
                  {/* Latency Chips with single undo icon */}
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
                        setLatencyMetric(DEFAULT_LATENCY_METRIC);
                        setLatencyPercentile(DEFAULT_LATENCY_PERCENTILE);
                        setLatencyValue(DEFAULT_LATENCY_VALUE);
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
                  {/* Max RPS Chip with undo icon */}
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
              {/* Second row: Reset all filters button */}
              {(selectedTasks.length > 0 || selectedProviders.length > 0 || selectedLicenses.length > 0 || selectedLanguages.length > 0 || selectedTensorTypes.length > 0 ||
                workload !== DEFAULT_WORKLOAD || latencyMetric !== DEFAULT_LATENCY_METRIC || latencyPercentile !== DEFAULT_LATENCY_PERCENTILE || 
                latencyValue !== DEFAULT_LATENCY_VALUE || rpsValue !== DEFAULT_RPS_VALUE || hardware.length > 0) && (
                <ToolbarContent style={{ paddingTop: '0.5rem' }}>
                  <ToolbarItem>
                    <Button variant="link" isInline onClick={() => {
                      setSearch('');
                      setSearchInput('');
                  setSelectedTasks([]);
                  setSelectedProviders([]);
                  setSelectedLicenses([]);
                  setSelectedLanguages([]);
                  setSelectedTensorTypes([]);
                    resetPerformanceFilters();
                }}>
                  Reset all filters
                </Button>
                  </ToolbarItem>
                </ToolbarContent>
            )}
            </Toolbar>

            {/* Category Tabs and Sort in same row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <ToggleGroup 
                aria-label="Model category filter"
              >
                <ToggleGroupItem
                  buttonId="all-models"
                  isSelected={category === null}
                  text="All models"
                  onClick={() => setCategory(null)}
                />
                <ToggleGroupItem
                  buttonId="validated-models"
                  isSelected={category === 'validated'}
                  text="Red Hat AI validated models"
                  onClick={() => setCategory('validated')}
                />
                <ToggleGroupItem
                  buttonId="redhat-models"
                  isSelected={category === 'redhat'}
                  text="Red Hat AI models"
                  onClick={() => setCategory('redhat')}
                />
                <ToggleGroupItem
                  buttonId="community-models"
                  isSelected={category === 'other'}
                  text="Other models"
                  onClick={() => setCategory('other')}
                />
              </ToggleGroup>

              {/* Sort dropdown when performance toggle is ON */}
              {performanceFiltersEnabled && (
                <Select
                  isOpen={isSortOpen}
                  onOpenChange={(isOpen) => setIsSortOpen(isOpen)}
                  toggle={(toggleRef: React.Ref<HTMLButtonElement>) => (
                    <MenuToggle 
                      ref={toggleRef} 
                      variant="plainText"
                      onClick={() => setIsSortOpen(!isSortOpen)}
                      isExpanded={isSortOpen}
                    >
                      Sort: {sortOption === 'latency' 
                        ? 'Latency (Lowest → Highest)'
                        : 'Publish date (Newest → Oldest)'}
                    </MenuToggle>
                  )}
                  selected={sortOption}
                  onSelect={(_, value) => {
                    setSortOption(value as 'latency' | 'updated');
                    setIsSortOpen(false);
                  }}
                  popperProps={{ position: 'right' }}
                >
                  <SelectList>
                    <SelectOption value="latency">Latency (Lowest → Highest)</SelectOption>
                    <SelectOption value="updated">Publish date (Newest → Oldest)</SelectOption>
                  </SelectList>
                </Select>
              )}
            </div>

            {/* Filter Changed Alert */}
            {showFilterChangedAlert && performanceFiltersEnabled && (
              <Alert
                variant="info"
                isInline
                title={`The performance constraints and results have been updated to match the constraints you applied to the ${alertModelName} model details page.`}
                actionClose={
                  <AlertActionCloseButton onClose={() => setShowFilterChangedAlert(false)} />
                }
                style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}
              />
            )}

            {/* Empty States */}
            {(() => {
              const hasFilters = search.trim() !== '' || selectedTasks.length > 0 || 
                selectedProviders.length > 0 || selectedLicenses.length > 0 || 
                selectedLanguages.length > 0 || selectedTensorTypes.length > 0 || (performanceFiltersEnabled && (
                  latencyValue !== DEFAULT_LATENCY_VALUE || rpsValue !== DEFAULT_RPS_VALUE || 
                  hardware.length > 0
                ));
              
              const categoryHasNoBenchmarkedModels = category === 'redhat' || category === 'other';
              const showPerformanceEmpty = performanceFiltersEnabled && categoryHasNoBenchmarkedModels;
              const showStandardEmpty = !showPerformanceEmpty && hasFilters && filteredModels.length === 0;

              // Wrapper component for FontAwesome icon to use with EmptyState
              const ChartColumnIcon: React.FC = () => (
                <FontAwesomeIcon icon={faChartColumn} />
              );

              if (showPerformanceEmpty) {
                // Get the display name for the current category
                // Note: Inside this block, category can only be 'redhat' or 'other' 
                // since showPerformanceEmpty requires categoryHasNoBenchmarkedModels
                const categoryDisplayName = category === 'redhat' 
                  ? 'Red Hat AI models' 
                  : 'Other models';
                
                return (
                  <div style={{ 
                    width: 'calc(100vw - 320px - 240px - 6rem)',
                    display: 'flex',
                    justifyContent: 'center',
                    paddingTop: '3rem'
                  }}>
                    <EmptyState 
                      variant={EmptyStateVariant.lg} 
                      titleText="No models with performance data" 
                      headingLevel="h4" 
                      icon={ChartColumnIcon}
                    >
                    <EmptyStateBody>
                        No models in the {categoryDisplayName} category have performance data. Select another model category, or turn off Model performance view to see models in the selected category.
                      </EmptyStateBody>
                      <EmptyStateFooter>
                        <EmptyStateActions>
                        <Button variant="primary" onClick={() => setCategory(null)}>
                          View all models with performance data
                        </Button>
                        </EmptyStateActions>
                        <EmptyStateActions>
                        <Button variant="link" onClick={() => setPerformanceFiltersEnabled(false)}>
                          Turn off Model performance view
                        </Button>
                        </EmptyStateActions>
                      </EmptyStateFooter>
                  </EmptyState>
                  </div>
                );
              }
              
              if (showStandardEmpty) {
                return (
                  <div style={{ 
                    width: 'calc(100vw - 320px - 240px - 6rem)',
                    display: 'flex',
                    justifyContent: 'center',
                    paddingTop: '3rem'
                  }}>
                    <EmptyState 
                      variant={EmptyStateVariant.lg} 
                      titleText="No results found" 
                      headingLevel="h4" 
                      icon={SearchIcon}
                    >
                    <EmptyStateBody>
                        Adjust your filters and try again.
                      </EmptyStateBody>
                      <EmptyStateFooter>
                        <EmptyStateActions>
                          <Button variant="link" onClick={() => {
                          setSearch('');
                          setSearchInput('');
                          setSelectedTasks([]);
                          setSelectedProviders([]);
                          setSelectedLicenses([]);
                          setSelectedLanguages([]);
                          setSelectedTensorTypes([]);
                          if (performanceFiltersEnabled) {
                            resetPerformanceFilters();
                          }
                        }}>
                          Reset all filters
                        </Button>
                        </EmptyStateActions>
                      </EmptyStateFooter>
                  </EmptyState>
                  </div>
                );
              }
              
              return null;
            })()}

            {/* Models List - Grouped view when no category and no filters, single list otherwise */}
            {shouldShowGroupedView ? (
              <div ref={galleryContainerRef}>
                {/* Red Hat AI validated models section - Dynamic row based on screen width */}
                {getValidatedModels.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title headingLevel="h2" size="lg">
                        Red Hat AI validated models
                      </Title>
                      <Button variant="link" onClick={() => setCategory('validated')}>
                        Show all Red Hat AI validated models →
                      </Button>
                    </div>
                    <p style={{ color: '#6A6E73', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      Third-party models benchmarked for performance and quality by Red Hat using leading open-source evaluation datasets.
                    </p>
                    <Gallery hasGutter minWidths={{ default: '280px' }} maxWidths={{ default: '1fr' }}>
                      {getValidatedModels.slice(0, cardsPerRow).map(model => {
                        const modelCard = getFilteredModels().find(m => m.id === model.id);
                        return modelCard ? renderModelCard(modelCard) : null;
                      })}
                    </Gallery>
                  </div>
                )}

                {/* Red Hat AI models section - Dynamic row based on screen width */}
                {getRedHatModels.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title headingLevel="h2" size="lg">
                        Red Hat AI models
                      </Title>
                      <Button variant="link" onClick={() => setCategory('redhat')}>
                        Show all Red Hat AI models →
                      </Button>
                    </div>
                    <p style={{ color: '#6A6E73', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      Red Hat models with full support and legal indemnification.
                    </p>
                    <Gallery hasGutter minWidths={{ default: '280px' }} maxWidths={{ default: '1fr' }}>
                      {getRedHatModels.slice(0, cardsPerRow).map(model => {
                        const modelCard = getFilteredModels().find(m => m.id === model.id);
                        return modelCard ? renderModelCard(modelCard) : null;
                      })}
                    </Gallery>
                  </div>
                )}

                {/* Other models section - Dynamic row based on screen width */}
                {getCommunityModels.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title headingLevel="h2" size="lg">
                        Other models
                      </Title>
                      <Button variant="link" onClick={() => setCategory('other')}>
                        Show all other models →
                      </Button>
                    </div>
                    <p style={{ color: '#6A6E73', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      Admin-configured and externally sourced models.
                    </p>
                    <Gallery hasGutter minWidths={{ default: '280px' }} maxWidths={{ default: '1fr' }}>
                      {getCommunityModels.slice(0, cardsPerRow).map(model => {
                        const modelCard = getFilteredModels().find(m => m.id === model.id);
                        return modelCard ? renderModelCard(modelCard) : null;
                      })}
                    </Gallery>
                  </div>
                )}
              </div>
            ) : (
              /* Single combined list when category is selected OR when filtering/searching */
              filteredModels.length > 0 && (
                <div style={{ width: '100%' }}>
                <Gallery hasGutter minWidths={{ default: '280px' }} maxWidths={{ default: '1fr' }}>
                    {getFilteredModels().slice(0, visibleCount).map(modelCard => renderModelCard(modelCard))}
                </Gallery>
                  {/* Load more button - only show if there are more models to load */}
                  {visibleCount < filteredModels.length && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                      <Button 
                        variant="tertiary" 
                        size="lg"
                        onClick={() => setVisibleCount(prev => prev + 10)}
                      >
                        Load more models
                      </Button>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
      
      {/* Benchmark Information Modal */}
      <Modal
        variant={ModalVariant.small}
        title="Benchmark Information"
        isOpen={isBenchmarkModalOpen}
        onClose={() => setIsBenchmarkModalOpen(false)}
        style={{ height: '350px' }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          textAlign: 'center'
        }}>
          <p>Benchmark information coming soon</p>
        </div>
      </Modal>

      {/* Feature Not Available Modal */}
      <Modal
        variant={ModalVariant.small}
        isOpen={isFeatureModalOpen}
        onClose={() => setIsFeatureModalOpen(false)}
      >
        <ModalHeader title="Not shown" />
        <ModalBody>
          <p>This interaction is out of scope for this prototype.</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setIsFeatureModalOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Customize Columns Modal */}
      <Modal
        variant={ModalVariant.medium}
        title="Customize columns"
        isOpen={isCustomizeColumnsOpen}
        onClose={() => setIsCustomizeColumnsOpen(false)}
      >
        <ModalHeader>
          <Title headingLevel="h2" size="xl">Customize columns</Title>
        </ModalHeader>
        <ModalBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {(['hardware', 'metadata', 'latency', 'throughput', 'requestProfile'] as const).map(group => {
              const groupColumns = COLUMN_DEFINITIONS.filter(col => col.group === group);
              if (groupColumns.length === 0) return null;
              
              const groupLabel = group === 'requestProfile' ? 'Request Profile' 
                : group === 'throughput' ? 'Throughput' 
                : group;
              
              return (
                <div key={group}>
                  <Title headingLevel="h4" size="md" style={{ marginBottom: '0.75rem', textTransform: 'capitalize' }}>
                    {groupLabel}
                  </Title>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {groupColumns.map(col => (
                      <Checkbox
                        key={col.id}
                        id={col.id}
                        label={col.label}
                        isChecked={isColumnVisible(col.id)}
                        onChange={() => toggleColumn(col.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="link" onClick={restoreDefaults}>
            Restore defaults
          </Button>
          <Button variant="primary" onClick={() => setIsCustomizeColumnsOpen(false)}>
            Apply
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );

  // When used as tab content, return content directly without PageSection wrapper
  if (isTabContent) {
    return (
      <div 
        className="catalog-scrollable"
        style={{ 
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <style>{scrollbarStyles}</style>
        {content}
      </div>
    );
  }

  // When used as standalone page, wrap in PageSection
  return (
    <div 
      className="catalog-scrollable"
      style={{ 
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      <style>{scrollbarStyles}</style>
      <PageSection isFilled style={{ padding: 0, minHeight: '100%' }}>
        {content}
      </PageSection>
    </div>
  );
};

export { ModelCatalog };