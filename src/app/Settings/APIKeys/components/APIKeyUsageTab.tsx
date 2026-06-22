import * as React from 'react';
import {
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateBody,
  FormSelect,
  FormSelectOption,
  Label,
  PageSection,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { SearchIcon } from '@patternfly/react-icons';
import { APIKeyUsageEntry } from '../types';
import { generateMockUsageData, getModelById } from '../mockData';

interface APIKeyUsageTabProps {
  keyId: string;
}

const APIKeyUsageTab: React.FunctionComponent<APIKeyUsageTabProps> = ({ keyId }) => {
  const [timeRange, setTimeRange] = React.useState<string>('7d');
  const [usageData, setUsageData] = React.useState<APIKeyUsageEntry[]>([]);

  React.useEffect(() => {
    // Generate mock usage data for this key
    const data = generateMockUsageData(keyId);
    setUsageData(data);
  }, [keyId]);

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusCodeLabel = (statusCode?: number) => {
    if (!statusCode) return null;
    
    if (statusCode >= 200 && statusCode < 300) {
      return <Label id={`status-${statusCode}`} color="green" isCompact>{statusCode}</Label>;
    } else if (statusCode >= 400 && statusCode < 500) {
      return <Label id={`status-${statusCode}`} color="orange" isCompact>{statusCode}</Label>;
    } else if (statusCode >= 500) {
      return <Label id={`status-${statusCode}`} color="red" isCompact>{statusCode}</Label>;
    }
    return <Label id={`status-${statusCode}`} isCompact>{statusCode}</Label>;
  };

  const getModelName = (modelId?: string): string => {
    if (!modelId) return '—';
    const model = getModelById(modelId);
    return model?.name || modelId;
  };

  const formatTokens = (tokens?: number): string => {
    if (!tokens) return '—';
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  // Filter data based on time range
  const filteredData = React.useMemo(() => {
    const now = new Date();
    let cutoffDate: Date;

    switch (timeRange) {
      case '24h':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return usageData.filter((entry) => entry.timestamp >= cutoffDate);
  }, [usageData, timeRange]);

  return (
    <PageSection>
      <Content component={ContentVariants.h2} id="api-key-usage-heading" style={{ marginTop: '1rem' }}>
        Usage activity
      </Content>
      <Content component={ContentVariants.p} style={{ color: 'var(--pf-t--global--text--color--subtle)', marginBottom: '1rem' }}>
        Recent API calls and activity for this key.
      </Content>

      <Toolbar id="usage-toolbar" style={{ paddingLeft: 0 }}>
        <ToolbarContent>
          <ToolbarItem>
            <FormSelect
              value={timeRange}
              onChange={(_event, value) => setTimeRange(value)}
              aria-label="Time range"
              id="usage-time-range-select"
            >
              <FormSelectOption value="24h" label="Last 24 hours" />
              <FormSelectOption value="7d" label="Last 7 days" />
              <FormSelectOption value="30d" label="Last 30 days" />
            </FormSelect>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>

      {filteredData.length === 0 ? (
        <EmptyState titleText="No activity found" icon={SearchIcon} id="usage-empty-state">
          <EmptyStateBody>
            No API calls have been made with this key in the selected time period.
          </EmptyStateBody>
        </EmptyState>
      ) : (
        <Table aria-label="API key usage table" id="api-key-usage-table">
          <Thead>
            <Tr>
              <Th>Timestamp</Th>
              <Th>Endpoint</Th>
              <Th>Model</Th>
              <Th>Status</Th>
              <Th>Tokens</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredData.map((entry) => (
              <Tr key={entry.id}>
                <Td dataLabel="Timestamp">{formatTimestamp(entry.timestamp)}</Td>
                <Td dataLabel="Endpoint">
                  <code style={{ fontSize: '0.875rem' }}>{entry.endpoint}</code>
                </Td>
                <Td dataLabel="Model">{getModelName(entry.model)}</Td>
                <Td dataLabel="Status">{getStatusCodeLabel(entry.statusCode)}</Td>
                <Td dataLabel="Tokens">{formatTokens(entry.tokensUsed)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </PageSection>
  );
};

export { APIKeyUsageTab };
