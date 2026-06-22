import * as React from 'react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  TextInput,
  Title,
} from '@patternfly/react-core';
import { replaceVariables, usePromptVariables } from '../hooks/usePromptVariables';
import { PromptVariable } from '../types';

interface PromptVariableEditorProps {
  promptText: string;
  onPromptUpdate: (updatedText: string) => void;
  id?: string;
}

export const PromptVariableEditor: React.FunctionComponent<PromptVariableEditorProps> = ({
  promptText,
  onPromptUpdate,
  id = 'prompt-variable-editor',
}) => {
  const variableNames = usePromptVariables(promptText);
  const [variables, setVariables] = React.useState<PromptVariable[]>([]);

  // Initialize variables when prompt text changes
  React.useEffect(() => {
    const newVariables: PromptVariable[] = variableNames.map((name) => ({
      name,
      value: variables.find((v) => v.name === name)?.value || '',
    }));
    setVariables(newVariables);
  }, [variableNames]);

  const handleVariableChange = (name: string, value: string) => {
    setVariables((prev) =>
      prev.map((v) => (v.name === name ? { ...v, value } : v))
    );
  };

  const handleApplyVariables = () => {
    const updatedText = replaceVariables(promptText, variables);
    onPromptUpdate(updatedText);
  };

  const unfilledCount = variables.filter((v) => !v.value).length;

  if (variableNames.length === 0) {
    return null;
  }

  return (
    <Card id={id}>
      <CardTitle>
        <Title headingLevel="h3" size="md">
          Variables{' '}
          {unfilledCount > 0 && (
            <Badge isRead={false}>{unfilledCount} unfilled</Badge>
          )}
        </Title>
      </CardTitle>
      <CardBody>
        <Form id={`${id}-form`}>
          {variables.map((variable) => (
            <FormGroup
              key={variable.name}
              label={variable.name}
              fieldId={`${id}-${variable.name}`}
            >
              <TextInput
                type="text"
                id={`${id}-${variable.name}`}
                value={variable.value || ''}
                onChange={(_event, value) => handleVariableChange(variable.name, value)}
                placeholder={`Enter value for ${variable.name}`}
              />
            </FormGroup>
          ))}
          <Button
            variant="primary"
            onClick={handleApplyVariables}
            id={`${id}-apply-button`}
            style={{ marginTop: 'var(--pf-v5-global--spacer--md)' }}
          >
            Apply variables
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
};

