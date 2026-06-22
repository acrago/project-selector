import * as yaml from 'js-yaml';
import { useCallback, useEffect, useRef } from 'react';
import { UnmappedField, extractUnmappedFields, parseYAML } from './yamlParser';

export interface WizardData {
  // Step 1: Source model
  modelLocation: string;
  connectionName: string;
  modelUri: string;
  createConnection: boolean;
  connectionNameNew: string;
  connectionDescription: string;
  accessType: string;
  secretDetails: string;
  registryUri: string;
  accessKey: string;
  secretKey: string;
  endpoint: string;
  region: string;
  bucket: string;
  clusterStorageName: string;
  modelPath: string;
  modelType: string;

  // Step 2: Model deployment
  project: string;
  modelDeploymentName: string;
  description: string;
  hardwareProfile: string;
  modelFormat: string;
  servingRuntimeOption: string;
  servingRuntime: string;
  numberOfReplicas: number;

  // Step 3: Advanced settings
  makeAvailableExternal: boolean;
  requireTokenAuth: boolean;
  includeRuntimeArgs: boolean;
  applyEnvVars: boolean;
  makeAvailableAsAIAsset: boolean;
  makeAvailableGlobally: boolean;
  selectedTiers: string[];
  customTierNames: string;
  useLegacyMode: boolean;
  llmdEnabled: string;
  publishAsAIAssetEndpoint: boolean;
  publishAsMaaS: boolean;
  gatewaySelection: string;
}

/**
 * Convert form data to Kubernetes InferenceService YAML structure
 */
export function formDataToYAML(wizardData: WizardData): string {
  // Determine storage URI based on model location
  let storageUri = '';
  if (wizardData.modelLocation === 'URI') {
    storageUri = wizardData.modelUri || '';
  } else if (wizardData.modelLocation === 'Existing connection') {
    storageUri = `connection://${wizardData.connectionName}`;
  } else if (wizardData.modelLocation === 'Cluster storage') {
    storageUri = `pvc://${wizardData.clusterStorageName}${wizardData.modelPath || ''}`;
  } else if (wizardData.modelLocation === 'OCI compliant registry') {
    storageUri = wizardData.registryUri || '';
  } else if (wizardData.modelLocation === 'S3 object storage') {
    storageUri = `s3://${wizardData.bucket}`;
  } else if (wizardData.modelLocation === 'NVIDIA NIM catalog') {
    storageUri = 'nim://nvidia-nim-catalog';
  }

  // Determine serving runtime
  const runtime =
    wizardData.servingRuntimeOption === 'auto' ? 'OpenVINO Model Server' : wizardData.servingRuntime || '';

  // Build the YAML structure with all fields included as a complete template
  const yamlObj: any = {
    apiVersion: 'serving.kserve.io/v1alpha1',
    kind: 'InferenceService',
    metadata: {
      name: wizardData.modelDeploymentName || 'model-deployment',
      namespace: wizardData.project || 'default',
      labels: {
        'model-type': wizardData.modelType || '',
        'ai-asset': wizardData.makeAvailableAsAIAsset ? 'true' : 'false',
        'global': wizardData.makeAvailableGlobally ? 'true' : 'false',
        'tiers': (wizardData.selectedTiers && wizardData.selectedTiers.length > 0) 
          ? wizardData.selectedTiers.join(',') 
          : '',
      },
      annotations: {
        description: wizardData.description || '',
        'custom-tiers': wizardData.customTierNames || '',
      },
    },
    spec: {
      predictor: {
        model: {
          storageUri: storageUri || '',
        },
        replicas: wizardData.numberOfReplicas || 1,
        runtime: runtime || '',
        externalRoute: wizardData.makeAvailableExternal || false,
        tokenAuth: wizardData.requireTokenAuth || false,
      },
    },
  };

  // Always include model format (even if empty)
  if (wizardData.modelFormat) {
    yamlObj.spec.predictor.model.modelFormat = {
      name: wizardData.modelFormat,
    };
  }

  // Always include hardware profile as resources (even if empty)
  if (wizardData.hardwareProfile) {
    yamlObj.spec.predictor.resources = {
      requests: {
        cpu: wizardData.hardwareProfile === 'default' ? '1' : wizardData.hardwareProfile.toLowerCase(),
      },
    };
  }

  // Always include runtime arguments (empty array if checkbox is checked)
  if (wizardData.includeRuntimeArgs) {
    yamlObj.spec.predictor.runtimeArgs = [];
  }

  // Always include environment variables (empty array if checkbox is checked)
  if (wizardData.applyEnvVars) {
    yamlObj.spec.predictor.env = [];
  }

  return yaml.dump(yamlObj, { indent: 2, lineWidth: -1 });
}

/** LLMD runtime display name used to trigger LLMInferenceService template generation */
export const LLMD_SERVING_RUNTIME_VALUE = 'Distributed inference with llm-d';

/**
 * Convert form data to LLMInferenceService YAML (for Distributed inference with llm-d).
 * Used when deployment wizard YAML viewer is enabled and user selects LLMD runtime.
 */
export function formDataToLLMInferenceServiceYAML(wizardData: WizardData): string {
  const name = wizardData.modelDeploymentName || 'model-deployment';
  const namespace = wizardData.project || 'default';
  const modelType = (wizardData.modelType || '').toLowerCase().includes('generative') ? 'generative' : 'predictive';
  const connectionUri =
    wizardData.modelLocation === 'Existing connection' && wizardData.connectionName
      ? wizardData.connectionName
      : wizardData.modelUri || '';

  const yamlObj: Record<string, unknown> = {
    apiVersion: 'serving.kserve.io/v1alpha1',
    kind: 'LLMInferenceService',
    metadata: {
      name,
      namespace,
      annotations: {
        'openshift.io/display-name': name,
        'opendatahub.io/model-type': modelType,
        'opendatahub.io/connections': connectionUri || '',
        'opendatahub.io/hardware-profile-name': 'cypress-llmd-hardware-profile-model',
        'opendatahub.io/hardware-profile-namespace': 'opendatahub',
        'opendatahub.io/hardware-profile-resource-version': '16697227',
      },
      labels: {
        'opendatahub.io/dashboard': 'true',
      },
    },
    spec: {
      model: {
        uri: connectionUri ? '' : (wizardData.modelUri || ''),
        name,
      },
      replicas: wizardData.numberOfReplicas || 1,
      router: {
        scheduler: {},
        route: [],
        gateway: {},
      },
      template: {
        containers: [
          {
            name: 'main',
            resources: {
              requests: { cpu: '1', memory: '8Gi' },
              limits: { cpu: '1', memory: '8Gi' },
            },
          },
        ],
      },
    },
  };

  return yaml.dump(yamlObj, { indent: 2, lineWidth: -1 });
}

/**
 * Parse YAML and extract form-mappable fields
 */
export function yamlToFormData(
  yamlString: string,
  _currentWizardData: WizardData
): {
  formUpdates: Partial<WizardData>;
  unmappedFields: UnmappedField[];
} {
  const result = parseYAML(yamlString);
  
  if (!result.data) {
    return { formUpdates: {}, unmappedFields: [] };
  }

  const yamlObj = result.data;
  const formUpdates: Partial<WizardData> = {};
  const formFieldMap = new Map<string, string>([
    ['metadata.name', 'modelDeploymentName'],
    ['metadata.namespace', 'project'],
    ['metadata.labels.model-type', 'modelType'],
    ['metadata.annotations.description', 'description'],
    ['spec.predictor.model.storageUri', 'modelUri'],
    ['spec.predictor.model.modelFormat.name', 'modelFormat'],
    ['spec.predictor.runtime', 'servingRuntime'],
    ['spec.predictor.replicas', 'numberOfReplicas'],
    ['spec.predictor.resources.requests.cpu', 'hardwareProfile'],
    ['spec.predictor.externalRoute', 'makeAvailableExternal'],
    ['spec.predictor.tokenAuth', 'requireTokenAuth'],
    ['metadata.labels.ai-asset', 'makeAvailableAsAIAsset'],
  ]);

  // Extract mapped fields
  if (yamlObj.metadata?.name) {
    formUpdates.modelDeploymentName = yamlObj.metadata.name;
  }

  // Project is read-only - don't update from YAML
  // if (yamlObj.metadata?.namespace) {
  //   formUpdates.project = yamlObj.metadata.namespace;
  // }

  if (yamlObj.metadata?.labels?.['model-type']) {
    formUpdates.modelType = yamlObj.metadata.labels['model-type'];
  }

  if (yamlObj.metadata?.annotations?.description) {
    formUpdates.description = yamlObj.metadata.annotations.description;
  }

  if (yamlObj.spec?.predictor?.model?.storageUri) {
    const storageUri = yamlObj.spec.predictor.model.storageUri;
    if (storageUri.startsWith('connection://')) {
      formUpdates.modelLocation = 'Existing connection';
      formUpdates.connectionName = storageUri.replace('connection://', '');
    } else if (storageUri.startsWith('pvc://')) {
      formUpdates.modelLocation = 'Cluster storage';
      const parts = storageUri.replace('pvc://', '').split('/');
      formUpdates.clusterStorageName = parts[0] || '';
      formUpdates.modelPath = parts.slice(1).join('/') || '';
    } else if (storageUri.startsWith('s3://')) {
      formUpdates.modelLocation = 'S3 object storage';
      formUpdates.bucket = storageUri.replace('s3://', '');
    } else {
      formUpdates.modelLocation = 'URI';
      formUpdates.modelUri = storageUri;
    }
  }

  if (yamlObj.spec?.predictor?.model?.modelFormat?.name) {
    formUpdates.modelFormat = yamlObj.spec.predictor.model.modelFormat.name;
  }

  if (yamlObj.spec?.predictor?.runtime) {
    formUpdates.servingRuntime = yamlObj.spec.predictor.runtime;
    formUpdates.servingRuntimeOption = 'manual';
  }

  if (yamlObj.spec?.predictor?.replicas !== undefined) {
    formUpdates.numberOfReplicas = yamlObj.spec.predictor.replicas;
  }

  if (yamlObj.spec?.predictor?.resources?.requests?.cpu) {
    const cpu = yamlObj.spec.predictor.resources.requests.cpu;
    formUpdates.hardwareProfile = cpu === '1' ? 'default' : cpu.charAt(0).toUpperCase() + cpu.slice(1);
  }

  if (yamlObj.spec?.predictor?.externalRoute !== undefined) {
    formUpdates.makeAvailableExternal = yamlObj.spec.predictor.externalRoute === true;
  }

  if (yamlObj.spec?.predictor?.tokenAuth !== undefined) {
    formUpdates.requireTokenAuth = yamlObj.spec.predictor.tokenAuth === true;
  }

  if (yamlObj.spec?.predictor?.runtimeArgs !== undefined) {
    formUpdates.includeRuntimeArgs = Array.isArray(yamlObj.spec.predictor.runtimeArgs) && yamlObj.spec.predictor.runtimeArgs.length > 0;
  }

  if (yamlObj.spec?.predictor?.env !== undefined) {
    formUpdates.applyEnvVars = Array.isArray(yamlObj.spec.predictor.env) && yamlObj.spec.predictor.env.length > 0;
  }

  if (yamlObj.metadata?.labels?.['ai-asset'] === 'true') {
    formUpdates.makeAvailableAsAIAsset = true;
    if (yamlObj.metadata.labels.tiers) {
      formUpdates.selectedTiers = yamlObj.metadata.labels.tiers.split(',').filter((t: string) => t.trim());
    }
    if (yamlObj.metadata.annotations?.['custom-tiers']) {
      formUpdates.customTierNames = yamlObj.metadata.annotations['custom-tiers'];
    }
  }

  if (yamlObj.metadata?.labels?.['global'] === 'true') {
    formUpdates.makeAvailableGlobally = true;
  }

  // Extract unmapped fields
  const unmappedFields = extractUnmappedFields(yamlObj, formFieldMap);

  return { formUpdates, unmappedFields };
}

/**
 * Custom hook for debouncing YAML changes
 */
export function useDebouncedSync(callback: (value: string) => void, delay: number = 400) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (value: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(value);
      }, delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}
