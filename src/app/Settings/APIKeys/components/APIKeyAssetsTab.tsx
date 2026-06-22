import * as React from 'react';
import {
  Content,
  ContentVariants,
  ExpandableSection,
  Flex,
  FlexItem,
  PageSection,
} from '@patternfly/react-core';
import {
  ActionsColumn,
  IAction,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { APIKey } from '../types';
import { 
  getModelById
} from '../mockData';

interface APIKeyAssetsTabProps {
  apiKey: APIKey;
}

const APIKeyAssetsTab: React.FunctionComponent<APIKeyAssetsTabProps> = ({ apiKey }) => {
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    models: true,
  });

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Action handlers for different asset types
  const handleViewDetails = (assetType: string, assetId: string) => {
    // TODO: Navigate to asset details page
    console.log(`View details for ${assetType}:`, assetId);
  };

  const handleTryInPlayground = (assetType: string, assetId: string) => {
    // TODO: Navigate to playground with asset preloaded
    console.log(`Try in playground for ${assetType}:`, assetId);
  };

  // Action items for models
  const getModelActions = (modelId: string): IAction[] => [
    {
      title: 'View details',
      onClick: () => handleViewDetails('model', modelId),
    },
    {
      title: 'Try in Playground',
      onClick: () => handleTryInPlayground('model', modelId),
    },
  ];

  return (
    <PageSection>
      <Content component={ContentVariants.h2} id="models-heading" style={{ marginTop: '1rem' }}>
        Models
      </Content>
      <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '1rem' }}>
        These AI asset models are available for use with this API key.
      </div>
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
        {/* Models Section */}
        <FlexItem>
          <ExpandableSection
            toggleText={`Models (${apiKey.assets.modelEndpoints.length})`}
            isExpanded={expandedSections.models}
            onToggle={() => toggleSection('models')}
            id="models-expandable-section"
          >
            {apiKey.assets.modelEndpoints.length > 0 ? (
              <Table aria-label="Models table" id="models-table">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>ID</Th>
                    <Th>Endpoint URL</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {apiKey.assets.modelEndpoints.map((modelId) => {
                    const model = getModelById(modelId);
                    return model ? (
                      <Tr key={model.id}>
                        <Td dataLabel="Name">
                          {model.name}
                        </Td>
                        <Td dataLabel="ID">
                          <code>{model.id}</code>
                        </Td>
                        <Td dataLabel="Endpoint">
                          <code>{model.endpoint}</code>
                        </Td>
                        <Td isActionCell>
                          <ActionsColumn items={getModelActions(model.id)} />
                        </Td>
                      </Tr>
                    ) : null;
                  })}
                </Tbody>
              </Table>
            ) : (
              <div style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>No models assigned to this API key</div>
            )}
          </ExpandableSection>
        </FlexItem>
      </Flex>
    </PageSection>
  );
};

export { APIKeyAssetsTab };
