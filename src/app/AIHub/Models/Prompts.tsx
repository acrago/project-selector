import * as React from 'react';
import {
  Content,
  Flex,
  FlexItem,
  PageSection,
  Title,
} from '@patternfly/react-core';
import { RegistryPromptsTab } from './RegistryPromptsTab';
import { PromptLabIcon } from '@app/Home/icons/PromptLabIcon';

const Prompts: React.FunctionComponent = () => {
  return (
    <>
      {/* Page Header Section */}
      <PageSection>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PromptLabIcon withBackground size={32} backgroundColor="#ece6ff" />
              Prompt registry
            </Title>
          </FlexItem>
          
          <FlexItem>
            <Content component="p">
              Select a prompt registry to view and manage your registered prompts. Prompt registries provide a structured and organized way to store, share, version, and track prompts.
            </Content>
          </FlexItem>
        </Flex>
      </PageSection>

      {/* Content Section */}
      <PageSection hasBodyWrapper={false}>
        <RegistryPromptsTab />
      </PageSection>
    </>
  );
};

export { Prompts };
