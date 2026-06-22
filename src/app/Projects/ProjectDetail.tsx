import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert,
  AlertVariant,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  PageSection,
  Tab,
  TabTitleText,
  Tabs,
  Title,
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
  PlusCircleIcon,
} from '@patternfly/react-icons';

// Mock data for users
interface User {
  id: string;
  name: string;
  permission: string;
  dateAdded: string;
}

// Mock data for groups
interface Group {
  id: string;
  name: string;
  permission: string;
  dateAdded: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'uxdpoc6',
    permission: 'Admin',
    dateAdded: '11 months ago',
  },
];

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'dedicated-admins',
    permission: 'Custom',
    dateAdded: '11 months ago',
  },
  {
    id: '2',
    name: 'dedicated-admins',
    permission: 'Admin',
    dateAdded: '11 months ago',
  },
  {
    id: '3',
    name: 'dedicated-admins',
    permission: 'Custom',
    dateAdded: '11 months ago',
  },
  {
    id: '4',
    name: 'system:serviceaccounts:dedicated-admin',
    permission: 'Custom',
    dateAdded: '11 months ago',
  },
];

const ProjectDetail: React.FunctionComponent = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>('permissions');
  const [isActionsOpen, setIsActionsOpen] = React.useState(false);
  const [openKebabMenus, setOpenKebabMenus] = React.useState<Set<string>>(new Set());
  const [usersSortBy, setUsersSortBy] = React.useState<ISortBy>({
    index: 0,
    direction: 'asc',
  });
  const [groupsSortBy, setGroupsSortBy] = React.useState<ISortBy>({
    index: 0,
    direction: 'asc',
  });

  const toggleKebabMenu = (id: string) => {
    setOpenKebabMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getUsersSortParams = (columnIndex: number) => ({
    sortBy: usersSortBy,
    onSort: (_event: any, index: number, direction: 'asc' | 'desc') => {
      setUsersSortBy({ index, direction });
    },
    columnIndex,
  });

  const getGroupsSortParams = (columnIndex: number) => ({
    sortBy: groupsSortBy,
    onSort: (_event: any, index: number, direction: 'asc' | 'desc') => {
      setGroupsSortBy({ index, direction });
    },
    columnIndex,
  });

  // User icon component
  const UserIconCircle = () => (
    <div
      style={{
        display: 'inline-block',
        width: '40px',
        height: '40px',
        padding: '4px',
        borderRadius: '20px',
        background: '#ffe8cc',
        color: 'var(--ai-user--IconColor)',
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
        <path d="M21.32,17.8C27.8,14.41,25.42,4.39,18,4.38s-9.8,10-3.32,13.42A13.63,13.63,0,0,0,4.38,31a.61.61,0,0,0,.62.62H31a.61.61,0,0,0,.62-.62A13.63,13.63,0,0,0,21.32,17.8Zm-9.2-6.3c.25-7.76,11.51-7.76,11.76,0C23.63,19.26,12.37,19.26,12.12,11.5ZM5.64,30.38C7,14.79,29.05,14.8,30.36,30.38Z"></path>
      </svg>
    </div>
  );

  // Group icon component
  const GroupIconCircle = () => (
    <div
      style={{
        display: 'inline-block',
        width: '40px',
        height: '40px',
        padding: '4px',
        borderRadius: '20px',
        background: '#ffe8cc',
        color: 'var(--ai-group--IconColor)',
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
        <path d="m 27.87,23.29 a 3.86,3.86 0 1 0 -4.74,0 A 7.11,7.11 0 0 0 18.38,30 0.61,0.61 0 0 0 19,30.62 H 32 A 0.63,0.63 0 0 0 32.63,30 7.13,7.13 0 0 0 27.87,23.29 Z m -5,-3 a 2.62,2.62 0 0 1 5.24,0 2.62,2.62 0 0 1 -5.23,-0.04 z m -3.22,9.13 c 0.84,-6.94 10.84,-6.93 11.68,0 z M 16,19.38 a 0.62,0.62 0 0 0 0,1.24 h 4 a 0.62,0.62 0 0 0 0,-1.24 z m -2.63,-4 a 6,6 0 0 1 9.48,0.18 0.61,0.61 0 0 0 0.66,-0.07 c 1.07,-1 -2.27,-3 -3.13,-3.21 a 3.86,3.86 0 1 0 -4.76,0 c -0.86,0.25 -4.2,2.18 -3.13,3.21 a 0.62,0.62 0 0 0 0.88,-0.11 z m 2,-6.13 a 2.62,2.62 0 0 1 5.24,0 2.62,2.62 0 0 1 -5.23,0 z m -2.5,14.04 a 3.86,3.86 0 1 0 -4.74,0 A 7.11,7.11 0 0 0 3.38,30 0.61,0.61 0 0 0 4,30.62 H 17 A 0.63,0.63 0 0 0 17.63,30 7.13,7.13 0 0 0 12.87,23.29 Z m -5,-3 a 2.62,2.62 0 0 1 5.24,0 2.62,2.62 0 0 1 -5.23,-0.04 z m -3.21,9.09 c 0.84,-6.94 10.84,-6.93 11.68,0 z"></path>
      </svg>
    </div>
  );

  return (
    <>
      <div className="pf-v6-c-page__main-breadcrumb">
        <div style={{ padding: 'var(--pf-v5-global--spacer--lg) var(--pf-v5-global--spacer--lg)' }}>
          <Breadcrumb>
            <BreadcrumbItem>
              <Link to="/projects">Projects</Link>
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{projectId}</BreadcrumbItem>
          </Breadcrumb>
        </div>
      </div>

      <PageSection>
        <Flex
          direction={{ default: 'row' }}
          alignItems={{ default: 'alignItemsCenter' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
        >
          <FlexItem>
            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <div
                  style={{
                    display: 'inline-block',
                    width: '40px',
                    height: '40px',
                    padding: '4px',
                    borderRadius: '20px',
                    background: '#f2f2f2',
                    color: '#151515',
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
              </FlexItem>
              <FlexItem>
                <Title headingLevel="h1" size="2xl">
                  {projectId}
                </Title>
              </FlexItem>
              <FlexItem>
                <OutlinedQuestionCircleIcon style={{ color: 'var(--pf-v5-global--Color--200)' }} />
              </FlexItem>
            </Flex>
          </FlexItem>
          <FlexItem>
            <Dropdown
              isOpen={isActionsOpen}
              onSelect={() => setIsActionsOpen(false)}
              onOpenChange={(isOpen: boolean) => setIsActionsOpen(isOpen)}
              toggle={(toggleRef) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsActionsOpen(!isActionsOpen)}
                  isExpanded={isActionsOpen}
                  variant="secondary"
                >
                  Actions
                </MenuToggle>
              )}
            >
              <DropdownList>
                <DropdownItem key="edit">Edit project</DropdownItem>
                <DropdownItem key="delete">Delete project</DropdownItem>
              </DropdownList>
            </Dropdown>
          </FlexItem>
        </Flex>
      </PageSection>

      <PageSection type="tabs" padding={{ default: 'noPadding' }}>
        <Tabs
          activeKey={activeTabKey}
          onSelect={(_event, tabIndex) => setActiveTabKey(tabIndex)}
          aria-label="Project tabs"
          role="region"
        >
          <Tab eventKey="overview" title={<TabTitleText>Overview</TabTitleText>} />
          <Tab eventKey="workbenches" title={<TabTitleText>Workbenches</TabTitleText>} />
          <Tab eventKey="pipelines" title={<TabTitleText>Pipelines</TabTitleText>} />
          <Tab eventKey="deployments" title={<TabTitleText>Deployments</TabTitleText>} />
          <Tab eventKey="cluster-storage" title={<TabTitleText>Cluster storage</TabTitleText>} />
          <Tab eventKey="connections" title={<TabTitleText>Connections</TabTitleText>} />
          <Tab eventKey="permissions" title={<TabTitleText>Permissions</TabTitleText>} />
        </Tabs>
      </PageSection>

      <PageSection isFilled>
        {activeTabKey === 'permissions' && (
          <>
            <Alert
              variant={AlertVariant.warning}
              isInline
              title="Warning"
              style={{ marginBottom: 'var(--pf-v5-global--spacer--lg)' }}
            >
              Changing user or group permissions may remove their access to this resource.
            </Alert>

            <div className="pf-v6-l-stack__item" style={{ margin: '15px 0' }}>
              Add users and groups that can access the project.
            </div>

            {/* Users Section */}
            <div className="pf-v6-l-stack__item" style={{ marginBottom: 'var(--pf-v5-global--spacer--2xl)' }}>
              <div className="pf-v6-l-stack pf-m-gutter">
                <div className="pf-v6-l-stack__item">
                  <div className="pf-v6-l-flex pf-m-row pf-m-align-items-center pf-m-gap-sm user">
                    <UserIconCircle />
                    <div>
                      <Title 
                        headingLevel="h2" 
                        size="xl"
                        id="user-permission-user"
                        className="pf-v6-c-title pf-m-xl"
                        data-ouia-component-type="PF6/Title"
                        data-ouia-safe="true"
                        data-ouia-component-id="OUIA-Generated-Title-1"
                      >
                        Users
                      </Title>
                    </div>
                  </div>
                </div>

                <div className="pf-v6-l-stack__item">
                  <Table 
                    aria-label="Users table" 
                    variant="compact"
                    className="pf-v6-c-table pf-m-grid-md pf-m-compact pf-m-animate-expand"
                    data-ouia-component-type="PF6/Table"
                    data-ouia-safe="true"
                    data-ouia-component-id="OUIA-Generated-Table-1"
                    data-testid="role-binding-table User"
                  >
                    <Thead className="pf-v6-c-table__thead pf-m-nowrap">
                      <Tr>
                        <Th sort={getUsersSortParams(0)} className="pf-v6-c-table__th pf-m-width-30">Name</Th>
                        <Th className="pf-v6-c-table__th pf-m-width-20">Permission</Th>
                        <Th className="pf-v6-c-table__th pf-m-width-25">Date added</Th>
                        <Th />
                      </Tr>
                    </Thead>
                    <Tbody>
                      {mockUsers.map((user) => (
                        <Tr key={user.id}>
                          <Td dataLabel="Username">
                            <p 
                              data-ouia-component-type="PF6/Content"
                              data-ouia-safe="true"
                              data-pf-content="true"
                              className="pf-v6-c-content--p"
                            >
                              <span className="pf-v6-c-truncate">
                                <span className="pf-v6-c-truncate__start">{user.name}</span>
                              </span>
                            </p>
                          </Td>
                          <Td dataLabel="Permission">
                            <p 
                              data-ouia-component-type="PF6/Content"
                              data-ouia-safe="true"
                              data-pf-content="true"
                              className="pf-v6-c-content--p"
                            >
                              {user.permission}
                            </p>
                          </Td>
                          <Td dataLabel="Date added">
                            <p 
                              data-ouia-component-type="PF6/Content"
                              data-ouia-safe="true"
                              data-pf-content="true"
                              className="pf-v6-c-content--p"
                            >
                              <div style={{ display: 'contents' }}>
                                <span className="pf-v6-c-timestamp pf-m-help-text" tabIndex={0}>
                                  <time className="pf-v6-c-timestamp__text">{user.dateAdded}</time>
                                </span>
                              </div>
                            </p>
                          </Td>
                          <Td isActionCell className="pf-v6-c-table__td pf-v6-c-table__action pf-m-nowrap" style={{ textAlign: 'right' }}>
                            <Dropdown
                              isOpen={openKebabMenus.has(`user-${user.id}`)}
                              onSelect={() => toggleKebabMenu(`user-${user.id}`)}
                              onOpenChange={(isOpen: boolean) => {
                                if (!isOpen) {
                                  toggleKebabMenu(`user-${user.id}`);
                                }
                              }}
                              toggle={(toggleRef) => (
                                <MenuToggle
                                  ref={toggleRef}
                                  aria-label="Kebab toggle"
                                  variant="plain"
                                  onClick={() => toggleKebabMenu(`user-${user.id}`)}
                                  isExpanded={openKebabMenus.has(`user-${user.id}`)}
                                  className="pf-v6-c-menu-toggle pf-m-plain"
                                >
                                  <EllipsisVIcon />
                                </MenuToggle>
                              )}
                            >
                              <DropdownList>
                                <DropdownItem key="edit">Edit</DropdownItem>
                                <DropdownItem key="remove">Remove</DropdownItem>
                              </DropdownList>
                            </Dropdown>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </div>

                <div className="pf-v6-l-stack__item" style={{ marginBottom: '15px' }}>
                  <Button 
                    variant="link" 
                    isInline 
                    icon={<PlusCircleIcon />}
                    data-testid="add-button user"
                    className="pf-v6-c-button pf-m-link pf-m-inline"
                    data-ouia-component-type="PF6/Button"
                    data-ouia-safe="true"
                    data-ouia-component-id="OUIA-Generated-Button-link-1"
                    style={{ paddingLeft: 'var(--pf-t--global--spacer--lg)' }}
                  >
                    Add user
                  </Button>
                </div>
              </div>
            </div>

            {/* Groups Section */}
            <div className="pf-v6-l-stack__item">
              <div className="pf-v6-l-stack pf-m-gutter">
                <div className="pf-v6-l-stack__item">
                  <div className="pf-v6-l-flex pf-m-row pf-m-align-items-center pf-m-gap-sm user">
                    <GroupIconCircle />
                    <div>
                      <Title 
                        headingLevel="h2" 
                        size="xl"
                        id="user-permission-group"
                        className="pf-v6-c-title pf-m-xl"
                        data-ouia-component-type="PF6/Title"
                        data-ouia-safe="true"
                        data-ouia-component-id="OUIA-Generated-Title-2"
                      >
                        Groups
                      </Title>
                    </div>
                  </div>
                </div>

                <div className="pf-v6-l-stack__item">
                  <Table 
                    aria-label="Groups table" 
                    variant="compact"
                    className="pf-v6-c-table pf-m-grid-md pf-m-compact pf-m-animate-expand"
                    data-ouia-component-type="PF6/Table"
                    data-ouia-safe="true"
                    data-ouia-component-id="OUIA-Generated-Table-2"
                    data-testid="role-binding-table Group"
                  >
                    <Thead className="pf-v6-c-table__thead pf-m-nowrap">
                      <Tr>
                        <Th sort={getGroupsSortParams(0)} className="pf-v6-c-table__th pf-m-width-30">Name</Th>
                        <Th className="pf-v6-c-table__th pf-m-width-20">Permission</Th>
                        <Th className="pf-v6-c-table__th pf-m-width-25">Date added</Th>
                        <Th />
                      </Tr>
                    </Thead>
                    <Tbody>
                      {mockGroups.map((group) => (
                        <Tr key={group.id}>
                          <Td dataLabel="Name">
                            <p 
                              data-ouia-component-type="PF6/Content"
                              data-ouia-safe="true"
                              data-pf-content="true"
                              className="pf-v6-c-content--p"
                            >
                              <span className="pf-v6-c-truncate">
                                <span className="pf-v6-c-truncate__start">{group.name}</span>
                              </span>
                            </p>
                          </Td>
                          <Td dataLabel="Permission">
                            <p 
                              data-ouia-component-type="PF6/Content"
                              data-ouia-safe="true"
                              data-pf-content="true"
                              className="pf-v6-c-content--p"
                            >
                              {group.permission}
                            </p>
                          </Td>
                          <Td dataLabel="Date added">
                            <p 
                              data-ouia-component-type="PF6/Content"
                              data-ouia-safe="true"
                              data-pf-content="true"
                              className="pf-v6-c-content--p"
                            >
                              <div style={{ display: 'contents' }}>
                                <span className="pf-v6-c-timestamp pf-m-help-text" tabIndex={0}>
                                  <time className="pf-v6-c-timestamp__text">{group.dateAdded}</time>
                                </span>
                              </div>
                            </p>
                          </Td>
                          <Td isActionCell className="pf-v6-c-table__td pf-v6-c-table__action pf-m-nowrap" style={{ textAlign: 'right' }}>
                            <Dropdown
                              isOpen={openKebabMenus.has(`group-${group.id}`)}
                              onSelect={() => toggleKebabMenu(`group-${group.id}`)}
                              onOpenChange={(isOpen: boolean) => {
                                if (!isOpen) {
                                  toggleKebabMenu(`group-${group.id}`);
                                }
                              }}
                              toggle={(toggleRef) => (
                                <MenuToggle
                                  ref={toggleRef}
                                  aria-label="Kebab toggle"
                                  variant="plain"
                                  onClick={() => toggleKebabMenu(`group-${group.id}`)}
                                  isExpanded={openKebabMenus.has(`group-${group.id}`)}
                                  className="pf-v6-c-menu-toggle pf-m-plain"
                                >
                                  <EllipsisVIcon />
                                </MenuToggle>
                              )}
                            >
                              <DropdownList>
                                <DropdownItem key="edit">Edit</DropdownItem>
                                <DropdownItem key="remove">Remove</DropdownItem>
                              </DropdownList>
                            </Dropdown>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </div>

                <div className="pf-v6-l-stack__item">
                  <Button 
                    variant="link" 
                    isInline 
                    icon={<PlusCircleIcon />}
                    data-testid="add-button group"
                    className="pf-v6-c-button pf-m-link pf-m-inline"
                    data-ouia-component-type="PF6/Button"
                    data-ouia-safe="true"
                    data-ouia-component-id="OUIA-Generated-Button-link-2"
                    style={{ paddingLeft: 'var(--pf-t--global--spacer--lg)' }}
                  >
                    Add group
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTabKey !== 'permissions' && (
          <div>Content for {activeTabKey} tab</div>
        )}
      </PageSection>
    </>
  );
};

export { ProjectDetail };

