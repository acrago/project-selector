import React from 'react';
import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalVariant,
  Progress,
  Title
} from '@patternfly/react-core';

interface EndpointCreationProgressModalProps {
  isOpen: boolean;
  progressMessage: string;
  progressValue: number;
}

export const EndpointCreationProgressModal: React.FC<EndpointCreationProgressModalProps> = ({
  isOpen,
  progressMessage,
  progressValue
}) => {
  return (
    <Modal
      variant={ModalVariant.small}
      title="Creating Endpoint"
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing during creation
      id="endpoint-creation-progress-modal"
    >
      <ModalHeader>
        <Title headingLevel="h2" size="xl" id="endpoint-creation-progress-title">
          Creating Endpoint
        </Title>
      </ModalHeader>
      <ModalBody>
        <div className="pf-v5-u-mb-lg">
          <div className="pf-v5-u-mb-md">{progressMessage}</div>
          <Progress value={progressValue} id="endpoint-creation-progress" />
        </div>
      </ModalBody>
    </Modal>
  );
};

