import React from 'react';
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
  TextInput,
} from '@patternfly/react-core';

interface MCPDeployment {
  id: string;
  userName: string;
  mcpServerName: string;
  version: string;
  created: string;
  status: string;
  endpoint?: string;
  apiKey?: string;
}

interface DeleteMCPDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  deployment: MCPDeployment | null;
  onDelete?: (deployment: MCPDeployment) => void;
}

const DeleteMCPDeploymentModal: React.FunctionComponent<DeleteMCPDeploymentModalProps> = ({
  isOpen,
  onClose,
  deployment,
  onDelete,
}) => {
  const [confirmationText, setConfirmationText] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleClose = () => {
    setConfirmationText('');
    onClose();
  };

  const handleDelete = () => {
    if (deployment && confirmationText === deployment.userName) {
      setIsDeleting(true);
      if (onDelete) {
        onDelete(deployment);
      }
      setIsDeleting(false);
      handleClose();
    }
  };

  const isDeleteEnabled = deployment && confirmationText === deployment.userName;

  return (
    <Modal
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={handleClose}
      id="delete-mcp-deployment-modal"
      aria-labelledby="delete-mcp-deployment-modal-title"
      aria-describedby="delete-mcp-deployment-modal-description"
    >
      <ModalHeader
        title="Delete MCP server deployment?"
        titleIconVariant="warning"
        labelId="delete-mcp-deployment-modal-title"
      />
      <ModalBody id="delete-mcp-deployment-modal-description">
        <p style={{ marginBottom: 'var(--pf-v5-global--spacer--md)' }}>
          The <strong>{deployment?.userName}</strong> MCP server deployment and its API keys will be
          deleted, and its endpoint will no longer be available as an AI asset.
        </p>
        <Form id="delete-mcp-deployment-form">
          <FormGroup
            label={
              <>
                Type <strong>{deployment?.userName}</strong> to confirm deletion:
              </>
            }
            isRequired
            fieldId="mcp-deployment-confirm-delete"
          >
            <TextInput
              isRequired
              type="text"
              id="mcp-deployment-confirm-delete"
              name="mcp-deployment-confirm-delete"
              value={confirmationText}
              onChange={(_event, value) => setConfirmationText(value)}
              placeholder={deployment?.userName}
              aria-label={`Type ${deployment?.userName} to confirm deletion`}
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem>
                  Enter the deployment name exactly as shown to confirm deletion.
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
          id="mcp-deployment-confirm-delete-button"
        >
          Delete MCP server deployment
        </Button>
        <Button
          key="cancel"
          variant="link"
          onClick={handleClose}
          isDisabled={isDeleting}
          id="mcp-deployment-cancel-delete-button"
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { DeleteMCPDeploymentModal };
