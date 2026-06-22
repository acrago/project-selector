import React from 'react';
import { 
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FlexItem,
  Title
} from '@patternfly/react-core';
import {
  CopyIcon,
  DownloadIcon
} from '@patternfly/react-icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeWindowProps {
  code: string;
  language?: 'python' | 'yaml' | 'json' | 'javascript' | 'typescript' | 'shell' | 'text';
  title?: string;
  showHeader?: boolean;
  showLineNumbers?: boolean;
  maxHeight?: string;
  onCopy?: () => void;
  onDownload?: () => void;
}

const CodeWindow: React.FunctionComponent<CodeWindowProps> = ({
  code,
  language = 'text',
  title,
  showHeader = true,
  showLineNumbers = true,
  maxHeight = '400px',
  onCopy,
  onDownload
}) => {
  const lines = code.split('\n');

  const getLanguageColor = (lang: string): string => {
    const colors: { [key: string]: string } = {
      python: '#3776ab',
      yaml: '#cb171e', 
      json: '#000000',
      javascript: '#f7df1e',
      typescript: '#007acc',
      shell: '#4eaa25',
      text: '#6a6e73'
    };
    return colors[lang] || colors.text;
  };

  const getSyntaxHighlighterLanguage = (lang: string): string => {
    const languageMap: { [key: string]: string } = {
      python: 'python',
      yaml: 'yaml',
      json: 'json',
      javascript: 'javascript',
      typescript: 'typescript',
      shell: 'bash',
      text: 'text'
    };
    return languageMap[lang] || 'text';
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      onCopy?.();
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language === 'text' ? 'txt' : language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onDownload?.();
  };

  return (
    <>
      <Card>
        {showHeader && (
          <CardHeader
            style={{
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid var(--pf-v5-global--BorderColor--100)'
            }}
          >
            <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  {title && (
                    <FlexItem>
                      <Title headingLevel="h4" size="md">{title}</Title>
                    </FlexItem>
                  )}
                  <FlexItem>
                    <div 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: getLanguageColor(language),
                        color: 'white',
                        borderRadius: '3px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    >
                      {language}
                    </div>
                  </FlexItem>
                </Flex>
              </FlexItem>
              <FlexItem>
                <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <Button
                      variant="plain"
                      size="sm"
                      icon={<CopyIcon />}
                      aria-label="Copy code"
                      onClick={handleCopy}
                    />
                  </FlexItem>
                  <FlexItem>
                    <Button
                      variant="plain"
                      size="sm"
                      icon={<DownloadIcon />}
                      aria-label="Download code"
                      onClick={handleDownload}
                    />
                  </FlexItem>
                </Flex>
              </FlexItem>
            </Flex>
          </CardHeader>
        )}
        <CardBody style={{ padding: 0 }}>
          <div
            style={{
              display: 'flex',
              maxHeight,
              overflow: 'auto',
              backgroundColor: '#f8f9fa',
              border: '1px solid var(--pf-v5-global--BorderColor--100)',
              borderRadius: showHeader ? '0 0 4px 4px' : '4px',
              fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", "Courier New", monospace',
              fontSize: '0.875rem',
              lineHeight: '1.5'
            }}
          >
            {/* Line Numbers */}
            {showLineNumbers && (
              <div
                style={{
                  backgroundColor: '#e9ecef',
                  borderRight: '1px solid var(--pf-v5-global--BorderColor--100)',
                  padding: '0.75rem 0.5rem',
                  minWidth: '3rem',
                  textAlign: 'right',
                  color: '#6a6e73',
                  fontSize: '0.8rem',
                  userSelect: 'none',
                  fontFamily: 'inherit',
                  flexShrink: 0
                }}
              >
                {lines.map((_, index) => (
                  <div key={index} style={{ height: '1.5em' }}>
                    {index + 1}
                  </div>
                ))}
              </div>
            )}
            
            {/* Code Content */}
            <div
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#ffffff',
                whiteSpace: 'pre',
                fontFamily: 'inherit'
              }}
            >
              <SyntaxHighlighter 
                language={getSyntaxHighlighterLanguage(language)} 
                style={oneLight}
                showLineNumbers={false}
                customStyle={{
                  margin: 0,
                  padding: 0,
                  backgroundColor: 'transparent',
                  fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", "Courier New", monospace',
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}
                codeTagProps={{
                  style: {
                    fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", "Courier New", monospace',
                    fontSize: '0.875rem',
                    lineHeight: '1.5'
                  }
                }}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
};

export { CodeWindow }; 