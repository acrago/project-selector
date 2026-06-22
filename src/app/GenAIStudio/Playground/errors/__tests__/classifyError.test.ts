import { classifyError } from '../classifyError';
import { ApiError } from '../types';

describe('classifyError', () => {
  describe('full failures', () => {
    it('classifies model config errors as non-retriable full failures', () => {
      const error: ApiError = {
        status: 400,
        error: { component: 'model', code: 'max_tokens', message: 'max_tokens exceeds limit' },
      };
      const result = classifyError(error, { modelName: 'Falcon 7B' });

      expect(result.pattern).toBe('full-failure');
      expect(result.variant).toBe('danger');
      expect(result.isRetriable).toBe(false);
      expect(result.title).toBe('Token limit exceeds model capacity');
      expect(result.description).toContain('Falcon 7B');
    });

    it('classifies unsupported tool calling as non-retriable full failure', () => {
      const error: ApiError = {
        status: 400,
        error: { component: 'model', code: 'no_tools', message: 'tools not supported' },
      };
      const result = classifyError(error, { modelName: 'Falcon 7B' });

      expect(result.pattern).toBe('full-failure');
      expect(result.isRetriable).toBe(false);
      expect(result.title).toContain('tool calling');
    });

    it('classifies llama stack timeout as retriable full failure', () => {
      const error: ApiError = {
        status: 504,
        error: { component: 'llama_stack', code: 'timeout', message: 'upstream timeout' },
      };
      const result = classifyError(error);

      expect(result.pattern).toBe('full-failure');
      expect(result.isRetriable).toBe(true);
      expect(result.title).toBe('Model inference failed');
    });

    it('classifies 429 as retriable rate limit error', () => {
      const error: ApiError = { status: 429, message: 'Too Many Requests' };
      const result = classifyError(error);

      expect(result.pattern).toBe('full-failure');
      expect(result.isRetriable).toBe(true);
      expect(result.title).toBe('Request was rate limited');
    });

    it('classifies 500/502/504 without component as network errors', () => {
      const error: ApiError = { status: 502, message: 'Bad Gateway' };
      const result = classifyError(error);

      expect(result.pattern).toBe('full-failure');
      expect(result.isRetriable).toBe(true);
      expect(result.title).toBe("Couldn't reach the server");
    });
  });

  describe('partial failures', () => {
    it('classifies RAG errors as warning partial failures', () => {
      const error: ApiError = {
        error: { component: 'rag', code: 'unreachable', message: 'vector store down' },
      };
      const result = classifyError(error);

      expect(result.pattern).toBe('partial-failure');
      expect(result.variant).toBe('warning');
      expect(result.isRetriable).toBe(false);
      expect(result.title).toBe('Knowledge source retrieval failed');
    });

    it('classifies guardrail errors as warning partial failures', () => {
      const error: ApiError = {
        error: { component: 'guardrails', code: 'service_down', message: 'guardrail unavailable' },
      };
      const result = classifyError(error);

      expect(result.pattern).toBe('partial-failure');
      expect(result.variant).toBe('warning');
      expect(result.title).toBe('Guardrail check was not applied');
    });

    it('classifies MCP errors as warning partial failures with tool name', () => {
      const error: ApiError = {
        error: {
          component: 'mcp',
          code: 'unreachable',
          message: 'connection timeout',
          tool_name: 'Jira',
        },
      };
      const result = classifyError(error, { toolName: 'Jira' });

      expect(result.pattern).toBe('partial-failure');
      expect(result.variant).toBe('warning');
      expect(result.title).toBe('Jira tool call failed');
    });
  });

  describe('fallback', () => {
    it('returns a retriable full failure for unknown errors', () => {
      const error: ApiError = { status: 418, message: "I'm a teapot" };
      const result = classifyError(error);

      expect(result.pattern).toBe('full-failure');
      expect(result.variant).toBe('danger');
      expect(result.isRetriable).toBe(true);
      expect(result.title).toBe('Something went wrong');
    });
  });

  describe('details', () => {
    it('populates details from the API error', () => {
      const error: ApiError = {
        status: 503,
        error: {
          component: 'guardrails',
          code: 'service_down',
          message: 'guardrail service returned 503',
        },
      };
      const result = classifyError(error);

      expect(result.details.component).toBe('Guardrails');
      expect(result.details.errorCode).toBe('service_down');
      expect(result.details.rawMessage).toBe('guardrail service returned 503');
    });
  });
});
