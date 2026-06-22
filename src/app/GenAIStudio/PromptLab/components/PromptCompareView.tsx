import * as React from 'react';
import {
  Button,
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Title,
} from '@patternfly/react-core';
import { PromptVersion } from '../types';

interface PromptCompareViewProps {
  version1: PromptVersion;
  version2: PromptVersion;
}

// Line-by-line diff algorithm
const generateLineDiff = (text1: string, text2: string) => {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  
  const leftLines: Array<{ type: 'addition' | 'deletion' | 'unchanged'; text: string }> = [];
  const rightLines: Array<{ type: 'addition' | 'deletion' | 'unchanged'; text: string }> = [];
  
  const maxLines = Math.max(lines1.length, lines2.length);
  
  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i];
    const line2 = lines2[i];
    
    if (line1 === undefined) {
      // Only line2 exists - addition
      leftLines.push({ type: 'unchanged', text: '' });
      rightLines.push({ type: 'addition', text: line2 });
    } else if (line2 === undefined) {
      // Only line1 exists - deletion
      leftLines.push({ type: 'deletion', text: line1 });
      rightLines.push({ type: 'unchanged', text: '' });
    } else if (line1 === line2) {
      // Lines match
      leftLines.push({ type: 'unchanged', text: line1 });
      rightLines.push({ type: 'unchanged', text: line2 });
    } else {
      // Lines differ
      leftLines.push({ type: 'deletion', text: line1 });
      rightLines.push({ type: 'addition', text: line2 });
    }
  }
  
  return { left: leftLines, right: rightLines };
};

const DiffText: React.FC<{ lines: Array<{ type: 'addition' | 'deletion' | 'unchanged'; text: string }>; versionLabel: string; textContent: string }> = ({ lines, versionLabel, textContent }) => {
  return (
    <CodeBlock
      actions={
        <CodeBlockAction>
          <ClipboardCopyButton
            id={`copy-${versionLabel}-button`}
            textId={`${versionLabel}-code-content`}
            aria-label={`Copy ${versionLabel} to clipboard`}
            onClick={() => {
              navigator.clipboard.writeText(textContent);
            }}
            variant="plain"
          >
            Copy to clipboard
          </ClipboardCopyButton>
        </CodeBlockAction>
      }
    >
      <CodeBlockCode id={`${versionLabel}-code-content`}>
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {lines.map((line, index) => {
            let backgroundColor = 'transparent';
            let color = 'inherit';
            
            if (line.type === 'addition') {
              backgroundColor = 'var(--pf-v5-global--success-color--100)';
              color = 'var(--pf-v5-global--Color--light-100)';
            } else if (line.type === 'deletion') {
              backgroundColor = 'var(--pf-v5-global--danger-color--100)';
              color = 'var(--pf-v5-global--Color--light-100)';
            }
            
            return (
              <div
                key={index}
                style={{
                  backgroundColor,
                  color,
                  padding: line.type !== 'unchanged' ? '2px 4px' : '2px 0',
                  minHeight: '1.5em',
                }}
              >
                {line.text || '\u00A0'}
              </div>
            );
          })}
        </div>
      </CodeBlockCode>
    </CodeBlock>
  );
};

export const PromptCompareView: React.FunctionComponent<PromptCompareViewProps> = ({
  version1,
  version2,
}) => {
  const diff = React.useMemo(() => {
    return generateLineDiff(version1.promptText, version2.promptText);
  }, [version1.promptText, version2.promptText]);

  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <div id="prompt-compare-view">
      <Title headingLevel="h2" size="lg" style={{ marginBottom: 'var(--pf-v5-global--spacer--md)' }}>
        Comparing version {version1.versionNumber} with version {version2.versionNumber}
      </Title>

      <Grid hasGutter>
        <GridItem span={6}>
          <div id="compare-version-1">
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <Title headingLevel="h3" size="md">
                  Version {version1.versionNumber} (baseline)
                </Title>
              </FlexItem>
              
              <FlexItem>
                <div style={{ fontSize: 'var(--pf-v5-global--FontSize--sm)' }}>
                  <strong>Registered at:</strong> {formatDate(version1.registeredAt)}
                </div>
              </FlexItem>
              
              <FlexItem>
                <div style={{ fontSize: 'var(--pf-v5-global--FontSize--sm)' }}>
                  <strong>Aliases:</strong>{' '}
                  {version1.aliases.length > 0 ? (
                    version1.aliases.join(', ')
                  ) : (
                    <>
                      —{' '}
                      <Button variant="link" isInline style={{ fontSize: 'inherit', padding: 0 }} id="add-alias-v1">
                        Add
                      </Button>
                    </>
                  )}
                </div>
              </FlexItem>
              
              <FlexItem>
                <div style={{ fontSize: 'var(--pf-v5-global--FontSize--sm)' }}>
                  <strong>Metadata:</strong>{' '}
                  {Object.keys(version1.metadata).length > 0 ? (
                    JSON.stringify(version1.metadata)
                  ) : (
                    <>
                      —{' '}
                      <Button variant="link" isInline style={{ fontSize: 'inherit', padding: 0 }} id="add-metadata-v1">
                        Add
                      </Button>
                    </>
                  )}
                </div>
              </FlexItem>
            </Flex>
          </div>
        </GridItem>

        <GridItem span={6}>
          <div id="compare-version-2">
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <Title headingLevel="h3" size="md">
                  Version {version2.versionNumber}
                </Title>
              </FlexItem>
              
              <FlexItem>
                <div style={{ fontSize: 'var(--pf-v5-global--FontSize--sm)' }}>
                  <strong>Registered at:</strong> {formatDate(version2.registeredAt)}
                </div>
              </FlexItem>
              
              <FlexItem>
                <div style={{ fontSize: 'var(--pf-v5-global--FontSize--sm)' }}>
                  <strong>Aliases:</strong>{' '}
                  {version2.aliases.length > 0 ? (
                    version2.aliases.join(', ')
                  ) : (
                    <>
                      —{' '}
                      <Button variant="link" isInline style={{ fontSize: 'inherit', padding: 0 }} id="add-alias-v2">
                        Add
                      </Button>
                    </>
                  )}
                </div>
              </FlexItem>
              
              <FlexItem>
                <div style={{ fontSize: 'var(--pf-v5-global--FontSize--sm)' }}>
                  <strong>Metadata:</strong>{' '}
                  {Object.keys(version2.metadata).length > 0 ? (
                    JSON.stringify(version2.metadata)
                  ) : (
                    <>
                      —{' '}
                      <Button variant="link" isInline style={{ fontSize: 'inherit', padding: 0 }} id="add-metadata-v2">
                        Add
                      </Button>
                    </>
                  )}
                </div>
              </FlexItem>
            </Flex>
          </div>
        </GridItem>
      </Grid>

      <div style={{ marginTop: 'var(--pf-v5-global--spacer--lg)' }}>
        <Grid hasGutter>
          <GridItem span={6}>
            <DiffText 
              lines={diff.left} 
              versionLabel={`version-${version1.versionNumber}`}
              textContent={version1.promptText}
            />
          </GridItem>
          <GridItem span={6}>
            <DiffText 
              lines={diff.right} 
              versionLabel={`version-${version2.versionNumber}`}
              textContent={version2.promptText}
            />
          </GridItem>
        </Grid>
      </div>
    </div>
  );
};

