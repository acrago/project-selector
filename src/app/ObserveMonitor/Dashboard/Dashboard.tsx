import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Bullseye,
  Button,
  Card,
  CardBody,
  CardTitle,
  Content,
  ContentVariants,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Tab,
  TabTitleText,
  Tabs,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, ThProps, Thead, Tr } from '@patternfly/react-table';
import ReactECharts from 'echarts-for-react';
import { AngleRightIcon, CheckCircleIcon, ClockIcon, ExclamationCircleIcon, ExclamationTriangleIcon, ExternalLinkAltIcon, FilterIcon, OutlinedFolderIcon, SearchIcon, SyncIcon } from '@patternfly/react-icons';
import { useUserProfile } from '@app/utils/UserProfileContext';

// Model deployment table data
const modelDeploymentData = [
  {
    deployment: 'mistral-7b-instruct-v2',
    project: 'KonText PTE',
    runtime: 'vLLM',
    requests: '377962',
    latency: '199.56',
    errorRate: '3.98%',
    hardwareProfile: 'NVIDIA A100 40GB',
    gpu: '50%',
    gpuDetails: '1 allocated, 1 utilized',
    cpu: '67%',
    cpuDetails: '6 cores allocated, 4 cores utilized',
    status: 'Running'
  },
  {
    deployment: 'stable-diffusion-xl-beta',
    project: 'AI Research',
    runtime: 'KServer',
    requests: '377962',
    latency: '199.56',
    errorRate: '3.98%',
    hardwareProfile: 'NVIDIA A100 40GB',
    gpu: '43%',
    gpuDetails: '1 allocated, 0.43 utilized',
    cpu: '43%',
    cpuDetails: '7 cores allocated, 3 cores utilized',
    status: 'Running'
  },
  {
    deployment: 'llama-70b-chat-v4',
    project: 'ML Production',
    runtime: 'Bind',
    requests: '377962',
    latency: '199.56',
    errorRate: '3.98%',
    hardwareProfile: 'NVIDIA A100 80GB',
    gpu: '100%',
    gpuDetails: '2 allocated, 2 utilized',
    cpu: '67%',
    cpuDetails: '6 cores allocated, 4 cores utilized',
    status: 'Scaling'
  },
  {
    deployment: 'mistral-7b-instruct-v2',
    project: 'AI Research',
    runtime: 'vLLM',
    requests: '377962',
    latency: '199.56',
    errorRate: '3.98%',
    hardwareProfile: 'NVIDIA V100 32GB',
    gpu: '100%',
    gpuDetails: '2 allocated, 2 utilized',
    cpu: '86%',
    cpuDetails: '6 cores allocated, 5.15 cores utilized',
    status: 'Failed'
  },
  {
    deployment: 'mistral-7b-instruct-v2',
    project: 'ML Production',
    runtime: 'vLLM',
    requests: '377962',
    latency: '199.56',
    errorRate: '3.98%',
    hardwareProfile: 'NVIDIA V100 32GB',
    gpu: '100%',
    gpuDetails: '2 allocated, 2 utilized',
    cpu: '86%',
    cpuDetails: '6 cores allocated, 5.15 cores utilized',
    status: 'Degraded'
  },
  {
    deployment: 'codellama-34b-instruct',
    project: 'KonText PTE',
    runtime: 'vLLM',
    requests: '156240',
    latency: '245.78',
    errorRate: '2.15%',
    hardwareProfile: 'NVIDIA A100 40GB',
    gpu: '75%',
    gpuDetails: '2 allocated, 1.5 utilized',
    cpu: '55%',
    cpuDetails: '8 cores allocated, 4.4 cores utilized',
    status: 'Running'
  },
  {
    deployment: 'whisper-large-v3',
    project: 'AI Research',
    runtime: 'KServer',
    requests: '89523',
    latency: '156.34',
    errorRate: '1.23%',
    hardwareProfile: 'NVIDIA T4 16GB',
    gpu: '62%',
    gpuDetails: '1 allocated, 0.62 utilized',
    cpu: '48%',
    cpuDetails: '4 cores allocated, 1.92 cores utilized',
    status: 'Running'
  },
  {
    deployment: 'falcon-180b',
    project: 'ML Production',
    runtime: 'vLLM',
    requests: '523641',
    latency: '312.45',
    errorRate: '4.56%',
    hardwareProfile: 'NVIDIA A100 80GB',
    gpu: '95%',
    gpuDetails: '4 allocated, 3.8 utilized',
    cpu: '82%',
    cpuDetails: '16 cores allocated, 13.12 cores utilized',
    status: 'Running'
  }
];

// Line chart data for model metrics - organized by deployment
const modelMetricsData = {
  'mistral-7b-instruct-v2': {
    requestQueue: [
      { x: new Date('2024-10-01T00:00:00'), y: 5 },
      { x: new Date('2024-10-01T04:00:00'), y: 3 },
      { x: new Date('2024-10-01T08:00:00'), y: 2 },
      { x: new Date('2024-10-01T12:00:00'), y: 8 },
      { x: new Date('2024-10-01T16:00:00'), y: 12 },
      { x: new Date('2024-10-01T20:00:00'), y: 10 },
      { x: new Date('2024-10-02T00:00:00'), y: 6 }
    ],
    replicaCount: [
      { x: new Date('2024-10-01T00:00:00'), y: 2 },
      { x: new Date('2024-10-01T04:00:00'), y: 2 },
      { x: new Date('2024-10-01T08:00:00'), y: 1 },
      { x: new Date('2024-10-01T12:00:00'), y: 3 },
      { x: new Date('2024-10-01T16:00:00'), y: 4 },
      { x: new Date('2024-10-01T20:00:00'), y: 3 },
      { x: new Date('2024-10-02T00:00:00'), y: 3 }
    ],
    requestLatency: [
      { x: new Date('2024-10-01T00:00:00'), y: 180 },
      { x: new Date('2024-10-01T04:00:00'), y: 160 },
      { x: new Date('2024-10-01T08:00:00'), y: 140 },
      { x: new Date('2024-10-01T12:00:00'), y: 200 },
      { x: new Date('2024-10-01T16:00:00'), y: 240 },
      { x: new Date('2024-10-01T20:00:00'), y: 220 },
      { x: new Date('2024-10-02T00:00:00'), y: 190 }
    ],
    ttft: [
      { x: new Date('2024-10-01T00:00:00'), y: 250 },
      { x: new Date('2024-10-01T04:00:00'), y: 230 },
      { x: new Date('2024-10-01T08:00:00'), y: 220 },
      { x: new Date('2024-10-01T12:00:00'), y: 260 },
      { x: new Date('2024-10-01T16:00:00'), y: 280 },
      { x: new Date('2024-10-01T20:00:00'), y: 270 },
      { x: new Date('2024-10-02T00:00:00'), y: 245 }
    ],
    tokenGenerationRate: [
      { x: new Date('2024-10-01T00:00:00'), y: 25 },
      { x: new Date('2024-10-01T04:00:00'), y: 27 },
      { x: new Date('2024-10-01T08:00:00'), y: 28 },
      { x: new Date('2024-10-01T12:00:00'), y: 30 },
      { x: new Date('2024-10-01T16:00:00'), y: 32 },
      { x: new Date('2024-10-01T20:00:00'), y: 29 },
      { x: new Date('2024-10-02T00:00:00'), y: 28 }
    ],
    throughput: [
      { x: new Date('2024-10-01T00:00:00'), y: 40 },
      { x: new Date('2024-10-01T04:00:00'), y: 42 },
      { x: new Date('2024-10-01T08:00:00'), y: 45 },
      { x: new Date('2024-10-01T12:00:00'), y: 48 },
      { x: new Date('2024-10-01T16:00:00'), y: 50 },
      { x: new Date('2024-10-01T20:00:00'), y: 47 },
      { x: new Date('2024-10-02T00:00:00'), y: 45 }
    ]
  },
  'stable-diffusion-xl-beta': {
    requestQueue: [
      { x: new Date('2024-10-01T00:00:00'), y: 8 },
      { x: new Date('2024-10-01T04:00:00'), y: 6 },
      { x: new Date('2024-10-01T08:00:00'), y: 4 },
      { x: new Date('2024-10-01T12:00:00'), y: 12 },
      { x: new Date('2024-10-01T16:00:00'), y: 15 },
      { x: new Date('2024-10-01T20:00:00'), y: 13 },
      { x: new Date('2024-10-02T00:00:00'), y: 9 }
    ],
    replicaCount: [
      { x: new Date('2024-10-01T00:00:00'), y: 1 },
      { x: new Date('2024-10-01T04:00:00'), y: 1 },
      { x: new Date('2024-10-01T08:00:00'), y: 1 },
      { x: new Date('2024-10-01T12:00:00'), y: 2 },
      { x: new Date('2024-10-01T16:00:00'), y: 2 },
      { x: new Date('2024-10-01T20:00:00'), y: 2 },
      { x: new Date('2024-10-02T00:00:00'), y: 2 }
    ],
    requestLatency: [
      { x: new Date('2024-10-01T00:00:00'), y: 320 },
      { x: new Date('2024-10-01T04:00:00'), y: 290 },
      { x: new Date('2024-10-01T08:00:00'), y: 280 },
      { x: new Date('2024-10-01T12:00:00'), y: 340 },
      { x: new Date('2024-10-01T16:00:00'), y: 380 },
      { x: new Date('2024-10-01T20:00:00'), y: 365 },
      { x: new Date('2024-10-02T00:00:00'), y: 325 }
    ],
    ttft: [
      { x: new Date('2024-10-01T00:00:00'), y: 450 },
      { x: new Date('2024-10-01T04:00:00'), y: 420 },
      { x: new Date('2024-10-01T08:00:00'), y: 410 },
      { x: new Date('2024-10-01T12:00:00'), y: 480 },
      { x: new Date('2024-10-01T16:00:00'), y: 520 },
      { x: new Date('2024-10-01T20:00:00'), y: 500 },
      { x: new Date('2024-10-02T00:00:00'), y: 460 }
    ],
    tokenGenerationRate: [
      { x: new Date('2024-10-01T00:00:00'), y: 15 },
      { x: new Date('2024-10-01T04:00:00'), y: 16 },
      { x: new Date('2024-10-01T08:00:00'), y: 17 },
      { x: new Date('2024-10-01T12:00:00'), y: 18 },
      { x: new Date('2024-10-01T16:00:00'), y: 19 },
      { x: new Date('2024-10-01T20:00:00'), y: 18 },
      { x: new Date('2024-10-02T00:00:00'), y: 17 }
    ],
    throughput: [
      { x: new Date('2024-10-01T00:00:00'), y: 25 },
      { x: new Date('2024-10-01T04:00:00'), y: 27 },
      { x: new Date('2024-10-01T08:00:00'), y: 28 },
      { x: new Date('2024-10-01T12:00:00'), y: 30 },
      { x: new Date('2024-10-01T16:00:00'), y: 32 },
      { x: new Date('2024-10-01T20:00:00'), y: 30 },
      { x: new Date('2024-10-02T00:00:00'), y: 28 }
    ]
  },
  'llama-70b-chat-v4': {
    requestQueue: [
      { x: new Date('2024-10-01T00:00:00'), y: 3 },
      { x: new Date('2024-10-01T04:00:00'), y: 2 },
      { x: new Date('2024-10-01T08:00:00'), y: 1 },
      { x: new Date('2024-10-01T12:00:00'), y: 6 },
      { x: new Date('2024-10-01T16:00:00'), y: 9 },
      { x: new Date('2024-10-01T20:00:00'), y: 7 },
      { x: new Date('2024-10-02T00:00:00'), y: 4 }
    ],
    replicaCount: [
      { x: new Date('2024-10-01T00:00:00'), y: 3 },
      { x: new Date('2024-10-01T04:00:00'), y: 3 },
      { x: new Date('2024-10-01T08:00:00'), y: 2 },
      { x: new Date('2024-10-01T12:00:00'), y: 4 },
      { x: new Date('2024-10-01T16:00:00'), y: 5 },
      { x: new Date('2024-10-01T20:00:00'), y: 4 },
      { x: new Date('2024-10-02T00:00:00'), y: 4 }
    ],
    requestLatency: [
      { x: new Date('2024-10-01T00:00:00'), y: 140 },
      { x: new Date('2024-10-01T04:00:00'), y: 125 },
      { x: new Date('2024-10-01T08:00:00'), y: 115 },
      { x: new Date('2024-10-01T12:00:00'), y: 165 },
      { x: new Date('2024-10-01T16:00:00'), y: 195 },
      { x: new Date('2024-10-01T20:00:00'), y: 180 },
      { x: new Date('2024-10-02T00:00:00'), y: 155 }
    ],
    ttft: [
      { x: new Date('2024-10-01T00:00:00'), y: 180 },
      { x: new Date('2024-10-01T04:00:00'), y: 170 },
      { x: new Date('2024-10-01T08:00:00'), y: 165 },
      { x: new Date('2024-10-01T12:00:00'), y: 200 },
      { x: new Date('2024-10-01T16:00:00'), y: 220 },
      { x: new Date('2024-10-01T20:00:00'), y: 210 },
      { x: new Date('2024-10-02T00:00:00'), y: 190 }
    ],
    tokenGenerationRate: [
      { x: new Date('2024-10-01T00:00:00'), y: 35 },
      { x: new Date('2024-10-01T04:00:00'), y: 36 },
      { x: new Date('2024-10-01T08:00:00'), y: 37 },
      { x: new Date('2024-10-01T12:00:00'), y: 38 },
      { x: new Date('2024-10-01T16:00:00'), y: 40 },
      { x: new Date('2024-10-01T20:00:00'), y: 39 },
      { x: new Date('2024-10-02T00:00:00'), y: 37 }
    ],
    throughput: [
      { x: new Date('2024-10-01T00:00:00'), y: 55 },
      { x: new Date('2024-10-01T04:00:00'), y: 57 },
      { x: new Date('2024-10-01T08:00:00'), y: 58 },
      { x: new Date('2024-10-01T12:00:00'), y: 60 },
      { x: new Date('2024-10-01T16:00:00'), y: 62 },
      { x: new Date('2024-10-01T20:00:00'), y: 60 },
      { x: new Date('2024-10-02T00:00:00'), y: 58 }
    ]
  }
};

// Type for table sorting
type SortableColumn = 'deployment' | 'project' | 'runtime' | 'requests' | 'latency' | 'errorRate' | 'gpu' | 'cpu' | 'hardwareProfile';

const Dashboard: React.FunctionComponent = () => {
  const { userProfile } = useUserProfile();
  const [selectedTab, setSelectedTab] = React.useState(() => {
    // Initialize based on current profile, default to Cluster if AI Admin
    const saved = localStorage.getItem('userProfile');
    return (saved === 'AI Admin') ? 'Cluster' : 'Models';
  });
  const previousProfileRef = React.useRef(userProfile);
  const isTabChangeRef = React.useRef(false);
  
  // When profile changes (e.g., from dropdown), update the tab accordingly
  useEffect(() => {
    // Only react if profile actually changed and it wasn't from a tab selection
    if (previousProfileRef.current !== userProfile && !isTabChangeRef.current) {
      const previousProfile = previousProfileRef.current;
      previousProfileRef.current = userProfile;
      
      if (userProfile !== 'AI Admin') {
        // Non-AI Admin users can only see Models tab - force switch if on Cluster
        if (selectedTab === 'Cluster') {
          setSelectedTab('Models');
        }
      } else if (userProfile === 'AI Admin' && previousProfile !== 'AI Admin') {
        // When switching to AI Admin, show Cluster tab
        setSelectedTab('Cluster');
      }
    }
    // Reset the flag after processing
    isTabChangeRef.current = false;
  }, [userProfile, selectedTab]);
  
  // Handle tab selection - prevent non-AI Admin users from accessing Cluster tab
  const handleTabSelect = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, eventKey: string | number) => {
    const newTab = eventKey as string;
    // If trying to select Cluster tab but user is not AI Admin, don't allow it
    if (newTab === 'Cluster' && userProfile !== 'AI Admin') {
      return;
    }
    setSelectedTab(newTab);
  };
  
  // Page-level time period filter
  const [pageTimePeriodOpen, setPageTimePeriodOpen] = useState(false);
  const [pageTimePeriod, setPageTimePeriod] = useState('Last 1 hour');
  
  // Time range options
  const timeRangeOptions = ['Last 5 minutes', 'Last 15 minutes', 'Last 30 minutes', 'Last 1 hour', 'Last 3 hours', 'Last 6 hours', 'Last 12 hours', 'Last 24 hours', 'Last 7 days', 'Last 30 days'];
  
  // Refresh handler
  const handleRefresh = () => {
    // Trigger data refresh logic here
    console.log('Refreshing dashboard data...');
    // In a real app, this would refetch data from APIs
  };
  
  // Page-level project filter
  const [pageProjectOpen, setPageProjectOpen] = useState(false);
  const [pageProject, setPageProject] = useState('All projects');
  
  // Project options
  const projectOptions = ['KonText PTE', 'AI Research', 'ML Production'];
  
  // Get unique model deployment names
  const allModelDeployments = useMemo(() => 
    Array.from(new Set(modelDeploymentData.map(m => m.deployment))),
    []
  );
  
  // Category-based filter states
  const [filterCategoryOpen, setFilterCategoryOpen] = useState(false);
  const [activeFilterCategory, setActiveFilterCategory] = useState('Models');
  
  // Card expansion states
  const [isModelDeploymentsExpanded, setIsModelDeploymentsExpanded] = useState(true);
  const [isPerformanceMetricsExpanded, setIsPerformanceMetricsExpanded] = useState(true);
  
  // Toolbar filter states - Project filtering, model filtering, and search
  const [isProjectSelectOpen, setIsProjectSelectOpen] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]); // Empty by default
  const [isModelSelectOpen, setIsModelSelectOpen] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>([]); // Empty by default
  const [searchValue, setSearchValue] = useState('');
  const [modelSearchValue, setModelSearchValue] = useState('');
  const [modelSearchChips, setModelSearchChips] = useState<string[]>([]);
  const [modelFilterSearch, setModelFilterSearch] = useState('');
  
  // Status filter
  const [isStatusSelectOpen, setIsStatusSelectOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  
  // Hardware profile filter
  const [isHardwareSelectOpen, setIsHardwareSelectOpen] = useState(false);
  const [selectedHardwareProfiles, setSelectedHardwareProfiles] = useState<string[]>([]);
  
  // Get unique hardware profiles from data
  const uniqueHardwareProfiles = useMemo(() => 
    Array.from(new Set(modelDeploymentData.map(m => m.hardwareProfile))),
    []
  );
  
  // Table sorting state
  const [activeSortIndex, setActiveSortIndex] = useState<number | null>(null);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handle project filter selection with visual feedback
  const onProjectSelect = (_event: React.MouseEvent | undefined, selection: string | number | undefined) => {
    const value = selection as string;
    setSelectedProjects(prev => 
      prev.includes(value)
        ? prev.filter(p => p !== value)
        : [...prev, value]
    );
  };

  // Track recently changed models for visual feedback
  const [recentlyChangedModels, setRecentlyChangedModels] = useState<Set<string>>(new Set());

  // Handle model filter selection with visual feedback
  const onModelSelect = (_event: React.MouseEvent | undefined, selection: string | number | undefined) => {
    const value = selection as string;
    setSelectedModels(prev => 
      prev.includes(value)
        ? prev.filter(m => m !== value)
        : [...prev, value]
    );
    
    // Add visual feedback for changed item
    setRecentlyChangedModels(new Set([value]));
    setTimeout(() => {
      setRecentlyChangedModels(new Set());
    }, 1000);
  };

  // Status filter handler
  const onStatusSelect = (_event: React.MouseEvent | undefined, selection: string | number | undefined) => {
    const value = selection as string;
    setSelectedStatuses(prev => 
      prev.includes(value)
        ? prev.filter(s => s !== value)
        : [...prev, value]
    );
  };

  // Hardware profile filter handler
  const onHardwareSelect = (_event: React.MouseEvent | undefined, selection: string | number | undefined) => {
    const value = selection as string;
    setSelectedHardwareProfiles(prev => 
      prev.includes(value)
        ? prev.filter(h => h !== value)
        : [...prev, value]
    );
  };

  // Clear all filters (projects, models, search, status, hardware)
  const onClearAllFilters = () => {
    setSelectedProjects([]);
    setSelectedModels([]);
    setSelectedStatuses([]);
    setSelectedHardwareProfiles([]);
    setSearchValue('');
  };

  // Remove individual project chip
  const onDeleteProjectChip = (category: string, chip: string) => {
    setSelectedProjects(prev => prev.filter(p => p !== chip));
  };

  // Remove individual model chip
  const onDeleteModelChip = (category: string, chip: string) => {
    setSelectedModels(prev => prev.filter(m => m !== chip));
  };

  // Remove individual status chip
  const onDeleteStatusChip = (category: string, chip: string) => {
    setSelectedStatuses(prev => prev.filter(s => s !== chip));
  };

  // Remove individual hardware chip
  const onDeleteHardwareChip = (category: string, chip: string) => {
    setSelectedHardwareProfiles(prev => prev.filter(h => h !== chip));
  };

  // Color palette for model series using ECharts default palette
  const getModelColor = (index: number) => {
    const colors = [
      '#5470c6', // Blue
      '#91cc75', // Green
      '#fac858', // Yellow
      '#ee6666', // Red
      '#73c0de', // Light Blue
      '#3ba272', // Dark Green
      '#fc8452', // Orange
      '#9a60b4', // Purple
      '#ea7ccc', // Pink
    ];
    return colors[index % colors.length];
  };

  // Filter table data by page-level project, tab-level filters, and search query
  const filteredTableData = useMemo(() => {
    return modelDeploymentData.filter(model => {
      // Page-level project filter (applies to both tabs)
      const matchesPageProject = pageProject === 'All projects' || model.project === pageProject;
      
      // Tab-level category filters
      const matchesProject = selectedProjects.length === 0 || selectedProjects.includes(model.project);
      const matchesModel = selectedModels.length === 0 || selectedModels.includes(model.deployment);
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(model.status);
      const matchesHardware = selectedHardwareProfiles.length === 0 || selectedHardwareProfiles.includes(model.hardwareProfile);
      const matchesSearch = searchValue === '' || 
        model.deployment.toLowerCase().includes(searchValue.toLowerCase()) ||
        model.runtime.toLowerCase().includes(searchValue.toLowerCase()) ||
        model.hardwareProfile.toLowerCase().includes(searchValue.toLowerCase());
      
      return matchesPageProject && matchesProject && matchesModel && matchesStatus && matchesHardware && matchesSearch;
    });
  }, [pageProject, selectedProjects, selectedModels, selectedStatuses, selectedHardwareProfiles, searchValue]);

  // Sort the filtered model data
  const sortedModelData = useMemo(() => {
    if (activeSortIndex === null) return filteredTableData;

    const sortedData = [...filteredTableData];
    const columnMap: SortableColumn[] = ['deployment', 'project', 'runtime', 'requests', 'latency', 'errorRate', 'hardwareProfile', 'gpu', 'cpu'];
    const sortKey = columnMap[activeSortIndex - 1]; // -1 because first column is checkbox

    sortedData.sort((a, b) => {
      let aValue: any = a[sortKey];
      let bValue: any = b[sortKey];

      // Handle numeric values (remove commas and parse)
      if (sortKey === 'requests') {
        aValue = parseInt(aValue.replace(/,/g, ''));
        bValue = parseInt(bValue.replace(/,/g, ''));
      } else if (sortKey === 'latency') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (sortKey === 'errorRate' || sortKey === 'gpu' || sortKey === 'cpu') {
        aValue = parseFloat(aValue.replace('%', ''));
        bValue = parseFloat(bValue.replace('%', ''));
      }

      if (typeof aValue === 'string') {
        return activeSortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return activeSortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sortedData;
  }, [filteredTableData, activeSortIndex, activeSortDirection]);



  // Helper function for sort
  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex || 0,
      direction: activeSortDirection,
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  // Generate series data for charts - one series per filtered model (unique deployments)
  const uniqueFilteredModels = useMemo(() => 
    Array.from(new Set(filteredTableData.map(m => m.deployment))),
    [filteredTableData]
  );

  const filteredRequestQueueData = useMemo(() => {
    return uniqueFilteredModels.map((deployment, index) => ({
      name: deployment,
      data: modelMetricsData[deployment]?.requestQueue.map(point => [point.x.getTime(), point.y]) || [],
      color: getModelColor(index)
    }));
  }, [uniqueFilteredModels]);

  const filteredReplicaCountData = useMemo(() => {
    return uniqueFilteredModels.map((deployment, index) => ({
      name: deployment,
      data: modelMetricsData[deployment]?.replicaCount.map(point => [point.x.getTime(), point.y]) || [],
      color: getModelColor(index)
    }));
  }, [uniqueFilteredModels]);

  const filteredRequestLatencyData = useMemo(() => {
    return uniqueFilteredModels.map((deployment, index) => ({
      name: deployment,
      data: modelMetricsData[deployment]?.requestLatency.map(point => [point.x.getTime(), point.y]) || [],
      color: getModelColor(index)
    }));
  }, [uniqueFilteredModels]);

  const filteredTTFTData = useMemo(() => {
    return uniqueFilteredModels.map((deployment, index) => ({
      name: deployment,
      data: modelMetricsData[deployment]?.ttft?.map(point => [point.x.getTime(), point.y]) || [],
      color: getModelColor(index)
    }));
  }, [uniqueFilteredModels]);

  const filteredTokenGenerationRateData = useMemo(() => {
    return uniqueFilteredModels.map((deployment, index) => ({
      name: deployment,
      data: modelMetricsData[deployment]?.tokenGenerationRate?.map(point => [point.x.getTime(), point.y]) || [],
      color: getModelColor(index)
    }));
  }, [uniqueFilteredModels]);

  const filteredThroughputData = useMemo(() => {
    return uniqueFilteredModels.map((deployment, index) => ({
      name: deployment,
      data: modelMetricsData[deployment]?.throughput?.map(point => [point.x.getTime(), point.y]) || [],
      color: getModelColor(index)
    }));
  }, [uniqueFilteredModels]);

  const getStatusBadge = (status: string) => {
    const baseStyle = {
      borderRadius: '16px',
      padding: '2px 8px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px',
      fontWeight: '500',
      minHeight: '20px'
    };

    switch (status) {
      case 'Running':
        return (
          <span style={{ 
            ...baseStyle, 
            backgroundColor: '#3ba272', 
            color: '#ffffff',
            border: '1px solid #3ba272'
          }}>
            <CheckCircleIcon size={16} />
            Running
          </span>
        );
      case 'Scaling':
        return (
          <span style={{ 
            ...baseStyle, 
            backgroundColor: '#fac858', 
            color: '#000000',
            border: '1px solid #fac858'
          }}>
            <ExclamationTriangleIcon size={16} />
            Scaling
          </span>
        );
      case 'Failed':
        return (
          <span style={{ 
            ...baseStyle, 
            backgroundColor: '#ee6666', 
            color: '#ffffff',
            border: '1px solid #ee6666'
          }}>
            <ExclamationCircleIcon size={16} />
            Failed
          </span>
        );
      case 'Degraded':
        return (
          <span style={{ 
            ...baseStyle, 
            backgroundColor: '#ee6666', 
            color: '#ffffff',
            border: '1px solid #ee6666'
          }}>
            <ExclamationCircleIcon size={16} />
            Degraded
          </span>
        );
      default:
        return (
          <span style={{ 
            ...baseStyle, 
            backgroundColor: '#6a7985', 
            color: '#ffffff',
            border: '1px solid #6a7985'
          }}>
            {status}
          </span>
        );
    }
  };


  return (
    <PageSection>
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
        {/* Page Header */}
        <FlexItem>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
            <FlexItem>
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
            <FlexItem>
              <Title headingLevel="h1" size="2xl">Dashboard</Title>
            </FlexItem>
                <FlexItem>
              <Content component={ContentVariants.p}>
            Monitor the health and performance of your AI workloads and infrastructure
              </Content>
            </FlexItem>
              </Flex>
            </FlexItem>
            <FlexItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <Dropdown
                    onSelect={(_e, itemId) => {
                      setPageTimePeriodOpen(false);
                      const selected = typeof itemId === 'string' ? itemId : '';
                      setPageTimePeriod(selected || 'Last 1 hour');
                    }}
                    isOpen={pageTimePeriodOpen}
                    onOpenChange={(isOpen: boolean) => setPageTimePeriodOpen(isOpen)}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => setPageTimePeriodOpen(!pageTimePeriodOpen)}
                        isExpanded={pageTimePeriodOpen}
                        id="time-range-toggle"
                        icon={<ClockIcon />}
                        style={{ minWidth: '180px' }}
                      >
                        {pageTimePeriod}
                      </MenuToggle>
                    )}
                  >
                    <DropdownList id="time-range-dropdown-list">
                      {timeRangeOptions.map((option, index) => (
                        <DropdownItem key={index} itemId={option} id={`time-range-option-${index}`}>
                          {option}
                        </DropdownItem>
                      ))}
                    </DropdownList>
                  </Dropdown>
            </FlexItem>
                <FlexItem>
                  <Tooltip content="Refresh dashboard">
                    <Button
                      variant="plain"
                      aria-label="Refresh dashboard"
                      onClick={handleRefresh}
                      icon={<SyncIcon />}
                      id="refresh-button"
                    />
                  </Tooltip>
                </FlexItem>
              </Flex>
                </FlexItem>
                      </Flex>
                </FlexItem>

        {/* PAGE-LEVEL PROJECT FILTER - Affects both tabs */}
        <FlexItem>
          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }}>
            <FlexItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <OutlinedFolderIcon />
                </FlexItem>
                <FlexItem>
                  <Content component={ContentVariants.p} className="pf-v6-u-font-weight-bold">
                    Project
                  </Content>
                </FlexItem>
                      </Flex>
                </FlexItem>
            
            <FlexItem>
              <Dropdown
                onSelect={(_e, itemId) => {
                  setPageProjectOpen(false);
                  const selected = typeof itemId === 'string' ? itemId : '';
                  setPageProject(selected || 'All projects');
                }}
                isOpen={pageProjectOpen}
                onOpenChange={(isOpen: boolean) => setPageProjectOpen(isOpen)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setPageProjectOpen(!pageProjectOpen)}
                    isExpanded={pageProjectOpen}
                    id="page-project-toggle"
                    style={{ minWidth: '200px' }}
                  >
                    {pageProject}
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem value="All projects" key="all" id="project-all">
                    All projects
                  </DropdownItem>
                  <Divider component="li" />
                  {projectOptions.map((project) => (
                    <DropdownItem value={project} key={project}>
                      {project}
                    </DropdownItem>
                  ))}
                </DropdownList>
              </Dropdown>
                </FlexItem>

            <FlexItem>
              <Button 
                variant="link" 
                id="go-to-projects-link"
              >
                Go to <OutlinedFolderIcon /> Projects
              </Button>
                </FlexItem>
                      </Flex>
        </FlexItem>

            {/* Tab Navigation */}
            <FlexItem>
              <Tabs
                activeKey={selectedTab}
            onSelect={handleTabSelect}
                aria-label="Dashboard view tabs"
              >
            {userProfile === 'AI Admin' && (
                <Tab
                  eventKey="Cluster"
                  title={<TabTitleText>Cluster</TabTitleText>}
                  aria-label="Cluster tab"
                />
            )}
            {(userProfile === 'AI Admin' || userProfile === 'AI Engineer' || userProfile === 'Data Scientist') && (
                <Tab
                  eventKey="Models"
                  title={<TabTitleText>Models</TabTitleText>}
                  aria-label="Models tab"
                />
            )}
              </Tabs>
            </FlexItem>

        {/* Tab Content - Cluster */}
        {selectedTab === 'Cluster' && (
          <>
            {/* Overview section header */}
          <FlexItem>
              <Title headingLevel="h2" size="xl">Overview</Title>
              <Content component={ContentVariants.p} className="pf-v6-u-color-200 pf-v6-u-mt-sm">
                Key cluster metrics and health indicators at a glance
              </Content>
            </FlexItem>

            {/* Overview metrics - Combined Card */}
            <FlexItem>
              <Card isCompact id="overview-metrics-card">
              <CardBody>
                  <Flex>
                    {/* System Health */}
                    <FlexItem flex={{ default: 'flex_1' }}>
                      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                          <Title headingLevel="h3" size="md">System health</Title>
                  </FlexItem>
                        <FlexItem>
                          <Title headingLevel="h4" size="xl">100%</Title>
                        </FlexItem>
                      <FlexItem>
                          <Content component={ContentVariants.small} className="pf-v6-u-color-200">
                            3/3 nodes healthy
                          </Content>
                      </FlexItem>
                      <FlexItem>
                          <Label color="green" icon={<CheckCircleIcon />} id="system-health-status-label">
                            Healthy
                          </Label>
                      </FlexItem>
                        <FlexItem>
                          <Button 
                            variant="link" 
                            isInline 
                            component="a"
                            href="#"
                            target="_blank"
                            icon={<ExternalLinkAltIcon />}
                            iconPosition="right"
                            id="view-in-openshift-link"
                            className="pf-v6-u-p-0"
                          >
                            View in OpenShift
                          </Button>
                      </FlexItem>
                    </Flex>
                    </FlexItem>

                    <Divider orientation={{ default: 'vertical' }} />

                    {/* Active Models */}
                    <FlexItem flex={{ default: 'flex_1' }}>
                      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem>
                          <Title headingLevel="h3" size="md">Active models</Title>
                      </FlexItem>
                      <FlexItem>
                          <Title headingLevel="h4" size="xl">4</Title>
                      </FlexItem>
                        <FlexItem>
                          <Content component={ContentVariants.small} className="pf-v6-u-color-200">
                            Models currently deployed
                          </Content>
                        </FlexItem>
                          </Flex>
                        </FlexItem>

                    <Divider orientation={{ default: 'vertical' }} />

                    {/* GPU Utilization */}
                    <FlexItem flex={{ default: 'flex_1' }}>
                      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem>
                          <Title headingLevel="h3" size="md">GPU utilization</Title>
                      </FlexItem>
                      <FlexItem>
                          <Title headingLevel="h4" size="xl">100%</Title>
                        </FlexItem>
                        <FlexItem>
                          <Content component={ContentVariants.small} className="pf-v6-u-color-200">
                            24 of 24 GPUs utilized
                          </Content>
                        </FlexItem>
                        <FlexItem>
                          <Button 
                            variant="link" 
                            isInline
                            id="gpu-view-details-link"
                            className="pf-v6-u-p-0"
                          >
                            View details
                          </Button>
                      </FlexItem>
                    </Flex>
            </FlexItem>

                    <Divider orientation={{ default: 'vertical' }} />

                    {/* Success Rate */}
                    <FlexItem flex={{ default: 'flex_1' }}>
                      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem>
                          <Title headingLevel="h3" size="md">Success rate</Title>
                        </FlexItem>
                    <FlexItem>
                          <Title headingLevel="h4" size="xl">99.2%</Title>
                      </FlexItem>
                      <FlexItem>
                          <Content component={ContentVariants.small} className="pf-v6-u-color-200">
                            Request success rate
                          </Content>
                        </FlexItem>
                          </Flex>
                    </FlexItem>
                        </Flex>
                </CardBody>
              </Card>
            </FlexItem>

            {/* Divider */}
            <Divider />

            {/* Cluster-wide Utilizations */}
            <FlexItem>
              <Title headingLevel="h3" size="lg">Cluster-wide Utilizations</Title>
              <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)', marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                Monitor total cluster capacity and current usage across all resources
              </Content>
            </FlexItem>
            <FlexItem>
              <Card>
                <CardBody>
                  <Grid hasGutter>
                    {/* First row: GPU and Memory */}
                    <GridItem span={12} md={6}>
                      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                        <FlexItem>
                          <Content component={ContentVariants.small} className="pf-v6-u-font-weight-bold">GPU</Content>
                        </FlexItem>
                        <FlexItem>
                          <Content component={ContentVariants.p} style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>77% available of 80 GPUs</Content>
                        </FlexItem>
                        <FlexItem>
                          <ReactECharts
                            option={{
                              tooltip: {
                                trigger: 'axis'
                              },
                              xAxis: {
                                type: 'category',
                                data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00'],
                                boundaryGap: false
                              },
                              yAxis: {
                                type: 'value',
                                min: 0,
                                max: 100,
                                axisLabel: {
                                  formatter: '{value}%'
                                }
                              },
                              series: [{
                                data: [65, 70, 55, 60, 75, 68],
                                type: 'line',
                                smooth: true,
                                areaStyle: {
                                  opacity: 0.3
                                },
                                itemStyle: {
                                  color: '#5470c6'
                                },
                                lineStyle: {
                                  width: 2
                                }
                              }],
                              grid: {
                                left: '10%',
                                right: '5%',
                                bottom: '15%',
                                top: '10%'
                              }
                            }}
                            style={{ height: '180px', width: '100%' }}
                          />
                      </FlexItem>
                    </Flex>
                  </GridItem>
                    <GridItem span={12} md={6}>
                      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem>
                          <Content component={ContentVariants.small} className="pf-v6-u-font-weight-bold">Memory</Content>
                      </FlexItem>
                      <FlexItem>
                          <Content component={ContentVariants.p} style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>2,048 GB available of 3,677 GB</Content>
                        </FlexItem>
                        <FlexItem>
                          <ReactECharts
                            option={{
                              tooltip: {
                                trigger: 'axis'
                              },
                              xAxis: {
                                type: 'category',
                                data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00'],
                                boundaryGap: false
                              },
                              yAxis: {
                                type: 'value',
                                min: 0,
                                max: 80,
                                axisLabel: {
                                  formatter: '{value}%'
                                }
                              },
                              series: [{
                                data: [45, 50, 40, 42, 55, 48],
                                type: 'line',
                                smooth: true,
                                areaStyle: {
                                  opacity: 0.3
                                },
                                itemStyle: {
                                  color: '#5470c6'
                                },
                                lineStyle: {
                                  width: 2
                                }
                              }],
                              grid: {
                                left: '10%',
                                right: '5%',
                                bottom: '15%',
                                top: '10%'
                              }
                            }}
                            style={{ height: '180px', width: '100%' }}
                          />
                      </FlexItem>
                    </Flex>
                  </GridItem>
                    {/* Second row: CPU and Network */}
                    <GridItem span={12} md={6}>
                      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem>
                          <Content component={ContentVariants.small} className="pf-v6-u-font-weight-bold">CPU</Content>
                      </FlexItem>
                      <FlexItem>
                          <Content component={ContentVariants.p} style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>71% available of 80 cores</Content>
                        </FlexItem>
                        <FlexItem>
                          <ReactECharts
                            option={{
                              tooltip: {
                                trigger: 'axis'
                              },
                              xAxis: {
                                type: 'category',
                                data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00'],
                                boundaryGap: false
                              },
                              yAxis: {
                                type: 'value',
                                min: 0,
                                max: 100,
                                axisLabel: {
                                  formatter: '{value}%'
                                }
                              },
                              series: [{
                                data: [60, 65, 55, 58, 70, 62],
                                type: 'line',
                                smooth: true,
                                areaStyle: {
                                  opacity: 0.3
                                },
                                itemStyle: {
                                  color: '#5470c6'
                                },
                                lineStyle: {
                                  width: 2
                                }
                              }],
                              grid: {
                                left: '10%',
                                right: '5%',
                                bottom: '15%',
                                top: '10%'
                              }
                            }}
                            style={{ height: '180px', width: '100%' }}
                          />
                        </FlexItem>
                          </Flex>
                    </GridItem>
                    <GridItem span={12} md={6}>
                      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                        <FlexItem>
                          <Content component={ContentVariants.small} className="pf-v6-u-font-weight-bold">Network</Content>
                        </FlexItem>
                        <FlexItem>
                          <Content component={ContentVariants.p} style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>3.8 Mbps In</Content>
                        </FlexItem>
                        <FlexItem>
                          <ReactECharts
                            option={{
                              tooltip: {
                                trigger: 'axis'
                              },
                              xAxis: {
                                type: 'category',
                                data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00'],
                                boundaryGap: false
                              },
                              yAxis: {
                                type: 'value',
                                min: 0,
                                max: 30,
                                axisLabel: {
                                  formatter: '{value}'
                                }
                              },
                              series: [{
                                data: [15, 20, 12, 18, 25, 16],
                                type: 'line',
                                smooth: true,
                                areaStyle: {
                                  opacity: 0.3
                                },
                                itemStyle: {
                                  color: '#5470c6'
                                },
                                lineStyle: {
                                  width: 2
                                }
                              }],
                              grid: {
                                left: '10%',
                                right: '5%',
                                bottom: '15%',
                                top: '10%'
                              }
                            }}
                            style={{ height: '180px', width: '100%' }}
                          />
                      </FlexItem>
                    </Flex>
                  </GridItem>
                  </Grid>
                </CardBody>
              </Card>
            </FlexItem>

            {/* Divider */}
            <Divider />

            {/* Resource Usage by Project */}
                      <FlexItem>
              <Title headingLevel="h3" size="lg">Resource Usage by Project</Title>
              <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)', marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                Compare resource consumption across different projects over time
              </Content>
            </FlexItem>
          <FlexItem>
              <Card id="project-resource-breakdown-card">
                <CardBody>
                  <Grid hasGutter>
                    {/* GPU Usage */}
                    <GridItem span={12} md={6} lg={4}>
                      <Card isCompact isFullHeight id="project-gpu-usage-card">
                <CardTitle>
                          <Title headingLevel="h4" size="md">GPU Usage</Title>
                </CardTitle>
                <CardBody>
                          <div style={{ height: '280px', width: '100%' }}>
                            <ReactECharts
                              option={{
                                tooltip: {
                                  trigger: 'axis',
                                  axisPointer: {
                                    type: 'cross',
                                    label: {
                                      backgroundColor: '#6a7985'
                                    }
                                  }
                                },
                                legend: {
                                  data: ['KonText PTE', 'AI Research', 'ML Production'],
                                  bottom: 0
                                },
                                grid: {
                                  left: '5%',
                                  right: '5%',
                                  bottom: '15%',
                                  top: '5%',
                                  containLabel: true
                                },
                                xAxis: {
                                  type: 'category',
                                  boundaryGap: false,
                                  data: ['12AM', '2AM', '4AM', '6AM', '8AM', '10AM']
                                },
                                yAxis: {
                                  type: 'value',
                                  axisLabel: {
                                    formatter: '{value}%'
                                  }
                                },
                                series: [
                                  {
                                    name: 'KonText PTE',
                                    type: 'line',
                                    smooth: true,
                                    lineStyle: { width: 2 },
                                    areaStyle: { opacity: 0.5 },
                                    data: [48, 50, 45, 52, 55, 50]
                                  },
                                  {
                                    name: 'AI Research',
                                    type: 'line',
                                    smooth: true,
                                    lineStyle: { width: 2 },
                                    areaStyle: { opacity: 0.5 },
                                    data: [30, 32, 28, 33, 35, 31]
                                  },
                                  {
                                    name: 'ML Production',
                                    type: 'line',
                                    smooth: true,
                                    lineStyle: { width: 2 },
                                    areaStyle: { opacity: 0.5 },
                                    data: [15, 16, 13, 17, 18, 16]
                                  }
                                ]
                              }}
                              style={{ height: '100%', width: '100%' }}
                            />
                          </div>
                        </CardBody>
                      </Card>
                        </GridItem>

                    {/* CPU Usage */}
                    <GridItem span={12} md={6} lg={4}>
                      <Card isCompact isFullHeight id="project-cpu-usage-card">
                        <CardTitle>
                          <Title headingLevel="h4" size="md">CPU Usage</Title>
                        </CardTitle>
                        <CardBody>
                          <div style={{ height: '280px', width: '100%' }}>
                            <ReactECharts
                              option={{
                                tooltip: {
                                  trigger: 'axis',
                                  axisPointer: {
                                    type: 'cross',
                                    label: {
                                      backgroundColor: '#6a7985'
                                    }
                                  }
                                },
                                legend: {
                                  data: ['KonText PTE', 'AI Research', 'ML Production'],
                                  bottom: 0
                                },
                                grid: {
                                  left: '5%',
                                  right: '5%',
                                  bottom: '15%',
                                  top: '5%',
                                  containLabel: true
                                },
                                xAxis: {
                                  type: 'category',
                                  boundaryGap: false,
                                  data: ['12AM', '2AM', '4AM', '6AM', '8AM', '10AM']
                                },
                                yAxis: {
                                  type: 'value',
                                  axisLabel: {
                                    formatter: '{value}%'
                                  }
                                },
                                series: [
                                  {
                                    name: 'KonText PTE',
                                    type: 'line',
                                    smooth: true,
                                    lineStyle: { width: 2 },
                                    areaStyle: { opacity: 0.5 },
                                    data: [54, 56, 52, 58, 60, 56]
                                  },
                                  {
                                    name: 'AI Research',
                                    type: 'line',
                                    smooth: true,
                                    lineStyle: { width: 2 },
                                    areaStyle: { opacity: 0.5 },
                                    data: [28, 31, 27, 30, 33, 29]
                                  },
                                  {
                                    name: 'ML Production',
                                    type: 'line',
                                    smooth: true,
                                    lineStyle: { width: 2 },
                                    areaStyle: { opacity: 0.5 },
                                    data: [12, 13, 11, 14, 15, 13]
                                  }
                                ]
                              }}
                              style={{ height: '100%', width: '100%' }}
                            />
                          </div>
                        </CardBody>
                      </Card>
                        </GridItem>

                    {/* Memory Usage */}
                    <GridItem span={12} md={6} lg={4}>
                      <Card isCompact isFullHeight id="project-memory-usage-card">
                        <CardTitle>
                          <Title headingLevel="h4" size="md">Memory Usage</Title>
                        </CardTitle>
                        <CardBody>
                          <div style={{ height: '280px', width: '100%' }}>
                            <ReactECharts
                              option={{
                                tooltip: {
                                  trigger: 'axis',
                                  axisPointer: {
                                    type: 'cross',
                                    label: {
                                      backgroundColor: '#6a7985'
                                    }
                                  }
                                },
                                legend: {
                                  data: ['KonText PTE', 'AI Research', 'ML Production'],
                                  bottom: 0
                                },
                                grid: {
                                  left: '5%',
                                  right: '5%',
                                  bottom: '15%',
                                  top: '5%',
                                  containLabel: true
                                },
                                xAxis: {
                                  type: 'category',
                                  boundaryGap: false,
                                  data: ['12AM', '2AM', '4AM', '6AM', '8AM', '10AM']
                                },
                                yAxis: {
                                  type: 'value',
                                  axisLabel: {
                                    formatter: '{value}%'
                                  }
                                },
                                series: [
                                  {
                                    name: 'KonText PTE',
                                    type: 'line',
                                    smooth: true,
                                    lineStyle: { width: 2 },
                                    areaStyle: { opacity: 0.5 },
                                    data: [46, 50, 44, 48, 52, 50]
                                  },
                                  {
                                    name: 'AI Research',
                                    type: 'line',
                                    smooth: true,
                                    lineStyle: { width: 2 },
                                    areaStyle: { opacity: 0.5 },
                                    data: [31, 33, 30, 32, 35, 33]
                                  },
                                  {
                                    name: 'ML Production',
                                    type: 'line',
                                    smooth: true,
                                    lineStyle: { width: 2 },
                                    areaStyle: { opacity: 0.5 },
                                    data: [16, 17, 14, 16, 18, 17]
                                  }
                                ]
                              }}
                              style={{ height: '100%', width: '100%' }}
                            />
                          </div>
                        </CardBody>
                      </Card>
                        </GridItem>
                      </Grid>
                </CardBody>
              </Card>
                      </FlexItem>

            {/* Divider */}
            <Divider />

            {/* Cluster Details */}
                      <FlexItem>
              <Title headingLevel="h3" size="lg">Cluster Details</Title>
              <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle)', marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                View technical configuration and infrastructure details
              </Content>
            </FlexItem>
                        <FlexItem>
              <Grid hasGutter>
                <GridItem span={12} md={6}>
                  <Card isFullHeight id="cluster-details-card">
                    <CardBody>
                      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
                        <FlexItem>
                          <Flex direction={{ default: 'column' }}>
                            <Content component={ContentVariants.small} className="pf-v6-u-font-weight-bold">Provider</Content>
                            <Content component={ContentVariants.small}>AWS</Content>
                        </Flex>
                      </FlexItem>
                        <FlexItem>
                          <Flex direction={{ default: 'column' }}>
                            <Content component={ContentVariants.small} className="pf-v6-u-font-weight-bold">OpenShift version</Content>
                            <Content component={ContentVariants.small}>2.24.0</Content>
                    </Flex>
                        </FlexItem>
                      <FlexItem>
                          <Flex direction={{ default: 'column' }}>
                            <Content component={ContentVariants.small} className="pf-v6-u-font-weight-bold">Channel</Content>
                            <Content component={ContentVariants.small}>fast</Content>
                          </Flex>
                      </FlexItem>
                      <FlexItem>
                          <Flex direction={{ default: 'column' }}>
                            <Content component={ContentVariants.small} className="pf-v6-u-font-weight-bold">API server</Content>
                            <Content component={ContentVariants.small} className="pf-v6-u-font-family-monospace">
                              https://api.cluster-z84h8.z84h8.sandbox.opentic.com
                            </Content>
                          </Flex>
                        </FlexItem>
                        <FlexItem>
                          <Button 
                            variant="link" 
                            isInline
                            component="a"
                            href="#"
                            target="_blank"
                            icon={<ExternalLinkAltIcon />}
                            iconPosition="right"
                            id="view-settings-link"
                          >
                            View settings
                          </Button>
                      </FlexItem>
                    </Flex>
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>
          </FlexItem>
          </>
        )}

        {/* Tab Content - Models */}
        {selectedTab === 'Models' && (
          <>
            {/* Page-Level Filters with Category Selector Pattern - ABOVE title */}
            <FlexItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }}>
                
                {/* LEFT: Category Selector Dropdown */}
                    <FlexItem>
                  <Dropdown
                    isOpen={filterCategoryOpen}
                    onSelect={(_event, value) => {
                      setActiveFilterCategory(value as string);
                      setFilterCategoryOpen(false);
                    }}
                    onOpenChange={(isOpen) => setFilterCategoryOpen(isOpen)}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => setFilterCategoryOpen(!filterCategoryOpen)}
                        isExpanded={filterCategoryOpen}
                        icon={<FilterIcon />}
                        id="filter-category-toggle"
                      >
                        {activeFilterCategory}
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem value="Models" key="models" id="category-models">
                        Models
                      </DropdownItem>
                      <DropdownItem value="Project" key="project" id="category-project">
                        Project
                      </DropdownItem>
                      <DropdownItem value="Hardware profile" key="hardware" id="category-hardware">
                        Hardware profile
                      </DropdownItem>
                      <DropdownItem value="Status" key="status" id="category-status">
                        Status
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </FlexItem>

                {/* RIGHT: Filter Options based on Selected Category - White with border */}
                <FlexItem flex={{ default: 'flex_1' }}>
                  
                  {/* Project Filter */}
                  {activeFilterCategory === 'Project' && (
                    <Select
                      isOpen={isProjectSelectOpen}
                      selected={selectedProjects}
                      onSelect={onProjectSelect}
                      onOpenChange={(isOpen) => setIsProjectSelectOpen(isOpen)}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setIsProjectSelectOpen(!isProjectSelectOpen)}
                          isExpanded={isProjectSelectOpen}
                          id="project-filter-toggle"
                        >
                          {selectedProjects.length > 0 ? (
                            <Badge isRead id="projects-filter-count-badge">{selectedProjects.length}</Badge>
                          ) : (
                            'Filter by project'
                          )}
                        </MenuToggle>
                      )}
                    >
                      <SelectList>
                        {projectOptions.map((project) => (
                          <SelectOption
                            key={project}
                            value={project}
                            hasCheckbox
                            isSelected={selectedProjects.includes(project)}
                          >
                            {project}
                          </SelectOption>
                        ))}
                      </SelectList>
                    </Select>
                  )}

                  {/* Models Filter */}
                  {activeFilterCategory === 'Models' && (
                    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem>
                        <Select
                          isOpen={isModelSelectOpen}
                          selected={selectedModels}
                          onSelect={onModelSelect}
                          onOpenChange={(isOpen) => {
                            setIsModelSelectOpen(isOpen);
                            if (!isOpen) {
                              setModelFilterSearch('');
                            }
                          }}
                          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                            <MenuToggle
                              ref={toggleRef}
                              onClick={() => setIsModelSelectOpen(!isModelSelectOpen)}
                              isExpanded={isModelSelectOpen}
                              id="model-filter-toggle"
                            >
                              {selectedModels.length > 0 ? (
                                <Badge isRead id="models-filter-count-badge">{selectedModels.length}</Badge>
                              ) : (
                                'Filter by models'
                              )}
                            </MenuToggle>
                          )}
                        >
                          <div className="pf-v6-u-p-md">
                            <SearchInput
                              placeholder="Search models"
                              value={modelFilterSearch}
                              onChange={(_event, value) => setModelFilterSearch(value)}
                              onClear={() => setModelFilterSearch('')}
                              id="model-filter-search"
                            />
                          </div>
                          <Divider />
                          <SelectList>
                            {allModelDeployments
                              .filter(model => 
                                model.toLowerCase().includes(modelFilterSearch.toLowerCase())
                              )
                              .map((model) => (
                                <SelectOption
                                  key={model}
                                  value={model}
                                  hasCheckbox
                                  isSelected={selectedModels.includes(model)}
                                >
                                  {model}
                                </SelectOption>
                              ))}
                          </SelectList>
                        </Select>
                        </FlexItem>
                        <FlexItem>
                        <SearchInput
                          placeholder="Search models"
                          value={modelSearchValue}
                          onChange={(_event, value) => setModelSearchValue(value)}
                          onClear={() => setModelSearchValue('')}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' && modelSearchValue.trim() && !modelSearchChips.includes(modelSearchValue.trim())) {
                              setModelSearchChips([...modelSearchChips, modelSearchValue.trim()]);
                              setModelSearchValue('');
                            }
                          }}
                          id="model-search-input"
                          />
                        </FlexItem>
                      </Flex>
                  )}

                  {/* Status Filter */}
                  {activeFilterCategory === 'Status' && (
                    <Select
                      isOpen={isStatusSelectOpen}
                      selected={selectedStatuses}
                      onSelect={onStatusSelect}
                      onOpenChange={(isOpen) => setIsStatusSelectOpen(isOpen)}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setIsStatusSelectOpen(!isStatusSelectOpen)}
                          isExpanded={isStatusSelectOpen}
                          id="status-filter-toggle"
                        >
                          {selectedStatuses.length > 0 ? (
                            <Badge isRead id="status-filter-count-badge">{selectedStatuses.length}</Badge>
                          ) : (
                            'Filter by status'
                          )}
                        </MenuToggle>
                      )}
                    >
                      <SelectList>
                        {['Running', 'Scaling', 'Failed', 'Degraded'].map((status) => (
                          <SelectOption
                            key={status}
                            value={status}
                            hasCheckbox
                            isSelected={selectedStatuses.includes(status)}
                          >
                            {status}
                          </SelectOption>
                        ))}
                      </SelectList>
                    </Select>
                  )}

                  {/* Hardware Profile Filter */}
                  {activeFilterCategory === 'Hardware profile' && (
                    <Select
                      isOpen={isHardwareSelectOpen}
                      selected={selectedHardwareProfiles}
                      onSelect={onHardwareSelect}
                      onOpenChange={(isOpen) => setIsHardwareSelectOpen(isOpen)}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setIsHardwareSelectOpen(!isHardwareSelectOpen)}
                          isExpanded={isHardwareSelectOpen}
                          id="hardware-filter-toggle"
                        >
                          {selectedHardwareProfiles.length > 0 ? (
                            <Badge isRead id="hardware-filter-count-badge">{selectedHardwareProfiles.length}</Badge>
                          ) : (
                            'Filter by hardware profile'
                          )}
                        </MenuToggle>
                      )}
                    >
                      <SelectList>
                        {uniqueHardwareProfiles.map((profile) => (
                          <SelectOption
                            key={profile}
                            value={profile}
                            hasCheckbox
                            isSelected={selectedHardwareProfiles.includes(profile)}
                          >
                            {profile}
                          </SelectOption>
                        ))}
                      </SelectList>
                    </Select>
                  )}
                    </FlexItem>

                {/* Clear All Filters */}
                {(modelSearchChips.length > 0 || selectedProjects.length > 0 || selectedModels.length > 0 || 
                  selectedStatuses.length > 0 || selectedHardwareProfiles.length > 0) && (
                    <FlexItem>
                    <Button 
                      variant="link" 
                      onClick={() => {
                        onClearAllFilters();
                        setModelSearchChips([]);
                      }} 
                      id="clear-all-filters"
                    >
                      Clear all filters
                    </Button>
                  </FlexItem>
                )}
              </Flex>
            </FlexItem>

            {/* Active Filter Chips Row */}
            {(modelSearchChips.length > 0 || selectedProjects.length > 0 || selectedModels.length > 0 || 
              selectedStatuses.length > 0 || selectedHardwareProfiles.length > 0) && (
                        <FlexItem>
                <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'wrap' }}>
                  
                  {/* Search Chips */}
                  {modelSearchChips.length > 0 && (
                    <FlexItem>
                      <div style={{
                        border: '1px solid var(--pf-t--global--border--color--default)',
                        borderRadius: 'var(--pf-t--global--border--radius--small)',
                        padding: '0.25rem 0.5rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                          Search:
                        </span>
                        {modelSearchChips.map((chip) => (
                          <Label 
                            key={chip}
                            color="grey" 
                            onClose={() => setModelSearchChips(modelSearchChips.filter(c => c !== chip))}
                            id={`search-chip-${chip}`}
                          >
                            {chip}
                          </Label>
                        ))}
                      </div>
                        </FlexItem>
                  )}
                  
                  {/* Model Chips */}
                  {selectedModels.length > 0 && (
                        <FlexItem>
                      <div style={{
                        border: '1px solid var(--pf-t--global--border--color--default)',
                        borderRadius: 'var(--pf-t--global--border--radius--small)',
                        padding: '0.25rem 0.5rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                          Models:
                        </span>
                        {selectedModels.map((model) => (
                          <Label 
                            key={model}
                            color="grey" 
                            onClose={() => onDeleteModelChip('model', model)}
                            id={`model-chip-${model}`}
                          >
                            {model}
                          </Label>
                        ))}
                      </div>
                        </FlexItem>
                  )}
                  
                  {/* Project Chips */}
                  {selectedProjects.length > 0 && (
                    <FlexItem>
                      <div style={{
                        border: '1px solid var(--pf-t--global--border--color--default)',
                        borderRadius: 'var(--pf-t--global--border--radius--small)',
                        padding: '0.25rem 0.5rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                          Project:
                        </span>
                        {selectedProjects.map((project) => (
                          <Label 
                            key={project}
                            color="grey" 
                            onClose={() => onDeleteProjectChip('project', project)}
                            id={`project-chip-${project}`}
                          >
                            {project}
                          </Label>
                        ))}
                      </div>
                    </FlexItem>
                  )}
                  
                  {/* Status Chips */}
                  {selectedStatuses.length > 0 && (
                    <FlexItem>
                      <div style={{
                        border: '1px solid var(--pf-t--global--border--color--default)',
                        borderRadius: 'var(--pf-t--global--border--radius--small)',
                        padding: '0.25rem 0.5rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                          Status:
                        </span>
                        {selectedStatuses.map((status) => (
                          <Label 
                            key={status}
                            color="grey" 
                            onClose={() => onDeleteStatusChip('status', status)}
                            id={`status-chip-${status}`}
                          >
                            {status}
                          </Label>
                        ))}
                      </div>
                    </FlexItem>
                  )}
                  
                  {/* Hardware Chips */}
                  {selectedHardwareProfiles.length > 0 && (
                    <FlexItem>
                      <div style={{
                        border: '1px solid var(--pf-t--global--border--color--default)',
                        borderRadius: 'var(--pf-t--global--border--radius--small)',
                        padding: '0.25rem 0.5rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                          Hardware:
                        </span>
                        {selectedHardwareProfiles.map((hw) => (
                          <Label 
                            key={hw}
                            color="grey" 
                            onClose={() => onDeleteHardwareChip('hardware', hw)}
                            id={`hardware-chip-${hw}`}
                          >
                            {hw}
                          </Label>
                        ))}
                      </div>
                    </FlexItem>
                  )}
                  </Flex>
              </FlexItem>
            )}

            {/* Model Deployments Card */}
                    <FlexItem>
              <Card id="model-deployments-card">
                <CardTitle>
                  <Flex 
                    justifyContent={{ default: 'justifyContentSpaceBetween' }}
                    alignItems={{ default: 'alignItemsCenter' }}
                  >
                    <FlexItem>
                      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                        <FlexItem>
                          <Title headingLevel="h2" size="xl">Model deployments</Title>
                        </FlexItem>
                        <FlexItem>
                          <Content component={ContentVariants.small} className="pf-v6-u-color-200">
                            Active model deployments with real-time performance and resource metrics
                      </Content>
                    </FlexItem>
                  </Flex>
                    </FlexItem>
                    <FlexItem>
                      <Button
                        variant="plain"
                        onClick={() => setIsModelDeploymentsExpanded(!isModelDeploymentsExpanded)}
                        aria-label={isModelDeploymentsExpanded ? "Collapse model deployments" : "Expand model deployments"}
                        id="toggle-model-deployments"
                      >
                        {isModelDeploymentsExpanded ? <AngleRightIcon style={{ transform: 'rotate(90deg)', transition: 'transform 0.2s' }} /> : <AngleRightIcon />}
                      </Button>
                    </FlexItem>
                  </Flex>
                </CardTitle>
                {isModelDeploymentsExpanded && (
                  <CardBody>
                  {/* Model Deployment Table */}
                  <Table aria-label="Model deployments table" isStickyHeader>
                    <Thead>
                      <Tr>
                        <Th sort={getSortParams(1)} modifier="wrap">Model deployment</Th>
                        <Th sort={getSortParams(2)}>Project</Th>
                        <Th sort={getSortParams(3)}>Runtime</Th>
                        <Th sort={getSortParams(4)}>Total requests</Th>
                        <Th sort={getSortParams(5)}>P90 E2E Latency (ms)</Th>
                        <Th sort={getSortParams(6)}>Error rate</Th>
                        <Th sort={getSortParams(7)} modifier="wrap">Hardware profile</Th>
                        <Th sort={getSortParams(8)}>GPU utilization</Th>
                        <Th sort={getSortParams(9)}>CPU utilization</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {sortedModelData.length === 0 ? (
                        <Tr>
                          <Td colSpan={10}>
                            <Bullseye className="pf-v6-u-py-lg">
                            <Content component={ContentVariants.p}>
                                No models match your current filters. Try adjusting your project or model filters.
                            </Content>
                            </Bullseye>
                          </Td>
                        </Tr>
                      ) : (
                        sortedModelData.map((model, index) => {
                          const isRecentlyChanged = recentlyChangedModels.has(model.deployment);
                          const isFilteredByModel = selectedModels.length > 0 && selectedModels.includes(model.deployment);
                          return (
                            <Tr 
                              key={index}
                              style={{
                                transition: 'background-color 0.3s ease',
                                backgroundColor: isRecentlyChanged 
                                  ? 'var(--pf-t--global--background--color--primary--default)' 
                                  : isFilteredByModel
                                    ? 'var(--pf-t--global--background--color--action--plain--hover)'
                                    : undefined
                              }}
                            >
                              <Td dataLabel="Model deployment">
                                <Button variant="link" isInline>
                                    {model.deployment}
                                  </Button>
                            </Td>
                              <Td dataLabel="Project">{model.project}</Td>
                              <Td dataLabel="Runtime">{model.runtime}</Td>
                              <Td dataLabel="Total requests">{model.requests}</Td>
                              <Td dataLabel="P90 E2E Latency (ms)">{model.latency}</Td>
                              <Td dataLabel="Error rate">{model.errorRate}</Td>
                              <Td dataLabel="Hardware profile">{model.hardwareProfile}</Td>
                              <Td dataLabel="GPU utilization">
                                <Tooltip content={model.gpuDetails}>
                                  <span className="pf-v6-u-text-decoration-underline-dotted" style={{ cursor: 'help' }}>
                                    {model.gpu}
                                  </span>
                                </Tooltip>
                          </Td>
                              <Td dataLabel="CPU utilization">
                                <Tooltip content={model.cpuDetails}>
                                  <span className="pf-v6-u-text-decoration-underline-dotted" style={{ cursor: 'help' }}>
                                    {model.cpu}
                                  </span>
                                </Tooltip>
                              </Td>
                              <Td dataLabel="Status">
                              {getStatusBadge(model.status)}
                            </Td>
                          </Tr>
                          );
                        })
                      )}
                    </Tbody>
                  </Table>
                </CardBody>
                )}
              </Card>
            </FlexItem>

            {/* Performance Metrics Card */}
            <FlexItem>
              <Card id="performance-metrics-card">
                <CardTitle>
                  <Flex 
                    justifyContent={{ default: 'justifyContentSpaceBetween' }}
                    alignItems={{ default: 'alignItemsCenter' }}
                  >
                    <FlexItem>
                      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                        <FlexItem>
                          <Title headingLevel="h2" size="xl">Performance metrics</Title>
                        </FlexItem>
                        <FlexItem>
                          <Content component={ContentVariants.small} className="pf-v6-u-color-200">
                            {filteredTableData.length === 0 
                              ? 'No models match your current filters'
                              : 'Real-time metrics for request handling, latency, throughput, and resource utilization'
                            }
                          </Content>
                        </FlexItem>
                      </Flex>
                    </FlexItem>
                    <FlexItem>
                      <Button
                        variant="plain"
                        onClick={() => setIsPerformanceMetricsExpanded(!isPerformanceMetricsExpanded)}
                        aria-label={isPerformanceMetricsExpanded ? "Collapse performance metrics" : "Expand performance metrics"}
                        id="toggle-performance-metrics"
                      >
                        {isPerformanceMetricsExpanded ? <AngleRightIcon style={{ transform: 'rotate(90deg)', transition: 'transform 0.2s' }} /> : <AngleRightIcon />}
                      </Button>
                    </FlexItem>
                  </Flex>
                </CardTitle>
                {isPerformanceMetricsExpanded && (
                  <CardBody>
                  {filteredTableData.length === 0 ? (
                    <Bullseye style={{ minHeight: '400px' }}>
                      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem>
                          <SearchIcon style={{ fontSize: '48px', color: 'var(--pf-t--global--icon--color--subtle)' }} />
                        </FlexItem>
                        <FlexItem>
                          <Title headingLevel="h3" size="lg">No models match your filters</Title>
                        </FlexItem>
                        <FlexItem>
                          <Content component={ContentVariants.p} style={{ textAlign: 'center' }}>
                            Adjust your filters to view model performance metrics
                          </Content>
                        </FlexItem>
                        <FlexItem className="pf-v6-u-mt-md">
                          <Button variant="link" onClick={onClearAllFilters} id="clear-filters-empty-state">
                            Clear all filters
                          </Button>
                        </FlexItem>
                      </Flex>
                    </Bullseye>
                  ) : (
              <Grid hasGutter>
                {/* Request queue length chart */}
                <GridItem span={12} lg={6}>
                  <Card isFullHeight id="request-queue-chart">
                    <CardTitle>
                      <Title headingLevel="h3" size="md">Request queue length</Title>
                    </CardTitle>
                    <CardBody>
                      {filteredRequestQueueData.length === 0 ? (
                        <Bullseye style={{ height: '200px' }}>
                          <Content component={ContentVariants.p}>
                            No data available for current selection
                          </Content>
                        </Bullseye>
                      ) : (
                        <div style={{ height: '200px', width: '100%' }}>
                          <ReactECharts
                            option={{
                              tooltip: {
                                trigger: 'axis',
                                formatter: (params: any) => {
                                  let tooltip = `<strong>${new Date(params[0].value[0]).toLocaleTimeString()}</strong><br/>`;
                                  params.forEach((param: any) => {
                                    tooltip += `${param.marker} ${param.seriesName}: ${param.value[1]}<br/>`;
                                  });
                                  return tooltip;
                                }
                              },
                              legend: {
                                data: filteredRequestQueueData.map(series => series.name),
                                bottom: 0,
                                type: 'scroll'
                              },
                              xAxis: {
                                type: 'time',
                                axisLabel: {
                                  formatter: (value: number) => new Date(value).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                hour12: true 
                                  })
                                }
                              },
                              yAxis: {
                                type: 'value'
                              },
                              series: filteredRequestQueueData.map(series => ({
                                name: series.name,
                                data: series.data,
                                type: 'line',
                                smooth: true,
                                itemStyle: {
                                  color: series.color
                                },
                                lineStyle: {
                                  width: 2
                                }
                              })),
                              grid: {
                                left: '10%',
                                right: '10%',
                                bottom: '20%',
                                top: '5%',
                                containLabel: true
                              }
                            }}
                            style={{ height: '100%', width: '100%' }}
                          />
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Replica count chart */}
                <GridItem span={12} lg={6}>
                  <Card isFullHeight id="replica-count-chart">
                    <CardTitle>
                      <Title headingLevel="h3" size="md">Replica count</Title>
                    </CardTitle>
                    <CardBody>
                      {filteredReplicaCountData.length === 0 ? (
                        <Bullseye style={{ height: '200px' }}>
                          <Content component={ContentVariants.p}>
                            No data available for current selection
                          </Content>
                        </Bullseye>
                      ) : (
                        <div style={{ height: '200px', width: '100%' }}>
                          <ReactECharts
                            option={{
                              tooltip: {
                                trigger: 'axis',
                                formatter: (params: any) => {
                                  let tooltip = `<strong>${new Date(params[0].value[0]).toLocaleTimeString()}</strong><br/>`;
                                  params.forEach((param: any) => {
                                    tooltip += `${param.marker} ${param.seriesName}: ${param.value[1]}<br/>`;
                                  });
                                  return tooltip;
                                }
                              },
                              legend: {
                                data: filteredReplicaCountData.map(series => series.name),
                                bottom: 0,
                                type: 'scroll'
                              },
                              xAxis: {
                                type: 'time',
                                axisLabel: {
                                  formatter: (value: number) => new Date(value).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                hour12: true 
                                  })
                                }
                              },
                              yAxis: {
                                type: 'value'
                              },
                              series: filteredReplicaCountData.map(series => ({
                                name: series.name,
                                data: series.data,
                                type: 'line',
                                smooth: true,
                                itemStyle: {
                                  color: series.color
                                },
                                lineStyle: {
                                  width: 2
                                }
                              })),
                              grid: {
                                left: '10%',
                                right: '10%',
                                bottom: '20%',
                                top: '5%',
                                containLabel: true
                              }
                            }}
                            style={{ height: '100%', width: '100%' }}
                          />
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Request latency chart */}
                <GridItem span={12} lg={6}>
                  <Card isFullHeight id="request-latency-chart">
                    <CardTitle>
                      <Title headingLevel="h3" size="md">Request latency</Title>
                    </CardTitle>
                    <CardBody>
                      {filteredRequestLatencyData.length === 0 ? (
                        <Bullseye style={{ height: '200px' }}>
                          <Content component={ContentVariants.p}>
                            No data available for current selection
                          </Content>
                        </Bullseye>
                      ) : (
                        <div style={{ height: '200px', width: '100%' }}>
                          <ReactECharts
                            option={{
                              tooltip: {
                                trigger: 'axis',
                                formatter: (params: any) => {
                                  let tooltip = `<strong>${new Date(params[0].value[0]).toLocaleTimeString()}</strong><br/>`;
                                  params.forEach((param: any) => {
                                    tooltip += `${param.marker} ${param.seriesName}: ${param.value[1]} ms<br/>`;
                                  });
                                  return tooltip;
                                }
                              },
                              legend: {
                                data: filteredRequestLatencyData.map(series => series.name),
                                bottom: 0,
                                type: 'scroll'
                              },
                              xAxis: {
                                type: 'time',
                                axisLabel: {
                                  formatter: (value: number) => new Date(value).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                hour12: true 
                                  })
                                }
                              },
                              yAxis: {
                                type: 'value',
                                axisLabel: {
                                  formatter: '{value} ms'
                                }
                              },
                              series: filteredRequestLatencyData.map(series => ({
                                name: series.name,
                                data: series.data,
                                type: 'line',
                                smooth: true,
                                itemStyle: {
                                  color: series.color
                                },
                                lineStyle: {
                                  width: 2
                                }
                              })),
                              grid: {
                                left: '10%',
                                right: '10%',
                                bottom: '20%',
                                top: '5%',
                                containLabel: true
                              }
                            }}
                            style={{ height: '100%', width: '100%' }}
                          />
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Time to First Token (TTFT) chart */}
                <GridItem span={12} lg={6}>
                  <Card isFullHeight id="ttft-chart">
                    <CardTitle>
                      <Title headingLevel="h3" size="md">Time to First Token (TTFT)</Title>
                    </CardTitle>
                    <CardBody>
                      {filteredTTFTData.length === 0 ? (
                        <Bullseye style={{ height: '200px' }}>
                          <Content component={ContentVariants.p}>
                            No data available for current selection
                          </Content>
                        </Bullseye>
                      ) : (
                        <div style={{ height: '200px', width: '100%' }}>
                          <ReactECharts
                            option={{
                              tooltip: {
                                trigger: 'axis',
                                formatter: (params: any) => {
                                  let tooltip = `<strong>${new Date(params[0].value[0]).toLocaleTimeString()}</strong><br/>`;
                                  params.forEach((param: any) => {
                                    tooltip += `${param.marker} ${param.seriesName}: ${param.value[1]} ms<br/>`;
                                  });
                                  return tooltip;
                                }
                              },
                              legend: {
                                data: filteredTTFTData.map(series => series.name),
                                bottom: 0,
                                type: 'scroll'
                              },
                              xAxis: {
                                type: 'time',
                                axisLabel: {
                                  formatter: (value: number) => new Date(value).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                hour12: true 
                                  })
                                }
                              },
                              yAxis: {
                                type: 'value',
                                axisLabel: {
                                  formatter: '{value} ms'
                                }
                              },
                              series: filteredTTFTData.map(series => ({
                                name: series.name,
                                data: series.data,
                                type: 'line',
                                smooth: true,
                                itemStyle: {
                                  color: series.color
                                },
                                lineStyle: {
                                  width: 2
                                }
                              })),
                              grid: {
                                left: '10%',
                                right: '10%',
                                bottom: '20%',
                                top: '5%',
                                containLabel: true
                              }
                            }}
                            style={{ height: '100%', width: '100%' }}
                          />
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Token Generation Rate chart */}
                <GridItem span={12} lg={6}>
                  <Card isFullHeight id="token-generation-rate-chart">
                <CardTitle>
                      <Title headingLevel="h3" size="md">Token Generation Rate</Title>
                </CardTitle>
                <CardBody>
                      {filteredTokenGenerationRateData.length === 0 ? (
                        <Bullseye style={{ height: '200px' }}>
                          <Content component={ContentVariants.p}>
                            No data available for current selection
                          </Content>
                        </Bullseye>
                      ) : (
                        <div style={{ height: '200px', width: '100%' }}>
                          <ReactECharts
                            option={{
                              tooltip: {
                                trigger: 'axis',
                                formatter: (params: any) => {
                                  let tooltip = `<strong>${new Date(params[0].value[0]).toLocaleTimeString()}</strong><br/>`;
                                  params.forEach((param: any) => {
                                    tooltip += `${param.marker} ${param.seriesName}: ${param.value[1]} tok/s<br/>`;
                                  });
                                  return tooltip;
                                }
                              },
                              legend: {
                                data: filteredTokenGenerationRateData.map(series => series.name),
                                bottom: 0,
                                type: 'scroll'
                              },
                              xAxis: {
                                type: 'time',
                                axisLabel: {
                                  formatter: (value: number) => new Date(value).toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    hour12: true 
                                  })
                                }
                              },
                              yAxis: {
                                type: 'value',
                                axisLabel: {
                                  formatter: '{value} tok/s'
                                }
                              },
                              series: filteredTokenGenerationRateData.map(series => ({
                                name: series.name,
                                data: series.data,
                                type: 'line',
                                smooth: true,
                                itemStyle: {
                                  color: series.color
                                },
                                lineStyle: {
                                  width: 2
                                }
                              })),
                              grid: {
                                left: '10%',
                                right: '10%',
                                bottom: '20%',
                                top: '5%',
                                containLabel: true
                              }
                            }}
                            style={{ height: '100%', width: '100%' }}
                          />
                  </div>
                      )}
                </CardBody>
              </Card>
            </GridItem>

                {/* Throughput chart */}
                <GridItem span={12} lg={6}>
                  <Card isFullHeight id="throughput-chart">
                <CardTitle>
                      <Title headingLevel="h3" size="md">Throughput (requests/sec)</Title>
                </CardTitle>
                <CardBody>
                      {filteredThroughputData.length === 0 ? (
                        <Bullseye style={{ height: '200px' }}>
                          <Content component={ContentVariants.p}>
                            No data available for current selection
                          </Content>
                        </Bullseye>
                      ) : (
                        <div style={{ height: '200px', width: '100%' }}>
                          <ReactECharts
                            option={{
                              tooltip: {
                                trigger: 'axis',
                                formatter: (params: any) => {
                                  let tooltip = `<strong>${new Date(params[0].value[0]).toLocaleTimeString()}</strong><br/>`;
                                  params.forEach((param: any) => {
                                    tooltip += `${param.marker} ${param.seriesName}: ${param.value[1]} req/s<br/>`;
                                  });
                                  return tooltip;
                                }
                              },
                              legend: {
                                data: filteredThroughputData.map(series => series.name),
                                bottom: 0,
                                type: 'scroll'
                              },
                              xAxis: {
                                type: 'time',
                                axisLabel: {
                                  formatter: (value: number) => new Date(value).toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    hour12: true 
                                  })
                                }
                              },
                              yAxis: {
                                type: 'value',
                                axisLabel: {
                                  formatter: '{value} req/s'
                                }
                              },
                              series: filteredThroughputData.map(series => ({
                                name: series.name,
                                data: series.data,
                                type: 'line',
                                smooth: true,
                                itemStyle: {
                                  color: series.color
                                },
                                lineStyle: {
                                  width: 2
                                }
                              })),
                              grid: {
                                left: '10%',
                                right: '10%',
                                bottom: '20%',
                                top: '5%',
                                containLabel: true
                              }
                            }}
                            style={{ height: '100%', width: '100%' }}
                          />
                  </div>
                      )}
                </CardBody>
              </Card>
            </GridItem>

                {/* Response Time Distribution */}
                <GridItem span={12}>
                  <Card isFullHeight id="response-time-distribution-chart">
                    <CardTitle>
                      <Title headingLevel="h3" size="md">Response Time Distribution</Title>
                    </CardTitle>
              <CardBody>
                      <div style={{ height: '250px', width: '100%' }}>
                        <ReactECharts
                          option={{
                            tooltip: {
                              trigger: 'axis',
                              axisPointer: {
                                type: 'shadow'
                              },
                              formatter: (params: any) => {
                                if (params[0]) {
                                  return `${params[0].name}: ${params[0].value} ms`;
                                }
                                return '';
                              }
                            },
                            xAxis: {
                              type: 'category',
                              data: ['0-100ms', '100-200ms', '200-300ms', '300-400ms', '400-500ms', '500-600ms', '600ms+']
                            },
                            yAxis: {
                              type: 'value',
                              axisLabel: {
                                formatter: '{value} ms'
                              }
                            },
                            series: [{
                              data: [120, 280, 450, 320, 180, 95, 45],
                              type: 'bar',
                              itemStyle: {
                                color: '#5470c6'
                              }
                            }],
                            grid: {
                              left: '10%',
                              right: '5%',
                              bottom: '15%',
                              top: '5%',
                              containLabel: true
                            }
                          }}
                          style={{ height: '100%', width: '100%' }}
                        />
                </div>
              </CardBody>
                  </Card>
                </GridItem>
              </Grid>
                  )}
                  </CardBody>
                )}
            </Card>
          </FlexItem>
          </>
        )}
      </Flex>
  </PageSection>
);
};

export { Dashboard };
