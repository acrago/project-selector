import * as React from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Label,
  MenuToggle,
  Modal,
  ModalBody,
  ModalHeader,
  PageSection,
  PageSectionTypes,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  Title
} from '@patternfly/react-core';
import { Wizard, WizardStep } from '@patternfly/react-core';
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@patternfly/react-table';

export interface LegacyWorkbenchConfig {
  id: string;
  name: string;
  project: string;
  env?: Record<string, string>;
}

interface MigrationAssistWizardProps {
  isOpen: boolean;
  onClose: () => void;
  workbenches: LegacyWorkbenchConfig[];
}

export const MigrationAssistWizard: React.FunctionComponent<MigrationAssistWizardProps> = ({
  isOpen,
  onClose,
  workbenches
}) => {
  const [isScanning, setIsScanning] = React.useState(true);
  const [isTemplateOpen, setIsTemplateOpen] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>('');
  const [removedWorkbenchIds, setRemovedWorkbenchIds] = React.useState<string[]>([]);
  
  // Active workbenches after removals
  const activeWorkbenches = React.useMemo(() => {
    return workbenches.filter((wb) => !removedWorkbenchIds.includes(wb.id));
  }, [workbenches, removedWorkbenchIds]);
  
  // Aggregate all env vars from active workbenches only
  const allEnvVars = React.useMemo(() => {
    const envMap = new Map<string, { value: string; workbenches: string[] }>();
    activeWorkbenches.forEach((wb) => {
      Object.entries(wb.env || {}).forEach(([name, value]) => {
        if (envMap.has(name)) {
          envMap.get(name)!.workbenches.push(wb.name);
        } else {
          envMap.set(name, { value, workbenches: [wb.name] });
        }
      });
    });
    
    // Ensure at least 3 unique conflicts for demo purposes
    const guaranteedConflicts = [
      { name: 'API_KEY_A', value: 'legacy-api-key-value' },
      { name: 'DB_CONN_STRING', value: 'legacy-db-connection' },
      { name: 'LEGACY_PATH', value: '/old/path/structure' }
    ];
    
    guaranteedConflicts.forEach(({ name, value }) => {
      if (!envMap.has(name)) {
        envMap.set(name, { value, workbenches: ['Demo Workbench'] });
      }
    });
    
    return Array.from(envMap.entries()).map(([name, data]) => ({ 
      name, 
      value: data.value, 
      workbenches: data.workbenches 
    }));
  }, [activeWorkbenches]);
  
  const [envRows, setEnvRows] = React.useState<{ name: string; value: string; workbenches: string[] }[]>(allEnvVars);
  const [sortBy, setSortBy] = React.useState<{ index: number; direction: 'asc' | 'desc' }>({ index: 0, direction: 'asc' });

  // Dynamic recommendation logic based on number of selected workbenches
  const getRecommendationByCount = (count: number): { template: string; compatibleCount: number } => {
    if (count === 8) {
      return { template: 'Standard GPU Template', compatibleCount: 6 };
    } else if (count === 6) {
      return { template: 'Standard CPU Template', compatibleCount: 3 };
    } else if (count === 3) {
      return { template: 'Deep Learning Template', compatibleCount: 2 };
    } else if (count === 1) {
      return { template: 'Standard CPU Template', compatibleCount: 0 };
    }
    // Default for any other count
    return { template: 'Standard CPU Template', compatibleCount: Math.floor(count * 0.5) };
  };

  const recommendationData = React.useMemo(() => {
    return getRecommendationByCount(activeWorkbenches.length);
  }, [activeWorkbenches.length]);

  // Simulate scan
  React.useEffect(() => {
    if (isOpen && isScanning) {
      const timer = setTimeout(() => {
        setIsScanning(false);
        // Auto-select recommended template after scan
        setSelectedTemplate(recommendationData.template);
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, isScanning, recommendationData.template]);

  React.useEffect(() => {
    if (isOpen) {
      setEnvRows(allEnvVars);
    }
  }, [isOpen, allEnvVars]);

  const onSort = (_event: unknown, index: number, direction: 'asc' | 'desc') => {
    setSortBy({ index, direction });
  };

  const sortedEnvRows = React.useMemo(() => {
    const rows = [...envRows];
    const compare = (a: string, b: string) => (sortBy.direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a));
    if (sortBy.index === 0) {
      rows.sort((a, b) => compare(a.name, b.name));
    } else if (sortBy.index === 1) {
      rows.sort((a, b) => compare(a.value, b.value));
    } else if (sortBy.index === 2) {
      rows.sort((a, b) => compare(a.workbenches.join(', '), b.workbenches.join(', ')));
    }
    return rows;
  }, [envRows, sortBy]);

  const templateSettings: Record<
    string,
    {
      image: string;
      resources: string;
      homePath: string;
      cpuLimit: string;
      memoryLimit: string;
      memoryLimitGi: number;
      gpuType: string;
      gpuCount: number;
      description: string;
    }
  > = {
    'Standard CPU Template': {
      image: 'quay.io/org/notebook:stable-cpu',
      resources: 'CPU: 2 cores, Memory: 4Gi, GPU: 0',
      homePath: '/opt/app-root/src/',
      cpuLimit: '2 cores',
      memoryLimit: '4Gi',
      memoryLimitGi: 4,
      gpuType: 'None',
      gpuCount: 0,
      description: 'CPU: 2 cores, Memory: 4Gi, GPU: None'
    },
    'Standard GPU Template': {
      image: 'quay.io/org/notebook:cuda-12.1',
      resources: 'CPU: 4 cores, Memory: 16Gi, GPU: 1x T4',
      homePath: '/opt/app-root/src/',
      cpuLimit: '4 cores',
      memoryLimit: '16Gi',
      memoryLimitGi: 16,
      gpuType: '1x NVIDIA T4',
      gpuCount: 1,
      description: 'CPU: 4 cores, Memory: 16Gi, GPU: 1x T4'
    },
    'Deep Learning Template': {
      image: 'quay.io/org/notebook:cuda-12.1-deep',
      resources: 'CPU: 8 cores, Memory: 32Gi, GPU: 2x A100',
      homePath: '/opt/app-root/src/',
      cpuLimit: '8 cores',
      memoryLimit: '32Gi',
      memoryLimitGi: 32,
      gpuType: '2x NVIDIA A100',
      gpuCount: 2,
      description: 'CPU: 8 cores, Memory: 32Gi, GPU: 2x A100'
    },
    'GPU Restricted Template': {
      image: 'quay.io/org/notebook:cuda-12.1',
      resources: 'CPU: 4 cores, Memory: 16Gi, GPU: 1x A100',
      homePath: '/opt/app-root/src/',
      cpuLimit: '4 cores',
      memoryLimit: '16Gi',
      memoryLimitGi: 16,
      gpuType: '1x NVIDIA A100',
      gpuCount: 1,
      description: 'CPU: 4 cores, Memory: 16Gi, GPU: 1x A100'
    },
    'Team Alpha Policy': {
      image: 'quay.io/org/notebook:team-alpha',
      resources: 'CPU: 2 cores, Memory: 8Gi, GPU: 0',
      homePath: '/opt/app-root/src/',
      cpuLimit: '2 cores',
      memoryLimit: '8Gi',
      memoryLimitGi: 8,
      gpuType: 'None',
      gpuCount: 0,
      description: 'CPU: 2 cores, Memory: 8Gi, GPU: None'
    }
  };

  // Helper function to determine specific incompatibility reason for a workbench
  const getIncompatibilityReason = (wb: LegacyWorkbenchConfig): string | null => {
    if (!selectedTemplate) return null;
    
    const template = templateSettings[selectedTemplate];
    if (!template) return null;

    const hasEnvVars = Object.keys(wb.env || {}).length > 0;
    
    if (hasEnvVars) {
      const envVarCount = Object.keys(wb.env || {}).length;
      return `${envVarCount} environment variable${envVarCount > 1 ? 's' : ''} conflict with template policy`;
    }

    // Additional checks could include memory, GPU requirements, etc.
    // For now, we'll add mock logic for demonstration
    // In a real scenario, workbench would have resource requirements
    
    // Example: Mock GPU requirement check
    if (template.gpuCount === 0 && wb.name.toLowerCase().includes('gpu')) {
      return `Requires GPU but template has none`;
    }
    
    // Example: Mock high memory requirement
    if (wb.name.toLowerCase().includes('deep') && template.memoryLimitGi < 32) {
      return `Requires 69Gi memory, template provides ${template.memoryLimitGi}Gi`;
    }

    // Ensure at least one workbench is incompatible for demo purposes
    // Force the first workbench to be incompatible due to GPU requirement
    if (wb.id === workbenches[0]?.id && template.gpuCount === 0) {
      return `Requires GPU Limit`;
    }

    return null;
  };

  const currentCompatibleCount = React.useMemo(() => {
    // Count workbenches that are actually compatible (no conflicts)
    return activeWorkbenches.filter((wb) => {
      const incompatibilityReason = getIncompatibilityReason(wb);
      return incompatibilityReason === null; // Compatible if no reason for incompatibility
    }).length;
  }, [activeWorkbenches, selectedTemplate]);

  const allWorkbenchesCompatible = currentCompatibleCount === activeWorkbenches.length;

  // Calculate total unique conflicts (unique env var keys across all workbenches)
  const totalConflicts = allEnvVars.length; // This is the number of unique keys
  const conflictTypes = totalConflicts > 0 ? `${totalConflicts} environment variable${totalConflicts !== 1 ? 's' : ''}` : 'None';

  const scanStep = isScanning ? (
    <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }} style={{ padding: '2rem' }}>
      <FlexItem>
        <Spinner size="xl" />
      </FlexItem>
      <FlexItem style={{ marginTop: '1rem' }}>
        <Title headingLevel="h4">Analyzing compatibility of {activeWorkbenches.length} selected workbenches...</Title>
      </FlexItem>
    </Flex>
  ) : (
    <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
      <FlexItem>
        <Card style={{ backgroundColor: '#e6f3ff', border: '1px solid #0066cc', marginBottom: '1rem' }}>
          <CardTitle>Governance Assessment (The Resource Check)</CardTitle>
          <CardBody>
            This step checks for Resource Mismatches (CPU/GPU) between your selected workbenches and the available Templates. You must ensure 100% compatibility before proceeding.
          </CardBody>
        </Card>
      </FlexItem>
      <FlexItem>
        <Card id="recommendation-card">
          <CardTitle>Scan Results & Recommendation</CardTitle>
          <CardBody>
            <DescriptionList isHorizontal>
              <DescriptionListGroup>
                <DescriptionListTerm>Recommended Template</DescriptionListTerm>
                <DescriptionListDescription>{recommendationData.template}</DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Compatibility</DescriptionListTerm>
                <DescriptionListDescription>
                  Compatible with {currentCompatibleCount} out of {activeWorkbenches.length} Workbenches
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </Card>
      </FlexItem>
      <FlexItem>
        <Alert variant="info" isInline title={`Total unique conflicts: ${totalConflicts} (${conflictTypes})`} />
      </FlexItem>
      <FlexItem>
        <FormGroup label="Workbench template" isRequired>
          <FormHelperText>
            <HelperText>
              <HelperTextItem>
                Select the template that will define governance and resource limits. The recommended template is pre-selected based on your workbench requirements.
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
          <Select
            isOpen={isTemplateOpen}
            selected={selectedTemplate}
            onSelect={(_event, value) => {
              setSelectedTemplate(value as string);
              setIsTemplateOpen(false);
            }}
            onOpenChange={(isOpen) => setIsTemplateOpen(isOpen)}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                onClick={() => setIsTemplateOpen(!isTemplateOpen)}
                isExpanded={isTemplateOpen}
                style={{ width: '100%', color: '#000' }}
              >
                {selectedTemplate || 'Select a template'}
              </MenuToggle>
            )}
          >
            <SelectList style={{ color: '#000' }}>
              {Object.keys(templateSettings).map((templateName) => (
                <SelectOption key={templateName} value={templateName} description={templateSettings[templateName].description}>
                  {templateName}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
        </FormGroup>
      </FlexItem>
      <FlexItem>
        <Title headingLevel="h5" style={{ marginBottom: '0.5rem' }}>
          Fixed Resource Specs
        </Title>
        <DescriptionList isCompact isHorizontal>
          <DescriptionListGroup>
            <DescriptionListTerm>CPU Limit</DescriptionListTerm>
            <DescriptionListDescription>
              {selectedTemplate ? templateSettings[selectedTemplate]?.cpuLimit : 'Select a template'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Memory Limit</DescriptionListTerm>
            <DescriptionListDescription>
              {selectedTemplate ? templateSettings[selectedTemplate]?.memoryLimit : 'Select a template'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>GPU Type/Count</DescriptionListTerm>
            <DescriptionListDescription>
              {selectedTemplate ? templateSettings[selectedTemplate]?.gpuType : 'Select a template'}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </FlexItem>
      <FlexItem>
        <Title headingLevel="h5">Workbench Compatibility Details</Title>
        <Table aria-label="Workbench compatibility" variant="compact" style={{ marginTop: '0.5rem' }}>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Compatibility Status</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {activeWorkbenches.map((wb) => {
              const incompatibilityReason = getIncompatibilityReason(wb);
              const hasConflicts = incompatibilityReason !== null;
              const displayReason = incompatibilityReason || 'No conflicts detected';

              return (
                <Tr key={wb.id}>
                  <Td dataLabel="Name">{wb.name}</Td>
                  <Td dataLabel="Compatibility Status">
                    {hasConflicts ? (
                      <>
                        <Label color="red">Conflict</Label>
                        <div style={{ fontSize: '0.875rem', color: '#6a6e73', marginTop: '0.25rem' }}>
                          {displayReason}
                        </div>
                      </>
                    ) : (
                      <>
                        <Label color="green">Compatible</Label>
                        <div style={{ fontSize: '0.875rem', color: '#6a6e73', marginTop: '0.25rem' }}>
                          {displayReason}
                        </div>
                      </>
                    )}
                  </Td>
                  <Td dataLabel="Action">
                    {hasConflicts && (
                      <Button
                        variant="link"
                        onClick={() => setRemovedWorkbenchIds((prev) => [...prev, wb.id])}
                      >
                        Remove from Batch
                      </Button>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </FlexItem>
    </Flex>
  );


  const conflictsStep = totalConflicts === 0 ? (
    <Alert
      variant="success"
      isInline
      title="No conflicts detected"
      style={{ marginBottom: '1rem' }}
    >
      All workbenches in this batch are compatible with the selected template. You can proceed to the next step.
    </Alert>
  ) : (
    <>
      <Card style={{ backgroundColor: '#e6f3ff', border: '1px solid #0066cc', marginBottom: '1rem' }}>
        <CardTitle>Mandatory Data Cleanup (The Policy Check)</CardTitle>
        <CardBody>
          This step enforces the cleanup of legacy environment variables that the new architecture rejects. You must remove all unique conflicts to proceed.
        </CardBody>
      </Card>
      <Alert
        variant="warning"
        isInline
        title={`Action Required: Remove all ${totalConflicts} conflicting environment variable${totalConflicts !== 1 ? 's' : ''} to proceed.`}
        style={{ marginBottom: '1rem' }}
      />
      <Table aria-label="Detected environment variables" variant="compact">
        <Thead>
          <Tr>
            <Th
              sort={{
                columnIndex: 0,
                sortBy: { index: sortBy.index, direction: sortBy.direction },
                onSort,
                'aria-label': 'Sort by variable name'
              }}
            >
              Variable Name
            </Th>
            <Th
              sort={{
                columnIndex: 1,
                sortBy: { index: sortBy.index, direction: sortBy.direction },
                onSort,
                'aria-label': 'Sort by value'
              }}
            >
              Value (Masked)
            </Th>
            <Th
              sort={{
                columnIndex: 2,
                sortBy: { index: sortBy.index, direction: sortBy.direction },
                onSort,
                'aria-label': 'Sort by source workbench'
              }}
            >
              Source Workbench
            </Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedEnvRows.map((row) => (
            <Tr key={row.name}>
              <Td dataLabel="Variable Name">{row.name}</Td>
              <Td dataLabel="Value (Masked)">{'••••••••'}</Td>
              <Td dataLabel="Source Workbench">{row.workbenches.join(', ')}</Td>
              <Td dataLabel="Action">
                <Button
                  variant="link"
                  onClick={() => setEnvRows((prev) => prev.filter((r) => r.name !== row.name))}
                >
                  Remove
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );

  const reviewStep = (
    <>
      <Card style={{ backgroundColor: '#e6f3ff', border: '1px solid #0066cc', marginBottom: '1rem' }}>
        <CardTitle>Final Policy Review</CardTitle>
        <CardBody>
          You are now confirming the governance policy for your entire batch of migrated workbenches. This step displays the fixed, non-editable settings inherited from the Workbench Template you selected. CRITICAL: Review these constraints to ensure they are compatible with the data access needs of all {activeWorkbenches.length} workbenches.
        </CardBody>
      </Card>
      <FormHelperText>
        <HelperText>
          <HelperTextItem>
            Review the fixed settings that will apply to all migrated workbenches based on the Template chosen. These settings cannot be changed.
          </HelperTextItem>
        </HelperText>
      </FormHelperText>
      <DescriptionList isHorizontal style={{ marginTop: '1rem' }}>
        <DescriptionListGroup>
          <DescriptionListTerm>Notebook Image</DescriptionListTerm>
          <DescriptionListDescription>
            {selectedTemplate ? templateSettings[selectedTemplate]?.image : 'Select a template to view'}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>CPU/Memory/GPU Limits</DescriptionListTerm>
          <DescriptionListDescription>
            {selectedTemplate ? templateSettings[selectedTemplate]?.resources : 'Select a template to view'}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Home Volume Mount Path (CRITICAL: Non-editable)</DescriptionListTerm>
          <DescriptionListDescription>
            {selectedTemplate ? templateSettings[selectedTemplate]?.homePath : '/opt/app-root/src/'}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
      <FormHelperText style={{ marginTop: '0.5rem' }}>
        <HelperText>
          <HelperTextItem>
            The Home Volume Mount Path is fixed by the Template and applies to all migrated workbenches.
          </HelperTextItem>
        </HelperText>
      </FormHelperText>

      <Title headingLevel="h5" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        Data Access Policies
      </Title>
      <DescriptionList isHorizontal>
        <DescriptionListGroup>
          <DescriptionListTerm>Allowed Connections</DescriptionListTerm>
          <DescriptionListDescription>
            {selectedTemplate ? 
              (selectedTemplate.includes('GPU') ? 
                'S3 Bucket Connections, PostgreSQL Databases, Redis Cache, GPU-accelerated ML Services' :
                'S3 Bucket Connections, PostgreSQL Databases, Redis Cache, Standard ML Services'
              ) : 
              'Select a template to view'
            }
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Network Policies</DescriptionListTerm>
          <DescriptionListDescription>
            {selectedTemplate ? 
              'Internal cluster communication, External API access (HTTPS only), Data source connections' : 
              'Select a template to view'
            }
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>

      <Title headingLevel="h5" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        Template Auditability
      </Title>
      <DescriptionList isHorizontal>
        <DescriptionListGroup>
          <DescriptionListTerm>Defined by</DescriptionListTerm>
          <DescriptionListDescription>
            {selectedTemplate ? 'Admin User (IT Governance Team)' : 'Select a template to view'}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Last Updated</DescriptionListTerm>
          <DescriptionListDescription>
            {selectedTemplate ? '2024-01-15 14:30:00 UTC' : 'Select a template to view'}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Template Version</DescriptionListTerm>
          <DescriptionListDescription>
            {selectedTemplate ? 'v2.1.3' : 'Select a template to view'}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>

      <Title headingLevel="h5" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        New Workbench Naming Convention
      </Title>
      <DescriptionList isHorizontal>
        <DescriptionListGroup>
          <DescriptionListTerm>Naming Pattern</DescriptionListTerm>
          <DescriptionListDescription>
            {activeWorkbenches.length > 0 ? 
              `[Original Name]-v2-[${new Date().toISOString().slice(0, 10)}]` : 
              'No workbenches selected'
            }
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Example Names</DescriptionListTerm>
          <DescriptionListDescription>
            {activeWorkbenches.length > 0 ? 
              activeWorkbenches.slice(0, 2).map(wb => `${wb.name}-v2-${new Date().toISOString().slice(0, 10)}`).join(', ') + 
              (activeWorkbenches.length > 2 ? `, +${activeWorkbenches.length - 2} more...` : '') :
              'No workbenches selected'
            }
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </>
  );

  const handleMigrate = () => {
    // eslint-disable-next-line no-console
    console.log(`Launching migration for ${activeWorkbenches.length} workbenches with template`, selectedTemplate);
    onClose();
  };

  const summaryStep = (
    <>
      <Card style={{ backgroundColor: '#e6f3ff', border: '1px solid #0066cc', marginBottom: '1rem' }}>
        <CardTitle>Launch and Final Safety Guarantee</CardTitle>
        <CardBody>
          This is the final step. By clicking 'Migrate & Launch', you commit to creating {activeWorkbenches.length} new, compliant Workbenches. Your original legacy workbenches will remain untouched and active until you manually delete them, ensuring you have zero downtime and a safe fallback.
        </CardBody>
      </Card>

      <Title headingLevel="h5" style={{ marginBottom: '1rem' }}>
        Migration Summary
      </Title>
      <DescriptionList isHorizontal>
        <DescriptionListGroup>
          <DescriptionListTerm>Template selected</DescriptionListTerm>
          <DescriptionListDescription>{selectedTemplate || 'Not selected'}</DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Configuration conflicts</DescriptionListTerm>
          <DescriptionListDescription>
            {envRows.length === 0 ? 'Resolved' : `${envRows.length} remaining`}
          </DescriptionListDescription>
        </DescriptionListGroup>
        <DescriptionListGroup>
          <DescriptionListTerm>Workbenches to migrate</DescriptionListTerm>
          <DescriptionListDescription>
            {activeWorkbenches.length} workbenches
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>

      <Title headingLevel="h5" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        Original Workbenches in Batch
      </Title>
      <DescriptionList isHorizontal>
        <DescriptionListGroup>
          <DescriptionListTerm>Legacy V1 Workbenches</DescriptionListTerm>
          <DescriptionListDescription>
            {activeWorkbenches.length > 0 ? 
              activeWorkbenches.map((wb) => wb.name).join(', ') : 
              'No workbenches selected'
            }
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>

      <Alert variant="success" isInline title="Safety Guarantee" style={{ marginTop: '1rem' }}>
        The original legacy V1 Workbenches will NOT be deleted. You must delete them manually after verifying the new resources.
      </Alert>

      <Alert variant="info" isInline title="Post-migration status" style={{ marginTop: '1rem' }}>
        The system will provision {activeWorkbenches.length} new NB 2.0 compliant workbenches. Your legacy V1 resources will remain running until you manually delete them.
      </Alert>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      aria-labelledby="migration-wizard-title"
      appendTo={document.body}
      width="60%"
    >
      <ModalHeader title="Migration Assistant Wizard" labelId="migration-wizard-title" />
      <ModalBody>
        <PageSection hasBodyWrapper={false} type={PageSectionTypes.wizard} aria-label="Migration assist wizard">
          <Wizard onClose={onClose}>
            <WizardStep
              id="scan-recommend"
              name="1. Scan & Template Recommendation"
              body={{ hasNoPadding: false }}
              footer={{
                isNextDisabled:
                  isScanning ||
                  selectedTemplate.trim() === '' ||
                  !allWorkbenchesCompatible
              }}
            >
              <div style={{ padding: '1rem' }}>
                {scanStep}
              </div>
            </WizardStep>

            <WizardStep
              id="resolve-conflicts"
              name="2. Resolve Configuration Conflicts"
              body={{ hasNoPadding: false }}
              footer={{ isNextDisabled: envRows.length > 0 }}
            >
              <div style={{ padding: '1rem' }}>
                {conflictsStep}
              </div>
            </WizardStep>

            <WizardStep id="review-inherited" name="3. Review Template Constraints" body={{ hasNoPadding: false }}>
              <div style={{ padding: '1rem' }}>
                {reviewStep}
              </div>
            </WizardStep>

            <WizardStep
              id="summary-launch"
              name="4. Summary & Launch"
              body={{ hasNoPadding: false }}
              footer={{ nextButtonText: `Migrate & Launch (${activeWorkbenches.length} Workbenches)`, onNext: handleMigrate }}
            >
              <div style={{ padding: '1rem' }}>
                {summaryStep}
              </div>
            </WizardStep>
          </Wizard>
        </PageSection>
      </ModalBody>
    </Modal>
  );
};

export default MigrationAssistWizard;


