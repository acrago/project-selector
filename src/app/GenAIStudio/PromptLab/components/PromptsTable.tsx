import * as React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Label,
  Pagination,
} from '@patternfly/react-core';
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import {
  PlusCircleIcon,
} from '@patternfly/react-icons';
import { Prompt } from '../types';

interface PromptsTableProps {
  prompts: Prompt[];
  onPromptSelect?: (prompt: Prompt) => void;
  onCreatePrompt?: () => void;
  showPagination?: boolean;
  showActions?: boolean;
  emptyStateMessage?: string;
  emptyStateAction?: React.ReactNode;
  id?: string;
}

export const PromptsTable: React.FunctionComponent<PromptsTableProps> = ({
  prompts,
  onPromptSelect,
  onCreatePrompt,
  showPagination = true,
  emptyStateMessage = 'No prompts found',
  emptyStateAction,
  id = 'prompts-table',
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [sortBy, setSortBy] = React.useState<string>('name');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSort = (columnName: string) => {
    if (sortBy === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnName);
      setSortDirection('asc');
    }
  };

  const getSortedPrompts = () => {
    return [...prompts].sort((a, b) => {
      let compareResult = 0;

      switch (sortBy) {
        case 'name':
          compareResult = a.name.localeCompare(b.name);
          break;
        case 'lastModified':
          compareResult = a.lastModified.getTime() - b.lastModified.getTime();
          break;
        default:
          compareResult = 0;
      }

      return sortDirection === 'asc' ? compareResult : -compareResult;
    });
  };

  const getPaginatedPrompts = () => {
    if (!showPagination) {
      return getSortedPrompts();
    }
    
    const sorted = getSortedPrompts();
    const startIdx = (currentPage - 1) * perPage;
    const endIdx = startIdx + perPage;
    return sorted.slice(startIdx, endIdx);
  };

  if (prompts.length === 0) {
    return (
      <EmptyState titleText={emptyStateMessage} icon={PlusCircleIcon} id={`${id}-empty-state`}>
        <EmptyStateBody>
          {emptyStateMessage}
        </EmptyStateBody>
        {(emptyStateAction || onCreatePrompt) && (
          <EmptyStateFooter>
            <EmptyStateActions>
              {emptyStateAction || (
                onCreatePrompt && (
                  <Button variant="primary" onClick={onCreatePrompt} id={`${id}-create-button`}>
                    Create prompt
                  </Button>
                )
              )}
            </EmptyStateActions>
          </EmptyStateFooter>
        )}
      </EmptyState>
    );
  }

  return (
    <>
      <Table aria-label="Prompts table" variant="compact" id={id}>
        <Thead>
          <Tr>
            <Th
              width={25}
              sort={{
                sortBy: { index: 0, direction: sortBy === 'name' ? sortDirection : undefined },
                onSort: () => handleSort('name'),
                columnIndex: 0,
              }}
            >
              Name
            </Th>
            <Th width={10}>Latest version</Th>
            <Th
              width={15}
              sort={{
                sortBy: { index: 2, direction: sortBy === 'lastModified' ? sortDirection : undefined },
                onSort: () => handleSort('lastModified'),
                columnIndex: 2,
              }}
            >
              Last modified
            </Th>
            <Th width={20}>Commit message</Th>
            <Th width={10}>Alias</Th>
            <Th width={15}>Tags</Th>
          </Tr>
        </Thead>
        <Tbody>
          {getPaginatedPrompts().map((prompt) => (
            <Tr
              key={prompt.id}
              id={`${id}-row-${prompt.id}`}
              isSelectable={!!onPromptSelect}
              isClickable={!!onPromptSelect}
              onRowClick={() => onPromptSelect?.(prompt)}
            >
              <Td dataLabel="Name">
                {onPromptSelect ? (
                  <Button
                    variant="link"
                    isInline
                    onClick={() => onPromptSelect(prompt)}
                    id={`${id}-name-${prompt.id}`}
                  >
                    {prompt.name}
                  </Button>
                ) : (
                  <span>{prompt.name}</span>
                )}
                {prompt.description && (
                  <div style={{ fontSize: 'var(--pf-v6-global--FontSize--sm)', color: 'var(--pf-v6-global--Color--200)' }}>
                    {prompt.description}
                  </div>
                )}
              </Td>
              <Td dataLabel="Latest version">{prompt.latestVersion}</Td>
              <Td dataLabel="Last modified">{formatDate(prompt.lastModified)}</Td>
              <Td dataLabel="Commit message">
                {prompt.commitMessage || '-'}
              </Td>
              <Td dataLabel="Alias">
                {prompt.alias ? <Label color="blue">{prompt.alias}</Label> : '-'}
              </Td>
              <Td dataLabel="Tags">
                {prompt.tags.length > 0 ? (
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                    {prompt.tags.map((tag, index) => (
                      <Label key={`${prompt.id}-tag-${index}`} color="grey" isCompact>
                        {tag}
                      </Label>
                    ))}
                  </div>
                ) : (
                  '-'
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {showPagination && prompts.length > 0 && (
        <Pagination
          itemCount={prompts.length}
          perPage={perPage}
          page={currentPage}
          onSetPage={(_event, pageNumber) => setCurrentPage(pageNumber)}
          onPerPageSelect={(_event, newPerPage) => {
            setPerPage(newPerPage);
            setCurrentPage(1);
          }}
          variant="bottom"
          perPageOptions={[
            { title: '5', value: 5 },
            { title: '10', value: 10 },
            { title: '20', value: 20 },
            { title: '50', value: 50 },
          ]}
          id={`${id}-pagination`}
        />
      )}
    </>
  );
};

