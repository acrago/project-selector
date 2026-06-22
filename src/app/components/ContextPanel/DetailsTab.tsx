import React from 'react';
import {
  Alert,
  Avatar,
  Button,
  Content,
  Flex,
  FlexItem,
  List,
  ListItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { Link } from 'react-router-dom';
import { DesignFeatureData, getPersonaAvatarUrl } from '@app/utils/designData';
import { DetailsSection } from '@app/utils/designDataParser';

interface DetailsTabProps {
  feature: DesignFeatureData;
}

function renderTextWithLinks(text: string): React.ReactNode {
  const linkPattern = /\[([^\]]+)]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const isExternal = match[2].startsWith('http');
    parts.push(
      isExternal ? (
        <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer">
          {match[1]}
        </a>
      ) : (
        <Link key={match.index} to={match[2]}>
          {match[1]}
        </Link>
      )
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

function renderMarkdownSection(section: DetailsSection, index: number) {
  const lines = section.bodyMarkdown.split('\n');
  const bulletLines: string[] = [];
  const textLines: string[] = [];
  const boldSectionLines: { label: string; items: { text: string; url: string }[] }[] = [];

  let currentBoldSection: { label: string; items: { text: string; url: string }[] } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentBoldSection) {
        boldSectionLines.push(currentBoldSection);
        currentBoldSection = null;
      }
      continue;
    }

    const boldHeaderMatch = trimmed.match(/^\*\*(.+?):\*\*$/);
    if (boldHeaderMatch) {
      if (currentBoldSection) boldSectionLines.push(currentBoldSection);
      currentBoldSection = { label: boldHeaderMatch[1], items: [] };
      continue;
    }

    if (currentBoldSection && trimmed.startsWith('- ')) {
      const linkMatch = trimmed.match(/^- \[([^\]]+)]\(([^)]+)\)$/);
      if (linkMatch) {
        currentBoldSection.items.push({ text: linkMatch[1], url: linkMatch[2] });
      } else {
        currentBoldSection.items.push({ text: trimmed.slice(2), url: '' });
      }
      continue;
    }

    if (trimmed.startsWith('- ')) {
      bulletLines.push(trimmed.slice(2));
    } else {
      textLines.push(trimmed);
    }
  }
  if (currentBoldSection) boldSectionLines.push(currentBoldSection);

  const sectionId = section.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <StackItem key={index}>
      <Content>
        <Content component="h3" id={`details-section-${sectionId}`}>
          {section.heading}
        </Content>
      </Content>
      {textLines.length > 0 && (
        <Content component="p">{textLines.join(' ')}</Content>
      )}
      {bulletLines.length > 0 && (
        <List id={`details-list-${sectionId}`} style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
          {bulletLines.map((item, i) => (
            <ListItem key={i}>{item}</ListItem>
          ))}
        </List>
      )}
      {boldSectionLines.map((bs, bi) => (
        <div key={bi} style={{ marginTop: '8px' }}>
          <Content component="p"><strong>{bs.label}:</strong></Content>
          <List isPlain id={`details-${sectionId}-links-${bi}`}>
            {bs.items.map((item, ii) =>
              item.url ? (
                <ListItem key={ii}>
                  <Button
                    variant="link"
                    isInline
                    component="a"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    icon={<ExternalLinkAltIcon />}
                    iconPosition="end"
                    id={`details-${sectionId}-link-${bi}-${ii}`}
                  >
                    {item.text}
                  </Button>
                </ListItem>
              ) : (
                <ListItem key={ii}>{item.text}</ListItem>
              )
            )}
          </List>
        </div>
      ))}
    </StackItem>
  );
}

const DetailsTab: React.FunctionComponent<DetailsTabProps> = ({ feature }) => {
  const { overview, team } = feature;

  if (!overview) {
    return (
      <div style={{ padding: '16px 0' }}>
        <Content component="p" id="details-empty-state">
          No details available for this feature yet. Create a{' '}
          <code>feature-details.md</code> file in the feature&apos;s{' '}
          <code>.design/features/</code> folder to populate this tab.
        </Content>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 0', height: '100%', overflow: 'auto' }}>
      <Alert
        variant="info"
        isInline
        title="Check for mistakes"
        component="h4"
        id="details-ai-content-notice"
      >
        <p>Some of the content below was likely generated with AI and may not be fully accurate. If something looks off, please reach out to a team member to verify.</p>
      </Alert>
      <Stack hasGutter id="details-tab-content" style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
        <StackItem>
          <Content>
            <Content component="h3" id="details-what-heading">What is this?</Content>
            <Content component="p" id="details-description">{renderTextWithLinks(overview.description)}</Content>
          </Content>
        </StackItem>

        <StackItem>
          <Content>
            <Content component="h3" id="details-why-heading">Why is it needed?</Content>
            <Content component="p" id="details-rationale">{renderTextWithLinks(overview.rationale)}</Content>
          </Content>
        </StackItem>

        <StackItem>
          <Content>
            <Content component="h3" id="details-who-heading">Who does it help?</Content>
          </Content>
          {overview.personas.length > 0 && (
            <Table aria-label="Personas table" variant="compact" id="details-personas-table" style={{ '--pf-v6-c-table--cell--first-last-child--PaddingInline': '0' } as React.CSSProperties}>
              <Thead>
                <Tr>
                  <Th>Persona</Th>
                  <Th>Need</Th>
                </Tr>
              </Thead>
              <Tbody>
                {overview.personas.map((persona, index) => {
                  const avatarUrl = getPersonaAvatarUrl(persona.name);
                  return (
                    <Tr key={index}>
                      <Td>
                        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }} flexWrap={{ default: 'nowrap' }}>
                          {avatarUrl && (
                            <FlexItem flex={{ default: 'flexNone' }}>
                              <Avatar
                                src={avatarUrl}
                                alt={`${persona.name} portrait`}
                                size="md"
                                style={{ objectFit: 'cover' }}
                                id={`persona-avatar-${index}`}
                              />
                            </FlexItem>
                          )}
                          <FlexItem>{persona.name}</FlexItem>
                        </Flex>
                      </Td>
                      <Td>{persona.need}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}
        </StackItem>

        {overview.sections.map((section, index) => renderMarkdownSection(section, index))}

        {team.length > 0 && (
          <StackItem>
            <Content>
              <Content component="h3" id="details-team-heading">Who is working on this?</Content>
            </Content>
            <Table aria-label="Team members table" variant="compact" id="details-team-table" style={{ '--pf-v6-c-table--cell--first-last-child--PaddingInline': '0' } as React.CSSProperties}>
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Role</Th>
                </Tr>
              </Thead>
              <Tbody>
                {team.map((member, index) => (
                  <Tr key={index}>
                    <Td>{member.name}</Td>
                    <Td>{member.role || '—'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </StackItem>
        )}
      </Stack>
    </div>
  );
};

export default DetailsTab;
