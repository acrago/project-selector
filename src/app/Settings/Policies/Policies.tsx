import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  PageSection,
  Popover,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  ActionsColumn,
  IAction,
  Table,
  Tbody,
  Td,
  Th,
  ThProps,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { InfoCircleIcon, PlusIcon } from '@patternfly/react-icons';
import { mockPolicies } from './mockData';
import { Policy } from './types';
import { EditPolicyModal } from './components/EditPolicyModal';
import { DeletePolicyModal } from './components/DeletePolicyModal';

const Policies: React.FunctionComponent = () => {
  const navigate = useNavigate();

  // Sorting state
  const [activeSortIndex, setActiveSortIndex] = React.useState<number | undefined>(0);
  const [activeSortDirection, setActiveSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // Sort function for columns
  const getSortableRowValues = (policy: Policy): (string | number)[] => {
    return [policy.name, policy.type, policy.status];
  };

  // Sort the policies
  const sortedPolicies = React.useMemo(() => {
    let sorted = [...mockPolicies];
    if (activeSortIndex !== undefined) {
      sorted = sorted.sort((a, b) => {
        const aValue = getSortableRowValues(a)[activeSortIndex];
        const bValue = getSortableRowValues(b)[activeSortIndex];
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return activeSortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }
    return sorted;
  }, [activeSortIndex, activeSortDirection]);

  // Sort handler
  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
      defaultDirection: 'asc',
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  const getTargetsSummary = (policy: Policy): React.ReactNode => {
    const totalTargets = 
      policy.targets.groups.length +
      policy.targets.users.length +
      policy.targets.serviceAccounts.length;

    if (totalTargets === 0) {
      return <span>No targets</span>;
    }

    return (
      <Flex spaceItems={{ default: 'spaceItemsXs' }} alignItems={{ default: 'alignItemsCenter' }}>
        {policy.targets.groups.length > 0 && (
          <FlexItem>
            <Badge isRead>{policy.targets.groups.length} Groups</Badge>
          </FlexItem>
        )}
        {policy.targets.users.length > 0 && (
          <FlexItem>
            <Badge isRead>{policy.targets.users.length} Users</Badge>
          </FlexItem>
        )}
        {policy.targets.serviceAccounts.length > 0 && (
          <FlexItem>
            <Badge isRead>{policy.targets.serviceAccounts.length} Service Accounts</Badge>
          </FlexItem>
        )}
      </Flex>
    );
  };

  const getRulesSummary = (policy: Policy): React.ReactNode => {
    const rules: string[] = [];
    
    if (policy.limits.tokenLimit) {
      rules.push(`Token limit: ${policy.limits.tokenLimit.amount}/${policy.limits.tokenLimit.period}`);
    }
    
    if (policy.limits.rateLimit) {
      rules.push(`Rate limit: ${policy.limits.rateLimit.amount}/${policy.limits.rateLimit.period}`);
    }
    
    if (policy.limits.timeLimit) {
      rules.push('Time limit');
    }

    if (rules.length === 0) {
      return <span>No limits</span>;
    }

    return (
      <Flex direction={{ default: 'column' }}>
        {rules.map((rule, index) => (
          <FlexItem key={index}>
            <span style={{ fontSize: '0.875rem' }}>{rule}</span>
          </FlexItem>
        ))}
      </Flex>
    );
  };

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedPolicy, setSelectedPolicy] = React.useState<Policy | null>(null);

  const rowActions = (policy: Policy): IAction[] => [
    {
      title: 'View details',
      onClick: () => navigate(`/settings/policies/${policy.id}`),
    },
    {
      title: policy.status === 'Active' ? 'Disable policy' : 'Enable policy',
      onClick: () => {
        console.log('Toggle status', policy.id);
      },
    },
    {
      title: 'Edit policy',
      onClick: () => {
        navigate(`/settings/policies/${policy.id}/edit`);
      },
    },
    {
      isSeparator: true,
    },
    {
      title: 'Delete policy',
      onClick: () => {
        setSelectedPolicy(policy);
        setIsDeleteModalOpen(true);
      },
    },
  ];

  const handleCreatePolicy = () => {
    navigate('/settings/policies/create');
  };

  const handleRowClick = (policy: Policy) => {
    navigate(`/settings/policies/${policy.id}`);
  };

  return (
    <PageSection>
      <Content component={ContentVariants.h1}>Policies</Content>
      <Content component={ContentVariants.p}>
        Manage access policies, rate limits, and usage controls for AI assets.
      </Content>

      <Toolbar id="policies-toolbar">
        <ToolbarContent>
          <ToolbarItem>
            <Button 
              variant="primary" 
              icon={<PlusIcon />}
              onClick={handleCreatePolicy}
              id="create-policy-button"
            >
              Create policy
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Popover
              headerContent="Work in progress"
              bodyContent="If policies make it into 3.4, there will likely be significant updates to the policy creation form and related workflows that need to be explored more deeply."
              position="right"
              id="create-policy-wip-popover"
            >
              <Badge
                id="create-policy-wip-badge"
                style={{ backgroundColor: '#F32BC4', color: '#ffffff', fontSize: '10px', cursor: 'pointer' }}
              >
                Work in Progress <InfoCircleIcon style={{ marginLeft: '0.25rem' }} />
              </Badge>
            </Popover>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      <Table aria-label="Policies table" id="policies-table">
            <Thead>
              <Tr>
                <Th sort={getSortParams(0)}>Name</Th>
                <Th sort={getSortParams(1)}>Type</Th>
                <Th sort={getSortParams(2)}>Status</Th>
                <Th>Targets</Th>
                <Th>Rules</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedPolicies.map((policy) => (
                <Tr 
                  key={policy.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleRowClick(policy)}
                >
                  <Td dataLabel="Name">
                    <div>
                      <Button 
                        variant="link" 
                        isInline
                        id={`policy-name-${policy.id}`}
                        style={{ textDecoration: 'none' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(policy);
                        }}
                      >
                        {policy.name}
                      </Button>
                      {policy.description && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--pf-t--global--text--color--subtle)' }}>
                          {policy.description}
                        </div>
                      )}
                    </div>
                  </Td>
                  <Td dataLabel="Type">
                    <Badge id={`policy-type-${policy.id}`} isRead>
                      {policy.type}
                    </Badge>
                  </Td>
                  <Td dataLabel="Status">
                    <Badge 
                      id={`policy-status-${policy.id}`}
                      isRead={policy.status === 'Inactive'}
                    >
                      {policy.status}
                    </Badge>
                  </Td>
                  <Td dataLabel="Targets">
                    {getTargetsSummary(policy)}
                  </Td>
                  <Td dataLabel="Rules">
                    {getRulesSummary(policy)}
                  </Td>
                  <Td isActionCell>
                    <ActionsColumn 
                      items={rowActions(policy)}
                      onClick={(e) => e.stopPropagation()} // Prevent row click when clicking actions
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

      <EditPolicyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPolicy(null);
        }}
        policy={selectedPolicy}
      />

      <DeletePolicyModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPolicy(null);
        }}
        policy={selectedPolicy}
        onDelete={(policy) => {
          console.log('Policy deleted:', policy.id);
        }}
      />
    </PageSection>
  );
};

export { Policies };


