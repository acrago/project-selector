import { useMemo } from 'react';
import { PromptVariable } from '../types';

/**
 * Custom hook to extract variables from prompt text
 * Variables are denoted by double curly braces, e.g., {{ variableName }}
 */
export const usePromptVariables = (promptText: string): string[] => {
  return useMemo(() => {
    const regex = /\{\{\s*(\w+)\s*\}\}/g;
    const matches = promptText.matchAll(regex);
    const variables = Array.from(matches, (m) => m[1]);
    // Remove duplicates
    return [...new Set(variables)];
  }, [promptText]);
};

/**
 * Replace variables in prompt text with their values
 */
export const replaceVariables = (
  promptText: string,
  variables: PromptVariable[]
): string => {
  let result = promptText;
  
  variables.forEach((variable) => {
    if (variable.value !== undefined && variable.value !== '') {
      // Replace all occurrences of {{ variableName }} with the value
      const regex = new RegExp(`\\{\\{\\s*${variable.name}\\s*\\}\\}`, 'g');
      result = result.replace(regex, variable.value);
    }
  });
  
  return result;
};

