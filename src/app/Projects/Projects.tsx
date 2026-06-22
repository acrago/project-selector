import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Banner,
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Label,
  MenuToggle,
  PageSection,
  Pagination,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  ISortBy,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import {
  EllipsisVIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import { FeatureFlagsOverrideModal } from '@app/AIHub/Deployments/FeatureFlagsOverrideModal';

// Project data type
interface Project {
  id: string;
  name: string;
  owner: string;
  description?: string;
  created: string;
}

// Mock data based on the screenshot
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'a project with object storage with an extremely long name so we can see how it wraps',
    owner: 'cluster-admin',
    description: 'DC: UXDPOC6 connects to Object storage, and a model is saved in the path "/models/fraud/1/model.onnx"',
    created: '10/30/2024, 7:26:48 PM',
  },
  {
    id: '2',
    name: 'jonTest',
    owner: 'uxdpoc6',
    description: '',
    created: '10/21/2025, 8:58:50 PM',
  },
  {
    id: '3',
    name: 'KatieTest2025',
    owner: 'uxdpoc6',
    description: 'my project testing description',
    created: '6/10/2025, 1:29:48 AM',
  },
  {
    id: '4',
    name: 'new-project123',
    owner: 'uxdpoc6',
    description: '',
    created: '1/24/2025, 3:17:47 PM',
  },
  {
    id: '5',
    name: 'Playground',
    owner: 'uxdpoc6',
    description: '',
    created: '7/29/2025, 4:24:39 AM',
  },
  {
    id: '6',
    name: 'test-rc',
    owner: 'uxdpoc6',
    description: 'test',
    created: '2/26/2025, 1:09:19 AM',
  },
  {
    id: '7',
    name: 'testing',
    owner: 'uxdpoc6',
    description: '',
    created: '5/27/2025, 10:14:29 AM',
  },
  {
    id: '8',
    name: 'Project Alpha',
    owner: 'uxdpoc6',
    description: 'Alpha testing project',
    created: '3/15/2025, 2:30:00 PM',
  },
  {
    id: '9',
    name: 'ML Pipeline',
    owner: 'cluster-admin',
    description: 'Machine learning pipeline project',
    created: '4/20/2025, 9:45:00 AM',
  },
  {
    id: '10',
    name: 'Data Analysis',
    owner: 'uxdpoc6',
    description: 'Data analysis and visualization',
    created: '8/12/2025, 3:22:00 PM',
  },
  {
    id: '11',
    name: 'Project X',
    owner: 'uxdpoc6',
    description: 'Project for NIMs',
    created: '4/27/2026, 3:53:00 PM',
  },
];

const Projects: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [isFeatureFlagsModalOpen, setIsFeatureFlagsModalOpen] = React.useState(false);
  const [filterValue, setFilterValue] = React.useState('');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = React.useState(false);
  const [selectedFilter, setSelectedFilter] = React.useState('A.I. projects');
  const [isAllProjectsMenuOpen, setIsAllProjectsMenuOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [sortBy, setSortBy] = React.useState<ISortBy>({
    index: 0,
    direction: 'asc',
  });
  const [openKebabMenus, setOpenKebabMenus] = React.useState<Set<string>>(new Set());

  // Filter projects based on search
  const getFilteredProjects = () => {
    let filtered = [...mockProjects];

    if (filterValue) {
      filtered = filtered.filter((project) =>
        project.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    // Sort projects
    filtered.sort((a, b) => {
      const aValue = sortBy.index === 0 ? a.name : a.created;
      const bValue = sortBy.index === 0 ? b.name : b.created;
      
      if (sortBy.direction === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  };

  const filteredProjects = getFilteredProjects();
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // Kebab menu handlers
  const toggleKebabMenu = (projectId: string) => {
    setOpenKebabMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const getSortParams = (columnIndex: number) => ({
    sortBy,
    onSort: (_event: any, index: number, direction: 'asc' | 'desc') => {
      setSortBy({ index, direction });
    },
    columnIndex,
  });

  return (
    <>
      <Banner isSticky color="blue" id="projects-page-banner">
        <Flex
          justifyContent={{ default: 'justifyContentCenter', lg: 'justifyContentSpaceBetween' }}
          flexWrap={{ default: 'nowrap' }}
        >
          <FlexItem>
            Feature flags are{' '}
            <Button
              variant="link"
              isInline
              onClick={() => setIsFeatureFlagsModalOpen(true)}
              id="projects-feature-flags-banner-overridden-link"
            >
              overridden
            </Button>
            {' '}in the current session.{' '}
            <Button
              variant="link"
              isInline
              onClick={() => setIsFeatureFlagsModalOpen(true)}
              id="projects-feature-flags-banner-click-here"
            >
              Click here
            </Button>
            {' '}to reset back to defaults.
          </FlexItem>
        </Flex>
      </Banner>
      <PageSection>
        <Flex
          direction={{ default: 'row' }}
          alignItems={{ default: 'alignItemsCenter' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
        >
          <FlexItem className="pf-m-flex-1">
            <h1
              data-ouia-component-type="PF6/Content"
              data-ouia-safe="true"
              data-ouia-component-id="OUIA-Generated-Content-35"
              data-testid="app-page-title"
              data-pf-content="true"
              className="pf-v6-c-content--h1"
            >
              <div className="pf-v6-l-flex pf-m-space-items-sm pf-m-align-items-center">
                <div>
                  <div
                    style={{
                      background: '#ffe8cc',
                      borderRadius: '20px',
                      padding: '4px',
                      width: '40px',
                      height: '40px',
                    }}
                  >
                    <svg
                      className="pf-v6-svg"
                      viewBox="0 0 36 36"
                      fill="currentColor"
                      aria-hidden="true"
                      role="img"
                      width="1em"
                      height="1em"
                      style={{ width: '32px', height: '32px' }}
                    >
                      <path d="M31,9.38H27.29l-.52-2.47a.62.62,0,0,0-.61-.49H18.84a.62.62,0,0,0-.61.49l-.52,2.47H8.21a.62.62,0,0,0-.62.62V25a.63.63,0,0,0,1.25,0V10.62h9.37a.61.61,0,0,0,.61-.49l.53-2.46h6.3l.53,2.46a.61.61,0,0,0,.61.49h3.59V28.38H5.62V10a.62.62,0,0,0-1.24,0V29a.62.62,0,0,0,.62.62H31a.62.62,0,0,0,.62-.62V10A.62.62,0,0,0,31,9.38Z"></path>
                    </svg>
                  </div>
                </div>
                <div>Projects</div>
              </div>
            </h1>
            <div className="pf-v6-l-stack pf-m-gutter">
              <div data-testid="app-page-description" className="pf-v6-l-stack__item">
                View your existing projects or create new projects.
              </div>
            </div>
          </FlexItem>
          <FlexItem>
            <Button variant="secondary" id="start-workbench-button">
              Start basic workbench
            </Button>
          </FlexItem>
        </Flex>
      </PageSection>

      <PageSection isFilled>
        <Toolbar id="projects-toolbar">
          <ToolbarContent>
            <ToolbarItem>
              <Select
                id="filter-type-select"
                isOpen={isFilterMenuOpen}
                selected={selectedFilter}
                onSelect={(_event, value) => {
                  setSelectedFilter(value as string);
                  setIsFilterMenuOpen(false);
                }}
                onOpenChange={(isOpen) => setIsFilterMenuOpen(isOpen)}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                    isExpanded={isFilterMenuOpen}
                  >
                    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem>{selectedFilter}</FlexItem>
                      <FlexItem>
                        <Label color="blue" isCompact>
                          10
                        </Label>
                      </FlexItem>
                      <FlexItem>
                        <span 
                          data-testid="ai-project-label" 
                          className="pf-v6-c-label pf-m-outline pf-m-compact"
                        >
                          <span className="pf-v6-c-label__content">
                            <span className="pf-v6-c-label__icon">
                              <svg 
                                className="pf-v6-svg" 
                                viewBox="0 0 576 512" 
                                fill="currentColor" 
                                aria-hidden="true" 
                                role="img" 
                                width="1em" 
                                height="1em"
                              >
                                <path d="M528.1 171.5L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6zM388.6 312.3l23.7 138.4L288 385.4l-124.3 65.3 23.7-138.4-100.6-98 139-20.2 62.2-126 62.2 126 139 20.2-100.6 98z"></path>
                              </svg>
                            </span>
                            <span className="pf-v6-c-label__text">AI</span>
                          </span>
                        </span>
                      </FlexItem>
                    </Flex>
                  </MenuToggle>
                )}
              >
                <SelectList>
                  <SelectOption value="All projects">
                    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem>All projects</FlexItem>
                      <FlexItem>
                        <Label color="blue" isCompact>
                          10
                        </Label>
                      </FlexItem>
                    </Flex>
                  </SelectOption>
                  <SelectOption value="A.I. projects">
                    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem>A.I. projects</FlexItem>
                      <FlexItem>
                        <Label color="blue" isCompact>
                          10
                        </Label>
                      </FlexItem>
                      <FlexItem>
                        <span 
                          data-testid="ai-project-label" 
                          className="pf-v6-c-label pf-m-outline pf-m-compact"
                        >
                          <span className="pf-v6-c-label__content">
                            <span className="pf-v6-c-label__icon">
                              <svg 
                                className="pf-v6-svg" 
                                viewBox="0 0 576 512" 
                                fill="currentColor" 
                                aria-hidden="true" 
                                role="img" 
                                width="1em" 
                                height="1em"
                              >
                                <path d="M528.1 171.5L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6zM388.6 312.3l23.7 138.4L288 385.4l-124.3 65.3 23.7-138.4-100.6-98 139-20.2 62.2-126 62.2 126 139 20.2-100.6 98z"></path>
                              </svg>
                            </span>
                            <span className="pf-v6-c-label__text">AI</span>
                          </span>
                        </span>
                      </FlexItem>
                    </Flex>
                  </SelectOption>
                </SelectList>
              </Select>
            </ToolbarItem>

            <ToolbarItem>
              <Select
                id="name-sort-select"
                isOpen={isAllProjectsMenuOpen}
                selected="Name"
                onSelect={() => {
                  setIsAllProjectsMenuOpen(false);
                }}
                onOpenChange={(isOpen) => setIsAllProjectsMenuOpen(isOpen)}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsAllProjectsMenuOpen(!isAllProjectsMenuOpen)}
                    isExpanded={isAllProjectsMenuOpen}
                  >
                    Name
                  </MenuToggle>
                )}
              >
                <SelectList>
                  <SelectOption value="Name">Name</SelectOption>
                  <SelectOption value="Created">Created</SelectOption>
                </SelectList>
              </Select>
            </ToolbarItem>

            <ToolbarItem>
              <SearchInput
                placeholder="Filter by name"
                value={filterValue}
                onChange={(_event, value) => setFilterValue(value)}
                onClear={() => setFilterValue('')}
                aria-label="Filter by name"
              />
            </ToolbarItem>

            <ToolbarItem>
              <Button variant="primary" id="create-project-button">
                Create project
              </Button>
            </ToolbarItem>

            <ToolbarItem>
              <Pagination
                itemCount={filteredProjects.length}
                page={currentPage}
                perPage={perPage}
                onSetPage={(_event, page) => setCurrentPage(page)}
                onPerPageSelect={(_event, perPage) => {
                  setPerPage(perPage);
                  setCurrentPage(1);
                }}
                id="table-pagination-top"
                isCompact
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>

        <Table aria-label="Projects table" variant="compact">
          <Thead>
            <Tr>
              <Th sort={getSortParams(0)}>Name</Th>
              <Th sort={getSortParams(1)}>Created</Th>
              <Th />
            </Tr>
          </Thead>

          <Tbody>
            {paginatedProjects.map((project) => (
              <Tr key={project.id}>
                <Td dataLabel="Name">
                  <div>
                    <div style={{ marginBottom: '4px' }}>
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/projects/${project.name}`);
                        }}
                      >
                        {project.name}
                      </a>
                      {project.id === '1' && (
                        <OutlinedQuestionCircleIcon
                          style={{ marginLeft: '8px', color: 'var(--pf-v5-global--Color--200)' }}
                        />
                      )}
                    </div>
                    <small 
                      data-ouia-component-type="PF6/Content" 
                      data-ouia-safe="true" 
                      data-pf-content="true" 
                      className="pf-v6-c-content--small"
                    >
                      {project.owner}
                    </small>
                    {project.description && (
                      <div style={{ fontSize: 'var(--pf-v5-global--FontSize--sm)', marginTop: '4px', color: 'var(--pf-v5-global--Color--100)' }}>
                        {project.description}
                      </div>
                    )}
                  </div>
                </Td>
                <Td dataLabel="Created">{project.created}</Td>
                <Td isActionCell>
                  <Dropdown
                    isOpen={openKebabMenus.has(project.id)}
                    onSelect={() => toggleKebabMenu(project.id)}
                    onOpenChange={(isOpen: boolean) => {
                      if (!isOpen) {
                        toggleKebabMenu(project.id);
                      }
                    }}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        aria-label="kebab dropdown toggle"
                        variant="plain"
                        onClick={() => toggleKebabMenu(project.id)}
                        isExpanded={openKebabMenus.has(project.id)}
                      >
                        <EllipsisVIcon />
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem key="edit">Edit</DropdownItem>
                      <DropdownItem key="delete">Delete</DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </PageSection>
      <FeatureFlagsOverrideModal
        isOpen={isFeatureFlagsModalOpen}
        onClose={() => setIsFeatureFlagsModalOpen(false)}
      />
    </>
  );
};

export { Projects };
