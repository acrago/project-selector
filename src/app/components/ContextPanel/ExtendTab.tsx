import React from 'react';
import { Content, List, ListItem, Stack, StackItem, Title } from '@patternfly/react-core';
import { BookOpenIcon, LinkIcon } from '@patternfly/react-icons';

interface ExtendTabProps {
  featureId: string;
}

const ExtendTab: React.FunctionComponent<ExtendTabProps> = ({ featureId }) => (
  <div style={{ padding: '16px 0' }} id="extend-tab-content">
    <Stack hasGutter>
      <StackItem>
        <Content component="p" id="extend-tab-intro">
          You can add optional content to this feature&apos;s context so it appears in the panel tabs.
        </Content>
      </StackItem>
      <StackItem>
        <Title headingLevel="h3" size="md" id="extend-tab-journeys-heading">
          <BookOpenIcon style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Journeys
        </Title>
        <Content component="p" style={{ marginTop: '6px', marginBottom: '4px' }}>
          Step-by-step walkthroughs (e.g. &quot;How to create an API key&quot;). Add a file to enable the Journeys tab:
        </Content>
        <List isPlain id="extend-tab-journeys-list">
          <ListItem>
            <code>.design/features/{featureId}/feature-journeys.md</code>
          </ListItem>
        </List>
      </StackItem>
      <StackItem>
        <Title headingLevel="h3" size="md" id="extend-tab-sources-heading">
          <LinkIcon style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Sources
        </Title>
        <Content component="p" style={{ marginTop: '6px', marginBottom: '4px' }}>
          Links to recordings, docs, and other context. Add a file in a version folder to enable the Sources tab:
        </Content>
        <List isPlain id="extend-tab-sources-list">
          <ListItem>
            <code>.design/features/{featureId}/3.4/3.4-context-sources.md</code>
          </ListItem>
          <ListItem style={{ marginTop: '4px', color: 'var(--pf-t--global--text--color--subtle)', fontSize: '12px' }}>
            (Use your release folder name instead of 3.4 if different.)
          </ListItem>
        </List>
      </StackItem>
      <StackItem>
        <Content
          component="p"
          style={{ fontSize: '12px', color: 'var(--pf-t--global--text--color--subtle)' }}
          id="extend-tab-readme-note"
        >
          See <code>.design/README.md</code> in the repo for format and examples.
        </Content>
      </StackItem>
    </Stack>
  </div>
);

export default ExtendTab;
