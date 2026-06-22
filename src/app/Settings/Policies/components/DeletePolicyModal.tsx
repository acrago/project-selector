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
  TextInput,
} from '@patternfly/react-core';
import { Policy } from '../types';

interface DeletePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
  onDelete?: (policy: Policy) => void;
}

const DeletePolicyModal: React.FunctionComponent<DeletePolicyModalProps> = ({ 
  isOpen, 
  onClose, 
  policy,
  onDelete 
}) => {
  const [confirmationText, setConfirmationText] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleClose = () => {
    setConfirmationText('');
    onClose();
  };

  const handleDelete = () => {
    if (policy && confirmationText === policy.name) {
      setIsDeleting(true);
      console.log('Deleting policy:', policy.id);
      
      if (onDelete) {
        onDelete(policy);
      }

      setTimeout(() => {
        setIsDeleting(false);
        handleClose();
      }, 1000);
    }
  };

  const isDeleteEnabled = policy && confirmationText === policy.name;

  return (
    <Modal
      variant="small"
      title="Delete policy?"
      isOpen={isOpen}
      onClose={handleClose}
      id="delete-policy-modal"
    >
      <ModalHeader title="Delete policy?" />
      <ModalBody>
        <p style={{ marginBottom: '1rem' }}>
          This action will permanently delete the policy <strong>{policy?.name}</strong>.
          This action cannot be undone.
        </p>
        <Form id="delete-policy-form">
          <FormGroup 
            label={`Type "${policy?.name}" to confirm deletion`} 
            isRequired 
            fieldId="confirm-delete"
          >
            <TextInput
              isRequired
              type="text"
              id="confirm-delete"
              name="confirm-delete"
              value={confirmationText}
              onChange={(_event, value) => setConfirmationText(value)}
              placeholder={policy?.name}
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem>
                  Enter the policy name exactly as shown to confirm deletion.
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button 
          key="delete" 
          variant="danger" 
          onClick={handleDelete}
          isLoading={isDeleting}
          isDisabled={!isDeleteEnabled || isDeleting}
          id="confirm-delete-button"
        >
          Delete
        </Button>
        <Button 
          key="cancel" 
          variant="link" 
          onClick={handleClose}
          isDisabled={isDeleting}
          id="cancel-delete-button"
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { DeletePolicyModal };

