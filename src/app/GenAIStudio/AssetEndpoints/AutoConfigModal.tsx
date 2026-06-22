import React from 'react';
import {
  Button,
  Flex,
  FlexItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Progress,
  Spinner,
  Title
} from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';

interface ConfigStep {
  label: string;
}

interface AutoConfigModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel: () => void;
  configProgress: number;
  currentConfigStep: number;
  configSteps: ConfigStep[];
  modelNames: string;
}

export const AutoConfigModal: React.FC<AutoConfigModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  configProgress,
  currentConfigStep,
  configSteps,
  modelNames
}) => {
  return (
    <Modal
      variant={ModalVariant.medium}
      title="Configuring playground"
      isOpen={isOpen}
      onClose={configProgress === 100 ? onClose : undefined}
      id="auto-config-modal"
    >
      <ModalHeader>
        <Title headingLevel="h2" size="xl" id="auto-config-modal-title">
          Configuring playground
        </Title>
      </ModalHeader>
      <ModalBody>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '1rem', color: '#6a6e73', marginBottom: '2rem' }}>
            Please wait while we automatically configure your playground
          </p>
        </div>

        {/* Completed steps */}
        <div style={{ marginBottom: '2rem' }}>
          {configSteps.map((step, index) => (
            <div key={index} style={{ marginBottom: '0.75rem' }}>
              {index < currentConfigStep ? (
                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <CheckCircleIcon style={{ color: '#3E8635' }} />
                  </FlexItem>
                  <FlexItem>
                    <span style={{ color: '#6a6e73' }}>{step.label}</span>
                  </FlexItem>
                </Flex>
              ) : index === currentConfigStep ? (
                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <Spinner size="sm" />
                  </FlexItem>
                  <FlexItem>
                    <span style={{ color: '#151515', fontWeight: '500' }}>{step.label}</span>
                  </FlexItem>
                </Flex>
              ) : (
                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <span style={{ 
                      width: '16px', 
                      height: '16px', 
                      borderRadius: '50%', 
                      backgroundColor: '#f0f0f0',
                      display: 'inline-block'
                    }}></span>
                  </FlexItem>
                  <FlexItem>
                    <span style={{ color: '#6a6e73' }}>{step.label}</span>
                  </FlexItem>
                </Flex>
              )}
            </div>
          ))}
        </div>

        {/* Progress status */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#151515', 
            marginBottom: '1rem',
            fontWeight: '500'
          }}>
            Configuring {modelNames} for playground - 2 minutes remaining
          </p>
          
          <Progress 
            value={configProgress}
            size="lg"
            id="auto-config-progress"
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button 
          variant="secondary" 
          onClick={onCancel}
          isDisabled={configProgress > 0 && configProgress < 100}
          id="auto-config-cancel-button"
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

