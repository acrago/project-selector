import React from 'react';
import {
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  ClipboardCopyButton,
} from '@patternfly/react-core';
import { ClassifiedError } from './types';

interface ErrorBodyProps {
  classifiedError: ClassifiedError;
}

export const ErrorBody: React.FC<ErrorBodyProps> = ({ classifiedError }) => {
  const [copied, setCopied] = React.useState(false);
  const rawError = `[${classifiedError.details.errorCode}] ${classifiedError.details.rawMessage}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawError);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <p>{classifiedError.description}</p>
      <CodeBlock
        actions={
          <CodeBlockAction>
            <ClipboardCopyButton
              id={`copy-error-${classifiedError.details.errorCode}`}
              textId="error-code"
              aria-label="Copy error to clipboard"
              onClick={handleCopy}
              variant="plain"
            >
              {copied ? 'Copied' : 'Copy'}
            </ClipboardCopyButton>
          </CodeBlockAction>
        }
      >
        <CodeBlockCode>{rawError}</CodeBlockCode>
      </CodeBlock>
    </>
  );
};
