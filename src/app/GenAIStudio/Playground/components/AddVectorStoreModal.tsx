import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DropEvent,
  FormGroup,
  Grid,
  GridItem,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  MultipleFileUpload,
  MultipleFileUploadMain,
  Select,
  SelectList,
  SelectOption,
  TextArea,
  TextInput,
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
import { OutlinedQuestionCircleIcon, TrashIcon, UploadIcon } from '@patternfly/react-icons';

interface AddVectorStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vectorStore: any) => void;
  editingStore?: any;
}

interface readFile {
  fileName: string;
  data?: string;
  loadResult?: 'danger' | 'success';
}

export const AddVectorStoreModal: React.FunctionComponent<AddVectorStoreModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStore,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [vectorStoreType, setVectorStoreType] = useState<'inline' | 'external'>('inline');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // File upload state for MultipleFileUpload
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [readFileData, setReadFileData] = useState<readFile[]>([]);
  const [showStatus, setShowStatus] = useState(false);
  const [, setStatusIcon] = useState<'inProgress' | 'success' | 'danger'>('inProgress');
  
  // External connection state
  const [provider, setProvider] = useState('');
  const [isProviderOpen, setIsProviderOpen] = useState(false);
  const [endpointUrl, setEndpointUrl] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Load editing store data when modal opens in edit mode
  useEffect(() => {
    if (isOpen && editingStore) {
      setStep(2);
      setName(editingStore.name || '');
      setVectorStoreType(editingStore.type === 'External connection' ? 'external' : 'inline');
      
      if (editingStore.type === 'In memory' && editingStore.files) {
        // Convert stored file data back to File objects for editing
        setCurrentFiles(editingStore.files);
      } else if (editingStore.type === 'External connection') {
        setProvider(editingStore.provider || '');
        setEndpointUrl(editingStore.endpointUrl || '');
        setApiKey(editingStore.apiKey || '');
      }
    } else if (isOpen && !editingStore) {
      // Reset to step 1 when opening for new creation
      setStep(1);
    }
  }, [isOpen, editingStore]);

  // Show status component once files are uploaded
  if (!showStatus && currentFiles.length > 0) {
    setShowStatus(true);
  }

  // Update status icon based on file read results
  useEffect(() => {
    if (readFileData.length < currentFiles.length) {
      setStatusIcon('inProgress');
    } else if (readFileData.every((file) => file.loadResult === 'success')) {
      setStatusIcon('success');
    } else if (readFileData.some((file) => file.loadResult === 'danger')) {
      setStatusIcon('danger');
    }
  }, [readFileData, currentFiles]);

  const removeFiles = (namesOfFilesToRemove: string[]) => {
    const newCurrentFiles = currentFiles.filter(
      (currentFile) => !namesOfFilesToRemove.some((fileName) => fileName === currentFile.name)
    );
    setCurrentFiles(newCurrentFiles);

    const newReadFiles = readFileData.filter(
      (readFile) => !namesOfFilesToRemove.some((fileName) => fileName === readFile.fileName)
    );
    setReadFileData(newReadFiles);
  };

  const handleFileDrop = (_event: DropEvent, droppedFiles: File[]) => {
    const currentFileNames = currentFiles.map((file) => file.name);
    const reUploads = droppedFiles.filter((droppedFile) => currentFileNames.includes(droppedFile.name));

    Promise.resolve()
      .then(() => removeFiles(reUploads.map((file) => file.name)))
      .then(() => setCurrentFiles((prevFiles) => [...prevFiles, ...droppedFiles]));
  };

  const handleCreate = () => {
    const vectorStoreData = {
      id: editingStore?.id || Date.now().toString(),
      name: name || 'Untitled vector store',
      type: vectorStoreType === 'inline' ? 'In memory' : 'External connection',
      provider: vectorStoreType === 'inline' ? 'Milvus' : (provider || 'PGVector'),
      selected: editingStore?.selected ?? true,
      addedToKnowledge: true,
      files: currentFiles,
      endpointUrl,
      apiKey
    };
    onSave(vectorStoreData);
    handleModalClose();
  };

  const handleModalClose = () => {
    // Reset form
    setStep(1);
    setName('');
    setDescription('');
    setCurrentFiles([]);
    setReadFileData([]);
    setShowStatus(false);
    setStatusIcon('inProgress');
    setVectorStoreType('inline');
    setProvider('');
    setEndpointUrl('');
    setApiKey('');
    onClose();
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={handleModalClose}
    >
      <ModalHeader
        title={step === 1 ? 'Add vector store' : (vectorStoreType === 'inline' ? 'Add files' : 'Connection details')}
        description={
          step === 1 
            ? 'Add your vector store details and choose the type of vector store you want to add.'
            : vectorStoreType === 'inline'
              ? 'Choose the type of vector store you want to add. You can add up to 10 files.'
              : 'Add the connection details of your external vector store'
        }
      />
      <ModalBody>
        {step === 1 ? (
          <>
              <FormGroup label="Name" isRequired fieldId="vector-store-name">
                <TextInput
                  id="vector-store-name"
                  value={name}
                  onChange={(_event, value) => setName(value)}
                placeholder="sample-app"
                isRequired
                />
              </FormGroup>

            <FormGroup label="Description" fieldId="vector-store-description" style={{ marginTop: '1rem' }}>
                <TextArea
                  id="vector-store-description"
                  value={description}
                  onChange={(_event, value) => setDescription(value)}
                placeholder="What's the purpose of your vector store"
                  rows={3}
                />
              </FormGroup>

            <div style={{ marginTop: '1.5rem' }}>
              <Grid hasGutter>
                <GridItem span={6}>
                  <Card 
                    id="inline-vector-store-card"
                    isSelectable
                    isSelected={vectorStoreType === 'inline'}
                    isFullHeight
                  >
                    <CardHeader
                      selectableActions={{
                        selectableActionId: 'inline-card-input',
                        selectableActionAriaLabelledby: 'inline-card-title',
                        name: 'vector-store-type',
                        variant: 'single',
                        onChange: () => setVectorStoreType('inline'),
                        hasNoOffset: true
                      }}
                    >
                      <CardTitle id="inline-card-title">Inline vector store</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <div style={{ fontSize: '0.875rem', color: 'var(--pf-v6-global--Color--200)' }}>
                        Good for quick RAG experiments. Upload sample documents to test model performance with grounding data.
                      </div>
                    </CardBody>
                  </Card>
                </GridItem>
                <GridItem span={6}>
                  <Card 
                    id="external-vector-store-card"
                    isSelectable
                    isSelected={vectorStoreType === 'external'}
                    isFullHeight
                  >
                    <CardHeader
                      selectableActions={{
                        selectableActionId: 'external-card-input',
                        selectableActionAriaLabelledby: 'external-card-title',
                        name: 'vector-store-type',
                        variant: 'single',
                        onChange: () => setVectorStoreType('external'),
                        hasNoOffset: true
                      }}
                    >
                      <CardTitle id="external-card-title">External vector score</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <div style={{ fontSize: '0.875rem', color: 'var(--pf-v6-global--Color--200)' }}>
                        Connect to an external vector store to test model performance with existing RAG vector database.
                      </div>
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>
            </div>
          </>
        ) : vectorStoreType === 'inline' ? (
          <>
            {currentFiles.length === 0 ? (
              /* No files uploaded - show full width upload */
              <MultipleFileUpload
                onFileDrop={handleFileDrop}
                dropzoneProps={{
                  accept: {
                    'image/jpeg': ['.jpg', '.jpeg'],
                    'application/pdf': ['.pdf'],
                    'image/png': ['.png'],
                    'image/gif': ['.gif']
                  }
                }}
              >
                <MultipleFileUploadMain
                  titleIcon={<UploadIcon />}
                  titleText="Drag and drop files here"
                  titleTextSeparator="or"
                  infoText="Accepted file types: JPEG, PDF, PNG, GIF"
                />
              </MultipleFileUpload>
            ) : (
              /* Files uploaded - show 2 column layout */
              <Grid hasGutter>
                <GridItem span={8}>
                  <Table variant="compact" aria-label="Uploaded files" id="uploaded-files-table">
                    <Thead>
                      <Tr>
                        <Th>File name</Th>
                        <Th>File size</Th>
                        <Th width={10}></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {currentFiles.map((file) => (
                        <Tr key={file.name}>
                          <Td>{file.name}</Td>
                          <Td>{(file.size / 1024).toFixed(1)} KB</Td>
                          <Td>
                            <Button
                              variant="plain"
                              icon={<TrashIcon />}
                              onClick={() => removeFiles([file.name])}
                              aria-label={`Remove ${file.name}`}
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </GridItem>
                <GridItem span={4}>
                  <MultipleFileUpload
                    onFileDrop={handleFileDrop}
                    dropzoneProps={{
                      accept: {
                        'image/jpeg': ['.jpg', '.jpeg'],
                        'application/pdf': ['.pdf'],
                        'image/png': ['.png'],
                        'image/gif': ['.gif']
                      }
                    }}
                  >
                    <MultipleFileUploadMain
                      titleIcon={<UploadIcon />}
                      titleText="Drag and drop files here"
                      titleTextSeparator="or"
                      infoText="Accepted file types: JPEG, PDF, PNG, GIF"
                    />
                  </MultipleFileUpload>
                </GridItem>
              </Grid>
            )}
          </>
        ) : (
          /* External vector store connection details */
          <>
            <FormGroup 
              label={
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Provider
                  <span style={{ color: 'var(--pf-v6-global--danger-color--100)' }}>*</span>
                  <Tooltip content="Select the vector database provider you want to connect to">
                    <OutlinedQuestionCircleIcon style={{ fontSize: '14px', color: 'var(--pf-v6-global--icon-Color--subtle)' }} />
                  </Tooltip>
                </span>
              }
              isRequired 
              fieldId="provider-select"
            >
              <Select
                id="provider-select"
                isOpen={isProviderOpen}
                selected={provider}
                onSelect={(_event, value) => {
                  setProvider(value as string);
                  setIsProviderOpen(false);
                }}
                onOpenChange={(isOpen) => setIsProviderOpen(isOpen)}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                    onClick={() => setIsProviderOpen(!isProviderOpen)}
                    isExpanded={isProviderOpen}
                        style={{ width: '100%' }}
                      >
                    {provider || 'Milvus'}
                      </MenuToggle>
                    )}
                  >
                    <SelectList>
                  <SelectOption value="Milvus">Milvus</SelectOption>
                  <SelectOption value="PGVector">PGVector</SelectOption>
                  <SelectOption value="Pinecone">Pinecone</SelectOption>
                  <SelectOption value="Weaviate">Weaviate</SelectOption>
                  <SelectOption value="ChromaDB">ChromaDB</SelectOption>
                    </SelectList>
                  </Select>
                </FormGroup>

            <FormGroup 
              label={
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Endpoint URL
                  <span style={{ color: 'var(--pf-v6-global--danger-color--100)' }}>*</span>
                  <Tooltip content="The URL endpoint of your external vector database">
                    <OutlinedQuestionCircleIcon style={{ fontSize: '14px', color: 'var(--pf-v6-global--icon-Color--subtle)' }} />
                  </Tooltip>
                </span>
              }
              isRequired 
              fieldId="endpoint-url"
              style={{ marginTop: '1rem' }}
            >
                      <TextInput
                id="endpoint-url"
                value={endpointUrl}
                onChange={(_event, value) => setEndpointUrl(value)}
                placeholder=""
                isRequired
              />
                    </FormGroup>

            <FormGroup 
              label={
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  API key
                  <span style={{ color: 'var(--pf-v6-global--danger-color--100)' }}>*</span>
                  <Tooltip content="The API key or authentication token for your vector database">
                    <OutlinedQuestionCircleIcon style={{ fontSize: '14px', color: 'var(--pf-v6-global--icon-Color--subtle)' }} />
                  </Tooltip>
                </span>
              }
              isRequired 
              fieldId="api-key"
              style={{ marginTop: '1rem' }}
            >
                      <TextInput
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(_event, value) => setApiKey(value)}
                placeholder=""
                isRequired
              />
              </FormGroup>
            </>
          )}
      </ModalBody>
      <ModalFooter>
        {step === 2 && !editingStore && (
          <Button variant="secondary" onClick={handleBack}>
            Back
          </Button>
        )}
        <Button
          variant="primary"
          onClick={step === 1 ? handleNext : handleCreate}
          isDisabled={
            step === 1 
              ? !name.trim()
              : vectorStoreType === 'inline'
                ? currentFiles.length === 0
                : !provider || !endpointUrl || !apiKey
          }
        >
          {step === 1 
            ? 'Next' 
            : editingStore 
              ? 'Update' 
              : vectorStoreType === 'inline' 
                ? 'Create' 
                : 'Connect'}
        </Button>
        <Button variant="link" onClick={handleModalClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
