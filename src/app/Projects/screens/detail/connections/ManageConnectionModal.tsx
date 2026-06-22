import * as React from 'react';
import {
  Button,
  Form,
  FormGroup,
  FormHelperText,
  FormSelect,
  FormSelectOption,
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
import { Connection } from './ConnectionsTable';

interface ManageConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (connection: Omit<Connection, 'id' | 'createdDate'>) => Promise<void>;
  connection?: Connection;
}

const connectionTypes = [
  { value: '', label: 'Select a type', disabled: true },
  { value: 's3', label: 'S3 compatible object storage' },
  { value: 'postgres', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'uri', label: 'URI' },
  { value: 'generic', label: 'Generic' },
];

export const ManageConnectionModal: React.FunctionComponent<ManageConnectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  connection,
}) => {
  const [name, setName] = React.useState(connection?.name || '');
  const [description, setDescription] = React.useState(connection?.description || '');
  const [type, setType] = React.useState(connection?.type || '');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const isEditing = !!connection;

  React.useEffect(() => {
    if (isOpen) {
      setName(connection?.name || '');
      setDescription(connection?.description || '');
      setType(connection?.type || '');
      setErrors({});
    }
  }, [isOpen, connection]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!type) {
      newErrors.type = 'Type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        type,
        compatible: connection?.compatible || [],
      });
      onClose();
    } catch (error) {
      console.error('Error saving connection:', error);
      setErrors({ submit: 'Failed to save connection. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      title={isEditing ? 'Edit connection' : 'Add connection'}
      isOpen={isOpen}
      onClose={handleClose}
      id="manage-connection-modal"
    >
      <ModalHeader title={isEditing ? 'Edit connection' : 'Add connection'} />
      <ModalBody>
        <Form>
        <FormGroup label="Name" isRequired fieldId="connection-name">
          <TextInput
            isRequired
            type="text"
            id="connection-name"
            name="connection-name"
            value={name}
            onChange={(_event, value) => {
              setName(value);
              if (errors.name) {
                setErrors({ ...errors, name: '' });
              }
            }}
            validated={errors.name ? 'error' : 'default'}
          />
          {errors.name && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant="error">{errors.name}</HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
        </FormGroup>

        <FormGroup label="Description" fieldId="connection-description">
          <TextArea
            type="text"
            id="connection-description"
            name="connection-description"
            value={description}
            onChange={(_event, value) => setDescription(value)}
            rows={3}
          />
          <FormHelperText>
            <HelperText>
              <HelperTextItem>Optional description for this connection</HelperTextItem>
            </HelperText>
          </FormHelperText>
        </FormGroup>

        <FormGroup label="Type" isRequired fieldId="connection-type">
          <FormSelect
            value={type}
            onChange={(_event, value) => {
              setType(value);
              if (errors.type) {
                setErrors({ ...errors, type: '' });
              }
            }}
            id="connection-type"
            name="connection-type"
            validated={errors.type ? 'error' : 'default'}
          >
            {connectionTypes.map((option, index) => (
              <FormSelectOption
                key={index}
                value={option.value}
                label={option.label}
                isDisabled={option.disabled}
              />
            ))}
          </FormSelect>
          {errors.type && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant="error">{errors.type}</HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
        </FormGroup>

        {errors.submit && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant="error">{errors.submit}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          key="submit"
          variant="primary"
          onClick={handleSubmit}
          isDisabled={isSubmitting}
          isLoading={isSubmitting}
          id="save-connection-button"
        >
          {isEditing ? 'Save' : 'Add'}
        </Button>
        <Button
          key="cancel"
          variant="link"
          onClick={handleClose}
          isDisabled={isSubmitting}
          id="cancel-connection-button"
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

