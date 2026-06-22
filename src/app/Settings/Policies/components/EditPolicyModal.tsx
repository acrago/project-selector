import * as React from 'react';
import {
  Alert,
  Button,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextArea,
  TextInput,
} from '@patternfly/react-core';
import { Policy } from '../types';

interface EditPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
}

const EditPolicyModal: React.FunctionComponent<EditPolicyModalProps> = ({ 
  isOpen, 
  onClose, 
  policy 
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  React.useEffect(() => {
    if (policy) {
      setName(policy.name);
      setDescription(policy.description);
    }
  }, [policy]);

  const handleSubmit = () => {
    setIsSubmitting(true);
    console.log('Editing policy:', policy?.id, { name, description });
    // TODO: Implement actual edit functionality
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  const isGitManaged = policy?.gitSource !== undefined && policy?.gitSource !== null;

  return (
    <Modal
      variant="medium"
      title="Edit policy"
      isOpen={isOpen}
      onClose={onClose}
      id="edit-policy-modal"
    >
      <ModalHeader title="Edit policy" />
      <ModalBody>
        {isGitManaged && (
          <Alert 
            variant="info" 
            isInline 
            title="This policy is managed in git"
            id="git-managed-alert"
            style={{ marginBottom: '1rem' }}
          >
            Changes to this policy should be made in the{' '}
            <a href={policy?.gitSource} target="_blank" rel="noopener noreferrer">
              Git repository
            </a>
            . Editing is disabled in-Console for git-managed policies.
          </Alert>
        )}
        <Form id="edit-policy-form">
          <FormGroup label="Name" isRequired fieldId="policy-name">
            <TextInput
              isRequired
              type="text"
              id="policy-name"
              name="policy-name"
              value={name}
              onChange={(_event, value) => setName(value)}
              isDisabled={isGitManaged}
            />
          </FormGroup>

          <FormGroup label="Description" fieldId="policy-description">
            <TextArea
              id="policy-description"
              name="policy-description"
              value={description}
              onChange={(_event, value) => setDescription(value)}
              resizeOrientation="vertical"
              isDisabled={isGitManaged}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button 
          key="save" 
          variant="primary" 
          onClick={handleSubmit}
          isLoading={isSubmitting}
          isDisabled={isSubmitting || isGitManaged || !name.trim()}
          id="save-policy-button"
        >
          Save
        </Button>
        <Button 
          key="cancel" 
          variant="link" 
          onClick={onClose}
          isDisabled={isSubmitting}
          id="cancel-edit-button"
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { EditPolicyModal };

