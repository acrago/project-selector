import React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalVariant,
  Switch,
  Tab,
  TabTitleText,
  Tabs,
  Title,
} from '@patternfly/react-core';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';
import type { FeatureFlags } from '@app/utils/FeatureFlagsContext';
import { CubesIcon } from '@patternfly/react-icons';

interface FeatureFlagsOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Tech Preview flags shown in the Active tab (first section)
const TECH_PREVIEW_KEYS: (keyof FeatureFlags)[] = [
  'enableAutoRAG',
  'enableMVPMode',
  'enableKnowledge',
  'enableMCP',
];

// Temporary Developer flags shown in the Active tab (second section)
const TEMP_DEV_KEYS: (keyof FeatureFlags)[] = [
  'enableGuardrailsCatalog',
  'enableAdvancedPromptEngineering',
  'enableAdvancedAgentManagement',
  'showMcpFilters',
  'showMcpConnectionUrl',
  'mcpLifecycleOperatorNotInstalled',
  'showDiscoverAssets',
];

function formatFlagKey(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
}

function FlagRow({
  flagKey,
  label,
  checked,
  overridden,
  onChange,
}: {
  flagKey: keyof FeatureFlags;
  label: string;
  checked: boolean;
  overridden: boolean;
  onChange: (key: keyof FeatureFlags, value: boolean) => void;
}) {
  return (
    <Flex
      key={flagKey}
      justifyContent={{ default: 'justifyContentSpaceBetween' }}
      alignItems={{ default: 'alignItemsCenter' }}
      style={{ marginBottom: '0.75rem' }}
    >
      <FlexItem>
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <Switch
            id={`override-modal-${flagKey}`}
            isChecked={checked}
            onChange={(_e, v) => onChange(flagKey, v)}
            aria-label={`Toggle ${label}`}
          />
          <span style={{ fontSize: '0.875rem' }}>{label}</span>
        </Flex>
      </FlexItem>
      <FlexItem>
        <span style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
          {String(checked)} {overridden ? '(overridden)' : ''}
        </span>
      </FlexItem>
    </Flex>
  );
}

function FlagSection({
  title,
  flagKeys,
  flags,
  defaultFlags,
  updateFlag,
}: {
  title: string;
  flagKeys: (keyof FeatureFlags)[];
  flags: FeatureFlags;
  defaultFlags: FeatureFlags;
  updateFlag: (key: keyof FeatureFlags, value: boolean) => void;
}) {
  const validKeys = flagKeys.filter((k) => typeof flags[k] === 'boolean');
  if (validKeys.length === 0) return null;
  const mid = Math.ceil(validKeys.length / 2);
  const left = validKeys.slice(0, mid);
  const right = validKeys.slice(mid);

  return (
    <>
      <Title headingLevel="h3" size="md" style={{ marginTop: '1.25rem', marginBottom: '0.75rem' }}>
        {title}
      </Title>
      <Grid hasGutter>
        <GridItem span={6}>
          {left.map((key) => (
            <FlagRow
              key={key}
              flagKey={key}
              label={formatFlagKey(key)}
              checked={!!flags[key]}
              overridden={flags[key] !== defaultFlags[key]}
              onChange={updateFlag}
            />
          ))}
        </GridItem>
        <GridItem span={6}>
          {right.map((key) => (
            <FlagRow
              key={key}
              flagKey={key}
              label={formatFlagKey(key)}
              checked={!!flags[key]}
              overridden={flags[key] !== defaultFlags[key]}
              onChange={updateFlag}
            />
          ))}
        </GridItem>
      </Grid>
    </>
  );
}

export const FeatureFlagsOverrideModal: React.FunctionComponent<FeatureFlagsOverrideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { flags, defaultFlags, updateFlag, resetFlags } = useFeatureFlags();
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);

  const handleReset = () => {
    resetFlags();
    onClose();
  };

  const handleTabSelect = (_event: React.MouseEvent<HTMLElement, MouseEvent>, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <Modal
      variant={ModalVariant.large}
      title="Feature Flags: Override Flags"
      isOpen={isOpen}
      onClose={onClose}
      id="feature-flags-override-modal"
      aria-label="Feature flags override options"
    >
      <ModalBody>
        <Tabs
          activeKey={activeTabKey}
          onSelect={handleTabSelect}
          id="feature-flags-override-modal-tabs"
          aria-label="Feature flag categories"
        >
          <Tab eventKey={0} title={<TabTitleText>Active</TabTitleText>} aria-label="Active flags">
            <div style={{ paddingTop: '1rem' }}>
              <p style={{ marginBottom: '0.5rem', color: 'var(--pf-v5-global--Color--200)', fontSize: '0.875rem' }}>
                Feature flags default to the values defined in the dashboard config from the server.
              </p>
              <p style={{ marginBottom: '1rem', color: 'var(--pf-v5-global--Color--200)', fontSize: '0.875rem' }}>
                Flags that have an indeterminate value are because they are <em>not</em> defined in the server.
              </p>
              <FlagSection
                title="Tech Preview Flags"
                flagKeys={TECH_PREVIEW_KEYS}
                flags={flags}
                defaultFlags={defaultFlags}
                updateFlag={updateFlag}
              />
              <FlagSection
                title="Temporary Developer Feature Flags"
                flagKeys={TEMP_DEV_KEYS}
                flags={flags}
                defaultFlags={defaultFlags}
                updateFlag={updateFlag}
              />
            </div>
          </Tab>
          <Tab eventKey={1} title={<TabTitleText>Dev Flags</TabTitleText>} aria-label="Dev flags">
            <div style={{ paddingTop: '1rem' }}>
              <EmptyState id="feature-flags-override-modal-dev-flags-empty" icon={CubesIcon} titleText="No dev flags">
                <EmptyStateBody>There are no developer flags to display in this tab.</EmptyStateBody>
              </EmptyState>
            </div>
          </Tab>
          <Tab eventKey={2} title={<TabTitleText>Legacy</TabTitleText>} aria-label="Legacy flags">
            <div style={{ paddingTop: '1rem' }}>
              <EmptyState id="feature-flags-override-modal-legacy-empty" icon={CubesIcon} titleText="No legacy flags">
                <EmptyStateBody>There are no legacy flags to display in this tab.</EmptyStateBody>
              </EmptyState>
            </div>
          </Tab>
        </Tabs>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={handleReset} id="feature-flags-override-modal-reset">
          Reset to defaults
        </Button>
        <Button variant="link" onClick={onClose} id="feature-flags-override-modal-close">
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};
