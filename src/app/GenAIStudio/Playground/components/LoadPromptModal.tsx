import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Checkbox,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelBody,
  DrawerPanelContent,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Pagination,
  Popover,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  TextArea,
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
import { faDownLeftAndUpRightToCenter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  OutlinedQuestionCircleIcon,
  SearchIcon,
} from '@patternfly/react-icons';
import { Prompt, PromptVersion } from '@app/GenAIStudio/PromptLab/types';
import { mockPrompts } from '@app/GenAIStudio/PromptLab/mockData';

interface LoadPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPrompt: (prompt: Prompt, version: PromptVersion, mode: 'load' | 'template') => void;
  currentProject: string;
}

export const LoadPromptModal: React.FunctionComponent<LoadPromptModalProps> = ({
  isOpen,
  onClose,
  onLoadPrompt,
  currentProject,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [showGlobalPrompts, setShowGlobalPrompts] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null);
  const [isVersionSelectOpen, setIsVersionSelectOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filterType, setFilterType] = useState<'name' | 'tags'>('name');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // Typeahead autocomplete state
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const promptRowButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const isPreviewOpen = selectedPrompt !== null;

  // All available prompts (for typeahead search across all prompts)
  const allAvailablePrompts = useMemo(() => {
    let prompts = mockPrompts.filter(p => p.project === currentProject);
    if (showGlobalPrompts) {
      const globalPrompts = mockPrompts.filter(p => p.project === 'Global');
      prompts = [...prompts, ...globalPrompts];
    }
    return prompts;
  }, [showGlobalPrompts, currentProject]);

  const filteredPrompts = useMemo(() => {
    let prompts = [...allAvailablePrompts];
    if (searchValue.trim()) {
      const lower = searchValue.toLowerCase();
      if (filterType === 'name') {
        prompts = prompts.filter(p => p.name.toLowerCase().includes(lower));
      } else {
        prompts = prompts.filter(p =>
          p.tags.some(tag => tag.toLowerCase().includes(lower))
        );
      }
    }
    return prompts;
  }, [allAvailablePrompts, searchValue, filterType]);

  const paginatedPrompts = useMemo(() => {
    const startIdx = (page - 1) * perPage;
    const endIdx = startIdx + perPage;
    return filteredPrompts.slice(startIdx, endIdx);
  }, [filteredPrompts, page, perPage]);

  // Typeahead suggestions
  const autocompleteSuggestions = useMemo(() => {
    if (!searchValue.trim()) return [];
    const lower = searchValue.toLowerCase();
    if (filterType === 'name') {
      return [...new Set(
        allAvailablePrompts
          .map(p => p.name)
          .filter(name => name.toLowerCase().includes(lower))
      )].slice(0, 10);
    } else {
      return [...new Set(
        allAvailablePrompts
          .flatMap(p => p.tags)
          .filter(tag => tag.toLowerCase().includes(lower))
      )].slice(0, 10);
    }
  }, [searchValue, filterType, allAvailablePrompts]);

  // Close autocomplete on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isAutocompleteOpen &&
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsAutocompleteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAutocompleteOpen]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const formatVersionNumber = (version: number | string): string => {
    const numericVersion = Number(version);
    return Number.isNaN(numericVersion) ? String(version) : `${Math.trunc(numericVersion)}`;
  };

  const handleRowClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    const latestVersion = prompt.versions.find(v => v.versionNumber === prompt.latestVersion)
      || prompt.versions[prompt.versions.length - 1];
    setSelectedVersion(latestVersion);
  };

  const handleCollapsePreview = () => {
    setSelectedPrompt(null);
    setSelectedVersion(null);
    setIsVersionSelectOpen(false);
  };

  const handleLoad = () => {
    if (selectedPrompt && selectedVersion) {
      onLoadPrompt(selectedPrompt, selectedVersion, 'load');
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchValue('');
    setShowGlobalPrompts(false);
    setSelectedPrompt(null);
    setSelectedVersion(null);
    setIsVersionSelectOpen(false);
    setIsFilterDropdownOpen(false);
    setFilterType('name');
    setPage(1);
    setIsAutocompleteOpen(false);
    onClose();
  };

  const clearFilters = () => {
    setSearchValue('');
    setShowGlobalPrompts(false);
    setPage(1);
  };

  const handleSearchChange = (_event: React.SyntheticEvent, value: string) => {
    setSearchValue(value);
    setPage(1);
    setIsAutocompleteOpen(value.trim().length > 0);
  };

  const handleAutocompletSelect = (_event?: React.MouseEvent, itemId?: string | number) => {
    if (itemId) {
      setSearchValue(String(itemId));
      setIsAutocompleteOpen(false);
      setPage(1);
    }
  };

  const focusPromptRowButton = (promptId: string) => {
    requestAnimationFrame(() => {
      promptRowButtonRefs.current[promptId]?.focus();
    });
  };

  const handlePromptRowArrowNavigation = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    rowIndex: number
  ) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

    const direction = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = rowIndex + direction;

    if (nextIndex < 0 || nextIndex >= paginatedPrompts.length) return;

    event.preventDefault();
    const nextPrompt = paginatedPrompts[nextIndex];
    event.currentTarget.blur();
    focusPromptRowButton(nextPrompt.id);
  };

  // Preview panel content
  const drawerPanelContent = selectedPrompt ? (
    <DrawerPanelContent defaultSize="41.6667%" id="prompt-details-drawer-panel">
      <DrawerPanelBody id="prompt-details-drawer-body">
        {/* Preview header with collapse icon */}
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsFlexStart' }}
          className="pf-v6-u-pb-sm"
        >
          <FlexItem>
            <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
              {selectedPrompt.project === 'Global' && (
                <FlexItem>
                  <Label color="purple">Sample</Label>
                </FlexItem>
              )}
              <FlexItem>
                <Title headingLevel="h2" size="md">
                  {selectedPrompt.name}
                </Title>
              </FlexItem>
            </Flex>
          </FlexItem>
          <FlexItem>
            <Button
              variant="plain"
              aria-label="Collapse preview panel"
              onClick={handleCollapsePreview}
              id="collapse-preview-button"
              icon={<FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} />}
            />
          </FlexItem>
        </Flex>

        {/* Version select */}
        <Select
          id="version-select"
          isOpen={isVersionSelectOpen}
          selected={selectedVersion?.id}
          onSelect={(_event, value) => {
            const version = selectedPrompt.versions.find(v => v.id === value);
            if (version) setSelectedVersion(version);
            setIsVersionSelectOpen(false);
          }}
          onOpenChange={setIsVersionSelectOpen}
          toggle={(toggleRef) => (
            <MenuToggle
              id="version-select-toggle"
              ref={toggleRef}
              onClick={() => setIsVersionSelectOpen(!isVersionSelectOpen)}
              isExpanded={isVersionSelectOpen}
            >
              {selectedVersion ? `Version ${formatVersionNumber(selectedVersion.versionNumber)}` : 'Select version'}
            </MenuToggle>
          )}
        >
          <SelectList>
            {selectedPrompt.versions.slice().reverse().map((version) => (
              <SelectOption
                key={version.id}
                value={version.id}
              >
                Version {formatVersionNumber(version.versionNumber)}
              </SelectOption>
            ))}
          </SelectList>
        </Select>

        {selectedVersion && (
          <>
            {/* Preview label */}
            <div className="pf-v6-u-mt-md pf-v6-u-mb-sm">
              <span className="pf-v6-u-font-weight-bold">Preview</span>
            </div>

            {/* Prompt preview text area */}
            <TextArea
              id="prompt-preview-textarea"
              value={selectedVersion.promptText}
              readOnlyVariant="default"
              rows={10}
              aria-label="Prompt preview"
              resizeOrientation="vertical"
              className="pf-v6-u-mb-sm"
            />

            {/* Metadata section with tags */}
            <DescriptionList
              id="prompt-version-details"
              isHorizontal
              horizontalTermWidthModifier={{ default: '15ch' }}
              className="pf-v6-u-mt-sm"
            >
              <DescriptionListGroup>
                <DescriptionListTerm>Last modified</DescriptionListTerm>
                <DescriptionListDescription>
                  {formatDate(selectedVersion.registeredAt)}
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Commit message</DescriptionListTerm>
                <DescriptionListDescription>
                  {selectedVersion.commitMessage || 'None'}
                </DescriptionListDescription>
              </DescriptionListGroup>
              {selectedPrompt.tags.length > 0 && (
                <DescriptionListGroup>
                  <DescriptionListTerm>Tags</DescriptionListTerm>
                  <DescriptionListDescription>
                    <LabelGroup numLabels={3}>
                      {selectedPrompt.tags.map((tag) => (
                        <Label key={tag} variant="outline">{tag}</Label>
                      ))}
                    </LabelGroup>
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )}
            </DescriptionList>
          </>
        )}
      </DrawerPanelBody>
    </DrawerPanelContent>
  ) : undefined;

  return (
    <Modal
      variant={ModalVariant.large}
      isOpen={isOpen}
      onClose={handleClose}
      id="load-prompt-modal"
      onEscapePress={handleClose}
      style={{ width: '1100px' }}
    >
      <ModalHeader
        title="Load prompt"
        description={
          <span className="pf-t--global--font--weight--body--default">
            Select a saved prompt from the current project or a global prompt template
          </span>
        }
      />
      <ModalBody style={{ minHeight: '500px', maxHeight: '500px', overflow: 'auto' }}>
        <Drawer id="load-prompt-drawer" isExpanded={isPreviewOpen} isInline position="end">
          <DrawerContent id="load-prompt-drawer-content" panelContent={drawerPanelContent}>
            <DrawerContentBody id="load-prompt-drawer-body" className={isPreviewOpen ? 'pf-v6-u-pr-md' : ''}>
              {/* Toolbar with search + pagination */}
              <Toolbar id="prompt-filter-toolbar">
                <ToolbarContent id="prompt-filter-toolbar-content">
                  <ToolbarGroup variant="filter-group">
                    <ToolbarItem>
                      <Dropdown
                        id="filter-type-dropdown"
                        isOpen={isFilterDropdownOpen}
                        onOpenChange={setIsFilterDropdownOpen}
                        onSelect={(_event, value) => {
                          setFilterType(value as 'name' | 'tags');
                          setIsFilterDropdownOpen(false);
                          setSearchValue('');
                          setPage(1);
                        }}
                        toggle={(toggleRef) => (
                          <MenuToggle
                            id="filter-type-toggle"
                            ref={toggleRef}
                            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                            isExpanded={isFilterDropdownOpen}
                          >
                            {filterType === 'name' ? 'Name' : 'Tags'}
                          </MenuToggle>
                        )}
                      >
                        <DropdownList id="filter-type-dropdown-list">
                          <DropdownItem key="name" value="name">Name</DropdownItem>
                          <DropdownItem key="tags" value="tags">Tags</DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    </ToolbarItem>
                    <ToolbarItem>
                      <div style={{ position: 'relative' }} ref={searchInputRef as React.RefObject<HTMLDivElement>}>
                        <SearchInput
                          id="prompt-search-input"
                          placeholder={filterType === 'name' ? 'Find by name' : 'Find by tag'}
                          value={searchValue}
                          onChange={handleSearchChange}
                          onClear={() => { setSearchValue(''); setIsAutocompleteOpen(false); setPage(1); }}
                          onFocus={() => { if (searchValue.trim()) setIsAutocompleteOpen(true); }}
                          aria-label="Find prompts"
                        />
                        {isAutocompleteOpen && autocompleteSuggestions.length > 0 && (
                          <div
                            ref={autocompleteRef}
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              zIndex: 1000,
                            }}
                          >
                            <Menu
                              id="autocomplete-menu"
                              onSelect={handleAutocompletSelect}
                            >
                              <MenuContent>
                                <MenuList id="autocomplete-menu-list">
                                  {autocompleteSuggestions.map((suggestion) => (
                                    <MenuItem key={suggestion} itemId={suggestion}>
                                      {suggestion}
                                    </MenuItem>
                                  ))}
                                </MenuList>
                              </MenuContent>
                            </Menu>
                          </div>
                        )}
                      </div>
                    </ToolbarItem>
                  </ToolbarGroup>
                  {/* Top pagination - compact */}
                  <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                    <Pagination
                      id="prompt-pagination-top"
                      itemCount={filteredPrompts.length}
                      perPage={perPage}
                      page={page}
                      onSetPage={(_event, pageNumber) => setPage(pageNumber)}
                      onPerPageSelect={(_event, perPageNumber) => {
                        setPerPage(perPageNumber);
                        setPage(1);
                      }}
                      isCompact
                    />
                  </ToolbarItem>
                </ToolbarContent>
              </Toolbar>

              {/* Show sample prompts checkbox */}
              <Flex className="pf-v6-u-mb-sm" gap={{ default: 'gapXs' }} alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>
                  <Checkbox
                    id="show-global-prompts"
                    label="Show sample prompts"
                    isChecked={showGlobalPrompts}
                    onChange={(_event, checked) => { setShowGlobalPrompts(checked); setPage(1); }}
                  />
                </FlexItem>
                <FlexItem>
                  <Popover
                    id="sample-prompts-info-popover"
                    aria-label="Sample prompts information"
                    headerContent="Sample prompts"
                    bodyContent="Sample prompts are provided by your platform admin and can be used as starter prompts for your projects."
                    position="auto"
                  >
                    <Button
                      variant="plain"
                      aria-label="More info for sample prompts"
                      icon={<OutlinedQuestionCircleIcon />}
                      id="sample-prompts-info-button"
                      style={{ padding: 0 }}
                    />
                  </Popover>
                </FlexItem>
              </Flex>

              {/* Table */}
              {filteredPrompts.length === 0 ? (
                <EmptyState
                  id="no-prompts-empty-state"
                  headingLevel="h3"
                  titleText="No prompts found"
                  icon={SearchIcon}
                >
                  <EmptyStateBody id="no-prompts-empty-state-body">
                    No prompts match your filter criteria.
                  </EmptyStateBody>
                  <Button id="clear-filters-button" variant="link" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </EmptyState>
              ) : (
                <Table variant="compact" aria-label="Prompt registry" id="prompt-registry-table">
                  <Thead>
                    <Tr>
                      <Th width={isPreviewOpen ? 50 : 30}>Name</Th>
                      {!isPreviewOpen && <Th>Last version</Th>}
                      <Th>{isPreviewOpen ? 'Last modified' : 'Last modified'}</Th>
                      {!isPreviewOpen && <Th>Tags</Th>}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paginatedPrompts.map((prompt, rowIndex) => (
                      <Tr
                        key={prompt.id}
                        isClickable
                        isRowSelected={selectedPrompt?.id === prompt.id}
                        onRowClick={() => {
                          handleRowClick(prompt);
                          focusPromptRowButton(prompt.id);
                        }}
                      >
                        <Td dataLabel="Name" modifier="truncate">
                          <Button
                            variant="link"
                            isInline
                            onClick={() => {
                              handleRowClick(prompt);
                              focusPromptRowButton(prompt.id);
                            }}
                            onFocus={() => handleRowClick(prompt)}
                            onKeyDown={(event) => handlePromptRowArrowNavigation(event, rowIndex)}
                            ref={(element) => {
                              promptRowButtonRefs.current[prompt.id] = element;
                            }}
                          >
                            {prompt.name}
                          </Button>
                          {prompt.project === 'Global' && (
                            <Label color="purple" className="pf-v6-u-ml-sm">Sample</Label>
                          )}
                        </Td>
                        {!isPreviewOpen && (
                          <Td dataLabel="Last version">{formatVersionNumber(prompt.latestVersion)}</Td>
                        )}
                        <Td dataLabel="Last modified">{formatDate(prompt.lastModified)}</Td>
                        {!isPreviewOpen && (
                          <Td dataLabel="Tags">
                            {prompt.tags.length > 0 && (
                              <LabelGroup numLabels={3}>
                                {prompt.tags.map((tag) => (
                                  <Label key={tag} variant="outline">{tag}</Label>
                                ))}
                              </LabelGroup>
                            )}
                          </Td>
                        )}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </DrawerContentBody>
          </DrawerContent>
        </Drawer>
      </ModalBody>
      <ModalFooter>
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsCenter' }}
          style={{ width: '100%' }}
        >
          <FlexItem>
            <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
                <Button
                  id="load-prompt-button"
                  variant="primary"
                  onClick={handleLoad}
                  isDisabled={!selectedPrompt || !selectedVersion}
                >
                  Load in playground
                </Button>
              </FlexItem>
              <FlexItem>
                <Button id="cancel-load-button" variant="link" onClick={handleClose}>
                  Cancel
                </Button>
              </FlexItem>
            </Flex>
          </FlexItem>
          {/* Bottom pagination - only in table view (not preview) */}
          {!isPreviewOpen && filteredPrompts.length > 0 && (
            <FlexItem>
              <Pagination
                id="prompt-pagination-bottom"
                itemCount={filteredPrompts.length}
                perPage={perPage}
                page={page}
                onSetPage={(_event, pageNumber) => setPage(pageNumber)}
                onPerPageSelect={(_event, perPageNumber) => {
                  setPerPage(perPageNumber);
                  setPage(1);
                }}
                isCompact
              />
            </FlexItem>
          )}
        </Flex>
      </ModalFooter>
    </Modal>
  );
};
