import * as React from 'react';
import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Checkbox,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  FileUpload,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormHelperText,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  JumpLinks,
  JumpLinksItem,
  Label,
  LabelGroup,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  MultipleFileUpload,
  MultipleFileUploadMain,
  MultipleFileUploadStatus,
  MultipleFileUploadStatusItem,
  PageSection,
  Popover,
  Progress,
  ProgressSize,
  Radio,
  Select,
  SelectList,
  SelectOption,
  Tab,
  TabTitleText,
  Tabs,
  TextArea,
  SearchInput,
  TextInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import {
  AngleDownIcon,
  AngleRightIcon,
  CheckCircleIcon,
  ClockIcon,
  CopyIcon,
  DownloadIcon,
  FileIcon,
  FilterIcon,
  FolderOpenIcon,
  GripVerticalIcon,
  InfoCircleIcon,
  OutlinedFolderIcon,
  OutlinedQuestionCircleIcon,
  SearchIcon,
  SortAlphaDownIcon,
  SortAlphaUpIcon,
  SyncIcon,
  TimesIcon,
} from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';
import PipelineVisualization from '@app/assets/Gemini_Generated_Image_w6e0x1w6e0x1w6e0.png';
import AIMLServerIllustration from '@app/assets/ai-ml-server-illustration.svg';
import { AutoRAGIcon } from '@app/Home/icons/AutoRAGIcon';

interface Document {
  id: string;
  name: string;
  type: string;
  uploaded: Date;
  sourceType: 'document' | 'connection';
}

interface Connection {
  id: string;
  name: string;
  type: string; // e.g., 'S3 Bucket', 'COS', etc.
  accessKey?: string;
  secretKey?: string;
  bucketName?: string;
  endpoint?: string;
  region?: string;
  createdAt: Date;
}

interface S3FileItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  lastModified?: Date;
}

interface FileSystemItem extends S3FileItem {
  children?: FileSystemItem[];
  parentId?: string;
  level: number;
}

interface UploadFileProgress {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
}

interface Model {
  id: string;
  name: string;
  description: string;
  tag: string;
}

interface PatternResult {
  id: string;
  rank: number;
  patternName: string;
  modelName: string;
  answerFaithfulness: number;
  chunkMethod: string;
  chunkSize: number;
  status: 'Complete' | 'In Progress' | 'In Queue';
}

interface Experiment {
  id: string;
  name: string;
  description: string;
  tags: string[];
  status: 'incomplete' | 'completed' | 'Processing' | 'failed';
  createdAt: Date;
  lastSaved: Date;
  hasDocuments: boolean;
  hasConfigurations: boolean;
  isRunning: boolean;
}

const AutoRAG: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const { flags, selectedProject, setSelectedProject } = useFeatureFlags();
  const [isProjectSelectOpen, setIsProjectSelectOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [experimentCreated, setExperimentCreated] = React.useState(false);
  const [experimentName, setExperimentName] = React.useState('');
  const [, setExperimentLastSaved] = React.useState<Date | null>(null);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [, setTagInput] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [hasAddedDocuments, setHasAddedDocuments] = React.useState(false);
  const [isConfiguring, setIsConfiguring] = React.useState(false);
  const [vectorDatabase, setVectorDatabase] = React.useState('Milvus (in line)');
  const [selectedFoundationModels, setSelectedFoundationModels] = React.useState<Set<string>>(new Set(['1', '2', '3']));
  const [selectedEmbeddingModels, setSelectedEmbeddingModels] = React.useState<Set<string>>(new Set(['1']));
  const [selectAllFoundation, setSelectAllFoundation] = React.useState(false);
  const [selectAllEmbedding, setSelectAllEmbedding] = React.useState(false);
  const [criteria, setCriteria] = React.useState<string>('answer faithfulness');
  const [isVectorDbOpen, setIsVectorDbOpen] = React.useState(false);
  const [experimentRunning, setExperimentRunning] = React.useState(false);
  const [experimentCompleted, setExperimentCompleted] = React.useState(false);
  const [patternResults, setPatternResults] = React.useState<PatternResult[]>([]);
  const [sortBy, setSortBy] = React.useState<string>('rank');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [activeModelTabKey, setActiveModelTabKey] = React.useState<string | number>(0);
  const [isEvaluationSettingsModalOpen, setIsEvaluationSettingsModalOpen] = React.useState(false);
  const [initialFoundationModels, setInitialFoundationModels] = React.useState<Set<string>>(new Set(['1', '2', '3']));
  const [initialEmbeddingModels, setInitialEmbeddingModels] = React.useState<Set<string>>(new Set(['1']));
  const [initialCriteria, setInitialCriteria] = React.useState<string>('answer faithfulness');
  const [isEvaluationSourceModalOpen, setIsEvaluationSourceModalOpen] = React.useState(false);
  const [evaluationSourceFile, setEvaluationSourceFile] = React.useState<File | null>(null);
  const [evaluationSourceFilename, setEvaluationSourceFilename] = React.useState('');
  const [isEvaluationSourceUploading, setIsEvaluationSourceUploading] = React.useState(false);
  const [selectedEvaluationSourceDocument, setSelectedEvaluationSourceDocument] = React.useState<string | null>(null);
  const [isEvaluationSourceDocumentSelectOpen, setIsEvaluationSourceDocumentSelectOpen] = React.useState(false);
  const [experiments, setExperiments] = React.useState<Experiment[]>([]);
  const [selectedExperimentId, setSelectedExperimentId] = React.useState<string | null>(null);
  const [connections, setConnections] = React.useState<Connection[]>([]);
  const [isAddConnectionModalOpen, setIsAddConnectionModalOpen] = React.useState(false);
  const [connectionName, setConnectionName] = React.useState('');
  const [accessKey, setAccessKey] = React.useState('');
  const [secretKey, setSecretKey] = React.useState('');
  const [bucketName, setBucketName] = React.useState('');
  const [endpoint, setEndpoint] = React.useState('');
  const [region, setRegion] = React.useState('');
  const [uploadingFiles, setUploadingFiles] = React.useState<UploadFileProgress[]>([]);
  const uploadStatusRef = React.useRef<HTMLDivElement>(null);
  const [selectedConnectionId, setSelectedConnectionId] = React.useState<string | null>(null);
  const [isConnectionSelectOpen, setIsConnectionSelectOpen] = React.useState(false);
  const [s3Files, setS3Files] = React.useState<S3FileItem[]>([]);
  const [selectedS3Files, setSelectedS3Files] = React.useState<Set<string>>(new Set());
  const [isLoadingS3Files, setIsLoadingS3Files] = React.useState(false);
  const [isSelectFilesModalOpen, setIsSelectFilesModalOpen] = React.useState(false);
  const [modalSelectedConnectionId, setModalSelectedConnectionId] = React.useState<string | null>(null);
  
  // Tree view state for Option 1
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set());
  const [fileSystemTree, setFileSystemTree] = React.useState<FileSystemItem[]>([]);
  const [treeViewSearchValue, setTreeViewSearchValue] = React.useState<string>('');
  
  // Column view state for Option 2
  const [columnNavigationPath, setColumnNavigationPath] = React.useState<string[]>([]); // Array of folder IDs representing current path
  const [columnSearchValues, setColumnSearchValues] = React.useState<Record<string, string>>({}); // Search values per column (keyed by column ID)
  const [columnSortOrder, setColumnSortOrder] = React.useState<Record<string, 'asc' | 'desc'>>({}); // Sort order per column
  
  const [isConnectionDetailsModalOpen, setIsConnectionDetailsModalOpen] = React.useState(false);
  const [selectedConnectionForDetails, setSelectedConnectionForDetails] = React.useState<Connection | null>(null);
  const [isPatternDetailsModalOpen, setIsPatternDetailsModalOpen] = React.useState(false);
  const [selectedPatternForDetails, setSelectedPatternForDetails] = React.useState<PatternResult | null>(null);
  
  // Dev tool state switcher
  const [isDevToolExpanded, setIsDevToolExpanded] = React.useState(false);
  const [devToolPosition, setDevToolPosition] = React.useState({ x: typeof window !== 'undefined' ? window.innerWidth - 280 : 1000, y: 150 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const devToolRef = React.useRef<HTMLDivElement>(null);
  
  // Document selection modal variant (Option 1: Tree View, Option 2: Column View)
  const [documentSelectionVariant, setDocumentSelectionVariant] = React.useState<'option1' | 'option2'>('option1');

  // Mock data for models
  const foundationModels: Model[] = [
    { id: '1', name: 'gpt-oss-120b', description: 'Large language model for general purpose tasks', tag: 'LLM' },
    { id: '2', name: 'llama-4-ma', description: 'Efficient language model for text generation', tag: 'LLM' },
    { id: '3', name: 'llama-3-3-70b', description: 'Fast and efficient conversational AI model', tag: 'LLM' },
  ];

  const embeddingModels: Model[] = [
    { id: '1', name: 'text-embedding-ada-002', description: 'OpenAI embedding model', tag: 'Embedding' },
    { id: '2', name: 'sentence-transformers', description: 'Sentence transformer model', tag: 'Embedding' },
  ];

  // Initialize with demo "completed-test" experiment
  React.useEffect(() => {
    if (experiments.length === 0) {
      const completedTestExperiment: Experiment = {
        id: 'completed-test',
        name: 'completed-test',
        description: 'Demo completed experiment with test results',
        tags: ['demo', 'test', 'rag'],
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        lastSaved: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        hasDocuments: true,
        hasConfigurations: true,
        isRunning: false,
      };
      setExperiments([completedTestExperiment]);
    }
  }, []); // Only run once on mount

  const handleCreateExperiment = () => {
    setIsCreating(true);
    setName('');
    setDescription('');
    setTagInput('');
    setTags([]);
    setErrors({});
  };

  const handleCancel = () => {
    setIsCreating(false);
    setExperimentCreated(false);
    setIsConfiguring(false);
    setExperimentCompleted(false);
    setExperimentRunning(false);
    setSelectedExperimentId(null);
    setName('');
    setDescription('');
    setTagInput('');
    setTags([]);
    setErrors({});
    setDocuments([]);
    setHasAddedDocuments(false);
    setEvaluationSourceFile(null);
    setEvaluationSourceFilename('');
    setVectorDatabase('Milvus (in line)');
    setSelectedFoundationModels(new Set(['1']));
    setSelectedEmbeddingModels(new Set(['1']));
    setCriteria('answer faithfulness');
    setPatternResults([]);
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Create experiment and move directly to configuration screen
      const now = new Date();
      const experimentId = Date.now().toString();
      const newExperiment: Experiment = {
        id: experimentId,
        name: name.trim(),
        description: description.trim(),
        tags: tags,
        status: 'incomplete',
        createdAt: now,
        lastSaved: now,
        hasDocuments: false,
        hasConfigurations: false,
        isRunning: false,
      };
      
      // Save experiment to list
      setExperiments([...experiments, newExperiment]);
      setSelectedExperimentId(experimentId);
      setExperimentName(name.trim());
      setExperimentLastSaved(now);
      setExperimentCreated(true);
      setIsConfiguring(true);
      setIsCreating(false);
      // TODO: Implement actual experiment creation API call
      console.log('Creating experiment:', { name, description, tags });
    }
  };

  const handleFileRemove = (fileId: string) => {
    setDocuments(documents.filter(doc => doc.id !== fileId));
    // Also remove from connections if it's a connection
    setConnections(connections.filter(conn => conn.id !== fileId));
    if (documents.length === 1) {
      setHasAddedDocuments(false);
    }
  };

  // Load S3 files when connection is selected in modal
  React.useEffect(() => {
    if (modalSelectedConnectionId && isSelectFilesModalOpen) {
      setIsLoadingS3Files(true);
      // Simulate API call to fetch files from S3 connection
      setTimeout(() => {
        // Mock data with hierarchical folder structure for Travel Policy bot use case
        // Ordered so nested items appear immediately after their parents for proper slicing
        // At least 50 documents and 10 folders with multiple root folders and nested structure
        const allMockFiles: S3FileItem[] = [
          // Root level files
          { id: 'file-travel-policy-main', name: 'Travel Policy 2024.pdf', path: 'Travel Policy 2024.pdf', type: 'file', size: 2560000, lastModified: new Date() },
          { id: 'file-corporate-policy', name: 'Corporate Travel Policy.pdf', path: 'Corporate Travel Policy.pdf', type: 'file', size: 1800000, lastModified: new Date() },
          { id: 'file-travel-budgets', name: 'Travel Budgets Overview.pdf', path: 'Travel Budgets Overview.pdf', type: 'file', size: 1200000, lastModified: new Date() },
          
          // Travel Policies/ folder (root level)
          { id: 'folder-travel-policies', name: 'Travel Policies', path: 'Travel Policies/', type: 'folder' },
          { id: 'file-policy-2024', name: 'Travel Policy 2024.pdf', path: 'Travel Policies/Travel Policy 2024.pdf', type: 'file', size: 2048000, lastModified: new Date() },
          { id: 'file-policy-2023', name: 'Travel Policy 2023.pdf', path: 'Travel Policies/Travel Policy 2023.pdf', type: 'file', size: 1900000, lastModified: new Date() },
          { id: 'file-policy-international', name: 'International Travel Policy.pdf', path: 'Travel Policies/International Travel Policy.pdf', type: 'file', size: 1500000, lastModified: new Date() },
          { id: 'file-policy-domestic', name: 'Domestic Travel Policy.pdf', path: 'Travel Policies/Domestic Travel Policy.pdf', type: 'file', size: 1400000, lastModified: new Date() },
          
          // Travel Policies/Regional/ folder (nested)
          { id: 'folder-regional', name: 'Regional', path: 'Travel Policies/Regional/', type: 'folder' },
          { id: 'file-policy-americas', name: 'Americas Travel Policy.pdf', path: 'Travel Policies/Regional/Americas Travel Policy.pdf', type: 'file', size: 1200000, lastModified: new Date() },
          { id: 'file-policy-emea', name: 'EMEA Travel Policy.pdf', path: 'Travel Policies/Regional/EMEA Travel Policy.pdf', type: 'file', size: 1100000, lastModified: new Date() },
          { id: 'file-policy-asia', name: 'Asia Pacific Travel Policy.pdf', path: 'Travel Policies/Regional/Asia Pacific Travel Policy.pdf', type: 'file', size: 1300000, lastModified: new Date() },
          
          // Travel Policies/Regional/Country-Specific/ folder (nested level 3)
          { id: 'folder-country-specific', name: 'Country-Specific', path: 'Travel Policies/Regional/Country-Specific/', type: 'folder' },
          { id: 'file-policy-usa', name: 'USA Travel Guidelines.pdf', path: 'Travel Policies/Regional/Country-Specific/USA Travel Guidelines.pdf', type: 'file', size: 800000, lastModified: new Date() },
          { id: 'file-policy-uk', name: 'UK Travel Guidelines.pdf', path: 'Travel Policies/Regional/Country-Specific/UK Travel Guidelines.pdf', type: 'file', size: 750000, lastModified: new Date() },
          { id: 'file-policy-germany', name: 'Germany Travel Guidelines.pdf', path: 'Travel Policies/Regional/Country-Specific/Germany Travel Guidelines.pdf', type: 'file', size: 700000, lastModified: new Date() },
          
          // Travel Policies/Regional/Country-Specific/Major Cities/ folder (nested level 4)
          { id: 'folder-major-cities', name: 'Major Cities', path: 'Travel Policies/Regional/Country-Specific/Major Cities/', type: 'folder' },
          { id: 'file-policy-nyc', name: 'New York City Travel Policy.pdf', path: 'Travel Policies/Regional/Country-Specific/Major Cities/New York City Travel Policy.pdf', type: 'file', size: 600000, lastModified: new Date() },
          { id: 'file-policy-london', name: 'London Travel Policy.pdf', path: 'Travel Policies/Regional/Country-Specific/Major Cities/London Travel Policy.pdf', type: 'file', size: 580000, lastModified: new Date() },
          { id: 'file-policy-tokyo', name: 'Tokyo Travel Policy.pdf', path: 'Travel Policies/Regional/Country-Specific/Major Cities/Tokyo Travel Policy.pdf', type: 'file', size: 550000, lastModified: new Date() },
          
          // Budgets/ folder (root level)
          { id: 'folder-budgets', name: 'Budgets', path: 'Budgets/', type: 'folder' },
          { id: 'file-budget-2024', name: 'Travel Budget 2024.pdf', path: 'Budgets/Travel Budget 2024.pdf', type: 'file', size: 1600000, lastModified: new Date() },
          { id: 'file-budget-q1', name: 'Q1 Travel Budget.pdf', path: 'Budgets/Q1 Travel Budget.pdf', type: 'file', size: 500000, lastModified: new Date() },
          { id: 'file-budget-q2', name: 'Q2 Travel Budget.pdf', path: 'Budgets/Q2 Travel Budget.pdf', type: 'file', size: 520000, lastModified: new Date() },
          { id: 'file-budget-q3', name: 'Q3 Travel Budget.pdf', path: 'Budgets/Q3 Travel Budget.pdf', type: 'file', size: 480000, lastModified: new Date() },
          { id: 'file-budget-q4', name: 'Q4 Travel Budget.pdf', path: 'Budgets/Q4 Travel Budget.pdf', type: 'file', size: 510000, lastModified: new Date() },
          
          // Budgets/Department/ folder (nested)
          { id: 'folder-department', name: 'Department', path: 'Budgets/Department/', type: 'folder' },
          { id: 'file-budget-sales', name: 'Sales Travel Budget.pdf', path: 'Budgets/Department/Sales Travel Budget.pdf', type: 'file', size: 600000, lastModified: new Date() },
          { id: 'file-budget-marketing', name: 'Marketing Travel Budget.pdf', path: 'Budgets/Department/Marketing Travel Budget.pdf', type: 'file', size: 580000, lastModified: new Date() },
          { id: 'file-budget-engineering', name: 'Engineering Travel Budget.pdf', path: 'Budgets/Department/Engineering Travel Budget.pdf', type: 'file', size: 620000, lastModified: new Date() },
          
          // Budgets/Department/Quarterly/ folder (nested level 3)
          { id: 'folder-quarterly', name: 'Quarterly', path: 'Budgets/Department/Quarterly/', type: 'folder' },
          { id: 'file-budget-sales-q1', name: 'Sales Q1 Budget.pdf', path: 'Budgets/Department/Quarterly/Sales Q1 Budget.pdf', type: 'file', size: 300000, lastModified: new Date() },
          { id: 'file-budget-sales-q2', name: 'Sales Q2 Budget.pdf', path: 'Budgets/Department/Quarterly/Sales Q2 Budget.pdf', type: 'file', size: 310000, lastModified: new Date() },
          
          // Budgets/Department/Quarterly/Reports/ folder (nested level 4)
          { id: 'folder-quarterly-reports', name: 'Reports', path: 'Budgets/Department/Quarterly/Reports/', type: 'folder' },
          { id: 'file-budget-report-q1', name: 'Q1 Budget Analysis Report.pdf', path: 'Budgets/Department/Quarterly/Reports/Q1 Budget Analysis Report.pdf', type: 'file', size: 400000, lastModified: new Date() },
          { id: 'file-budget-report-q2', name: 'Q2 Budget Analysis Report.pdf', path: 'Budgets/Department/Quarterly/Reports/Q2 Budget Analysis Report.pdf', type: 'file', size: 420000, lastModified: new Date() },
          
          // Corporate Policies/ folder (root level)
          { id: 'folder-corporate-policies', name: 'Corporate Policies', path: 'Corporate Policies/', type: 'folder' },
          { id: 'file-corp-policy-main', name: 'Corporate Travel Policy Document.pdf', path: 'Corporate Policies/Corporate Travel Policy Document.pdf', type: 'file', size: 2200000, lastModified: new Date() },
          { id: 'file-corp-guidelines', name: 'Corporate Travel Guidelines.pdf', path: 'Corporate Policies/Corporate Travel Guidelines.pdf', type: 'file', size: 1800000, lastModified: new Date() },
          { id: 'file-corp-standards', name: 'Travel Standards and Procedures.pdf', path: 'Corporate Policies/Travel Standards and Procedures.pdf', type: 'file', size: 1700000, lastModified: new Date() },
          
          // Corporate Policies/Compliance/ folder (nested)
          { id: 'folder-compliance', name: 'Compliance', path: 'Corporate Policies/Compliance/', type: 'folder' },
          { id: 'file-compliance-audit', name: 'Travel Compliance Audit Report.pdf', path: 'Corporate Policies/Compliance/Travel Compliance Audit Report.pdf', type: 'file', size: 1400000, lastModified: new Date() },
          { id: 'file-compliance-rules', name: 'Compliance Rules and Regulations.pdf', path: 'Corporate Policies/Compliance/Compliance Rules and Regulations.pdf', type: 'file', size: 1300000, lastModified: new Date() },
          
          // Corporate Policies/Compliance/Audits/ folder (nested level 3)
          { id: 'folder-audits', name: 'Audits', path: 'Corporate Policies/Compliance/Audits/', type: 'folder' },
          { id: 'file-audit-2024', name: '2024 Compliance Audit.pdf', path: 'Corporate Policies/Compliance/Audits/2024 Compliance Audit.pdf', type: 'file', size: 1200000, lastModified: new Date() },
          { id: 'file-audit-2023', name: '2023 Compliance Audit.pdf', path: 'Corporate Policies/Compliance/Audits/2023 Compliance Audit.pdf', type: 'file', size: 1150000, lastModified: new Date() },
          
          // Corporate Policies/Compliance/Audits/Annual/ folder (nested level 4)
          { id: 'folder-annual-audits', name: 'Annual', path: 'Corporate Policies/Compliance/Audits/Annual/', type: 'folder' },
          { id: 'file-audit-annual-2024', name: 'Annual Compliance Report 2024.pdf', path: 'Corporate Policies/Compliance/Audits/Annual/Annual Compliance Report 2024.pdf', type: 'file', size: 1100000, lastModified: new Date() },
          { id: 'file-audit-annual-2023', name: 'Annual Compliance Report 2023.pdf', path: 'Corporate Policies/Compliance/Audits/Annual/Annual Compliance Report 2023.pdf', type: 'file', size: 1050000, lastModified: new Date() },
          
          // Travel Documents/ folder (root level)
          { id: 'folder-travel-documents', name: 'Travel Documents', path: 'Travel Documents/', type: 'folder' },
          { id: 'file-travel-guide', name: 'Employee Travel Guide.pdf', path: 'Travel Documents/Employee Travel Guide.pdf', type: 'file', size: 1500000, lastModified: new Date() },
          { id: 'file-travel-checklist', name: 'Travel Checklist.pdf', path: 'Travel Documents/Travel Checklist.pdf', type: 'file', size: 300000, lastModified: new Date() },
          { id: 'file-expense-guidelines', name: 'Expense Guidelines.pdf', path: 'Travel Documents/Expense Guidelines.pdf', type: 'file', size: 900000, lastModified: new Date() },
          { id: 'file-reimbursement', name: 'Reimbursement Procedures.pdf', path: 'Travel Documents/Reimbursement Procedures.pdf', type: 'file', size: 850000, lastModified: new Date() },
          
          // Travel Documents/Forms/ folder (nested)
          { id: 'folder-forms', name: 'Forms', path: 'Travel Documents/Forms/', type: 'folder' },
          { id: 'file-form-expense', name: 'Expense Report Form.pdf', path: 'Travel Documents/Forms/Expense Report Form.pdf', type: 'file', size: 200000, lastModified: new Date() },
          { id: 'file-form-travel-request', name: 'Travel Request Form.pdf', path: 'Travel Documents/Forms/Travel Request Form.pdf', type: 'file', size: 180000, lastModified: new Date() },
          { id: 'file-form-advance', name: 'Travel Advance Request Form.pdf', path: 'Travel Documents/Forms/Travel Advance Request Form.pdf', type: 'file', size: 190000, lastModified: new Date() },
          
          // Travel Documents/Forms/Templates/ folder (nested level 3)
          { id: 'folder-templates', name: 'Templates', path: 'Travel Documents/Forms/Templates/', type: 'folder' },
          { id: 'file-template-expense', name: 'Expense Report Template.xlsx', path: 'Travel Documents/Forms/Templates/Expense Report Template.xlsx', type: 'file', size: 150000, lastModified: new Date() },
          { id: 'file-template-itinerary', name: 'Travel Itinerary Template.docx', path: 'Travel Documents/Forms/Templates/Travel Itinerary Template.docx', type: 'file', size: 120000, lastModified: new Date() },
          
          // Travel Documents/Forms/Templates/Versions/ folder (nested level 4)
          { id: 'folder-template-versions', name: 'Versions', path: 'Travel Documents/Forms/Templates/Versions/', type: 'folder' },
          { id: 'file-template-v2', name: 'Expense Template v2.0.xlsx', path: 'Travel Documents/Forms/Templates/Versions/Expense Template v2.0.xlsx', type: 'file', size: 160000, lastModified: new Date() },
          { id: 'file-template-v1', name: 'Expense Template v1.0.xlsx', path: 'Travel Documents/Forms/Templates/Versions/Expense Template v1.0.xlsx', type: 'file', size: 140000, lastModified: new Date() },
          { id: 'file-template-itinerary-v2', name: 'Itinerary Template v2.0.docx', path: 'Travel Documents/Forms/Templates/Versions/Itinerary Template v2.0.docx', type: 'file', size: 130000, lastModified: new Date() },
          
          // Accommodation/ folder (root level)
          { id: 'folder-accommodation', name: 'Accommodation', path: 'Accommodation/', type: 'folder' },
          { id: 'file-hotel-policy', name: 'Hotel Booking Policy.pdf', path: 'Accommodation/Hotel Booking Policy.pdf', type: 'file', size: 1100000, lastModified: new Date() },
          { id: 'file-hotel-guidelines', name: 'Hotel Selection Guidelines.pdf', path: 'Accommodation/Hotel Selection Guidelines.pdf', type: 'file', size: 1000000, lastModified: new Date() },
          { id: 'file-preferred-hotels', name: 'Preferred Hotel List.pdf', path: 'Accommodation/Preferred Hotel List.pdf', type: 'file', size: 800000, lastModified: new Date() },
          
          // Accommodation/Approved Vendors/ folder (nested)
          { id: 'folder-approved-vendors', name: 'Approved Vendors', path: 'Accommodation/Approved Vendors/', type: 'folder' },
          { id: 'file-vendor-marriott', name: 'Marriott Corporate Rates.pdf', path: 'Accommodation/Approved Vendors/Marriott Corporate Rates.pdf', type: 'file', size: 600000, lastModified: new Date() },
          { id: 'file-vendor-hilton', name: 'Hilton Corporate Rates.pdf', path: 'Accommodation/Approved Vendors/Hilton Corporate Rates.pdf', type: 'file', size: 580000, lastModified: new Date() },
          
          // Transportation/ folder (root level)
          { id: 'folder-transportation', name: 'Transportation', path: 'Transportation/', type: 'folder' },
          { id: 'file-airline-policy', name: 'Airline Booking Policy.pdf', path: 'Transportation/Airline Booking Policy.pdf', type: 'file', size: 1300000, lastModified: new Date() },
          { id: 'file-car-rental', name: 'Car Rental Policy.pdf', path: 'Transportation/Car Rental Policy.pdf', type: 'file', size: 900000, lastModified: new Date() },
          { id: 'file-ground-transport', name: 'Ground Transportation Guidelines.pdf', path: 'Transportation/Ground Transportation Guidelines.pdf', type: 'file', size: 750000, lastModified: new Date() },
          
          // Transportation/Airlines/ folder (nested)
          { id: 'folder-airlines', name: 'Airlines', path: 'Transportation/Airlines/', type: 'folder' },
          { id: 'file-airline-preferred', name: 'Preferred Airlines List.pdf', path: 'Transportation/Airlines/Preferred Airlines List.pdf', type: 'file', size: 700000, lastModified: new Date() },
          { id: 'file-airline-class', name: 'Airline Class Guidelines.pdf', path: 'Transportation/Airlines/Airline Class Guidelines.pdf', type: 'file', size: 650000, lastModified: new Date() },
          
          // Meal and Entertainment/ folder (root level)
          { id: 'folder-meal-entertainment', name: 'Meal and Entertainment', path: 'Meal and Entertainment/', type: 'folder' },
          { id: 'file-meal-policy', name: 'Meal Allowance Policy.pdf', path: 'Meal and Entertainment/Meal Allowance Policy.pdf', type: 'file', size: 950000, lastModified: new Date() },
          { id: 'file-entertainment', name: 'Entertainment Expense Policy.pdf', path: 'Meal and Entertainment/Entertainment Expense Policy.pdf', type: 'file', size: 850000, lastModified: new Date() },
          { id: 'file-per-diem', name: 'Per Diem Rates.pdf', path: 'Meal and Entertainment/Per Diem Rates.pdf', type: 'file', size: 500000, lastModified: new Date() },
          
          // Safety and Security/ folder (root level)
          { id: 'folder-safety-security', name: 'Safety and Security', path: 'Safety and Security/', type: 'folder' },
          { id: 'file-safety-guidelines', name: 'Travel Safety Guidelines.pdf', path: 'Safety and Security/Travel Safety Guidelines.pdf', type: 'file', size: 1200000, lastModified: new Date() },
          { id: 'file-security-protocol', name: 'Security Protocol for Travel.pdf', path: 'Safety and Security/Security Protocol for Travel.pdf', type: 'file', size: 1100000, lastModified: new Date() },
          { id: 'file-emergency-contacts', name: 'Emergency Contacts List.pdf', path: 'Safety and Security/Emergency Contacts List.pdf', type: 'file', size: 400000, lastModified: new Date() },
          
          // Safety and Security/Advisories/ folder (nested)
          { id: 'folder-advisories', name: 'Advisories', path: 'Safety and Security/Advisories/', type: 'folder' },
          { id: 'file-travel-advisory-2024', name: 'Travel Advisory 2024.pdf', path: 'Safety and Security/Advisories/Travel Advisory 2024.pdf', type: 'file', size: 800000, lastModified: new Date() },
          { id: 'file-country-warnings', name: 'Country Travel Warnings.pdf', path: 'Safety and Security/Advisories/Country Travel Warnings.pdf', type: 'file', size: 750000, lastModified: new Date() },
          
          // Additional root level travel documents
          { id: 'file-travel-faq', name: 'Travel Policy FAQ.pdf', path: 'Travel Policy FAQ.pdf', type: 'file', size: 1100000, lastModified: new Date() },
          { id: 'file-travel-updates', name: 'Travel Policy Updates 2024.pdf', path: 'Travel Policy Updates 2024.pdf', type: 'file', size: 1300000, lastModified: new Date() },
        ];
        
        // Return all travel policy documents (50+ documents with 10+ folders)
        // All connections show the full travel policy document set
        const mockFiles = allMockFiles;
        setS3Files(mockFiles);
        
        // Build tree structure for Option 1
        const tree = buildFileSystemTree(mockFiles);
        setFileSystemTree(tree);
        
        setIsLoadingS3Files(false);
      }, 500);
    } else {
      setS3Files([]);
      setFileSystemTree([]);
    }
  }, [modalSelectedConnectionId, connections, isSelectFilesModalOpen]);

  // Update checkbox indeterminate states when selection changes (for both Option 1 and Option 2)
  React.useEffect(() => {
    if (fileSystemTree.length > 0 && isSelectFilesModalOpen) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const updateCheckboxIndeterminate = (node: FileSystemItem) => {
          if (node.type === 'folder') {
            // Update tree view checkbox (Option 1)
            const treeCheckboxWrapper = document.getElementById(`tree-checkbox-wrapper-${node.id}`);
            if (treeCheckboxWrapper) {
              const input = treeCheckboxWrapper.querySelector('input[type="checkbox"]') as HTMLInputElement;
              if (input) {
                const isFullySelected = isFolderFullySelected(node, selectedS3Files);
                const isPartiallySelected = isFolderPartiallySelected(node, selectedS3Files);
                input.indeterminate = isPartiallySelected && !isFullySelected;
              }
            }
            // Update column view checkbox (Option 2)
            const columnCheckboxWrapper = document.getElementById(`column-checkbox-wrapper-${node.id}`);
            if (columnCheckboxWrapper) {
              const input = columnCheckboxWrapper.querySelector('input[type="checkbox"]') as HTMLInputElement;
              if (input) {
                const isFullySelected = isFolderFullySelected(node, selectedS3Files);
                const isPartiallySelected = isFolderPartiallySelected(node, selectedS3Files);
                input.indeterminate = isPartiallySelected && !isFullySelected;
              }
            }
          }
          if (node.children) {
            node.children.forEach(child => updateCheckboxIndeterminate(child));
          }
        };
        fileSystemTree.forEach(item => updateCheckboxIndeterminate(item));
      }, 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [selectedS3Files, fileSystemTree, isSelectFilesModalOpen, expandedFolders, columnNavigationPath]);

  // Reset selected evaluation source document if it's no longer in the documents list
  React.useEffect(() => {
    if (selectedEvaluationSourceDocument) {
      const docExists = documents.some(doc => doc.id === selectedEvaluationSourceDocument);
      if (!docExists) {
        setSelectedEvaluationSourceDocument(null);
      }
    }
  }, [documents, selectedEvaluationSourceDocument]);

  // Auto-scroll to upload progress section when new files start uploading
  React.useEffect(() => {
    if (uploadingFiles.length > 0) {
      // Small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        uploadStatusRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'nearest'
        });
      }, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [uploadingFiles.length]);

  // Clear connection-sourced documents when connection selection changes
  const prevConnectionIdRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    // Only clear documents if the connection actually changed (not on initial mount)
    if (prevConnectionIdRef.current !== null && prevConnectionIdRef.current !== selectedConnectionId) {
      // Remove all documents that came from connections (sourceType === 'connection')
      setDocuments(prevDocs => prevDocs.filter(doc => doc.sourceType !== 'connection'));
      // Clear selected S3 files in the modal
      setSelectedS3Files(new Set());
      // Close the modal if it's open
      if (isSelectFilesModalOpen) {
        setIsSelectFilesModalOpen(false);
      }
    }
    // Update the ref to track the current connection
    prevConnectionIdRef.current = selectedConnectionId;
  }, [selectedConnectionId, isSelectFilesModalOpen]);

  const handleOpenSelectFilesModal = () => {
    // Only open modal if a connection is selected
    if (selectedConnectionId) {
      setModalSelectedConnectionId(selectedConnectionId);
      setIsSelectFilesModalOpen(true);
    }
  };

  const handleCloseSelectFilesModal = () => {
    setIsSelectFilesModalOpen(false);
    setModalSelectedConnectionId(null);
    setSelectedS3Files(new Set());
    setExpandedFolders(new Set());
    setColumnNavigationPath([]);
    setColumnSearchValues({});
    setColumnSortOrder({});
    setTreeViewSearchValue('');
  };

  // Helper function to build hierarchical tree structure from flat file list
  const buildFileSystemTree = (files: S3FileItem[]): FileSystemItem[] => {
    const tree: FileSystemItem[] = [];
    const itemMap = new Map<string, FileSystemItem>();
    
    // Normalize paths - ensure folders end with '/' and create normalized key
    const normalizePath = (path: string, isFolder: boolean): string => {
      if (isFolder && !path.endsWith('/')) {
        return path + '/';
      }
      return path;
    };
    
    // First pass: create all items with normalized paths
    files.forEach(file => {
      const normalizedPath = normalizePath(file.path, file.type === 'folder');
      const pathParts = normalizedPath.split('/').filter(p => p);
      const level = pathParts.length - 1;
      
      // Determine parent path
      let parentPath: string | undefined;
      if (level > 0) {
        const parentParts = pathParts.slice(0, -1);
        parentPath = parentParts.join('/') + '/'; // Parent is always a folder, so ends with /
      }
      
      const item: FileSystemItem = {
        ...file,
        path: normalizedPath, // Use normalized path
        children: [],
        level,
        parentId: parentPath,
      };
      
      itemMap.set(normalizedPath, item);
    });
    
    // Second pass: build hierarchy by attaching children to parents
    itemMap.forEach((item, path) => {
      if (item.parentId) {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(item);
        } else {
          // Parent doesn't exist in the map, add to root
          tree.push(item);
        }
      } else {
        // Root level item (no parent)
        tree.push(item);
      }
    });
    
    // Sort: folders first, then files, both alphabetically
    const sortItems = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      }).map(item => ({
        ...item,
        children: item.children && item.children.length > 0 ? sortItems(item.children) : item.children,
      }));
    };
    
    return sortItems(tree);
  };

  // Get all descendant file IDs (recursive)
  const getAllDescendantFileIds = (item: FileSystemItem): string[] => {
    const ids: string[] = [];
    if (item.type === 'file') {
      ids.push(item.id);
    }
    if (item.children) {
      item.children.forEach(child => {
        ids.push(...getAllDescendantFileIds(child));
      });
    }
    return ids;
  };

  // Check if folder is fully selected
  const isFolderFullySelected = (item: FileSystemItem, selectedFiles: Set<string>): boolean => {
    if (item.type === 'file') return selectedFiles.has(item.id);
    if (!item.children || item.children.length === 0) return false;
    return item.children.every(child => isFolderFullySelected(child, selectedFiles));
  };

  // Check if folder is partially selected (indeterminate)
  const isFolderPartiallySelected = (item: FileSystemItem, selectedFiles: Set<string>): boolean => {
    if (item.type === 'file') return false;
    if (!item.children || item.children.length === 0) return false;
    const descendantIds = getAllDescendantFileIds(item);
    const selectedCount = descendantIds.filter(id => selectedFiles.has(id)).length;
    return selectedCount > 0 && selectedCount < descendantIds.length;
  };

  // Get count of selected files in a folder
  const getSelectedCount = (item: FileSystemItem, selectedFiles: Set<string>): { selected: number; total: number } => {
    if (item.type === 'file') {
      return { selected: selectedFiles.has(item.id) ? 1 : 0, total: 1 };
    }
    const descendantIds = getAllDescendantFileIds(item);
    const selectedCount = descendantIds.filter(id => selectedFiles.has(id)).length;
    return { selected: selectedCount, total: descendantIds.length };
  };

  // Column view helper functions for Option 2
  // Find an item in the tree by ID
  const findItemById = (items: FileSystemItem[], id: string): FileSystemItem | null => {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Get items to display in a column based on navigation path
  const getColumnItems = (path: string[]): FileSystemItem[] => {
    if (path.length === 0) {
      // Root level - show all root items
      return fileSystemTree;
    }
    
    // Navigate through the path to find the current folder
    let currentItems = fileSystemTree;
    for (const folderId of path) {
      const folder = findItemById(currentItems, folderId);
      if (folder && folder.children) {
        currentItems = folder.children;
      } else {
        return [];
      }
    }
    return currentItems;
  };

  // Get breadcrumb path names
  const getBreadcrumbPath = (): Array<{ id: string; name: string }> => {
    const breadcrumb: Array<{ id: string; name: string }> = [{ id: 'root', name: 'Root' }];
    
    let currentItems = fileSystemTree;
    for (const folderId of columnNavigationPath) {
      const folder = findItemById(currentItems, folderId);
      if (folder) {
        breadcrumb.push({ id: folder.id, name: folder.name });
        if (folder.children) {
          currentItems = folder.children;
        }
      }
    }
    return breadcrumb;
  };

  // Handle folder click in column view - navigate into folder
  const handleColumnFolderClick = (folderId: string) => {
    setColumnNavigationPath(prev => {
      // Find the index of this folder in the current path (if it exists)
      const index = prev.indexOf(folderId);
      if (index >= 0) {
        // Clicked on a folder in the path - navigate back to that level
        return prev.slice(0, index + 1);
      } else {
        // New folder - add to path
        return [...prev, folderId];
      }
    });
  };

  // Handle breadcrumb click - navigate to that level
  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      // Root clicked
      setColumnNavigationPath([]);
    } else {
      // Navigate to the folder at this index
      setColumnNavigationPath(prev => prev.slice(0, index));
    }
  };

  // Filter tree items based on search value
  const filterTreeItems = (items: FileSystemItem[], searchValue: string): FileSystemItem[] => {
    if (!searchValue.trim()) {
      return items;
    }
    
    const searchLower = searchValue.toLowerCase();
    const filtered: FileSystemItem[] = [];
    
    items.forEach(item => {
      const matchesName = item.name.toLowerCase().includes(searchLower);
      
      // If it's a folder, check if any children match
      if (item.type === 'folder' && item.children) {
        const filteredChildren = filterTreeItems(item.children, searchValue);
        if (matchesName || filteredChildren.length > 0) {
          filtered.push({
            ...item,
            children: filteredChildren,
          });
        }
      } else if (matchesName) {
        // File matches
        filtered.push(item);
      }
    });
    
    return filtered;
  };

  // Helper function to find all folder IDs that contain matching items
  const findFoldersWithMatches = (items: FileSystemItem[], searchValue: string): Set<string> => {
    const folderIds = new Set<string>();
    if (!searchValue.trim()) {
      return folderIds;
    }
    
    const searchLower = searchValue.toLowerCase();
    
    const checkItem = (item: FileSystemItem): boolean => {
      const matchesName = item.name.toLowerCase().includes(searchLower);
      
      if (item.type === 'folder' && item.children) {
        let hasMatchingDescendant = false;
        item.children.forEach(child => {
          if (checkItem(child)) {
            hasMatchingDescendant = true;
          }
        });
        
        if (hasMatchingDescendant) {
          folderIds.add(item.id);
          return true;
        }
      }
      
      return matchesName;
    };
    
    items.forEach(item => checkItem(item));
    return folderIds;
  };

  // Auto-expand folders when search is active
  React.useEffect(() => {
    if (treeViewSearchValue.trim() && fileSystemTree.length > 0) {
      const foldersToExpand = findFoldersWithMatches(fileSystemTree, treeViewSearchValue);
      if (foldersToExpand.size > 0) {
        setExpandedFolders(prev => {
          const newSet = new Set(prev);
          foldersToExpand.forEach(id => newSet.add(id));
          return newSet;
        });
      }
    }
  }, [treeViewSearchValue, fileSystemTree]);

  // Acceptable file extensions (for MVP: JSON only, but we'll support common document types)
  const ACCEPTABLE_EXTENSIONS = ['.json', '.pdf', '.txt', '.md', '.yaml', '.yml', '.csv'];
  
  // Check if a file has an acceptable extension
  const isAcceptableFile = (item: FileSystemItem): boolean => {
    if (item.type === 'folder') return true; // Folders are always acceptable
    const extension = item.name.toLowerCase().substring(item.name.lastIndexOf('.'));
    return ACCEPTABLE_EXTENSIONS.includes(extension);
  };

  // Filter and sort items for a column
  const getFilteredAndSortedItems = (items: FileSystemItem[], columnId: string): FileSystemItem[] => {
    let filtered = items;
    
    // Apply search filter
    const searchValue = columnSearchValues[columnId]?.toLowerCase() || '';
    if (searchValue) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchValue)
      );
    }
    
    // Apply sorting
    const sortOrder = columnSortOrder[columnId] || 'asc';
    filtered = [...filtered].sort((a, b) => {
      // Folders first, then files
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      // Then alphabetically
      const comparison = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  };

  // Get column ID for state management
  const getColumnId = (index: number, folderId?: string): string => {
    if (index === 0) return 'root';
    return folderId || `column-${index}`;
  };

  // Handle search change for a column
  const handleColumnSearchChange = (columnId: string, value: string) => {
    setColumnSearchValues(prev => ({
      ...prev,
      [columnId]: value,
    }));
  };

  // Handle sort toggle for a column
  const handleColumnSortToggle = (columnId: string) => {
    setColumnSortOrder(prev => ({
      ...prev,
      [columnId]: prev[columnId] === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Toggle folder expansion
  const handleToggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // Handle file/folder selection in tree view
  const handleTreeItemToggle = (item: FileSystemItem) => {
    const newSet = new Set(selectedS3Files);
    const descendantIds = getAllDescendantFileIds(item);
    const isCurrentlySelected = descendantIds.every(id => newSet.has(id));
    
    if (isCurrentlySelected) {
      // Deselect all descendants
      descendantIds.forEach(id => newSet.delete(id));
    } else {
      // Select all descendants
      descendantIds.forEach(id => newSet.add(id));
    }
    
    setSelectedS3Files(newSet);
  };

  const handleS3FileToggle = (fileId: string) => {
    const newSet = new Set(selectedS3Files);
    if (newSet.has(fileId)) {
      newSet.delete(fileId);
    } else {
      newSet.add(fileId);
    }
    setSelectedS3Files(newSet);
  };

  const handleSelectAllS3Files = (checked: boolean) => {
    if (checked) {
      const allFileIds = new Set(s3Files.map(file => file.id));
      setSelectedS3Files(allFileIds);
    } else {
      setSelectedS3Files(new Set());
    }
  };

  const handleAddSelectedS3Files = () => {
    const selectedFiles = s3Files.filter(file => selectedS3Files.has(file.id));
    const newDocuments: Document[] = selectedFiles.map(file => ({
      id: file.id,
      name: file.name,
      type: file.type === 'folder' ? 'Folder' : file.name.split('.').pop()?.toUpperCase() || 'File',
      uploaded: file.lastModified || new Date(),
      sourceType: 'connection' as const,
    }));
    setDocuments([...documents, ...newDocuments]);
    setHasAddedDocuments(true);
    handleCloseSelectFilesModal();
  };

  const handleFileDrop = (_event: unknown, droppedFiles: File[]) => {
    // Add files to uploading state with initial progress
    const newUploadFiles: UploadFileProgress[] = droppedFiles.map((file, index) => ({
      id: Date.now().toString() + index + Math.random().toString(36).substr(2, 9) + file.name,
      file,
      progress: 0,
      status: 'uploading' as const,
    }));
    
    setUploadingFiles([...uploadingFiles, ...newUploadFiles]);
    
    // Simulate upload process with progress updates, then add to documents
    // Make uploads take 4-5 seconds to clearly demonstrate progress
    newUploadFiles.forEach((uploadFile) => {
      let progress = 0;
      const totalDuration = 4000 + Math.random() * 1000; // 4-5 seconds
      const updateInterval = 100; // Update every 100ms for smooth progress
      const progressIncrement = 100 / (totalDuration / updateInterval);
      
      const progressInterval = setInterval(() => {
        progress += progressIncrement + (Math.random() * 2 - 1); // Small random variation
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          
          // Mark as complete
          setUploadingFiles(prevFiles =>
            prevFiles.map(f =>
              f.id === uploadFile.id ? { ...f, progress: 100, status: 'complete' as const } : f
            )
          );
          
          // Add to documents after a short delay to show completion
          setTimeout(() => {
            const newDocument: Document = {
              id: uploadFile.id,
              name: uploadFile.file.name,
              type: uploadFile.file.type || uploadFile.file.name.split('.').pop()?.toUpperCase() || 'Unknown',
              uploaded: new Date(),
              sourceType: 'document' as const,
            };
            setDocuments(prevDocs => [...prevDocs, newDocument]);
            setUploadingFiles(prevFiles => prevFiles.filter(f => f.id !== uploadFile.id));
            setHasAddedDocuments(true);
          }, 500);
        } else {
          // Update progress
          setUploadingFiles(prevFiles =>
            prevFiles.map(f =>
              f.id === uploadFile.id ? { ...f, progress: Math.min(progress, 99.9) } : f
            )
          );
        }
      }, updateInterval);
    });
  };

  const handleAddConnection = () => {
    setIsAddConnectionModalOpen(true);
  };

  const handleConnectionSubmit = () => {
    // Validate required fields for S3 connections
    if (connectionName.trim() && accessKey.trim() && secretKey.trim()) {
      // Check if connection name already exists
      const connectionExists = connections.some(conn => conn.name.trim().toLowerCase() === connectionName.trim().toLowerCase());
      
      if (!connectionExists) {
        const newConnection: Connection = {
          id: Date.now().toString(),
          name: connectionName.trim(),
          type: 'S3 Bucket',
          accessKey: accessKey.trim() || undefined,
          secretKey: secretKey.trim() || undefined,
          bucketName: bucketName.trim() || undefined,
          endpoint: endpoint.trim() || undefined,
          region: region.trim() || undefined,
          createdAt: new Date(),
        };
        setConnections([...connections, newConnection]);
        
        // Automatically select the newly created connection
        setSelectedConnectionId(newConnection.id);
        
        // Reset form and close modal
        setConnectionName('');
        setAccessKey('');
        setSecretKey('');
        setBucketName('');
        setEndpoint('');
        setRegion('');
        setIsAddConnectionModalOpen(false);
      }
    }
  };

  const handleConnectionModalClose = () => {
    setConnectionName('');
    setAccessKey('');
    setSecretKey('');
    setBucketName('');
    setEndpoint('');
    setRegion('');
    setIsAddConnectionModalOpen(false);
  };


  const handleRunExperiment = () => {
    // TODO: Implement experiment run
    console.log('Run experiment clicked', {
      vectorDatabase,
      evaluationSourceFile: evaluationSourceFile?.name || null,
      evaluationSourceDocument: selectedEvaluationSourceDocument ? documents.find(d => d.id === selectedEvaluationSourceDocument)?.name || null : null,
      foundationModels: Array.from(selectedFoundationModels),
      embeddingModels: Array.from(selectedEmbeddingModels),
      criteria: criteria,
    });
    
    // Update experiment status to Processing
    if (selectedExperimentId) {
      setExperiments(prevExperiments => prevExperiments.map(exp => {
        if (exp.id === selectedExperimentId) {
          return { ...exp, status: 'Processing', isRunning: true };
        }
        return exp;
      }));
    }
    
    // Simulate experiment running and completion
    setExperimentRunning(true);
    setIsConfiguring(false);
    
    // Mock results data - all results are Complete when experiment finishes
    const mockResults: PatternResult[] = [
      {
        id: '1',
        rank: 1,
        patternName: 'Pattern 1',
        modelName: 'llama-4-ma',
        answerFaithfulness: 0.95,
        chunkMethod: 'Semantic',
        chunkSize: 512,
        status: 'Complete',
      },
      {
        id: '2',
        rank: 2,
        patternName: 'Pattern 2',
        modelName: 'gpt-oss-120b',
        answerFaithfulness: 0.92,
        chunkMethod: 'Fixed',
        chunkSize: 256,
        status: 'Complete',
      },
      {
        id: '3',
        rank: 3,
        patternName: 'Pattern 3',
        modelName: 'gpt-oss-120b',
        answerFaithfulness: 0.89,
        chunkMethod: 'Semantic',
        chunkSize: 1024,
        status: 'Complete',
      },
      {
        id: '4',
        rank: 4,
        patternName: 'Pattern 4',
        modelName: 'llama-4-ma',
        answerFaithfulness: 0.87,
        chunkMethod: 'Fixed',
        chunkSize: 512,
        status: 'Complete',
      },
      {
        id: '5',
        rank: 5,
        patternName: 'Pattern 5',
        modelName: 'llama-3-3-70b',
        answerFaithfulness: 0.85,
        chunkMethod: 'Semantic',
        chunkSize: 256,
        status: 'Complete',
      },
      {
        id: '6',
        rank: 6,
        patternName: 'Pattern 6',
        modelName: 'llama-3-3-70b',
        answerFaithfulness: 0.83,
        chunkMethod: 'Fixed',
        chunkSize: 1024,
        status: 'Complete',
      },
    ];
    
    // Simulate async experiment completion
    setTimeout(() => {
      setPatternResults(mockResults);
      setExperimentRunning(false);
      setExperimentCompleted(true);
      
      // Update experiment status to completed
      if (selectedExperimentId) {
        setExperiments(prevExperiments => prevExperiments.map(exp => {
          if (exp.id === selectedExperimentId) {
            return { ...exp, status: 'completed', isRunning: false };
          }
          return exp;
        }));
      }
    }, 1000);
  };

  const handleViewDetails = (patternId: string) => {
    const pattern = patternResults.find(p => p.id === patternId);
    if (pattern) {
      setSelectedPatternForDetails(pattern);
      setIsPatternDetailsModalOpen(true);
    }
  };

  const handleViewCode = (patternId: string) => {
    // TODO: Implement view code
    console.log('View code for pattern:', patternId);
  };

  const handleSort = (columnName: string) => {
    if (sortBy === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnName);
      setSortDirection('asc');
    }
  };

  const getSortedResults = (): PatternResult[] => {
    const sorted = [...patternResults].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'rank':
          comparison = a.rank - b.rank;
          break;
        case 'patternName':
          comparison = a.patternName.localeCompare(b.patternName);
          break;
        case 'modelName':
          comparison = a.modelName.localeCompare(b.modelName);
          break;
        case 'answerFaithfulness':
          comparison = a.answerFaithfulness - b.answerFaithfulness;
          break;
        case 'chunkMethod':
          comparison = a.chunkMethod.localeCompare(b.chunkMethod);
          break;
        case 'chunkSize':
          comparison = a.chunkSize - b.chunkSize;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          return 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  };

  const handleViewExperimentDetails = () => {
    // TODO: Implement view experiment details
    console.log('View experiment details');
  };

  const handleViewExperimentCode = () => {
    // TODO: Implement view experiment code
    console.log('View experiment code');
  };

  const handleBreadcrumbNavigation = (target: string) => {
    switch (target) {
      case 'project':
        // Navigate back to experiments list
        handleCancel();
        break;
      case 'experiment':
        // Navigate back to configuration from results page
        if (experimentCompleted) {
          setExperimentCompleted(false);
          setExperimentRunning(false);
          setPatternResults([]);
          setIsConfiguring(true);
        }
        break;
      default:
        break;
    }
  };

  // Update experiment status based on current state
  React.useEffect(() => {
    if (selectedExperimentId) {
      setExperiments(prevExperiments => prevExperiments.map(exp => {
        if (exp.id === selectedExperimentId) {
          let status: Experiment['status'] = 'incomplete';
          if (experimentRunning) {
            status = 'Processing';
          } else if (experimentCompleted) {
            status = 'completed';
          } else if (documents.length > 0 && (evaluationSourceFile || selectedEvaluationSourceDocument) && vectorDatabase && criteria && (selectedFoundationModels.size > 0 || selectedEmbeddingModels.size > 0)) {
            status = 'incomplete'; // Still incomplete until run
          } else if (documents.length === 0 && !evaluationSourceFile && !selectedEvaluationSourceDocument) {
            status = 'incomplete';
          }
          
          return {
            ...exp,
            status,
            hasDocuments: documents.length > 0,
            hasConfigurations: documents.length > 0 && (evaluationSourceFile !== null || selectedEvaluationSourceDocument !== null) && vectorDatabase !== '',
            isRunning: experimentRunning,
            lastSaved: new Date(),
          };
        }
        return exp;
      }));
    }
  }, [documents.length, evaluationSourceFile, selectedEvaluationSourceDocument, vectorDatabase, criteria, selectedFoundationModels.size, selectedEmbeddingModels.size, experimentRunning, experimentCompleted, selectedExperimentId]);

  // Handle clicking on experiment name to navigate
  const handleExperimentClick = (experiment: Experiment) => {
    setSelectedExperimentId(experiment.id);
    setExperimentName(experiment.name);
    setName(experiment.name);
    setDescription(experiment.description);
    setTags(experiment.tags);
    setExperimentCreated(true);
    setIsCreating(false);
    
    // If experiment is completed, show results page
    if (experiment.status === 'completed') {
      setIsConfiguring(false);
      setExperimentCompleted(true);
      setExperimentRunning(false);
      // Load mock results for completed-test experiment
      if (experiment.id === 'completed-test') {
        const mockResults: PatternResult[] = [
          {
            id: '1',
            rank: 1,
            patternName: 'Pattern 1',
            modelName: 'llama-4-ma',
            answerFaithfulness: 0.95,
            chunkMethod: 'Semantic',
            chunkSize: 512,
            status: 'Complete',
          },
          {
            id: '2',
            rank: 2,
            patternName: 'Pattern 2',
            modelName: 'gpt-oss-120b',
            answerFaithfulness: 0.92,
            chunkMethod: 'Fixed',
            chunkSize: 256,
            status: 'Complete',
          },
          {
            id: '3',
            rank: 3,
            patternName: 'Pattern 3',
            modelName: 'gpt-oss-120b',
            answerFaithfulness: 0.89,
            chunkMethod: 'Semantic',
            chunkSize: 1024,
            status: 'Complete',
          },
          {
            id: '4',
            rank: 4,
            patternName: 'Pattern 4',
            modelName: 'llama-4-ma',
            answerFaithfulness: 0.87,
            chunkMethod: 'Fixed',
            chunkSize: 512,
            status: 'Complete',
          },
          {
            id: '5',
            rank: 5,
            patternName: 'Pattern 5',
            modelName: 'llama-3-3-70b',
            answerFaithfulness: 0.85,
            chunkMethod: 'Semantic',
            chunkSize: 256,
            status: 'Complete',
          },
          {
            id: '6',
            rank: 6,
            patternName: 'Pattern 6',
            modelName: 'llama-3-3-70b',
            answerFaithfulness: 0.83,
            chunkMethod: 'Fixed',
            chunkSize: 1024,
            status: 'Complete',
          },
        ];
        setPatternResults(mockResults);
      }
    } else {
      // Navigate to configurations page for incomplete/processing experiments
      setIsConfiguring(true);
      setExperimentCompleted(false);
      setExperimentRunning(experiment.status === 'Processing');
    }
    
    // If experiment has documents/configurations, load them
    // TODO: Load experiment data from storage/API
  };


  const handleFoundationModelToggle = (modelId: string) => {
    const newSet = new Set(selectedFoundationModels);
    if (newSet.has(modelId)) {
      newSet.delete(modelId);
    } else {
      newSet.add(modelId);
    }
    setSelectedFoundationModels(newSet);
    // Update "select all" based on whether all models are selected
    const allSelected = foundationModels.every(model => newSet.has(model.id));
    setSelectAllFoundation(allSelected);
  };

  const handleEmbeddingModelToggle = (modelId: string) => {
    const newSet = new Set(selectedEmbeddingModels);
    if (newSet.has(modelId)) {
      newSet.delete(modelId);
    } else {
      newSet.add(modelId);
    }
    setSelectedEmbeddingModels(newSet);
    // Update "select all" based on whether all models are selected
    const allSelected = embeddingModels.every(model => newSet.has(model.id));
    setSelectAllEmbedding(allSelected);
  };

  const handleSelectAllFoundation = (checked: boolean) => {
    setSelectAllFoundation(checked);
    if (checked) {
      setSelectedFoundationModels(new Set(foundationModels.map(m => m.id)));
    } else {
      setSelectedFoundationModels(new Set());
    }
  };

  const handleSelectAllEmbedding = (checked: boolean) => {
    setSelectAllEmbedding(checked);
    if (checked) {
      setSelectedEmbeddingModels(new Set(embeddingModels.map(m => m.id)));
    } else {
      setSelectedEmbeddingModels(new Set());
    }
  };

  const handleCriteriaChange = (criterion: string) => {
    setCriteria(criterion);
  };

  const handleOpenEvaluationSettingsModal = () => {
    // Store initial values when modal opens
    setInitialFoundationModels(new Set(selectedFoundationModels));
    setInitialEmbeddingModels(new Set(selectedEmbeddingModels));
    setInitialCriteria(criteria);
    setIsEvaluationSettingsModalOpen(true);
  };

  const handleSaveEvaluationSettings = () => {
    // Update initial values to current values after save
    setInitialFoundationModels(new Set(selectedFoundationModels));
    setInitialEmbeddingModels(new Set(selectedEmbeddingModels));
    setInitialCriteria(criteria);
    setIsEvaluationSettingsModalOpen(false);
  };

  const handleCancelEvaluationSettings = () => {
    // Revert to initial values
    setSelectedFoundationModels(new Set(initialFoundationModels));
    setSelectedEmbeddingModels(new Set(initialEmbeddingModels));
    setCriteria(initialCriteria);
    setIsEvaluationSettingsModalOpen(false);
  };

  const hasEvaluationSettingsChanged = () => {
    // Check if foundation models changed
    if (selectedFoundationModels.size !== initialFoundationModels.size) {
      return true;
    }
    for (const model of selectedFoundationModels) {
      if (!initialFoundationModels.has(model)) {
        return true;
      }
    }
    
    // Check if embedding models changed
    if (selectedEmbeddingModels.size !== initialEmbeddingModels.size) {
      return true;
    }
    for (const model of selectedEmbeddingModels) {
      if (!initialEmbeddingModels.has(model)) {
        return true;
      }
    }
    
    // Check if criteria changed
    if (criteria !== initialCriteria) {
      return true;
    }
    
    return false;
  };


  const evaluationDataTemplate = [
    {
      question: "<text>",
      correct_answer: "<text>",
      correct_answer_document_ids: [
        "<file>",
        "<file>"
      ]
    },
    {
      question: "<text>",
      correct_answer: "<text>",
      correct_answer_document_ids: [
        "<file>",
        "<file>"
      ]
    },
    {
      question: "<text>",
      correct_answer: "<text>",
      correct_answer_document_ids: [
        "<file>",
        "<file>"
      ]
    }
  ];

  const handleDownloadTemplate = () => {
    const dataStr = JSON.stringify(evaluationDataTemplate, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'evaluation-data-template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    const codeText = JSON.stringify(evaluationDataTemplate, null, 2);
    navigator.clipboard.writeText(codeText).then(() => {
      // Could add a toast notification here if needed
      console.log('Code copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy code:', err);
    });
  };

  // Dev tool drag handlers
  const handleDevToolMouseDown = (e: React.MouseEvent) => {
    if (!devToolRef.current) return;
    const rect = devToolRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setDevToolPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
  }, [isDragging, dragOffset]);

  // Dev tool state switchers
  const handleSwitchToEmptyState = () => {
    setExperiments([]);
    setExperimentCreated(false);
    setIsCreating(false);
    setIsConfiguring(false);
    setExperimentCompleted(false);
    setExperimentRunning(false);
    setSelectedExperimentId(null);
  };

  const handleSwitchToTableView = () => {
    // Ensure we have at least the completed-test experiment
    if (experiments.length === 0) {
      const completedTestExperiment: Experiment = {
        id: 'completed-test',
        name: 'completed-test',
        description: 'Demo completed experiment with test results',
        tags: ['demo', 'test', 'rag'],
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastSaved: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        hasDocuments: true,
        hasConfigurations: true,
        isRunning: false,
      };
      setExperiments([completedTestExperiment]);
    }
    setExperimentCreated(false);
    setIsCreating(false);
    setIsConfiguring(false);
    setExperimentCompleted(false);
    setExperimentRunning(false);
    setSelectedExperimentId(null);
  };

  return (
    <>
      {/* Breadcrumb Navigation */}
      {flags.showProjectWorkspaceDropdowns && experimentCreated && (
        <PageSection style={{ paddingTop: '0.5rem', paddingBottom: '0.25rem' }} id="autorag-breadcrumb">
          <Breadcrumb id="autorag-breadcrumb-nav">
            {/* State 2: Experiment created - on configuration page */}
            {!isCreating && experimentCreated && isConfiguring && !experimentCompleted && (
              <BreadcrumbItem
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleBreadcrumbNavigation('project');
                }}
                id="breadcrumb-project"
              >
                AutoRAG: {selectedProject}
              </BreadcrumbItem>
            )}
            {!isCreating && experimentCreated && isConfiguring && !experimentCompleted && (
              <BreadcrumbItem isActive id="breadcrumb-experiment-name">
                {experimentName}
              </BreadcrumbItem>
            )}

            {/* State 3: Experiment completed - on results page */}
            {!isCreating && experimentCreated && experimentCompleted && (
              <BreadcrumbItem
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleBreadcrumbNavigation('project');
                }}
                id="breadcrumb-project"
              >
                AutoRAG: {selectedProject}
              </BreadcrumbItem>
            )}
            {!isCreating && experimentCreated && experimentCompleted && (
              <BreadcrumbItem
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleBreadcrumbNavigation('experiment');
                }}
                id="breadcrumb-experiment-name"
              >
                {experimentName}
              </BreadcrumbItem>
            )}
            {!isCreating && experimentCreated && experimentCompleted && (
              <BreadcrumbItem isActive id="breadcrumb-results">
                {experimentName} experiment results
              </BreadcrumbItem>
            )}
          </Breadcrumb>
        </PageSection>
      )}

      {/* Title Section */}
      <PageSection id="autorag-header">
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>
            <Title headingLevel="h2" size="xl" id="autorag-title">
              {isCreating
                ? 'Create AutoRAG experiment'
                : experimentCompleted 
                ? `${experimentName} experiment results`
                : experimentCreated 
                ? experimentName 
                : 'AutoRAG'}
            </Title>
          </FlexItem>
        </Flex>
        {!experimentCreated && (
          <div style={{ color: 'var(--pf-v5-global--Color--200)', marginTop: '0.5rem' }}>
            Automatically configure and optimize your Retrieval-Augmented Generation workflows.
          </div>
        )}
        {experimentCompleted && (
          <Flex spaceItems={{ default: 'spaceItemsSm' }} style={{ marginTop: '0.5rem' }}>
            <FlexItem>
              <Button
                variant="link"
                isInline
                onClick={handleViewExperimentDetails}
                id="header-view-details-link"
              >
                View details
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                variant="link"
                isInline
                onClick={handleViewExperimentCode}
                id="header-view-code-link"
              >
                View code
              </Button>
            </FlexItem>
          </Flex>
        )}
  </PageSection>

      {/* Project Selector - Only show on empty state page */}
      {flags.showProjectWorkspaceDropdowns && !isCreating && !experimentCreated && (
        <PageSection style={{ paddingTop: '0.5rem', paddingBottom: '0.25rem' }} id="autorag-project-selector">
          <Toolbar>
            <ToolbarContent>
              <ToolbarGroup>
                <ToolbarItem>
                  <InputGroup>
                    <InputGroupItem>
                      <div className="pf-v6-c-input-group__text">
                        <OutlinedFolderIcon /> Project
                      </div>
                    </InputGroupItem>
                    <InputGroupItem>
                      <Select
                        isOpen={isProjectSelectOpen}
                        selected={selectedProject}
                        onSelect={(_event, value) => {
                          setSelectedProject(value as string);
                          setIsProjectSelectOpen(false);
                        }}
                        onOpenChange={(isOpen) => setIsProjectSelectOpen(isOpen)}
                        toggle={(toggleRef) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setIsProjectSelectOpen(!isProjectSelectOpen)}
                            isExpanded={isProjectSelectOpen}
                            style={{ width: '200px' }}
                            id="autorag-project-select-toggle"
                          >
                            {selectedProject}
                          </MenuToggle>
                        )}
                        shouldFocusToggleOnSelect
                        id="autorag-project-select"
                      >
                        <SelectList>
                          <SelectOption value="Project X">Project X</SelectOption>
                          <SelectOption value="Project Y">Project Y</SelectOption>
                        </SelectList>
                      </Select>
                    </InputGroupItem>
                  </InputGroup>
                </ToolbarItem>
              </ToolbarGroup>
            </ToolbarContent>
          </Toolbar>
        </PageSection>
      )}

      {/* Content: Empty State, Form, Experiment View, or Results */}
      <PageSection 
        style={{ 
          paddingTop: '0.5rem',
          paddingBottom: 0,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          position: 'relative',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 200px)'
        }} 
        id="autorag-content"
      >
        {experimentRunning ? (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
            {/* State 1: Experiment Running - Empty Table */}
            <Card id="experiment-running-card">
              <CardHeader>
                <CardTitle>
                  <Title headingLevel="h2" size="lg" id="experiment-running-title">
                    Results
                  </Title>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <EmptyState>
                  <EmptyStateBody>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <SyncIcon style={{ fontSize: '3rem', color: 'var(--pf-v5-global--primary-color--100)' }} />
                      <Title headingLevel="h3" size="md" id="experiment-running-subtitle">
                        Experiment is running
                      </Title>
                      <div style={{ color: 'var(--pf-v5-global--Color--200)', textAlign: 'center', maxWidth: '600px', lineHeight: '1.6' }}>
                        <p style={{ marginBottom: '1rem' }}>
                          Your experiment is currently processing. Results can take some time to complete.
                        </p>
                        <p>
                          Please check back later for your results. You can view the status of your running experiments on the{' '}
                          <Button
                            variant="link"
                            isInline
                            onClick={() => {
                              // Reset to main page showing experiments table
                              // Keep experiments but reset view state
                              setExperimentCreated(false);
                              setIsConfiguring(false);
                              setExperimentCompleted(false);
                              setExperimentRunning(false);
                              setPatternResults([]);
                              setSelectedExperimentId(null);
                            }}
                            style={{ fontWeight: 'normal', fontSize: 'inherit', padding: 0, verticalAlign: 'baseline' }}
                            id="autorag-main-page-link"
                          >
                            AutoRAG main page
                          </Button>
                          .
                        </p>
                      </div>
                    </div>
                  </EmptyStateBody>
                </EmptyState>
              </CardBody>
            </Card>
          </div>
        ) : experimentCompleted && patternResults.length > 0 && patternResults.every(r => r.status === 'Complete') ? (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
            {/* State 2: Experiment Completed - Show Results Table */}
            {/* Pipeline Visualization */}
            <Card id="pipeline-visualization-card">
              <CardHeader>
                <CardTitle>
                  <Title headingLevel="h2" size="lg" id="pipeline-section-title">
                    Experiment Pipeline
                  </Title>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div style={{ 
                  padding: '2rem', 
                  backgroundColor: 'var(--pf-v5-global--BackgroundColor--200)', 
                  borderRadius: '4px',
                  border: '1px solid var(--pf-v5-global--BorderColor--100)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <img 
                    src={PipelineVisualization} 
                    alt="AutoRAG Pipeline Visualization showing the experiment flow from document collection through evaluation with multiple models" 
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto',
                      display: 'block'
                    }}
                    id="pipeline-visualization-image"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Results Table - Only shown when all results are complete */}
            <Card id="results-table-card" style={{ marginTop: '20px' }}>
              <CardHeader>
                <CardTitle>
                  <Title headingLevel="h2" size="lg" id="autorag-results-table-title">
                    Results
                  </Title>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Table aria-label="Pattern results table" variant="compact" id="autorag-results-table">
              <Thead>
                <Tr>
                  <Th
                    sort={{
                      sortBy: { index: 0, direction: sortBy === 'rank' ? sortDirection : undefined },
                      onSort: () => handleSort('rank'),
                      columnIndex: 0,
                    }}
                  >
                    Rank
                  </Th>
                  <Th
                    sort={{
                      sortBy: { index: 1, direction: sortBy === 'patternName' ? sortDirection : undefined },
                      onSort: () => handleSort('patternName'),
                      columnIndex: 1,
                    }}
                  >
                    Pattern name
                  </Th>
                  <Th
                    sort={{
                      sortBy: { index: 2, direction: sortBy === 'modelName' ? sortDirection : undefined },
                      onSort: () => handleSort('modelName'),
                      columnIndex: 2,
                    }}
                  >
                    Model name
                  </Th>
                  <Th
                    sort={{
                      sortBy: { index: 3, direction: sortBy === 'answerFaithfulness' ? sortDirection : undefined },
                      onSort: () => handleSort('answerFaithfulness'),
                      columnIndex: 3,
                    }}
                  >
                    Answer faithfulness
                  </Th>
                  <Th
                    sort={{
                      sortBy: { index: 4, direction: sortBy === 'chunkMethod' ? sortDirection : undefined },
                      onSort: () => handleSort('chunkMethod'),
                      columnIndex: 4,
                    }}
                  >
                    Chunk method
                  </Th>
                  <Th
                    sort={{
                      sortBy: { index: 5, direction: sortBy === 'chunkSize' ? sortDirection : undefined },
                      onSort: () => handleSort('chunkSize'),
                      columnIndex: 5,
                    }}
                  >
                    Chunk size
                  </Th>
                  <Th width={30}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {getSortedResults().map((result, index) => {
                  const isRankOne = result.rank === 1;
                  const baseBackgroundColor = index % 2 === 0 
                    ? 'var(--pf-v5-global--BackgroundColor--200)' 
                    : 'transparent';
                  const rankOneBackgroundColor = '#fffaec';
                  const isLinkEnabled = true; // All results are complete, so all links are enabled
                  
                  return (
                  <Tr 
                    key={result.id} 
                    id={`result-row-${result.id}`}
                    style={{
                      backgroundColor: isRankOne ? rankOneBackgroundColor : baseBackgroundColor,
                      borderLeft: isRankOne ? '4px solid #f0ab00' : '4px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isRankOne 
                        ? '#fef0cd' 
                        : 'var(--pf-v5-global--BackgroundColor--200)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isRankOne 
                        ? rankOneBackgroundColor 
                        : baseBackgroundColor;
                    }}
                  >
                    <Td dataLabel="Rank">
                      {isRankOne ? (
                        <Badge 
                          style={{ 
                            backgroundColor: '#f0ab00',
                            color: '#151515',
                            fontWeight: 'bold',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px'
                          }}
                        >
                          {result.rank}
                        </Badge>
                      ) : (
                        result.rank
                      )}
                    </Td>
                    <Td 
                      dataLabel="Pattern name"
                      style={isRankOne ? { fontWeight: 'bold' } : {}}
                    >
                      {result.patternName}
                    </Td>
                    <Td dataLabel="Model name">{result.modelName}</Td>
                    <Td 
                      dataLabel="Answer faithfulness"
                      style={isRankOne ? { fontWeight: 'bold', color: '#f0ab00' } : {}}
                    >
                      {result.answerFaithfulness.toFixed(2)}
                    </Td>
                    <Td dataLabel="Chunk method">{result.chunkMethod}</Td>
                    <Td dataLabel="Chunk size">{result.chunkSize}</Td>
                    <Td dataLabel="Actions">
                      <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                        <FlexItem>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (isLinkEnabled) handleViewDetails(result.id);
                            }}
                            id={`view-details-${result.id}`}
                            style={{
                              color: isLinkEnabled ? '#0066cc' : '#6a6e73',
                              textDecoration: 'none',
                              cursor: isLinkEnabled ? 'pointer' : 'not-allowed',
                              pointerEvents: isLinkEnabled ? 'auto' : 'none'
                            }}
                          >
                            View details
                          </a>
                        </FlexItem>
                        <FlexItem>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (isLinkEnabled) handleViewCode(result.id);
                            }}
                            id={`view-code-${result.id}`}
                            style={{
                              color: isLinkEnabled ? '#0066cc' : '#6a6e73',
                              textDecoration: 'none',
                              cursor: isLinkEnabled ? 'pointer' : 'not-allowed',
                              pointerEvents: isLinkEnabled ? 'auto' : 'none'
                            }}
                          >
                            Download for notebook
                          </a>
                        </FlexItem>
                      </Flex>
                    </Td>
                  </Tr>
                  );
                })}
              </Tbody>
            </Table>
              </CardBody>
            </Card>
          </div>
        ) : experimentCreated ? (
          <>
            {/* Configuration Screen */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              flex: 1, 
              minHeight: 0,
              height: '100%',
              position: 'relative',
              overflow: 'hidden' // Prevent container from growing beyond PageSection
            }}>
            <div style={{ 
              flex: 1, 
              overflow: 'hidden', 
              minHeight: 0,
              height: '100%',
              paddingBottom: '80px' // Space for footer
            }}>
              <Grid hasGutter>
                {/* Column 1: Documents */}
                <GridItem span={4} style={{ display: 'flex' }}>
                <Card id="autorag-documents-card" style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', height: 'calc(100vh - 280px)', maxHeight: 'calc(100vh - 280px)', overflow: 'hidden' }}>
                  <CardHeader style={{ flexShrink: 0 }}>
                    <CardTitle>
                      <Title headingLevel="h2" size="md" id="autorag-documents-title" style={{ color: 'var(--pf-v5-global--primary-color--100)' }}>
                        Documents
                      </Title>
                    </CardTitle>
                  </CardHeader>
                  <CardBody style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, maxHeight: 'calc(100vh - 360px)', padding: 'var(--pf-v5-global--spacer--md)' }}>
                    {/* Body Copy */}
                    <div style={{ color: 'var(--pf-v5-global--Color--200)', fontSize: 'var(--pf-v5-global--FontSize--sm)', marginBottom: '20px' }}>
                        Select or add an S3 connection to upload files or browse existing files.
                    </div>

                    {/* Connection Selector */}
                    <FormGroup label="S3 Connection" isRequired fieldId="connection-select" style={{ marginBottom: '1rem' }}>
                      <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                        <FlexItem grow={{ default: 'grow' }}>
                          <Select
                            role="menu"
                            isOpen={isConnectionSelectOpen}
                            selected={selectedConnectionId 
                              ? connections.find(c => c.id === selectedConnectionId)?.name || 'Select connection'
                              : 'Select connection'}
                            onSelect={(_event, value) => {
                              const connection = connections.find(c => c.name === value as string);
                              if (connection) {
                                setSelectedConnectionId(connection.id);
                                // Close dropdown after selection (single select behavior)
                                setIsConnectionSelectOpen(false);
                              }
                            }}
                            onOpenChange={(isOpen) => {
                              setIsConnectionSelectOpen(isOpen);
                            }}
                            toggle={(toggleRef) => (
                              <MenuToggle
                                ref={toggleRef}
                                onClick={() => setIsConnectionSelectOpen(!isConnectionSelectOpen)}
                                isExpanded={isConnectionSelectOpen}
                                id="connection-select-toggle"
                                style={{ width: '100%' }}
                                isDisabled={connections.length === 0}
                              >
                                {selectedConnectionId 
                                  ? connections.find(c => c.id === selectedConnectionId)?.name || 'Select connection'
                                  : 'Select connection'}
                              </MenuToggle>
                            )}
                            id="connection-select"
                            shouldFocusFirstItemOnOpen={false}
                          >
                            <SelectList>
                              {connections.length > 0 ? (
                                connections.map((conn) => (
                                  <SelectOption 
                                    key={conn.id} 
                                    value={conn.name}
                                    isSelected={selectedConnectionId === conn.id}
                                  >
                                    {conn.name}
                                  </SelectOption>
                                ))
                              ) : (
                                <SelectOption isDisabled value="No connections available">
                                  No connections available
                                </SelectOption>
                              )}
                            </SelectList>
                          </Select>
                        </FlexItem>
                        <FlexItem>
                          <Button variant="secondary" onClick={handleAddConnection} id="add-connection-button">
                            Add new connection
                          </Button>
                        </FlexItem>
                      </Flex>
                      {connections.length === 0 && (
                        <FormHelperText>
                          <HelperText>
                            <HelperTextItem variant="default">
                              No connections available. Click "Add new connection" to create one.
                            </HelperTextItem>
                          </HelperText>
                        </FormHelperText>
                      )}
                    </FormGroup>

                    {/* Selected Connection Display */}
                    {selectedConnectionId && (
                      <div style={{ marginBottom: '40px' }}>
                        <Title headingLevel="h2" size="md" id="selected-connection-title" style={{ marginBottom: '0.75rem', fontWeight: 'normal' }}>
                          Selected connection
                        </Title>
                        <div style={{ 
                          border: '1px solid var(--pf-v5-global--BorderColor--100)',
                          borderRadius: '4px',
                          padding: '0.75rem',
                          backgroundColor: 'var(--pf-v5-global--BackgroundColor--100)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}>
                          {(() => {
                            const conn = connections.find(c => c.id === selectedConnectionId);
                            return conn ? (
                              <Label 
                                key={conn.id}
                                color="grey"
                                onClose={(e) => {
                                  e.stopPropagation(); // Prevent modal from opening when clicking close button
                                  setSelectedConnectionId(null);
                                  // Note: Documents from this connection remain in the list
                                  // Users can manually remove them if needed
                                }}
                                onClick={() => {
                                  setSelectedConnectionForDetails(conn);
                                  setIsConnectionDetailsModalOpen(true);
                                }}
                                style={{ cursor: 'pointer', width: 'fit-content' }}
                                id={`connection-label-${conn.id}`}
                              >
                                {conn.name}
                              </Label>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Empty state when no connection selected */}
                    {!selectedConnectionId && (
                      <div style={{ 
                        marginBottom: 'var(--pf-v5-global--spacer--md)',
                        padding: '2rem',
                        border: '1px dashed var(--pf-v5-global--BorderColor--200)',
                        borderRadius: '4px',
                        textAlign: 'center',
                        color: 'var(--pf-v5-global--Color--200)',
                        backgroundColor: 'var(--pf-v5-global--BackgroundColor--200)'
                      }}>
                        <div style={{ fontSize: 'var(--pf-v5-global--FontSize--sm)' }}>
                          Select or add an S3 connection to browse files or upload new files
                        </div>
                      </div>
                    )}

                    {/* Selected files Section */}
                    {selectedConnectionId && (
                      <div style={{ marginTop: 'var(--pf-v5-global--spacer--xl)', marginBottom: '40px' }}>
                        <Title headingLevel="h2" size="md" id="selected-files-title" style={{ marginBottom: '0.75rem', fontWeight: 'normal' }}>
                          Selected files
                        </Title>
                        <Flex justifyContent={{ default: 'justifyContentFlexStart' }} style={{ marginBottom: documents.length > 0 ? '0.75rem' : 0 }}>
                          <Button
                            variant="secondary"
                            onClick={handleOpenSelectFilesModal}
                            id="select-files-button"
                          >
                            Select files
                          </Button>
                        </Flex>
                        {documents.length > 0 && (
                          <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#ffffff' }}>
                            <Table aria-label="Documents table" variant="compact" id="autorag-documents-table">
                              <Thead>
                                <Tr>
                                  <Th>Name</Th>
                                  <Th>Source</Th>
                                  <Th modifier="fitContent">Remove</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {documents.map((doc) => (
                                  <Tr key={doc.id} id={`document-row-${doc.id}`}>
                                    <Td dataLabel="Name">{doc.name}</Td>
                                    <Td dataLabel="Source">
                                      <Label color={doc.sourceType === 'connection' ? 'blue' : 'grey'}>
                                        {doc.sourceType === 'connection' ? 'Connection' : 'Document'}
                                      </Label>
                                    </Td>
                                    <Td dataLabel="Remove" modifier="fitContent">
                                      <Button
                                        variant="plain"
                                        onClick={() => handleFileRemove(doc.id)}
                                        id={`delete-document-${doc.id}`}
                                        aria-label={`Delete ${doc.name}`}
                                      >
                                        ×
                                      </Button>
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Upload additional files Section */}
                    {selectedConnectionId && connections.some(conn => conn.id === selectedConnectionId) && (
                      <div style={{ marginTop: 'var(--pf-v5-global--spacer--xl)' }}>
                        <Title headingLevel="h2" size="md" id="upload-files-title" style={{ marginBottom: '0.75rem', fontWeight: 'normal' }}>
                          Upload additional files
                        </Title>
                        <div style={{ color: 'var(--pf-v5-global--Color--200)', fontSize: 'var(--pf-v5-global--FontSize--sm)', marginBottom: '1rem' }}>
                          Adding files here will not permanently add these to your selected S3 buckets.
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                          <MultipleFileUpload
                            onFileDrop={handleFileDrop}
                            dropzoneProps={{
                              accept: {
                                'application/pdf': ['.pdf'],
                                'text/plain': ['.txt'],
                                'application/json': ['.json'],
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                                'application/msword': ['.doc'],
                              }
                            }}
                            id="documents-file-upload"
                            style={{ backgroundColor: '#ffffff' }}
                          >
                            <MultipleFileUploadMain
                              titleIcon={<FolderOpenIcon />}
                              titleText="Drag and drop files here"
                              titleTextSeparator="or"
                              infoText="Accepted file types: PDF, TXT, JSON, DOCX, DOC"
                              style={{ boxSizing: 'content-box' }}
                            />
                            {uploadingFiles.length > 0 && (
                              <div ref={uploadStatusRef}>
                                <MultipleFileUploadStatus>
                                  {uploadingFiles.map((uploadFile) => (
                                  <div key={uploadFile.id} style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px solid var(--pf-v5-global--BorderColor--100)', borderRadius: '4px' }}>
                                    <MultipleFileUploadStatusItem
                                      file={uploadFile.file}
                                      onClearClick={() => {
                                        setUploadingFiles(uploadingFiles.filter(f => f.id !== uploadFile.id));
                                      }}
                                    />
                                    <div style={{ marginTop: '0.75rem' }}>
                                      {uploadFile.status === 'uploading' && (
                                        <div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: 'var(--pf-v5-global--FontSize--sm)', color: 'var(--pf-v5-global--Color--200)' }}>
                                              Uploading...
                                            </span>
                                            <span style={{ fontSize: 'var(--pf-v5-global--FontSize--sm)', fontWeight: 'bold', color: 'var(--pf-v5-global--primary-color--100)' }}>
                                              {Math.round(uploadFile.progress)}%
                                            </span>
                                          </div>
                                          <Progress
                                            value={uploadFile.progress}
                                            size={ProgressSize.sm}
                                            aria-label={`Upload progress for ${uploadFile.file.name}: ${Math.round(uploadFile.progress)}%`}
                                            id={`upload-progress-${uploadFile.id}`}
                                          />
                                        </div>
                                      )}
                                      {uploadFile.status === 'complete' && (
                                        <div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: 'var(--pf-v5-global--FontSize--sm)', color: 'var(--pf-v5-global--success-color--200)' }}>
                                              Upload complete
                                            </span>
                                            <span style={{ fontSize: 'var(--pf-v5-global--FontSize--sm)', fontWeight: 'bold', color: 'var(--pf-v5-global--success-color--200)' }}>
                                              100%
                                            </span>
                                          </div>
                                          <Progress
                                            value={100}
                                            size={ProgressSize.sm}
                                            variant="success"
                                            aria-label={`Upload complete for ${uploadFile.file.name}`}
                                            id={`upload-progress-complete-${uploadFile.id}`}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </MultipleFileUploadStatus>
                              </div>
                            )}
                          </MultipleFileUpload>
                        </div>
                      </div>
                    )}
                    </div>
                  </CardBody>
                </Card>
              </GridItem>

              {/* Column 2: Configure Details */}
              <GridItem span={8} style={{ display: 'flex' }}>
                    <Card id="autorag-configure-card" style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      flex: 1,
                      width: '100%',
                      opacity: hasAddedDocuments ? 1 : 0.6,
                      pointerEvents: hasAddedDocuments ? 'auto' : 'none'
                    }}>
                      <CardHeader>
                        <CardTitle>
                          <Title headingLevel="h2" size="md" id="autorag-configure-title" style={{ color: 'var(--pf-v5-global--primary-color--100)' }}>
                            Configure details
                          </Title>
                        </CardTitle>
                      </CardHeader>
                      <CardBody style={{ overflowY: 'auto', flex: 1, position: 'relative' }}>
                        {!hasAddedDocuments ? (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            minHeight: '300px',
                            pointerEvents: 'auto'
                          }}>
                            <EmptyState headingLevel="h3" titleText="Upload a document to configure details" id="configure-details-empty-state">
                              <EmptyStateBody>
                                In order to configure details and run an experiment, add a document or connection in the widget on the left.
                              </EmptyStateBody>
                            </EmptyState>
                          </div>
                        ) : (
                        <Form id="autorag-configure-form">
                          {/* Vector Database Location */}
                          <FormGroup
                            label="Where would you like to index your documents?"
                            fieldId="vector-database"
                          >
                            <Select
                              isOpen={isVectorDbOpen}
                              selected={vectorDatabase}
                              onSelect={(_event, value) => {
                                setVectorDatabase(value as string);
                                setIsVectorDbOpen(false);
                              }}
                              onOpenChange={(isOpen) => setIsVectorDbOpen(isOpen)}
                              toggle={(toggleRef) => (
                                <MenuToggle
                                  ref={toggleRef}
                                  onClick={() => setIsVectorDbOpen(!isVectorDbOpen)}
                                  isExpanded={isVectorDbOpen}
                                  id="vector-database-toggle"
                                >
                                  {vectorDatabase || 'Vector database location'}
                                </MenuToggle>
                              )}
                              id="vector-database-select"
                            >
                              <SelectList>
                                <SelectOption value="Milvus (in line)">Milvus (in line)</SelectOption>
                                <SelectOption value="Milvus (remote)">Milvus (remote)</SelectOption>
                              </SelectList>
                            </Select>
                            <FormHelperText>
                              <HelperText>
                                <HelperTextItem>Specify the location for storing the vector index used to retrieve your documents.</HelperTextItem>
                              </HelperText>
                            </FormHelperText>
                          </FormGroup>

                          {/* Evaluation Source */}
                          <FormGroup
                            label="Add the data source you would like to use for evaluation."
                            isRequired
                            fieldId="evaluation-source"
                          >
                            {/* Select from uploaded files */}
                            {(() => {
                              const jsonFiles = documents.filter(doc => {
                                const ext = doc.name.split('.').pop()?.toLowerCase();
                                return ext === 'json';
                              });
                              
                              const NONE_SELECTED = 'None selected';
                              
                              return jsonFiles.length > 0 ? (
                                <div style={{ marginBottom: '1rem' }}>
                                  <Select
                                    isOpen={isEvaluationSourceDocumentSelectOpen}
                                    selected={selectedEvaluationSourceDocument 
                                      ? documents.find(d => d.id === selectedEvaluationSourceDocument)?.name || NONE_SELECTED
                                      : NONE_SELECTED}
                                    onSelect={(_event, value) => {
                                      if (value === NONE_SELECTED) {
                                        setSelectedEvaluationSourceDocument(null);
                                      } else {
                                        const selectedDoc = documents.find(d => d.name === value as string);
                                        if (selectedDoc) {
                                          setSelectedEvaluationSourceDocument(selectedDoc.id);
                                          // Clear uploaded file when selecting from documents
                                          setEvaluationSourceFilename('');
                                          setEvaluationSourceFile(null);
                                        }
                                      }
                                      setIsEvaluationSourceDocumentSelectOpen(false);
                                    }}
                                    onOpenChange={(isOpen) => setIsEvaluationSourceDocumentSelectOpen(isOpen)}
                                    toggle={(toggleRef) => (
                                      <MenuToggle
                                        ref={toggleRef}
                                        onClick={() => setIsEvaluationSourceDocumentSelectOpen(!isEvaluationSourceDocumentSelectOpen)}
                                        isExpanded={isEvaluationSourceDocumentSelectOpen}
                                        id="evaluation-source-document-select-toggle"
                                        style={{ width: '100%' }}
                                      >
                                        {selectedEvaluationSourceDocument 
                                          ? documents.find(d => d.id === selectedEvaluationSourceDocument)?.name || NONE_SELECTED
                                          : NONE_SELECTED}
                                      </MenuToggle>
                                    )}
                                    id="evaluation-source-document-select"
                                  >
                                    <SelectList>
                                      <SelectOption value={NONE_SELECTED}>
                                        {NONE_SELECTED}
                                      </SelectOption>
                                      {jsonFiles.map((doc) => (
                                        <SelectOption key={doc.id} value={doc.name}>
                                          {doc.name}
                                        </SelectOption>
                                      ))}
                                    </SelectList>
                                  </Select>
                                </div>
                              ) : null;
                            })()}
                            <FileUpload
                              id="evaluation-source-file-upload"
                              value={evaluationSourceFilename}
                              filename={evaluationSourceFilename}
                              filenamePlaceholder="Drag and drop a file here or upload"
                              onFileInputChange={(_event, file: File) => {
                                setEvaluationSourceFilename(file.name);
                                setIsEvaluationSourceUploading(true);
                                // Automatically select "None selected" in dropdown when uploading new file
                                setSelectedEvaluationSourceDocument(null);
                                // Simulate file upload
                                setTimeout(() => {
                                  setEvaluationSourceFile(file);
                                  setIsEvaluationSourceUploading(false);
                                }, 500);
                              }}
                              onClearClick={() => {
                                setEvaluationSourceFilename('');
                                setEvaluationSourceFile(null);
                              }}
                              browseButtonText="Upload"
                              isLoading={isEvaluationSourceUploading}
                              dropzoneProps={{
                                accept: {
                                  'application/json': ['.json'],
                                }
                              }}
                            />
                            <FormHelperText>
                              <HelperText>
                                <HelperTextItem>
                                  Supply a JSON file with test questions and answers to evaluate the quality of Q&A responses.{' '}
                                  <Button
                                    variant="link"
                                    isInline
                                    onClick={() => setIsEvaluationSourceModalOpen(true)}
                                    id="what-is-evaluation-source-link"
                                  >
                                    What is an evaluation source?
                                  </Button>
                                </HelperTextItem>
                              </HelperText>
                            </FormHelperText>
                          </FormGroup>


                          {/* Selected Settings Display */}
                          <Grid hasGutter style={{ marginTop: '2rem' }}>
                            <GridItem span={6}>
                              <Card 
                                isClickable 
                                onClick={handleOpenEvaluationSettingsModal}
                                id="optimization-metric-card"
                                style={{ 
                                  cursor: 'pointer', 
                                  border: '1px solid #d2d2d2',
                                  boxShadow: 'none'
                                }}
                              >
                                <CardHeader>
                                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                                    <FlexItem>
                                      <CardTitle>
                                        <Title headingLevel="h2" size="md" id="optimization-metric-title">
                                          Optimization metric
                                        </Title>
                                      </CardTitle>
                                    </FlexItem>
                                    <FlexItem>
                                      <Button
                                        variant="secondary"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenEvaluationSettingsModal();
                                        }}
                                        id="optimization-metric-edit-button"
                                        aria-label="Edit optimization metric"
                                        isInline
                                      >
                                        Edit
                                      </Button>
                                    </FlexItem>
                                  </Flex>
                                </CardHeader>
                                <CardBody>
                                  <div>
                                    <span style={{ fontSize: 'var(--pf-v5-global--FontSize--md)', fontWeight: 'var(--pf-v5-global--FontWeight--bold)' }}>
                                      {criteria || 'None selected'}
                                    </span>
                                  </div>
                                </CardBody>
                              </Card>
                            </GridItem>
                            <GridItem span={6}>
                              <Card 
                                isClickable 
                                onClick={handleOpenEvaluationSettingsModal}
                                id="models-to-consider-card"
                                style={{ 
                                  cursor: 'pointer', 
                                  border: '1px solid #d2d2d2',
                                  boxShadow: 'none'
                                }}
                              >
                                <CardHeader>
                                  <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                                    <FlexItem>
                                      <CardTitle>
                                        <Title headingLevel="h2" size="md" id="models-to-consider-title">
                                          Models to consider
                                        </Title>
                                      </CardTitle>
                                    </FlexItem>
                                    <FlexItem>
                                      <Button
                                        variant="secondary"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenEvaluationSettingsModal();
                                        }}
                                        id="models-to-consider-edit-button"
                                        aria-label="Edit models to consider"
                                        isInline
                                      >
                                        Edit
                                      </Button>
                                    </FlexItem>
                                  </Flex>
                                </CardHeader>
                                <CardBody>
                                  <div id="models-to-consider-content">
                                    <div style={{ marginBottom: '0.5rem' }}>
                                      <span style={{ fontSize: 'var(--pf-v5-global--FontSize--md)', fontWeight: 'var(--pf-v5-global--FontWeight--bold)' }}>
                                        {selectedFoundationModels.size} foundation model{selectedFoundationModels.size !== 1 ? 's' : ''}
                                        <Tooltip content={
                                          <div style={{ textAlign: 'left' }}>
                                            {foundationModels
                                              .filter(model => selectedFoundationModels.has(model.id))
                                              .map(model => model.name)
                                              .join(', ')}
                                          </div>
                                        }>
                                          <InfoCircleIcon 
                                            style={{ 
                                              fontSize: '0.75rem', 
                                              color: 'var(--pf-t--global--icon--color--subtle)', 
                                              cursor: 'pointer',
                                              verticalAlign: 'super',
                                              marginLeft: '0.25rem'
                                            }} 
                                            id="foundation-models-info-icon"
                                            aria-label="View foundation models"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </Tooltip>
                                      </span>
                                    </div>
                                    <div>
                                      <span style={{ fontSize: 'var(--pf-v5-global--FontSize--md)', fontWeight: 'var(--pf-v5-global--FontWeight--bold)' }}>
                                        {selectedEmbeddingModels.size} embedding model{selectedEmbeddingModels.size !== 1 ? 's' : ''}
                                        <Tooltip content={
                                          <div style={{ textAlign: 'left' }}>
                                            {embeddingModels
                                              .filter(model => selectedEmbeddingModels.has(model.id))
                                              .map(model => model.name)
                                              .join(', ')}
                                          </div>
                                        }>
                                          <InfoCircleIcon 
                                            style={{ 
                                              fontSize: '0.75rem', 
                                              color: 'var(--pf-t--global--icon--color--subtle)', 
                                              cursor: 'pointer',
                                              verticalAlign: 'super',
                                              marginLeft: '0.25rem'
                                            }} 
                                            id="embedding-models-info-icon"
                                            aria-label="View embedding models"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </Tooltip>
                                      </span>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>
                            </GridItem>
                          </Grid>
                        </Form>
                        )}
                      </CardBody>
                    </Card>
              </GridItem>
            </Grid>
            </div>
            </div>

            {/* Fixed Footer - positioned at bottom of PageSection, outside container */}
            {isConfiguring && (
              <div style={{ 
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                backgroundColor: '#ffffff',
                borderTop: '1px solid var(--pf-v5-global--BorderColor--100)',
                boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
                padding: '1rem 1.5rem',
                zIndex: 100
              }}>
                <Flex justifyContent={{ default: 'justifyContentFlexStart' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <Button 
                      variant="primary" 
                      onClick={handleRunExperiment} 
                      id="run-experiment-button"
                      isDisabled={
                        documents.length === 0 ||
                        (evaluationSourceFile === null && selectedEvaluationSourceDocument === null) ||
                        vectorDatabase === '' ||
                        !criteria ||
                        (selectedFoundationModels.size === 0 && selectedEmbeddingModels.size === 0)
                      }
                    >
                      Run experiment
                    </Button>
                  </FlexItem>
                </Flex>
              </div>
            )}
          </>
        ) : !isCreating ? (
          experiments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '400px' }}>
              {/* Experiments Table View */}
              <Flex justifyContent={{ default: 'justifyContentFlexEnd' }} style={{ marginBottom: '1.5rem' }}>
                <Button variant="primary" onClick={handleCreateExperiment} id="create-new-experiment-button">
                  Create new experiment
                </Button>
              </Flex>
              <Table aria-label="Experiments table" id="autorag-experiments-table">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Description</Th>
                    <Th>Tags</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {experiments.map((experiment) => (
                    <Tr key={experiment.id} id={`experiment-row-${experiment.id}`}>
                      <Td dataLabel="Name">
                        <Button
                          variant="link"
                          isInline
                          onClick={() => handleExperimentClick(experiment)}
                          id={`experiment-name-${experiment.id}`}
                          style={{ paddingLeft: 0, fontWeight: 'bold' }}
                        >
                          {experiment.name}
                        </Button>
                      </Td>
                      <Td dataLabel="Description">{experiment.description || '-'}</Td>
                      <Td dataLabel="Tags">
                        {experiment.tags.length > 0 ? (
                          <LabelGroup numLabels={3}>
                            {experiment.tags.map((tag, index) => (
                              <Label key={index} id={`experiment-tag-${experiment.id}-${index}`}>
                                {tag}
                              </Label>
                            ))}
                          </LabelGroup>
                        ) : (
                          '-'
                        )}
                      </Td>
                      <Td dataLabel="Status">
                        {experiment.status === 'completed' && (
                          <Label color="green" icon={<CheckCircleIcon />}>
                            Completed
                          </Label>
                        )}
                        {experiment.status === 'Processing' && (
                          <Label color="blue" icon={<SyncIcon />}>
                            Processing
                          </Label>
                        )}
                        {experiment.status === 'failed' && (
                          <Label color="red">
                            Failed
                          </Label>
                        )}
                        {experiment.status === 'incomplete' && (
                          <Label color="orange">
                            Incomplete
                          </Label>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flex: 1,
              minHeight: '400px'
            }}>
              <EmptyState 
                headingLevel="h2" 
                titleText="AutoRAG Experiment" 
                icon={() => (
                  <img 
                    src={AIMLServerIllustration} 
                    alt="AI/ML Server Illustration" 
                    style={{ width: '108px', height: '108px' }}
                  />
                )} 
                id="autorag-empty-state"
              >
                <EmptyStateBody>
                  Automatically configure and optimize your Retrieval-Augmented Generation workflows.
                </EmptyStateBody>
                <EmptyStateFooter>
                  <EmptyStateActions>
                    <Button variant="primary" onClick={handleCreateExperiment} id="create-autorag-experiment-button">
                      Create AutoRAG Experiment
                    </Button>
                  </EmptyStateActions>
                </EmptyStateFooter>
              </EmptyState>
            </div>
          )
        ) : (
          <>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              flex: 1, 
              minHeight: 0,
              height: '100%',
              position: 'relative',
              paddingBottom: '80px' // Space for footer (padding + border + button height)
            }}>
              <div style={{ 
                flex: 1, 
                overflowY: 'auto',
                minHeight: 0
              }}>
                <Form id="autorag-experiment-form" isWidthLimited>
                  <Title headingLevel="h2" size="md" id="autorag-details-header" style={{ marginTop: '1.5rem', marginBottom: '0.25rem' }}>
                    Define Details
                  </Title>

                  <FormGroup label="Name" isRequired fieldId="autorag-name" style={{ marginTop: '0.25rem' }}>
                    <TextInput
                      isRequired
                      type="text"
                      id="autorag-name"
                      name="autorag-name"
                      value={name}
                      onChange={(_event, value) => {
                        setName(value);
                        if (errors.name) {
                          setErrors({ ...errors, name: '' });
                        }
                      }}
                      validated={errors.name ? 'error' : 'default'}
                    />
                    {errors.name && (
                      <FormHelperText>
                        <HelperText>
                          <HelperTextItem variant="error">{errors.name}</HelperTextItem>
                        </HelperText>
                      </FormHelperText>
                    )}
                  </FormGroup>

                  <FormGroup label="Description" fieldId="autorag-description" style={{ marginTop: '1rem' }}>
                    <TextArea
                      type="text"
                      id="autorag-description"
                      name="autorag-description"
                      value={description}
                      onChange={(_event, value) => setDescription(value)}
                      rows={3}
                    />
                  </FormGroup>

                </Form>
              </div>
            </div>

            {/* Fixed Footer - positioned at bottom of container, inside PageSection */}
            {isCreating && (
              <div style={{ 
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                backgroundColor: '#ffffff',
                borderTop: '1px solid var(--pf-v5-global--BorderColor--100)',
                boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
                padding: '1rem 1.5rem',
                zIndex: 100
              }}>
                <Flex justifyContent={{ default: 'justifyContentFlexStart' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <Button variant="link" onClick={handleCancel} id="autorag-cancel-button">
                      Cancel
                    </Button>
                  </FlexItem>
                  <FlexItem>
                    <Button 
                      variant="primary" 
                      onClick={handleSubmit} 
                      id="autorag-create-button"
                      isDisabled={!name.trim() || !criteria || (selectedFoundationModels.size === 0 && selectedEmbeddingModels.size === 0)}
                    >
                      Create
                    </Button>
                  </FlexItem>
                </Flex>
              </div>
            )}
          </>
        )}
  </PageSection>

      {/* Evaluation Source Settings Modal */}
      <Modal
        variant={ModalVariant.large}
        isOpen={isEvaluationSettingsModalOpen}
        onClose={handleCancelEvaluationSettings}
        id="evaluation-settings-modal"
      >
        <ModalHeader>
          <Title headingLevel="h2" size="xl" id="evaluation-settings-modal-title">
            Experiment settings
          </Title>
        </ModalHeader>
        <ModalBody>
          <Form id="evaluation-settings-form">
            {/* Models to Test - Tabbed Layout */}
            <FormGroup
              label="Models to test"
              isRequired
              fieldId="models-to-test"
              style={{ marginBottom: '1.5rem' }}
            >
              <Tabs
                activeKey={activeModelTabKey}
                onSelect={(_event, tabIndex) => setActiveModelTabKey(tabIndex)}
                aria-label="Models to test tabs"
                id="models-to-test-tabs"
              >
                <Tab
                  eventKey={0}
                  title={<TabTitleText>Foundation models</TabTitleText>}
                  aria-label="Foundation models tab"
                  id="foundation-models-tab"
                >
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <Checkbox
                        id="select-all-foundation"
                        isChecked={selectAllFoundation}
                        onChange={(_event, checked) => handleSelectAllFoundation(checked)}
                        label="All available models"
                      />
                    </div>
                    <Table variant="compact" id="foundation-models-table">
                      <Thead>
                        <Tr>
                          <Th width={10}></Th>
                          <Th>Name</Th>
                          <Th>Description</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {foundationModels.map((model) => (
                          <Tr key={model.id} id={`foundation-model-row-${model.id}`}>
                            <Td>
                              <Checkbox
                                id={`foundation-model-${model.id}`}
                                isChecked={selectedFoundationModels.has(model.id)}
                                onChange={() => handleFoundationModelToggle(model.id)}
                              />
                            </Td>
                            <Td dataLabel="Name">{model.name}</Td>
                            <Td dataLabel="Description">{model.description}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </div>
                </Tab>

                <Tab
                  eventKey={1}
                  title={<TabTitleText>Embedding models</TabTitleText>}
                  aria-label="Embedding models tab"
                  id="embedding-models-tab"
                >
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <Checkbox
                        id="select-all-embedding"
                        isChecked={selectAllEmbedding}
                        onChange={(_event, checked) => handleSelectAllEmbedding(checked)}
                        label="All available models"
                      />
                    </div>
                    <Table variant="compact" id="embedding-models-table">
                      <Thead>
                        <Tr>
                          <Th width={10}></Th>
                          <Th>Name</Th>
                          <Th>Description</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {embeddingModels.map((model) => (
                          <Tr key={model.id} id={`embedding-model-row-${model.id}`}>
                            <Td>
                              <Checkbox
                                id={`embedding-model-${model.id}`}
                                isChecked={selectedEmbeddingModels.has(model.id)}
                                onChange={() => handleEmbeddingModelToggle(model.id)}
                              />
                            </Td>
                            <Td dataLabel="Name">{model.name}</Td>
                            <Td dataLabel="Description">{model.description}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </div>
                </Tab>
              </Tabs>
            </FormGroup>

            {/* Metric to Optimize */}
            <FormGroup
              label="Metric to optimize"
              isRequired
              fieldId="criteria"
              style={{ marginBottom: '1.5rem' }}
            >
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>
                      <Radio
                        id="criteria-faithfulness"
                        name="criteria"
                        isChecked={criteria === 'answer faithfulness'}
                        onChange={() => handleCriteriaChange('answer faithfulness')}
                        label="Answer faithfulness"
                      />
                    </FlexItem>
                    <FlexItem>
                      <Popover
                        aria-label="Answer faithfulness help"
                        bodyContent="Measures how well the generated answer is supported by the retrieved context. Higher scores indicate the answer is grounded in the provided context."
                        showClose
                      >
                        <Button variant="plain" aria-label="Answer faithfulness help" style={{ padding: 0 }}>
                          <OutlinedQuestionCircleIcon />
                        </Button>
                      </Popover>
                    </FlexItem>
                  </Flex>
                </FlexItem>
                <FlexItem>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>
                      <Radio
                        id="criteria-correctness"
                        name="criteria"
                        isChecked={criteria === 'answer correctness'}
                        onChange={() => handleCriteriaChange('answer correctness')}
                        label="Answer correctness"
                      />
                    </FlexItem>
                    <FlexItem>
                      <Popover
                        aria-label="Answer correctness help"
                        bodyContent="Evaluates the factual accuracy and correctness of the generated answer against ground truth. Higher scores indicate more accurate responses."
                        showClose
                      >
                        <Button variant="plain" aria-label="Answer correctness help" style={{ padding: 0 }}>
                          <OutlinedQuestionCircleIcon />
                        </Button>
                      </Popover>
                    </FlexItem>
                  </Flex>
                </FlexItem>
                <FlexItem>
                  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>
                      <Radio
                        id="criteria-context"
                        name="criteria"
                        isChecked={criteria === 'context correctness'}
                        onChange={() => handleCriteriaChange('context correctness')}
                        label="Context correctness"
                      />
                    </FlexItem>
                    <FlexItem>
                      <Popover
                        aria-label="Context correctness help"
                        bodyContent="Assesses how relevant and accurate the retrieved context is for answering the query. Higher scores indicate better context retrieval quality."
                        showClose
                      >
                        <Button variant="plain" aria-label="Context correctness help" style={{ padding: 0 }}>
                          <OutlinedQuestionCircleIcon />
                        </Button>
                      </Popover>
                    </FlexItem>
                  </Flex>
                </FlexItem>
              </Flex>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="primary" 
            onClick={handleSaveEvaluationSettings} 
            id="evaluation-settings-save-button"
            isDisabled={!hasEvaluationSettingsChanged()}
          >
            Save
          </Button>
          <Button variant="link" onClick={handleCancelEvaluationSettings} id="evaluation-settings-cancel-button">
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Evaluation Source Modal */}
      <Modal
        variant={ModalVariant.large}
        isOpen={isEvaluationSourceModalOpen}
        onClose={() => setIsEvaluationSourceModalOpen(false)}
        id="evaluation-source-modal"
      >
        <ModalHeader>
          <Title headingLevel="h2" size="xl" id="evaluation-source-modal-title">
            Evaluation data template
          </Title>
        </ModalHeader>
        <ModalBody>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ 
              backgroundColor: 'var(--pf-v5-global--BackgroundColor--200)',
              border: '1px solid var(--pf-v5-global--BorderColor--200)',
              borderRadius: '4px',
              padding: '1rem',
              position: 'relative'
            }}>
              {/* Download button at top */}
              <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="secondary"
                  icon={<DownloadIcon />}
                  onClick={handleDownloadTemplate}
                  id="download-template-button"
                  size="sm"
                >
                  Download template
                </Button>
              </div>
              
              {/* Code block with copy icon */}
              <div style={{ position: 'relative' }}>
                <Button
                  variant="plain"
                  icon={<CopyIcon />}
                  onClick={handleCopyCode}
                  aria-label="Copy code"
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    zIndex: 10
                  }}
                  id="copy-code-button"
                />
                <pre style={{
                  backgroundColor: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: 'var(--pf-v5-global--FontSize--sm)',
                  border: '1px solid var(--pf-v5-global--BorderColor--100)',
                  margin: 0,
                  paddingRight: '3rem',
                  fontFamily: 'monospace',
                  lineHeight: '1.5'
                }}>
                  {JSON.stringify(evaluationDataTemplate, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setIsEvaluationSourceModalOpen(false)} id="evaluation-source-modal-close-button">
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Add Connection Modal */}
      <Modal
        variant={ModalVariant.medium}
        isOpen={isAddConnectionModalOpen}
        onClose={handleConnectionModalClose}
        id="add-connection-modal"
      >
        <ModalHeader>
          <Title headingLevel="h2" size="xl" id="add-connection-modal-title">
            Add an S3 Connection
          </Title>
        </ModalHeader>
        <ModalBody>
          <Form id="add-connection-form">
            <FormGroup label="Connection name" isRequired fieldId="connection-name">
              <TextInput
                isRequired
                type="text"
                id="connection-name"
                value={connectionName}
                onChange={(_event, value) => setConnectionName(value)}
                placeholder="Enter connection name"
              />
            </FormGroup>
            <FormGroup label="Access key" isRequired fieldId="access-key" style={{ marginTop: '1rem' }}>
                  <TextInput
                    isRequired
                    type="text"
                    id="access-key"
                    value={accessKey}
                    onChange={(_event, value) => setAccessKey(value)}
                    placeholder="Enter access key"
                  />
                </FormGroup>
                <FormGroup label="Secret key" isRequired fieldId="secret-key" style={{ marginTop: '1rem' }}>
                  <TextInput
                    isRequired
                    type="password"
                    id="secret-key"
                    value={secretKey}
                    onChange={(_event, value) => setSecretKey(value)}
                    placeholder="Enter secret key"
                  />
                </FormGroup>
            <FormGroup label="Endpoint" fieldId="endpoint" style={{ marginTop: '1rem' }}>
              <TextInput
                type="text"
                id="endpoint"
                value={endpoint}
                onChange={(_event, value) => setEndpoint(value)}
                placeholder="Enter endpoint URL"
              />
            </FormGroup>
            <FormGroup label="Region" fieldId="region" style={{ marginTop: '1rem' }}>
              <TextInput
                type="text"
                id="region"
                value={region}
                onChange={(_event, value) => setRegion(value)}
                placeholder="Enter region"
              />
            </FormGroup>
            <FormGroup label="Bucket name" fieldId="bucket-name" style={{ marginTop: '1rem' }}>
              <TextInput
                type="text"
                id="bucket-name"
                value={bucketName}
                onChange={(_event, value) => setBucketName(value)}
                placeholder="Enter bucket name"
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="primary" 
            onClick={handleConnectionSubmit} 
            id="add-connection-submit-button"
            isDisabled={
              !connectionName.trim() || 
              !accessKey.trim() || 
              !secretKey.trim()
            }
          >
            Add connection
          </Button>
          <Button variant="secondary" onClick={handleConnectionModalClose} id="add-connection-cancel-button">
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Select Files from Connections Modal */}
      <Modal
        variant={ModalVariant.large}
        isOpen={isSelectFilesModalOpen}
        onClose={handleCloseSelectFilesModal}
        id="select-files-modal"
      >
        <ModalHeader>
          <Title headingLevel="h2" size="xl" id="select-files-modal-title">
            Select documents from connection
          </Title>
          <div style={{ color: 'var(--pf-v5-global--Color--200)', fontSize: 'var(--pf-v5-global--FontSize--sm)', marginTop: '0.5rem' }}>
            {selectedConnectionId && connections.find(c => c.id === selectedConnectionId) && (
              <span>
                Viewing files from: <strong>{connections.find(c => c.id === selectedConnectionId)?.name}</strong>
              </span>
            )}
          </div>
        </ModalHeader>
        <ModalBody>
          <Grid hasGutter>
            {/* Files List - Full Width */}
            <GridItem span={12}>
              <div style={{ 
                border: '1px solid var(--pf-v5-global--BorderColor--100)',
                borderRadius: '4px',
                height: '400px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ 
                  padding: '0.75rem',
                  borderBottom: '1px solid var(--pf-v5-global--BorderColor--100)',
                  fontWeight: 'bold',
                  fontSize: 'var(--pf-v5-global--FontSize--sm)'
                }}>
                  {selectedConnectionId && connections.find(c => c.id === selectedConnectionId) 
                    ? connections.find(c => c.id === selectedConnectionId)?.name || 'Connection'
                    : 'No connection selected'}
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {selectedConnectionId && modalSelectedConnectionId ? (
                    isLoadingS3Files ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--pf-v5-global--Color--200)' }}>
                        Loading files...
                      </div>
                    ) : s3Files.length > 0 ? (
                      documentSelectionVariant === 'option1' ? (
                        // Option 1: Tree View
                        <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                          {/* Sticky Toolbar */}
                          <div style={{ 
                            position: 'sticky',
                            top: 0,
                            zIndex: 10,
                            marginBottom: '0.5rem'
                          }}>
                            <Toolbar id="tree-view-toolbar" colorVariant="default">
                              <ToolbarContent style={{ alignItems: 'center' }}>
                                <ToolbarGroup style={{ alignItems: 'center' }}>
                                  <ToolbarItem style={{ display: 'flex', alignItems: 'center' }}>
                                    {(() => {
                                      // Calculate total number of files (not folders) in the tree
                                      const totalFileIds = new Set<string>();
                                      fileSystemTree.forEach(item => {
                                        getAllDescendantFileIds(item).forEach(id => totalFileIds.add(id));
                                      });
                                      const totalFiles = totalFileIds.size;
                                      const selectedFiles = selectedS3Files.size;
                                      const areAllSelected = fileSystemTree.length > 0 && fileSystemTree.every(item => {
                                        const descendantIds = getAllDescendantFileIds(item);
                                        return descendantIds.length > 0 && descendantIds.every(id => selectedS3Files.has(id));
                                      });
                                      
                                      return (
                                        <div style={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          gap: '0.5rem',
                                          padding: '0.375rem 0.75rem',
                                          border: '1px solid var(--pf-v5-global--BorderColor--100)',
                                          borderRadius: 'var(--pf-v5-global--BorderRadius--sm)',
                                          height: '36px',
                                          minWidth: '120px'
                                        }}>
                                          <Checkbox
                                            id="select-all-tree-checkbox"
                                            isChecked={areAllSelected}
                                            onChange={(_event, checked) => {
                                              if (checked) {
                                                const allIds = new Set<string>();
                                                fileSystemTree.forEach(item => {
                                                  getAllDescendantFileIds(item).forEach(id => allIds.add(id));
                                                });
                                                setSelectedS3Files(allIds);
                                              } else {
                                                setSelectedS3Files(new Set());
                                              }
                                            }}
                                            aria-label="Select all files"
                                          />
                                          <span style={{ 
                                            fontSize: 'var(--pf-v5-global--FontSize--sm)', 
                                            color: 'var(--pf-v5-global--Color--100)'
                                          }}>
                                            {selectedFiles} of {totalFiles} selected
                                          </span>
                                        </div>
                                      );
                                    })()}
                                  </ToolbarItem>
                                </ToolbarGroup>
                                <ToolbarGroup style={{ alignItems: 'center' }}>
                                  <ToolbarItem style={{ display: 'flex', alignItems: 'center' }}>
                                    <SearchInput
                                      placeholder="Search files and folders"
                                      value={treeViewSearchValue}
                                      onChange={(_event, value) => setTreeViewSearchValue(value)}
                                      onClear={() => setTreeViewSearchValue('')}
                                      aria-label="Search tree view"
                                      id="tree-view-search-input"
                                    />
                                  </ToolbarItem>
                                </ToolbarGroup>
                              </ToolbarContent>
                            </Toolbar>
                            {/* Divider line */}
                            <Divider
                              className="pf-v6-c-divider pf-m-horizontal pf-m-vertical-on-lg"
                              role="separator"
                            />
                          </div>
                          <div style={{ flex: 1, overflowY: 'auto' }}>
                            {(() => {
                              const filteredTree = filterTreeItems(fileSystemTree, treeViewSearchValue);
                              if (filteredTree.length === 0) {
                                return (
                                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--pf-v5-global--Color--200)', fontSize: 'var(--pf-v5-global--FontSize--sm)' }}>
                                    No results found
                                  </div>
                                );
                              }
                              
                              const renderTreeNode = (node: FileSystemItem, depth: number = 0): React.ReactNode => {
                                const isExpanded = expandedFolders.has(node.id);
                                const hasChildren = node.children && node.children.length > 0;
                                const isFullySelected = isFolderFullySelected(node, selectedS3Files);
                                const isPartiallySelected = isFolderPartiallySelected(node, selectedS3Files);
                                const selectedCount = node.type === 'folder' ? getSelectedCount(node, selectedS3Files) : null;
                                const indent = depth * 24;
                                
                                return (
                                  <div key={node.id} id={`tree-node-${node.id}`}>
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0.375rem 0.5rem',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        marginLeft: `${indent}px`,
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--pf-v5-global--BackgroundColor--150)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                                        {/* Expand/Collapse Button */}
                                        <div style={{ width: '20px', display: 'flex', justifyContent: 'center', marginRight: '0.25rem' }}>
                                          {hasChildren ? (
                                            <Button
                                              variant="plain"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleFolder(node.id);
                                              }}
                                              style={{ padding: '0.125rem', minWidth: 'auto' }}
                                              aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
                                              id={`tree-expand-${node.id}`}
                                            >
                                              {isExpanded ? <AngleDownIcon /> : <AngleRightIcon />}
                                            </Button>
                                          ) : (
                                            <div style={{ width: '20px' }} />
                                          )}
                                        </div>
                                        
                                        {/* Checkbox */}
                                        <div style={{ marginRight: '0.5rem', position: 'relative' }} id={`tree-checkbox-wrapper-${node.id}`}>
                                          <Checkbox
                                            id={`tree-checkbox-${node.id}`}
                                            isChecked={node.type === 'file' ? selectedS3Files.has(node.id) : isFullySelected}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              handleTreeItemToggle(node);
                                            }}
                                            aria-label={`Select ${node.name}`}
                                          />
                                        </div>
                                        
                                        {/* Icon */}
                                        <div style={{ marginRight: '0.5rem', display: 'flex', alignItems: 'center' }}>
                                          {node.type === 'folder' ? (
                                            isExpanded ? <FolderOpenIcon style={{ color: 'var(--pf-v5-global--palette--blue-400)' }} /> : <OutlinedFolderIcon style={{ color: 'var(--pf-v5-global--palette--blue-400)' }} />
                                          ) : (
                                            <FileIcon style={{ color: 'var(--pf-v5-global--Color--200)' }} />
                                          )}
                                        </div>
                                        
                                        {/* Name */}
                                        <div
                                          style={{
                                            flex: 1,
                                            minWidth: 0,
                                            fontSize: 'var(--pf-v5-global--FontSize--sm)',
                                            fontWeight: node.type === 'folder' ? 'bold' : 'normal',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                          }}
                                          onClick={() => {
                                            if (node.type === 'folder' && hasChildren) {
                                              handleToggleFolder(node.id);
                                            }
                                          }}
                                        >
                                          <span>{node.name}</span>
                                          {node.type === 'folder' && selectedCount && (
                                            <Label
                                              variant="outline"
                                              color={selectedCount.selected > 0 && selectedCount.selected < selectedCount.total ? 'blue' : 'grey'}
                                              style={{
                                                fontSize: 'var(--pf-v5-global--FontSize--xs)',
                                                padding: '0.125rem 0.375rem',
                                                height: 'auto',
                                                lineHeight: '1.2',
                                              }}
                                            >
                                              {selectedCount.selected}/{selectedCount.total}
                                            </Label>
                                          )}
                                        </div>
                                        
                                        {/* Size */}
                                        <div style={{ marginLeft: '1rem', fontSize: 'var(--pf-v5-global--FontSize--sm)', color: 'var(--pf-v5-global--Color--200)', minWidth: '80px', textAlign: 'right' }}>
                                          {node.size ? `${(node.size / 1024).toFixed(2)} KB` : node.type === 'folder' ? '-' : '-'}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Render children if expanded */}
                                    {hasChildren && isExpanded && (
                                      <div>
                                        {node.children!.map(child => renderTreeNode(child, depth + 1))}
                                      </div>
                                    )}
                                  </div>
                                );
                              };
                              
                              return filteredTree.map((item) => renderTreeNode(item));
                            })()}
                          </div>
                        </div>
                      ) : (
                        // Option 2: Column-Based Navigation
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                          {/* Breadcrumb Navigation */}
                          <div style={{ 
                            padding: '0.75rem', 
                            borderBottom: '1px solid var(--pf-v5-global--BorderColor--100)',
                            backgroundColor: 'var(--pf-v5-global--BackgroundColor--100)',
                          }}>
                            <Breadcrumb id="column-view-breadcrumb">
                              {getBreadcrumbPath().map((crumb, index) => (
                                <BreadcrumbItem
                                  key={crumb.id}
                                  to="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleBreadcrumbClick(index);
                                  }}
                                  isActive={index === getBreadcrumbPath().length - 1}
                                  id={`breadcrumb-${crumb.id}`}
                                >
                                  {crumb.name}
                                </BreadcrumbItem>
                              ))}
                            </Breadcrumb>
                          </div>
                          
                          {/* Columns Container */}
                          <div style={{ 
                            flex: 1, 
                            display: 'flex', 
                            overflowX: 'auto',
                            overflowY: 'hidden',
                            backgroundColor: 'var(--pf-v5-global--BackgroundColor--100)',
                          }}>
                            {/* Root Column (always visible) */}
                            {(() => {
                              const rootColumnId = getColumnId(0);
                              const rootItems = getFilteredAndSortedItems(fileSystemTree, rootColumnId);
                              const rootSearchValue = columnSearchValues[rootColumnId] || '';
                              const rootSortOrder = columnSortOrder[rootColumnId] || 'asc';
                              
                              return (
                                <div style={{ 
                                  minWidth: '300px', 
                                  width: '300px',
                                  backgroundColor: 'var(--pf-v5-global--BackgroundColor--100)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  borderRight: '2px solid var(--pf-v5-global--BorderColor--200)',
                                }}>
                                  {/* Column Header */}
                                  <div style={{ 
                                    borderBottom: '1px solid var(--pf-v5-global--BorderColor--100)',
                                    backgroundColor: 'var(--pf-v5-global--BackgroundColor--100)',
                                  }}>
                                    <div style={{ 
                                      padding: '0.5rem 0.75rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                    }}>
                                      <div style={{ fontWeight: 'bold', fontSize: 'var(--pf-v5-global--FontSize--sm)' }}>
                                        Root
                                      </div>
                                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                        <Button
                                          variant="plain"
                                          onClick={() => handleColumnSortToggle(rootColumnId)}
                                          style={{ padding: '0.25rem', minWidth: 'auto' }}
                                          id={`root-sort-button`}
                                        >
                                          {rootSortOrder === 'asc' ? <SortAlphaUpIcon /> : <SortAlphaDownIcon />}
                                        </Button>
                                        <Button
                                          variant="plain"
                                          style={{ padding: '0.25rem', minWidth: 'auto' }}
                                          id={`root-filter-button`}
                                        >
                                          <FilterIcon />
                                        </Button>
                                        <Button
                                          variant="plain"
                                          style={{ padding: '0.25rem', minWidth: 'auto' }}
                                          id={`root-refresh-button`}
                                        >
                                          <SyncIcon />
                                        </Button>
                                      </div>
                                    </div>
                                    <div style={{ padding: '0 0.75rem 0.5rem' }}>
                                      <SearchInput
                                        placeholder="Search Root"
                                        value={rootSearchValue}
                                        onChange={(_event, value) => handleColumnSearchChange(rootColumnId, value)}
                                        onClear={() => handleColumnSearchChange(rootColumnId, '')}
                                        id={`root-search-input`}
                                      />
                                    </div>
                                  </div>
                                  <div style={{ flex: 1, overflowY: 'auto', padding: '0.25rem' }}>
                                    {rootItems.length === 0 ? (
                                      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--pf-v5-global--Color--200)', fontSize: 'var(--pf-v5-global--FontSize--sm)' }}>
                                        {rootSearchValue ? 'No results found' : 'Empty'}
                                      </div>
                                    ) : (
                                      rootItems.map((item) => {
                                        const isFullySelected = isFolderFullySelected(item, selectedS3Files);
                                        const isPartiallySelected = isFolderPartiallySelected(item, selectedS3Files);
                                        const selectedCount = item.type === 'folder' ? getSelectedCount(item, selectedS3Files) : null;
                                        const isAcceptable = isAcceptableFile(item);
                                        const isClickable = item.type === 'folder' || isAcceptable;
                                        
                                        return (
                                          <div
                                            key={item.id}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              padding: '0.375rem 0.5rem',
                                              borderRadius: '4px',
                                              cursor: isClickable ? 'pointer' : 'not-allowed',
                                              marginBottom: '0.125rem',
                                              opacity: isAcceptable ? 1 : 0.5,
                                              color: isAcceptable ? 'inherit' : 'var(--pf-v5-global--Color--200)',
                                            }}
                                            onMouseEnter={(e) => {
                                              if (isClickable) {
                                                e.currentTarget.style.backgroundColor = 'var(--pf-v5-global--BackgroundColor--150)';
                                              }
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                            onClick={() => {
                                              if (isClickable && item.type === 'folder') {
                                                handleColumnFolderClick(item.id);
                                              }
                                            }}
                                            id={`column-item-${item.id}`}
                                          >
                                            <div style={{ marginRight: '0.5rem', position: 'relative' }} id={`column-checkbox-wrapper-${item.id}`}>
                                              <Checkbox
                                                id={`column-checkbox-${item.id}`}
                                                isChecked={item.type === 'file' ? selectedS3Files.has(item.id) : isFullySelected}
                                                onChange={(e) => {
                                                  e.stopPropagation();
                                                  if (isAcceptable) {
                                                    handleTreeItemToggle(item);
                                                  }
                                                }}
                                                isDisabled={!isAcceptable}
                                                aria-label={`Select ${item.name}`}
                                              />
                                            </div>
                                            <div style={{ marginRight: '0.5rem', display: 'flex', alignItems: 'center' }}>
                                              {item.type === 'folder' ? (
                                                <OutlinedFolderIcon style={{ color: 'var(--pf-v5-global--palette--blue-400)' }} />
                                              ) : (
                                                <FileIcon style={{ color: isAcceptable ? 'var(--pf-v5-global--Color--200)' : 'var(--pf-v5-global--Color--300)' }} />
                                              )}
                                            </div>
                                            <div style={{ 
                                              flex: 1, 
                                              minWidth: 0,
                                              fontSize: 'var(--pf-v5-global--FontSize--sm)',
                                              fontWeight: item.type === 'folder' ? 'bold' : 'normal',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '0.5rem',
                                            }}>
                                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.name}
                                              </span>
                                              {item.type === 'folder' && selectedCount && selectedCount.selected > 0 && selectedCount.selected < selectedCount.total && (
                                                <Label
                                                  variant="outline"
                                                  color="blue"
                                                  style={{
                                                    fontSize: 'var(--pf-v5-global--FontSize--xs)',
                                                    padding: '0.125rem 0.375rem',
                                                    height: 'auto',
                                                    lineHeight: '1.2',
                                                    flexShrink: 0,
                                                  }}
                                                >
                                                  {selectedCount.selected}/{selectedCount.total}
                                                </Label>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              );
                            })()}
                            
                            {/* Dynamic Columns for Navigation Path */}
                            {columnNavigationPath.map((folderId, columnIndex) => {
                              // Get items for this column level
                              // Navigate to the parent folder to get its children
                              let currentItems = fileSystemTree;
                              for (let i = 0; i < columnIndex; i++) {
                                const folder = findItemById(currentItems, columnNavigationPath[i]);
                                if (folder && folder.children) {
                                  currentItems = folder.children;
                                } else {
                                  currentItems = [];
                                  break;
                                }
                              }
                              const parentFolder = findItemById(currentItems, folderId);
                              const rawItems = parentFolder?.children || [];
                              
                              const columnId = getColumnId(columnIndex + 1, folderId);
                              const filteredItems = getFilteredAndSortedItems(rawItems, columnId);
                              const searchValue = columnSearchValues[columnId] || '';
                              const sortOrder = columnSortOrder[columnId] || 'asc';
                              
                              return (
                                <div
                                  key={`column-${columnIndex}-${folderId}`}
                                  style={{ 
                                    minWidth: '300px', 
                                    width: '300px',
                                    backgroundColor: 'var(--pf-v5-global--BackgroundColor--100)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRight: '2px solid var(--pf-v5-global--BorderColor--200)',
                                  }}
                                  id={`column-${columnIndex}`}
                                >
                                  {/* Column Header */}
                                  <div style={{ 
                                    borderBottom: '1px solid var(--pf-v5-global--BorderColor--100)',
                                    backgroundColor: 'var(--pf-v5-global--BackgroundColor--100)',
                                  }}>
                                    <div style={{ 
                                      padding: '0.5rem 0.75rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                    }}>
                                      <div style={{ fontWeight: 'bold', fontSize: 'var(--pf-v5-global--FontSize--sm)' }}>
                                        {parentFolder?.name || 'Folder'}
                                      </div>
                                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                        <Button
                                          variant="plain"
                                          onClick={() => handleColumnSortToggle(columnId)}
                                          style={{ padding: '0.25rem', minWidth: 'auto' }}
                                          id={`${columnId}-sort-button`}
                                        >
                                          {sortOrder === 'asc' ? <SortAlphaUpIcon /> : <SortAlphaDownIcon />}
                                        </Button>
                                        <Button
                                          variant="plain"
                                          style={{ padding: '0.25rem', minWidth: 'auto' }}
                                          id={`${columnId}-filter-button`}
                                        >
                                          <FilterIcon />
                                        </Button>
                                        <Button
                                          variant="plain"
                                          style={{ padding: '0.25rem', minWidth: 'auto' }}
                                          id={`${columnId}-refresh-button`}
                                        >
                                          <SyncIcon />
                                        </Button>
                                      </div>
                                    </div>
                                    <div style={{ padding: '0 0.75rem 0.5rem' }}>
                                      <SearchInput
                                        placeholder={`Search ${parentFolder?.name || 'Folder'}`}
                                        value={searchValue}
                                        onChange={(_event, value) => handleColumnSearchChange(columnId, value)}
                                        onClear={() => handleColumnSearchChange(columnId, '')}
                                        id={`${columnId}-search-input`}
                                      />
                                    </div>
                                  </div>
                                  <div style={{ flex: 1, overflowY: 'auto', padding: '0.25rem' }}>
                                    {filteredItems.length === 0 ? (
                                      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--pf-v5-global--Color--200)', fontSize: 'var(--pf-v5-global--FontSize--sm)' }}>
                                        {searchValue ? 'No results found' : 'Empty folder'}
                                      </div>
                                    ) : (
                                      filteredItems.map((item) => {
                                        const isFullySelected = isFolderFullySelected(item, selectedS3Files);
                                        const isPartiallySelected = isFolderPartiallySelected(item, selectedS3Files);
                                        const selectedCount = item.type === 'folder' ? getSelectedCount(item, selectedS3Files) : null;
                                        const isAcceptable = isAcceptableFile(item);
                                        const isClickable = item.type === 'folder' || isAcceptable;
                                        
                                        return (
                                          <div
                                            key={item.id}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              padding: '0.375rem 0.5rem',
                                              borderRadius: '4px',
                                              cursor: isClickable ? 'pointer' : 'not-allowed',
                                              marginBottom: '0.125rem',
                                              opacity: isAcceptable ? 1 : 0.5,
                                              color: isAcceptable ? 'inherit' : 'var(--pf-v5-global--Color--200)',
                                            }}
                                            onMouseEnter={(e) => {
                                              if (isClickable) {
                                                e.currentTarget.style.backgroundColor = 'var(--pf-v5-global--BackgroundColor--150)';
                                              }
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                            onClick={() => {
                                              if (isClickable && item.type === 'folder') {
                                                handleColumnFolderClick(item.id);
                                              }
                                            }}
                                            id={`column-item-${item.id}`}
                                          >
                                            <div style={{ marginRight: '0.5rem', position: 'relative' }} id={`column-checkbox-wrapper-${item.id}`}>
                                              <Checkbox
                                                id={`column-checkbox-${item.id}`}
                                                isChecked={item.type === 'file' ? selectedS3Files.has(item.id) : isFullySelected}
                                                onChange={(e) => {
                                                  e.stopPropagation();
                                                  if (isAcceptable) {
                                                    handleTreeItemToggle(item);
                                                  }
                                                }}
                                                isDisabled={!isAcceptable}
                                                aria-label={`Select ${item.name}`}
                                              />
                                            </div>
                                            <div style={{ marginRight: '0.5rem', display: 'flex', alignItems: 'center' }}>
                                              {item.type === 'folder' ? (
                                                <OutlinedFolderIcon style={{ color: 'var(--pf-v5-global--palette--blue-400)' }} />
                                              ) : (
                                                <FileIcon style={{ color: isAcceptable ? 'var(--pf-v5-global--Color--200)' : 'var(--pf-v5-global--Color--300)' }} />
                                              )}
                                            </div>
                                            <div style={{ 
                                              flex: 1, 
                                              minWidth: 0,
                                              fontSize: 'var(--pf-v5-global--FontSize--sm)',
                                              fontWeight: item.type === 'folder' ? 'bold' : 'normal',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '0.5rem',
                                            }}>
                                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.name}
                                              </span>
                                              {item.type === 'folder' && selectedCount && selectedCount.selected > 0 && selectedCount.selected < selectedCount.total && (
                                                <Label
                                                  variant="outline"
                                                  color="blue"
                                                  style={{
                                                    fontSize: 'var(--pf-v5-global--FontSize--xs)',
                                                    padding: '0.125rem 0.375rem',
                                                    height: 'auto',
                                                    lineHeight: '1.2',
                                                    flexShrink: 0,
                                                  }}
                                                >
                                                  {selectedCount.selected}/{selectedCount.total}
                                                </Label>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )
                    ) : (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--pf-v5-global--Color--200)' }}>
                        No files or folders found in this connection
                      </div>
                    )
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--pf-v5-global--Color--200)' }}>
                      No connection selected. Please select a connection in the Documents panel.
                    </div>
                  )}
                </div>
              </div>
            </GridItem>
          </Grid>
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="primary" 
            onClick={handleAddSelectedS3Files} 
            id="select-files-submit-button"
            isDisabled={selectedS3Files.size === 0}
          >
            Select files
          </Button>
          <Button variant="secondary" onClick={handleCloseSelectFilesModal} id="select-files-cancel-button">
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Connection Details Modal */}
      <Modal
        variant={ModalVariant.medium}
        isOpen={isConnectionDetailsModalOpen}
        onClose={() => setIsConnectionDetailsModalOpen(false)}
        id="connection-details-modal"
      >
        <ModalHeader>
          <Title headingLevel="h2" size="xl" id="connection-details-modal-title">
            Connection details
          </Title>
        </ModalHeader>
        <ModalBody>
          {selectedConnectionForDetails && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Name</div>
                <div>{selectedConnectionForDetails.name}</div>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Type</div>
                <div>{selectedConnectionForDetails.type}</div>
              </div>
              {selectedConnectionForDetails.bucketName && (
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Bucket name</div>
                  <div>{selectedConnectionForDetails.bucketName}</div>
                </div>
              )}
              {selectedConnectionForDetails.endpoint && (
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Endpoint</div>
                  <div>{selectedConnectionForDetails.endpoint}</div>
                </div>
              )}
              {selectedConnectionForDetails.region && (
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Region</div>
                  <div>{selectedConnectionForDetails.region}</div>
                </div>
              )}
              {selectedConnectionForDetails.accessKey && (
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Access key</div>
                  <div>{selectedConnectionForDetails.accessKey}</div>
                </div>
              )}
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Created at</div>
                <div>{selectedConnectionForDetails.createdAt.toLocaleString()}</div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setIsConnectionDetailsModalOpen(false)} id="connection-details-modal-close-button">
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Pattern Details Modal */}
      <Modal
        variant={ModalVariant.large}
        isOpen={isPatternDetailsModalOpen}
        onClose={() => setIsPatternDetailsModalOpen(false)}
        id="pattern-details-modal"
        style={{ height: '90vh' }}
      >
        <ModalHeader>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ width: '100%' }}>
            <FlexItem>
              <Title headingLevel="h2" size="xl" id="pattern-details-modal-title">
                Pattern details
              </Title>
              {selectedPatternForDetails && (
                <div style={{ marginTop: '0.5rem', fontSize: 'var(--pf-v5-global--FontSize--md)' }}>
                  Pattern {selectedPatternForDetails.rank}
                </div>
              )}
            </FlexItem>
            <FlexItem>
              <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <Button variant="secondary" icon={<DownloadIcon />} id="pattern-details-download-button">
                    Download
                  </Button>
                </FlexItem>
                <FlexItem>
                  <Button variant="plain" onClick={() => setIsPatternDetailsModalOpen(false)} id="pattern-details-close-button" aria-label="Close">
                    ×
                  </Button>
                </FlexItem>
              </Flex>
            </FlexItem>
          </Flex>
        </ModalHeader>
        <ModalBody style={{ padding: 0, height: 'calc(90vh - 120px)', overflow: 'hidden' }}>
          {selectedPatternForDetails && (
            <Flex style={{ height: '100%' }}>
              {/* Side Navigation */}
              <FlexItem style={{ width: '200px', borderRight: '1px solid var(--pf-v5-global--BorderColor--100)', padding: '1rem', overflowY: 'auto' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Pattern information</div>
                <JumpLinks isVertical scrollableSelector="#pattern-details-content" offset={20} id="pattern-details-jump-links">
                  <JumpLinksItem href="#pattern-information-section" id="jump-link-pattern-information">
                    Pattern information
                  </JumpLinksItem>
                  <JumpLinksItem href="#vector-store-section" id="jump-link-vector-store">
                    Vector store
                  </JumpLinksItem>
                  <JumpLinksItem href="#agent-section" id="jump-link-agent">
                    Agent
                  </JumpLinksItem>
                  <JumpLinksItem href="#chunking-section" id="jump-link-chunking">
                    Chunking
                  </JumpLinksItem>
                  <JumpLinksItem href="#embeddings-section" id="jump-link-embeddings">
                    Embeddings
                  </JumpLinksItem>
                  <JumpLinksItem href="#retrieval-section" id="jump-link-retrieval">
                    Retrieval
                  </JumpLinksItem>
                  <JumpLinksItem href="#generation-section" id="jump-link-generation">
                    Generation
                  </JumpLinksItem>
                  <JumpLinksItem href="#sample-qa-section" id="jump-link-sample-qa">
                    Sample Q&A
                  </JumpLinksItem>
                </JumpLinks>
              </FlexItem>

              {/* Main Content */}
              <FlexItem flex={{ default: 'flex_1' }} style={{ overflowY: 'auto', padding: '1.5rem' }} id="pattern-details-content">
                {/* Pattern Information Section */}
                <div id="pattern-information-section" style={{ marginBottom: '2rem', scrollMarginTop: '20px' }}>
                  <Title headingLevel="h3" size="lg" style={{ marginBottom: '1rem' }}>Pattern information</Title>
                  <DescriptionList isHorizontal columnModifier={{ default: '2Col' }}>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Pattern</DescriptionListTerm>
                      <DescriptionListDescription>
                        Pattern {selectedPatternForDetails.rank} (#{selectedPatternForDetails.rank})
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Chat deployment</DescriptionListTerm>
                      <DescriptionListDescription>
                        <a href="#" style={{ color: '#0066cc' }}>Pattern {selectedPatternForDetails.rank}: rag jan 26</a>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Build index deployment</DescriptionListTerm>
                      <DescriptionListDescription>
                        <a href="#" style={{ color: '#0066cc' }}>Pattern {selectedPatternForDetails.rank}: rag jan 26</a>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Composition steps</DescriptionListTerm>
                      <DescriptionListDescription>
                        Model selection → Chunking → Embeddings → Retrieval → Generation
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Score type</DescriptionListTerm>
                      <DescriptionListDescription>
                        <Radio id="score-mean" name="score-type" isChecked label="Mean" />
                        <Radio id="score-ci-high" name="score-type" label="CI High" style={{ marginLeft: '1rem' }} />
                        <Radio id="score-ci-low" name="score-type" label="CI Low" style={{ marginLeft: '1rem' }} />
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                  
                  {/* Performance Metrics */}
                  <div style={{ marginTop: '1.5rem' }}>
                    <Title headingLevel="h4" size="md" style={{ marginBottom: '1rem' }}>Performance Metrics</Title>
                    <DescriptionList isHorizontal columnModifier={{ default: '1Col' }}>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Answer correctness (Mean)</DescriptionListTerm>
                        <DescriptionListDescription>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ flex: 1, height: '20px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: '76.5%', height: '100%', backgroundColor: '#6a1b9a' }}></div>
                            </div>
                            <span>0.765</span>
                          </div>
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Answer faithfulness (Mean)</DescriptionListTerm>
                        <DescriptionListDescription>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ flex: 1, height: '20px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: '59.4%', height: '100%', backgroundColor: '#6a1b9a' }}></div>
                            </div>
                            <span>0.594</span>
                          </div>
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                      <DescriptionListGroup>
                        <DescriptionListTerm>Context correctness (Mean)</DescriptionListTerm>
                        <DescriptionListDescription>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ flex: 1, height: '20px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: '95.5%', height: '100%', backgroundColor: '#6a1b9a' }}></div>
                            </div>
                            <span>0.955</span>
                          </div>
                        </DescriptionListDescription>
                      </DescriptionListGroup>
                    </DescriptionList>
                  </div>
                </div>

                {/* Vector Store Section */}
                <div id="vector-store-section" style={{ marginBottom: '2rem', scrollMarginTop: '20px' }}>
                  <Title headingLevel="h3" size="lg" style={{ marginBottom: '1rem' }}>Vector store</Title>
                  <DescriptionList isHorizontal columnModifier={{ default: '2Col' }}>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Vector store datasource type</DescriptionListTerm>
                      <DescriptionListDescription>Milvus</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Vector store distance metric</DescriptionListTerm>
                      <DescriptionListDescription>Cosine</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Vector store index name</DescriptionListTerm>
                      <DescriptionListDescription>autoai_rag_a44547cc_20260126144955</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Vector store operation</DescriptionListTerm>
                      <DescriptionListDescription>Upsert</DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                  
                  {/* Vector Store Schema Fields Table */}
                  <div style={{ marginTop: '1.5rem' }}>
                    <Title headingLevel="h4" size="md" style={{ marginBottom: '1rem' }}>Vector store schema fields</Title>
                    <Table aria-label="Vector store schema fields" variant="compact">
                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                          <Th>Description</Th>
                          <Th>Role</Th>
                          <Th>Type</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td dataLabel="Name">document_id</Td>
                          <Td dataLabel="Description">document filename</Td>
                          <Td dataLabel="Role">document_name</Td>
                          <Td dataLabel="Type">string</Td>
                        </Tr>
                        <Tr>
                          <Td dataLabel="Name">pk</Td>
                          <Td dataLabel="Description">Primary key</Td>
                          <Td dataLabel="Role">pk</Td>
                          <Td dataLabel="Type">string</Td>
                        </Tr>
                        <Tr>
                          <Td dataLabel="Name">sequence_number</Td>
                          <Td dataLabel="Description">sequential chunk number, representing its position within a larger document</Td>
                          <Td dataLabel="Role">chunk_sequence_number</Td>
                          <Td dataLabel="Type">number</Td>
                        </Tr>
                        <Tr>
                          <Td dataLabel="Name">sparse_embeddings</Td>
                          <Td dataLabel="Description">sparse embeddings vector</Td>
                          <Td dataLabel="Role">sparse_vector_embeddings</Td>
                          <Td dataLabel="Type">array</Td>
                        </Tr>
                        <Tr>
                          <Td dataLabel="Name">start_index</Td>
                          <Td dataLabel="Description">chunk starting token position in the source document</Td>
                          <Td dataLabel="Role">chunk_start_position</Td>
                          <Td dataLabel="Type">number</Td>
                        </Tr>
                        <Tr>
                          <Td dataLabel="Name">text</Td>
                          <Td dataLabel="Description">text chunk extracted from document</Td>
                          <Td dataLabel="Role">text</Td>
                          <Td dataLabel="Type">string</Td>
                        </Tr>
                        <Tr>
                          <Td dataLabel="Name">vector</Td>
                          <Td dataLabel="Description">dense embeddings vector</Td>
                          <Td dataLabel="Role">dense_vector_embeddings</Td>
                          <Td dataLabel="Type">array</Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </div>
                  
                  <DescriptionList isHorizontal columnModifier={{ default: '2Col' }} style={{ marginTop: '1.5rem' }}>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Vector store schema ID</DescriptionListTerm>
                      <DescriptionListDescription>autoai_rag_1.1.1</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Vector store schema name</DescriptionListTerm>
                      <DescriptionListDescription>Document schema using open-source loaders</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Vector store schema type</DescriptionListTerm>
                      <DescriptionListDescription>struct</DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </div>

                {/* Agent Section */}
                <div id="agent-section" style={{ marginBottom: '2rem', scrollMarginTop: '20px' }}>
                  <Title headingLevel="h3" size="lg" style={{ marginBottom: '1rem' }}>Agent</Title>
                  <DescriptionList isHorizontal columnModifier={{ default: '2Col' }}>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Description</DescriptionListTerm>
                      <DescriptionListDescription>Sequential graph with single index retriever.</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Framework</DescriptionListTerm>
                      <DescriptionListDescription>langgraph</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Type</DescriptionListTerm>
                      <DescriptionListDescription>Sequential</DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </div>

                {/* Chunking Section */}
                <div id="chunking-section" style={{ marginBottom: '2rem', scrollMarginTop: '20px' }}>
                  <Title headingLevel="h3" size="lg" style={{ marginBottom: '1rem' }}>Chunking</Title>
                  <DescriptionList isHorizontal columnModifier={{ default: '2Col' }}>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Chunk overlap</DescriptionListTerm>
                      <DescriptionListDescription>256</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Chunk size</DescriptionListTerm>
                      <DescriptionListDescription>{selectedPatternForDetails.chunkSize}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Chunk method</DescriptionListTerm>
                      <DescriptionListDescription>{selectedPatternForDetails.chunkMethod}</DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </div>

                {/* Embeddings Section */}
                <div id="embeddings-section" style={{ marginBottom: '2rem', scrollMarginTop: '20px' }}>
                  <Title headingLevel="h3" size="lg" style={{ marginBottom: '1rem' }}>Embeddings</Title>
                  <DescriptionList isHorizontal columnModifier={{ default: '2Col' }}>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Embedding model</DescriptionListTerm>
                      <DescriptionListDescription>
                        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                          <FlexItem>slate-125m-english-rtrvr-v2</FlexItem>
                          <FlexItem>
                            <Button variant="plain" aria-label="View embedding model" icon={<InfoCircleIcon />} />
                          </FlexItem>
                        </Flex>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Truncate input tokens</DescriptionListTerm>
                      <DescriptionListDescription>512</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Truncate strategy</DescriptionListTerm>
                      <DescriptionListDescription>Left</DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </div>

                {/* Retrieval Section */}
                <div id="retrieval-section" style={{ marginBottom: '2rem', scrollMarginTop: '20px' }}>
                  <Title headingLevel="h3" size="lg" style={{ marginBottom: '1rem' }}>Retrieval</Title>
                  <DescriptionList isHorizontal columnModifier={{ default: '2Col' }}>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Hybrid ranker alpha</DescriptionListTerm>
                      <DescriptionListDescription>0.8</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Model family</DescriptionListTerm>
                      <DescriptionListDescription>BM25</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Hybrid ranker strategy</DescriptionListTerm>
                      <DescriptionListDescription>Weighted</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Retrieval method</DescriptionListTerm>
                      <DescriptionListDescription>Window</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Number of chunks</DescriptionListTerm>
                      <DescriptionListDescription>5</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Window size</DescriptionListTerm>
                      <DescriptionListDescription>3</DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </div>

                {/* Generation Section */}
                <div id="generation-section" style={{ marginBottom: '2rem', scrollMarginTop: '20px' }}>
                  <Title headingLevel="h3" size="lg" style={{ marginBottom: '1rem' }}>Generation</Title>
                  <DescriptionList isHorizontal columnModifier={{ default: '1Col' }}>
                    <DescriptionListGroup>
                      <DescriptionListTerm>System message text</DescriptionListTerm>
                      <DescriptionListDescription>
                        You are Granite Chat, an AI language model developed by IBM. You are a cautious assistant. You carefully follow instructions. You are helpful and harmless and you follow ethical guidelines and promote positive behaviour.
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>User message text</DescriptionListTerm>
                      <DescriptionListDescription>
                        You are an AI language model designed to function as a specialized Retrieval Augmented Generation (RAG) assistant. When generating responses, prioritize correctness, i.e., ensure that your response is grounded in context and user query. Always make sure that your response is relevant to the question. Answer Length: detailed {'{reference_documents}'} Respond exclusively in the language of the question, regardless of any other language used in the provided context. Ensure that your entire response is in the same language as the question. {'{question}'}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Context template text</DescriptionListTerm>
                      <DescriptionListDescription>[Document] {'{document}'} [End]</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Foundation model</DescriptionListTerm>
                      <DescriptionListDescription>
                        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                          <FlexItem>{selectedPatternForDetails.modelName}</FlexItem>
                          <FlexItem>
                            <Button variant="plain" aria-label="View foundation model" icon={<InfoCircleIcon />} />
                          </FlexItem>
                        </Flex>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Maximum completion tokens</DescriptionListTerm>
                      <DescriptionListDescription>2048</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Temperature</DescriptionListTerm>
                      <DescriptionListDescription>0.2</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Word to token ratio</DescriptionListTerm>
                      <DescriptionListDescription>2</DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </div>

                {/* Sample Q&A Section */}
                <div id="sample-qa-section" style={{ marginBottom: '2rem', scrollMarginTop: '20px' }}>
                  <Title headingLevel="h3" size="lg" style={{ marginBottom: '1rem' }}>Sample Q&A</Title>
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Question</div>
                    <div style={{ marginBottom: '1rem' }}>
                      How can I ensure that the generated answers will be accurate, factual and based on my information?
                    </div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Answer</div>
                    <div>
                      To ensure that the generated answers are accurate, factual, and based on your information, you should employ the retrieval-augmented generation (RAG) pattern when prompting a foundation model in IBM watsonx.ai. This method involves providing the necessary facts as context in your prompt text, which helps the model generate output that is grounded in the information from your knowledge base.
                    </div>
                  </div>
                </div>
              </FlexItem>
            </Flex>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setIsPatternDetailsModalOpen(false)} id="pattern-details-modal-close-button">
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Floating Dev Tool State Switcher */}
      <div
        ref={devToolRef}
        style={{
          position: 'fixed',
          left: `${devToolPosition.x}px`,
          top: `${devToolPosition.y}px`,
          zIndex: 9999,
          userSelect: 'none',
        }}
        id="dev-tool-panel"
      >
        {isDevToolExpanded ? (
          <Card
            style={{
              width: '260px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '2px solid #0066cc',
            }}
          >
            <CardHeader
              onMouseDown={handleDevToolMouseDown}
              style={{
                cursor: isDragging ? 'grabbing' : 'grab',
                backgroundColor: '#f0f0f0',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <GripVerticalIcon style={{ color: '#6a6e73' }} />
                </FlexItem>
                <FlexItem>
                  <div style={{ color: 'var(--pf-v5-global--palette--purple-500)', fontWeight: 'bold', fontSize: 'var(--pf-v5-global--FontSize--sm)' }}>
                    Dev States
                  </div>
                </FlexItem>
              </Flex>
              <Button
                variant="plain"
                onClick={() => setIsDevToolExpanded(false)}
                style={{ padding: '0.25rem' }}
                id="dev-tool-collapse-button"
                aria-label="Collapse dev tools"
              >
                <TimesIcon />
              </Button>
            </CardHeader>
            <CardBody style={{ padding: '0.75rem' }}>
              <div style={{ marginBottom: '0.75rem', fontSize: 'var(--pf-v5-global--FontSize--sm)', fontWeight: 'bold' }}>
                Main Page States
              </div>
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <Button
                  variant={experiments.length === 0 ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={handleSwitchToEmptyState}
                  id="dev-tool-empty-state"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  Empty State
                </Button>
                <Button
                  variant={experiments.length > 0 && !experimentCreated ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={handleSwitchToTableView}
                  id="dev-tool-table-view"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  Table View
                </Button>
              </Flex>
              
              {(experimentCreated || experimentRunning || experimentCompleted) && (
                <>
                  <div style={{ marginTop: '1rem', marginBottom: '0.75rem', fontSize: 'var(--pf-v5-global--FontSize--sm)', fontWeight: 'bold' }}>
                    Results Page States
                  </div>
                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                    <Button
                      variant={experimentRunning ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => {
                        setExperimentRunning(true);
                        setExperimentCompleted(false);
                        setPatternResults([]);
                      }}
                      id="dev-tool-running-state"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      Running State
                    </Button>
                    <Button
                      variant={experimentCompleted && !experimentRunning ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => {
                        const mockResults: PatternResult[] = [
                          {
                            id: '1',
                            rank: 1,
                            patternName: 'Pattern 1',
                            modelName: 'llama-4-ma',
                            answerFaithfulness: 0.95,
                            chunkMethod: 'Semantic',
                            chunkSize: 512,
                            status: 'Complete',
                          },
                          {
                            id: '2',
                            rank: 2,
                            patternName: 'Pattern 2',
                            modelName: 'gpt-oss-120b',
                            answerFaithfulness: 0.92,
                            chunkMethod: 'Fixed',
                            chunkSize: 256,
                            status: 'Complete',
                          },
                          {
                            id: '3',
                            rank: 3,
                            patternName: 'Pattern 3',
                            modelName: 'gpt-oss-120b',
                            answerFaithfulness: 0.89,
                            chunkMethod: 'Semantic',
                            chunkSize: 1024,
                            status: 'Complete',
                          },
                          {
                            id: '4',
                            rank: 4,
                            patternName: 'Pattern 4',
                            modelName: 'llama-4-ma',
                            answerFaithfulness: 0.87,
                            chunkMethod: 'Fixed',
                            chunkSize: 512,
                            status: 'Complete',
                          },
                          {
                            id: '5',
                            rank: 5,
                            patternName: 'Pattern 5',
                            modelName: 'llama-3-3-70b',
                            answerFaithfulness: 0.85,
                            chunkMethod: 'Semantic',
                            chunkSize: 256,
                            status: 'Complete',
                          },
                          {
                            id: '6',
                            rank: 6,
                            patternName: 'Pattern 6',
                            modelName: 'llama-3-3-70b',
                            answerFaithfulness: 0.83,
                            chunkMethod: 'Fixed',
                            chunkSize: 1024,
                            status: 'Complete',
                          },
                        ];
                        setPatternResults(mockResults);
                        setExperimentRunning(false);
                        setExperimentCompleted(true);
                      }}
                      id="dev-tool-completed-state"
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                      Completed State
                    </Button>
                  </Flex>
                </>
              )}
              
              <div style={{ marginTop: '1rem', marginBottom: '0.75rem', fontSize: 'var(--pf-v5-global--FontSize--sm)', fontWeight: 'bold' }}>
                Document Selection Variants
              </div>
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <Button
                  variant={documentSelectionVariant === 'option1' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setDocumentSelectionVariant('option1')}
                  id="dev-tool-doc-selection-option1"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  Document Selection Option 1
                </Button>
                <Button
                  variant={documentSelectionVariant === 'option2' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setDocumentSelectionVariant('option2')}
                  id="dev-tool-doc-selection-option2"
                  style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                  Document Selection Option 2
                </Button>
              </Flex>
            </CardBody>
          </Card>
        ) : (
          <button
            onClick={() => setIsDevToolExpanded(true)}
            style={{
              borderRadius: '9999px',
              padding: '0.5rem 1rem',
              backgroundColor: '#c41d3f',
              border: '1px solid #c41d3f',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              fontSize: 'var(--pf-v5-global--FontSize--sm)',
              fontWeight: 'var(--pf-v5-global--FontWeight--normal)',
              cursor: 'pointer',
              fontFamily: 'var(--pf-v5-global--FontFamily--sans-serif)',
            }}
            id="dev-tool-toggle-button"
            aria-label="Open dev tools"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#a00';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#c41d3f';
            }}
          >
            Dev States
          </button>
        )}
      </div>

    </>
  );
};

export { AutoRAG };

