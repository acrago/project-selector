import React from 'react';
import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

interface YAMLFieldHelp {
  path: string;
  description: string;
  formField?: string;
  docLink?: string;
}

const yamlFieldHelp: YAMLFieldHelp[] = [
  {
    path: 'apiVersion',
    description: 'The API version of the Kubernetes resource. For InferenceService, this should be "serving.kserve.io/v1alpha1".',
    docLink: 'https://kserve.github.io/website/0.11/get_started/first_isvc/',
  },
  {
    path: 'kind',
    description: 'The type of Kubernetes resource. Must be "InferenceService" for model deployments.',
    docLink: 'https://kserve.github.io/website/0.11/get_started/first_isvc/',
  },
  {
    path: 'metadata.name',
    description: 'The name of the inference service. This will be used to identify your deployment in Kubernetes. Must be unique within the namespace.',
    formField: 'Model deployment name',
  },
  {
    path: 'metadata.namespace',
    description: 'The Kubernetes namespace where the inference service will be deployed. This is typically your project name and provides resource isolation.',
    formField: 'Project',
  },
  {
    path: 'metadata.labels.model-type',
    description: 'The type of model being deployed. Use "Generative AI model" for LLMs and multimodal models, or "Predictive model" for traditional ML models. This affects runtime selection and resource allocation.',
    formField: 'Model type',
  },
  {
    path: 'metadata.annotations.description',
    description: 'A human-readable description of the model deployment. Include model version, use case, or other identifying information.',
    formField: 'Description',
  },
  {
    path: 'spec.predictor.model.storageUri',
    description: 'The URI where model artifacts are stored. Supports S3 (s3://), PVC (pvc://), HTTP/HTTPS, and OCI registries. For large LLMs, ensure your storage backend has sufficient bandwidth to avoid slow cold starts.',
    formField: 'Model location',
    docLink: 'https://kserve.github.io/website/0.11/modelserving/storage/storage_uri/',
  },
  {
    path: 'spec.predictor.model.modelFormat.name',
    description: 'The format of the model. Common LLM formats include "huggingface" and "vllm". Traditional ML formats include "onnx", "pytorch", "tensorflow", and "sklearn". The format determines which serving runtime will be used.',
    formField: 'Model format',
  },
  {
    path: 'spec.predictor.runtime',
    description: 'The serving runtime for inference. For LLMs, use "vllm-runtime" (optimized for throughput with PagedAttention), "caikit-tgis-runtime" (IBM models), or "huggingface-runtime". Auto-selection chooses the best runtime based on model type and format.',
    formField: 'Serving runtime',
    docLink: 'https://kserve.github.io/website/0.11/modelserving/serving_runtime/',
  },
  {
    path: 'spec.predictor.replicas',
    description: 'Number of inference server replicas. For LLMs: 1 replica is typical due to high memory requirements. Multiple replicas increase throughput and availability but multiply resource consumption. Each replica loads the full model into memory.',
    formField: 'Number of replicas',
  },
  {
    path: 'spec.predictor.resources.requests.cpu',
    description: 'Minimum CPU cores guaranteed for each replica. For LLMs, this affects initialization time but not inference throughput (GPU-bound). Recommended: 4-8 cores for small models, 8-16 for large models.',
    formField: 'Hardware profile',
    docLink: 'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/',
  },
  {
    path: 'spec.predictor.resources.limits.cpu',
    description: 'Maximum CPU cores the container can use. Set 20-50% higher than requests to handle initialization spikes. CPU limits primarily affect model loading time, not LLM inference throughput.',
    formField: 'Hardware profile',
  },
  {
    path: 'spec.predictor.resources.requests.memory',
    description: 'Minimum memory guaranteed for each replica. Critical for LLMs: must accommodate model size + KV cache + overhead. Calculate as: (model_size_gb * 1.2) + (max_batch_size * max_tokens * 0.002). Insufficient memory causes OOM errors.',
    formField: 'Hardware profile',
    docLink: 'https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/',
  },
  {
    path: 'spec.predictor.resources.limits.memory',
    description: 'Maximum memory the container can use. For LLMs, set ~10-20% above requests to allow for memory spikes during concurrent requests. Too low causes OOM kills and request failures.',
    formField: 'Hardware profile',
  },
  {
    path: 'spec.predictor.resources.requests.nvidia.com/gpu',
    description: 'Number of GPUs to allocate. For LLMs, this is the primary throughput factor. 1 GPU: ~10-50 tokens/sec for 7B models. Multiple GPUs enable tensor parallelism for larger models or higher throughput. GPU memory must exceed model size.',
    formField: 'Hardware profile',
    docLink: 'https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/',
  },
  {
    path: 'spec.predictor.containers[0].env',
    description: 'Environment variables for runtime configuration. Common LLM settings: MAX_BATCH_SIZE (affects throughput vs latency), MAX_SEQUENCE_LENGTH (max tokens), TENSOR_PARALLEL_SIZE (GPUs for model sharding), TRUST_REMOTE_CODE (for custom models).',
    formField: 'Apply additional environment variables',
  },
  {
    path: 'spec.predictor.containers[0].args',
    description: 'Runtime arguments passed to the serving container. For vLLM: --max-model-len, --gpu-memory-utilization (0.9 = use 90% of GPU RAM for KV cache, increases throughput), --dtype (float16 or bfloat16 for memory efficiency).',
    formField: 'Include additional runtime arguments',
  },
  {
    path: 'spec.predictor.minReplicas',
    description: 'Minimum number of replicas for autoscaling. For LLMs, typically set to 1 to ensure availability. Setting to 0 enables scale-to-zero but causes cold start delays (1-5 minutes for large models).',
  },
  {
    path: 'spec.predictor.maxReplicas',
    description: 'Maximum number of replicas for autoscaling. For LLMs, consider GPU availability and cost. Each replica multiplies resource consumption. Use horizontal scaling cautiously with large models.',
  },
  {
    path: 'spec.predictor.scaleTarget',
    description: 'Target concurrency per replica before scaling. For LLMs: set to expected concurrent requests (typically 5-20). Lower values trigger earlier scaling but increase cost. Higher values increase latency under load.',
  },
  {
    path: 'spec.predictor.scaleMetric',
    description: 'Metric used for autoscaling decisions. Options: concurrency (requests in flight), rps (requests per second), cpu, memory. For LLMs, concurrency is most effective as it directly relates to queue depth.',
  },
  {
    path: 'spec.predictor.externalRoute',
    description: 'Whether to expose the inference service via an external route. When enabled, the service is accessible from outside the cluster. Required for external applications but may introduce security considerations.',
    formField: 'Make model deployment available through an external route',
  },
  {
    path: 'spec.predictor.tokenAuth',
    description: 'Whether to require token authentication for inference requests. When enabled, requests must include a valid authentication token. Recommended for production LLM deployments to control access and usage.',
    formField: 'Require token authentication',
  },
  {
    path: 'spec.predictor.timeout',
    description: 'Request timeout in seconds. For LLMs, set based on max_tokens and expected throughput. Example: (max_tokens / tokens_per_second) + 30. Default is often too low for long-form generation.',
  },
  {
    path: 'spec.predictor.containerConcurrency',
    description: 'Maximum number of concurrent requests per replica. For LLMs, this affects memory usage (KV cache grows with batch size) and latency. Higher values increase throughput but may cause OOM or slowdowns. Start with 10-20.',
  },
  {
    path: 'metadata.labels.ai-asset',
    description: 'Whether to make this deployment available as an AI asset that can be discovered and reused by other users. Enables sharing the inference endpoint within your organization.',
    formField: 'Make this deployment available as an AI asset',
  },
  {
    path: 'metadata.labels.ai-asset-tiers',
    description: 'Comma-separated list of tiers that can access this AI asset. Controls which users or groups can discover and use this model endpoint based on their tier membership.',
    formField: 'Tiers',
  },
];

/** Form group labels that have an entry in the YAML help drawer. Used to show help icons on form fields. */
export const FORM_FIELD_LABELS_WITH_YAML_HELP = new Set(
  yamlFieldHelp.filter((f) => f.formField).map((f) => f.formField as string)
);

/** Maps form group labels (used in wizard) to formField values in yamlFieldHelp for scroll-to-section. */
const FORM_GROUP_LABEL_TO_HELP_FORM_FIELD: Record<string, string> = {
  'Number of replicas to deploy': 'Number of replicas',
  'Model access': 'Make model deployment available through an external route',
  'Token authentication': 'Require token authentication',
  'Configuration parameters': 'Include additional runtime arguments',
  'Model availability': 'Make this deployment available as an AI asset',
};

function helpSectionId(path: string): string {
  return `help-section-${path.replace(/\./g, '-').replace(/[[\]]/g, '')}`;
}

interface YAMLHelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** When set, drawer scrolls to the first help section matching this form field label (after open). */
  scrollToFormField?: string;
  children?: React.ReactNode;
}

export const YAMLHelpDrawer: React.FunctionComponent<YAMLHelpDrawerProps> = ({
  isOpen,
  onClose,
  scrollToFormField,
  children,
}) => {
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const panelBodyRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen || !scrollToFormField || !panelBodyRef.current) return;
    const formFieldToScroll =
      FORM_GROUP_LABEL_TO_HELP_FORM_FIELD[scrollToFormField] ?? scrollToFormField;
    const firstMatchingIndex = yamlFieldHelp.findIndex(
      (f) => f.formField === formFieldToScroll
    );
    if (firstMatchingIndex === -1) return;
    const path = yamlFieldHelp[firstMatchingIndex].path;
    const id = helpSectionId(path);
    const scrollAfterPaint = () => {
      const el = panelBodyRef.current?.querySelector(`#${CSS.escape(id)}`);
      if (el) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    };
    const timeoutId = window.setTimeout(scrollAfterPaint, 150);
    return () => window.clearTimeout(timeoutId);
  }, [isOpen, scrollToFormField]);

  const panelContent = (
    <DrawerPanelContent
      widths={{ default: 'width_33' }}
      minSize="300px"
      defaultSize="400px"
      maxSize="600px"
      isResizable
    >
      <DrawerHead>
        <div tabIndex={isOpen ? 0 : -1} ref={drawerRef}>
          <Title headingLevel="h3" size="lg">
            Help with YAML
          </Title>
        </div>
        <DrawerActions>
          <DrawerCloseButton onClick={onClose} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody style={{ overflowY: 'auto', padding: 'var(--pf-v5-global--spacer--md)' }}>
        <div ref={panelBodyRef}>
        <Stack hasGutter>
          <StackItem>
            <p style={{ 
              marginBottom: 0, 
              color: 'var(--pf-v5-global--Color--200)',
              fontSize: 'var(--pf-v5-global--FontSize--sm)',
              paddingLeft: '16px'
            }}>
              The following fields can be configured through the form or directly in YAML. Changes in one view are automatically synchronized to the other.
            </p>
          </StackItem>
          <StackItem>
            <Divider />
          </StackItem>
          <StackItem style={{ paddingLeft: '16px' }}>
            <Card isCompact>
              <CardBody style={{ paddingTop: '8px' }}>
                <p style={{ 
                  marginBottom: 0, 
                  color: 'var(--pf-v5-global--Color--200)', 
                  fontSize: 'var(--pf-v5-global--FontSize--sm)'
                }}>
                  <strong>For LLM deployments:</strong> Pay special attention to resource limits (memory, GPU), serving runtime selection, and environment variables. These directly impact model throughput, latency, and reliability.
                </p>
              </CardBody>
            </Card>
          </StackItem>
          <StackItem style={{ paddingLeft: '16px' }}>
            <Stack hasGutter>
              {yamlFieldHelp.map((field, index) => (
                <StackItem key={index} id={helpSectionId(field.path)}>
                  <Card isCompact>
                    <CardBody style={{ paddingTop: '8px' }}>
                      <DescriptionList isCompact isHorizontal columnModifier={{ default: '1Col' }}>
                        <DescriptionListGroup>
                          <DescriptionListTerm style={{ 
                            fontSize: 'var(--pf-v5-global--FontSize--sm)',
                            fontWeight: 'var(--pf-v5-global--FontWeight--bold)'
                          }}>
                            <code style={{ 
                              fontSize: 'var(--pf-v5-global--FontSize--sm)', 
                              backgroundColor: 'var(--pf-v5-global--BackgroundColor--200)', 
                              padding: 'var(--pf-v5-global--spacer--xs) var(--pf-v5-global--spacer--sm)', 
                              borderRadius: 'var(--pf-v5-global--BorderRadius--sm)',
                              fontFamily: 'var(--pf-v5-global--FontFamily--monospace)',
                              color: 'var(--pf-v5-global--Color--100)'
                            }}>
                              {field.path}
                            </code>
                            {field.formField && (
                              <div style={{ 
                                marginTop: 'var(--pf-v5-global--spacer--xs)', 
                                color: 'var(--pf-v5-global--Color--200)', 
                                fontSize: 'var(--pf-v5-global--FontSize--xs)'
                              }}>
                                Form field: <strong>{field.formField}</strong>
                              </div>
                            )}
                          </DescriptionListTerm>
                          <DescriptionListDescription>
                            <div style={{ 
                              marginBottom: field.docLink ? 'var(--pf-v5-global--spacer--sm)' : 0, 
                              fontSize: 'var(--pf-v5-global--FontSize--sm)',
                              lineHeight: 'var(--pf-v5-global--LineHeight--md)'
                            }}>
                              {field.description}
                            </div>
                            {field.docLink && (
                              <a
                                href={field.docLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: 'var(--pf-v5-global--spacer--xs)', 
                                  fontSize: 'var(--pf-v5-global--FontSize--sm)',
                                  color: 'var(--pf-v5-global--link--Color)'
                                }}
                              >
                                Learn more <ExternalLinkAltIcon style={{ fontSize: 'var(--pf-v5-global--FontSize--xs)' }} />
                              </a>
                            )}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      </DescriptionList>
                    </CardBody>
                  </Card>
                </StackItem>
              ))}
            </Stack>
          </StackItem>
        </Stack>
        </div>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <Drawer isExpanded={isOpen} isInline position="right">
      <DrawerContent panelContent={panelContent}>
        <DrawerContentBody>
          {children}
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};
