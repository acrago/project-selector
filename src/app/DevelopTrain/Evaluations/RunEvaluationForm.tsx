import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Checkbox,
  Content,
  ContentVariants,
  FileUpload,
  FileUploadHelperText,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormGroupLabelHelp,
  FormHelperText,
  HelperText,
  HelperTextItem,
  MenuToggle,
  PageSection,
  Popover,
  Radio,
  Select,
  SelectList,
  SelectOption,
  TextInput,
} from '@patternfly/react-core';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { DropEvent } from '@patternfly/react-core/dist/esm/helpers/typeUtils';

interface RunContext {
  runType: 'benchmark' | 'collection';
  item: { title: string };
}

const RunEvaluationForm: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const runContext = location.state as RunContext | null;

  const [evaluationName, setEvaluationName] = React.useState('');
  const [assetName, setAssetName] = React.useState('');
  const [inputType, setInputType] = React.useState<'endpoint' | 'offline'>('endpoint');
  const [endpoint, setEndpoint] = React.useState('');
  const [apiKey, setApiKey] = React.useState('');
  const [offlineUri, setOfflineUri] = React.useState('');
  const [sourceName, setSourceName] = React.useState('');
  const [showAdditionalArguments, setShowAdditionalArguments] = React.useState(false);
  const [jsonFilename, setJsonFilename] = React.useState('');
  const [jsonContent, setJsonContent] = React.useState('');
  const [mlflowOption, setMlflowOption] = React.useState<'existing' | 'new'>('existing');
  const [selectedExperiment, setSelectedExperiment] = React.useState<string>('EvalHub(default)');
  const [isExperimentSelectOpen, setIsExperimentSelectOpen] = React.useState(false);
  const [newExperimentName, setNewExperimentName] = React.useState('');
  const [validated, setValidated] = React.useState(false);
  const [evaluationNameError, setEvaluationNameError] = React.useState('');
  const [assetNameError, setAssetNameError] = React.useState('');
  const [endpointError, setEndpointError] = React.useState('');
  const [offlineUriError, setOfflineUriError] = React.useState('');
  const [sourceNameError, setSourceNameError] = React.useState('');

  const evaluationNameInputRef = React.useRef<HTMLInputElement>(null);
  const mlflowHelpRef = React.useRef<HTMLButtonElement>(null);
  const assetNameHelpRef = React.useRef<HTMLButtonElement>(null);
  const additionalArgsHelpRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (runContext && evaluationNameInputRef.current) {
      evaluationNameInputRef.current.focus();
    }
  }, [runContext]);

  React.useEffect(() => {
    if (runContext) {
      const now = new Date();
      const formattedDate = now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      setEvaluationName(formattedDate);
    }
  }, [runContext]);

  const handleFileChange = (_event: DropEvent, file: File) => {
    setJsonFilename(file.name);
  };

  const handleJsonDataChange = (_event: DropEvent, data: string) => {
    setJsonContent(data);
  };

  const handleFileClear = () => {
    setJsonFilename('');
    setJsonContent('');
  };

  const handleSubmit = () => {
    setValidated(true);

    let hasErrors = false;
    if (!evaluationName.trim()) {
      setEvaluationNameError('Evaluation name is required');
      hasErrors = true;
    } else {
      setEvaluationNameError('');
    }

    if (inputType === 'endpoint') {
      if (!assetName.trim()) {
        setAssetNameError('Model or agent name is required');
        hasErrors = true;
      } else {
        setAssetNameError('');
      }
      if (!endpoint.trim()) {
        setEndpointError('Endpoint URL is required');
        hasErrors = true;
      } else {
        setEndpointError('');
      }
      setOfflineUriError('');
    } else {
      setAssetNameError('');
      if (!sourceName.trim()) {
        setSourceNameError('Source name is required');
        hasErrors = true;
      } else {
        setSourceNameError('');
      }
      if (!offlineUri.trim()) {
        setOfflineUriError('Dataset URL is required');
        hasErrors = true;
      } else {
        setOfflineUriError('');
      }
      setEndpointError('');
    }

    if (hasErrors || !runContext) {
      return;
    }

    const evaluated =
      inputType === 'endpoint'
        ? assetName.trim() || endpoint.trim()
        : sourceName.trim() || offlineUri.trim();
    const isBenchmark = runContext.runType === 'benchmark';
    const steps = isBenchmark
      ? [
          { name: 'Initializing evaluation', status: 'pending' as const },
          { name: 'Loading model', status: 'pending' as const },
          { name: 'Running benchmark', status: 'pending' as const },
          { name: 'Generating report', status: 'pending' as const },
        ]
      : [
          { name: 'Initializing evaluation', status: 'pending' as const },
          { name: 'Loading model', status: 'pending' as const },
          { name: 'Running benchmarks', status: 'pending' as const },
          { name: 'Analyzing results', status: 'pending' as const },
          { name: 'Generating report', status: 'pending' as const },
          { name: 'Finalizing', status: 'pending' as const },
        ];

    const newEvaluation = {
      id: Date.now().toString(),
      name: evaluationName,
      type: isBenchmark ? ('Benchmark' as const) : ('Collection' as const),
      evaluated,
      collectionOrBenchmark: runContext.item.title,
      endpointUrl: inputType === 'endpoint' ? endpoint.trim() : '',
      status: 'Running' as const,
      result: '--',
      dateRan: new Date(),
      progressStep: 'Scheduled',
      detailedProgress: {
        currentStep: 0,
        totalSteps: steps.length,
        elapsedTime: 0,
        steps: steps,
      },
    };

    navigate('/develop-train/evaluations', { state: { newEvaluation } });
  };

  React.useEffect(() => {
    if (!runContext) {
      navigate('/develop-train/evaluations');
    }
  }, [runContext, navigate]);

  if (!runContext) {
    return null;
  }

  const pageTitle = 'Start evaluation run';
  const breadcrumbParent = runContext.runType === 'benchmark' ? 'Benchmarks' : 'Collections';
  const breadcrumbParentPath = runContext.runType === 'benchmark'
    ? '/develop-train/evaluations/benchmarks'
    : '/develop-train/evaluations/collections';

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Breadcrumb id="run-evaluation-breadcrumb">
          <BreadcrumbItem>
            <Link to="/develop-train/evaluations">Evaluation</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to="/develop-train/evaluations/new">New Evaluation</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to={breadcrumbParentPath}>{breadcrumbParent}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{runContext.item.title}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection hasBodyWrapper={false} style={{ paddingBottom: '8px', rowGap: 0 }}>
        <Content component={ContentVariants.h1} style={{ marginBottom: '4px' }}>
          {pageTitle}
        </Content>
        <Content component={ContentVariants.p} style={{ fontWeight: 600, marginTop: '8px', paddingBottom: 0, marginBottom: 0 }}>
          {runContext.runType === 'benchmark' ? 'Benchmark name' : 'Benchmark suite name'}
        </Content>
        <Content component={ContentVariants.p} style={{ marginTop: '4px' }}>
          {runContext.item.title}
        </Content>
      </PageSection>
      <PageSection hasBodyWrapper={false}>
        <Form id="run-evaluation-form" style={{ maxWidth: '688px' }}>
          <FormGroup label="Evaluation name" isRequired fieldId="evaluation-name">
            <TextInput
              ref={evaluationNameInputRef}
              isRequired
              type="text"
              id="evaluation-name"
              name="evaluation-name"
              value={evaluationName}
              onChange={(_event, value) => {
                setEvaluationName(value);
                if (validated && value.trim()) {
                  setEvaluationNameError('');
                }
              }}
              placeholder="Enter evaluation name"
              validated={validated && evaluationNameError ? 'error' : 'default'}
            />
            {validated && evaluationNameError && (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant="error">{evaluationNameError}</HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>

          <FormGroup
            label="MLFlow Experiment"
            isRequired
            fieldId="mlflow-experiment"
            labelHelp={
              <Popover
                id="mlflow-help-popover"
                triggerRef={mlflowHelpRef}
                headerContent="MLFlow Experiment"
                bodyContent="Select an existing MLFlow experiment to log this evaluation run to, or create a new one."
              >
                <FormGroupLabelHelp
                  ref={mlflowHelpRef}
                  aria-label="More info for MLFlow experiment"
                  aria-describedby="mlflow-experiment"
                />
              </Popover>
            }
          >
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
              <FlexItem>
                <Radio
                  isChecked={mlflowOption === 'existing'}
                  name="mlflow-option"
                  onChange={() => setMlflowOption('existing')}
                  label="Add to an existing experiment"
                  id="mlflow-option-existing"
                />
              </FlexItem>
              {mlflowOption === 'existing' && (
                <FlexItem style={{ marginLeft: '24px' }}>
                  <Select
                    id="mlflow-experiment-select"
                    isOpen={isExperimentSelectOpen}
                    selected={selectedExperiment}
                    onSelect={(_event, value) => {
                      setSelectedExperiment(value as string);
                      setIsExperimentSelectOpen(false);
                    }}
                    onOpenChange={(isOpen) => setIsExperimentSelectOpen(isOpen)}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => setIsExperimentSelectOpen(!isExperimentSelectOpen)}
                        isExpanded={isExperimentSelectOpen}
                        isFullWidth
                        id="mlflow-experiment-toggle"
                      >
                        {selectedExperiment}
                      </MenuToggle>
                    )}
                  >
                    <SelectList>
                      <SelectOption value="EvalHub(default)">EvalHub(default)</SelectOption>
                      <SelectOption value="Safety benchmarks">Safety benchmarks</SelectOption>
                      <SelectOption value="Model comparison Q1">Model comparison Q1</SelectOption>
                      <SelectOption value="Healthcare evals">Healthcare evals</SelectOption>
                    </SelectList>
                  </Select>
                </FlexItem>
              )}
              <FlexItem>
                <Radio
                  isChecked={mlflowOption === 'new'}
                  name="mlflow-option"
                  onChange={() => setMlflowOption('new')}
                  label="Create new experiment"
                  id="mlflow-option-new"
                />
              </FlexItem>
              {mlflowOption === 'new' && (
                <FlexItem style={{ marginLeft: '24px' }}>
                  <TextInput
                    type="text"
                    id="mlflow-new-experiment-name"
                    name="mlflow-new-experiment-name"
                    value={newExperimentName}
                    onChange={(_event, value) => setNewExperimentName(value)}
                    placeholder="Enter experiment name"
                  />
                </FlexItem>
              )}
            </Flex>
          </FormGroup>

          <FormGroup label="Source" isRequired fieldId="input-source">
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
              <FlexItem>
                <Radio
                  isChecked={inputType === 'endpoint'}
                  name="input-type"
                  onChange={() => setInputType('endpoint')}
                  label="Inference endpoint"
                  id="input-type-endpoint"
                />
              </FlexItem>
              {inputType === 'endpoint' && (
                <FlexItem style={{ marginLeft: '24px' }}>
                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
                    <FlexItem>
                      <FormGroup
                        label="Model or agent name"
                        isRequired
                        fieldId="asset-name"
                        labelHelp={
                          <Popover
                            id="asset-name-help-popover"
                            triggerRef={assetNameHelpRef}
                            headerContent="Model or agent name"
                            bodyContent="The name must be an exact match."
                          >
                            <FormGroupLabelHelp
                              ref={assetNameHelpRef}
                              aria-label="More info for model or agent name"
                              aria-describedby="asset-name"
                            />
                          </Popover>
                        }
                      >
                        <TextInput
                          isRequired
                          type="text"
                          id="asset-name"
                          name="asset-name"
                          value={assetName}
                          onChange={(_event, value) => {
                            setAssetName(value);
                            if (validated && value.trim()) {
                              setAssetNameError('');
                            }
                          }}
                          validated={validated && assetNameError ? 'error' : 'default'}
                        />
                        <FormHelperText>
                          <HelperText>
                            <HelperTextItem variant={validated && assetNameError ? 'error' : 'default'}>
                              {validated && assetNameError ? assetNameError : 'The verbatim model or agent name from the deployment. Must match exactly.'}
                            </HelperTextItem>
                          </HelperText>
                        </FormHelperText>
                      </FormGroup>
                    </FlexItem>
                    <FlexItem>
                      <FormGroup label="Endpoint URL" isRequired fieldId="endpoint-url">
                        <TextInput
                          isRequired
                          type="text"
                          id="endpoint-url"
                          name="endpoint-url"
                          value={endpoint}
                          onChange={(_event, value) => {
                            setEndpoint(value);
                            if (validated && value.trim()) {
                              setEndpointError('');
                            }
                          }}
                          placeholder="https://api.example.com/v1/model"
                          validated={validated && endpointError ? 'error' : 'default'}
                        />
                        {validated && endpointError && (
                          <FormHelperText>
                            <HelperText>
                              <HelperTextItem variant="error">{endpointError}</HelperTextItem>
                            </HelperText>
                          </FormHelperText>
                        )}
                      </FormGroup>
                    </FlexItem>
                    <FlexItem>
                      <FormGroup label="API key" fieldId="api-key">
                        <TextInput
                          type="password"
                          id="api-key"
                          name="api-key"
                          value={apiKey}
                          onChange={(_event, value) => setApiKey(value)}
                        />
                      </FormGroup>
                    </FlexItem>
                  </Flex>
                </FlexItem>
              )}
              <FlexItem>
                <Radio
                  isChecked={inputType === 'offline'}
                  name="input-type"
                  onChange={() => setInputType('offline')}
                  label="Pre-recorded responses"
                  id="input-type-offline"
                />
              </FlexItem>
              {inputType === 'offline' && (
                <FlexItem style={{ marginLeft: '24px' }}>
                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
                    <FormGroup label="Source name" isRequired fieldId="source-name">
                    <TextInput
                      isRequired
                      type="text"
                      id="source-name"
                      name="source-name"
                      value={sourceName}
                      onChange={(_event, value) => {
                        setSourceName(value);
                        if (validated && value.trim()) {
                          setSourceNameError('');
                        }
                      }}
                      validated={validated && sourceNameError ? 'error' : 'default'}
                    />
                    {validated && sourceNameError && (
                      <FormHelperText>
                        <HelperText>
                          <HelperTextItem variant="error">{sourceNameError}</HelperTextItem>
                        </HelperText>
                      </FormHelperText>
                    )}
                    </FormGroup>
                    <FormGroup label="Dataset URL" isRequired fieldId="offline-uri">
                    <TextInput
                      isRequired
                      type="text"
                      id="offline-uri"
                      name="offline-uri"
                      value={offlineUri}
                      onChange={(_event, value) => {
                        setOfflineUri(value);
                        if (validated && value.trim()) {
                          setOfflineUriError('');
                        }
                      }}
                      placeholder="s3://bucket-name/path"
                      validated={validated && offlineUriError ? 'error' : 'default'}
                    />
                    {validated && offlineUriError && (
                      <FormHelperText>
                        <HelperText>
                          <HelperTextItem variant="error">{offlineUriError}</HelperTextItem>
                        </HelperText>
                      </FormHelperText>
                    )}
                    </FormGroup>
                    <FormGroup label="Access token" fieldId="s3-token">
                    <TextInput
                      type="password"
                      id="s3-token"
                      name="s3-token"
                    />
                    </FormGroup>
                  </Flex>
                </FlexItem>
              )}
            </Flex>
          </FormGroup>

          <div style={{ marginTop: '16px' }}>
            <FormGroup fieldId="add-additional-args">
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
              <FlexItem>
                <Checkbox
                  id="add-additional-args"
                  label="Add additional arguments"
                  isChecked={showAdditionalArguments}
                  onChange={(_event, checked) => setShowAdditionalArguments(checked)}
                />
              </FlexItem>
              <FlexItem>
                <Popover
                  id="additional-args-help-popover"
                  triggerRef={additionalArgsHelpRef}
                  headerContent="Additional arguments"
                  bodyContent="Upload a JSON file containing custom arguments for this evaluation run."
                >
                  <FormGroupLabelHelp
                    ref={additionalArgsHelpRef}
                    aria-label="More info for additional arguments"
                    aria-describedby="add-additional-args"
                  />
                </Popover>
              </FlexItem>
            </Flex>
            {showAdditionalArguments && (
              <div style={{ marginTop: '16px' }}>
                <FileUpload
                  id="json-upload"
                  type="text"
                  value={jsonContent}
                  filename={jsonFilename}
                  filenamePlaceholder="Drag and drop a file or upload"
                  onFileInputChange={handleFileChange}
                  onDataChange={handleJsonDataChange}
                  onClearClick={handleFileClear}
                  browseButtonText="Upload"
                  clearButtonText="Clear"
                  accept=".json"
                >
                  <FileUploadHelperText>
                    <HelperText>
                      <HelperTextItem>Upload a JSON file containing custom arguments for this evaluation run.</HelperTextItem>
                    </HelperText>
                  </FileUploadHelperText>
                </FileUpload>
              </div>
            )}
          </FormGroup>
          </div>

          <Flex spaceItems={{ default: 'spaceItemsMd' }} style={{ marginTop: '24px' }}>
            <FlexItem>
              <Button variant="primary" onClick={handleSubmit} id="run-evaluation-submit">
                Start evaluation run
              </Button>
            </FlexItem>
            <FlexItem>
              <Button variant="link" onClick={() => navigate(breadcrumbParentPath)} id="run-evaluation-cancel">
                Cancel
              </Button>
            </FlexItem>
          </Flex>
        </Form>
      </PageSection>
    </>
  );
};

export { RunEvaluationForm };
