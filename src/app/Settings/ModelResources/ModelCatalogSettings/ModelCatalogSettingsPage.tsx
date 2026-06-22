import * as React from 'react';
import {
  PageSection,
  Content,
  ContentVariants,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Button,
  Label,
  Switch,
  Dropdown,
  DropdownList,
  DropdownItem,
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalVariant,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@patternfly/react-core';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@patternfly/react-table';
import { ExclamationTriangleIcon, EllipsisVIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

interface ModelSource {
  id: string;
  name: string;
  organization: string | null;
  modelVisibility: 'all' | 'filtered';
  sourceType: string;
  enabled: boolean;
  validationStatus: 'ready' | 'failed';
}

const mockSources: ModelSource[] = [
  {
    id: '1',
    name: 'Red Hat AI',
    organization: null,
    modelVisibility: 'all',
    sourceType: 'YAML file',
    enabled: false,
    validationStatus: 'ready',
  },
  {
    id: '2',
    name: 'Red Hat AI validated',
    organization: null,
    modelVisibility: 'all',
    sourceType: 'YAML file',
    enabled: false,
    validationStatus: 'ready',
  },
  {
    id: '3',
    name: 'Huggingface_Admin_1',
    organization: 'Google',
    modelVisibility: 'filtered',
    sourceType: 'Hugging Face',
    enabled: true,
    validationStatus: 'failed',
  },
];

const ModelCatalogSettingsPage: React.FunctionComponent = () => {
  useDocumentTitle('Model Catalog Settings');
  const navigate = useNavigate();
  const [sources, setSources] = React.useState<ModelSource[]>(mockSources);
  const [kebabOpenMap, setKebabOpenMap] = React.useState<Record<string, boolean>>({});
  const [isUnavailableModalOpen, setIsUnavailableModalOpen] = React.useState<boolean>(false);

  const handleAddSource = () => {
    navigate('/settings/model-resources/model-catalog-settings/managing-source');
  };

  const handleToggleEnable = (id: string, enabled: boolean) => {
    setSources(sources.map(source => 
      source.id === id ? { ...source, enabled } : source
    ));
  };

  const handleManageSource = (id: string) => {
    const source = sources.find(s => s.id === id);
    if (!source) return;
    if (source.sourceType !== 'Hugging Face') {
      setIsUnavailableModalOpen(true);
      return;
    }
    const sourceTypeParam = `&sourceType=${encodeURIComponent(source.sourceType)}`;
    navigate(`/settings/model-resources/model-catalog-settings/managing-source?sourceId=${id}${sourceTypeParam}`);
  };

  const handleKebabToggle = (id: string, isOpen: boolean) => {
    setKebabOpenMap(prev => ({ ...prev, [id]: isOpen }));
  };

  const getValidationStatusLabel = (status: 'ready' | 'failed') => {
    if (status === 'failed') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Label color="red">Failed</Label>
          <span style={{ color: '#c9190b', textDecoration: 'underline dotted' }}>Validation failed</span>
        </div>
      );
    }
    return <Label color="green">Ready</Label>;
  };

  return (
    <PageSection>
      <Content component={ContentVariants.h1} style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
        Model catalog settings
      </Content>
      <Content 
        component={ContentVariants.p} 
        style={{ 
          color: 'var(--pf-t--global--color--text--secondary)', 
          marginBottom: 'var(--pf-t--global--spacer--lg)' 
        }}
      >
        Add and manage model sources that populate the model catalog for users in your organization.
      </Content>

      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <Button variant="primary" onClick={handleAddSource}>
              Add a source
            </Button>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table aria-label="Model sources table" style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
        <Thead>
          <Tr>
            <Th>
              Name
            </Th>
            <Th>
              Organization
            </Th>
            <Th>
              Model visibility
            </Th>
            <Th>Source type</Th>
            <Th>Enable</Th>
            <Th>Validation status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sources.map((source) => (
            <Tr key={source.id}>
              <Td dataLabel="Name">{source.name}</Td>
              <Td dataLabel="Organization">{source.organization || '-'}</Td>
              <Td dataLabel="Model visibility">
                <Label color={source.modelVisibility === 'all' ? 'grey' : 'purple'}>
                  {source.modelVisibility === 'all' ? 'All models' : 'Filtered'}
                </Label>
              </Td>
              <Td dataLabel="Source type">{source.sourceType}</Td>
              <Td dataLabel="Enable">
                <Switch
                  id={`enable-${source.id}`}
                  isChecked={source.enabled}
                  onChange={(_event, checked) => handleToggleEnable(source.id, checked)}
                  aria-label={`Enable ${source.name}`}
                />
              </Td>
              <Td dataLabel="Validation status">
                {getValidationStatusLabel(source.validationStatus)}
              </Td>
              <Td dataLabel="Actions">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-t--global--spacer--md)' }}>
                  <Button
                    variant="link"
                    onClick={() => handleManageSource(source.id)}
                  >
                    Manage source
                  </Button>
                  <Dropdown
                    isOpen={kebabOpenMap[source.id] || false}
                    onOpenChange={(isOpen) => handleKebabToggle(source.id, isOpen)}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        variant="plain"
                        onClick={() => handleKebabToggle(source.id, !kebabOpenMap[source.id])}
                        aria-label={`Actions for ${source.name}`}
                        icon={<EllipsisVIcon />}
                      />
                    )}
                  >
                    <DropdownList>
                      <DropdownItem key="edit">Edit</DropdownItem>
                      <DropdownItem key="delete">Delete</DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </div>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal
        variant={ModalVariant.small}
        title="Manage source unavailable"
        isOpen={isUnavailableModalOpen}
        onClose={() => setIsUnavailableModalOpen(false)}
        aria-labelledby="unavailable-modal-title"
      >
        <ModalHeader title="Manage source unavailable" labelId="unavailable-modal-title" />
        <ModalBody>
          <p>
            Manage source is not available for this source type at this time. Only Hugging Face sources can be managed from this page.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => setIsUnavailableModalOpen(false)}>
            OK
          </Button>
        </ModalFooter>
      </Modal>
    </PageSection>
  );
};

export { ModelCatalogSettingsPage };
