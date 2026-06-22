import * as React from 'react';
import {
  Alert,
  Button,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormGroupLabelHelp,
  Grid,
  GridItem,
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
import { Prompt, PromptType } from '../types';

interface CreateVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (versionData: {
    versionNumber: string;
    promptType: PromptType;
    promptText: string;
    commitMessage?: string;
  }) => Promise<void>;
  existingPrompt?: Prompt;
  currentPromptText?: string;
}

const SYSTEM_PROMPT_EXPLANATION_TITLE =
  'Only system prompts can be saved from the playground. Use the prompt management page to create more complex prompts';

const getLatestIntegerVersion = (prompt?: Prompt): number => {
  if (!prompt) return 1;

  const byLatestField = Number(prompt.latestVersion);
  if (!Number.isNaN(byLatestField) && Number.isFinite(byLatestField)) {
    return Math.max(1, Math.trunc(byLatestField));
  }

  const allVersions = prompt.versions || [];
  const maxVersion = allVersions.reduce((acc, version) => {
    const parsed = Number(version.versionNumber);
    if (Number.isNaN(parsed) || !Number.isFinite(parsed)) return acc;
    return Math.max(acc, Math.trunc(parsed));
  }, 1);
  return Math.max(1, maxVersion);
};

export const CreateVersionModal: React.FunctionComponent<CreateVersionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingPrompt,
  currentPromptText,
}) => {
  const [promptName, setPromptName] = React.useState('');
  const [versionNumber, setVersionNumber] = React.useState('2');
  const [promptText, setPromptText] = React.useState('');
  const [commitMessage, setCommitMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!isOpen) return;
    const resolvedName = existingPrompt?.name || '';
    const nextVersion = getLatestIntegerVersion(existingPrompt) + 1;
    setPromptName(resolvedName);
    setVersionNumber(`${nextVersion}`);
    setPromptText(currentPromptText || existingPrompt?.versions?.slice(-1)[0]?.promptText || '');
    setCommitMessage('');
    setErrors({});
  }, [isOpen, existingPrompt, currentPromptText]);

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!promptName.trim()) nextErrors.name = 'Name is required';
    if (!promptText.trim()) nextErrors.promptText = 'Prompt is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        versionNumber,
        promptType: 'text',
        promptText: promptText.trim(),
        commitMessage: commitMessage.trim() || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error creating version:', error);
      setErrors({ submit: 'Failed to save version. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      id="create-version-modal"
    >
      <ModalHeader
        title="New prompt version"
        description="Create a new version of this chat prompt in your project."
      />
      <ModalBody>
        <Form>
          {(errors.name || errors.promptText) && (
            <Alert
              isInline
              variant="danger"
              title="Enter a prompt name and prompt text to continue."
              id="save-version-validation-alert"
              className="pf-v6-u-mb-md"
            />
          )}

          <Grid hasGutter>
            <GridItem span={8}>
              <FormGroup label="Name" isRequired fieldId="version-prompt-name">
                <TextInput
                  readOnly
                  readOnlyVariant="default"
                  aria-readonly="true"
                  id="version-prompt-name"
                  value={promptName}
                  validated={errors.name ? 'error' : 'default'}
                />
              </FormGroup>
            </GridItem>
            <GridItem span={4}>
              <FormGroup label="Version" isRequired fieldId="version-number">
                <TextInput
                  readOnly
                  readOnlyVariant="default"
                  aria-readonly="true"
                  id="version-number"
                  value={versionNumber}
                />
              </FormGroup>
            </GridItem>
          </Grid>

          <FormGroup
            label="Prompt"
            isRequired
            fieldId="version-prompt-text"
            labelHelp={(
              <Popover
                triggerAction="hover"
                position="right"
                appendTo={() => document.body}
                bodyContent={SYSTEM_PROMPT_EXPLANATION_TITLE}
              >
                <FormGroupLabelHelp
                  aria-label="More info for prompt type in version modal"
                  aria-describedby="version-prompt-text"
                  id="save-version-type-info-button"
                />
              </Popover>
            )}
          >
            <Flex
              direction={{ default: 'column' }}
              gap={{ default: 'gapMd' }}
              id="save-version-fields"
            >
              <FlexItem>
                <Select
                  id="version-prompt-type-select"
                  isOpen={false}
                  selected="system"
                  onOpenChange={() => undefined}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      id="version-prompt-type-toggle"
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
                  id="version-prompt-text"
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

          <FormGroup label="Commit message" fieldId="version-commit-message">
            <TextInput
              id="version-commit-message"
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
              id="save-version-submit-alert"
              className="pf-v6-u-mt-md"
            />
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          key="save"
          variant="primary"
          onClick={handleSubmit}
          isDisabled={isSubmitting}
          isLoading={isSubmitting}
          id="create-version-button"
        >
          Save
        </Button>
        <Button
          key="cancel"
          variant="link"
          onClick={() => !isSubmitting && onClose()}
          isDisabled={isSubmitting}
          id="cancel-create-version-button"
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
