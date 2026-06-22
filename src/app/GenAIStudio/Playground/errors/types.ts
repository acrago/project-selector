export type ErrorPattern = 'full-failure' | 'partial-failure' | 'streaming-interruption';
export type ErrorVariant = 'danger' | 'warning';

export interface ErrorDetails {
  component: string;
  errorCode: string;
  rawMessage: string;
}

export interface ClassifiedError {
  pattern: ErrorPattern;
  variant: ErrorVariant;
  title: string;
  description: string;
  details: ErrorDetails;
  isRetriable: boolean;
  actionSuggestion?: string;
}

export interface ApiError {
  status?: number;
  error?: {
    component?: 'guardrails' | 'rag' | 'mcp' | 'model' | 'llama_stack' | 'bff';
    code?: string;
    message?: string;
    tool_name?: string;
    retriable?: boolean;
  };
  message?: string;
}
