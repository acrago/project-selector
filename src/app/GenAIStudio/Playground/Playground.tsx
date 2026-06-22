import React, { useEffect, useState } from 'react';
import {
  Alert,
  AlertActionCloseButton,
  AlertActionLink,
  AlertGroup,
  AlertVariant,
  Badge,
  Button,
  Card,
  CardBody,
  Checkbox,
  Content,
  Divider,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelContent,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateBody,
  ExpandableSection,
  Flex,
  FlexItem,
  FormGroup,
  FormGroupLabelHelp,
  InputGroup,
  InputGroupItem,
  Label,
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  MultipleFileUpload,
  MultipleFileUploadMain,
  PageSection,
  Pagination,
  Popover,
  Progress,
  ProgressSize,
  Radio,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Slider,
  Spinner,
  Switch,
  Tab,
  TabTitleText,
  Tabs,
  TextArea,
  TextInput,
  Title,
  ToggleGroup,
  ToggleGroupItem,
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
  AngleRightIcon,
  CheckCircleIcon,
  CheckIcon,
  CodeIcon,
  CogIcon,
  ColumnsIcon,
  CopyIcon,
  CubesIcon,
  DownloadIcon,
  EllipsisVIcon,
  ExclamationTriangleIcon,
  FileIcon,
  FileImageIcon,
  FilmIcon,
  FolderIcon,
  FolderOpenIcon,
  HistoryIcon,
  InfoCircleIcon,
  LightbulbIcon,
  LockIcon,
  LockOpenIcon,
  MicrophoneIcon,
  OutlinedFolderIcon,
  OutlinedQuestionCircleIcon,
  PauseCircleIcon,
  PencilAltIcon,
  PlayIcon,
  PlusCircleIcon,
  PlusIcon,
  RedoIcon,
  TimesIcon,
  TrashIcon,
  UploadIcon,
  VolumeUpIcon,
} from '@patternfly/react-icons';
import type { DropEvent } from 'react-dropzone';
import Chatbot, {
  ChatbotDisplayMode,
} from '@patternfly/chatbot/dist/dynamic/Chatbot';
import ChatbotContent from '@patternfly/chatbot/dist/dynamic/ChatbotContent';
import ChatbotWelcomePrompt from '@patternfly/chatbot/dist/dynamic/ChatbotWelcomePrompt';
import MessageBar from '@patternfly/chatbot/dist/dynamic/MessageBar';
import MessageBox from '@patternfly/chatbot/dist/dynamic/MessageBox';
import Message from '@patternfly/chatbot/dist/dynamic/Message';
import FileDetailsLabel from '@patternfly/chatbot/dist/dynamic/FileDetailsLabel';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';
import { usePlaygroundMasthead } from '@app/utils/PlaygroundMastheadContext';
import { AddVectorStoreModal } from './components/AddVectorStoreModal';
import { LoadPromptModal } from './components/LoadPromptModal';
import { CreatePromptModal } from '@app/GenAIStudio/PromptLab/components/CreatePromptModal';
import { CreateVersionModal } from '@app/GenAIStudio/PromptLab/components/CreateVersionModal';
import { Prompt, PromptVersion } from '@app/GenAIStudio/PromptLab/types';
import ChatbotIcon from '@app/assets/chatbotIcon.svg';
import { mockSubscriptions } from '../../Settings/Subscriptions/mockData';
// Using ColumnsIcon for Chat Compare button (side-by-side comparison)
import { PlaygroundIcon } from '@app/Home/icons';
import { classifyError, getMicrocopy, ErrorBody, RetryButton } from './errors';
import { findMockScenario } from './errors/mockErrors';
import type { ClassifiedError } from './errors';
import './errors/playground-errors.css';

const DEFAULT_SYSTEM_PROMPT = 'You are a helpful AI assistant.';

const Playground: React.FunctionComponent = () => {
  useDocumentTitle('Playground');
  const { flags, selectedProject, setSelectedProject } = useFeatureFlags();
  const playgroundMasthead = usePlaygroundMasthead();

  // State management
  const [isProjectSelectOpen, setIsProjectSelectOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [originalPrompt, setOriginalPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [isSystemPromptReadOnly, setIsSystemPromptReadOnly] = useState(false);
  const [isPromptEdited, setIsPromptEdited] = useState(false);
  const [isRagEnabled, setIsRagEnabled] = useState(true);
  const [isRagEnabled2, setIsRagEnabled2] = useState(true);
  const [isVsDropdownOpen, setIsVsDropdownOpen] = useState(false);
  const [isVsDropdownOpen2, setIsVsDropdownOpen2] = useState(false);
  const [vsSearchValue, setVsSearchValue] = useState('');
  const [vsSearchValue2, setVsSearchValue2] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-oss-20b');
  const [isModelSelectOpen, setIsModelSelectOpen] = useState(false);
  const activeSubscriptions = React.useMemo(() => mockSubscriptions.filter(s => s.status === 'Active').sort((a, b) => a.displayName.localeCompare(b.displayName)), []);
  const [selectedSubscription, setSelectedSubscription] = useState(activeSubscriptions[0]?.id || '');
  const [isSubscriptionSelectOpen, setIsSubscriptionSelectOpen] = useState(false);
  const [reasoningLevel, setReasoningLevel] = useState('default');
  const [isReasoningLevelOpen, setIsReasoningLevelOpen] = useState(false);

  // Models with reasoning capability
  const modelsWithReasoning = ['gpt-oss-20b', 'gpt-oss-120b', 'qwen3-14b', 'llama-3.2-11b', 'granite-4.0-h-small'];
  const hasReasoning = modelsWithReasoning.includes(selectedModel);

  // Multimodal capability metadata per model
  type ModalityCapabilities = {
    inputModalities: ('text' | 'image' | 'audio' | 'video')[];
    outputModalities: ('text' | 'image' | 'audio')[];
    label: string;
  };
  const modelCapabilities: Record<string, ModalityCapabilities> = {
    'gpt-oss-20b': { inputModalities: ['text'], outputModalities: ['text'], label: 'Text' },
    'gpt-oss-120b': { inputModalities: ['text', 'image'], outputModalities: ['text'], label: 'Vision' },
    'qwen3-14b': { inputModalities: ['text', 'image', 'audio'], outputModalities: ['text', 'audio'], label: 'Omni' },
    'llama-3.2-11b': { inputModalities: ['text', 'image'], outputModalities: ['text'], label: 'Vision' },
    'granite-4.0-h-small': { inputModalities: ['text'], outputModalities: ['text'], label: 'Text' },
    'ministral-3-8b': { inputModalities: ['text', 'image', 'audio'], outputModalities: ['text', 'image', 'audio'], label: 'Omni' },
  };
  const currentCapabilities = modelCapabilities[selectedModel] || modelCapabilities['gpt-oss-20b'];
  const supportsImageInput = flags.enableMultimodalInput && currentCapabilities.inputModalities.includes('image');
  const supportsAudioInput = flags.enableMultimodalInput && currentCapabilities.inputModalities.includes('audio');
  const supportsMultimodal = flags.enableMultimodalCapabilities && (currentCapabilities.inputModalities.length > 1 || currentCapabilities.outputModalities.length > 1);

  // Allowed file types based on model capabilities
  const allowedFileTypes: Record<string, string[]> = {
    'text/plain': ['.txt'],
    'application/json': ['.json'],
    'text/csv': ['.csv'],
    'text/markdown': ['.md'],
    'application/pdf': ['.pdf'],
    ...(supportsImageInput ? {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
    } : {}),
    ...(supportsAudioInput ? {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/webm': ['.webm'],
      'audio/ogg': ['.ogg'],
      'audio/flac': ['.flac'],
    } : {}),
    ...(flags.enableMultimodalInput ? {
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
    } : {}),
  };

  // Staged file attachments
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const handleFileRemoved = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Large file handling — soft limit 5MB, hard limit 25MB
  const FILE_SOFT_LIMIT = 5 * 1024 * 1024;
  const FILE_HARD_LIMIT = 25 * 1024 * 1024;
  const [fileSizeWarnings, setFileSizeWarnings] = useState<string[]>([]);
  const [fileSizeErrors, setFileSizeErrors] = useState<string[]>([]);

  // One-media-file-per-chat guardrail — one image/audio/video per conversation, text files unlimited
  const [pendingMediaReplace, setPendingMediaReplace] = useState<File[] | null>(null);

  const isMediaFile = (f: File) => {
    const t = f.type;
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    return t.startsWith('image/') || t.startsWith('audio/') || t.startsWith('video/') ||
      ['jpg','jpeg','png','gif','webp','svg','bmp'].includes(ext) ||
      ['mp3','wav','flac','ogg','webm','aac','m4a','opus'].includes(ext) ||
      ['mp4','mov','avi'].includes(ext);
  };

  // File attachment handler — uses MessageBar's built-in react-dropzone with allowedFileTypes
  const handleAttach = (files: File[], _event: DropEvent) => {
    const warnings: string[] = [];
    const errors: string[] = [];
    const accepted: File[] = [];
    for (const file of files) {
      if (file.size > FILE_HARD_LIMIT) {
        errors.push(`${file.name} exceeds maximum size of 25 MB. Try a smaller file.`);
      } else {
        if (file.size > FILE_SOFT_LIMIT) {
          warnings.push(`${file.name} is large (${(file.size / 1024 / 1024).toFixed(1)} MB) — may take longer to process.`);
        }
        accepted.push(file);
      }
    }
    setFileSizeWarnings(warnings);
    setFileSizeErrors(errors);

    if (accepted.length === 0) return;

    // Check if any new files are media (not text)
    const incomingMedia = accepted.filter(isMediaFile);

    if (incomingMedia.length > 0) {
      // Check if there's already a media file in chat history or staged files
      const hasMediaInStaged = stagedFiles.some(isMediaFile);
      if (hasMediaInStaged) {
        // Show replace confirmation
        setPendingMediaReplace(accepted);
        return;
      }
    }

    setStagedFiles(prev => [...prev, ...accepted]);
  };

  const confirmMediaReplace = () => {
    if (!pendingMediaReplace) return;
    // Remove existing media files from staged, keep text files
    const textOnly = stagedFiles.filter(f => !isMediaFile(f));
    setStagedFiles([...textOnly, ...pendingMediaReplace]);
    setPendingMediaReplace(null);
  };

  // Drag-and-drop overlay state
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const dragCounterRef = React.useRef(0);

  const handleChatDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragOver(true);
    setDragError(null);
  };
  const handleChatDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragOver(false);
      setDragError(null);
    }
  };
  const handleChatDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleChatDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Check if any file types are unsupported by the current model
    const unsupported = files.filter(f => {
      const ext = '.' + (f.name.split('.').pop()?.toLowerCase() || '');
      const allowedExts = Object.values(allowedFileTypes).flat();
      return !allowedExts.includes(ext);
    });

    if (unsupported.length > 0) {
      const types = unsupported.map(f => f.name.split('.').pop()?.toUpperCase()).join(', ');
      setDragError(`The selected model does not support ${types} files. Switch to a model with the right capabilities.`);
      setTimeout(() => setDragError(null), 5000);
      return;
    }
    handleAttach(files, e as any);
  };

  // Model-switch confirmation dialog state
  const [pendingModelSwitch, setPendingModelSwitch] = useState<{ targetModel: string; lostCapabilities: string[] } | null>(null);
  const pendingModelSetterRef = React.useRef<((m: string) => void) | null>(null);

  const getCapabilityLosses = (fromModel: string, toModel: string): string[] => {
    const fromCaps = modelCapabilities[fromModel] || modelCapabilities['gpt-oss-20b'];
    const toCaps = modelCapabilities[toModel] || modelCapabilities['gpt-oss-20b'];
    const losses: string[] = [];
    if (fromCaps.inputModalities.includes('image') && !toCaps.inputModalities.includes('image')) losses.push('Image input');
    if (fromCaps.inputModalities.includes('audio') && !toCaps.inputModalities.includes('audio')) losses.push('Audio input');
    return losses;
  };

  const handleModelSwitch = (targetModel: string, currentModel: string, setter: (m: string) => void) => {
    if (!flags.enableMultimodalCapabilities) { setter(targetModel); return; }
    const losses = getCapabilityLosses(currentModel, targetModel);
    if (losses.length > 0 && chatHistory.length > 0) {
      setPendingModelSwitch({ targetModel, lostCapabilities: losses });
      pendingModelSetterRef.current = setter;
    } else {
      setter(targetModel);
    }
  };

  // Attach menu state
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);


  // Attach menu selection handler
  const handleAttachMenuSelect = (_event?: React.MouseEvent, value?: string | number) => {
    setIsAttachMenuOpen(false);
    if (value === 'upload-image') {
      fileInputRef.current?.setAttribute('accept', '.png,.jpg,.jpeg,.gif,.webp');
      fileInputRef.current?.click();
    } else if (value === 'upload-audio') {
      fileInputRef.current?.setAttribute('accept', '.mp3,.wav,.webm,.ogg,.flac');
      fileInputRef.current?.click();
    } else if (value === 'upload-video') {
      fileInputRef.current?.setAttribute('accept', '.mp4,.webm,.mov,.avi');
      fileInputRef.current?.click();
    } else if (value === 'upload-files') {
      fileInputRef.current?.setAttribute('accept', Object.values(allowedFileTypes).flat().join(','));
      fileInputRef.current?.click();
    }
  };

  // Hidden file input change handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      handleAttach(files, e as unknown as DropEvent);
    }
    // Reset so the same file can be selected again
    e.target.value = '';
  };

  // Classify staged files by type for rendering (MIME type with extension fallback)
  const classifyFile = (file: File): 'audio' | 'image' | 'video' | 'text' => {
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    // PDFs treated as images for vision models (first-page extraction)
    if (file.type === 'application/pdf' && supportsImageInput) return 'image';
    // Fallback to extension when MIME type is empty or generic
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (['mp3', 'wav', 'flac', 'ogg', 'webm', 'aac', 'm4a', 'opus'].includes(ext)) return 'audio';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
    if (['mp4', 'mov', 'avi'].includes(ext)) return 'video';
    if (ext === 'pdf' && supportsImageInput) return 'image';
    return 'text';
  };

  // Render inline media for chat messages (audio players, image thumbnails)
  const renderMediaContent = (media?: { type: string; name: string; url: string }[]) => {
    if (!media || media.length === 0) return undefined;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
        {media.map((m, i) => {
          if (m.type === 'audio') {
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--pf-t--global--background--color--secondary--default)', border: '1px solid var(--pf-t--global--border--color--default)', maxWidth: '300px' }}>
                <VolumeUpIcon style={{ fontSize: '1.5rem', color: 'var(--pf-t--global--icon--color--regular)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--pf-t--global--text--color--subtle)' }}>Audio file attached for transcription</div>
                </div>
              </div>
            );
          }
          if (m.type === 'image') {
            // PDF files: show document preview with extraction label
            if (m.name.toLowerCase().endsWith('.pdf')) {
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--pf-t--global--background--color--secondary--default)', border: '1px solid var(--pf-t--global--border--color--default)' }}>
                  <FileIcon style={{ fontSize: '1.5rem', color: 'var(--pf-t--global--icon--color--regular)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{m.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--pf-t--global--text--color--subtle)' }}>First page extracted as image for vision analysis</div>
                  </div>
                </div>
              );
            }
            return (
              <img key={i} src={m.url} alt={m.name} style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }} />
            );
          }
          if (m.type === 'video') {
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--pf-t--global--background--color--secondary--default)', border: '1px solid var(--pf-t--global--border--color--default)', maxWidth: '300px' }}>
                <FilmIcon style={{ fontSize: '1.5rem', color: 'var(--pf-t--global--icon--color--regular)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--pf-t--global--text--color--subtle)' }}>Video file attached for analysis</div>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };


  // Simulated ASR transcript for audio file uploads
  const asrTranscript = `Good morning everyone. Thank you for joining today's call. I wanted to give a quick update on the deployment timeline.

We're targeting the end of this sprint for the initial rollout. The backend changes are complete and have passed QA. The frontend integration is about 80% done — we still need to wire up the error handling for the new endpoints.

One thing to flag: we discovered that the model serving runtime needs a configuration update to support the new audio format. The team is looking into whether this can be a hot config change or if it requires a restart. I'll follow up on that by end of day.

Any questions? ... OK, let's move on to the next item.`;

  // Render modality labels for model selector detail row (gated by enableMultimodalCapabilities)
  const renderModalityLabels = (caps: ModalityCapabilities) => {
    if (!flags.enableMultimodalCapabilities) return null;
    const hasImage = caps.inputModalities.includes('image');
    const hasAudio = caps.inputModalities.includes('audio');
    const hasAudioOut = caps.outputModalities.includes('audio');
    const hasImageOut = caps.outputModalities.includes('image');
    const labels: React.ReactNode[] = [];
    if (hasImage) labels.push(<Label key="vision" color="blue" isCompact>Image in</Label>);
    if (hasAudio) labels.push(<Label key="audio-in" color="purple" isCompact>Audio in</Label>);
    if (hasAudioOut) labels.push(<Label key="audio-out" color="teal" isCompact>Audio out</Label>);
    if (hasImageOut) labels.push(<Label key="image-out" color="orange" isCompact>Image out</Label>);
    return labels.length > 0 ? (
      <Flex spaceItems={{ default: 'spaceItemsXs' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginTop: '4px' }}>
        {labels.map((l, i) => <FlexItem key={i}>{l}</FlexItem>)}
      </Flex>
    ) : null;
  };
  const [isLoadPromptModalOpen, setIsLoadPromptModalOpen] = useState(false);
  const [isSavePromptModalOpen, setIsSavePromptModalOpen] = useState(false);
  const [isCreateVersionModalOpen, setIsCreateVersionModalOpen] = useState(false);
  const [loadedPrompt, setLoadedPrompt] = useState<{
    prompt: Prompt;
    version: PromptVersion;
    mode: 'load' | 'template';
  } | null>(null);
  const [promptEditDraft, setPromptEditDraft] = useState<{
    text: string;
    originalText: string;
  } | null>(null);
  const [showDefaultPromptHeader, setShowDefaultPromptHeader] = useState(false);
  const [showDefaultPromptHeaderSkeleton, setShowDefaultPromptHeaderSkeleton] = useState(false);
  const [isDefaultPromptSlideDownAnimating, setIsDefaultPromptSlideDownAnimating] = useState(false);
  const [defaultPromptTypedChars, setDefaultPromptTypedChars] = useState(0);
  const defaultPromptHeaderTimerRef = React.useRef<number | null>(null);
  
  // Build panel toggle state — honour ?tab= URL param on mount
  const [selectedBuildTab, setSelectedBuildTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const validTabs = ['model', 'prompt-lab', 'knowledge', 'mcp', 'guardrails'];
    return tab && validTabs.includes(tab) ? tab : 'model';
  });
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  // Navigation drawer states
  const [isSavedConfigsOpen, setIsSavedConfigsOpen] = useState(false);
  const [isSamplePromptsOpen, setIsSamplePromptsOpen] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  
  // Knowledge tab state
  const [knowledgeSource, setKnowledgeSource] = useState<'upload' | 'vectorstore'>('upload');
  const [knowledgeSource2, setKnowledgeSource2] = useState<'upload' | 'vectorstore'>('upload');
  const [isAddVectorStoreModalOpen, setIsAddVectorStoreModalOpen] = useState(false);
  const [editingVectorStore, setEditingVectorStore] = useState<any>(null);
  const [vectorStoreToRemove, setVectorStoreToRemove] = useState<any>(null);

  // Header kebab menu state
  const [isKebabMenuOpen, setIsKebabMenuOpen] = useState(false);

  // Model parameters state
  const [temperature, setTemperature] = useState(0.6);
  const [isStreaming, setIsStreaming] = useState(true);


  // Knowledge collections state (replaces old vectorStores)
  interface PlaygroundCollection {
    id: string;
    collectionName: string;
    description?: string;
    vectorStoreName: string;
    provider: string;
    embeddingModel: string;
    isInline: boolean;
  }

  const [knowledgeCollections, setKnowledgeCollections] = useState<PlaygroundCollection[]>([
    {
      id: 'vs-1',
      collectionName: 'product-catalog-search',
      description: 'Product catalog embeddings for e-commerce search and recommendations.',
      vectorStoreName: 'product-catalog-search',
      provider: 'PGVector',
      embeddingModel: 'Granite Embedding 125M',
      isInline: false,
    },
    {
      id: 'vs-2',
      collectionName: 'support-ticket-embeddings',
      description: 'Historical support tickets for customer-facing RAG assistant.',
      vectorStoreName: 'support-ticket-embeddings',
      provider: 'Milvus',
      embeddingModel: 'Nomic Embed Text v1.5',
      isInline: false,
    },
  ]);

  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedCollectionId2, setSelectedCollectionId2] = useState<string | null>(null);

  // Guard against stale collection selections — if the selected collection no longer exists
  // in the list (e.g., removed by admin), fall back to the first available collection.
  // Also auto-select the first collection when no prior selection exists.
  useEffect(() => {
    if (selectedCollectionId && !knowledgeCollections.some(c => c.id === selectedCollectionId)) {
      setSelectedCollectionId(knowledgeCollections.length > 0 ? knowledgeCollections[0].id : null);
    } else if (!selectedCollectionId && knowledgeCollections.length > 0) {
      setSelectedCollectionId(knowledgeCollections[0].id);
    }
    if (selectedCollectionId2 && !knowledgeCollections.some(c => c.id === selectedCollectionId2)) {
      setSelectedCollectionId2(knowledgeCollections.length > 0 ? knowledgeCollections[0].id : null);
    } else if (!selectedCollectionId2 && knowledgeCollections.length > 0) {
      setSelectedCollectionId2(knowledgeCollections[0].id);
    }
  }, [knowledgeCollections, selectedCollectionId, selectedCollectionId2]);

  // Inline RAG file upload state
  interface UploadedFile {
    id: string;
    name: string;
    size: number;
    progress: number;
    status: 'uploading' | 'complete' | 'error';
  }
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploadedFilesExpanded, setIsUploadedFilesExpanded] = useState(true);
  const [isKnowledgeUploadHorizontal] = useState(true);
  const [mcpServers, setMcpServers] = useState([
    { id: '1', name: 'Github', enabled: false, toolsCount: 0, totalTools: 12, hasAuth: false, connected: false },
    { id: '2', name: 'Kubernetes', enabled: false, toolsCount: 0, totalTools: 21, hasAuth: false, connected: false },
    { id: '3', name: 'Slack', enabled: false, toolsCount: 0, totalTools: 15, hasAuth: false, connected: false },
    { id: '4', name: 'Jira', enabled: false, toolsCount: 0, totalTools: 8, hasAuth: false, connected: false },
    { id: '5', name: 'PostgreSQL', enabled: false, toolsCount: 0, totalTools: 10, hasAuth: false, connected: false },
  ]);

  // MCP connection state management
  const [connectingMcpId, setConnectingMcpId] = useState<string | null>(null);
  const [isMcpConnectionModalOpen, setIsMcpConnectionModalOpen] = useState(false);
  const [isMcpToolsModalOpen, setIsMcpToolsModalOpen] = useState(false);
  const [selectedMcpServer, setSelectedMcpServer] = useState<any>(null);
  const [mcpToolSelections, setMcpToolSelections] = useState<Record<string, boolean>>({});
  const [mcpToolsSearchValue, setMcpToolsSearchValue] = useState('');
  const [mcpToolsPage, setMcpToolsPage] = useState(1);
  const mcpToolsPerPage = 10;

  // Compare mode state
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [isCompareConfirmModalOpen, setIsCompareConfirmModalOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [activeSettingsPanel, setActiveSettingsPanel] = useState<1 | 2 | null>(null);
  // View code modal state
  const [isViewCodeModalOpen, setIsViewCodeModalOpen] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [codeCopied2, setCodeCopied2] = useState(false);

  // Panel 1 compare mode dropdown state (separate from settings panel dropdown)
  const [isCompareModel1Open, setIsCompareModel1Open] = useState(false);

  // Panel 2 state (for compare mode)
  const [chatHistory2, setChatHistory2] = useState<any[]>([]);
  const [selectedModel2, setSelectedModel2] = useState('gpt-oss-20b');
  const [isCompareModel2Open, setIsCompareModel2Open] = useState(false);
  const [temperature2, setTemperature2] = useState(0.6);
  const [isStreaming2, setIsStreaming2] = useState(true);
  const [reasoningLevel2, setReasoningLevel2] = useState('default');
  const [systemPrompt2, setSystemPrompt2] = useState('');
  const [isModelSelectOpen2, setIsModelSelectOpen2] = useState(false);
  const [isReasoningLevelOpen2, setIsReasoningLevelOpen2] = useState(false);

  // Panel 2 prompt state (for compare mode)
  const [originalPrompt2, setOriginalPrompt2] = useState(DEFAULT_SYSTEM_PROMPT);
  const [isSystemPromptReadOnly2, setIsSystemPromptReadOnly2] = useState(false);
  const [isPromptEdited2, setIsPromptEdited2] = useState(false);
  const [loadedPrompt2, setLoadedPrompt2] = useState<{
    prompt: Prompt;
    version: PromptVersion;
    mode: 'load' | 'template';
  } | null>(null);
  const [promptEditDraft2, setPromptEditDraft2] = useState<{
    text: string;
    originalText: string;
  } | null>(null);
  const [showDefaultPromptHeader2, setShowDefaultPromptHeader2] = useState(false);
  const [showDefaultPromptHeaderSkeleton2, setShowDefaultPromptHeaderSkeleton2] = useState(false);
  const [defaultPromptTypedChars2, setDefaultPromptTypedChars2] = useState(0);
  const [chatPromptAlert2, setChatPromptAlert2] = useState(false);

  // Gear spin animation state
  // Check if panel 2 model has reasoning capability
  const hasReasoning2 = modelsWithReasoning.includes(selectedModel2);

  // Track which message metrics are expanded (by message id)
  const [expandedMetrics, setExpandedMetrics] = useState<Record<string, boolean>>({});

  // Cumulative metrics for compare panels (time and TTFT are averaged, tokens are summed)
  const [panel1Metrics, setPanel1Metrics] = useState({ avgTime: 0, totalTokens: 0, avgTtft: 0, responseCount: 0 });
  const [panel2Metrics, setPanel2Metrics] = useState({ avgTime: 0, totalTokens: 0, avgTtft: 0, responseCount: 0 });

  // Cumulative metrics for single chat mode
  const [singleChatMetrics, setSingleChatMetrics] = useState({ avgTime: 0, totalTokens: 0, avgTtft: 0, responseCount: 0 });

  // Thinking state for single chat mode
  const [isSingleChatThinking, setIsSingleChatThinking] = useState(false);
  const [singleChatThinkingMessage, setSingleChatThinkingMessage] = useState('');

  // Model dropdown open state for single chat header
  const [isSingleChatModelOpen, setIsSingleChatModelOpen] = useState(false);

  // Thinking state for animated messages
  const [isPanel1Thinking, setIsPanel1Thinking] = useState(false);
  const [isPanel2Thinking, setIsPanel2Thinking] = useState(false);
  const [panel1ThinkingMessage, setPanel1ThinkingMessage] = useState('');
  const [panel2ThinkingMessage, setPanel2ThinkingMessage] = useState('');
  const [thinkingDots, setThinkingDots] = useState('');

  // Witty thinking messages
  const thinkingMessages = [
    "Consulting the digital oracle",
    "Teaching electrons to dance",
    "Rummaging through the knowledge vault",
    "Warming up the neural pathways",
    "Channeling artificial wisdom",
    "Performing computational gymnastics",
    "Asking the silicon spirits",
    "Brewing a fresh batch of tokens",
    "Polishing the response crystals",
    "Summoning the algorithm elves"
  ];

  // Animate the thinking dots
  React.useEffect(() => {
    if (isPanel1Thinking || isPanel2Thinking || isSingleChatThinking) {
      const interval = setInterval(() => {
        setThinkingDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 400);
      return () => clearInterval(interval);
    }
    setThinkingDots('');
    return undefined;
  }, [isPanel1Thinking, isPanel2Thinking, isSingleChatThinking]);

  // Clear masthead slot (no layout dropdown in single mode)
  React.useEffect(() => {
    if (!playgroundMasthead) return;
    if (!isCompareMode) {
      playgroundMasthead.setMastheadSlot(null);
    }
    return () => {
      playgroundMasthead.setMastheadSlot(null);
    };
  }, [isCompareMode, playgroundMasthead]);


  // Derive selected collection for View Code
  const activeCollection = knowledgeCollections.find(c => c.id === selectedCollectionId) || null;
  const viewCodeVectorStoreName = activeCollection?.vectorStoreName || 'default_vector_store';
  const viewCodeProviderId = activeCollection?.provider?.toLowerCase() || 'milvus';
  const viewCodeEmbeddingModel = activeCollection?.embeddingModel || 'all-minilm:l6-v2';

  // Llama Stack code snippet for View Code modal
  const llamaStackCodeSnippet = `# Llama Stack Quickstart Script
#
# README:
# This example shows how to configure an assistant using the Llama Stack client.
# Before using this code, make sure of the following:
#
# 1. Required Packages:
#    - Install the required dependencies using pip:
#      pip install llama-stack-client
#    - NOTE: Verify the correct llama-stack-client version for your Llama Stack server instance,
#      then install that version as needed.
#
# 2. Llama Stack Server:
#    - Your Llama Stack instance must be running and accessible
#    - Set the LLAMA_STACK_URL variable to the base URL of your Llama Stack server
#
# 3. Model Configuration:
#    - The selected model (e.g., "llama3.2:3b") must be available in your Llama Stack deployment.
#
# 4. Tools (MCP Integration):
#    - Any tools used must be properly pre-configured in your Llama Stack setup.

# Configuration adjust as needed:
LLAMA_STACK_URL = ""  # ← USER MUST SET: URL to their Llama Stack server
FILES_BASE_PATH = ""  # ← USER MUST SET: Path to uploaded files (if any)

# USER CONTEXT - Generated from playground state:
input_text = "How do I deploy a model in OpenShift AI?"  # ← USER'S PROMPT
model_name = "meta-llama/Meta-Llama-3.1-8B-Instruct"     # ← SELECTED MODEL
vector_store_name = "${viewCodeVectorStoreName}"                # ← VECTOR STORE (if RAG enabled)
temperature = 0.7                                         # ← MODEL PARAMETER
stream_enabled = True                                     # ← STREAMING SETTING
system_instructions = """You are a helpful AI assistant specialized in OpenShift AI and model deployment."""  # ← SYSTEM PROMPT

# Files uploaded by the user (if any):
files_to_upload = [
    { "file": "deployment-guide.pdf", "purpose": "assistants" },  # ← UPLOADED FILES
    { "file": "architecture.md", "purpose": "assistants" },
]

import os

from llama_stack_client import LlamaStackClient

client = LlamaStackClient(base_url=LLAMA_STACK_URL)

# Create vector store (only if RAG is enabled)
vector_store = client.vector_stores.create(
    name=vector_store_name,
    extra_body={
        "provider_id": "${viewCodeProviderId}",           # ← VECTOR DB PROVIDER
        "embedding_model": "${viewCodeEmbeddingModel}",  # ← EMBEDDING MODEL
        "embedding_dimension": 384         # ← EMBEDDING DIMENSION
    }
)

# Tools configuration (if RAG or MCP servers are enabled)
tools = [
    # RAG file_search tool (if files uploaded and RAG enabled)
    {
      "type": "file_search",
      "vector_store_ids": [
        vector_store.id
      ]
    },
    # MCP servers (if user selected any)
    {
      "type": "mcp",
      "server_label": "slack-mcp",                      # ← MCP SERVER LABEL
      "server_url": "http://127.0.0.1:13080/sse",       # ← MCP SERVER URL
      "authorization": "Bearer sk-xxxxxxxxxxxxx",        # ← AUTH TOKEN
      "allowed_tools": [                                 # ← SELECTED TOOLS (optional)
        "send_message",
        "get_channel_history"
      ]
    },
    {
      "type": "mcp",
      "server_label": "github-mcp",
      "server_url": "https://github-mcp.example.com/sse",
      "authorization": "token ghp_xxxxxxxxxxxxx"
      # No allowed_tools = all tools allowed
    },
]

# Upload files to vector store (if files were uploaded)
for file_info in files_to_upload:
    with open(os.path.join(FILES_BASE_PATH, file_info["file"]), 'rb') as file:
        uploaded_file = client.files.create(file=file, purpose=file_info["purpose"])
        client.vector_stores.files.create(
            vector_store_id=vector_store.id,
            file_id=uploaded_file.id
        )

# Final configuration sent to Llama Stack
config = {
    "input": input_text,
    "model": model_name,
    "temperature": temperature,
    "instructions": system_instructions,
    "stream": stream_enabled,
    "tools": tools
}

response = client.responses.create(**config)

print("agent>", response.output_text)`;

  // Copy code to clipboard handler
  const handleCopyCode = (code: string, panelNumber?: number) => {
    const markdownCode = '```python\n' + code + '\n```';
    navigator.clipboard.writeText(markdownCode).then(() => {
      if (panelNumber === 2) {
        setCodeCopied2(true);
        setTimeout(() => setCodeCopied2(false), 2000);
      } else {
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      }
    });
  };

  // Kubernetes MCP tools data
  const kubernetesMcpTools = [
    { name: 'configuration_view', description: 'Get the current Kubernetes configuration content as a kubeconfig YAML' },
    { name: 'events_list', description: 'List all the Kubernetes events in the current cluster from all namespaces' },
    { name: 'helm_install', description: 'Install a Helm chart in the current or provided namespace' },
    { name: 'helm_list', description: 'List all the Helm releases in the current or provided namespace (or in all namespaces if specified)' },
    { name: 'helm_uninstall', description: 'Uninstall a Helm release in the current or provided namespace' },
    { name: 'namespace_create', description: 'Create the Kubernetes namespace in the current cluster' },
    { name: 'namespace_delete', description: 'Delete the Kubernetes namespace in the current cluster' },
    { name: 'namespaces_list', description: 'List all the Kubernetes namespaces in the current cluster' },
    { name: 'pods_delete', description: 'Delete a Kubernetes Pod in the current or provided namespace with the provided name' },
    { name: 'pods_exec', description: 'Execute a command in a Kubernetes Pod in the current or provided namespace with the provided name and command' },
    { name: 'pods_list', description: 'List all the Kubernetes Pods in the current or provided namespace' },
    { name: 'pods_log', description: 'Get the logs of a Kubernetes Pod in the current or provided namespace with the provided name' },
    { name: 'pods_run', description: 'Run a new Kubernetes Pod in the current or provided namespace' },
    { name: 'resources_create_or_update', description: 'Create or update a Kubernetes resource from a YAML or JSON definition' },
    { name: 'resources_delete', description: 'Delete a Kubernetes resource by kind, name and optional namespace' },
    { name: 'resources_get', description: 'Get a Kubernetes resource by kind, name and optional namespace' },
    { name: 'resources_list', description: 'List Kubernetes resources by kind and optional namespace' },
    { name: 'services_create', description: 'Create a new Kubernetes Service in the current or provided namespace' },
    { name: 'services_delete', description: 'Delete a Kubernetes Service in the current or provided namespace' },
    { name: 'services_list', description: 'List all the Kubernetes Services in the current or provided namespace' },
    { name: 'cluster_info', description: 'Get basic information about the current Kubernetes cluster' },
  ];

  // MCP checkbox change handler
  const handleMcpCheckboxChange = (serverId: string, checked: boolean) => {
    const server = mcpServers.find(s => s.id === serverId);

    if (checked) {
      // Check if server was already authorized before
      if (server?.hasAuth) {
        // Already authorized - immediately re-enable without auth flow
        setMcpServers(servers => servers.map(s =>
          s.id === serverId ? { ...s, enabled: true, connected: true, toolsCount: s.totalTools } : s
        ));
      } else {
        // First time - start connecting animation
        setConnectingMcpId(serverId);

        // After 2 seconds, complete connection
        setTimeout(() => {
          setConnectingMcpId(null);
          setMcpServers(servers => servers.map(s =>
            s.id === serverId ? { ...s, enabled: true, connected: true, hasAuth: true, toolsCount: s.totalTools } : s
          ));
          // Set the selected server and open connection modal
          const updatedServer = { ...server, enabled: true, connected: true, hasAuth: true, toolsCount: server?.totalTools || 0 };
          setSelectedMcpServer(updatedServer);
          setIsMcpConnectionModalOpen(true);
          // Initialize all tools as selected
          if (server?.name === 'Kubernetes') {
            const initialSelections: Record<string, boolean> = {};
            kubernetesMcpTools.forEach(tool => {
              initialSelections[tool.name] = true;
            });
            setMcpToolSelections(initialSelections);
          }
        }, 2000);
      }
    } else {
      // Disable but keep hasAuth so re-enabling is instant
      setMcpServers(servers => servers.map(s =>
        s.id === serverId ? { ...s, enabled: false, connected: false, toolsCount: 0 } : s
      ));
    }
  };

  // Handle lock icon click
  const handleLockClick = (server: any) => {
    setSelectedMcpServer(server);
    setIsMcpConnectionModalOpen(true);
  };

  // Handle tools count click
  const handleToolsClick = (server: any) => {
    setSelectedMcpServer(server);
    if (server.name === 'Kubernetes' && Object.keys(mcpToolSelections).length === 0) {
      const initialSelections: Record<string, boolean> = {};
      kubernetesMcpTools.forEach(tool => {
        initialSelections[tool.name] = true;
      });
      setMcpToolSelections(initialSelections);
    }
    setMcpToolsPage(1);
    setMcpToolsSearchValue('');
    setIsMcpToolsModalOpen(true);
  };

  // Handle MCP disconnect
  const handleMcpDisconnect = (serverId: string) => {
    setMcpServers(servers => servers.map(s =>
      s.id === serverId ? { ...s, enabled: false, connected: false, hasAuth: false, toolsCount: 0 } : s
    ));
    setIsMcpConnectionModalOpen(false);
    setSelectedMcpServer(null);
  };

  // Handle save tools selection
  const handleSaveMcpTools = () => {
    const selectedCount = Object.values(mcpToolSelections).filter(Boolean).length;
    if (selectedMcpServer) {
      setMcpServers(servers => servers.map(s =>
        s.id === selectedMcpServer.id ? { ...s, toolsCount: selectedCount } : s
      ));
    }
    setIsMcpToolsModalOpen(false);
  };

  // File upload handlers for inline RAG
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const simulateFileUpload = (file: File) => {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
    };

    setUploadedFiles(prev => [...prev, newFile]);

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadedFiles(prev =>
          prev.map(f => f.id === fileId ? { ...f, progress: 100, status: 'complete' } : f)
        );
      } else {
        setUploadedFiles(prev =>
          prev.map(f => f.id === fileId ? { ...f, progress: Math.min(progress, 99) } : f)
        );
      }
    }, 300);
  };

  const isKnowledgeUploadFileSupported = (file: File) => (
    file.type === 'application/pdf' ||
    file.type === 'application/msword' ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.type === 'text/csv' ||
    file.name.endsWith('.pdf') ||
    file.name.endsWith('.doc') ||
    file.name.endsWith('.docx') ||
    file.name.endsWith('.csv')
  );

  const handleKnowledgeFileDrop = (_event: unknown, droppedFiles: File[]) => {
    const fileArray = droppedFiles.slice(0, 10 - uploadedFiles.length);
    fileArray.forEach((file) => {
      if (isKnowledgeUploadFileSupported(file)) {
        simulateFileUpload(file);
      }
    });
  };

  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleRemoveFile = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file) {
      setFileToDelete({ id: file.id, name: file.name });
    }
  };

  const confirmDeleteFile = () => {
    if (fileToDelete) {
      setUploadedFiles(prev => prev.filter(f => f.id !== fileToDelete.id));
      setFileToDelete(null);
    }
  };

  // Get filtered and paginated tools
  const getFilteredTools = () => {
    let tools = kubernetesMcpTools;
    if (mcpToolsSearchValue) {
      tools = tools.filter(tool =>
        tool.name.toLowerCase().includes(mcpToolsSearchValue.toLowerCase()) ||
        tool.description.toLowerCase().includes(mcpToolsSearchValue.toLowerCase())
      );
    }
    return tools;
  };

  const getPaginatedTools = () => {
    const filtered = getFilteredTools();
    const startIndex = (mcpToolsPage - 1) * mcpToolsPerPage;
    return filtered.slice(startIndex, startIndex + mcpToolsPerPage);
  };

  // Count enabled MCP servers and total enabled tools
  const enabledMcpCount = mcpServers.filter(s => s.enabled).length;
  const totalEnabledMcpTools = mcpServers.filter(s => s.enabled).reduce((sum, s) => sum + s.toolsCount, 0);

  // Handle start compare mode
  const handleStartCompare = () => {
    setChatHistory([]);
    setChatHistory2([]);
    setIsCompareConfirmModalOpen(false);
    setIsCompareMode(true);
    // Preserve panel state: if open in single chat, keep it open in compare mode (default to Chat 1)
    if (isPanelExpanded) {
      setActiveSettingsPanel(1);
    }
    // Reset cumulative metrics
    setPanel1Metrics({ avgTime: 0, totalTokens: 0, avgTtft: 0, responseCount: 0 });
    setPanel2Metrics({ avgTime: 0, totalTokens: 0, avgTtft: 0, responseCount: 0 });
    // Copy current prompt state to panel 2
    setSystemPrompt2(systemPrompt);
    setOriginalPrompt2(originalPrompt);
    setIsSystemPromptReadOnly2(isSystemPromptReadOnly);
    setIsPromptEdited2(isPromptEdited);
    // Copy current knowledge settings to panel 2
    setIsRagEnabled2(isRagEnabled);
    setKnowledgeSource2(knowledgeSource);
    setSelectedCollectionId2(selectedCollectionId);
    setLoadedPrompt2(loadedPrompt ? { ...loadedPrompt } : null);
    setPromptEditDraft2(promptEditDraft ? { ...promptEditDraft } : null);
    setShowDefaultPromptHeader2(showDefaultPromptHeader);
    setShowDefaultPromptHeaderSkeleton2(showDefaultPromptHeaderSkeleton);
    setDefaultPromptTypedChars2(defaultPromptTypedChars);
    setChatPromptAlert2(chatPromptAlert);
  };

  // Handle exit compare mode
  const [isCloseCompareModalOpen, setIsCloseCompareModalOpen] = useState(false);
  const [closingChatNumber, setClosingChatNumber] = useState<1 | 2>(1);

  const handleExitCompareClick = (chatNumber: 1 | 2) => {
    setClosingChatNumber(chatNumber);
    setIsCloseCompareModalOpen(true);
  };

  const handleConfirmExitCompare = () => {
    setIsCompareMode(false);
    setChatHistory2([]);
    setActiveSettingsPanel(null);
    setIsCloseCompareModalOpen(false);
  };

  // Handle new chat - clears chat history for both single and compare modes
  const handleNewChat = () => {
    setChatHistory([]);
    setShowWelcomePrompts(true);
    if (isCompareMode) {
      setChatHistory2([]);
      setPanel1Metrics({ avgTime: 0, totalTokens: 0, avgTtft: 0, responseCount: 0 });
      setPanel2Metrics({ avgTime: 0, totalTokens: 0, avgTtft: 0, responseCount: 0 });
    } else {
      setSingleChatMetrics({ avgTime: 0, totalTokens: 0, avgTtft: 0, responseCount: 0 });
    }
    setIsNewChatModalOpen(false);
  };

  const handleBuildTabSelect = (tabIndex: string | number) => {
    const nextTab = String(tabIndex);
    const ps = getActivePromptState();

    // Preserve in-progress prompt edits while navigating to other tabs.
    if (selectedBuildTab === 'prompt-lab' && nextTab !== 'prompt-lab' && !(isCompareMode && activeSettingsPanel === 2 ? isSystemPromptReadOnly2 : isSystemPromptReadOnly)) {
      ps.setPromptEditDraft({
        text: ps.systemPrompt,
        originalText: ps.originalPrompt,
      });
    }

    // Restore edit session when returning to Prompt tab.
    const currentDraft = isCompareMode && activeSettingsPanel === 2 ? promptEditDraft2 : promptEditDraft;
    if (nextTab === 'prompt-lab' && currentDraft) {
      ps.setSystemPrompt(currentDraft.text);
      ps.setOriginalPrompt(currentDraft.originalText);
      ps.setIsSystemPromptReadOnly(false);
      ps.setIsPromptEdited(currentDraft.text !== currentDraft.originalText);
    }

    setSelectedBuildTab(nextTab);
  };

  // Helper to resolve active panel's prompt state (for modal callbacks that run outside the IIFE)
  const getActivePromptState = () => {
    const p2 = isCompareMode && activeSettingsPanel === 2;
    return {
      systemPrompt: p2 ? systemPrompt2 : systemPrompt,
      setSystemPrompt: p2 ? setSystemPrompt2 : setSystemPrompt,
      originalPrompt: p2 ? originalPrompt2 : originalPrompt,
      setOriginalPrompt: p2 ? setOriginalPrompt2 : setOriginalPrompt,
      setIsSystemPromptReadOnly: p2 ? setIsSystemPromptReadOnly2 : setIsSystemPromptReadOnly,
      setIsPromptEdited: p2 ? setIsPromptEdited2 : setIsPromptEdited,
      loadedPrompt: p2 ? loadedPrompt2 : loadedPrompt,
      setLoadedPrompt: p2 ? setLoadedPrompt2 : setLoadedPrompt,
      setPromptEditDraft: p2 ? setPromptEditDraft2 : setPromptEditDraft,
      setShowDefaultPromptHeader: p2 ? setShowDefaultPromptHeader2 : setShowDefaultPromptHeader,
      setShowDefaultPromptHeaderSkeleton: p2 ? setShowDefaultPromptHeaderSkeleton2 : setShowDefaultPromptHeaderSkeleton,
      setDefaultPromptTypedChars: p2 ? setDefaultPromptTypedChars2 : setDefaultPromptTypedChars,
      setChatPromptAlert: p2 ? setChatPromptAlert2 : setChatPromptAlert,
    };
  };

  const getDefaultPromptName = () => {
    const { loadedPrompt: lp } = getActivePromptState();
    if (lp?.prompt.name) {
      return lp.prompt.name;
    }
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    return `${month}/${day}/${year} ${hour}:${minute}`;
  };

  const triggerDefaultPromptEditAnimation = () => {
    if (loadedPrompt || isSystemPromptReadOnly || showDefaultPromptHeader || showDefaultPromptHeaderSkeleton) {
      return;
    }

    setShowDefaultPromptHeaderSkeleton(true);
    setIsDefaultPromptSlideDownAnimating(true);
    requestAnimationFrame(() => {
      setIsDefaultPromptSlideDownAnimating(false);
    });

    if (defaultPromptHeaderTimerRef.current) {
      window.clearTimeout(defaultPromptHeaderTimerRef.current);
    }
    defaultPromptHeaderTimerRef.current = window.setTimeout(() => {
      setShowDefaultPromptHeaderSkeleton(false);
      setShowDefaultPromptHeader(true);
      setDefaultPromptTypedChars(0);
    }, 2000);
  };

  // Guardrails state
  const [_guardrailsEnabled, _setGuardrailsEnabled] = useState(false);
  const [selectedGuardrailModel, setSelectedGuardrailModel] = useState('granite-guardian');
  const [isGuardrailModelSelectOpen, setIsGuardrailModelSelectOpen] = useState(false);
  const [userInputGuardrailsEnabled, setUserInputGuardrailsEnabled] = useState(true);
  const [modelOutputGuardrailsEnabled, setModelOutputGuardrailsEnabled] = useState(true);
  
  // Chat state
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [showWelcomePrompts, setShowWelcomePrompts] = useState(true);
  const welcomePrompts = [
    {
      title: 'Data extraction',
      message: 'Extract key fields and entities from this input.',
    },
    {
      title: 'Code structure',
      message: "Explain this code's structure and responsibilities.",
    },
  ];
  
  // Save configuration modal state
  const [isSaveConfigModalOpen, setIsSaveConfigModalOpen] = useState(false);
  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');

  React.useEffect(() => () => {
    if (defaultPromptHeaderTimerRef.current) {
      window.clearTimeout(defaultPromptHeaderTimerRef.current);
    }
  }, []);
  
  


  const _hasPromptChanges = systemPrompt !== originalPrompt;

  // Toast alerts state
  const [toastAlerts, setToastAlerts] = useState<React.ReactElement[]>([]);

  // Modal states for alerts
  const [isEditOlderVersionModalOpen, setIsEditOlderVersionModalOpen] = useState(false);
  const [isLoadWhileEditingModalOpen, setIsLoadWhileEditingModalOpen] = useState(false);

  // Chat prompt inline alert
  const [chatPromptAlert, setChatPromptAlert] = useState(false);

  // Reusable confirmation modal state (A9, A10)
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    body: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  const removeToastAlert = (alertKey: React.Key) => {
    setToastAlerts((prev) => prev.filter((a) => a.key !== alertKey));
  };

  const addToast = (variant: AlertVariant, title: string, description?: string) => {
    const alertKey = `prompt-toast-${Date.now()}`;
    const newAlert = (
      <Alert
        id={`prompt-toast-${alertKey}`}
        variant={variant}
        title={title}
        timeout
        actionClose={<AlertActionCloseButton onClose={() => removeToastAlert(alertKey)} />}
        onTimeout={() => removeToastAlert(alertKey)}
        key={alertKey}
      >
        {description}
      </Alert>
    );
    setToastAlerts((prev) => [newAlert, ...prev]);
  };

  // A1: Unsaved-changes navigation guard (beforeunload)
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isPromptEdited && !isSystemPromptReadOnly) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isPromptEdited, isSystemPromptReadOnly]);

  // Load collections from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('playgroundCollections');
      if (stored) {
        const parsed = JSON.parse(stored) as PlaygroundCollection[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setKnowledgeCollections(prev => {
            // Merge: keep inline items, add stored external items that aren't already present
            const existingIds = new Set(prev.map(c => c.id));
            const newItems = parsed.filter(c => !existingIds.has(c.id));
            return [...prev, ...newItems];
          });
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // A1+: In-app navigation guard (pushState override)
  useEffect(() => {
    const originalPushState = window.history.pushState.bind(window.history);
    window.history.pushState = function (data: any, unused: string, url?: string | URL | null) {
      if (isPromptEdited && !isSystemPromptReadOnly) {
        const confirmed = window.confirm(
          'You have unsaved changes to your prompt. If you leave now, your edits will be lost.\n\nTo keep your work, click Cancel, then save your prompt.',
        );
        if (!confirmed) return;
      }
      originalPushState(data, unused, url);
    };
    return () => { window.history.pushState = originalPushState; };
  }, [isPromptEdited, isSystemPromptReadOnly]);

  const handleConfigClose = () => setIsPanelExpanded(false);

  // Shared config panel content (header, tabs, body) - used in both Drawer and center layout
  const renderConfigPanelInner = (configProps?: { panel?: 1 | 2; onClose?: () => void }) => {
    const panel = configProps?.panel ?? activeSettingsPanel ?? 1;
    const onClose = configProps?.onClose ?? handleConfigClose;
    const isPanel2 = panel === 2;
    return (
    <>
      {/* Configure Header */}
      <div
        className={`pf-v6-u-display-flex pf-v6-u-align-items-center pf-v6-u-justify-content-space-between pf-v6-u-px-md pf-v6-u-py-sm pf-v6-u-border-bottom pf-v6-u-background-color-100${isCompareMode && panel ? ' playground-compare-config-header-toggle' : ''}`}
        style={{ flexShrink: 0 }}
      >
        {isCompareMode && panel ? (
          <div className="playground-compare-config-toggle-wrapper" style={{ flex: 1, minWidth: 0, display: 'flex', marginRight: '8px' }}>
            <ToggleGroup aria-label="Chat configuration selector" id="compare-chat-config-toggle" isCompact>
              <ToggleGroupItem
                text="Chat 1"
                buttonId="compare-chat-1-toggle"
                isSelected={panel === 1}
                onChange={() => { setActiveSettingsPanel(1); setIsPanelExpanded(true); }}
                aria-label="Configure Chat 1"
              />
              <ToggleGroupItem
                text="Chat 2"
                buttonId="compare-chat-2-toggle"
                isSelected={panel === 2}
                onChange={() => { setActiveSettingsPanel(2); setIsPanelExpanded(true); }}
                aria-label="Configure Chat 2"
              />
            </ToggleGroup>
          </div>
        ) : (
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
            <Title headingLevel="h2" size="xl">
              {isCompareMode && panel ? `Chat ${panel}` : 'Configure'}
            </Title>
        </Flex>
        )}
        {isCompareMode && panel ? (
          <div className="playground-compare-config-close-wrapper" style={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch' }}>
            <Button
              variant="plain"
              onClick={onClose}
              aria-label="Close settings panel"
              id="close-configure-panel-button"
            >
              <TimesIcon />
            </Button>
          </div>
        ) : (
        <Button
          variant="plain"
          onClick={onClose}
          aria-label="Close settings panel"
          id="close-configure-panel-button"
        >
          <TimesIcon />
        </Button>
        )}
      </div>

      {/* Tabs Row */}
      <div
        className="pf-v6-u-display-flex pf-v6-u-align-items-center pf-v6-u-border-bottom pf-v6-u-background-color-100"
        style={{ flexShrink: 0 }}
      >
        <Tabs
          activeKey={selectedBuildTab}
          onSelect={(_event, tabIndex) => handleBuildTabSelect(tabIndex as string)}
          id="build-panel-tabs"
          className="pf-v6-u-flex-grow-1"
        >
          <Tab eventKey="model" title={<TabTitleText>Model</TabTitleText>} />
          <Tab eventKey="prompt-lab" title={<TabTitleText>Prompt</TabTitleText>} />
          <Tab
            eventKey="knowledge"
            title={
              <TabTitleText>
                <span className="pf-v6-u-display-inline-flex pf-v6-u-align-items-center" style={{ gap: '0.5rem' }}>
                  Knowledge
                  {(() => {
                    const currentSelectedId = isCompareMode && activeSettingsPanel === 2 ? selectedCollectionId2 : selectedCollectionId;
                    return currentSelectedId ? <Badge isRead>1</Badge> : null;
                  })()}
                </span>
              </TabTitleText>
            }
          />
          <Tab
            eventKey="mcp"
            title={
              <TabTitleText>
                <span className="pf-v6-u-display-inline-flex pf-v6-u-align-items-center pf-v6-u-gap-sm">
                  MCP
                  {enabledMcpCount > 0 && (
                    <Badge isRead>{enabledMcpCount}</Badge>
                  )}
                </span>
              </TabTitleText>
            }
          />
          <Tab
            eventKey="guardrails"
            title={<TabTitleText>Guardrails</TabTitleText>}
          />
        </Tabs>
      </div>

      {/* Tab Content */}
      <div id="configure-panel-content" className="pf-v6-u-p-md" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          {selectedBuildTab === 'model' && (
            (() => {
              const currentModel = isPanel2 ? selectedModel2 : selectedModel;
              const setCurrentModel = isPanel2 ? setSelectedModel2 : setSelectedModel;
              const currentModelSelectOpen = isPanel2 ? isModelSelectOpen2 : isModelSelectOpen;
              const setCurrentModelSelectOpen = isPanel2 ? setIsModelSelectOpen2 : setIsModelSelectOpen;
              const currentHasReasoning = isPanel2 ? hasReasoning2 : hasReasoning;
              const currentReasoningLevel = isPanel2 ? reasoningLevel2 : reasoningLevel;
              const setCurrentReasoningLevel = isPanel2 ? setReasoningLevel2 : setReasoningLevel;
              const currentReasoningLevelOpen = isPanel2 ? isReasoningLevelOpen2 : isReasoningLevelOpen;
              const setCurrentReasoningLevelOpen = isPanel2 ? setIsReasoningLevelOpen2 : setIsReasoningLevelOpen;
              const currentTemperature = isPanel2 ? temperature2 : temperature;
              const setCurrentTemperature = isPanel2 ? setTemperature2 : setTemperature;
              const currentStreaming = isPanel2 ? isStreaming2 : isStreaming;
              const setCurrentStreaming = isPanel2 ? setIsStreaming2 : setIsStreaming;

              return (
            <>
              <Title headingLevel="h3" size="md" className="pf-v6-u-mb-md">
                {isCompareMode ? `Model ${panel} Settings` : 'Model'}
              </Title>

              <FormGroup fieldId="model-select-form" label="Model">
                <Select
                  id="model-select"
                  isOpen={currentModelSelectOpen}
                  selected={currentModel}
                  onSelect={(_event, value) => {
                    handleModelSwitch(value as string, currentModel, setCurrentModel);
                    setCurrentModelSelectOpen(false);
                  }}
                  onOpenChange={(isOpen) => setCurrentModelSelectOpen(isOpen)}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setCurrentModelSelectOpen(!currentModelSelectOpen)}
                      isExpanded={currentModelSelectOpen}
                      id="model-select-toggle"
                      className="pf-v6-u-w-100"
                    >
                      <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                        <FlexItem>
                          {currentModel === '' ? 'Choose a model' :
                           currentModel === 'gpt-oss-20b' ? 'gpt-oss-20b' :
                           currentModel === 'gpt-oss-120b' ? 'gpt-oss-120b' :
                           currentModel === 'qwen3-14b' ? 'Qwen3-14B' :
                           currentModel === 'llama-3.2-11b' ? 'llama-3.2-11b' :
                           currentModel === 'granite-4.0-h-small' ? 'granite-4.0-h-small' :
                           currentModel === 'ministral-3-8b' ? 'Ministral-3-8B' : 'Choose a model'}
                        </FlexItem>
                        {flags.showReasoningLevel && currentHasReasoning && (
                          <FlexItem><Label color="green" isCompact>Reasoning</Label></FlexItem>
                        )}
                      </Flex>
                    </MenuToggle>
                  )}
                >
                  <SelectList>
                    {Object.entries(modelCapabilities).map(([modelId, caps]) => {
                      const displayName = modelId === 'qwen3-14b' ? 'Qwen3-14B' : modelId === 'ministral-3-8b' ? 'Ministral-3-8B' : modelId;
                      const isReasoning = modelsWithReasoning.includes(modelId);

                      return (
                        <SelectOption key={modelId} value={modelId}>
                          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                            <FlexItem>{displayName}</FlexItem>
                            {flags.showReasoningLevel && isReasoning && <FlexItem><Label color="green" isCompact>Reasoning</Label></FlexItem>}
                          </Flex>
                          {modelId !== currentModel && renderModalityLabels(caps)}
                        </SelectOption>
                      );
                    })}
                  </SelectList>
                </Select>
              </FormGroup>

              {/* Capability summary bar — shown when model supports multimodal and flag is on */}
              {flags.enableMultimodalCapabilities && currentModel && (() => {
                const caps = modelCapabilities[currentModel];
                if (!caps) return null;
                const abilities: string[] = ['Text'];
                if (caps.inputModalities.includes('image')) abilities.push('Image input');
                if (caps.inputModalities.includes('audio')) abilities.push('Audio input');
                if (caps.outputModalities.includes('audio')) abilities.push('Audio output');
                if (caps.outputModalities.includes('image')) abilities.push('Image generation');
                if (abilities.length <= 1) return null;
                return (
                  <div className="pf-v6-u-mt-sm pf-v6-u-p-sm" style={{ background: 'var(--pf-t--global--background--color--secondary--default)', borderRadius: 'var(--pf-t--global--border--radius--small)', fontSize: '0.85rem' }}>
                    <strong>Capabilities:</strong> {abilities.join(' · ')}
                  </div>
                );
              })()}

              <FormGroup
                label="Subscription"
                fieldId="subscription-select-form"
                className="pf-v6-u-mt-md"
                labelHelp={
                  <Popover
                    headerContent="Subscription"
                    bodyContent="Select the subscription to use for this model. Subscriptions control access and rate limits for model endpoints."
                  >
                    <FormGroupLabelHelp aria-label="More info for subscription field" aria-describedby="subscription-select-form" />
                  </Popover>
                }
              >
                <Select
                  id="subscription-select"
                  isOpen={isSubscriptionSelectOpen}
                  selected={selectedSubscription}
                  onSelect={(_event, value) => {
                    setSelectedSubscription(value as string);
                    setIsSubscriptionSelectOpen(false);
                  }}
                  onOpenChange={setIsSubscriptionSelectOpen}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setIsSubscriptionSelectOpen(!isSubscriptionSelectOpen)}
                      isExpanded={isSubscriptionSelectOpen}
                      id="subscription-select-toggle"
                      className="pf-v6-u-w-100"
                    >
                      {activeSubscriptions.find(s => s.id === selectedSubscription)?.displayName || 'Choose a subscription'}
                    </MenuToggle>
                  )}
                >
                  <SelectList id="subscription-select-list">
                    {activeSubscriptions.map(sub => (
                      <SelectOption
                        key={sub.id}
                        value={sub.id}
                        id={`subscription-option-${sub.id}`}
                        description={`Priority: ${sub.priority} · ${sub.modelRefs.length} model${sub.modelRefs.length !== 1 ? 's' : ''}`}
                      >
                        {sub.displayName}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
              </FormGroup>

              {/* Reasoning Level dropdown - only shown for models with reasoning */}
              {flags.showReasoningLevel && currentHasReasoning && (
                <FormGroup
                  label="Reasoning level"
                  fieldId="reasoning-level-select"
                  className="pf-v6-u-mt-md"
                  labelHelp={
                    <Popover
                      headerContent="Reasoning level"
                      bodyContent="Controls inference time scaling - how long a model thinks before responding. Requires a reasoning-capable model."
                    >
                      <FormGroupLabelHelp aria-label="More info for reasoning level field" aria-describedby="reasoning-level-select" />
                    </Popover>
                  }
                >
                  <Select
                    id="reasoning-level-select"
                    isOpen={currentReasoningLevelOpen}
                    selected={currentReasoningLevel}
                    onSelect={(_event, value) => {
                      setCurrentReasoningLevel(value as string);
                      setCurrentReasoningLevelOpen(false);
                    }}
                    onOpenChange={(isOpen) => setCurrentReasoningLevelOpen(isOpen)}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => setCurrentReasoningLevelOpen(!currentReasoningLevelOpen)}
                        isExpanded={currentReasoningLevelOpen}
                        id="reasoning-level-toggle"
                        className="pf-v6-u-w-100"
                      >
                        {currentReasoningLevel === 'default' ? 'Default' :
                         currentReasoningLevel === 'low' ? 'Low' :
                         currentReasoningLevel === 'medium' ? 'Medium' :
                         currentReasoningLevel === 'high' ? 'High' : 'Select level'}
                      </MenuToggle>
                    )}
                  >
                    <SelectList>
                      <SelectOption value="default">Default</SelectOption>
                      <SelectOption value="low">Low</SelectOption>
                      <SelectOption value="medium">Medium</SelectOption>
                      <SelectOption value="high">High</SelectOption>
                    </SelectList>
                  </Select>
                </FormGroup>
              )}

              <FormGroup
                label="Temperature"
                fieldId="temperature"
                className="pf-v6-u-mt-md"
                labelHelp={
                  <Popover
                    headerContent="Temperature"
                    bodyContent="Controls randomness in the output. Lower values make the output more focused and deterministic, while higher values increase creativity and diversity. Range: 0 - 2"
                  >
                    <FormGroupLabelHelp aria-label="More info for temperature field" aria-describedby="temperature" />
                  </Popover>
                }
              >
                <div className="slider-fixed-input">
                  <Slider
                    id="temperature"
                    value={currentTemperature}
                    onChange={(_event, value) => setCurrentTemperature(value)}
                    min={0}
                    max={2}
                    step={0.1}
                    isInputVisible
                    inputValue={currentTemperature}
                    showBoundaries={false}
                  />
                </div>
              </FormGroup>

              <Flex alignItems={{ default: 'alignItemsCenter' }} className="pf-v6-u-mt-md">
                <FlexItem>
                  <Switch
                    id="streaming-toggle"
                    label="Streaming"
                    isChecked={currentStreaming}
                    onChange={(_event, checked) => setCurrentStreaming(checked)}
                  />
                </FlexItem>
              </Flex>

            </>
              );
            })()
          )}
          
          {selectedBuildTab === 'prompt-lab' && (
            (() => {
              const currentSystemPrompt = isPanel2 ? systemPrompt2 : systemPrompt;
              const setCurrentSystemPrompt = isPanel2 ? setSystemPrompt2 : setSystemPrompt;
              const currentOriginalPrompt = isPanel2 ? originalPrompt2 : originalPrompt;
              const setCurrentOriginalPrompt = isPanel2 ? setOriginalPrompt2 : setOriginalPrompt;
              const currentIsSystemPromptReadOnly = isPanel2 ? isSystemPromptReadOnly2 : isSystemPromptReadOnly;
              const setCurrentIsSystemPromptReadOnly = isPanel2 ? setIsSystemPromptReadOnly2 : setIsSystemPromptReadOnly;
              const currentIsPromptEdited = isPanel2 ? isPromptEdited2 : isPromptEdited;
              const setCurrentIsPromptEdited = isPanel2 ? setIsPromptEdited2 : setIsPromptEdited;
              const currentLoadedPrompt = isPanel2 ? loadedPrompt2 : loadedPrompt;
              const setCurrentLoadedPrompt = isPanel2 ? setLoadedPrompt2 : setLoadedPrompt;
              const _currentPromptEditDraft = isPanel2 ? promptEditDraft2 : promptEditDraft;
              const setCurrentPromptEditDraft = isPanel2 ? setPromptEditDraft2 : setPromptEditDraft;
              const currentShowDefaultPromptHeader = isPanel2 ? showDefaultPromptHeader2 : showDefaultPromptHeader;
              const setCurrentShowDefaultPromptHeader = isPanel2 ? setShowDefaultPromptHeader2 : setShowDefaultPromptHeader;
              const currentShowDefaultPromptHeaderSkeleton = isPanel2 ? showDefaultPromptHeaderSkeleton2 : showDefaultPromptHeaderSkeleton;
              const setCurrentShowDefaultPromptHeaderSkeleton = isPanel2 ? setShowDefaultPromptHeaderSkeleton2 : setShowDefaultPromptHeaderSkeleton;
              const currentDefaultPromptTypedChars = isPanel2 ? defaultPromptTypedChars2 : defaultPromptTypedChars;
              const setCurrentDefaultPromptTypedChars = isPanel2 ? setDefaultPromptTypedChars2 : setDefaultPromptTypedChars;
              const currentChatPromptAlert = isPanel2 ? chatPromptAlert2 : chatPromptAlert;
              const setCurrentChatPromptAlert = isPanel2 ? setChatPromptAlert2 : setChatPromptAlert;
              const currentHasPromptChanges = currentSystemPrompt !== currentOriginalPrompt;

              return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              {/* Tab header row */}
              <Flex
                alignItems={{ default: 'alignItemsCenter' }}
                justifyContent={{ default: 'justifyContentSpaceBetween' }}
                spaceItems={{ default: 'spaceItemsSm' }}
                className="pf-v6-u-mb-md"
                style={{ flexShrink: 0 }}
              >
                <FlexItem>
                  <Title headingLevel="h3" size="md" style={{ fontWeight: 600 }}>
                    {isCompareMode ? `Prompt ${panel}` : 'Prompt'}
                  </Title>
                </FlexItem>
                <FlexItem>
                  <Button
                    variant="link"
                    icon={<PlusCircleIcon />}
                    onClick={() => {
                      if (currentIsPromptEdited && !currentIsSystemPromptReadOnly) {
                        setIsLoadWhileEditingModalOpen(true);
                      } else {
                        setIsLoadPromptModalOpen(true);
                      }
                    }}
                    id="load-prompt-button"
                  >
                    Load prompt
                  </Button>
                </FlexItem>
              </Flex>

              {/* Dashed-border prompt container */}
              <div
                id="prompt-container"
                style={{
                  border: '1px dashed var(--pf-v6-global--BorderColor--100)',
                  borderRadius: 'var(--pf-v6-global--BorderRadius--sm)',
                  padding: 'var(--pf-v6-global--spacer--md)',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minHeight: 0,
                  overflow: 'visible',
                }}
              >
                {/* Dynamic prompt header */}
                {(currentLoadedPrompt || currentIsPromptEdited || currentShowDefaultPromptHeader || currentShowDefaultPromptHeaderSkeleton) && (
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} className="pf-v6-u-mb-sm">
                    <FlexItem>
                      {currentShowDefaultPromptHeaderSkeleton && !currentLoadedPrompt ? (
                        <Spinner
                          size="md"
                          aria-label="Loading prompt header"
                          id="default-prompt-header-spinner"
                        />
                      ) : (
                        <span className="pf-v6-u-font-size-sm" style={{ fontWeight: 600 }}>
                          {currentLoadedPrompt ? currentLoadedPrompt.prompt.name : (() => {
                            const now = new Date();
                            const month = String(now.getMonth() + 1).padStart(2, '0');
                            const day = String(now.getDate()).padStart(2, '0');
                            const year = String(now.getFullYear()).slice(2);
                            const hour = String(now.getHours()).padStart(2, '0');
                            const minute = String(now.getMinutes()).padStart(2, '0');
                            return `${month}/${day}/${year} ${hour}:${minute} prompt`;
                          })()}
                        </span>
                      )}
                    </FlexItem>
                    {currentLoadedPrompt?.prompt.project === 'Global' && (
                      <FlexItem>
                        <Label isCompact color="purple">Sample</Label>
                      </FlexItem>
                    )}
                    {currentLoadedPrompt && currentLoadedPrompt.prompt.project !== 'Global' && (
                      <FlexItem>
                        <Label
                          isCompact
                          variant={!currentIsSystemPromptReadOnly ? 'filled' : 'outline'}
                          color={!currentIsSystemPromptReadOnly ? 'grey' : undefined}
                          style={!currentIsSystemPromptReadOnly ? { opacity: 0.6 } : undefined}
                        >
                          Version {currentLoadedPrompt.version.versionNumber}
                        </Label>
                      </FlexItem>
                    )}
                    {!currentIsSystemPromptReadOnly && currentHasPromptChanges && (
                      <FlexItem>
                        <span className="pf-v6-u-color-200 pf-v6-u-font-size-sm">Unsaved</span>
                      </FlexItem>
                    )}
                  </Flex>
                )}

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: 0,
                    transform: isDefaultPromptSlideDownAnimating ? 'translateY(-8px)' : 'translateY(0)',
                    opacity: isDefaultPromptSlideDownAnimating ? 0.85 : 1,
                    transition: `transform var(--pf-v6-global--TransitionDuration--default) var(--pf-v6-global--TimingFunction--default), opacity var(--pf-v6-global--TransitionDuration--default) var(--pf-v6-global--TimingFunction--default)`,
                  }}
                >
                  {/* A5: Chat prompt inline alert */}
                  {currentChatPromptAlert && (
                    <Alert
                      variant="info"
                      isInline
                      isPlain
                      title="System prompt loaded"
                      actionClose={<AlertActionCloseButton onClose={() => setCurrentChatPromptAlert(false)} />}
                      className="pf-v6-u-mb-sm"
                    >
                      This prompt was saved as a chat prompt. Only the system instruction is shown in the playground.
                    </Alert>
                  )}

                  {/* Instructions label with helper icon */}
                  <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapXs' }} className="pf-v6-u-mb-sm">
                    <FlexItem>
                      <span className="pf-v6-u-font-size-sm">Instructions</span>
                    </FlexItem>
                    <FlexItem>
                      <Popover
                        id="instructions-helper-popover"
                        aria-label="Instructions information"
                        headerContent="System instructions"
                        bodyContent="The instructions field is used as a system instruction when chatting with the model in the playground. It guides the model's behavior and response style."
                        position="auto"
                      >
                        <Button
                          variant="plain"
                          aria-label="More info for instructions"
                          icon={<OutlinedQuestionCircleIcon />}
                          id="instructions-helper-button"
                          style={{ padding: 0 }}
                        />
                      </Popover>
                    </FlexItem>
                  </Flex>

                  {/* Text area - fills available space */}
                  <div
                    className="prompt-textarea-fill"
                    style={{
                      margin: '0 var(--pf-v6-global--spacer--md) var(--pf-v6-global--spacer--md)',
                    }}
                    onDoubleClick={() => {
                      if (currentIsSystemPromptReadOnly && currentLoadedPrompt) {
                        const latest = currentLoadedPrompt.prompt.versions[currentLoadedPrompt.prompt.versions.length - 1];
                        const isLatest = currentLoadedPrompt.version.versionNumber === latest.versionNumber;
                        if (!isLatest) {
                          setIsEditOlderVersionModalOpen(true);
                          return;
                        }
                        setCurrentIsSystemPromptReadOnly(false);
                        setCurrentIsPromptEdited(false);
                        setCurrentPromptEditDraft({ text: currentSystemPrompt, originalText: currentOriginalPrompt });
                      }
                    }}
                  >
                    <TextArea
                      id="system-instructions"
                      value={currentSystemPrompt}
                      onChange={(_event, value) => {
                        setCurrentSystemPrompt(value);
                        if (!currentIsSystemPromptReadOnly) {
                          const promptChanged = value !== currentOriginalPrompt;
                          setCurrentIsPromptEdited(promptChanged);
                          setCurrentPromptEditDraft((existingDraft) => ({
                            text: value,
                            originalText: existingDraft?.originalText ?? currentOriginalPrompt,
                          }));

                          if (
                            !currentLoadedPrompt &&
                            !currentShowDefaultPromptHeader &&
                            !currentShowDefaultPromptHeaderSkeleton
                          ) {
                            const typedCharsIncrement = value.length >= currentSystemPrompt.length && value !== currentSystemPrompt
                              ? Math.max(1, value.length - currentSystemPrompt.length)
                              : 0;
                            const nextTypedChars = currentDefaultPromptTypedChars + typedCharsIncrement;
                            setCurrentDefaultPromptTypedChars(nextTypedChars);
                            if (nextTypedChars >= 2) {
                              triggerDefaultPromptEditAnimation();
                            }
                          }
                        }
                      }}
                      readOnlyVariant={currentIsSystemPromptReadOnly ? 'default' : undefined}
                      resizeOrientation="none"
                    />
                  </div>
                </div>

                {/* Footer actions */}
                <Flex className="pf-v6-u-mt-md" gap={{ default: 'gapSm' }}>
                  {currentIsSystemPromptReadOnly ? (
                    <>
                      <FlexItem>
                        <Button
                          variant="primary"
                          size="sm"
                          id="edit-prompt-button"
                          onClick={() => {
                            if (currentLoadedPrompt) {
                              const latest = currentLoadedPrompt.prompt.versions[currentLoadedPrompt.prompt.versions.length - 1];
                              const isLatest = currentLoadedPrompt.version.versionNumber === latest.versionNumber;
                              if (!isLatest) {
                                setIsEditOlderVersionModalOpen(true);
                                return;
                              }
                            }
                            setCurrentIsSystemPromptReadOnly(false);
                            setCurrentIsPromptEdited(false);
                            setCurrentPromptEditDraft({
                              text: currentSystemPrompt,
                              originalText: currentOriginalPrompt,
                            });
                          }}
                        >
                          Edit
                        </Button>
                      </FlexItem>
                      <FlexItem>
                        <Button
                          variant="link"
                          size="sm"
                          id="clear-prompt-button"
                          onClick={() => {
                            setCurrentSystemPrompt(DEFAULT_SYSTEM_PROMPT);
                            setCurrentOriginalPrompt(DEFAULT_SYSTEM_PROMPT);
                            setCurrentIsSystemPromptReadOnly(false);
                            setCurrentIsPromptEdited(false);
                            setCurrentPromptEditDraft(null);
                            setCurrentShowDefaultPromptHeader(false);
                            setCurrentShowDefaultPromptHeaderSkeleton(false);
                            setCurrentDefaultPromptTypedChars(0);
                            setCurrentLoadedPrompt(null);
                            setCurrentChatPromptAlert(false);
                          }}
                        >
                          Clear
                        </Button>
                      </FlexItem>
                    </>
                  ) : (
                    <>
                      <FlexItem>
                        <Button
                          variant="primary"
                          size="sm"
                          id="save-prompt-button"
                          onClick={() => {
                            if (currentLoadedPrompt && currentLoadedPrompt.prompt.project !== 'Global') {
                              setIsCreateVersionModalOpen(true);
                            } else {
                              setIsSavePromptModalOpen(true);
                            }
                          }}
                          isDisabled={!currentHasPromptChanges}
                        >
                          Save
                        </Button>
                      </FlexItem>
                      {currentLoadedPrompt && (
                        <FlexItem>
                          <Button
                            variant="link"
                            size="sm"
                            id="revert-prompt-button"
                            onClick={() => {
                              if (currentIsPromptEdited) {
                                setConfirmAction({
                                  title: 'Revert to saved version?',
                                  body: "Your current edits haven't been saved. Reverting will restore the last saved version of this prompt. To keep your changes, cancel and save first.",
                                  confirmLabel: 'Revert',
                                  onConfirm: () => {
                                    setCurrentSystemPrompt(currentOriginalPrompt);
                                    setCurrentIsPromptEdited(false);
                                    setCurrentPromptEditDraft(null);
                                    if (currentLoadedPrompt) {
                                      setCurrentIsSystemPromptReadOnly(currentLoadedPrompt.mode === 'load');
                                    }
                                  },
                                });
                                return;
                              }
                              setCurrentSystemPrompt(currentOriginalPrompt);
                              setCurrentIsPromptEdited(false);
                              setCurrentPromptEditDraft(null);
                              if (currentLoadedPrompt) {
                                setCurrentIsSystemPromptReadOnly(currentLoadedPrompt.mode === 'load');
                              }
                            }}
                          >
                            Revert
                          </Button>
                        </FlexItem>
                      )}
                      {!currentLoadedPrompt && currentHasPromptChanges && (
                        <FlexItem>
                          <Button
                            variant="link"
                            size="sm"
                            id="reset-default-prompt-button"
                            onClick={() => {
                              setConfirmAction({
                                title: 'Clear prompt?',
                                body: "Your current edits haven't been saved. Clearing will reset the prompt and your changes will be lost. To keep your changes, cancel and save first.",
                                confirmLabel: 'Clear',
                                onConfirm: () => {
                                  setCurrentSystemPrompt(DEFAULT_SYSTEM_PROMPT);
                                  setCurrentOriginalPrompt(DEFAULT_SYSTEM_PROMPT);
                                  setCurrentIsPromptEdited(false);
                                  setCurrentPromptEditDraft(null);
                                  setCurrentShowDefaultPromptHeader(false);
                                  setCurrentShowDefaultPromptHeaderSkeleton(false);
                                  setCurrentDefaultPromptTypedChars(0);
                                },
                              });
                            }}
                          >
                            Clear
                          </Button>
                        </FlexItem>
                      )}
                    </>
                  )}
                </Flex>
              </div>
            </div>
              );
            })()
          )}
          
          {selectedBuildTab === 'knowledge' && (
            (() => {
              const isPanel2 = isCompareMode && activeSettingsPanel === 2;
              const currentSelectedCollectionId = isPanel2 ? selectedCollectionId2 : selectedCollectionId;
              const setCurrentSelectedCollectionId = isPanel2 ? setSelectedCollectionId2 : setSelectedCollectionId;
              const currentKnowledgeSource = isPanel2 ? knowledgeSource2 : knowledgeSource;
              const setCurrentKnowledgeSource = isPanel2 ? setKnowledgeSource2 : setKnowledgeSource;
              const currentIsRagEnabled = isPanel2 ? isRagEnabled2 : isRagEnabled;
              const setCurrentIsRagEnabled = isPanel2 ? setIsRagEnabled2 : setIsRagEnabled;
              const currentIsVsDropdownOpen = isPanel2 ? isVsDropdownOpen2 : isVsDropdownOpen;
              const setCurrentIsVsDropdownOpen = isPanel2 ? setIsVsDropdownOpen2 : setIsVsDropdownOpen;
              const currentVsSearchValue = isPanel2 ? vsSearchValue2 : vsSearchValue;
              const setCurrentVsSearchValue = isPanel2 ? setVsSearchValue2 : setVsSearchValue;
              const filteredCollections = knowledgeCollections.filter(c => {
                if (!currentVsSearchValue) return true;
                const term = currentVsSearchValue.toLowerCase();
                return c.collectionName.toLowerCase().includes(term) || (c.description?.toLowerCase().includes(term) ?? false);
              });
              const selectedCollection = knowledgeCollections.find(c => c.id === currentSelectedCollectionId);

              return (
            <>
              <Flex
                alignItems={{ default: 'alignItemsCenter' }}
                justifyContent={{ default: 'justifyContentSpaceBetween' }}
                className="pf-v6-u-mb-sm"
              >
                <FlexItem>
                  <Title headingLevel="h3" size="md" style={{ fontWeight: 600 }}>
                    Knowledge
                  </Title>
                </FlexItem>
                <FlexItem>
                  <Switch
                    id="knowledge-tab-enable-switch"
                    isChecked={currentIsRagEnabled}
                    onChange={(_event, checked) => {
                      setCurrentIsRagEnabled(checked);
                      if (checked && currentKnowledgeSource === 'vectorstore'
                          && knowledgeCollections.length > 0 && !currentSelectedCollectionId) {
                        setCurrentSelectedCollectionId(knowledgeCollections[0].id);
                      }
                    }}
                    aria-label="Enable knowledge retrieval via RAG and external vector stores"
                  />
                </FlexItem>
              </Flex>

              <div style={{ marginTop: '1rem', ...(!currentIsRagEnabled ? { opacity: 0.6, pointerEvents: 'none' } : {}) }}>
                {/* Upload documents radio + inline content */}
                <div style={{ marginBottom: '1rem' }}>
                  <Radio
                    id={`knowledge-source-upload${isPanel2 ? '-2' : ''}`}
                    name={`knowledge-source${isPanel2 ? '-2' : ''}`}
                    label={
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        Use uploaded documents
                        <Popover bodyContent="Upload and use your own files as grounding knowledge. Files are chunked, embedded, and stored in a playground-local database." id="knowledge-upload-popover">
                          <Button variant="plain" style={{ padding: 0, lineHeight: 1 }} aria-label="More info about uploaded documents" id="knowledge-upload-help-button">
                            <OutlinedQuestionCircleIcon style={{ color: 'var(--pf-t--global--icon--color--subtle)' }} />
                          </Button>
                        </Popover>
                      </span>
                    }
                    isChecked={currentKnowledgeSource === 'upload'}
                    onChange={() => setCurrentKnowledgeSource('upload')}
                    isDisabled={!currentIsRagEnabled}
                  />

                  <div style={{
                    display: 'grid',
                    gridTemplateRows: currentKnowledgeSource === 'upload' ? '1fr' : '0fr',
                    opacity: currentKnowledgeSource === 'upload' ? 1 : 0,
                    transition: 'grid-template-rows 250ms ease-out, opacity 200ms ease-out',
                    marginLeft: '1.75rem',
                  }}>
                    <div style={{ overflow: 'hidden', marginTop: '0.75rem' }}>
                      <MultipleFileUpload
                        id="knowledge-multi-file-upload"
                        className="pf-v6-u-mb-md"
                        isHorizontal={isKnowledgeUploadHorizontal}
                        onFileDrop={handleKnowledgeFileDrop}
                        dropzoneProps={{
                          accept: {
                            'application/pdf': ['.pdf'],
                            'application/msword': ['.doc'],
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                            'text/csv': ['.csv'],
                          },
                        }}
                      >
                        <MultipleFileUploadMain
                          titleIcon={<FolderOpenIcon />}
                          titleText="Drag and drop or upload files"
                          infoText="Upload up to 10 PDF, DOC, or CSV files. Maximum size 10 MB per file."
                          browseButtonText="Upload"
                        />
                      </MultipleFileUpload>

                      {uploadedFiles.length > 0 ? (
                        <div>
                          <Button
                            variant="plain"
                            onClick={() => setIsUploadedFilesExpanded(!isUploadedFilesExpanded)}
                            style={{ padding: '0.25rem 0', marginBottom: '0.5rem' }}
                            id="uploaded-files-toggle"
                          >
                            <AngleRightIcon style={{
                              transform: isUploadedFilesExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease'
                            }} />
                            <span style={{ marginLeft: '0.5rem', fontSize: 'var(--pf-t--global--font--size--sm)' }}>
                              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
                            </span>
                          </Button>

                          {isUploadedFilesExpanded && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {uploadedFiles.map((file) => (
                                <div
                                  key={file.id}
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                    padding: '0.5rem 0'
                                  }}
                                >
                                  <Flex alignItems={{ default: 'alignItemsFlexStart' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                                    <FlexItem style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                                      <FileIcon style={{ color: 'var(--pf-v6-global--Color--200)', flexShrink: 0, marginTop: '2px' }} />
                                      <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{
                                          fontSize: '0.875rem',
                                          wordBreak: 'break-word',
                                          lineHeight: '1.4'
                                        }}>
                                          {file.name}
                                        </div>
                                        <div style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.5rem',
                                          marginTop: '0.25rem'
                                        }}>
                                          <span style={{ fontSize: '0.875rem', color: 'var(--pf-v6-global--Color--200)' }}>
                                            {formatFileSize(file.size)}
                                          </span>
                                          {file.status === 'complete' && (
                                            <>
                                              <span style={{ fontSize: '0.875rem', color: 'var(--pf-v6-global--Color--200)' }}>
                                                100%
                                              </span>
                                              <CheckCircleIcon style={{ color: 'var(--pf-v6-global--success-color--100)', fontSize: '0.875rem' }} />
                                            </>
                                          )}
                                          {file.status === 'uploading' && (
                                            <span style={{ fontSize: '0.875rem', color: 'var(--pf-v6-global--Color--200)' }}>
                                              {Math.round(file.progress)}%
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </FlexItem>
                                    <FlexItem>
                                      <Button
                                        variant="plain"
                                        aria-label={`Remove ${file.name}`}
                                        onClick={() => handleRemoveFile(file.id)}
                                        style={{ padding: '0' }}
                                      >
                                        <TimesIcon />
                                      </Button>
                                    </FlexItem>
                                  </Flex>
                                  {file.status !== 'complete' && (
                                    <Progress
                                      value={file.progress}
                                      size={ProgressSize.sm}
                                      aria-label={`Upload progress for ${file.name}`}
                                      style={{ marginTop: '0.25rem' }}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p style={{ color: 'var(--pf-t--global--text--color--subtle)', margin: 0 }}>
                          No documents uploaded yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Use a vector store radio + inline content */}
                <div>
                  <Radio
                    id={`knowledge-source-vectorstore${isPanel2 ? '-2' : ''}`}
                    name={`knowledge-source${isPanel2 ? '-2' : ''}`}
                    label={
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        Use an existing vector store:
                        <Popover bodyContent="Connect to a registered external vector store collection to provide the model with custom knowledge and context." id="knowledge-vectorstore-popover">
                          <Button variant="plain" style={{ padding: 0, lineHeight: 1 }} aria-label="More info about vector stores" id="knowledge-vectorstore-help-button">
                            <OutlinedQuestionCircleIcon style={{ color: 'var(--pf-t--global--icon--color--subtle)' }} />
                          </Button>
                        </Popover>
                      </span>
                    }
                    isChecked={currentKnowledgeSource === 'vectorstore'}
                    onChange={() => {
                      setCurrentKnowledgeSource('vectorstore');
                      if (knowledgeCollections.length > 0 && !currentSelectedCollectionId) {
                        setCurrentSelectedCollectionId(knowledgeCollections[0].id);
                      }
                    }}
                    isDisabled={!currentIsRagEnabled}
                  />

                  <div style={{
                    display: 'grid',
                    gridTemplateRows: currentKnowledgeSource === 'vectorstore' ? '1fr' : '0fr',
                    opacity: currentKnowledgeSource === 'vectorstore' ? 1 : 0,
                    transition: 'grid-template-rows 250ms ease-out, opacity 200ms ease-out',
                    marginLeft: '1.75rem',
                  }}>
                    <div style={{ overflow: 'hidden', marginTop: '0.75rem' }}>
                      {knowledgeCollections.length > 0 ? (
                        <Select
                          id={`knowledge-collection-select${isPanel2 ? '-2' : ''}`}
                          isOpen={currentIsVsDropdownOpen}
                          selected={currentSelectedCollectionId}
                          onSelect={(_event, value) => {
                            setCurrentSelectedCollectionId(value as string);
                            setCurrentIsVsDropdownOpen(false);
                            setCurrentVsSearchValue('');
                          }}
                          onOpenChange={(isOpen) => {
                            setCurrentIsVsDropdownOpen(isOpen);
                            if (!isOpen) setCurrentVsSearchValue('');
                          }}
                          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                            <MenuToggle
                              ref={toggleRef}
                              onClick={() => setCurrentIsVsDropdownOpen(!currentIsVsDropdownOpen)}
                              isExpanded={currentIsVsDropdownOpen}
                              isDisabled={!currentIsRagEnabled}
                              id={`knowledge-collection-toggle${isPanel2 ? '-2' : ''}`}
                              className="pf-v6-u-w-100"
                            >
                              {selectedCollection?.collectionName || ''}
                            </MenuToggle>
                          )}
                        >
                          <div style={{ padding: '0.5rem' }}>
                            <SearchInput
                              placeholder="Search collections..."
                              value={currentVsSearchValue}
                              onChange={(_event, value) => setCurrentVsSearchValue(value)}
                              onClear={() => setCurrentVsSearchValue('')}
                              id={`knowledge-collection-search${isPanel2 ? '-2' : ''}`}
                            />
                          </div>
                          <SelectList>
                            {filteredCollections.map((collection) => (
                              <SelectOption
                                key={collection.id}
                                value={collection.id}
                                isSelected={currentSelectedCollectionId === collection.id}
                                id={`collection-option-${collection.id}`}
                              >
                                <div>
                                  <span style={{ fontWeight: 600 }}>{collection.collectionName}</span>
                                  {collection.description && (
                                    <span style={{
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      color: 'var(--pf-t--global--text--color--subtle)',
                                      fontSize: 'var(--pf-t--global--font--size--sm)',
                                      marginTop: '0.125rem',
                                    }}>
                                      {collection.description}
                                    </span>
                                  )}
                                </div>
                              </SelectOption>
                            ))}
                            {filteredCollections.length === 0 && (
                              <SelectOption isDisabled>No matching collections</SelectOption>
                            )}
                          </SelectList>
                        </Select>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                          <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentCenter' }} gap={{ default: 'gapSm' }}>
                            <FlexItem>
                              <CubesIcon style={{ fontSize: '1.5rem', color: 'var(--pf-t--global--icon--color--subtle)' }} />
                            </FlexItem>
                            <FlexItem>
                              <Title headingLevel="h4" size="lg">No collections configured</Title>
                            </FlexItem>
                          </Flex>
                          <p style={{ color: 'var(--pf-t--global--text--color--subtle)', marginTop: '0.5rem' }}>
                            To use a vector store, go to AI asset endpoints and add a collection to the playground.
                          </p>
                          <Button
                            variant="link"
                            component="a"
                            href="/gen-ai-studio/asset-endpoints"
                            style={{ marginTop: '0.5rem' }}
                          >
                            Go to AI asset endpoints
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
              );
            })()
          )}

          {selectedBuildTab === 'mcp' && (
            <div>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }} style={{ marginBottom: '1rem' }}>
                <FlexItem>
                  <Title headingLevel="h3" size="md">MCP Servers</Title>
                </FlexItem>
                <FlexItem>
                  <Label variant="outline" color="blue">{totalEnabledMcpTools} tools enabled</Label>
                </FlexItem>
              </Flex>

              <Table variant="compact" aria-label="MCP Servers" id="mcp-servers-table">
                <Thead>
                  <Tr>
                    <Th width={10}></Th>
                    <Th>Name</Th>
                    <Th>Tools</Th>
                    <Th width={10}>Authorization</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {mcpServers.map((server) => (
                    <Tr key={server.id}>
                      <Td>
                        <Checkbox
                          id={`mcp-${server.id}`}
                          isChecked={server.enabled}
                          isDisabled={connectingMcpId === server.id}
                          onChange={(_event, checked) => handleMcpCheckboxChange(server.id, checked)}
                          aria-label={`Enable ${server.name}`}
                        />
                      </Td>
                      <Td>{server.name}</Td>
                      <Td>
                        <Label
                          variant="outline"
                          onClick={server.connected ? () => handleToolsClick(server) : undefined}
                          style={{ cursor: server.connected ? 'pointer' : 'default' }}
                        >
                          {server.toolsCount} active
                        </Label>
                      </Td>
                      <Td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '36px' }}>
                          {connectingMcpId === server.id ? (
                            <Spinner size="md" aria-label="Connecting..." />
                          ) : server.hasAuth ? (
                            <Button
                              variant="plain"
                              onClick={() => handleLockClick(server)}
                              aria-label="View connection"
                              style={{ padding: 0 }}
                            >
                              <LockOpenIcon style={{ color: '#3E8635' }} />
                            </Button>
                          ) : (
                            <LockIcon style={{ color: '#6A6E73' }} />
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>
          )}
          
          {selectedBuildTab === 'guardrails' && (
            flags.guardrailUnavailableInCluster ? (
              <EmptyState 
                icon={() => <CogIcon style={{ fontSize: '4rem', color: 'var(--pf-t--global--text--color--subtle)' }} />} 
                id="guardrails-empty-state"
              >
                <EmptyStateBody>
                  <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Guardrails not enabled
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                    Guardrails are not enabled for this cluster. To request access to guardrails, contact your administrator.
                  </div>
                </EmptyStateBody>
              </EmptyState>
            ) : (
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
                {/* Guardrails Header */}
                <FlexItem>
                  <Title headingLevel="h3" size="md">
                    Guardrails
                  </Title>
                </FlexItem>

                {/* Model Dropdown */}
                <FlexItem>
                  <div className="pf-v6-c-form__group">
                    <label className="pf-v6-c-form__label" htmlFor="guardrails-model-select">
                      <span className="pf-v6-c-form__label-text" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Guardrail model
                        <Popover
                          bodyContent="This is the model that enforces the guardrails."
                          triggerAction="hover"
                          id="guardrail-model-popover"
                        >
                          <OutlinedQuestionCircleIcon style={{ fontSize: '14px', color: 'var(--pf-v6-global--icon-Color--subtle)', cursor: 'pointer' }} />
                        </Popover>
                      </span>
                    </label>
                    <div style={{ marginTop: 'var(--pf-v6-global--spacer--xs)' }}>
                      <Select
                        id="guardrails-model-select"
                        isOpen={isGuardrailModelSelectOpen}
                        selected={selectedGuardrailModel}
                        onSelect={(_event, value) => {
                          setSelectedGuardrailModel(value as string);
                          setIsGuardrailModelSelectOpen(false);
                        }}
                        onOpenChange={(isOpen) => setIsGuardrailModelSelectOpen(isOpen)}
                        toggle={(toggleRef) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setIsGuardrailModelSelectOpen(!isGuardrailModelSelectOpen)}
                            isExpanded={isGuardrailModelSelectOpen}
                            id="guardrails-model-select-toggle"
                            style={{ width: '100%', maxWidth: '350px' }}
                          >
                            {selectedGuardrailModel === 'granite-guardian' ? 'Granite Guardian' :
                             selectedGuardrailModel === 'llama-guard' ? 'Llama Guard' :
                             selectedGuardrailModel === 'llama-3.2-11b' ? 'Llama 3.2 11B' :
                             selectedGuardrailModel === 'qwen-3.2-14b' ? 'Qwen 3.2 14B' :
                             selectedGuardrailModel === 'gpt-oss-120b' ? 'GPT OSS 120B' : 'Select model'}
                          </MenuToggle>
                        )}
                      >
                        <SelectList>
                          <SelectOption value="granite-guardian">Granite Guardian</SelectOption>
                          <SelectOption value="llama-guard">Llama Guard</SelectOption>
                          <SelectOption value="llama-3.2-11b">Llama 3.2 11B</SelectOption>
                          <SelectOption value="qwen-3.2-14b">Qwen 3.2 14B</SelectOption>
                          <SelectOption value="gpt-oss-120b">GPT OSS 120B</SelectOption>
                        </SelectList>
                      </Select>
                    </div>
                  </div>
                </FlexItem>

                {/* User Input Guardrails */}
                <FlexItem>
                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>
                      <Switch
                        id="guardrails-user-input"
                        label="User input guardrails"
                        isChecked={userInputGuardrailsEnabled}
                        onChange={(_event, checked) => setUserInputGuardrailsEnabled(checked)}
                        aria-label="Enable user input guardrails"
                      />
                    </FlexItem>
                    <FlexItem style={{ marginLeft: 0 }}>
                      <Content>
                        <small style={{ fontSize: '12px', lineHeight: '18px', fontWeight: 400, color: 'var(--pf-t--global--text--color--subtle)' }}>
                          Prevents the model from processing user inputs that contain jailbreak attempts; prompt attacks; personal information; and potentially harmful topics including hate speech, criminal activity, sexual content, and violence and harassment.
                        </small>
                      </Content>
                    </FlexItem>
                  </Flex>
                </FlexItem>

                {/* Model Output Guardrails */}
                <FlexItem>
                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>
                      <Switch
                        id="guardrails-model-output"
                        label="Model output guardrails"
                        isChecked={modelOutputGuardrailsEnabled}
                        onChange={(_event, checked) => setModelOutputGuardrailsEnabled(checked)}
                        aria-label="Enable model output guardrails"
                      />
                    </FlexItem>
                    <FlexItem style={{ marginLeft: 0 }}>
                      <Content>
                        <small style={{ fontSize: '12px', lineHeight: '18px', fontWeight: 400, color: 'var(--pf-t--global--text--color--subtle)' }}>
                          Prevents the model from generating responses that contain personal information and potentially harmful topics including hate speech, criminal activity, sexual content, and violence and harassment.
                        </small>
                      </Content>
                    </FlexItem>
                  </Flex>
                </FlexItem>
              </Flex>
            )
          )}
      </div>
    </>
  );
  };

  // Build Panel for Drawer - wraps config panel in DrawerPanelContent (no padding so blue header extends edge-to-edge)
  const BuildPanelContent = (
    <DrawerPanelContent minSize="440px" defaultSize="440px" id="build-panel-drawer" style={{ padding: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {renderConfigPanelInner()}
      </div>
    </DrawerPanelContent>
  );

  // Retry handler for retriable errors
  const handleRetry = (originalMessage: string) => {
    setChatHistory(prev => prev.slice(0, -1));
    setRetryCount(prev => prev + 1);
    setIsSingleChatThinking(true);
    setSingleChatThinkingMessage(thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)]);

    setTimeout(() => {
      const time = (Math.random() * 30 + 20).toFixed(2);
      const tokens = Math.floor(Math.random() * 200 + 150);
      const ttft = Math.floor(Math.random() * 150 + 100);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: 'This is a simulated response after retry.',
        name: 'Bot',
        avatar: `data:image/svg+xml,${encodeURIComponent(ChatbotIcon)}`,
        timestamp: new Date().toLocaleTimeString(),
        metrics: { time: `${time} s`, tokens, ttft: `${ttft}ms` },
      };
      setChatHistory(prev => [...prev, botMsg]);
      setIsSingleChatThinking(false);
      setRetryCount(0);
    }, 2000);
  };

  // Helper to render message with expandable metrics
  const renderMessageWithMetrics = (msg: any) => {
    // Strip custom properties that shouldn't be passed to DOM via <Message> spread
    const { media, generatingMedia, ...messageProps } = msg;

    // Build extraContent for user messages with media (audio players, image thumbnails)
    const userMediaContent = msg.role === 'user' && media ? renderMediaContent(media) : undefined;

    const extraContent: any = {};
    if (userMediaContent) extraContent.beforeMainContent = userMediaContent;
    const hasExtraContent = Object.keys(extraContent).length > 0;

    // Full failure: expandable danger alert, collapsed by default
    if (msg.role === 'bot' && msg.classifiedError && msg.classifiedError.pattern === 'full-failure') {
      const err = msg.classifiedError as ClassifiedError;
      return (
        <div key={msg.id}>
          <Message
            role="bot"
            avatar={msg.avatar}
            name={msg.name}
            error={{
              title: err.title,
              variant: 'danger',
              isInline: true,
              isExpandable: true,
              actionLinks: err.isRetriable ? (
                <RetryButton onRetry={() => handleRetry(msg.originalMessage)} retryCount={retryCount} />
              ) : undefined,
              children: <ErrorBody classifiedError={err} />,
            }}
          />
        </div>
      );
    }

    // Partial failure: expandable warning alert, collapsed by default
    if (msg.role === 'bot' && msg.classifiedError && msg.classifiedError.pattern === 'partial-failure') {
      const err = msg.classifiedError as ClassifiedError;
      return (
        <div key={msg.id}>
          <Message
            role="bot"
            avatar={msg.avatar}
            name={msg.name}
            content={msg.content}
            extraContent={{
              beforeMainContent: (
                <Alert variant="warning" title={err.title} isInline isExpandable
                  actionLinks={err.isRetriable ? (
                    <RetryButton onRetry={() => handleRetry(msg.originalMessage)} retryCount={retryCount} />
                  ) : undefined}
                >
                  <ErrorBody classifiedError={err} />
                </Alert>
              ),
            }}
          />
          {msg.metrics && (
            <div style={{ marginLeft: '3.5rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
              <ExpandableSection
                toggleText={expandedMetrics[msg.id] ? 'Hide metrics' : 'Show metrics'}
                onToggle={() => setExpandedMetrics(prev => ({ ...prev, [msg.id]: !expandedMetrics[msg.id] }))}
                isExpanded={expandedMetrics[msg.id] || false}
                isIndented
              >
                <Flex spaceItems={{ default: 'spaceItemsSm' }} style={{ marginTop: '0.5rem' }}>
                  <Label isCompact variant="outline">{msg.metrics.time}</Label>
                  <Label isCompact variant="outline">Tokens: {msg.metrics.tokens}</Label>
                  <Label isCompact variant="outline">TTFT: {msg.metrics.ttft}</Label>
                </Flex>
              </ExpandableSection>
            </div>
          )}
        </div>
      );
    }

    // Streaming interruption: partial text with ellipsis + expandable danger alert below
    if (msg.role === 'bot' && msg.classifiedError && msg.classifiedError.pattern === 'streaming-interruption') {
      const err = msg.classifiedError as ClassifiedError;
      const contentWithEllipsis = msg.content ? `${msg.content}...` : msg.content;
      return (
        <div key={msg.id}>
          <Message
            role="bot"
            avatar={msg.avatar}
            name={msg.name}
            content={contentWithEllipsis}
            extraContent={{
              afterMainContent: (
                <Alert variant="danger" title={err.title} isInline isExpandable
                  actionLinks={err.isRetriable ? (
                    <RetryButton onRetry={() => handleRetry(msg.originalMessage)} retryCount={retryCount} />
                  ) : undefined}
                >
                  <ErrorBody classifiedError={err} />
                </Alert>
              ),
            }}
          />
        </div>
      );
    }

    // Normal message with metrics
    if (msg.role === 'bot' && msg.metrics) {
      const isExpanded = expandedMetrics[msg.id] || false;
      return (
        <div key={msg.id}>
          <Message {...messageProps} extraContent={hasExtraContent ? extraContent : undefined} />
          <div style={{ marginLeft: '3.5rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <ExpandableSection
              toggleText={isExpanded ? 'Hide metrics' : 'Show metrics'}
              onToggle={() => setExpandedMetrics(prev => ({ ...prev, [msg.id]: !isExpanded }))}
              isExpanded={isExpanded}
              isIndented
            >
              <Flex spaceItems={{ default: 'spaceItemsSm' }} style={{ marginTop: '0.5rem' }}>
                <Label isCompact variant="outline">{msg.metrics.time}</Label>
                <Label isCompact variant="outline">Tokens: {msg.metrics.tokens}</Label>
                <Label isCompact variant="outline">TTFT: {msg.metrics.ttft}</Label>
              </Flex>
            </ExpandableSection>
          </div>
        </div>
      );
    }
    return <Message key={msg.id} {...messageProps} extraContent={hasExtraContent ? extraContent : undefined} />;
  };

  // Chat Panel Component
  const ChatPanel = (
    <div
      style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', minHeight: 0, position: 'relative' }}
      onDragEnter={handleChatDragEnter}
      onDragLeave={handleChatDragLeave}
      onDragOver={handleChatDragOver}
      onDrop={handleChatDrop}
    >
      {/* Drag-and-drop overlay */}
      {isDragOver && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          backgroundColor: 'rgba(0, 102, 204, 0.08)',
          border: '2px dashed var(--pf-t--global--border--color--brand--default)',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            backgroundColor: '#ffffff', padding: '1.5rem 2rem', borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            textAlign: 'center',
          }}>
            <DownloadIcon style={{ fontSize: '2rem', color: 'var(--pf-t--global--icon--color--brand--default)', marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 600 }}>Drop files here</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
              {supportsImageInput && supportsAudioInput ? 'Images, audio, and text files supported' :
               supportsImageInput ? 'Images and text files supported' :
               supportsAudioInput ? 'Audio and text files supported' :
               'Text files supported'}
            </div>
          </div>
        </div>
      )}
      {/* Header with model dropdown and metrics */}
      <div style={{ padding: '0.75rem 1rem 1rem 1rem', borderBottom: '1px solid var(--pf-t--global--border--color--default)' }}>
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem style={{ fontWeight: 600 }}>Model</FlexItem>
          <FlexItem>
            <Select
              isOpen={isSingleChatModelOpen}
              selected={selectedModel}
              onSelect={(_event, value) => {
                handleModelSwitch(value as string, selectedModel, setSelectedModel);
                setIsSingleChatModelOpen(false);
              }}
              onOpenChange={setIsSingleChatModelOpen}
              popperProps={{ appendTo: 'inline' }}
              toggle={(toggleRef) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsSingleChatModelOpen(!isSingleChatModelOpen)}
                  isExpanded={isSingleChatModelOpen}
                  isFullWidth
                  style={{ minWidth: '160px' }}
                >
                  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                    <FlexItem>
                      {selectedModel === 'gpt-oss-20b' ? 'gpt-oss-20b' :
                       selectedModel === 'gpt-oss-120b' ? 'gpt-oss-120b' :
                       selectedModel === 'qwen3-14b' ? 'Qwen3-14B' :
                       selectedModel === 'llama-3.2-11b' ? 'llama-3.2-11b' :
                       selectedModel === 'granite-4.0-h-small' ? 'granite-4.0-h-small' :
                       selectedModel === 'ministral-3-8b' ? 'Ministral-3-8B' : selectedModel}
                    </FlexItem>
                    {flags.showReasoningLevel && modelsWithReasoning.includes(selectedModel) && (
                      <FlexItem><Label color="green" isCompact>Reasoning</Label></FlexItem>
                    )}
                  </Flex>
                </MenuToggle>
              )}
            >
              <SelectList>
                <SelectOption value="gpt-oss-20b">
                  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                    <FlexItem>gpt-oss-20b</FlexItem>
                    {flags.showReasoningLevel && <FlexItem><Label color="green" isCompact>Reasoning</Label></FlexItem>}
                  </Flex>
                </SelectOption>
                <SelectOption value="gpt-oss-120b">
                  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                    <FlexItem>gpt-oss-120b</FlexItem>
                    {flags.showReasoningLevel && <FlexItem><Label color="green" isCompact>Reasoning</Label></FlexItem>}
                  </Flex>
                </SelectOption>
                <SelectOption value="qwen3-14b">
                  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                    <FlexItem>Qwen3-14B</FlexItem>
                    {flags.showReasoningLevel && <FlexItem><Label color="green" isCompact>Reasoning</Label></FlexItem>}
                  </Flex>
                </SelectOption>
                <SelectOption value="llama-3.2-11b">
                  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                    <FlexItem>llama-3.2-11b</FlexItem>
                    {flags.showReasoningLevel && <FlexItem><Label color="green" isCompact>Reasoning</Label></FlexItem>}
                  </Flex>
                </SelectOption>
                <SelectOption value="granite-4.0-h-small">
                  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                    <FlexItem>granite-4.0-h-small</FlexItem>
                    {flags.showReasoningLevel && <FlexItem><Label color="green" isCompact>Reasoning</Label></FlexItem>}
                  </Flex>
                </SelectOption>
                <SelectOption value="ministral-3-8b">Ministral-3-8B</SelectOption>
              </SelectList>
            </Select>
          </FlexItem>
        </Flex>
        {/* Show thinking animation or metrics */}
        {isSingleChatThinking ? (
          <div style={{ marginTop: '0.5rem', color: 'var(--pf-v6-global--Color--200)', fontStyle: 'italic' }}>
            <span style={{ marginRight: '0.25rem' }}>*</span>
            <span>{singleChatThinkingMessage}{thinkingDots}</span>
          </div>
        ) : singleChatMetrics.responseCount > 0 && (
          <Flex spaceItems={{ default: 'spaceItemsSm' }} style={{ marginTop: '0.5rem' }}>
            <Label isCompact variant="outline">{singleChatMetrics.avgTime.toFixed(2)} s</Label>
            <Label isCompact variant="outline">T: {singleChatMetrics.totalTokens}</Label>
            <Label isCompact variant="outline">TTFT: {Math.round(singleChatMetrics.avgTtft)}ms</Label>
          </Flex>
        )}
      </div>
      {/* Chat Body */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Chatbot displayMode={ChatbotDisplayMode.embedded} className="pf-chatbot-white-bg">
          <ChatbotContent>
            <MessageBox>
              {chatHistory.length === 0 ? (
                <>
                  <ChatbotWelcomePrompt
                    title="Hello!"
                    description="Welcome to the playground"
                    prompts={showWelcomePrompts ? welcomePrompts : undefined}
                  />

                  {/* Initial bot message */}
                  <Message
                    id="initial-bot-message"
                    role="bot"
                    name="Bot"
                    content="Before you begin chatting, you can change the model, edit the system prompt, adjust model parameters to fit your specific use case."
                    avatar={`data:image/svg+xml,${encodeURIComponent(ChatbotIcon)}`}
                    timestamp={`${selectedModel.split('-')[0].charAt(0).toUpperCase() + selectedModel.split('-')[0].slice(1)} 3.1 8B-Instruct · 1:30 PM`}
                  />
                </>
              ) : (
                chatHistory.map((msg) => renderMessageWithMetrics(msg))
              )}
            </MessageBox>
          </ChatbotContent>
        </Chatbot>
      </div>
      <div
        style={{
          flexShrink: 0,
          borderTop: '1px solid var(--pf-t--global--border--color--default)',
          padding: '1rem 1rem 1.5rem 1rem',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Hidden file input for programmatic upload from attach menu */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={Object.values(allowedFileTypes).flat().join(',')}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        <div className="pf-chatbot-white-bg" style={{ paddingBottom: '0.5rem' }}>
          {/* Drag-and-drop error alert */}
          {dragError && (
            <Alert variant="warning" isInline isPlain title={dragError} actionClose={<AlertActionCloseButton onClose={() => setDragError(null)} />} style={{ margin: '0.5rem 0.75rem' }} />
          )}
          {/* File size error alerts */}
          {fileSizeErrors.map((err, i) => (
            <Alert key={`fserr-${i}`} variant="danger" isInline isPlain title={err} actionClose={<AlertActionCloseButton onClose={() => setFileSizeErrors(prev => prev.filter((_, j) => j !== i))} />} style={{ margin: '0.5rem 0.75rem' }} />
          ))}
          {/* File size warning alerts */}
          {fileSizeWarnings.map((warn, i) => (
            <Alert key={`fswarn-${i}`} variant="warning" isInline isPlain title={warn} actionClose={<AlertActionCloseButton onClose={() => setFileSizeWarnings(prev => prev.filter((_, j) => j !== i))} />} style={{ margin: '0.5rem 0.75rem' }} />
          ))}
          {stagedFiles.length > 0 && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.375rem',
              padding: '0.5rem 0.75rem 0.25rem',
            }}>
              {stagedFiles.map((file, i) => (
                <div key={`${file.name}-${i}`} style={{ border: '1px solid var(--pf-t--global--border--color--default)', borderRadius: '4px' }}>
                  <FileDetailsLabel
                    fileName={file.name}
                    onClose={() => handleFileRemoved(i)}
                  />
                </div>
              ))}
            </div>
          )}
          <MessageBar
            value={inputValue}
            onSendMessage={(message) => {
              const userAvatar = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="18" fill="#d2d2d2"/><circle cx="18" cy="14" r="6" fill="#8a8d90"/><path d="M6 32c0-6.627 5.373-12 12-12s12 5.373 12 12" fill="#8a8d90"/></svg>')}`;

              // Create blob URLs for media files and classify them
              const media = stagedFiles
                .map(f => ({ type: classifyFile(f), name: f.name, url: URL.createObjectURL(f) }))
                .filter(m => m.type !== 'text');
              const textAttachments = stagedFiles
                .filter(f => classifyFile(f) === 'text')
                .map((f, i) => ({ name: f.name, id: `file-${i}` }));

              const hasAudioFiles = media.some(m => m.type === 'audio');
              const hasImageFiles = media.some(m => m.type === 'image');
              const hasVideoFiles = media.some(m => m.type === 'video');
              const hasPdfFiles = stagedFiles.some(f => f.name.toLowerCase().endsWith('.pdf'));

              const defaultPrompt = hasAudioFiles ? 'Transcribe this audio'
                : hasPdfFiles ? 'Analyze this document'
                : hasVideoFiles ? 'Describe this video'
                : hasImageFiles ? 'Describe this image' : '';

              const userMsg: any = {
                id: Date.now().toString(),
                role: 'user',
                content: message || defaultPrompt,
                name: 'User',
                avatar: userAvatar,
                timestamp: new Date().toLocaleTimeString(),
                ...(textAttachments.length > 0 ? { attachments: textAttachments } : {}),
                ...(media.length > 0 ? { media } : {}),
              };
              const updatedHistory = [...chatHistory, userMsg];
              setChatHistory(updatedHistory);
              setShowWelcomePrompts(false);
              setInputValue('');
              setStagedFiles([]);
              setFileSizeWarnings([]);
              setFileSizeErrors([]);

              // Start thinking animation — ASR-specific or generic
              setIsSingleChatThinking(true);
              if (hasAudioFiles) {
                setSingleChatThinkingMessage('Transcribing audio');
              } else if (hasPdfFiles) {
                setSingleChatThinkingMessage('Extracting and analyzing document');
              } else if (hasVideoFiles) {
                setSingleChatThinkingMessage('Analyzing video');
              } else if (hasImageFiles) {
                setSingleChatThinkingMessage('Analyzing image');
              } else {
                setSingleChatThinkingMessage(thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)]);
              }

              // Generate random metrics
              const time = hasAudioFiles ? (Math.random() * 5 + 3).toFixed(2) : (Math.random() * 30 + 20).toFixed(2);
              const tokens = hasAudioFiles ? Math.floor(Math.random() * 400 + 300) : Math.floor(Math.random() * 200 + 150);
              const ttft = hasAudioFiles ? Math.floor(Math.random() * 300 + 200) : Math.floor(Math.random() * 150 + 100);

              // Simulate bot response — ASR transcript or generic
              const delay = hasAudioFiles ? 3000 : 2000;
              const botMsgId = (Date.now() + 1).toString();

              setTimeout(() => {
                // Check for mock error triggers first
                const scenario = findMockScenario(String(message));

                if (scenario) {
                  const effectiveContext = {
                    modelName: selectedModel,
                    ...scenario.context,
                  };
                  const classified = classifyError(scenario.apiError, effectiveContext);

                  // Override pattern and microcopy for streaming interruptions
                  if (scenario.forcePattern) {
                    classified.pattern = scenario.forcePattern;
                  }
                  if (scenario.microcopyKey) {
                    const streamCopy = getMicrocopy(scenario.microcopyKey, effectiveContext);
                    classified.title = streamCopy.title;
                    classified.description = streamCopy.description;
                  }

                  const botMsg = {
                    id: botMsgId,
                    role: 'bot',
                    name: 'Bot',
                    avatar: `data:image/svg+xml,${encodeURIComponent(ChatbotIcon)}`,
                    timestamp: new Date().toLocaleTimeString(),
                    classifiedError: classified,
                    originalMessage: String(message),
                    ...(scenario.partialResponse ? { content: scenario.partialResponse } : {}),
                    ...(scenario.partialResponse ? { metrics: { time: `${time} s`, tokens, ttft: `${ttft}ms` } } : {}),
                  };
                  setChatHistory(prev => [...prev, botMsg]);
                  setIsSingleChatThinking(false);
                  return;
                }

                // Normal response — ASR transcript or generic
                const botContent = hasAudioFiles
                  ? `**Transcript**\n\n${asrTranscript}`
                  : hasPdfFiles
                  ? '**Document Analysis**\n\nThe document appears to be a technical specification with the following structure:\n\n1. **Title page** — Project name, version, and date\n2. **Table of contents** — 8 sections covering requirements, architecture, and implementation\n3. **Key content** — The first page contains a header with the Red Hat logo, document title "Model Serving Configuration Guide v2.1", and an executive summary describing the multi-model serving architecture.\n\n*Note: Only the first page was extracted and analyzed. Upload individual pages for deeper analysis.*'
                  : hasVideoFiles
                  ? 'The video is approximately 2 minutes long and shows a screen recording of a developer deploying a model serving instance. Key segments include: 0:00–0:30 navigating to the model registry, 0:30–1:15 configuring serving runtime parameters, and 1:15–2:00 monitoring the deployment status in the dashboard.'
                  : hasImageFiles
                  ? 'The image shows a dashboard interface with several data visualization components. There are line charts displaying time-series data, a summary metrics bar at the top, and a navigation sidebar on the left. The overall layout follows a standard analytics dashboard pattern with a dark header and light content area.'
                  : 'This is a simulated response. In a real implementation, this would be the model\'s response to your message.';

                const botMsg: any = {
                  id: botMsgId,
                  role: 'bot',
                  content: botContent,
                  name: 'Bot',
                  avatar: `data:image/svg+xml,${encodeURIComponent(ChatbotIcon)}`,
                  timestamp: new Date().toLocaleTimeString(),
                  metrics: { time: `${time} s`, tokens, ttft: `${ttft}ms` },
                };
                setChatHistory(prev => [...prev, botMsg]);
                setIsSingleChatThinking(false);

                // Update cumulative metrics
                setSingleChatMetrics(prev => {
                  const newCount = prev.responseCount + 1;
                  const newAvgTime = ((prev.avgTime * prev.responseCount) + parseFloat(time)) / newCount;
                  const newTotalTokens = prev.totalTokens + tokens;
                  const newAvgTtft = ((prev.avgTtft * prev.responseCount) + ttft) / newCount;
                  return { avgTime: newAvgTime, totalTokens: newTotalTokens, avgTtft: newAvgTtft, responseCount: newCount };
                });
              }, delay);
            }}
            onChange={(_event, value) => setInputValue(String(value))}
            hasAttachButton
            attachMenuProps={{
              isAttachMenuOpen,
              setIsAttachMenuOpen,
              onAttachMenuToggleClick: () => { /* toggle handled by setIsAttachMenuOpen */ },
              onAttachMenuSelect: handleAttachMenuSelect,
              attachMenuItems: (
                <DropdownList>
                  {supportsImageInput && (
                    <DropdownItem value="upload-image" id="upload-image" icon={<FileImageIcon />}>Upload image</DropdownItem>
                  )}
                  {supportsAudioInput && (
                    <DropdownItem value="upload-audio" id="upload-audio" icon={<VolumeUpIcon />}>Upload audio</DropdownItem>
                  )}
                  {flags.enableMultimodalInput && (
                    <DropdownItem value="upload-video" id="upload-video" icon={<FilmIcon />}>Upload video</DropdownItem>
                  )}
                  <DropdownItem value="upload-files" id="upload-files" icon={<UploadIcon />}>Upload from computer</DropdownItem>
                </DropdownList>
              ),
            }}
            hasMicrophoneButton
          />
        </div>
        <div style={{ textAlign: 'center', padding: '0.5rem 0', color: 'var(--pf-v6-global--Color--200)', fontSize: '0.875rem' }}>Bot uses AI. Check for mistakes. <InfoCircleIcon style={{ marginLeft: '0.25rem' }} /></div>
      </div>
    </div>
  );

  // Compare mode message handler
  const handleCompareSendMessage = (message: string | number) => {
    const userAvatar = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="18" fill="#d2d2d2"/><circle cx="18" cy="14" r="6" fill="#8a8d90"/><path d="M6 32c0-6.627 5.373-12 12-12s12 5.373 12 12" fill="#8a8d90"/></svg>')}`;
    const timestamp = new Date().toLocaleTimeString();
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      name: 'User',
      avatar: userAvatar,
      timestamp
    };

    // Add to both panels
    setChatHistory(prev => [...prev, userMsg]);
    setChatHistory2(prev => [...prev, userMsg]);
    setInputValue('');

    // Start thinking animation with random witty messages
    setIsPanel1Thinking(true);
    setIsPanel2Thinking(true);
    setPanel1ThinkingMessage(thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)]);
    setPanel2ThinkingMessage(thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)]);

    // Generate random metrics for panel 1
    const time1 = (Math.random() * 30 + 20).toFixed(2); // 20-50 seconds
    const tokens1 = Math.floor(Math.random() * 200 + 150); // 150-350 tokens
    const ttft1 = Math.floor(Math.random() * 150 + 100); // 100-250 ms

    // Simulate bot response for panel 1 (increased delay by 1 second)
    setTimeout(() => {
      const scenario = findMockScenario(String(message));

      if (scenario) {
        const effectiveContext = { modelName: selectedModel, ...scenario.context };
        const classified = classifyError(scenario.apiError, effectiveContext);
        if (scenario.forcePattern) classified.pattern = scenario.forcePattern;
        if (scenario.microcopyKey) {
          const streamCopy = getMicrocopy(scenario.microcopyKey, effectiveContext);
          classified.title = streamCopy.title;
          classified.description = streamCopy.description;
        }

        const botMsg1 = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          name: selectedModel,
          avatar: `data:image/svg+xml,${encodeURIComponent(ChatbotIcon)}`,
          timestamp: new Date().toLocaleTimeString(),
          classifiedError: classified,
          originalMessage: String(message),
          ...(scenario.partialResponse ? { content: scenario.partialResponse } : {}),
        };
        setChatHistory(prev => [...prev, botMsg1]);
        setIsPanel1Thinking(false);
        return;
      }

      // Normal response (existing code)
      const botMsg1 = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: `Response from ${selectedModel}: This is a simulated response from the first model. The response demonstrates how different models handle the same prompt with varying performance characteristics.`,
        name: selectedModel,
        avatar: `data:image/svg+xml,${encodeURIComponent(ChatbotIcon)}`,
        timestamp: new Date().toLocaleTimeString(),
        metrics: { time: `${time1} s`, tokens: tokens1, ttft: `${ttft1}ms` }
      };
      setChatHistory(prev => [...prev, botMsg1]);
      setIsPanel1Thinking(false);

      // Update cumulative metrics for panel 1 (time and TTFT averaged, tokens summed)
      setPanel1Metrics(prev => {
        const newCount = prev.responseCount + 1;
        const newAvgTime = ((prev.avgTime * prev.responseCount) + parseFloat(time1)) / newCount;
        const newTotalTokens = prev.totalTokens + tokens1;
        const newAvgTtft = ((prev.avgTtft * prev.responseCount) + ttft1) / newCount;
        return {
          avgTime: newAvgTime,
          totalTokens: newTotalTokens,
          avgTtft: newAvgTtft,
          responseCount: newCount
        };
      });
    }, 2000);

    // Generate random metrics for panel 2
    const time2 = (Math.random() * 30 + 15).toFixed(2); // 15-45 seconds
    const tokens2 = Math.floor(Math.random() * 180 + 120); // 120-300 tokens
    const ttft2 = Math.floor(Math.random() * 120 + 80); // 80-200 ms

    // Simulate bot response for panel 2 (increased delay by 1 second)
    setTimeout(() => {
      const botMsg2 = {
        id: (Date.now() + 2).toString(),
        role: 'bot',
        content: `Response from ${selectedModel2}: This is a simulated response from the second model. Each model may produce different outputs and performance metrics for comparison.`,
        name: selectedModel2,
        avatar: `data:image/svg+xml,${encodeURIComponent(ChatbotIcon)}`,
        timestamp: new Date().toLocaleTimeString(),
        metrics: { time: `${time2} s`, tokens: tokens2, ttft: `${ttft2}ms` }
      };
      setChatHistory2(prev => [...prev, botMsg2]);
      setIsPanel2Thinking(false);

      // Update cumulative metrics for panel 2 (time and TTFT averaged, tokens summed)
      setPanel2Metrics(prev => {
        const newCount = prev.responseCount + 1;
        const newAvgTime = ((prev.avgTime * prev.responseCount) + parseFloat(time2)) / newCount;
        const newTotalTokens = prev.totalTokens + tokens2;
        const newAvgTtft = ((prev.avgTtft * prev.responseCount) + ttft2) / newCount;
        return {
          avgTime: newAvgTime,
          totalTokens: newTotalTokens,
          avgTtft: newAvgTtft,
          responseCount: newCount
        };
      });
    }, 2200);
  };

  // Compare Panel Component
  const _ComparePanel = ({
    panelNumber,
    history,
    model,
    isModelOpen,
    setModelOpen,
    onModelChange,
    onToggleSettings,
    onClose
  }: {
    panelNumber: number;
    history: any[];
    model: string;
    isModelOpen: boolean;
    setModelOpen: (open: boolean) => void;
    onModelChange: (model: string) => void;
    onToggleSettings: () => void;
    onClose: () => void;
  }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: '#ffffff' }}>
      {/* Panel Header */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--pf-v6-global--BorderColor--100)' }}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem style={{ fontWeight: 600 }}>Model {panelNumber}</FlexItem>
              <FlexItem>
                <Select
                  isOpen={isModelOpen}
                  selected={model}
                  onSelect={(_event, value) => {
                    onModelChange(value as string);
                    setModelOpen(false);
                  }}
                  onOpenChange={setModelOpen}
                  popperProps={{ appendTo: 'inline' }}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setModelOpen(!isModelOpen)}
                      isExpanded={isModelOpen}
                      isFullWidth
                      style={{ minWidth: '160px' }}
                    >
                      <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                        <FlexItem>
                          {model === 'gpt-oss-20b' ? 'gpt-oss-20b' :
                           model === 'gpt-oss-120b' ? 'gpt-oss-120b' :
                           model === 'qwen3-14b' ? 'Qwen3-14B' :
                           model === 'llama-3.2-11b' ? 'llama-3.2-11b' :
                           model === 'granite-4.0-h-small' ? 'granite-4.0-h-small' :
                           model === 'ministral-3-8b' ? 'Ministral-3-8B' : model}
                        </FlexItem>
                        {flags.showReasoningLevel && modelsWithReasoning.includes(model) && (
                          <FlexItem><Label color="green" isCompact>Reasoning</Label></FlexItem>
                        )}
                      </Flex>
                    </MenuToggle>
                  )}
                >
                  <SelectList>
                    <SelectOption value="gpt-oss-20b">
                      <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                        <FlexItem>gpt-oss-20b</FlexItem>
                        {flags.showReasoningLevel && <FlexItem><Label color="green" isCompact>Reasoning</Label></FlexItem>}
                      </Flex>
                    </SelectOption>
                    <SelectOption value="gpt-oss-120b">
                      <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                        <FlexItem>gpt-oss-120b</FlexItem>
                        {flags.showReasoningLevel && <FlexItem><Label color="green" isCompact>Reasoning</Label></FlexItem>}
                      </Flex>
                    </SelectOption>
                    <SelectOption value="qwen3-14b">
                      <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                        <FlexItem>Qwen3-14B</FlexItem>
                        {flags.showReasoningLevel && <FlexItem><Label color="green" isCompact>Reasoning</Label></FlexItem>}
                      </Flex>
                    </SelectOption>
                    <SelectOption value="llama-3.2-11b">
                      <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                        <FlexItem>llama-3.2-11b</FlexItem>
                        {flags.showReasoningLevel && <FlexItem><Label color="green" isCompact>Reasoning</Label></FlexItem>}
                      </Flex>
                    </SelectOption>
                    <SelectOption value="granite-4.0-h-small">
                      <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                        <FlexItem>granite-4.0-h-small</FlexItem>
                        {flags.showReasoningLevel && <FlexItem><Label color="green" isCompact>Reasoning</Label></FlexItem>}
                      </Flex>
                    </SelectOption>
                    <SelectOption value="ministral-3-8b">Ministral-3-8B</SelectOption>
                  </SelectList>
                </Select>
              </FlexItem>
              <FlexItem>
                <Button variant="plain" onClick={onToggleSettings} aria-label="Settings">
                  <CogIcon />
                </Button>
              </FlexItem>
            </Flex>
          </FlexItem>
          <FlexItem>
            <Button variant="plain" onClick={onClose} aria-label="Close panel">
              <TimesIcon />
            </Button>
          </FlexItem>
        </Flex>
        {/* Metrics row */}
        <Flex spaceItems={{ default: 'spaceItemsSm' }} style={{ marginTop: '0.5rem' }}>
          <Label isCompact variant="outline">53.24 s</Label>
          <Label isCompact variant="outline">T: 244</Label>
          <Label isCompact variant="outline">TTFT: 200ms</Label>
        </Flex>
      </div>
      {/* Chat Body */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Chatbot displayMode={ChatbotDisplayMode.embedded} className="pf-chatbot-white-bg">
          <ChatbotContent>
            <MessageBox>
              {history.length === 0 ? (
                <ChatbotWelcomePrompt
                  title="Hello!"
                  description="Send a message to compare models"
                />
              ) : (
                history.map((msg) => (
                  <Message key={msg.id} {...msg} />
                ))
              )}
            </MessageBox>
          </ChatbotContent>
        </Chatbot>
      </div>
    </div>
  );

  // Helper to render model select for compare panels
  const renderCompareModelSelect = (
    panelNumber: number,
    model: string,
    isOpen: boolean,
    setOpen: (open: boolean) => void,
    onChange: (model: string) => void,
    showReasoningLabel = true,
    isReadOnly = false
  ) => isReadOnly ? (
    <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 'var(--pf-t--global--font--size--sm)' }}>{model}</span>
      {flags.showReasoningLevel && showReasoningLabel && modelsWithReasoning.includes(model) && (
        <Label color="green" isCompact>Reasoning</Label>
      )}
    </div>
  ) : (
    <Select
      isOpen={isOpen}
      selected={model}
      onSelect={(_event, value) => {
        onChange(value as string);
        setOpen(false);
      }}
      onOpenChange={setOpen}
      popperProps={{ appendTo: 'inline' }}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setOpen(!isOpen)}
          isExpanded={isOpen}
          style={{ minWidth: '140px' }}
        >
          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }} flexWrap={{ default: 'nowrap' }} style={{ minWidth: 0 }}>
            <FlexItem style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{model}</FlexItem>
            {flags.showReasoningLevel && showReasoningLabel && modelsWithReasoning.includes(model) && (
              <FlexItem style={{ flexShrink: 0 }}><Label color="green" isCompact>Reasoning</Label></FlexItem>
            )}
          </Flex>
        </MenuToggle>
      )}
    >
      <SelectList>
        <SelectOption value="gpt-oss-20b">
          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
            <FlexItem>gpt-oss-20b</FlexItem>
            {flags.showReasoningLevel && <FlexItem><Label color="green" isCompact>Reasoning</Label></FlexItem>}
          </Flex>
        </SelectOption>
        <SelectOption value="gpt-oss-120b">
          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
            <FlexItem>gpt-oss-120b</FlexItem>
            {flags.showReasoningLevel && <FlexItem><Label color="green" isCompact>Reasoning</Label></FlexItem>}
          </Flex>
        </SelectOption>
        <SelectOption value="qwen3-14b">
          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
            <FlexItem>Qwen3-14B</FlexItem>
            {flags.showReasoningLevel && <FlexItem><Label color="green" isCompact>Reasoning</Label></FlexItem>}
          </Flex>
        </SelectOption>
        <SelectOption value="llama-3.2-11b">
          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
            <FlexItem>llama-3.2-11b</FlexItem>
            {flags.showReasoningLevel && <FlexItem><Label color="green" isCompact>Reasoning</Label></FlexItem>}
          </Flex>
        </SelectOption>
        <SelectOption value="granite-4.0-h-small">
          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
            <FlexItem>granite-4.0-h-small</FlexItem>
            {flags.showReasoningLevel && <FlexItem><Label color="green" isCompact>Reasoning</Label></FlexItem>}
          </Flex>
        </SelectOption>
        <SelectOption value="ministral-3-8b">Ministral-3-8B</SelectOption>
      </SelectList>
    </Select>
  );

  // Compare Layout - drawer (config on left with collapse)
  const compareUseInlineDrawer = true;
  const isCompareEqualCondensed = isPanelExpanded;
  const compareCollapsedWidth = 88;
  const isPanel1Collapsed = false;
  const isPanel2Collapsed = false;
  const comparePanel1Size = isPanel1Collapsed ? { flex: '0 0 auto', width: compareCollapsedWidth, minWidth: compareCollapsedWidth } : { flex: 1, minWidth: 0 };
  const comparePanel2Size = isPanel2Collapsed ? { flex: '0 0 auto', width: compareCollapsedWidth, minWidth: compareCollapsedWidth } : { flex: 1, minWidth: 0 };
  const comparePanelTransition = 'flex 0.25s ease-out, width 0.25s ease-out, min-width 0.25s ease-out';
  const comparePanel1Transition = isPanel1Collapsed ? comparePanelTransition : 'none';
  const comparePanel2Transition = isPanel2Collapsed ? comparePanelTransition : 'none';
  const handleExpandCollapsedPanel = () => setIsPanelExpanded(false);

  // CompareLayoutDrawer - config on left (Drawer), panels with collapse for push-collapse
  const CompareLayoutDrawer = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0, overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* Panel 1 */}
        <div
          className={undefined}
          style={{
            ...comparePanel1Size,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            transition: comparePanel1Transition,
          }}
        >
          {isPanel1Collapsed ? (
            <div
              role="button"
              tabIndex={0}
              onClick={handleExpandCollapsedPanel}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleExpandCollapsedPanel();
                }
              }}
              id="playground-compare-collapsed-panel-1"
              aria-label="Expand Chat 1"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem 0.5rem',
                height: '100%',
                border: '1px solid var(--pf-t--global--border--color--default)',
                borderRadius: 'var(--pf-t--global--BorderRadius--sm)',
                cursor: 'pointer',
                backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 'var(--pf-t--global--font--size--sm)' }}>Chat 1</span>
              <span title={selectedModel} style={{ fontSize: 'var(--pf-t--global--font--size--sm)', color: 'var(--pf-t--global--text--color--subtle)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{selectedModel}</span>
              <Button variant="plain" onClick={(e) => { e.stopPropagation(); handleExpandCollapsedPanel(); }} aria-label="Expand chat" id="playground-compare-expand-chat-1"><AngleRightIcon /></Button>
            </div>
          ) : (
            <>
              <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--pf-t--global--border--color--default)', flexShrink: 0 }}>
                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'nowrap' }} style={{ gap: '0.5rem', minWidth: 0 }}>
                  <FlexItem style={{ flex: '1 1 0%', minWidth: 0 }}>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }} flexWrap={{ default: 'nowrap' }} style={{ minWidth: 0 }}>
                      <>
                        <FlexItem style={{ flexShrink: 0 }}>
                          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                            <span className={(activeSettingsPanel === 1 || activeSettingsPanel === null) && isPanelExpanded ? 'playground-compare-chat-title-active' : undefined} style={{ fontWeight: 600, fontSize: 'var(--pf-t--global--font--size--sm)', ...((activeSettingsPanel === 1 || activeSettingsPanel === null) && isPanelExpanded ? { color: 'rgba(0, 102, 204, 1)' } : {}) }}>Chat 1</span>
                          </Flex>
                        </FlexItem>
                        <FlexItem style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}><div style={{ width: '1px', height: '1rem', backgroundColor: '#d2d2d2' }} /></FlexItem>
                        {isCompareEqualCondensed ? (
                          <FlexItem>
                            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }} flexWrap={{ default: 'nowrap' }} style={{ minWidth: 0 }}>
                              <FlexItem style={{ minWidth: 0 }}>{renderCompareModelSelect(1, selectedModel, isCompareModel1Open, setIsCompareModel1Open, setSelectedModel, false, false)}</FlexItem>
                            </Flex>
                          </FlexItem>
                        ) : (
                          <><FlexItem style={{ fontWeight: 600, fontSize: 'var(--pf-t--global--font--size--sm)', flexShrink: 0 }}>Model</FlexItem><FlexItem style={{ minWidth: 0 }}>{renderCompareModelSelect(1, selectedModel, isCompareModel1Open, setIsCompareModel1Open, setSelectedModel, true, false)}</FlexItem></>
                        )}
                      </>
                    </Flex>
                  </FlexItem>
                  <FlexItem style={{ flexShrink: 0 }}><Button variant="plain" onClick={() => handleExitCompareClick(1)} aria-label="Close panel"><TimesIcon /></Button></FlexItem>
                </Flex>
                {isPanel1Thinking ? <div style={{ marginTop: '0.5rem', color: 'var(--pf-v6-global--Color--200)', fontStyle: 'italic' }}><span style={{ marginRight: '0.25rem' }}>*</span><span>{panel1ThinkingMessage}{thinkingDots}</span></div> : panel1Metrics.responseCount > 0 && <Flex spaceItems={{ default: 'spaceItemsSm' }} style={{ marginTop: '0.5rem' }}><Label isCompact variant="outline">{panel1Metrics.avgTime.toFixed(2)} s</Label><Label isCompact variant="outline">T: {panel1Metrics.totalTokens}</Label><Label isCompact variant="outline">TTFT: {Math.round(panel1Metrics.avgTtft)}ms</Label></Flex>}
              </div>
              <div
                style={{ flex: 1, minHeight: 0 }}
                className={undefined}
              >
                <Chatbot displayMode={ChatbotDisplayMode.embedded} className="pf-chatbot-white-bg"><ChatbotContent><MessageBox>{chatHistory.length === 0 ? <ChatbotWelcomePrompt title="Hello!" description="Send a message to compare models" /> : chatHistory.map((msg) => renderMessageWithMetrics(msg))}</MessageBox></ChatbotContent></Chatbot>
              </div>
            </>
          )}
        </div>
        <Divider orientation={{ default: 'vertical' }} style={{ margin: 0 }} />
        {/* Panel 2 */}
        <div
          className={undefined}
          style={{
            ...comparePanel2Size,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            transition: comparePanel2Transition,
          }}
        >
          {isPanel2Collapsed ? (
            <div role="button" tabIndex={0} onClick={handleExpandCollapsedPanel} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleExpandCollapsedPanel(); } }} id="playground-compare-collapsed-panel-2" aria-label="Expand Chat 2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem 0.5rem', height: '100%', border: '1px solid var(--pf-t--global--border--color--default)', borderRadius: 'var(--pf-t--global--BorderRadius--sm)', cursor: 'pointer', backgroundColor: 'var(--pf-t--global--background--color--secondary--default)' }}>
              <span style={{ fontWeight: 600, fontSize: 'var(--pf-t--global--font--size--sm)' }}>Chat 2</span>
              <span title={selectedModel2} style={{ fontSize: 'var(--pf-t--global--font--size--sm)', color: 'var(--pf-t--global--text--color--subtle)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{selectedModel2}</span>
              <Button variant="plain" onClick={(e) => { e.stopPropagation(); handleExpandCollapsedPanel(); }} aria-label="Expand chat" id="playground-compare-expand-chat-2"><AngleRightIcon /></Button>
            </div>
          ) : (
            <>
              <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--pf-t--global--border--color--default)', flexShrink: 0 }}>
                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} flexWrap={{ default: 'nowrap' }} style={{ gap: '0.5rem', minWidth: 0 }}>
                  <FlexItem style={{ flex: '1 1 0%', minWidth: 0 }}>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }} flexWrap={{ default: 'nowrap' }} style={{ minWidth: 0 }}>
                      <>
                        <FlexItem style={{ flexShrink: 0 }}>
                          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }}>
                            <span className={activeSettingsPanel === 2 && isPanelExpanded ? 'playground-compare-chat-title-active' : undefined} style={{ fontWeight: 600, fontSize: 'var(--pf-t--global--font--size--sm)', ...(activeSettingsPanel === 2 && isPanelExpanded ? { color: 'rgba(0, 102, 204, 1)' } : {}) }}>Chat 2</span>
                          </Flex>
                        </FlexItem>
                        <FlexItem style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}><div style={{ width: '1px', height: '1rem', backgroundColor: '#d2d2d2' }} /></FlexItem>
                        {isCompareEqualCondensed ? (
                          <FlexItem>
                            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsXs' }} flexWrap={{ default: 'nowrap' }} style={{ minWidth: 0 }}>
                              <FlexItem style={{ minWidth: 0 }}>{renderCompareModelSelect(2, selectedModel2, isCompareModel2Open, setIsCompareModel2Open, setSelectedModel2, false, false)}</FlexItem>
                            </Flex>
                          </FlexItem>
                        ) : (
                          <><FlexItem style={{ fontWeight: 600, fontSize: 'var(--pf-t--global--font--size--sm)', flexShrink: 0 }}>Model</FlexItem><FlexItem style={{ minWidth: 0 }}>{renderCompareModelSelect(2, selectedModel2, isCompareModel2Open, setIsCompareModel2Open, setSelectedModel2, true, false)}</FlexItem></>
                        )}
                      </>
                    </Flex>
                  </FlexItem>
                  <FlexItem style={{ flexShrink: 0 }}><Button variant="plain" onClick={() => handleExitCompareClick(2)} aria-label="Close panel"><TimesIcon /></Button></FlexItem>
                </Flex>
                {isPanel2Thinking ? <div style={{ marginTop: '0.5rem', color: 'var(--pf-v6-global--Color--200)', fontStyle: 'italic' }}><span style={{ marginRight: '0.25rem' }}>*</span><span>{panel2ThinkingMessage}{thinkingDots}</span></div> : panel2Metrics.responseCount > 0 && <Flex spaceItems={{ default: 'spaceItemsSm' }} style={{ marginTop: '0.5rem' }}><Label isCompact variant="outline">{panel2Metrics.avgTime.toFixed(2)} s</Label><Label isCompact variant="outline">T: {panel2Metrics.totalTokens}</Label><Label isCompact variant="outline">TTFT: {Math.round(panel2Metrics.avgTtft)}ms</Label></Flex>}
              </div>
              <div
                style={{ flex: 1, minHeight: 0 }}
                className={undefined}
              >
                <Chatbot displayMode={ChatbotDisplayMode.embedded} className="pf-chatbot-white-bg"><ChatbotContent><MessageBox>{chatHistory2.length === 0 ? <ChatbotWelcomePrompt title="Hello!" description="Send a message to compare models" /> : chatHistory2.map((msg) => renderMessageWithMetrics(msg))}</MessageBox></ChatbotContent></Chatbot>
              </div>
            </>
          )}
        </div>
      </div>
      <div style={{ flexShrink: 0, borderTop: '1px solid var(--pf-t--global--border--color--default)', padding: '1rem', backgroundColor: '#ffffff' }}>
        <div className="pf-chatbot-white-bg" style={{ paddingBottom: '0.5rem' }}><MessageBar value={inputValue} onSendMessage={handleCompareSendMessage} onChange={(_event, value) => setInputValue(String(value))} hasAttachButton={false} hasMicrophoneButton /></div>
        <div style={{ textAlign: 'center', padding: '0.5rem 0', color: 'var(--pf-v6-global--Color--200)', fontSize: '0.875rem' }}>Bot uses AI. Check for mistakes. <InfoCircleIcon style={{ marginLeft: '0.25rem' }} /></div>
      </div>
    </div>
  );

  // Saved Configurations Drawer
  const SavedConfigurationsPanel = (
    <DrawerPanelContent style={{ width: '320px' }}>
      <DrawerHead>
        <Title headingLevel="h2" size="lg">Saved Configurations</Title>
        <DrawerActions>
          <DrawerCloseButton onClick={() => setIsSavedConfigsOpen(false)} />
        </DrawerActions>
      </DrawerHead>
      <DrawerContentBody>
        <div style={{ marginBottom: '1rem' }}>
          {['HR bot', 'Coding assistant POC', 'Expense report assistant'].map((name, idx) => (
            <Card key={idx} isCompact isClickable style={{ marginBottom: '0.5rem' }}>
              <CardBody>
                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                  <FlexItem>
                    <FolderIcon style={{ marginRight: '0.5rem' }} />
                    {name}
                  </FlexItem>
                  <FlexItem>
                    <Button variant="plain" icon={<EllipsisVIcon />} aria-label="Actions" />
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </div>
        <Button variant="link" icon={<RedoIcon />}>Reset to default</Button>
      </DrawerContentBody>
    </DrawerPanelContent>
  );

  // Sample Prompts Drawer
  const SamplePromptsPanel = (
    <DrawerPanelContent style={{ width: '320px' }}>
      <DrawerHead>
        <Title headingLevel="h2" size="lg">Sample Prompts</Title>
        <DrawerActions>
          <DrawerCloseButton onClick={() => setIsSamplePromptsOpen(false)} />
        </DrawerActions>
      </DrawerHead>
      <DrawerContentBody>
        {[
          { name: 'Code reviewer', category: 'Code' },
          { name: 'Technical writer', category: 'Writing' },
          { name: 'Data analyst', category: 'Analysis' }
        ].map((prompt, idx) => (
          <Card key={idx} isCompact isClickable style={{ marginBottom: '0.5rem' }}>
            <CardBody>
              <LightbulbIcon style={{ marginRight: '0.5rem' }} />
              <strong>{prompt.name}</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--pf-v6-global--Color--200)' }}>
                {prompt.category}
              </div>
            </CardBody>
          </Card>
        ))}
      </DrawerContentBody>
    </DrawerPanelContent>
  );

  // Chat History Drawer
  const ChatHistoryPanel = (
    <DrawerPanelContent style={{ width: '320px' }}>
      <DrawerHead>
        <Title headingLevel="h2" size="lg">Chat History</Title>
        <DrawerActions>
          <DrawerCloseButton onClick={() => setIsChatHistoryOpen(false)} />
        </DrawerActions>
      </DrawerHead>
      <DrawerContentBody>
        {[
          { date: 'Today, 2:30 PM', message: 'Explain React hooks' },
          { date: 'Today, 11:15 AM', message: 'Debug Python code' }
        ].map((item, idx) => (
          <Card key={idx} isCompact isClickable style={{ marginBottom: '0.5rem' }}>
            <CardBody>
              <div style={{ fontSize: '0.75rem', color: 'var(--pf-v6-global--Color--200)' }}>
                {item.date}
              </div>
              <div>{item.message}</div>
            </CardBody>
          </Card>
        ))}
      </DrawerContentBody>
    </DrawerPanelContent>
  );

  const MainContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', width: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <Drawer
          isExpanded={isPanelExpanded}
          position="left"
          isInline={!isCompareMode || compareUseInlineDrawer}
          style={{ height: '100%' }}
        >
          <DrawerContent panelContent={BuildPanelContent}>
            <DrawerContentBody style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: 1, minWidth: 0, minHeight: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
                {isCompareMode ? CompareLayoutDrawer : ChatPanel}
              </div>
            </DrawerContentBody>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );

  return (
    <div className="playground-page" style={{ height: '100%', overflow: 'hidden' }}>
      <PageSection className="playground-header" style={{ borderBottom: '1px solid #d2d2d2' }}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Flex alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <div className="playground-header-icon" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center' }}>
                  <PlaygroundIcon withBackground size={32} />
                </div>
              </FlexItem>
              <FlexItem>
                <Title headingLevel="h1">Playground</Title>
              </FlexItem>
              {flags.showProjectWorkspaceDropdowns && (
                <FlexItem style={{ marginLeft: 'var(--pf-v6-global--spacer--xl)' }}>
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
                            id="project-select"
                            style={{ width: '200px' }}
                          >
                            {selectedProject || 'Test playground'}
                    </MenuToggle>
                  )}
                >
                  <SelectList>
                          <SelectOption value="Test playground">Test playground</SelectOption>
                          <SelectOption value="Project X">Project X</SelectOption>
                  </SelectList>
                </Select>
                    </InputGroupItem>
                  </InputGroup>
                </FlexItem>
              )}
            </Flex>
          </FlexItem>

          <FlexItem>
            <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
              {!isCompareMode && (
                <>
                  <Button
                    variant="link"
                    id="chat-compare-button"
                    icon={<ColumnsIcon />}
                    onClick={() => setIsCompareConfirmModalOpen(true)}
                  >
                    Compare
                  </Button>
                  <Button
                    variant="link"
                    id="playground-single-settings-button"
                    icon={<CogIcon />}
                    onClick={() => setIsPanelExpanded((prev) => !prev)}
                  >
                    Settings
                  </Button>
                </>
              )}
              {isCompareMode && (
                <Button
                  variant="link"
                  id="playground-compare-settings-button"
                  icon={<CogIcon />}
                  onClick={() => {
                    if (isPanelExpanded) {
                      setIsPanelExpanded(false);
                    } else {
                      setActiveSettingsPanel((prev) => prev ?? 1);
                      setIsPanelExpanded(true);
                    }
                  }}
                >
                  Settings
                </Button>
              )}
              <Button variant="link" icon={<PlusIcon />} id="new-chat-button" onClick={() => setIsNewChatModalOpen(true)}>
                New Chat
              </Button>
              <Button variant="primary" icon={<CodeIcon />} id="view-code-button" onClick={() => setIsViewCodeModalOpen(true)}>
                View code
              </Button>
              <Dropdown
                isOpen={isKebabMenuOpen}
                onSelect={() => setIsKebabMenuOpen(false)}
                onOpenChange={(isOpen: boolean) => setIsKebabMenuOpen(isOpen)}
                popperProps={{
                  position: 'right'
                }}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    variant="plain"
                    onClick={() => setIsKebabMenuOpen(!isKebabMenuOpen)}
                    isExpanded={isKebabMenuOpen}
                    id="more-options-button"
                  >
                    <EllipsisVIcon />
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem key="chat-history" onClick={() => {
                    setIsChatHistoryOpen(true);
                    setIsSavedConfigsOpen(false);
                    setIsSamplePromptsOpen(false);
                  }}>
                    <HistoryIcon style={{ marginRight: '0.5rem' }} />
                    Chat history
                  </DropdownItem>
                  <DropdownItem key="download" onClick={() => console.log('Download transcript')}>
                    <DownloadIcon style={{ marginRight: '0.5rem' }} />
                    Download transcript
                  </DropdownItem>
                  <DropdownItem key="update-config" onClick={() => console.log('Update configuration')}>
                    <CogIcon style={{ marginRight: '0.5rem' }} />
                    Update configuration
                  </DropdownItem>
                  <DropdownItem key="delete" onClick={() => console.log('Delete playground')}>
                    <TrashIcon style={{ marginRight: '0.5rem' }} />
                    Delete playground
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            </Flex>
          </FlexItem>
        </Flex>
      </PageSection>

      <PageSection padding={{ default: 'noPadding' }} isFilled style={{ overflow: 'hidden' }}>
        <Drawer isExpanded={isSavedConfigsOpen} isInline position="left">
          <DrawerContent panelContent={SavedConfigurationsPanel}>
            <Drawer isExpanded={isSamplePromptsOpen} isInline position="left">
              <DrawerContent panelContent={SamplePromptsPanel}>
                <Drawer isExpanded={isChatHistoryOpen} isInline position="left">
                  <DrawerContent panelContent={ChatHistoryPanel}>
                    <DrawerContentBody>{MainContent}</DrawerContentBody>
                  </DrawerContent>
                </Drawer>
              </DrawerContent>
            </Drawer>
          </DrawerContent>
        </Drawer>
    </PageSection>

      {/* Add/Edit Vector Store Modal */}
      <AddVectorStoreModal
        isOpen={isAddVectorStoreModalOpen}
        onClose={() => {
          setIsAddVectorStoreModalOpen(false);
          setEditingVectorStore(null);
        }}
        editingStore={editingVectorStore}
        onSave={(vectorStoreData) => {
          if (editingVectorStore) {
            // Update existing collection
            setKnowledgeCollections(cols =>
              cols.map(c =>
                c.id === editingVectorStore.id ? { ...c, ...vectorStoreData } : c
              )
            );
          } else {
            // Add new collection
            const newCollection: PlaygroundCollection = {
              id: vectorStoreData.id || `vs-${Date.now()}`,
              collectionName: vectorStoreData.name || vectorStoreData.collectionName || 'New collection',
              vectorStoreName: vectorStoreData.vectorStoreName || vectorStoreData.name || 'Custom',
              provider: vectorStoreData.provider || 'Milvus',
              embeddingModel: vectorStoreData.embeddingModel || 'unknown',
              isInline: false,
            };
            setKnowledgeCollections(prev => [...prev, newCollection]);
          }
          setEditingVectorStore(null);
        }}
      />

      {/* Load Prompt Modal */}
      <LoadPromptModal
        isOpen={isLoadPromptModalOpen}
        onClose={() => setIsLoadPromptModalOpen(false)}
        onLoadPrompt={(prompt, version, mode) => {
          const ps = getActivePromptState();
          ps.setSystemPrompt(version.promptText);
          ps.setOriginalPrompt(version.promptText);
          ps.setIsSystemPromptReadOnly(mode === 'load');
          ps.setIsPromptEdited(false);
          ps.setPromptEditDraft(null);
          ps.setShowDefaultPromptHeader(false);
          ps.setShowDefaultPromptHeaderSkeleton(false);
          ps.setDefaultPromptTypedChars(0);
          ps.setLoadedPrompt({ prompt, version, mode });
          ps.setChatPromptAlert(version.promptType === 'chat');
        }}
        currentProject={selectedProject}
      />

      {/* Model-switch confirmation modal */}
      <Modal
        variant={ModalVariant.small}
        isOpen={pendingModelSwitch !== null}
        onClose={() => setPendingModelSwitch(null)}
      >
        <ModalHeader title="Switch model?" />
        <ModalBody>
          {pendingModelSwitch && (
            <>
              <p style={{ marginBottom: '0.75rem' }}>
                Switching to <strong>{pendingModelSwitch.targetModel === 'qwen3-14b' ? 'Qwen3-14B' : pendingModelSwitch.targetModel === 'ministral-3-8b' ? 'Ministral-3-8B' : pendingModelSwitch.targetModel}</strong> will remove the following capabilities:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem' }}>
                {pendingModelSwitch.lostCapabilities.map(cap => (
                  <Label key={cap} color="red" isCompact icon={<ExclamationTriangleIcon />}>{cap}</Label>
                ))}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                Messages in your history that used these capabilities will remain visible but won't be processed by the new model.
              </p>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => {
            if (pendingModelSwitch && pendingModelSetterRef.current) {
              pendingModelSetterRef.current(pendingModelSwitch.targetModel);
            }
            setPendingModelSwitch(null);
          }}>Switch model</Button>
          <Button variant="link" onClick={() => setPendingModelSwitch(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>


      {/* Media file replace confirmation modal */}
      <Modal
        variant={ModalVariant.small}
        isOpen={pendingMediaReplace !== null}
        onClose={() => setPendingMediaReplace(null)}
      >
        <ModalHeader title="Replace media file?" />
        <ModalBody>
          <p style={{ marginBottom: '0.75rem' }}>
            This conversation already has a media file attached. Only one image, audio, or video file is supported per conversation.
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
            The new file will replace the existing media attachment. Text file attachments are not affected.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={confirmMediaReplace}>Replace</Button>
          <Button variant="link" onClick={() => setPendingMediaReplace(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Save Configuration Modal */}
      <Modal
        variant={ModalVariant.small}
        isOpen={isSaveConfigModalOpen}
        onClose={() => {
          setIsSaveConfigModalOpen(false);
          setConfigName('');
          setConfigDescription('');
        }}
      >
        <ModalHeader
          title="Save configuration"
          description={
            <span style={{ fontSize: '14px' }}>
              Save your configuration including prompt, model parameters, knowledge and tool selection
            </span>
          }
        />
        <ModalBody>
          <FormGroup 
            label="Name"
            isRequired
            fieldId="config-name"
          >
            <TextInput
              id="config-name"
              value={configName}
              onChange={(_event, value) => setConfigName(value)}
              placeholder="Name your session"
              isRequired
            />
          </FormGroup>

          <FormGroup 
            label="Description"
            fieldId="config-description"
            style={{ marginTop: '1rem' }}
          >
            <TextArea
              id="config-description"
              value={configDescription}
              onChange={(_event, value) => setConfigDescription(value)}
              placeholder="Describe your use case"
              rows={3}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="primary"
            onClick={() => {
              // Handle save logic here
              console.log('Saving configuration:', { name: configName, description: configDescription });
              setIsSaveConfigModalOpen(false);
              setConfigName('');
              setConfigDescription('');
            }}
            isDisabled={!configName.trim()}
          >
            Save
          </Button>
          <Button
            variant="link"
            onClick={() => {
              setIsSaveConfigModalOpen(false);
              setConfigName('');
              setConfigDescription('');
            }}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Save Prompt Modal (brand new prompt) */}
      <CreatePromptModal
        isOpen={isSavePromptModalOpen}
        onClose={() => setIsSavePromptModalOpen(false)}
        onSubmit={async (promptData) => {
          try {
            const ps = getActivePromptState();
            console.log('Saving new prompt to registry:', {
              ...promptData,
              content: ps.systemPrompt,
            });
            const newPrompt: Prompt = {
              id: `prompt-${Date.now()}`,
              name: promptData.name,
              latestVersion: '1',
              lastModified: new Date(),
              createdDate: new Date(),
              commitMessage: promptData.commitMessage,
              tags: [],
              project: selectedProject,
              versions: [{
                id: `v-${Date.now()}`,
                versionNumber: '1',
                registeredAt: new Date(),
                promptText: promptData.promptText,
                promptType: promptData.promptType,
                variables: [],
                aliases: [],
                metadata: {},
                commitMessage: promptData.commitMessage,
              }],
            };
            ps.setLoadedPrompt({ prompt: newPrompt, version: newPrompt.versions[0], mode: 'load' });
            ps.setOriginalPrompt(ps.systemPrompt);
            ps.setIsPromptEdited(false);
            ps.setIsSystemPromptReadOnly(true);
            ps.setPromptEditDraft(null);
            ps.setShowDefaultPromptHeader(false);
            ps.setShowDefaultPromptHeaderSkeleton(false);
            ps.setDefaultPromptTypedChars(0);
            addToast(AlertVariant.success, 'Prompt saved', `"${promptData.name}" was saved to ${selectedProject}.`);
          } catch {
            addToast(AlertVariant.danger, 'Prompt not saved', 'Something went wrong. Try again.');
          }
        }}
        initialPromptText={getActivePromptState().systemPrompt}
        initialName={getDefaultPromptName()}
      />

      {/* Create Version Modal (new version of loaded prompt) */}
      <CreateVersionModal
        isOpen={isCreateVersionModalOpen}
        onClose={() => setIsCreateVersionModalOpen(false)}
        existingPrompt={getActivePromptState().loadedPrompt?.prompt}
        currentPromptText={getActivePromptState().systemPrompt}
        onSubmit={async (versionData) => {
          try {
            const ps = getActivePromptState();
            console.log('Creating new version:', {
              promptId: ps.loadedPrompt?.prompt.id,
              ...versionData,
            });
            ps.setOriginalPrompt(ps.systemPrompt);
            ps.setIsPromptEdited(false);
            ps.setIsSystemPromptReadOnly(true);
            ps.setPromptEditDraft(null);
            ps.setShowDefaultPromptHeader(false);
            ps.setShowDefaultPromptHeaderSkeleton(false);
            ps.setDefaultPromptTypedChars(0);
            if (ps.loadedPrompt) {
              const newVersion: PromptVersion = {
                id: `v-${Date.now()}`,
                versionNumber: versionData.versionNumber,
                registeredAt: new Date(),
                promptText: versionData.promptText,
                promptType: versionData.promptType,
                variables: [],
                aliases: [],
                metadata: {},
                commitMessage: versionData.commitMessage,
              };
              const updatedPrompt: Prompt = {
                ...ps.loadedPrompt.prompt,
                latestVersion: versionData.versionNumber,
                lastModified: new Date(),
                commitMessage: versionData.commitMessage,
                versions: [...ps.loadedPrompt.prompt.versions, newVersion],
              };
              ps.setLoadedPrompt({
                prompt: updatedPrompt,
                version: newVersion,
                mode: 'load',
              });
              addToast(AlertVariant.success, 'New version saved', `Version ${versionData.versionNumber} of "${ps.loadedPrompt.prompt.name}" was saved.`);
            }
          } catch {
            addToast(AlertVariant.danger, 'Version not saved', 'Something went wrong. Try again.');
          }
        }}
      />

      {/* Remove Vector Store Confirmation Modal */}
      <Modal
        variant={ModalVariant.small}
        isOpen={vectorStoreToRemove !== null}
        onClose={() => setVectorStoreToRemove(null)}
        aria-labelledby="remove-vector-store-modal-title"
        aria-describedby="remove-vector-store-modal-body"
      >
        <ModalHeader
          title="Remove vector store?"
          labelId="remove-vector-store-modal-title"
        />
        <ModalBody id="remove-vector-store-modal-body">
          Are you sure you want to remove <strong>{vectorStoreToRemove?.collectionName || vectorStoreToRemove?.name}</strong> from Knowledge?
        </ModalBody>
        <ModalFooter>
          <Button
            variant="danger"
            onClick={() => {
              if (vectorStoreToRemove) {
                const remaining = knowledgeCollections.filter(c => c.id !== vectorStoreToRemove.id);
                setKnowledgeCollections(remaining);
                // Fall back to first remaining collection if the removed one was selected
                if (selectedCollectionId === vectorStoreToRemove.id) {
                  setSelectedCollectionId(remaining.length > 0 ? remaining[0].id : null);
                }
                if (selectedCollectionId2 === vectorStoreToRemove.id) {
                  setSelectedCollectionId2(remaining.length > 0 ? remaining[0].id : null);
                }
              }
              setVectorStoreToRemove(null);
            }}
          >
            Remove
          </Button>
          <Button
            variant="link"
            onClick={() => setVectorStoreToRemove(null)}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        variant={ModalVariant.small}
        isOpen={fileToDelete !== null}
        onClose={() => setFileToDelete(null)}
        aria-labelledby="delete-file-modal-title"
        aria-describedby="delete-file-modal-body"
        id="delete-file-modal"
      >
        <ModalHeader
          title={
            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <ExclamationTriangleIcon color="var(--pf-t--global--icon--color--status--warning--default)" />
              </FlexItem>
              <FlexItem>Delete file?</FlexItem>
            </Flex>
          }
          labelId="delete-file-modal-title"
        />
        <ModalBody id="delete-file-modal-body">
          <p>Are you sure you want to delete <strong>{fileToDelete?.name}</strong>?</p>
          <p style={{ marginTop: '0.5rem', color: 'var(--pf-t--global--text--color--subtle)' }}>This action cannot be undone.</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="danger" onClick={confirmDeleteFile} id="confirm-delete-file-button">
            Delete
          </Button>
          <Button variant="link" onClick={() => setFileToDelete(null)} id="cancel-delete-file-button">
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* MCP Connection Success Modal */}
      <Modal
        variant={ModalVariant.medium}
        isOpen={isMcpConnectionModalOpen}
        onClose={() => setIsMcpConnectionModalOpen(false)}
        aria-labelledby="mcp-connection-modal-title"
      >
        <ModalHeader>
          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
            <FlexItem><CheckCircleIcon color="var(--pf-v6-global--success-color--100)" /></FlexItem>
            <FlexItem><Title headingLevel="h2" id="mcp-connection-modal-title">Connection successful</Title></FlexItem>
          </Flex>
        </ModalHeader>
        <ModalBody>
          <p>You are now connected to <strong>{selectedMcpServer?.name}-MCP-Server</strong>. You can use it directly in the playground chat.</p>
          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }} style={{ marginTop: '1rem' }}>
            <FlexItem>{selectedMcpServer?.toolsCount} out of {selectedMcpServer?.totalTools} tools are active.</FlexItem>
            <FlexItem>
              <Button
                variant="link"
                icon={<PencilAltIcon />}
                onClick={() => {
                  setIsMcpConnectionModalOpen(false);
                  handleToolsClick(selectedMcpServer);
                }}
              >
                Edit tool selection
              </Button>
            </FlexItem>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setIsMcpConnectionModalOpen(false)}>Save</Button>
          <Button variant="link" onClick={() => handleMcpDisconnect(selectedMcpServer?.id)}>Disconnect</Button>
        </ModalFooter>
      </Modal>

      {/* MCP Tools Selection Modal */}
      <Modal
        variant={ModalVariant.large}
        isOpen={isMcpToolsModalOpen}
        onClose={() => setIsMcpToolsModalOpen(false)}
        aria-labelledby="mcp-tools-modal-title"
      >
        <ModalHeader title={`${selectedMcpServer?.name}-MCP-Server`} labelId="mcp-tools-modal-title" />
        <ModalBody>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
            <FlexItem>
              <SearchInput
                placeholder="Find by name"
                value={mcpToolsSearchValue}
                onChange={(_event, value) => {
                  setMcpToolsSearchValue(value);
                  setMcpToolsPage(1);
                }}
                onClear={() => {
                  setMcpToolsSearchValue('');
                  setMcpToolsPage(1);
                }}
              />
            </FlexItem>
            <FlexItem>
              {Object.values(mcpToolSelections).filter(Boolean).length} out of {kubernetesMcpTools.length} selected
            </FlexItem>
            <FlexItem>
              <Pagination
                itemCount={getFilteredTools().length}
                perPage={mcpToolsPerPage}
                page={mcpToolsPage}
                onSetPage={(_event, page) => setMcpToolsPage(page)}
                isCompact
                widgetId="mcp-tools-pagination"
              />
            </FlexItem>
          </Flex>

          <Table variant="compact" aria-label="MCP Tools">
            <Thead>
              <Tr>
                <Th width={10}>
                  <Checkbox
                    id="select-all-mcp-tools"
                    isChecked={
                      getFilteredTools().length > 0 &&
                      getFilteredTools().every(tool => mcpToolSelections[tool.name])
                    }
                    onChange={(_event, checked) => {
                      const newSelections = { ...mcpToolSelections };
                      getFilteredTools().forEach(tool => {
                        newSelections[tool.name] = checked;
                      });
                      setMcpToolSelections(newSelections);
                    }}
                    aria-label="Select all tools"
                  />
                </Th>
                <Th>Tool name</Th>
                <Th>Description</Th>
              </Tr>
            </Thead>
            <Tbody>
              {getPaginatedTools().map(tool => (
                <Tr key={tool.name}>
                  <Td>
                    <Checkbox
                      id={`tool-${tool.name}`}
                      isChecked={mcpToolSelections[tool.name] || false}
                      onChange={(_event, checked) => {
                        setMcpToolSelections({
                          ...mcpToolSelections,
                          [tool.name]: checked
                        });
                      }}
                      aria-label={`Select ${tool.name}`}
                    />
                  </Td>
                  <Td>{tool.name}</Td>
                  <Td>{tool.description}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleSaveMcpTools}>Save</Button>
          <Button variant="link" onClick={() => setIsMcpToolsModalOpen(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Chat Compare Confirmation Modal */}
      <Modal
        variant="small"
        isOpen={isCompareConfirmModalOpen}
        onClose={() => setIsCompareConfirmModalOpen(false)}
        aria-labelledby="compare-confirm-modal-title"
        aria-describedby="close-compare-modal-body"
        style={{ width: '450px' }}
      >
        <ModalHeader title="Start a chat compare session?" labelId="compare-confirm-modal-title" />
        <ModalBody id="compare-confirm-modal-body">
          <p>Starting a new chat compare session will clear your current chat history. Your configuration will be copied to both chats. This action cannot be undone.</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleStartCompare}>Continue</Button>
          <Button variant="link" onClick={() => setIsCompareConfirmModalOpen(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* New Chat Confirmation Modal */}
      <Modal
        variant="small"
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        aria-labelledby="new-chat-modal-title"
        aria-describedby="new-chat-modal-body"
        style={{ width: '450px' }}
      >
        <ModalHeader title="Start New Chat?" labelId="new-chat-modal-title" />
        <ModalBody id="new-chat-modal-body">
          <p>Starting a new chat will erase the previous session, would you like to continue?</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleNewChat}>Continue</Button>
          <Button variant="link" onClick={() => setIsNewChatModalOpen(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Close Compare Confirmation Modal */}
      <Modal
        variant="small"
        isOpen={isCloseCompareModalOpen}
        onClose={() => setIsCloseCompareModalOpen(false)}
        aria-labelledby="close-compare-modal-title"
        aria-describedby="close-compare-modal-body"
      >
        <ModalHeader title="Close Chat Compare?" labelId="close-compare-modal-title" />
        <ModalBody id="close-compare-modal-body">
          <p>The chat configuration for Chat {closingChatNumber} will be lost.</p>
          <p>Are you sure you would like to close?</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="danger" onClick={handleConfirmExitCompare}>Close</Button>
          <Button variant="link" onClick={() => setIsCloseCompareModalOpen(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* View Code Modal */}
      <Modal
        variant={isCompareMode ? 'large' : 'medium'}
        isOpen={isViewCodeModalOpen}
        onClose={() => {
          setIsViewCodeModalOpen(false);
          setCodeCopied(false);
          setCodeCopied2(false);
        }}
        aria-labelledby="view-code-modal-title"
        aria-describedby="view-code-modal-body"
      >
        <ModalHeader title={isCompareMode ? 'View Code - Compare Mode' : 'View Code'} labelId="view-code-modal-title" />
        <ModalBody id="view-code-modal-body">
          {isCompareMode ? (
            // Compare mode: Two side-by-side code blocks
            <Flex gap={{ default: 'gapMd' }} style={{ height: '500px' }}>
              {/* Model 1 Code */}
              <FlexItem flex={{ default: 'flex_1' }} style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '0.5rem' }}>
                  <FlexItem>
                    <Title headingLevel="h4" size="md">Model 1: {selectedModel}</Title>
                  </FlexItem>
                  <FlexItem>
                    <Button
                      variant="plain"
                      onClick={() => handleCopyCode(llamaStackCodeSnippet, 1)}
                      aria-label="Copy Model 1 code"
                    >
                      {codeCopied ? <CheckIcon style={{ color: 'var(--pf-v6-global--success-color--100)' }} /> : <CopyIcon />}
                    </Button>
                  </FlexItem>
                </Flex>
                <div style={{
                  flex: 1,
                  overflow: 'auto',
                  backgroundColor: '#212427',
                  borderRadius: '6px',
                  padding: '1rem'
                }}>
                  <pre style={{
                    margin: 0,
                    fontFamily: 'var(--pf-v6-global--FontFamily--monospace)',
                    fontSize: '0.75rem',
                    lineHeight: '1.5',
                    color: '#f0f0f0',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    <code>{llamaStackCodeSnippet}</code>
                  </pre>
                </div>
              </FlexItem>

              {/* Model 2 Code */}
              <FlexItem flex={{ default: 'flex_1' }} style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '0.5rem' }}>
                  <FlexItem>
                    <Title headingLevel="h4" size="md">Model 2: {selectedModel2}</Title>
                  </FlexItem>
                  <FlexItem>
                    <Button
                      variant="plain"
                      onClick={() => handleCopyCode(llamaStackCodeSnippet, 2)}
                      aria-label="Copy Model 2 code"
                    >
                      {codeCopied2 ? <CheckIcon style={{ color: 'var(--pf-v6-global--success-color--100)' }} /> : <CopyIcon />}
                    </Button>
                  </FlexItem>
                </Flex>
                <div style={{
                  flex: 1,
                  overflow: 'auto',
                  backgroundColor: '#212427',
                  borderRadius: '6px',
                  padding: '1rem'
                }}>
                  <pre style={{
                    margin: 0,
                    fontFamily: 'var(--pf-v6-global--FontFamily--monospace)',
                    fontSize: '0.75rem',
                    lineHeight: '1.5',
                    color: '#f0f0f0',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    <code>{llamaStackCodeSnippet}</code>
                  </pre>
                </div>
              </FlexItem>
            </Flex>
          ) : (
            // Single chat mode: One code block
            <>
              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '0.5rem' }}>
                <FlexItem>
                  <Title headingLevel="h4" size="md">OpenAI Response API Configuration</Title>
                </FlexItem>
                <FlexItem>
                  <Button
                    variant="plain"
                    onClick={() => handleCopyCode(llamaStackCodeSnippet)}
                    aria-label="Copy code"
                  >
                    {codeCopied ? <CheckIcon style={{ color: 'var(--pf-v6-global--success-color--100)' }} /> : <CopyIcon />}
                  </Button>
                </FlexItem>
              </Flex>
              <div style={{
                maxHeight: '500px',
                overflow: 'auto',
                backgroundColor: '#212427',
                borderRadius: '6px',
                padding: '1rem'
              }}>
                <pre style={{
                  margin: 0,
                  fontFamily: 'var(--pf-v6-global--FontFamily--monospace)',
                  fontSize: '0.75rem',
                  lineHeight: '1.5',
                  color: '#f0f0f0',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  <code>{llamaStackCodeSnippet}</code>
                </pre>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setIsViewCodeModalOpen(false)}>Close</Button>
        </ModalFooter>
      </Modal>

      {/* A4: Edit older version modal */}
      <Modal
        variant={ModalVariant.small}
        isOpen={isEditOlderVersionModalOpen}
        onClose={() => setIsEditOlderVersionModalOpen(false)}
        aria-labelledby="edit-older-version-modal-title"
        aria-describedby="edit-older-version-modal-body"
      >
        <ModalHeader title="Edit latest version?" labelId="edit-older-version-modal-title" />
        <ModalBody id="edit-older-version-modal-body">
          You must edit from the latest version of this prompt. Load the latest version to continue.
        </ModalBody>
        <ModalFooter>
          <Button
            variant="primary"
            onClick={() => {
              const ps = getActivePromptState();
              if (ps.loadedPrompt) {
                const latest = ps.loadedPrompt.prompt.versions[ps.loadedPrompt.prompt.versions.length - 1];
                ps.setSystemPrompt(latest.promptText);
                ps.setOriginalPrompt(latest.promptText);
                ps.setLoadedPrompt({ ...ps.loadedPrompt, version: latest });
                ps.setIsSystemPromptReadOnly(false);
                ps.setIsPromptEdited(false);
                ps.setPromptEditDraft({ text: latest.promptText, originalText: latest.promptText });
              }
              setIsEditOlderVersionModalOpen(false);
            }}
          >
            Load latest
          </Button>
          <Button variant="link" onClick={() => setIsEditOlderVersionModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* A8: Load while editing modal */}
      <Modal
        variant={ModalVariant.small}
        isOpen={isLoadWhileEditingModalOpen}
        onClose={() => setIsLoadWhileEditingModalOpen(false)}
        aria-labelledby="load-while-editing-modal-title"
        aria-describedby="load-while-editing-modal-body"
      >
        <ModalHeader title="Load prompt?" labelId="load-while-editing-modal-title" />
        <ModalBody id="load-while-editing-modal-body">
          You have unsaved edits. Loading a new prompt will replace your current work.
        </ModalBody>
        <ModalFooter>
          <Button
            variant="primary"
            onClick={() => {
              setIsLoadWhileEditingModalOpen(false);
              setIsLoadPromptModalOpen(true);
            }}
          >
            Load prompt
          </Button>
          <Button variant="link" onClick={() => setIsLoadWhileEditingModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* A9/A10: Reusable confirmation modal */}
      <Modal
        variant={ModalVariant.small}
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        aria-labelledby="confirm-action-modal-title"
        aria-describedby="confirm-action-modal-body"
      >
        <ModalHeader title={confirmAction?.title ?? ''} titleIconVariant="warning" labelId="confirm-action-modal-title" />
        <ModalBody id="confirm-action-modal-body">{confirmAction?.body}</ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => { confirmAction?.onConfirm(); setConfirmAction(null); }}>
            {confirmAction?.confirmLabel}
          </Button>
          <Button variant="link" onClick={() => setConfirmAction(null)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      {/* Toast alerts */}
      <AlertGroup isToast isLiveRegion hasAnimations id="playground-toast-alert-group">
        {toastAlerts}
      </AlertGroup>
    </div>
  );
};

export { Playground };
