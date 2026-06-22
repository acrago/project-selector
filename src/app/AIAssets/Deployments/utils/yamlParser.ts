import * as yaml from 'js-yaml';

export interface YAMLError {
  line: number;
  message: string;
  column?: number;
}

export interface UnmappedField {
  key: string;
  value: any;
  path: string;
}

/**
 * Parse YAML string and return parsed object or null with error details
 */
export function parseYAML(yamlString: string): { data: any; error: null } | { data: null; error: YAMLError } {
  try {
    const data = yaml.load(yamlString);
    return { data, error: null };
  } catch (error: any) {
    // Extract line number from js-yaml error
    const lineMatch = error.message?.match(/line (\d+)/i);
    const columnMatch = error.message?.match(/column (\d+)/i);
    
    return {
      data: null,
      error: {
        line: lineMatch ? parseInt(lineMatch[1], 10) : 1,
        message: error.message || 'Invalid YAML syntax',
        column: columnMatch ? parseInt(columnMatch[1], 10) : undefined,
      },
    };
  }
}

/**
 * Validate YAML syntax and return array of errors
 */
export function validateYAMLSyntax(yamlString: string): YAMLError[] {
  const result = parseYAML(yamlString);
  if (result.error) {
    return [result.error];
  }
  return [];
}

/**
 * Find the line number for a given field path in YAML string
 */
export function findFieldLine(yamlString: string, fieldPath: string): number {
  const lines = yamlString.split('\n');
  const pathParts = fieldPath.split('.');
  const lastPart = pathParts[pathParts.length - 1];
  
  // Calculate expected indentation based on nesting depth
  // Each level typically adds 2 spaces in YAML
  const _expectedIndent = (pathParts.length - 1) * 2;
  
  // Search for the field name with appropriate indentation
  // Match the field name at the start (after indentation) followed by a colon
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    // Check if this line contains the field name followed by a colon
    const fieldMatch = new RegExp(`^${lastPart}\\s*:`, 'i');
    if (fieldMatch.test(trimmed)) {
      // For nested fields, verify we're in the right context
      if (pathParts.length > 1) {
        // Check that parent paths exist before this line
        let allParentsFound = true;
        for (let j = 0; j < pathParts.length - 1; j++) {
          const parentName = pathParts[j];
          let parentFound = false;
          
          // Search backwards from current line to find parent
          for (let k = i - 1; k >= 0; k--) {
            const parentLine = lines[k].trim();
            if (parentLine.startsWith(`${parentName}:`)) {
              parentFound = true;
              break;
            }
          }
          
          if (!parentFound) {
            allParentsFound = false;
            break;
          }
        }
        
        if (allParentsFound) {
          return i + 1; // Line numbers are 1-indexed
        }
      } else {
        // Top-level field
        return i + 1;
      }
    }
  }
  
  // Fallback: search for just the field name (less accurate but better than line 1)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith(`${lastPart}:`)) {
      return i + 1;
    }
  }
  
  return 1; // Default to line 1 if not found
}

/**
 * Validate required Kubernetes fields and InferenceService-specific requirements
 */
export function validateRequiredFields(yamlObj: any, yamlString?: string): YAMLError[] {
  const errors: YAMLError[] = [];

  if (!yamlObj) {
    return [{ line: 1, message: 'YAML is empty or invalid' }];
  }

  // Check for apiVersion
  if (!yamlObj.apiVersion) {
    const line = yamlString ? findFieldLine(yamlString, 'apiVersion') : 1;
    errors.push({ line, message: 'Missing required field: apiVersion' });
  }

  // Check for kind
  if (!yamlObj.kind) {
    const line = yamlString ? findFieldLine(yamlString, 'kind') : 1;
    errors.push({ line, message: 'Missing required field: kind' });
  }

  // Check for metadata.name
  if (!yamlObj.metadata || !yamlObj.metadata.name) {
    const line = yamlString ? findFieldLine(yamlString, 'metadata.name') : 1;
    errors.push({ line, message: 'Missing required field: metadata.name' });
  }

  // Check for spec (Kubernetes resources typically need a spec)
  if (!yamlObj.spec) {
    const line = yamlString ? findFieldLine(yamlString, 'spec') : 1;
    errors.push({ line, message: 'Missing required field: spec' });
  }

  // InferenceService-specific validations
  if (yamlObj.kind === 'InferenceService') {
    // Check for predictor
    if (!yamlObj.spec?.predictor) {
      const line = yamlString ? findFieldLine(yamlString, 'spec.predictor') : 1;
      errors.push({ line, message: 'Missing required field: spec.predictor' });
    }

    // Check for model storageUri (required for InferenceService)
    if (!yamlObj.spec?.predictor?.model?.storageUri || yamlObj.spec.predictor.model.storageUri === '') {
      const line = yamlString ? findFieldLine(yamlString, 'spec.predictor.model.storageUri') : 1;
      errors.push({ line, message: 'Missing required field: spec.predictor.model.storageUri (Model location is required)' });
    }
  }

  // LLMInferenceService-specific validations
  if (yamlObj.kind === 'LLMInferenceService') {
    if (!yamlObj.spec) {
      const line = yamlString ? findFieldLine(yamlString, 'spec') : 1;
      errors.push({ line, message: 'Missing required field: spec' });
    }
    if (yamlObj.spec && !yamlObj.spec.model) {
      const line = yamlString ? findFieldLine(yamlString, 'spec.model') : 1;
      errors.push({ line, message: 'Missing required field: spec.model' });
    }
  }

  return errors;
}

/**
 * Standard InferenceService YAML paths we recognize. Only paths NOT in this set
 * are reported as "unmapped" (custom). Adding e.g. spec.predictor.url will then
 * show as a single custom property.
 */
const KNOWN_INFERENCESERVICE_PATHS = new Set([
  'apiVersion',
  'kind',
  'metadata',
  'metadata.name',
  'metadata.namespace',
  'metadata.labels',
  'metadata.labels.model-type',
  'metadata.labels.ai-asset',
  'metadata.labels.global',
  'metadata.labels.tiers',
  'metadata.annotations',
  'metadata.annotations.description',
  'metadata.annotations.custom-tiers',
  'spec',
  'spec.predictor',
  'spec.predictor.model',
  'spec.predictor.model.storageUri',
  'spec.predictor.model.modelFormat',
  'spec.predictor.model.modelFormat.name',
  'spec.predictor.replicas',
  'spec.predictor.runtime',
  'spec.predictor.externalRoute',
  'spec.predictor.tokenAuth',
  'spec.predictor.resources',
  'spec.predictor.resources.requests',
  'spec.predictor.resources.requests.cpu',
  'spec.predictor.resources.requests.memory',
  'spec.predictor.resources.limits',
  'spec.predictor.resources.limits.cpu',
  'spec.predictor.resources.limits.memory',
  'spec.predictor.containers',
  'spec.predictor.runtimeArgs',
  'spec.predictor.env',
]);

function isPathKnown(path: string): boolean {
  return KNOWN_INFERENCESERVICE_PATHS.has(path);
}

/**
 * Extract fields from YAML that are custom (not part of the known InferenceService schema).
 * Only truly custom fields (e.g. spec.predictor.url) are returned, not standard paths.
 */
export function extractUnmappedFields(
  yamlObj: any,
  formFieldMap: Map<string, string>
): UnmappedField[] {
  const unmappedFields: UnmappedField[] = [];

  if (!yamlObj || typeof yamlObj !== 'object') {
    return unmappedFields;
  }

  /**
   * Recursively traverse the YAML object and find fields that are not in the known schema
   */
  function traverse(obj: any, path: string = '', depth: number = 0): void {
    // Limit depth to prevent infinite recursion
    if (depth > 10) {
      return;
    }

    if (obj === null || obj === undefined) {
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          traverse(item, `${path}[${index}]`, depth + 1);
        }
      });
      return;
    }

    if (typeof obj !== 'object') {
      return;
    }

    Object.keys(obj).forEach((key) => {
      const currentPath = path ? `${path}.${key}` : key;
      const fullPath = currentPath;

      // Known schema path or form-mapped: not custom
      const isMapped = formFieldMap.has(fullPath) || formFieldMap.has(key);
      const isKnown = isPathKnown(fullPath);

      if (!isMapped && !isKnown) {
        const value = obj[key];
        
        // Only include if it's a meaningful value (not empty object/array)
        if (
          value !== null &&
          value !== undefined &&
          value !== '' &&
          !(typeof value === 'object' && Object.keys(value).length === 0) &&
          !(Array.isArray(value) && value.length === 0)
        ) {
          unmappedFields.push({
            key,
            value,
            path: fullPath,
          });
        }
      }

      // Continue traversing if value is an object
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        traverse(obj[key], currentPath, depth + 1);
      } else if (Array.isArray(obj[key])) {
        obj[key].forEach((item: any, index: number) => {
          if (typeof item === 'object' && item !== null) {
            traverse(item, `${currentPath}[${index}]`, depth + 1);
          }
        });
      }
    });
  }

  traverse(yamlObj);
  return unmappedFields;
}

// --- Multi-document YAML (split by ---, tabs by kind) ---

export interface ParsedYamlDocument {
  tabId: string;
  kind: string;
  raw: string;
  index: number;
}

/** Pre-defined kind → tab id for model deployment wizard. Unknown kinds use tab id "Other". */
const KIND_TO_TAB_ID: Record<string, string> = {
  InferenceService: 'inference-service',
  LLMInferenceService: 'llm-inference-service',
};

const TAB_ORDER = ['inference-service', 'Other'];

/**
 * Split a YAML string by the --- delimiter into document chunks.
 * Handles leading/trailing --- and empty documents. Empty chunks are preserved
 * so that typing "---" on a new line to start another document is not lost.
 */
export function splitYamlByDelimiter(yamlString: string): string[] {
  if (!yamlString || !yamlString.trim()) {
    return [];
  }
  const chunks = yamlString.split(/\n---\s*\n/);
  return chunks.map((chunk) => chunk.trim());
}

/**
 * Get the tab id for a given kind. Pre-defined kinds map to named tabs; others go to "Other".
 */
export function getTabIdForKind(kind: string): string {
  if (!kind || typeof kind !== 'string') return 'Other';
  return KIND_TO_TAB_ID[kind] ?? 'Other';
}

/**
 * Parse a multi-document YAML string: split by ---, inspect kind of each object,
 * and assign each to a tab (inference-service or Other).
 * Returns documents in source order with tabId and raw content.
 */
export function parseYamlDocuments(yamlString: string): ParsedYamlDocument[] {
  const rawChunks = splitYamlByDelimiter(yamlString);
  const result: ParsedYamlDocument[] = [];

  rawChunks.forEach((raw, index) => {
    const parsed = parseYAML(raw);
    const kind = parsed.data && typeof parsed.data.kind === 'string' ? parsed.data.kind : '';
    const tabId = getTabIdForKind(kind);
    result.push({ tabId, kind: kind || 'Unknown', raw, index });
  });

  return result;
}

/**
 * Group parsed documents by tab id and return tab ids in display order (inference-service, Other).
 * Documents in the same tab are concatenated with ---.
 */
export function groupDocumentsByTab(documents: ParsedYamlDocument[]): { tabId: string; content: string }[] {
  const byTab = new Map<string, string[]>();
  for (const doc of documents) {
    const existing = byTab.get(doc.tabId) ?? [];
    existing.push(doc.raw);
    byTab.set(doc.tabId, existing);
  }
  const orderedTabIds = Array.from(byTab.keys()).sort(
    (a, b) => TAB_ORDER.indexOf(a) - TAB_ORDER.indexOf(b)
  );
  return orderedTabIds.map((tabId) => ({
    tabId,
    content: (byTab.get(tabId) ?? []).join('\n---\n'),
  }));
}

/**
 * Rebuild full YAML string from an array of document raw strings (in order).
 * Empty documents are preserved so trailing --- separators are not lost.
 */
export function documentsToYamlString(documents: { raw: string }[]): string {
  return documents.map((d) => d.raw.trim()).join('\n---\n');
}

/**
 * Replace all documents in a tab with new content (newContent can contain multiple ----separated docs).
 * Returns updated documents array; use documentsToYamlString to get full YAML.
 */
export function replaceTabContent(
  documents: ParsedYamlDocument[],
  tabId: string,
  newContent: string
): ParsedYamlDocument[] {
  const indices = documents
    .map((d, i) => (d.tabId === tabId ? i : -1))
    .filter((i) => i >= 0);
  if (indices.length === 0) return documents;
  const first = indices[0];
  const last = indices[indices.length - 1];
  const rawChunks = splitYamlByDelimiter(newContent);
  const newDocs: ParsedYamlDocument[] = rawChunks.map((raw, i) => {
    const parsed = parseYAML(raw);
    const kind = parsed.data && typeof parsed.data.kind === 'string' ? parsed.data.kind : 'Unknown';
    return { tabId, kind, raw, index: i };
  });
  return [
    ...documents.slice(0, first),
    ...newDocs,
    ...documents.slice(last + 1),
  ];
}

/**
 * Get the raw YAML of the first document with the given kind from a multi-document string.
 * Used by the model deployment wizard to sync form with the InferenceService document.
 */
export function getDocumentByKind(fullYaml: string, kind: string): string | null {
  const documents = parseYamlDocuments(fullYaml);
  const doc = documents.find((d) => d.kind === kind);
  return doc?.raw ?? null;
}

/**
 * Replace the first document with the given kind with newRaw in a multi-document string.
 * If no document with that kind exists, appends newRaw as a new document.
 * Used by the model deployment wizard to update fullYaml when form values change.
 */
export function replaceDocumentByKind(fullYaml: string, kind: string, newRaw: string): string {
  const documents = parseYamlDocuments(fullYaml);
  const index = documents.findIndex((d) => d.kind === kind);
  const trimmed = newRaw.trim();
  if (index >= 0) {
    const updated = [...documents];
    updated[index] = { ...updated[index], raw: trimmed };
    return documentsToYamlString(updated);
  }
  if (documents.length === 0) return trimmed;
  return documentsToYamlString([...documents, { tabId: getTabIdForKind(kind), kind, raw: trimmed, index: documents.length }]);
}
