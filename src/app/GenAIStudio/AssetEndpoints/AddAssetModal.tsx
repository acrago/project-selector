import React from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Form,
  FormGroup,
  FormGroupLabelHelp,
  FormHelperText,
  HelperText,
  HelperTextItem,
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Popover,
  Select,
  SelectList,
  SelectOption,
  Split,
  SplitItem,
  TextInput
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  SyncAltIcon
} from '@patternfly/react-icons';

export type ModelType = 'inference' | 'embedding';
export type ModelProvider = 'openai' | 'gemini' | 'anthropic' | 'other';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isFormValid: () => boolean;
  modelType: ModelType;
  setModelType: (value: ModelType) => void;
  modelName: string;
  setModelName: (value: string) => void;
  modelAlias: string;
  setModelAlias: (value: string) => void;
  url: string;
  setUrl: (value: string) => void;
  token: string;
  setToken: (value: string) => void;
  useCase: string;
  setUseCase: (value: string) => void;
  embeddingDimension: string;
  setEmbeddingDimension: (value: string) => void;
  useBadgeModelType?: boolean;
  displayNameRequired?: boolean;
  existingDisplayNames?: string[];
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isFormValid,
  modelType,
  setModelType,
  modelName,
  setModelName,
  modelAlias,
  setModelAlias,
  url,
  setUrl,
  token,
  setToken,
  useCase,
  setUseCase,
  embeddingDimension,
  setEmbeddingDimension,
  useBadgeModelType = false,
  displayNameRequired = false,
  existingDisplayNames = []
}) => {
  const [testStatus, setTestStatus] = React.useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [isModelTypeSelectOpen, setIsModelTypeSelectOpen] = React.useState(false);
  const modelNameLabelHelpRef = React.useRef<HTMLButtonElement>(null);
  const modelAliasLabelHelpRef = React.useRef<HTMLButtonElement>(null);

  const isDuplicateName = displayNameRequired && modelAlias.trim().length > 0 &&
    existingDisplayNames.some(name => name.toLowerCase() === modelAlias.trim().toLowerCase());
  const urlLabelHelpRef = React.useRef<HTMLButtonElement>(null);

  const knownInferenceModelIds = new Set([
    // OpenAI
    'gpt-4o', 'gpt-4o-mini', 'gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo',
    'o1', 'o1-mini', 'o1-preview', 'o3-mini',
    // Google
    'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-pro', 'gemini-1.5-flash',
    // Anthropic
    'claude-sonnet-4-20250514', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307', 'claude-3.5-sonnet-20241022',
    // Meta Llama
    'meta-llama/Llama-3.1-8B-Instruct', 'meta-llama/Llama-3.1-70B-Instruct',
    'meta-llama/Llama-3.1-405B-Instruct', 'meta-llama/Llama-3.2-3B-Instruct',
    'meta-llama/Llama-3.3-70B-Instruct',
    // Mistral
    'mistral-large-latest', 'mistral-small-latest', 'mistral-7b-instruct',
    'open-mistral-nemo', 'codestral-latest',
    // IBM Granite
    'ibm-granite/granite-3.0-8b-instruct', 'ibm-granite/granite-3.0-2b-instruct',
    // Cohere
    'command-r-plus', 'command-r',
    // DeepSeek
    'deepseek-chat', 'deepseek-coder', 'deepseek-reasoner',
  ]);

  const knownEmbeddingModelIds = new Set([
    // OpenAI
    'text-embedding-3-small', 'text-embedding-3-large', 'text-embedding-ada-002',
    // Google
    'text-embedding-005', 'text-embedding-004', 'text-multilingual-embedding-002',
    // Cohere
    'embed-english-v3.0', 'embed-multilingual-v3.0', 'embed-english-light-v3.0',
    // BAAI
    'BAAI/bge-large-en-v1.5', 'BAAI/bge-base-en-v1.5', 'BAAI/bge-small-en-v1.5',
    // Sentence Transformers
    'sentence-transformers/all-MiniLM-L6-v2', 'sentence-transformers/all-mpnet-base-v2',
    // Nomic
    'nomic-ai/nomic-embed-text-v1.5',
    // Mixedbread
    'mixedbread-ai/mxbai-embed-large-v1',
    // IBM Granite
    'ibm-granite/granite-embedding-125m-english',
    'ibm-granite/granite-embedding-107m-multilingual',
    'ibm-granite/granite-embedding-278m-multilingual',
    // Red Hat AI validated
    'RedHatAI/granite-embedding-english-r2',
    'RedHatAI/nomic-embed-text-v1.5',
    'RedHatAI/all-MiniLM-L6-v2',
    'RedHatAI/snowflake-arctic-embed-l-v2.0',
    'RedHatAI/embeddinggemma-300m',
    'RedHatAI/Qwen3-Embedding-8B',
  ]);

  const knownModelIds = new Set([...knownInferenceModelIds, ...knownEmbeddingModelIds]);

  const canTestConnection = !!(modelName.trim() && url.trim() && token.trim());

  const handleTestConnection = () => {
    setTestStatus('testing');
    const name = modelName.trim();
    const isRecognized = knownModelIds.has(name);
    setTimeout(() => {
      setTestStatus(isRecognized ? 'success' : 'error');
    }, 1500);
  };

  React.useEffect(() => {
    if (!isOpen) {
      setTestStatus('idle');
    }
  }, [isOpen]);

  React.useEffect(() => {
    setTestStatus('idle');
  }, [modelName, url, token]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      aria-labelledby="add-external-endpoint-modal-title"
      aria-describedby="add-external-endpoint-modal-body"
      ouiaId="AddAssetModal"
      className="pf-m-md"
      appendTo={document.body}
      id="add-asset-modal"
    >
      <ModalHeader
        title={displayNameRequired ? 'Create endpoint' : 'Register endpoint'}
        labelId="add-external-endpoint-modal-title"
      />
      <ModalBody id="add-external-endpoint-modal-body">
        <Alert
          variant="warning"
          isInline
          title="Keys and tokens you add are shared at the project level."
          style={{ marginBottom: '1rem' }}
          id="add-external-project-warning"
        >
          Anyone with access to this project can use them.
        </Alert>
        <Alert
          variant="info"
          isInline
          title={
            modelType === 'embedding'
              ? 'The endpoint must be compatible with the OpenAI embeddings API format.'
              : 'The endpoint must be compatible with the OpenAI chat/completions API format.'
          }
          style={{ marginBottom: '1rem' }}
          id="add-external-api-compat-warning"
        >
          {modelType === 'embedding'
            ? 'Most major providers (OpenAI, Gemini, and others) are supported. Embedding models convert text into numerical vectors for semantic search, RAG pipelines, and retrieval workflows.'
            : 'Most major providers are supported, including OpenAI, Gemini, and Anthropic. This is required for the playground and other features.'}
        </Alert>
        <Form>
          {!useBadgeModelType && (
            <FormGroup
              label="Model type"
              fieldId="add-external-model-type"
              isRequired
            >
              <Select
                id="add-external-model-type-select"
                isOpen={isModelTypeSelectOpen}
                selected={modelType}
                onSelect={(_event, value) => {
                  setModelType(value as ModelType);
                  setIsModelTypeSelectOpen(false);
                }}
                onOpenChange={setIsModelTypeSelectOpen}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsModelTypeSelectOpen(!isModelTypeSelectOpen)}
                    isExpanded={isModelTypeSelectOpen}
                    isFullWidth
                    id="add-external-model-type-toggle"
                  >
                    {modelType === 'inference' ? 'Inferencing model' : 'Embedding model'}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  <SelectOption value="inference" description="Chat, completion, and reasoning models">
                    Inferencing model
                  </SelectOption>
                  <SelectOption value="embedding" description="Text vectorization for RAG and retrieval">
                    Embedding model
                  </SelectOption>
                </SelectList>
              </Select>
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>
                    {modelType === 'inference'
                      ? 'Inferencing models generate text responses and are used in the Playground.'
                      : 'Embedding models convert text to vectors and are used in RAG pipelines.'}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            </FormGroup>
          )}

          <FormGroup
            label="Model ID"
            fieldId="add-external-model-name"
            isRequired
            labelHelp={
              <Popover
                triggerRef={modelNameLabelHelpRef}
                headerContent="Model ID (verbatim)"
                bodyContent={
                  <div>
                    {modelType === 'embedding'
                      ? <>Enter the exact embedding model identifier from your provider. Common examples:
                        <br /><br />
                        <strong>OpenAI:</strong> text-embedding-3-small, text-embedding-3-large<br />
                        <strong>Google:</strong> text-embedding-005<br />
                        <strong>Cohere:</strong> embed-english-v3.0, embed-multilingual-v3.0<br />
                        <strong>Open source:</strong> BAAI/bge-large-en-v1.5, nomic-ai/nomic-embed-text-v1.5
                        <br /><br />
                        This must match the provider&apos;s model ID exactly. Check your provider&apos;s API documentation for the correct identifier.</>
                      : <>Enter the exact model identifier from your provider (e.g. <strong>gpt-4o</strong>, <strong>claude-sonnet-4-20250514</strong>, <strong>meta-llama/Llama-3.1-8B-Instruct</strong>). This must match the provider&apos;s model ID exactly. You can usually find this in your provider&apos;s API documentation or model catalog.</>}
                  </div>
                }
              >
                <FormGroupLabelHelp ref={modelNameLabelHelpRef} aria-label="More info for model ID field" aria-describedby="add-external-model-name" />
              </Popover>
            }
          >
            <TextInput
              id="add-external-model-name"
              value={modelName}
              onChange={(_event, value) => setModelName(value)}
              placeholder={modelType === 'embedding'
                ? 'e.g. text-embedding-3-small, BAAI/bge-large-en-v1.5'
                : 'e.g. gpt-4o, meta-llama/Llama-3.1-8B-Instruct'}
              aria-label="Model ID"
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem>
                  The verbatim model ID from your provider. Must match exactly.
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>

          {useBadgeModelType && (
            <Checkbox
              id="add-external-embedding-checkbox"
              label="This is an embedding model"
              description="Embedding models convert text to vectors for semantic search and RAG pipelines."
              isChecked={modelType === 'embedding'}
              onChange={(_event, checked) => setModelType(checked ? 'embedding' : 'inference')}
            />
          )}

          <FormGroup
            label="Display name"
            fieldId="add-external-model-alias"
            isRequired={displayNameRequired}
            labelHelp={
              <Popover
                triggerRef={modelAliasLabelHelpRef}
                headerContent="Display name"
                bodyContent={
                  <div>
                    {displayNameRequired
                      ? <>A unique, descriptive name for this endpoint. For example, <strong>Customer Support GPT-4o</strong> or <strong>Code Review Claude</strong>. This helps distinguish multiple endpoints that use the same underlying model.</>
                      : modelType === 'embedding'
                      ? <>An optional friendly name shown in tables and selectors. For example, <strong>OpenAI Small Embeddings</strong> or <strong>BGE Large EN</strong>. If left blank, the model ID will be used.</>
                      : <>An optional friendly name shown in tables and selectors instead of the verbatim model ID. For example, you might name it <strong>Our GPT-4o</strong> or <strong>Team Llama</strong>. If left blank, the model ID will be used.</>}
                  </div>
                }
              >
                <FormGroupLabelHelp ref={modelAliasLabelHelpRef} aria-label="More info for display name field" aria-describedby="add-external-model-alias" />
              </Popover>
            }
          >
            <TextInput
              id="add-external-model-alias"
              value={modelAlias}
              onChange={(_event, value) => setModelAlias(value)}
              placeholder={displayNameRequired
                ? 'e.g. Customer Support GPT-4o, Code Review Claude'
                : modelType === 'embedding'
                ? 'e.g. OpenAI Small Embeddings, BGE Large EN'
                : 'e.g. Our GPT-4o, Team Llama'}
              aria-label="Display name"
              validated={isDuplicateName ? 'error' : displayNameRequired && !modelAlias.trim() ? 'warning' : 'default'}
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem
                  variant={isDuplicateName ? 'error' : displayNameRequired && !modelAlias.trim() ? 'warning' : 'default'}
                  icon={isDuplicateName ? <ExclamationCircleIcon /> : undefined}
                >
                  {isDuplicateName
                    ? `"${modelAlias.trim()}" is already in use. Each endpoint must have a unique display name.`
                    : displayNameRequired
                    ? 'Required. A unique name to identify this endpoint in the table.'
                    : 'Optional. A friendly display name for this model.'}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>

          {modelType === 'embedding' && (
            <FormGroup
              label="Embedding dimension"
              fieldId="add-external-embedding-dimension"
              isRequired
            >
              <TextInput
                id="add-external-embedding-dimension"
                value={embeddingDimension}
                onChange={(_event, value) => setEmbeddingDimension(value)}
                placeholder="e.g. 768, 1536, 3072"
                aria-label="Embedding dimension"
              />
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>
                    The output vector size for this embedding model.
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            </FormGroup>
          )}

          <FormGroup
            label="URL"
            fieldId="add-external-url"
            isRequired
            labelHelp={
              <Popover
                triggerRef={urlLabelHelpRef}
                headerContent="Endpoint URL"
                bodyContent={
                  <div>
                    The base URL of the API endpoint. For OpenAI, this is typically <strong>https://api.openai.com/v1</strong>. For other providers, check their API documentation for the correct base URL.
                  </div>
                }
              >
                <FormGroupLabelHelp ref={urlLabelHelpRef} aria-label="More info for URL field" aria-describedby="add-external-url" />
              </Popover>
            }
          >
            <TextInput
              id="add-external-url"
              value={url}
              onChange={(_event, value) => setUrl(value)}
              placeholder="e.g. https://api.openai.com/v1"
              type="url"
              aria-label="Endpoint URL"
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem>
                  The base URL of the provider&apos;s API (e.g. https://api.openai.com/v1).
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>

          <FormGroup
            label="Token"
            fieldId="add-external-token"
            isRequired
          >
            <TextInput
              id="add-external-token"
              value={token}
              onChange={(_event, value) => setToken(value)}
              placeholder="Your API key or token"
              type="password"
              aria-label="API key or token"
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem>
                  Your API key or the token for this endpoint.
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>

          <div style={{ paddingTop: '4px', paddingBottom: '12px' }}>
            <Split hasGutter>
              <SplitItem>
                <Button
                  variant="secondary"
                  onClick={handleTestConnection}
                  isDisabled={!canTestConnection || testStatus === 'testing'}
                  isLoading={testStatus === 'testing'}
                  id="add-external-verify-model"
                  icon={testStatus === 'testing' ? <SyncAltIcon /> : undefined}
                >
                  {testStatus === 'testing' ? 'Verifying...' : 'Verify model'}
                </Button>
              </SplitItem>
              <SplitItem isFilled>
                {testStatus === 'success' && (
                  <HelperText>
                    <HelperTextItem
                      variant="success"
                      icon={<CheckCircleIcon />}
                    >
                      Model verified — ready to use.
                    </HelperTextItem>
                  </HelperText>
                )}
                {testStatus === 'error' && (
                  <HelperText>
                    <HelperTextItem
                      variant="error"
                      icon={<ExclamationCircleIcon />}
                    >
                      Model not found. Check that the ID matches your provider&apos;s model ID exactly.
                    </HelperTextItem>
                  </HelperText>
                )}
              </SplitItem>
            </Split>
            {testStatus === 'idle' && canTestConnection && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>
                    Check that the model ID is recognized by the provider before creating.
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </div>

          <FormGroup
            label="Use case"
            fieldId="add-external-use-case"
          >
            <TextInput
              id="add-external-use-case"
              value={useCase}
              onChange={(_event, value) => setUseCase(value)}
              placeholder={modelType === 'embedding'
                ? 'e.g. Document search, Semantic similarity'
                : 'e.g. General chat, Code generation, Image analysis'}
              aria-label="Use case"
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem>
                  Optional. Helps others identify what this model is best suited for.
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          key="add"
          variant="primary"
          onClick={onSubmit}
          isDisabled={!isFormValid()}
          id="add-asset-submit-button"
        >
          {displayNameRequired ? 'Create' : 'Register'}
        </Button>
        <Button
          key="cancel"
          variant="link"
          onClick={onClose}
          id="add-asset-cancel-button"
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
