import * as React from 'react';
import {
  Alert,
  Button,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormGroupLabelHelp,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Popover,
  Select,
  SelectList,
  SelectOption,
  TextArea,
  TextInput,
} from '@patternfly/react-core';
import { PromptType } from '../types';

interface CreatePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (promptData: {
    name: string;
    promptType: PromptType;
    promptText: string;
    commitMessage?: string;
  }) => Promise<void>;
  initialPromptText?: string;
  initialName?: string;
}

const SYSTEM_PROMPT_EXPLANATION_TITLE =
  'Only system prompts can be saved from the playground. Use the prompt management page to create more complex prompts';

export const CreatePromptModal: React.FunctionComponent<CreatePromptModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialPromptText = '',
  initialName = '',
}) => {
  const [name, setName] = React.useState(initialName);
  const [promptText, setPromptText] = React.useState(initialPromptText);
  const [commitMessage, setCommitMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!isOpen) return;
    setName(initialName);
    setPromptText(initialPromptText);
    setCommitMessage('');
    setErrors({});
  }, [isOpen, initialName, initialPromptText]);

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Name is required';
    if (!promptText.trim()) nextErrors.promptText = 'Prompt is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        promptType: 'text',
        promptText: promptText.trim(),
        commitMessage: commitMessage.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error creating prompt:', error);
      setErrors({ submit: 'Failed to save prompt. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      id="create-prompt-modal"
    >
      <ModalHeader
        title="Save prompt"
        description="Create a new managed chat prompt in your project."
      />
      <ModalBody>
        <Form>
          {(errors.name || errors.promptText) && (
            <Alert
              isInline
              variant="danger"
              title="Enter a prompt name and prompt text to continue."
              id="save-prompt-validation-alert"
              className="pf-v6-u-mb-md"
            />
          )}

          <FormGroup label="Name" isRequired fieldId="prompt-name">
            <TextInput
              isRequired
              id="prompt-name"
              name="prompt-name"
              value={name}
              validated={errors.name ? 'error' : 'default'}
              onChange={(_event, value) => {
                setName(value);
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: '' }));
                }
              }}
            />
          </FormGroup>

          <FormGroup
            label="Prompt"
            isRequired
            fieldId="prompt-text"
            labelHelp={(
              <Popover
                triggerAction="hover"
                position="right"
                appendTo={() => document.body}
                bodyContent={SYSTEM_PROMPT_EXPLANATION_TITLE}
              >
                <FormGroupLabelHelp
                  aria-label="More info for prompt type in save prompt modal"
                  aria-describedby="prompt-text"
                  id="save-prompt-type-info-button"
                />
              </Popover>
            )}
          >
            <Flex
              direction={{ default: 'column' }}
              gap={{ default: 'gapMd' }}
              id="save-prompt-fields"
            >
              <FlexItem>
                <Select
                  id="prompt-type-select"
                  isOpen={false}
                  selected="system"
                  onOpenChange={() => undefined}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      id="prompt-type-select-toggle"
                      isExpanded={false}
                      isDisabled
                    >
                      System
                    </MenuToggle>
                  )}
                >
                  <SelectList>
                    <SelectOption value="system">System</SelectOption>
                  </SelectList>
                </Select>
              </FlexItem>
              <FlexItem>
                <TextArea
                  isRequired
                  id="prompt-text"
                  name="prompt-text"
                  value={promptText}
                  validated={errors.promptText ? 'error' : 'default'}
                  rows={10}
                  onChange={(_event, value) => {
                    setPromptText(value);
                    if (errors.promptText) {
                      setErrors((prev) => ({ ...prev, promptText: '' }));
                    }
                  }}
                />
              </FlexItem>
            </Flex>
          </FormGroup>

          <FormGroup label="Commit message" fieldId="commit-message">
            <TextInput
              id="commit-message"
              name="commit-message"
              value={commitMessage}
              placeholder="Describe your changes"
              onChange={(_event, value) => setCommitMessage(value)}
            />
          </FormGroup>

          {errors.submit && (
            <Alert
              isInline
              variant="danger"
              title={errors.submit}
              id="save-prompt-submit-alert"
              className="pf-v6-u-mt-md"
            />
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          key="create"
          variant="primary"
          onClick={handleSubmit}
          isDisabled={isSubmitting}
          isLoading={isSubmitting}
          id="create-prompt-button"
        >
          Create
        </Button>
        <Button
          key="cancel"
          variant="link"
          onClick={() => !isSubmitting && onClose()}
          isDisabled={isSubmitting}
          id="cancel-create-prompt-button"
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
