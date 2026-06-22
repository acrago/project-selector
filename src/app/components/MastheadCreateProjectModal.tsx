import * as React from 'react';
import {
  Button,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';

export interface MastheadCreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the new display name; parent assigns id and updates lists. */
  onCreate: (payload: { name: string }) => void;
}

const MastheadCreateProjectModal: React.FunctionComponent<MastheadCreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = React.useState('');
  const [nameError, setNameError] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    setName('');
    setNameError('');
  }, [isOpen]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Enter a project name.');
      return;
    }
    onCreate({ name: trimmed });
    onClose();
  };

  return (
    <Modal
      id="masthead-create-project-modal"
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalHeader
        title="Create project"
        labelId="masthead-create-project-modal-title"
        description="Add a new project for this prototype. Changes stay in the browser session only."
      />
      <ModalBody id="masthead-create-project-modal-body">
        <Form
          id="masthead-create-project-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <FormGroup label="Project name" isRequired fieldId="masthead-create-project-name">
            <TextInput
              id="masthead-create-project-name"
              name="masthead-create-project-name"
              isRequired
              value={name}
              validated={nameError ? 'error' : 'default'}
              onChange={(_event, value) => {
                setName(value);
                if (nameError) {
                  setNameError('');
                }
              }}
              aria-invalid={nameError ? true : undefined}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button id="masthead-create-project-submit" variant="primary" type="submit" form="masthead-create-project-form">
          Create
        </Button>
        <Button id="masthead-create-project-cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { MastheadCreateProjectModal };
