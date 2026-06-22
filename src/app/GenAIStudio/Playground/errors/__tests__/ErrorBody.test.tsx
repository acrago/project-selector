import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ErrorBody } from '../ErrorBody';
import { ClassifiedError } from '../types';

const mockError: ClassifiedError = {
  pattern: 'full-failure',
  variant: 'danger',
  title: 'Model inference failed',
  description: "The model server didn't respond in time. This may be a temporary issue.",
  details: {
    component: 'Llama Stack',
    errorCode: 'TIMEOUT',
    rawMessage: '{"error": "upstream timeout after 30s"}',
  },
  isRetriable: true,
};

describe('ErrorBody', () => {
  it('renders the description text', () => {
    render(<ErrorBody classifiedError={mockError} />);
    expect(screen.getByText(/model server didn't respond/)).toBeInTheDocument();
  });

  it('renders a code block with error code and raw message', () => {
    const { container } = render(<ErrorBody classifiedError={mockError} />);
    const codeBlock = container.querySelector('.pf-v6-c-code-block');
    expect(codeBlock).toBeTruthy();
    expect(codeBlock?.textContent).toContain('[TIMEOUT]');
    expect(codeBlock?.textContent).toContain('upstream timeout after 30s');
  });

  it('renders a copy button', () => {
    render(<ErrorBody classifiedError={mockError} />);
    expect(screen.getByLabelText('Copy error to clipboard')).toBeInTheDocument();
  });
});
