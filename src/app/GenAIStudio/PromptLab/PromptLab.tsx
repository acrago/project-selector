import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Flex,
  FlexItem,
  InputGroup,
  InputGroupItem,
  Label,
  LabelGroup,
  MenuToggle,
  PageSection,
  Pagination,
  Popover,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
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
import {
  EllipsisVIcon,
  FilterIcon,
  OutlinedFolderIcon,
  PlusCircleIcon,
} from '@patternfly/react-icons';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';
import { CreatePromptModal } from './components/CreatePromptModal';
import { DeletePromptModal } from './components/DeletePromptModal';
import { mockPrompts } from './mockData';
import { Prompt } from './types';
import { PromptLabIcon } from '@app/Home/icons';

const PromptLab: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const { flags, selectedProject, setSelectedProject } = useFeatureFlags();
  const [prompts, setPrompts] = React.useState<Prompt[]>(mockPrompts);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedPrompt, setSelectedPrompt] = React.useState<Prompt | null>(null);
  const [filterValue, setFilterValue] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [isProjectSelectOpen, setIsProjectSelectOpen] = React.useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = React.useState(false);
  const [openKebabMenus, setOpenKebabMenus] = React.useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = React.useState<string>('name');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // Kebab menu handlers
  const toggleKebabMenu = (promptId: string) => {
    setOpenKebabMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(promptId)) {
        newSet.delete(promptId);
      } else {
        newSet.add(promptId);
      }
      return newSet;
    });
  };

  const handleCreatePrompt = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    navigate(`/gen-ai-studio/prompt-lab/${prompt.id}`);
    setOpenKebabMenus(new Set());
  };

  const handleDeletePrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsDeleteModalOpen(true);
    setOpenKebabMenus(new Set());
  };

  const handleSavePrompt = async (promptData: { name: string; promptType: 'text' | 'chat'; promptText: string; commitMessage?: string }) => {
    // Mock save - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newPrompt: Prompt = {
      id: `prompt-${Date.now()}`,
      name: promptData.name,
      description: '',
      latestVersion: '1.0',
      lastModified: new Date(),
      createdDate: new Date(),
      commitMessage: promptData.commitMessage,
      tags: [],
      project: selectedProject,
      versions: [
        {
          id: `v-${Date.now()}`,
          versionNumber: '1.0',
          registeredAt: new Date(),
          promptText: promptData.promptText,
          promptType: promptData.promptType,
          variables: [],
          aliases: [],
          metadata: {},
          commitMessage: promptData.commitMessage,
        },
      ],
    };
    setPrompts((prev) => [...prev, newPrompt]);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPrompt) return;

    // Mock delete - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setPrompts((prev) => prev.filter((p) => p.id !== selectedPrompt.id));
  };

  // Filter prompts based on search and project
  const getFilteredPrompts = () => {
    let filtered = [...prompts];

    // Filter by selected project
    filtered = filtered.filter((p) => p.project === selectedProject);

    // Filter by search term
    if (filterValue) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filtered;
  };

  // Sort prompts
  const getSortedPrompts = () => {
    const filtered = getFilteredPrompts();

    return filtered.sort((a, b) => {
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

  // Paginate prompts
  const getPaginatedPrompts = () => {
    const sorted = getSortedPrompts();
    const startIdx = (currentPage - 1) * perPage;
    const endIdx = startIdx + perPage;
    return sorted.slice(startIdx, endIdx);
  };

  const handleSort = (columnName: string) => {
    if (sortBy === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnName);
      setSortDirection('asc');
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderTable = () => {
    const promptsData = getSortedPrompts();

    if (promptsData.length === 0) {
      return (
        <EmptyState titleText="No prompts found" icon={PlusCircleIcon} id="prompt-lab-empty-state">
          <EmptyStateBody>
            {filterValue
              ? 'No prompts match your filter criteria.'
              : 'Create and manage prompts for AI systems. Version control, compare changes, and organize prompts across projects.'}
          </EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              {filterValue ? (
                <Button variant="link" onClick={() => setFilterValue('')} id="clear-filter-button">
                  Clear filters
                </Button>
              ) : (
                <Button variant="primary" onClick={handleCreatePrompt} id="create-prompt-empty-button">
                  Create prompt
                </Button>
              )}
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      );
    }

    return (
      <>
        <Table aria-label="Prompts table" variant="compact" id="prompts-table">
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
              <Th modifier="fitContent" textCenter>Latest version</Th>
              <Th
                modifier="fitContent"
                sort={{
                  sortBy: { index: 2, direction: sortBy === 'lastModified' ? sortDirection : undefined },
                  onSort: () => handleSort('lastModified'),
                  columnIndex: 2,
                }}
              >
                Last modified
              </Th>
              <Th width={20}>Commit message</Th>
              <Th width={15}>Tags</Th>
              <Th modifier="fitContent" textCenter></Th>
            </Tr>
          </Thead>
          <Tbody>
            {getPaginatedPrompts().map((prompt) => (
              <Tr key={prompt.id} id={`prompt-row-${prompt.id}`} style={{ verticalAlign: 'middle' }}>
                <Td dataLabel="Name">
                  <Button
                    variant="link"
                    isInline
                    onClick={() => handleEditPrompt(prompt)}
                    id={`prompt-name-${prompt.id}`}
                  >
                    {prompt.name}
                  </Button>
                </Td>
                <Td dataLabel="Latest version" textCenter>{prompt.latestVersion}</Td>
                <Td dataLabel="Last modified">{formatDate(prompt.lastModified)}</Td>
                <Td dataLabel="Commit message">
                  {prompt.commitMessage || '-'}
                </Td>
                <Td dataLabel="Tags" modifier="fitContent">
                  {prompt.tags.length > 0 ? (
                    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        <Label color="grey">
                          {prompt.tags[0]}
                        </Label>
                      </FlexItem>
                      {prompt.tags.length > 1 && (
                        <FlexItem>
                          <Popover
                            headerContent={<div>All tags</div>}
                            bodyContent={
                              <LabelGroup>
                                {prompt.tags.map((tag, index) => (
                                  <Label key={`${prompt.id}-all-tag-${index}`} color="grey">
                                    {tag}
                                  </Label>
                                ))}
                              </LabelGroup>
                            }
                            id={`tags-popover-${prompt.id}`}
                          >
                            <Button variant="link" isInline id={`show-more-tags-${prompt.id}`}>
                              {prompt.tags.length - 1} more
                            </Button>
                          </Popover>
                        </FlexItem>
                      )}
                    </Flex>
                  ) : (
                    '-'
                  )}
                </Td>
                <Td dataLabel="Actions" modifier="fitContent" textCenter>
                  <Dropdown
                    isOpen={openKebabMenus.has(prompt.id)}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        setOpenKebabMenus((prev) => {
                          const newSet = new Set(prev);
                          newSet.delete(prompt.id);
                          return newSet;
                        });
                      }
                    }}
                    popperProps={{ position: 'right' }}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => toggleKebabMenu(prompt.id)}
                        variant="plain"
                        aria-label={`Actions for ${prompt.name}`}
                        isExpanded={openKebabMenus.has(prompt.id)}
                        id={`prompt-actions-${prompt.id}`}
                      >
                        <EllipsisVIcon />
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem
                        key="view"
                        onClick={() => handleEditPrompt(prompt)}
                        id={`view-prompt-${prompt.id}`}
                      >
                        View details
                      </DropdownItem>
                      <DropdownItem
                        key="delete"
                        onClick={() => handleDeletePrompt(prompt)}
                        id={`delete-prompt-${prompt.id}`}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Pagination
          itemCount={promptsData.length}
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
          id="prompts-pagination-bottom"
        />
      </>
    );
  };

  return (
    <>
      {/* Title Section */}
      <PageSection id="prompt-lab-header" style={{ borderBottom: '1px solid var(--pf-v6-global--BorderColor--100)' }}>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Flex alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center' }}>
                  <PromptLabIcon withBackground size={32} />
                </div>
              </FlexItem>
              <FlexItem>
                <Title headingLevel="h1" id="prompt-lab-title">
                  Prompt management
                </Title>
              </FlexItem>
              {flags.showProjectWorkspaceDropdowns && (
                <FlexItem style={{ marginLeft: 'var(--pf-v6-global--spacer--xl)' }}>
                  <InputGroup>
                    <InputGroupItem>
                      <div className="pf-v6-c-input-group__text">
                        <OutlinedFolderIcon /> Project
                      </div>
                    </InputGroupItem>
                    <InputGroupItem>
                      <Select
                        isOpen={isProjectSelectOpen}
                        selected={selectedProject}
                        onSelect={(_event, value) => {
                          setSelectedProject(value as string);
                          setIsProjectSelectOpen(false);
                          setCurrentPage(1);
                        }}
                        onOpenChange={(isOpen) => setIsProjectSelectOpen(isOpen)}
                        toggle={(toggleRef) => (
                          <MenuToggle
                            ref={toggleRef}
                            onClick={() => setIsProjectSelectOpen(!isProjectSelectOpen)}
                            isExpanded={isProjectSelectOpen}
                            style={{ width: '200px' }}
                            id="prompt-lab-project-select-toggle"
                          >
                            {selectedProject}
                          </MenuToggle>
                        )}
                        shouldFocusToggleOnSelect
                        id="prompt-lab-project-select"
                      >
                        <SelectList>
                          <SelectOption value="Project X">Project X</SelectOption>
                          <SelectOption value="Project Y">Project Y</SelectOption>
                        </SelectList>
                      </Select>
                    </InputGroupItem>
                  </InputGroup>
                </FlexItem>
              )}
            </Flex>
          </FlexItem>

          <FlexItem>
            <Button variant="primary" onClick={handleCreatePrompt} id="create-prompt-header-button">
              Create prompt
            </Button>
          </FlexItem>
        </Flex>
      </PageSection>

      {/* Main Toolbar and Content */}
      <PageSection style={{ paddingTop: 'var(--pf-v6-global--spacer--sm)' }} isFilled id="prompt-lab-content">
        <Toolbar id="prompt-lab-toolbar">
          <ToolbarContent>
            <ToolbarGroup variant="filter-group">
              <ToolbarItem>
                <Dropdown
                  isOpen={isFilterDropdownOpen}
                  onOpenChange={setIsFilterDropdownOpen}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                      isExpanded={isFilterDropdownOpen}
                      icon={<FilterIcon />}
                      id="prompt-lab-filter-dropdown-toggle"
                    >
                      Name
                    </MenuToggle>
                  )}
                  id="prompt-lab-filter-dropdown"
                >
                  <DropdownList>
                    <DropdownItem key="name">Name</DropdownItem>
                  </DropdownList>
                </Dropdown>
              </ToolbarItem>
              <ToolbarItem>
                <InputGroup>
                  <InputGroupItem isFill>
                    <SearchInput
                      placeholder="Filter by name"
                      value={filterValue}
                      onChange={(_event, value) => setFilterValue(value)}
                      onClear={() => setFilterValue('')}
                      aria-label="Filter prompts"
                      id="prompt-lab-search"
                    />
                  </InputGroupItem>
                </InputGroup>
              </ToolbarItem>
            </ToolbarGroup>
            <ToolbarGroup align={{ default: 'alignEnd' }}>
              <ToolbarItem variant="pagination">
                <Pagination
                  itemCount={getSortedPrompts().length}
                  perPage={perPage}
                  page={currentPage}
                  onSetPage={(_event, pageNumber) => setCurrentPage(pageNumber)}
                  onPerPageSelect={(_event, newPerPage) => {
                    setPerPage(newPerPage);
                    setCurrentPage(1);
                  }}
                  variant="top"
                  isCompact
                  perPageOptions={[
                    { title: '5', value: 5 },
                    { title: '10', value: 10 },
                    { title: '20', value: 20 },
                    { title: '50', value: 50 },
                  ]}
                  id="prompts-pagination-top"
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>

        {renderTable()}
      </PageSection>

      <CreatePromptModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleSavePrompt}
      />

      <DeletePromptModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleConfirmDelete}
        prompt={selectedPrompt}
      />
    </>
  );
};

export { PromptLab };

