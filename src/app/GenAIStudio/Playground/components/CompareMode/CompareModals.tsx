import React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';

export interface CompareModalsProps {
  isCompareConfirmModalOpen: boolean;
  onCloseCompareConfirm: () => void;
  onStartCompare: () => void;
  isCloseCompareModalOpen: boolean;
  onCloseExitCompareModal: () => void;
  onConfirmExitCompare: () => void;
  closingChatNumber: 1 | 2;
}

/**
 * Modals used only in Playground comparison mode: "Start a chat compare session?"
 * and "Close Chat Compare?". Isolate comparison-mode modal copy and behavior here.
 */
export const CompareModals: React.FunctionComponent<CompareModalsProps> = ({
  isCompareConfirmModalOpen,
  onCloseCompareConfirm,
  onStartCompare,
  isCloseCompareModalOpen,
  onCloseExitCompareModal,
  onConfirmExitCompare,
  closingChatNumber
}) => (
  <>
    <Modal
      variant="small"
      isOpen={isCompareConfirmModalOpen}
      onClose={onCloseCompareConfirm}
      aria-labelledby="compare-confirm-modal-title"
      aria-describedby="compare-confirm-modal-body"
      style={{ width: '450px' }}
    >
      <ModalHeader title="Start a chat compare session?" labelId="compare-confirm-modal-title" />
      <ModalBody id="compare-confirm-modal-body">
        <p>
          Starting a new chat compare session will clear your current chat history. Your configuration
          will be copied to both chats. This action cannot be undone.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={onStartCompare}>
          Continue
        </Button>
        <Button variant="link" onClick={onCloseCompareConfirm}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>

    <Modal
      variant="small"
      isOpen={isCloseCompareModalOpen}
      onClose={onCloseExitCompareModal}
      aria-labelledby="close-compare-modal-title"
      aria-describedby="close-compare-modal-body"
    >
      <ModalHeader title="Close Chat Compare?" labelId="close-compare-modal-title" />
      <ModalBody id="close-compare-modal-body">
        <p>The chat configuration for Chat {closingChatNumber} will be lost.</p>
        <p>Are you sure you would like to close?</p>
      </ModalBody>
      <ModalFooter>
        <Button variant="danger" onClick={onConfirmExitCompare}>
          Close
        </Button>
        <Button variant="link" onClick={onCloseExitCompareModal}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  </>
);
