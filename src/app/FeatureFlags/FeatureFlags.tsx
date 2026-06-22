import * as React from 'react';
import {
  Button,
  Card,
  CardBody,
  Checkbox,
  Content,
  Divider,
  Flex,
  FlexItem,
  Label,
  MenuToggle,
  PageSection,
  Select,
  SelectList,
  SelectOption,
  Switch,
  Title,
} from '@patternfly/react-core';
import {
  CaretDownIcon,
  DesktopIcon,
  FlagIcon,
  FlaskIcon,
  StarIcon,
  UndoIcon,
} from '@patternfly/react-icons';
import { FeatureFlags as FeatureFlagsType } from '@app/utils/FeatureFlagsContext';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';
import { Link } from 'react-router-dom';

function FeatureFlagOpenPageLink({ id, to }: { id: string; to: string }) {
  return (
    <Button
      id={id}
      variant="link"
      isInline
      size="sm"
      component={(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <Link {...props} to={to} />}
    >
      Open page
    </Button>
  );
}

/** Title and Open page on one line; description below. */
function FeatureFlagNavTitleRow({
  title,
  linkId,
  to,
  description,
}: {
  title: string;
  linkId: string;
  to: string;
  description: string;
}) {
  return (
    <div>
      <Flex
        alignItems={{ default: 'alignItemsBaseline' }}
        flexWrap={{ default: 'wrap' }}
        style={{ gap: 'var(--pf-v5-global--spacer--sm)', marginBottom: '0.5rem' }}
      >
        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{title}</div>
        <FeatureFlagOpenPageLink id={linkId} to={to} />
      </Flex>
      <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>{description}</div>
    </div>
  );
}

const mvpNestedSectionStyle: React.CSSProperties = {
  borderLeft: '3px solid var(--pf-v5-global--BorderColor--200)',
  marginLeft: 'var(--pf-v5-global--spacer--md)',
  marginTop: 'var(--pf-v5-global--spacer--md)',
  paddingLeft: 'var(--pf-v5-global--spacer--2xl)',
};

// --- Gen AI Studio 3.5 Feature Selector (RFE/Strat > Feature) ---

interface DesignFeature {
  key: keyof FeatureFlagsType;
  label: string;
  description: string;
}

interface DesignProject {
  id: string;
  name: string;
  rfe?: string;
  strat?: string;
  epic?: string;
  features: DesignFeature[];
}

const genaiStudio35Projects: DesignProject[] = [
  {
    id: 'multimodal',
    name: 'Multimodal Support in Playground',
    rfe: 'RHAIRFE-913',
    epic: 'RHOAIUX-2114',
    features: [
      { key: 'enableMultimodalCapabilities', label: 'Model capability badges', description: 'Capability labels on model selector and summary bar' },
      { key: 'enableMultimodalInput', label: 'Multimodal input (file + ASR)', description: 'File attachment, type filtering, audio transcription flow' },
      { key: 'enableMultimodalOutput', label: 'Multimodal output (image + TTS)', description: 'Image generation, TTS audio, progressive rendering' },
    ],
  },
  {
    id: 'prompt-templates',
    name: 'MLFlow Prompt Template Integration',
    rfe: 'RHAIRFE-1528',
    epic: 'RHOAIUX-2119',
    features: [
      { key: 'enablePromptRegistry', label: 'Prompt registry', description: 'Browse, load, and manage prompt templates from MLFlow registry' },
    ],
  },
  {
    id: 'tracing',
    name: 'Chat Metrics & Observability',
    epic: 'RHOAIUX-2173',
    features: [
      { key: 'enablePlaygroundTracing', label: 'Playground tracing', description: 'Debug toggle, MLFlow trace integration, metrics panel' },
    ],
  },
];

const FeatureFlags: React.FunctionComponent = () => {
  useDocumentTitle('Feature Flags');

  const {
    flags,
    updateFlag,
    resetFlags,
    mcpDeploymentFlow,
    setMcpDeploymentFlow,
  } = useFeatureFlags();

  const [fidelitySelectOpen, setFidelitySelectOpen] = React.useState(false);
  const [fidelity, setFidelity] = React.useState<'high' | 'low'>('high');
  const [mcpDeploymentFlowSelectOpen, setMcpDeploymentFlowSelectOpen] = React.useState(false);

  // Helper: are all features in a project enabled?
  const allFeaturesEnabled = (project: DesignProject) =>
    project.features.every(f => flags[f.key]);
  const someFeaturesEnabled = (project: DesignProject) =>
    project.features.some(f => flags[f.key]);

  // Toggle all features in a project at once
  const toggleProject = (project: DesignProject, enable: boolean) => {
    project.features.forEach(f => updateFlag(f.key, enable));
  };

  React.useEffect(() => {
    const prototypeEl = document.getElementById('prototype');
    if (fidelity === 'low') {
      prototypeEl?.classList.add('fidelity-low');
    } else {
      prototypeEl?.classList.remove('fidelity-low');
    }
  }, [fidelity]);

  return (
    <>
      <PageSection>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Title headingLevel="h1" size="xl">
              <FlagIcon style={{ marginRight: '0.5rem' }} />
              Feature Flags & Developer Settings
            </Title>
          </FlexItem>
          <FlexItem>
            <Button
              variant="secondary"
              size="sm"
              icon={<UndoIcon />}
              onClick={resetFlags}
              id="feature-flags-restore-defaults-button"
            >
              Restore Defaults
            </Button>
          </FlexItem>
        </Flex>
      </PageSection>

      <PageSection>
        <Card id="feature-flags-35-features-card">
          <CardBody>
            <Title headingLevel="h2" size="lg" style={{ marginBottom: '0.5rem' }}>
              Gen AI Studio 3.5 Features
            </Title>
            <Content
              component="p"
              style={{ marginBottom: '1.25rem', fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}
            >
              Toggle design features by RFE/Strat. Check the parent to enable all features for a project, or expand to toggle individually.
            </Content>

            {genaiStudio35Projects.map((project, pi) => {
              const allOn = allFeaturesEnabled(project);
              const someOn = someFeaturesEnabled(project);
              const parentTicket = project.strat || project.rfe;
              const parentType = project.strat ? 'Strat' : project.rfe ? 'RFE' : null;

              return (
                <div key={project.id} style={{ marginBottom: pi < genaiStudio35Projects.length - 1 ? '1.5rem' : 0 }}>
                  {/* Project row — parent checkbox */}
                  <Flex alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '0.5rem' }}>
                    <FlexItem>
                      <Checkbox
                        id={`project-${project.id}-toggle`}
                        label={
                          <span style={{ fontWeight: 600, fontSize: '1rem' }}>
                            {project.name}
                          </span>
                        }
                        isChecked={allOn ? true : someOn ? null : false}
                        onChange={(_event, checked) => toggleProject(project, checked)}
                        aria-label={`Toggle all ${project.name} features`}
                      />
                    </FlexItem>
                    <FlexItem>
                      <Flex spaceItems={{ default: 'spaceItemsXs' }}>
                        {parentType && parentTicket && (
                          <Label isCompact color={parentType === 'Strat' ? 'green' : 'blue'}>
                            {parentType}: {parentTicket}
                          </Label>
                        )}
                        {project.epic && (
                          <Label isCompact color="grey">
                            {project.epic}
                          </Label>
                        )}
                      </Flex>
                    </FlexItem>
                  </Flex>

                  {/* Individual feature checkboxes */}
                  <div style={{
                    borderLeft: '3px solid var(--pf-v5-global--BorderColor--200)',
                    marginLeft: '0.5rem',
                    paddingLeft: '1.5rem',
                  }}>
                    {project.features.map(feature => (
                      <Flex
                        key={feature.key}
                        justifyContent={{ default: 'justifyContentSpaceBetween' }}
                        alignItems={{ default: 'alignItemsCenter' }}
                        style={{ marginBottom: '0.5rem' }}
                      >
                        <FlexItem>
                          <Checkbox
                            id={`feature-${feature.key}-toggle`}
                            label={feature.label}
                            description={feature.description}
                            isChecked={flags[feature.key]}
                            onChange={(_event, checked) => updateFlag(feature.key, checked)}
                            aria-label={`Toggle ${feature.label}`}
                          />
                        </FlexItem>
                      </Flex>
                    ))}
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </PageSection>

      <PageSection>
        <Card id="feature-flags-quick-access-card">
          <CardBody>
            <Title headingLevel="h2" size="lg" style={{ marginBottom: '1rem' }}>
              <FlagIcon style={{ marginRight: '0.5rem', color: '#0066cc' }} />
              Quick access
            </Title>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Discussions</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Enables the Discussions tab, commenting pins, and related GitLab sync in the design context panel
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="feature-flags-page-discussions-switch"
                  isChecked={flags.enableDiscussions}
                  onChange={(_event, checked) => updateFlag('enableDiscussions', checked)}
                  aria-label="Enable discussions"
                />
              </FlexItem>
            </Flex>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Custom nav</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Reorder, show, or hide sidebar items (prototype navigation customization)
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="feature-flags-page-custom-nav-switch"
                  isChecked={flags.customNav}
                  onChange={(_event, checked) => updateFlag('customNav', checked)}
                  aria-label="Enable custom nav"
                />
              </FlexItem>
            </Flex>
          </CardBody>
        </Card>
      </PageSection>

      <PageSection>
        <Card id="feature-flags-navigation-routes-card">
          <CardBody>
            <Title headingLevel="h2" size="lg" style={{ marginBottom: '0.5rem' }}>
              <FlagIcon style={{ marginRight: '0.5rem', color: '#0066cc' }} />
              Navigation & routes
            </Title>
            <Content
              component="p"
              id="feature-flags-navigation-routes-description"
              style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}
            >
              Toggles that add or hide nav items and optional Gen AI Studio pages. Use Open page to preview the
              destination when the route exists.
            </Content>

            <Title headingLevel="h3" size="md" style={{ marginBottom: '0.75rem' }}>
              AI Hub
            </Title>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <FeatureFlagNavTitleRow
                  title="Prompt Registry"
                  linkId="feature-flags-preview-prompt-registry"
                  to="/ai-hub/prompts"
                  description="Show the Prompts navigation item in AI Hub"
                />
              </FlexItem>
              <FlexItem>
                <Switch
                  id="feature-flags-enable-prompt-registry-switch"
                  isChecked={flags.enablePromptRegistry}
                  onChange={(_event, checked) => updateFlag('enablePromptRegistry', checked)}
                  aria-label="Enable Prompt Registry"
                />
              </FlexItem>
            </Flex>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <FeatureFlagNavTitleRow
                  title="MCP (Model Context Protocol)"
                  linkId="feature-flags-preview-mcp-servers"
                  to="/ai-hub/mcp-servers"
                  description="Enable AI Hub MCP servers navigation and related entry points"
                />
              </FlexItem>
              <FlexItem>
                <Switch
                  id="feature-flags-enable-mcp-switch"
                  isChecked={flags.enableMCP}
                  onChange={(_event, checked) => updateFlag('enableMCP', checked)}
                  aria-label="Enable MCP"
                />
              </FlexItem>
            </Flex>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Show Discover Assets</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Show the Discover Assets dropdown section in navigation
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="feature-flags-show-discover-assets-switch"
                  isChecked={flags.showDiscoverAssets}
                  onChange={(_event, checked) => updateFlag('showDiscoverAssets', checked)}
                  aria-label="Show Discover Assets"
                />
              </FlexItem>
            </Flex>

            <Divider style={{ margin: '1.25rem 0' }} />

            <Title headingLevel="h3" size="md" style={{ marginBottom: '0.75rem' }}>
              Gen AI Studio — optional pages
            </Title>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <FeatureFlagNavTitleRow
                  title="Model Playground Page"
                  linkId="feature-flags-preview-model-playground"
                  to="/gen-ai-studio/model-playground"
                  description="Controls access to the Model Playground page in Gen AI Studio"
                />
              </FlexItem>
              <FlexItem>
                <Switch
                  id="model-playground-page-toggle"
                  isChecked={flags.enableModelPlaygroundPage}
                  onChange={() => updateFlag('enableModelPlaygroundPage', !flags.enableModelPlaygroundPage)}
                  aria-label="Toggle Model Playground page access"
                />
              </FlexItem>
            </Flex>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <FeatureFlagNavTitleRow
                  title="My Agents Page"
                  linkId="feature-flags-preview-my-agents"
                  to="/gen-ai-studio/my-agents"
                  description="Controls access to the My Agents page in Gen AI Studio"
                />
              </FlexItem>
              <FlexItem>
                <Switch
                  id="my-agents-page-toggle"
                  isChecked={flags.enableMyAgentsPage}
                  onChange={() => updateFlag('enableMyAgentsPage', !flags.enableMyAgentsPage)}
                  aria-label="Toggle My Agents page access"
                />
              </FlexItem>
            </Flex>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <FeatureFlagNavTitleRow
                  title="Prompt Engineering Page"
                  linkId="feature-flags-preview-prompt-engineering"
                  to="/gen-ai-studio/prompt-engineering"
                  description="Controls access to the Prompt Engineering page in Gen AI Studio"
                />
              </FlexItem>
              <FlexItem>
                <Switch
                  id="prompt-engineering-page-toggle"
                  isChecked={flags.enablePromptEngineeringPage}
                  onChange={() => updateFlag('enablePromptEngineeringPage', !flags.enablePromptEngineeringPage)}
                  aria-label="Toggle Prompt Engineering page access"
                />
              </FlexItem>
            </Flex>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <FeatureFlagNavTitleRow
                  title="Knowledge Sources Page"
                  linkId="feature-flags-preview-knowledge-sources"
                  to="/gen-ai-studio/knowledge-sources"
                  description="Controls access to the Knowledge Sources page in Gen AI Studio"
                />
              </FlexItem>
              <FlexItem>
                <Switch
                  id="knowledge-sources-page-toggle"
                  isChecked={flags.enableKnowledgeSourcesPage}
                  onChange={() => updateFlag('enableKnowledgeSourcesPage', !flags.enableKnowledgeSourcesPage)}
                  aria-label="Toggle Knowledge Sources page access"
                />
              </FlexItem>
            </Flex>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <FeatureFlagNavTitleRow
                  title="AutoRAG"
                  linkId="feature-flags-preview-autorag"
                  to="/gen-ai-studio/autorag"
                  description="Controls visibility of the AutoRAG section and all its contents in navigation"
                />
              </FlexItem>
              <FlexItem>
                <Switch
                  id="autorag-toggle"
                  isChecked={flags.enableAutoRAG}
                  onChange={() => updateFlag('enableAutoRAG', !flags.enableAutoRAG)}
                  aria-label="Toggle AutoRAG visibility"
                />
              </FlexItem>
            </Flex>
          </CardBody>
        </Card>
      </PageSection>

      <PageSection>
        <Card id="feature-flags-page-chrome-card">
          <CardBody>
            <Title headingLevel="h2" size="lg" style={{ marginBottom: '1rem' }}>
              Page chrome
            </Title>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Show Project and Workspace Dropdowns
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Controls visibility of the Project and Workspace selector dropdowns in page headers
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="project-workspace-toggle"
                  isChecked={flags.showProjectWorkspaceDropdowns}
                  onChange={() => updateFlag('showProjectWorkspaceDropdowns', !flags.showProjectWorkspaceDropdowns)}
                  aria-label="Toggle Project and Workspace dropdowns visibility"
                />
              </FlexItem>
            </Flex>
          </CardBody>
        </Card>
      </PageSection>

      <PageSection>
        <Card id="feature-flags-ai-hub-models-card">
          <CardBody>
            <Flex
              alignItems={{ default: 'alignItemsBaseline' }}
              flexWrap={{ default: 'wrap' }}
              style={{ gap: 'var(--pf-v5-global--spacer--sm)', marginBottom: '0.5rem' }}
            >
              <Title headingLevel="h2" size="lg" id="feature-flags-ai-hub-models-heading">
                AI Hub — Models & tabs
              </Title>
              <FeatureFlagOpenPageLink id="feature-flags-preview-ai-hub-models" to="/ai-hub/models" />
            </Flex>
            <Content
              component="p"
              id="feature-flags-ai-hub-models-description"
              style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}
            >
              Catalog, registry, and tab behavior on the Models page and related AI Hub views.
            </Content>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Model Catalog/Registry</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Show Catalog and Registry tabs on the Models page. When disabled, only Deployments tab is shown.
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="feature-flags-model-catalog-registry-switch"
                  isChecked={flags.enableModelCatalogRegistry}
                  onChange={(_event, checked) => updateFlag('enableModelCatalogRegistry', checked)}
                  aria-label="Enable Model Catalog/Registry"
                />
              </FlexItem>
            </Flex>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Persistent tab selection for asset pages in AI hub
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    When enabled, your selected tab on Models and MCP Servers pages is saved and restored when you return.
                    Can be overridden with ?persistentTabs=true or ?persistentTabs=false in the URL.
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="feature-flags-persistent-tab-selection-switch"
                  isChecked={flags.persistentTabSelection}
                  onChange={(_event, checked) => updateFlag('persistentTabSelection', checked)}
                  aria-label="Enable Persistent Tab Selection"
                />
              </FlexItem>
            </Flex>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Model Performance in Catalog</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Show the &apos;Explore model performance&apos; card in the model catalog filters
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="model-performance-catalog-toggle"
                  isChecked={flags.modelPerformanceInCatalog}
                  onChange={(_event, checked) => updateFlag('modelPerformanceInCatalog', checked)}
                  aria-label="Toggle Model Performance in Catalog"
                />
              </FlexItem>
            </Flex>
          </CardBody>
        </Card>
      </PageSection>

      <PageSection>
        <Card id="feature-flags-playground-cluster-card">
          <CardBody>
            <Title headingLevel="h2" size="lg" style={{ marginBottom: '1rem' }}>
              Playground & cluster behavior
            </Title>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Persist Data</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    When enabled, MCP server selections and tool configurations persist between sessions. When disabled,
                    data is cleared on page reload.
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="persist-data-toggle"
                  isChecked={flags.persistData}
                  onChange={() => updateFlag('persistData', !flags.persistData)}
                  aria-label="Toggle data persistence"
                />
              </FlexItem>
            </Flex>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Guardrail Unavailable in Cluster</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    When enabled, shows an empty state in the guardrails section indicating guardrails are not available
                    in the cluster
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="guardrail-unavailable-toggle"
                  isChecked={flags.guardrailUnavailableInCluster}
                  onChange={() => updateFlag('guardrailUnavailableInCluster', !flags.guardrailUnavailableInCluster)}
                  aria-label="Toggle Guardrail Unavailable in Cluster"
                />
              </FlexItem>
            </Flex>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>First Time Playground</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    When enabled, shows the empty state in the playground regardless of project selection
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="first-time-playground-toggle"
                  isChecked={flags.firstTimePlayground}
                  onChange={(_event, checked) => updateFlag('firstTimePlayground', checked)}
                  aria-label="Toggle First Time Playground"
                />
              </FlexItem>
            </Flex>
          </CardBody>
        </Card>
      </PageSection>

      <PageSection>
        <Card id="feature-flags-asset-endpoints-card">
          <CardBody>
            <Flex
              alignItems={{ default: 'alignItemsBaseline' }}
              flexWrap={{ default: 'wrap' }}
              style={{ gap: 'var(--pf-v5-global--spacer--sm)', marginBottom: '0.5rem' }}
            >
              <Title headingLevel="h2" size="lg" id="feature-flags-asset-endpoints-heading">
                AI asset endpoints — tables & detail links
              </Title>
              <FeatureFlagOpenPageLink id="feature-flags-preview-asset-endpoints" to="/gen-ai-studio/asset-endpoints" />
            </Flex>
            <Content
              component="p"
              id="feature-flags-asset-endpoints-description"
              style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}
            >
              Affects Models and MCP Servers tabs on AI asset endpoints (card/table views and deep links).
            </Content>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Model Descriptions</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    When enabled, shows the Description column in the models table
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="model-descriptions-toggle"
                  isChecked={flags.showModelDescriptions}
                  onChange={(_event, checked) => updateFlag('showModelDescriptions', checked)}
                  aria-label="Toggle Model Descriptions"
                />
              </FlexItem>
            </Flex>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Card/Table View Switcher</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    When enabled, shows the Cards/Table view toggle buttons in the Models and MCP Servers tabs
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="card-table-view-switcher-toggle"
                  isChecked={flags.enableCardTableViewSwitcher}
                  onChange={(_event, checked) => updateFlag('enableCardTableViewSwitcher', checked)}
                  aria-label="Toggle Card/Table View Switcher"
                />
              </FlexItem>
            </Flex>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Model Description Pages</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    When enabled, model names in the Models tab become clickable links to detailed model pages
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="model-description-pages-toggle"
                  isChecked={flags.enableModelDescriptionPages}
                  onChange={(_event, checked) => updateFlag('enableModelDescriptionPages', checked)}
                  aria-label="Toggle Model Description Pages"
                />
              </FlexItem>
            </Flex>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>MCP Details Page</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    When enabled, MCP server names in the MCP Servers tab become clickable links to detailed server pages
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="mcp-details-page-toggle"
                  isChecked={flags.enableMcpDetailsPage}
                  onChange={(_event, checked) => updateFlag('enableMcpDetailsPage', checked)}
                  aria-label="Toggle MCP Details Page"
                />
              </FlexItem>
            </Flex>
          </CardBody>
        </Card>
      </PageSection>

      <PageSection>
        <Card id="feature-flags-tech-preview-card">
          <CardBody>
            <Title headingLevel="h2" size="lg" style={{ marginBottom: '1rem' }}>
              Tech preview
            </Title>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>UI Fidelity</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Switch between high-fidelity and low-fidelity UI modes for testing and development
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Select
                  id="feature-flags-fidelity-select"
                  isOpen={fidelitySelectOpen}
                  selected={fidelity}
                  onSelect={(_event, value) => {
                    setFidelity(value as 'high' | 'low');
                    setFidelitySelectOpen(false);
                  }}
                  onOpenChange={(isOpen) => setFidelitySelectOpen(isOpen)}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setFidelitySelectOpen(!fidelitySelectOpen)}
                      isExpanded={fidelitySelectOpen}
                      id="feature-flags-fidelity-menu-toggle"
                      aria-label="Fidelity switcher"
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {fidelity === 'high' ? 'High fidelity' : 'Low fidelity'}
                        <CaretDownIcon />
                      </span>
                    </MenuToggle>
                  )}
                >
                  <SelectList>
                    <SelectOption value="high">High fidelity</SelectOption>
                    <SelectOption value="low">Low fidelity</SelectOption>
                  </SelectList>
                </Select>
              </FlexItem>
            </Flex>
          </CardBody>
        </Card>
      </PageSection>

      <PageSection>
        <Card id="feature-flags-mvp-bundle-card">
          <CardBody>
            <Title headingLevel="h2" size="lg" style={{ marginBottom: '0.5rem' }}>
              <StarIcon style={{ marginRight: '0.5rem', color: '#0066cc' }} />
              MVP-related toggles
            </Title>
            <Content
              component="p"
              id="feature-flags-mvp-bundle-description"
              style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}
            >
              Turn on the parent switch to reveal additional prototype toggles used with the MVP layout and flows. MCP
              navigation is controlled in Navigation & routes above.
            </Content>
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Show MVP-related toggles below
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Enables the nested MVP prototype options (knowledge, guardrails catalog, MCP UI details, deploy flow,
                    etc.). Does not replace the global app shell by itself.
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="feature-flags-enable-mvp-mode-switch"
                  isChecked={flags.enableMVPMode}
                  onChange={(_event, checked) => updateFlag('enableMVPMode', checked)}
                  aria-label="Show MVP-related toggles below"
                />
              </FlexItem>
            </Flex>

            {flags.enableMVPMode && (
              <div style={mvpNestedSectionStyle}>
                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
                  <FlexItem>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Knowledge Sources</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                        Enable or disable the knowledge sources feature for MVP mode
                      </div>
                    </div>
                  </FlexItem>
                  <FlexItem>
                    <Switch
                      id="feature-flags-enable-knowledge-switch"
                      isChecked={flags.enableKnowledge}
                      onChange={(_event, checked) => updateFlag('enableKnowledge', checked)}
                      aria-label="Enable Knowledge"
                    />
                  </FlexItem>
                </Flex>

                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
                  <FlexItem>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Guardrails Catalog</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                        Enable or disable the guardrails catalog feature
                      </div>
                    </div>
                  </FlexItem>
                  <FlexItem>
                    <Switch
                      id="feature-flags-enable-guardrails-catalog-switch"
                      isChecked={flags.enableGuardrailsCatalog}
                      onChange={(_event, checked) => updateFlag('enableGuardrailsCatalog', checked)}
                      aria-label="Enable Guardrails Catalog"
                    />
                  </FlexItem>
                </Flex>

                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
                  <FlexItem>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        Advanced Prompt Engineering
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                        Enable or disable advanced prompt engineering capabilities
                      </div>
                    </div>
                  </FlexItem>
                  <FlexItem>
                    <Switch
                      id="feature-flags-enable-advanced-prompt-engineering-switch"
                      isChecked={flags.enableAdvancedPromptEngineering}
                      onChange={(_event, checked) => updateFlag('enableAdvancedPromptEngineering', checked)}
                      aria-label="Enable Advanced Prompt Engineering"
                    />
                  </FlexItem>
                </Flex>

                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
                  <FlexItem>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        Advanced Agent Management
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                        Enable or disable advanced agent management features
                      </div>
                    </div>
                  </FlexItem>
                  <FlexItem>
                    <Switch
                      id="feature-flags-enable-advanced-agent-management-switch"
                      isChecked={flags.enableAdvancedAgentManagement}
                      onChange={(_event, checked) => updateFlag('enableAdvancedAgentManagement', checked)}
                      aria-label="Enable Advanced Agent Management"
                    />
                  </FlexItem>
                </Flex>

                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1.5rem' }}>
                  <FlexItem>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Show MCP Filters</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                        Show filter buttons (Server Type, Deployment, etc.) in the MCP servers view
                      </div>
                    </div>
                  </FlexItem>
                  <FlexItem>
                    <Switch
                      id="feature-flags-show-mcp-filters-switch"
                      isChecked={flags.showMcpFilters}
                      onChange={(_event, checked) => updateFlag('showMcpFilters', checked)}
                      aria-label="Show MCP Filters"
                    />
                  </FlexItem>
                </Flex>

                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1.5rem' }}>
                  <FlexItem>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Show MCP Connection URL</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                        Show the connection URL section on MCP server details pages
                      </div>
                    </div>
                  </FlexItem>
                  <FlexItem>
                    <Switch
                      id="feature-flags-show-mcp-connection-url-switch"
                      isChecked={flags.showMcpConnectionUrl}
                      onChange={(_event, checked) => updateFlag('showMcpConnectionUrl', checked)}
                      aria-label="Show MCP Connection URL"
                    />
                  </FlexItem>
                </Flex>

                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1.5rem' }}>
                  <FlexItem>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        MCP Lifecycle Operator Not installed
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                        When on, the Deploy MCP Server button is disabled on MCP details pages
                      </div>
                    </div>
                  </FlexItem>
                  <FlexItem>
                    <Switch
                      id="mcp-lifecycle-operator-not-installed-toggle"
                      isChecked={flags.mcpLifecycleOperatorNotInstalled}
                      onChange={(_event, checked) => updateFlag('mcpLifecycleOperatorNotInstalled', checked)}
                      aria-label="MCP Lifecycle Operator Not installed"
                    />
                  </FlexItem>
                </Flex>

                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1.5rem' }}>
                  <FlexItem>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>MCP Server deployment</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                        When clicking Deploy on an MCP server details page: Modal shows the deploy wizard over the page;
                        Wizard navigates to the full-page deploy flow.
                      </div>
                    </div>
                  </FlexItem>
                  <FlexItem>
                    <Select
                      id="mcp-deployment-flow-select"
                      isOpen={mcpDeploymentFlowSelectOpen}
                      selected={mcpDeploymentFlow}
                      onSelect={(_event, value) => {
                        setMcpDeploymentFlow(value as 'wizard' | 'modal');
                        setMcpDeploymentFlowSelectOpen(false);
                      }}
                      onOpenChange={(isOpen) => setMcpDeploymentFlowSelectOpen(isOpen)}
                      toggle={(toggleRef) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setMcpDeploymentFlowSelectOpen(!mcpDeploymentFlowSelectOpen)}
                          isExpanded={mcpDeploymentFlowSelectOpen}
                          style={{ minWidth: '120px' }}
                          id="feature-flags-mcp-deployment-flow-menu-toggle"
                          aria-label="MCP Server deployment flow"
                        >
                          {mcpDeploymentFlow === 'modal' ? 'Modal' : 'Wizard'}
                        </MenuToggle>
                      )}
                    >
                      <SelectList>
                        <SelectOption value="modal">Modal</SelectOption>
                        <SelectOption value="wizard">Wizard</SelectOption>
                      </SelectList>
                    </Select>
                  </FlexItem>
                </Flex>

                <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Successful MCP deployment</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                        When on, deploy modal shows success message. When off, shows a failed deployment message (for
                        prototype).
                      </div>
                    </div>
                  </FlexItem>
                  <FlexItem>
                    <Switch
                      id="feature-flags-successful-mcp-deployment-switch"
                      isChecked={flags.successfulMcpDeployment}
                      onChange={(_event, checked) => updateFlag('successfulMcpDeployment', checked)}
                      aria-label="Successful MCP deployment"
                    />
                  </FlexItem>
                </Flex>
              </div>
            )}
          </CardBody>
        </Card>
      </PageSection>

      <PageSection>
        <Card id="feature-flags-layout-modes-card">
          <CardBody>
            <Title headingLevel="h2" size="lg" style={{ marginBottom: '1rem' }}>
              <DesktopIcon style={{ marginRight: '0.5rem', color: '#0066cc' }} />
              Layout modes
            </Title>

            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>IDE Layout</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Three-panel developer layout for advanced users
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="feature-flags-enable-ide-layout-switch"
                  isChecked={flags.enableIDELayout}
                  onChange={(_event, checked) => updateFlag('enableIDELayout', checked)}
                  aria-label="Enable IDE Layout"
                />
              </FlexItem>
            </Flex>

            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Workflow Layout</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Wizard-style step-by-step layout for guided workflows
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="feature-flags-enable-workflow-layout-switch"
                  isChecked={flags.enableWorkflowLayout}
                  onChange={(_event, checked) => updateFlag('enableWorkflowLayout', checked)}
                  aria-label="Enable Workflow Layout"
                />
              </FlexItem>
            </Flex>
          </CardBody>
        </Card>
      </PageSection>

      <PageSection>
        <Card id="feature-flags-agent-builder-card">
          <CardBody>
            <Title headingLevel="h2" size="lg" style={{ marginBottom: '1rem' }}>
              <FlaskIcon style={{ marginRight: '0.5rem', color: '#0066cc' }} />
              Agent Builder
            </Title>

            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Agent Builder Mode</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    When enabled, moves Agent Builder to the top-level navigation instead of being nested under Gen AI
                    Studio
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="agent-builder-mode-toggle"
                  isChecked={flags.agentBuilderMode}
                  onChange={() => updateFlag('agentBuilderMode', !flags.agentBuilderMode)}
                  aria-label="Toggle Agent Builder mode"
                />
              </FlexItem>
            </Flex>

            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Agent Templates</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Enable or disable agent templates tab in the Agent Builder
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="feature-flags-enable-agent-templates-switch"
                  isChecked={flags.enableAgentTemplates}
                  onChange={(_event, checked) => updateFlag('enableAgentTemplates', checked)}
                  aria-label="Enable Agent Templates"
                />
              </FlexItem>
            </Flex>

            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Guardrails</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Enable or disable guardrails configuration section
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="feature-flags-enable-guardrails-switch"
                  isChecked={flags.enableGuardrails}
                  onChange={(_event, checked) => updateFlag('enableGuardrails', checked)}
                  aria-label="Enable Guardrails"
                />
              </FlexItem>
            </Flex>

            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Evaluation & Testing</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Enable evaluation and testing tools for agent performance
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="feature-flags-enable-evaluation-switch"
                  isChecked={flags.enableEvaluation}
                  onChange={(_event, checked) => updateFlag('enableEvaluation', checked)}
                  aria-label="Enable Evaluation & Testing"
                />
              </FlexItem>
            </Flex>

            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Tracing</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    Enable agent execution tracing and monitoring capabilities
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="feature-flags-enable-tracing-switch"
                  isChecked={flags.enableTracing}
                  onChange={(_event, checked) => updateFlag('enableTracing', checked)}
                  aria-label="Enable Tracing"
                />
              </FlexItem>
            </Flex>

            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Deploy Mode</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                    When enabled, shows the staging deployment URL in the Agent Builder topology view
                  </div>
                </div>
              </FlexItem>
              <FlexItem>
                <Switch
                  id="deploy-mode-toggle"
                  isChecked={flags.deploy}
                  onChange={() => updateFlag('deploy', !flags.deploy)}
                  aria-label="Toggle Deploy mode"
                />
              </FlexItem>
            </Flex>
          </CardBody>
        </Card>
      </PageSection>
    </>
  );
};

export { FeatureFlags };
