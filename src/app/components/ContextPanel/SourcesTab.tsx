import React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Content,
  Flex,
  FlexItem,
  List,
  ListItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import {
  CubeIcon,
  FolderIcon,
  GlobeIcon,
  OptimizeIcon,
  VideoIcon,
} from '@patternfly/react-icons';
import { ContextSources } from '@app/utils/designData';

import slackLogo from '../../../../.design/assets/logos/logo-slack.svg';
import googleDocsLogo from '../../../../.design/assets/logos/logo-google-docs.svg';
import googleSlidesLogo from '../../../../.design/assets/logos/logo-google-slides.svg';
import jiraLogo from '../../../../.design/assets/logos/logo-jira.svg';
import githubLogo from '../../../../.design/assets/logos/logo-github.svg';
import miroLogo from '../../../../.design/assets/logos/logo-miro.svg';

interface SourcesTabProps {
  sources: ContextSources;
}

const LogoIcon: React.FunctionComponent<{ svg: string; label: string }> = ({ svg, label }) => (
  <img
    src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
    alt={label}
    width={18}
    height={18}
    style={{ objectFit: 'contain' }}
  />
);

const categoryLogos: Record<string, string> = {
  Slack: slackLogo,
  Docs: googleDocsLogo,
  Slides: googleSlidesLogo,
  Jira: jiraLogo,
  Repositories: githubLogo,
  Diagrams: miroLogo,
};

const categoryFallbackIcons: Record<string, React.ReactNode> = {
  Repositories: <CubeIcon />,
  Notebooks: <FolderIcon />,
  Recordings: <VideoIcon />,
  Diagrams: <OptimizeIcon />,
  Other: <GlobeIcon />,
};

function getIconForCategory(category: string): React.ReactNode {
  for (const [key, svg] of Object.entries(categoryLogos)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      return <LogoIcon svg={svg} label={key} />;
    }
  }
  for (const [key, icon] of Object.entries(categoryFallbackIcons)) {
    if (category.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return <GlobeIcon />;
}

const SourcesTab: React.FunctionComponent<SourcesTabProps> = ({ sources }) => {
  const categories = Object.keys(sources);

  if (categories.length === 0) {
    return (
      <div style={{ padding: '16px 0' }}>
        <Content component="p" id="sources-empty-state">
          No sources available for this feature yet. Create a{' '}
          <code>context-sources.md</code> file in the feature&apos;s version folder to populate this tab.
        </Content>
      </div>
    );
  }

  const primaryCategories = categories.filter((c) => !c.includes('(from history)'));
  const historyCategories = categories.filter((c) => c.includes('(from history)'));

  return (
    <div style={{ padding: '16px 0', height: '100%', overflow: 'auto' }}>
      <Stack hasGutter id="sources-tab-content">
        {primaryCategories.map((category) => (
          <StackItem key={category}>
            <Card isCompact id={`sources-card-${category.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardTitle>
                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>{getIconForCategory(category)}</FlexItem>
                  <FlexItem>
                    <Title headingLevel="h3" size="md" id={`sources-title-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                      {category}
                    </Title>
                  </FlexItem>
                </Flex>
              </CardTitle>
              <CardBody>
                <List isPlain id={`sources-list-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                  {sources[category].map((link, index) => (
                    <ListItem key={index}>
                      <Button
                        variant="link"
                        isInline
                        component="a"
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        id={`source-link-${category.toLowerCase().replace(/\s+/g, '-')}-${index}`}
                      >
                        {link.title}
                      </Button>
                      {link.description && (
                        <Content component="small" style={{ display: 'block', color: 'var(--pf-t--global--text--color--subtle)' }}>
                          {link.description}
                        </Content>
                      )}
                    </ListItem>
                  ))}
                </List>
              </CardBody>
            </Card>
          </StackItem>
        ))}

        {historyCategories.length > 0 && (
          <>
            <StackItem>
              <Content component="h3" id="sources-from-history-heading" style={{ marginTop: '8px' }}>
                Links from design history
              </Content>
            </StackItem>
            {historyCategories.map((category) => {
              const displayName = category.replace(' (from history)', '');
              return (
                <StackItem key={category}>
                  <Card isCompact id={`sources-history-card-${displayName.toLowerCase().replace(/\s+/g, '-')}`}>
                    <CardTitle>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                        <FlexItem>{getIconForCategory(displayName)}</FlexItem>
                        <FlexItem>
                          <Title headingLevel="h3" size="md" id={`sources-history-title-${displayName.toLowerCase().replace(/\s+/g, '-')}`}>
                            {displayName}
                          </Title>
                        </FlexItem>
                      </Flex>
                    </CardTitle>
                    <CardBody>
                      <List isPlain id={`sources-history-list-${displayName.toLowerCase().replace(/\s+/g, '-')}`}>
                        {sources[category].map((link, index) => (
                          <ListItem key={index}>
                            <Button
                              variant="link"
                              isInline
                              component="a"
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              id={`source-history-link-${displayName.toLowerCase().replace(/\s+/g, '-')}-${index}`}
                            >
                              {link.title}
                            </Button>
                            {link.description && (
                              <Content component="small" style={{ display: 'block', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                {link.description}
                              </Content>
                            )}
                          </ListItem>
                        ))}
                      </List>
                    </CardBody>
                  </Card>
                </StackItem>
              );
            })}
          </>
        )}
      </Stack>
    </div>
  );
};

export default SourcesTab;
