import * as React from 'react';
import {
  ActionGroup,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  CardTitle,
  Content,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Flex,
  FlexItem,
  Label,
  List,
  ListItem,
  PageSection,
  Tab,
  TabTitleText,
  Tabs,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import {
  AngleRightIcon,
  DownloadIcon,
  OutlinedQuestionCircleIcon,
  PlayIcon,
  SyncAltIcon,
} from '@patternfly/react-icons';
import { Subscription } from '../types';

// Schema definitions for the sidebar
interface SchemaProperty {
  name: string;
  type: string;
  description: string;
  required?: boolean;
  enum?: string[];
  children?: SchemaProperty[];
}

interface ResourceSchema {
  apiVersion: string;
  kind: string;
  description: string;
  properties: SchemaProperty[];
}

// Schema data for MaaSSubscription
const maasSubscriptionSchema: ResourceSchema = {
  apiVersion: 'maas.opendatahub.io/v1alpha1',
  kind: 'MaaSSubscription',
  description:
    'Defines a subscription plan with per-model token rate limits and quotas, as well as billing information. Subscriptions are owned by specific groups and a user must have both permission to access that model from both an AuthPolicy and Subscription perspective.',
  properties: [
    {
      name: 'apiVersion',
      type: 'string',
      description: 'APIVersion defines the versioned schema of this representation of an object.',
      required: true,
    },
    {
      name: 'kind',
      type: 'string',
      description: 'Kind is a string value representing the REST resource this object represents.',
      required: true,
    },
    {
      name: 'metadata',
      type: 'object',
      description: 'Standard object metadata.',
      required: true,
      children: [
        { name: 'name', type: 'string', description: 'Unique identifier for this subscription.', required: true },
        {
          name: 'namespace',
          type: 'string',
          description: 'Namespace where the subscription is created.',
          required: true,
        },
      ],
    },
    {
      name: 'annotation',
      type: 'object',
      description: 'Annotations for display metadata.',
      children: [
        { name: 'display-name', type: 'string', description: 'Human-readable display name for the subscription.' },
        {
          name: 'display-description',
          type: 'string',
          description: 'Human-readable description of the subscription.',
        },
      ],
    },
    {
      name: 'spec',
      type: 'object',
      description: 'Specification of the desired subscription behavior.',
      required: true,
      children: [
        {
          name: 'owner',
          type: 'object',
          description: 'Owner specification defining which groups own this subscription.',
          required: true,
          children: [
            {
              name: 'groups',
              type: 'array',
              description: 'List of groups that own and can use this subscription.',
              required: true,
              children: [{ name: 'name', type: 'string', description: 'Name of the group.', required: true }],
            },
          ],
        },
        {
          name: 'modelRefs',
          type: 'array',
          description: 'List of models included in this subscription with per-model token rate limits.',
          required: true,
          children: [
            { name: 'name', type: 'string', description: 'Name/ID of the MaaSModelRef.', required: true },
            {
              name: 'tokenRateLimits',
              type: 'array',
              description: 'Token rate limits for this model. Can also use a ref to an existing TokenRateLimit.',
              children: [
                { name: 'limit', type: 'integer', description: 'Maximum number of tokens allowed in the window.' },
                {
                  name: 'window',
                  type: 'string',
                  description: 'Time window for the limit (e.g., "2m", "24h").',
                  enum: ['1m', '2m', '1h', '24h', '7d'],
                },
                { name: 'ref', type: 'string', description: 'Reference to an existing TokenRateLimit resource.' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// Sample definitions
interface YamlSample {
  id: string;
  title: string;
  description: string;
  yaml: string;
}

const maasSubscriptionSamples: YamlSample[] = [
  {
    id: 'basic-subscription',
    title: 'Basic Subscription',
    description: 'A simple subscription with one model and default rate limits.',
    yaml: `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSSubscription
metadata:
  name: basic-subscription
  namespace: opendatahub
annotation:
  display-name: "Basic Subscription"
  display-description: "Basic access to AI models"
spec:
  owner:
    groups:
      - name: "data-scientists"
  modelRefs:
    - name: granite-3b-instruct
      tokenRateLimits:
        - limit: 10000
          window: 24h`,
  },
  {
    id: 'enterprise-subscription',
    title: 'Enterprise Subscription with Multiple Models',
    description: 'An enterprise-grade subscription with multiple models and tiered rate limits.',
    yaml: `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSSubscription
metadata:
  name: enterprise-tier
  namespace: opendatahub
annotation:
  display-name: "Enterprise Subscription"
  display-description: "Full access to enterprise AI models with premium limits"
spec:
  owner:
    groups:
      - name: "acme-corp-ai-users"
  modelRefs:
    - name: granite-3b-instruct
      tokenRateLimits:
        - limit: 100000
          window: 24h
    - name: gpt-4-turbo
      tokenRateLimits:
        - limit: 2000
          window: 2m
    - name: gpt-4-advance
      tokenRateLimits:
        ref: custom-rate-limit`,
  },
  {
    id: 'multi-group-subscription',
    title: 'Multi-Group Subscription',
    description: 'A subscription shared across multiple groups with different rate limits per model.',
    yaml: `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSSubscription
metadata:
  name: shared-ai-access
  namespace: opendatahub
annotation:
  display-name: "Shared AI Access"
  display-description: "Shared access for multiple teams"
spec:
  owner:
    groups:
      - name: "acme-corp-ai-users"
      - name: "acme-data-science"
  modelRefs:
    - name: granite-3b-instruct
      tokenRateLimits:
        - limit: 50000
          window: 1h
        - limit: 500000
          window: 24h`,
  },
];

interface SubscriptionYamlTabProps {
  subscription: Subscription;
  onSubscriptionChange?: (subscription: Subscription) => void;
}

const SubscriptionYamlTab: React.FunctionComponent<SubscriptionYamlTabProps> = ({
  subscription,
  onSubscriptionChange,
}) => {
  // YAML content state
  const [yamlContent, setYamlContent] = React.useState(subscription.yaml || '');
  const [savedYaml, setSavedYaml] = React.useState(subscription.yaml || '');

  // Sidebar state
  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(true);
  const [sidebarActiveTabKey, setSidebarActiveTabKey] = React.useState<number>(0);
  const [schemaBreadcrumb, setSchemaBreadcrumb] = React.useState<SchemaProperty[]>([]);
  const [currentSchemaView, setCurrentSchemaView] = React.useState<SchemaProperty | null>(null);

  // Update yaml content when subscription changes
  React.useEffect(() => {
    const yaml = subscription.yaml || generateDefaultYaml(subscription);
    setYamlContent(yaml);
    setSavedYaml(yaml);
  }, [subscription]);

  // Generate default YAML from subscription data
  const generateDefaultYaml = (sub: Subscription): string => {
    const groupsYaml = sub.owner.groups.map((g) => `      - name: "${g.name}"`).join('\n');

    const modelRefsYaml = sub.modelRefs
      .map((ref) => {
        const limits = Array.isArray(ref.tokenRateLimits) ? ref.tokenRateLimits : [ref.tokenRateLimits];
        const tokenLimitsYaml = limits
          .map((tl) => {
            const window =
              tl.perAmount && tl.perUnit
                ? `${tl.perAmount}${tl.perUnit === 'minute' ? 'm' : tl.perUnit === 'hour' ? 'h' : 'd'}`
                : tl.window;
            return `        - limit: ${tl.limit}\n          window: ${window}`;
          })
          .join('\n');
        return `    - name: ${ref.name}\n      tokenRateLimits:\n${tokenLimitsYaml}`;
      })
      .join('\n');

    return `apiVersion: maas.opendatahub.io/v1alpha1
kind: MaaSSubscription
metadata:
  name: ${sub.name}
  namespace: opendatahub
annotation:
  display-name: "${sub.displayName}"
  display-description: "${sub.description || ''}"
spec:
  owner:
    groups:
${groupsYaml || '      # No groups assigned'}
  modelRefs:
${modelRefsYaml || '    # No models added'}`;
  };

  // Handle saving changes
  const handleSave = () => {
    // In a real app, you would parse the YAML and update the subscription
    // For now, we just update the yaml field on the subscription
    if (onSubscriptionChange) {
      onSubscriptionChange({
        ...subscription,
        yaml: yamlContent,
      });
    }
    setSavedYaml(yamlContent);
  };

  // Handle reloading - reset to last saved state
  const handleReload = () => {
    setYamlContent(savedYaml);
  };

  // Handle cancel - reset to last saved state (same as reload for now)
  const handleCancel = () => {
    setYamlContent(savedYaml);
  };

  // Handle loading a sample into the editor
  const handleLoadSample = (sampleYaml: string) => {
    setYamlContent(sampleYaml);
  };

  // Render schema properties
  const renderSchemaContent = () => {
    const schema = maasSubscriptionSchema;
    const propsToShow = currentSchemaView?.children || schema.properties;
    const description = currentSchemaView?.description || schema.description;

    return (
      <>
        <Content
          component="p"
          style={{ marginBottom: 'var(--pf-t--global--spacer--md)', color: 'var(--pf-t--global--text--color--subtle)' }}
        >
          {description}
        </Content>
        <List isPlain id="schema-properties-list">
          {propsToShow.map((prop) => (
            <ListItem key={prop.name} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
              <Flex alignItems={{ default: 'alignItemsFlexStart' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem style={{ minWidth: '120px' }}>
                  {prop.children ? (
                    <Button
                      variant="link"
                      isInline
                      onClick={() => {
                        setSchemaBreadcrumb([...schemaBreadcrumb, prop]);
                        setCurrentSchemaView(prop);
                      }}
                      id={`schema-prop-link-${prop.name}`}
                      style={{ fontWeight: 600 }}
                    >
                      {prop.name}
                      <AngleRightIcon style={{ marginLeft: '0.25rem' }} />
                    </Button>
                  ) : (
                    <span style={{ fontWeight: 600 }}>{prop.name}</span>
                  )}
                  {prop.required && (
                    <span style={{ color: 'var(--pf-t--global--color--status--danger--default)', marginLeft: '0.25rem' }}>
                      *
                    </span>
                  )}
                </FlexItem>
                <FlexItem>
                  <Label isCompact color="blue" id={`schema-type-${prop.name}`}>
                    {prop.type}
                  </Label>
                </FlexItem>
              </Flex>
              <div
                style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: '0.875rem', marginTop: '0.25rem' }}
              >
                {prop.description}
              </div>
              {prop.enum && (
                <div style={{ marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                    Allowed values:{' '}
                  </span>
                  {prop.enum.map((val) => (
                    <Label key={val} isCompact variant="outline" style={{ marginRight: '0.25rem' }}>
                      {val}
                    </Label>
                  ))}
                </div>
              )}
            </ListItem>
          ))}
        </List>
      </>
    );
  };

  // Render samples
  const renderSamples = () => {
    return (
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
        {maasSubscriptionSamples.map((sample) => (
          <FlexItem key={sample.id}>
            <Card isCompact id={`sample-card-${sample.id}`}>
              <CardTitle>{sample.title}</CardTitle>
              <CardBody>
                <Content
                  component="p"
                  style={{
                    marginBottom: 'var(--pf-t--global--spacer--sm)',
                    color: 'var(--pf-t--global--text--color--subtle)',
                  }}
                >
                  {sample.description}
                </Content>
                <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <Tooltip content="Load this sample into the editor">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<PlayIcon />}
                        onClick={() => handleLoadSample(sample.yaml)}
                        id={`sample-try-${sample.id}`}
                      >
                        Try it
                      </Button>
                    </Tooltip>
                  </FlexItem>
                  <FlexItem>
                    <Tooltip content="Download this sample as a YAML file">
                      <Button
                        variant="plain"
                        size="sm"
                        icon={<DownloadIcon />}
                        onClick={() => {
                          const blob = new Blob([sample.yaml], { type: 'text/yaml' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${sample.id}.yaml`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        id={`sample-download-${sample.id}`}
                      />
                    </Tooltip>
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          </FlexItem>
        ))}
      </Flex>
    );
  };

  return (
    <PageSection>
      {/* Toolbar - only show sidebar toggle when collapsed */}
      {!isSidebarExpanded && (
        <Flex
          justifyContent={{ default: 'justifyContentFlexEnd' }}
          alignItems={{ default: 'alignItemsCenter' }}
          style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
        >
          <FlexItem>
            <Button
              variant="link"
              onClick={() => setIsSidebarExpanded(true)}
              icon={<OutlinedQuestionCircleIcon />}
              id="toggle-sidebar-button"
            >
              View sidebar
            </Button>
          </FlexItem>
        </Flex>
      )}

      {/* Drawer with Editor and Sidebar */}
      <Drawer isExpanded={isSidebarExpanded} isInline id="yaml-editor-drawer">
        <DrawerContent
          panelContent={
            <DrawerPanelContent
              isResizable
              defaultSize="400px"
              minSize="250px"
              maxSize="600px"
              id="yaml-sidebar-panel"
            >
              <DrawerHead>
                <Title headingLevel="h3" size="lg">
                  MaaSSubscription
                </Title>
                <DrawerActions>
                  <DrawerCloseButton onClick={() => setIsSidebarExpanded(false)} />
                </DrawerActions>
              </DrawerHead>
              <DrawerPanelBody>
                {/* Sidebar Tabs: Schema and Samples */}
                <Tabs
                  activeKey={sidebarActiveTabKey}
                  onSelect={(_event, tabKey) => setSidebarActiveTabKey(tabKey as number)}
                  id="sidebar-tabs"
                  aria-label="Schema and samples tabs"
                  isBox
                >
                  <Tab eventKey={0} title={<TabTitleText>Schema</TabTitleText>} id="sidebar-tab-schema">
                    <div style={{ paddingTop: 'var(--pf-t--global--spacer--md)' }}>
                      {/* Schema Breadcrumb */}
                      {schemaBreadcrumb.length > 0 && (
                        <Breadcrumb style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                          <BreadcrumbItem>
                            <Button
                              variant="link"
                              isInline
                              onClick={() => {
                                setSchemaBreadcrumb([]);
                                setCurrentSchemaView(null);
                              }}
                              id="schema-breadcrumb-root"
                            >
                              MaaSSubscription
                            </Button>
                          </BreadcrumbItem>
                          {schemaBreadcrumb.map((prop, index) => (
                            <BreadcrumbItem key={prop.name} isActive={index === schemaBreadcrumb.length - 1}>
                              {index === schemaBreadcrumb.length - 1 ? (
                                prop.name
                              ) : (
                                <Button
                                  variant="link"
                                  isInline
                                  onClick={() => {
                                    setSchemaBreadcrumb(schemaBreadcrumb.slice(0, index + 1));
                                    setCurrentSchemaView(schemaBreadcrumb[index]);
                                  }}
                                  id={`schema-breadcrumb-${prop.name}`}
                                >
                                  {prop.name}
                                </Button>
                              )}
                            </BreadcrumbItem>
                          ))}
                        </Breadcrumb>
                      )}

                      {/* Schema Content */}
                      {renderSchemaContent()}
                    </div>
                  </Tab>
                  <Tab eventKey={1} title={<TabTitleText>Samples</TabTitleText>} id="sidebar-tab-samples">
                    <div style={{ paddingTop: 'var(--pf-t--global--spacer--md)' }}>{renderSamples()}</div>
                  </Tab>
                </Tabs>
              </DrawerPanelBody>
            </DrawerPanelContent>
          }
        >
          <DrawerContentBody style={{ paddingRight: isSidebarExpanded ? 'var(--pf-t--global--spacer--lg)' : 0 }}>
            {/* YAML Editor */}
            <CodeEditor
              id="subscription-yaml-editor"
              isLineNumbersVisible
              isLanguageLabelVisible
              language={Language.yaml}
              height="500px"
              code={yamlContent}
              onChange={(value) => setYamlContent(value)}
            />
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>

      {/* Action buttons below the editor */}
      <ActionGroup style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
        <Button variant="primary" onClick={handleSave} id="yaml-save-button">
          Save
        </Button>
        <Button variant="secondary" icon={<SyncAltIcon />} onClick={handleReload} id="yaml-reload-button">
          Reload
        </Button>
        <Button variant="link" onClick={handleCancel} id="yaml-cancel-button">
          Cancel
        </Button>
      </ActionGroup>
    </PageSection>
  );
};

export { SubscriptionYamlTab };
