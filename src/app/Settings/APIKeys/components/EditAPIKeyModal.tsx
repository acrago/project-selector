import * as React from 'react';
import {
  Button,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  TextArea,
  TextInput,
} from '@patternfly/react-core';
import { APIKey } from '../types';

interface EditAPIKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: APIKey | null;
  onSave: (updatedKey: APIKey) => void;
}

const EditAPIKeyModal: React.FunctionComponent<EditAPIKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSave,
}) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Update form when apiKey changes
  React.useEffect(() => {
    if (apiKey) {
      setName(apiKey.name);
      setDescription(apiKey.description || '');
    }
  }, [apiKey]);

  const handleSubmit = async () => {
    if (!apiKey) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedKey: APIKey = {
      ...apiKey,
      name: name.trim(),
      description: description.trim() || undefined,
    };

    onSave(updatedKey);
    setIsSubmitting(false);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  const isFormValid = () => {
    return name.trim() !== '';
  };

  if (!apiKey) return null;

  return (
    <Modal
      variant={ModalVariant.medium}
      title="Edit API key"
      isOpen={isOpen}
      onClose={handleClose}
      id="edit-api-key-modal"
    >
      <ModalHeader title="Edit API key" />
      <ModalBody>
        <Form id="edit-api-key-form">
          <FormGroup label="Name" isRequired fieldId="edit-api-key-name">
            <TextInput
              isRequired
              type="text"
              id="edit-api-key-name"
              name="edit-api-key-name"
              value={name}
              onChange={(_event, value) => setName(value)}
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem>A descriptive name for this API key</HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>

          <FormGroup label="Description" fieldId="edit-api-key-description">
            <TextArea
              id="edit-api-key-description"
              name="edit-api-key-description"
              value={description}
              onChange={(_event, value) => setDescription(value)}
              rows={3}
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem>Optional description of how this key is used</HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={!isFormValid() || isSubmitting}
          id="edit-key-save-button"
        >
          Save
        </Button>
        <Button variant="link" onClick={handleClose} id="edit-key-cancel-button">
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { EditAPIKeyModal };
