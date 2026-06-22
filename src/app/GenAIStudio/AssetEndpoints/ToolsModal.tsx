import React from 'react';
import {
  Button,
  Divider,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Title
} from '@patternfly/react-core';
import { ToolsIcon } from '@patternfly/react-icons';

interface Tool {
  name: string;
  description: string;
}

interface Server {
  name: string;
  slug: string;
}

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedServer: Server | null;
  tools: Tool[];
}

export const ToolsModal: React.FC<ToolsModalProps> = ({
  isOpen,
  onClose,
  selectedServer,
  tools
}) => {
  return (
    <Modal
      variant={ModalVariant.medium}
      title={selectedServer ? `Available tools on the ${selectedServer.name}` : 'Tools'}
      isOpen={isOpen}
      onClose={onClose}
      id="tools-modal"
    >
      <ModalHeader>
        <Title headingLevel="h2" size="xl" id="tools-modal-title">
          {selectedServer ? `Available tools on the ${selectedServer.name}` : 'Tools'}
        </Title>
      </ModalHeader>
      <ModalBody>
        {selectedServer && (
          <>
            {tools.length === 0 ? (
              <EmptyState>
                <Title headingLevel="h4" size="lg" id="tools-empty-state-title">
                  <ToolsIcon className="pf-v5-u-mr-sm" />
                  No tools available
                </Title>
                <EmptyStateBody>
                  This server doesn&apos;t have any tools configured.
                </EmptyStateBody>
              </EmptyState>
            ) : (
              <Flex direction={{ default: 'column' }}>
                {tools.map((tool, index) => (
                  <React.Fragment key={index}>
                    <Flex 
                      alignItems={{ default: 'alignItemsCenter' }}
                      gap={{ default: 'gapMd' }}
                      style={{ padding: '0.5rem 0' }}
                    >
                      <FlexItem flex={{ default: 'flexNone' }} style={{ width: '200px' }}>
                        <div style={{ 
                          fontFamily: 'var(--pf-v5-global--FontFamily--monospace)', 
                          fontWeight: 'bold',
                          fontSize: '0.875rem'
                        }}>
                          {tool.name}
                        </div>
                      </FlexItem>
                      <FlexItem grow={{ default: 'grow' }}>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          color: 'var(--pf-v5-global--Color--200)' 
                        }}>
                          {tool.description}
                        </div>
                      </FlexItem>
                    </Flex>
                    {index < tools.length - 1 && (
                      <Divider />
                    )}
                  </React.Fragment>
                ))}
              </Flex>
            )}
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={onClose} id="tools-modal-close-button">
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

