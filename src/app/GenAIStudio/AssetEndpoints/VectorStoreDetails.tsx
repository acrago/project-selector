import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  CodeBlock,
  CodeBlockCode,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Label,
  PageSection,
  Tab,
  TabTitleText,
  Tabs,
  TextInput,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  CopyIcon,
  ExclamationCircleIcon,
} from '@patternfly/react-icons';
import { useDocumentTitle } from '../../utils/useDocumentTitle';

type VectorStoreStatus = 'Active' | 'Unreachable' | 'Misconfigured';
type DistanceMetric = 'cosine' | 'euclidean' | 'dotproduct';

interface VectorStoreMock {
  id: string;
  name: string;
  provider: string;
  status: VectorStoreStatus;
  dimensions: number;
  distanceMetric: DistanceMetric;
  linkedModelName: string;
  endpoint: string;
  collection: string;
  secretRef: string;
  description: string;
  owner: string;
  domain: string;
  createdAt: string;
}

const mockVectorStores: VectorStoreMock[] = [
  {
    id: 'vs-1',
    name: 'product-catalog-search',
    provider: 'PGVector',
    status: 'Active',
    dimensions: 768,
    distanceMetric: 'cosine',
    linkedModelName: 'Granite Embedding 125M',
    endpoint: 'postgresql://pgvector.demo-ns.svc.cluster.local:5432/catalog',
    collection: 'product_embeddings',
    secretRef: 'pgvector-catalog-credentials',
    description: 'Product catalog embeddings for e-commerce search and recommendations.',
    owner: 'Platform Team — Search',
    domain: 'Product',
    createdAt: '2026-01-28',
  },
  {
    id: 'vs-2',
    name: 'support-ticket-embeddings',
    provider: 'Milvus',
    status: 'Active',
    dimensions: 768,
    distanceMetric: 'dotproduct',
    linkedModelName: 'Nomic Embed Text v1.5',
    endpoint: 'milvus.demo-ns.svc.cluster.local:19530',
    collection: 'support_tickets_v2',
    secretRef: 'milvus-support-secret',
    description: 'Historical support tickets for customer-facing RAG assistant.',
    owner: 'Support Engineering',
    domain: 'Customer Support',
    createdAt: '2026-02-10',
  },
  {
    id: 'vs-3',
    name: 'internal-docs-rag',
    provider: 'Qdrant',
    status: 'Unreachable',
    dimensions: 1536,
    distanceMetric: 'cosine',
    linkedModelName: 'text-embedding-ada-002',
    endpoint: 'https://qdrant.internal.example.com:6333',
    collection: 'internal_documentation',
    secretRef: 'qdrant-docs-api-key',
    description: 'Internal engineering docs and runbooks for on-call RAG.',
    owner: 'DevOps',
    domain: 'Engineering',
    createdAt: '2026-02-18',
  },
  {
    id: 'vs-4',
    name: 'compliance-kb',
    provider: 'PGVector',
    status: 'Misconfigured',
    dimensions: 3072,
    distanceMetric: 'euclidean',
    linkedModelName: 'text-embedding-3-large',
    endpoint: 'postgresql://pgvector-compliance.demo-ns.svc.cluster.local:5432/compliance',
    collection: 'regulatory_docs',
    secretRef: '',
    description: 'Regulatory and compliance documents. Missing credentials secret.',
    owner: 'Legal & Compliance',
    domain: 'Compliance',
    createdAt: '2026-02-22',
  },
  {
    id: 'vs-5',
    name: 'hr-policies-search',
    provider: 'Qdrant',
    status: 'Active',
    dimensions: 768,
    distanceMetric: 'cosine',
    linkedModelName: 'Granite Embedding 125M',
    endpoint: 'https://qdrant-hr.demo-ns.svc.cluster.local:6333',
    collection: 'hr_policies_2026',
    secretRef: 'qdrant-hr-api-key',
    description: 'Company HR policies, benefits guides, and employee handbook.',
    owner: 'People Operations',
    domain: 'HR',
    createdAt: '2026-02-01',
  },
  {
    id: 'vs-6',
    name: 'api-docs-v3',
    provider: 'Milvus',
    status: 'Active',
    dimensions: 768,
    distanceMetric: 'dotproduct',
    linkedModelName: 'Nomic Embed Text v1.5',
    endpoint: 'milvus-apidocs.demo-ns.svc.cluster.local:19530',
    collection: 'openapi_specs_v3',
    secretRef: 'milvus-apidocs-secret',
    description: 'OpenAPI specifications and developer documentation for platform APIs.',
    owner: 'Platform Engineering',
    domain: 'Engineering',
    createdAt: '2026-01-15',
  },
  {
    id: 'vs-7',
    name: 'sales-enablement',
    provider: 'PGVector',
    status: 'Active',
    dimensions: 768,
    distanceMetric: 'cosine',
    linkedModelName: 'Granite Embedding 125M',
    endpoint: 'postgresql://pgvector-sales.demo-ns.svc.cluster.local:5432/sales',
    collection: 'sales_collateral',
    secretRef: 'pgvector-sales-credentials',
    description: 'Sales decks, battle cards, and competitive intelligence.',
    owner: 'Sales Ops',
    domain: 'Sales',
    createdAt: '2026-02-05',
  },
  {
    id: 'vs-8',
    name: 'security-advisories',
    provider: 'Qdrant',
    status: 'Unreachable',
    dimensions: 768,
    distanceMetric: 'cosine',
    linkedModelName: 'Nomic Embed Text v1.5',
    endpoint: 'https://qdrant-security.demo-ns.svc.cluster.local:6333',
    collection: 'cve_advisories',
    secretRef: 'qdrant-security-api-key',
    description: 'CVE advisories and security bulletins for vulnerability triage.',
    owner: 'Security Team',
    domain: 'Security',
    createdAt: '2026-01-20',
  },
];

type CodeLanguage = 'curl' | 'python';

const getUsageExamples = (store: VectorStoreMock): Record<CodeLanguage, { label: string; code: string }> => {
  const pythonCode = store.provider === 'PGVector'
    ? `import psycopg2

conn = psycopg2.connect("${store.endpoint}")
cur = conn.cursor()

# Query similar vectors
query_embedding = [0.1, 0.2, ...]  # ${store.dimensions}-dim vector
cur.execute(
    "SELECT id, content, embedding <=> %s::vector AS distance "
    "FROM ${store.collection} "
    "ORDER BY distance LIMIT 5",
    (query_embedding,)
)

results = cur.fetchall()
for row in results:
    print(row)`
    : store.provider === 'Milvus'
    ? `from pymilvus import connections, Collection

connections.connect(uri="${store.endpoint}")
collection = Collection("${store.collection}")
collection.load()

# Query similar vectors
query_embedding = [[0.1, 0.2, ...]]  # ${store.dimensions}-dim vector
results = collection.search(
    data=query_embedding,
    anns_field="embedding",
    param={"metric_type": "${store.distanceMetric === 'cosine' ? 'COSINE' : store.distanceMetric === 'dotproduct' ? 'IP' : 'L2'}"},
    limit=5,
    output_fields=["content"]
)

for hits in results:
    for hit in hits:
        print(hit.entity.get("content"), hit.distance)`
    : `from qdrant_client import QdrantClient

client = QdrantClient(url="${store.endpoint}")

# Query similar vectors
query_embedding = [0.1, 0.2, ...]  # ${store.dimensions}-dim vector
results = client.search(
    collection_name="${store.collection}",
    query_vector=query_embedding,
    limit=5
)

for point in results:
    print(point.payload, point.score)`;

  const curlCode = store.provider === 'PGVector'
    ? `# PGVector is accessed via SQL — use psql or a client library
psql "${store.endpoint}" -c "
  SELECT id, content,
         embedding <=> '[0.1,0.2,...]'::vector AS distance
  FROM ${store.collection}
  ORDER BY distance
  LIMIT 5;
"`
    : store.provider === 'Milvus'
    ? `curl -X POST http://${store.endpoint}/v1/vector/search \\
  -H "Content-Type: application/json" \\
  -d '{
    "collectionName": "${store.collection}",
    "vector": [0.1, 0.2, ...],
    "limit": 5,
    "outputFields": ["content"]
  }'`
    : `curl -X POST ${store.endpoint}/collections/${store.collection}/points/search \\
  -H "Content-Type: application/json" \\
  -d '{
    "vector": [0.1, 0.2, ...],
    "limit": 5,
    "with_payload": true
  }'`;

  return {
    curl: { label: 'cURL', code: curlCode },
    python: { label: 'Python', code: pythonCode },
  };
};

const VectorStoreDetails: React.FunctionComponent = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  const store = React.useMemo(
    () => mockVectorStores.find(s => s.id === storeId) ?? null,
    [storeId],
  );

  useDocumentTitle(store ? `${store.name} — Vector Store` : 'Vector Store Details');

  const [copiedItems, setCopiedItems] = React.useState<Set<string>>(new Set());
  const [activeLanguageTab, setActiveLanguageTab] = React.useState<CodeLanguage>('curl');

  const handleCopyWithFeedback = (text: string, itemId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItems(prev => new Set(prev).add(itemId));
    setTimeout(() => {
      setCopiedItems(prev => { const n = new Set(prev); n.delete(itemId); return n; });
    }, 2000);
  };

  if (!store) {
    return (
      <PageSection>
        <Title headingLevel="h1" size="2xl">Vector Store Not Found</Title>
        <p>The requested vector store could not be found.</p>
        <Button variant="primary" onClick={() => navigate('/gen-ai-studio/asset-endpoints')} id="vs-detail-back-button">
          Back to AI Asset Endpoints
        </Button>
      </PageSection>
    );
  }

  const isHealthy = store.status === 'Active';
  const codeExamples = getUsageExamples(store);
  const distanceLabel = { cosine: 'Cosine', euclidean: 'Euclidean', dotproduct: 'Dot Product' }[store.distanceMetric];

  return (
    <PageSection isFilled style={{ padding: 0, minHeight: '100vh' }}>
      {/* Breadcrumbs */}
      <PageSection style={{ paddingBottom: 0 }}>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/gen-ai-studio/asset-endpoints">AI asset endpoints</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{store.name}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>

      {/* Header */}
      <PageSection style={{ paddingTop: '1rem', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <Title headingLevel="h1" size="2xl" style={{ margin: 0 }} id="vs-detail-title">
                {store.name}
              </Title>
              <Label variant="outline" id="asset-type-label">Vector store endpoint</Label>
              {isHealthy && (
                <Label status="success">Ready</Label>
              )}
              {store.status === 'Unreachable' && (
                <Label color="red" icon={<ExclamationCircleIcon />}>Unreachable</Label>
              )}
              {store.status === 'Misconfigured' && (
                <Label color="orange">Misconfigured</Label>
              )}
            </div>
            <div style={{
              fontFamily: 'var(--pf-t--global--font--family--mono)',
              fontSize: '0.8rem',
              color: 'var(--pf-t--global--text--color--subtle)',
              marginBottom: '0.25rem',
            }}>
              {store.collection}
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
              Provided by {store.owner || 'Unknown'}
            </span>
          </div>
          <Button
            variant="primary"
            isDisabled={!isHealthy}
            onClick={() => navigate('/gen-ai-studio/playground')}
            id="vs-detail-playground-button"
          >
            Try in playground
          </Button>
        </div>
      </PageSection>

      {/* Connect to endpoint card */}
      <PageSection style={{ paddingTop: '1.5rem' }}>
        <Card id="vs-detail-endpoint-card">
          <CardHeader>
            <Title headingLevel="h3" size="md">Connect to endpoint</Title>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--pf-t--global--text--color--subtle)', fontSize: '0.875rem' }}>
              Use the information below to connect to this vector store from your applications.
            </p>
          </CardHeader>
          <CardBody>
            <Form>
              <FormGroup label="Endpoint URL" fieldId="vs-detail-endpoint-url">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TextInput
                    id="vs-detail-endpoint-url"
                    value={store.endpoint}
                    readOnly
                    aria-label="Endpoint URL"
                    style={{ fontFamily: 'monospace', flex: 1 }}
                  />
                  <Tooltip content={copiedItems.has('endpoint') ? 'Copied' : 'Copy endpoint'}>
                    <Button
                      variant="control"
                      aria-label="Copy endpoint URL"
                      onClick={() => handleCopyWithFeedback(store.endpoint, 'endpoint')}
                      id="copy-vs-detail-endpoint"
                    >
                      {copiedItems.has('endpoint') ? <CheckCircleIcon /> : <CopyIcon />}
                    </Button>
                  </Tooltip>
                </div>
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>The {store.provider} endpoint for accessing this vector store.</HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </FormGroup>

              <FormGroup label="Collection / Index" fieldId="vs-detail-collection">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TextInput
                    id="vs-detail-collection"
                    value={store.collection}
                    readOnly
                    aria-label="Collection name"
                    style={{ fontFamily: 'monospace', flex: 1 }}
                  />
                  <Tooltip content={copiedItems.has('collection') ? 'Copied' : 'Copy collection'}>
                    <Button
                      variant="control"
                      aria-label="Copy collection name"
                      onClick={() => handleCopyWithFeedback(store.collection, 'collection')}
                      id="copy-vs-detail-collection"
                    >
                      {copiedItems.has('collection') ? <CheckCircleIcon /> : <CopyIcon />}
                    </Button>
                  </Tooltip>
                </div>
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>The target collection or index within the vector database.</HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </FormGroup>

              <FormGroup label="Secret reference" fieldId="vs-detail-secret">
                {store.secretRef ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TextInput
                      id="vs-detail-secret"
                      value={store.secretRef}
                      readOnly
                      aria-label="Secret reference"
                      style={{ fontFamily: 'monospace', flex: 1 }}
                    />
                    <Tooltip content={copiedItems.has('secret') ? 'Copied' : 'Copy secret name'}>
                      <Button
                        variant="control"
                        aria-label="Copy secret reference"
                        onClick={() => handleCopyWithFeedback(store.secretRef, 'secret')}
                        id="copy-vs-detail-secret"
                      >
                        {copiedItems.has('secret') ? <CheckCircleIcon /> : <CopyIcon />}
                      </Button>
                    </Tooltip>
                  </div>
                ) : (
                  <TextInput id="vs-detail-secret" value="Not configured" readOnly isDisabled aria-label="Secret reference" />
                )}
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>Kubernetes Secret containing database credentials (namespace-scoped).</HelperTextItem>
                  </HelperText>
                </FormHelperText>
              </FormGroup>
            </Form>
          </CardBody>
        </Card>

        {/* Store details */}
        <Card style={{ marginTop: '1.5rem' }} id="vs-detail-info-card">
          <CardHeader>
            <Title headingLevel="h3" size="md">Store details</Title>
          </CardHeader>
          <CardBody>
            <DescriptionList isHorizontal columnModifier={{ default: '2Col' }} id="vs-detail-metadata">
              <DescriptionListGroup>
                <DescriptionListTerm>Provider</DescriptionListTerm>
                <DescriptionListDescription>{store.provider}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Dimensions</DescriptionListTerm>
                <DescriptionListDescription>{store.dimensions.toLocaleString()}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Distance metric</DescriptionListTerm>
                <DescriptionListDescription>{distanceLabel}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Embedding model</DescriptionListTerm>
                <DescriptionListDescription>{store.linkedModelName}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Owner</DescriptionListTerm>
                <DescriptionListDescription>{store.owner || '—'}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Domain</DescriptionListTerm>
                <DescriptionListDescription>{store.domain || '—'}</DescriptionListDescription>
              </DescriptionListGroup>
              {store.description && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Description</DescriptionListTerm>
                  <DescriptionListDescription>{store.description}</DescriptionListDescription>
                </DescriptionListGroup>
              )}
              <DescriptionListGroup>
                <DescriptionListTerm>Created</DescriptionListTerm>
                <DescriptionListDescription>{store.createdAt}</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>

        {/* Usage example */}
        <Divider style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }} />
        <Title headingLevel="h3" size="md" style={{ marginBottom: '0.5rem' }} id="vs-detail-usage-title">
          Usage example
        </Title>
        <Tabs
          activeKey={activeLanguageTab}
          onSelect={(_e, key) => setActiveLanguageTab(key as CodeLanguage)}
          id="vs-detail-language-tabs"
        >
          {Object.entries(codeExamples).map(([key, { label, code }]) => (
            <Tab
              key={key}
              eventKey={key}
              title={<TabTitleText>{label}</TabTitleText>}
              id={`vs-detail-tab-${key}`}
            >
              <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                <Tooltip content={copiedItems.has(`code-${key}`) ? 'Copied' : 'Copy'}>
                  <Button
                    variant="secondary"
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 1 }}
                    onClick={() => handleCopyWithFeedback(code, `code-${key}`)}
                    icon={copiedItems.has(`code-${key}`) ? <CheckCircleIcon /> : <CopyIcon />}
                    id={`copy-vs-detail-code-${key}`}
                  >
                    {copiedItems.has(`code-${key}`) ? 'Copied' : 'Copy'}
                  </Button>
                </Tooltip>
                <CodeBlock id={`vs-detail-code-${key}`}>
                  <CodeBlockCode>{code}</CodeBlockCode>
                </CodeBlock>
              </div>
            </Tab>
          ))}
        </Tabs>

        <Content component="p" style={{ marginTop: '0.75rem', fontSize: 'var(--pf-t--global--font--size--sm)', color: 'var(--pf-t--global--text--color--subtle)' }}>
          Replace the placeholder vector with your actual query embedding ({store.dimensions} dimensions).
        </Content>
      </PageSection>
    </PageSection>
  );
};

export default VectorStoreDetails;
