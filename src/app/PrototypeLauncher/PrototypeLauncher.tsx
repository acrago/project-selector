import * as React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  SearchInput,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import {
  Table,
  Tbody,
  Td,
  Th,
  ThProps,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { ListIcon, SearchIcon, ThIcon } from '@patternfly/react-icons';
import { useGitLabForks } from '@app/../hooks/useGitLabForks';
import type { ForkWithPages } from '@app/../hooks/useGitLabForks';

const MAIN_REPO_URL = 'https://gitlab.cee.redhat.com/uxd/prototypes/rhoai';

export interface PrototypeRow {
  id: string;
  name: string;
  owner: string;
  description?: string;
  lastUpdated?: Date;
  branch?: string;
  url: string;
  repoUrl?: string;
  isE2E: boolean;
  isMain?: boolean;
}

const E2E_PROTOTYPES: PrototypeRow[] = [
  {
    id: 'e2e-3.4',
    name: '3.4',
    owner: 'End-to-end',
    description: 'Main branch prototype',
    url: 'https://rhoai-3-4-cb1313.pages.redhat.com/',
    repoUrl: MAIN_REPO_URL,
    isE2E: true,
  },
  {
    id: 'e2e-3.2',
    name: '3.2',
    owner: 'End-to-end',
    description: 'Previous release prototype',
    url: 'https://rhoai-3-2-b7c7bf.pages.redhat.com/',
    repoUrl: MAIN_REPO_URL,
    isE2E: true,
  },
];

function formatDateTime(date: Date | undefined): string {
  if (!date) return '—';
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function stripGeneratedDescriptionPrefix(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let out = text.trim();
  const prefixes = [
    /^This prototype fork is working on\s+/i,
    /^This prototype fork,\s*[^,]+,?\s*is working on\s+/i,
    /^This prototype fork,\s*[^,]+,?\s*is\s+/i,
    /^This prototype fork of (rhoai|RhoAI)\s+is\s+/i,
  ];
  for (const re of prefixes) {
    if (re.test(out)) {
      out = out.replace(re, '').trim();
      break;
    }
  }
  return out || text;
}

function forkToRow(fork: ForkWithPages): PrototypeRow {
  return {
    id: `fork-${fork.id}`,
    name: fork.name,
    owner: fork.owner,
    description: fork.description || undefined,
    lastUpdated: fork.lastActivityAt,
    branch: fork.mostRecentBranch || fork.defaultBranch,
    url: fork.pagesUrl,
    repoUrl: fork.repoUrl,
    isE2E: false,
    isMain: fork.isMain,
  };
}

function getForkId(row: PrototypeRow): string | null {
  if (row.id.startsWith('fork-')) return row.id.slice(5);
  return null;
}

function matchesSearch(row: PrototypeRow, search: string, descriptionOverride?: string): boolean {
  if (!search.trim()) return true;
  const q = search.trim().toLowerCase();
  const owner = (row.owner || '').toLowerCase();
  const name = (row.name || '').toLowerCase();
  const desc = (descriptionOverride ?? row.description ?? '').toLowerCase();
  const branch = (row.branch || '').toLowerCase();
  return (
    owner.includes(q) ||
    name.includes(q) ||
    desc.includes(q) ||
    branch.includes(q)
  );
}

function sortRowsForDisplay(rows: PrototypeRow[]): PrototypeRow[] {
  return [...rows].sort((a, b) => {
    const orderA = a.id === 'e2e-3.4' ? 0 : a.id === 'e2e-3.2' ? 1 : 2;
    const orderB = b.id === 'e2e-3.4' ? 0 : b.id === 'e2e-3.2' ? 1 : 2;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

export interface OwnerGroup {
  owner: string;
  rows: PrototypeRow[];
}

function groupByOwner(rows: PrototypeRow[]): OwnerGroup[] {
  const byOwner = new Map<string, PrototypeRow[]>();
  for (const row of rows) {
    const owner = row.owner || '—';
    if (!byOwner.has(owner)) byOwner.set(owner, []);
    byOwner.get(owner)!.push(row);
  }
  const groups: OwnerGroup[] = [];
  for (const [owner, ownerRows] of byOwner) {
    groups.push({ owner, rows: sortRowsForDisplay(ownerRows) });
  }
  groups.sort((a, b) => {
    if (a.owner === 'End-to-end') return -1;
    if (b.owner === 'End-to-end') return 1;
    return a.owner.localeCompare(b.owner, undefined, { sensitivity: 'base' });
  });
  return groups;
}

function getDisplayGroups(rows: PrototypeRow[]): OwnerGroup[] {
  const groups = groupByOwner(rows);
  const result: OwnerGroup[] = [];
  for (const g of groups) {
    if (g.owner === 'End-to-end') {
      for (const row of g.rows) {
        result.push({ owner: g.owner, rows: [row] });
      }
    } else {
      result.push(g);
    }
  }
  return result;
}

function getBranchDisplay(row: PrototypeRow): string {
  if (row.branch) return row.branch;
  if (row.isE2E) return row.name;
  return '—';
}

function getRepoBranchUrl(row: PrototypeRow): string | undefined {
  if (!row.repoUrl) return undefined;
  const branch = getBranchDisplay(row);
  if (branch === '—') return row.repoUrl;
  return `${row.repoUrl}/-/tree/${encodeURIComponent(branch)}`;
}

type ViewMode = 'card' | 'list';

const FORK_DESCRIPTIONS_URL = '/fork-descriptions.json';

const PrototypeLauncher: React.FunctionComponent = () => {
  const { forks, loading, error } = useGitLabForks();
  const [searchValue, setSearchValue] = React.useState('');
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [generatedDescriptions, setGeneratedDescriptions] = React.useState<Record<string, string> | null>(null);

  React.useEffect(() => {
    // Fetch generated descriptions; CI writes public/fork-descriptions.json and webpack copies to dist
    fetch(FORK_DESCRIPTIONS_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => (data && typeof data === 'object' ? setGeneratedDescriptions(data) : null))
      .catch(() => {});
  }, []);

  const allRows = React.useMemo(() => {
    const e2e = E2E_PROTOTYPES;
    const forkRows = forks.map(forkToRow);
    return [...e2e, ...forkRows];
  }, [forks]);

  const filteredRows = React.useMemo(() => {
    return allRows.filter((row) => {
      const descForSearch =
        getForkId(row) && generatedDescriptions?.[getForkId(row)!]
          ? generatedDescriptions[getForkId(row)!]
          : undefined;
      return matchesSearch(row, searchValue, descForSearch);
    });
  }, [allRows, searchValue, generatedDescriptions]);

  const [activeSortIndex, setActiveSortIndex] = React.useState<number | undefined>(undefined);
  const [activeSortDirection, setActiveSortDirection] = React.useState<'asc' | 'desc' | undefined>(undefined);

  const displayGroups = React.useMemo(() => {
    const groups = getDisplayGroups(filteredRows);
    if (activeSortIndex === undefined || activeSortDirection === undefined) return groups;
    return [...groups].sort((a, b) => {
      const primaryA = a.rows[0];
      const primaryB = b.rows[0];
      let cmp = 0;
      switch (activeSortIndex) {
        case 0:
          cmp = a.owner.localeCompare(b.owner, undefined, { sensitivity: 'base' });
          break;
        case 1:
          cmp = getBranchDisplay(primaryA).localeCompare(
            getBranchDisplay(primaryB),
            undefined,
            { sensitivity: 'base' }
          );
          break;
        case 2:
          cmp = (primaryA.description || '').localeCompare(
            primaryB.description || '',
            undefined,
            { sensitivity: 'base' }
          );
          break;
        case 3: {
          const timeA = primaryA.lastUpdated?.getTime() ?? -1;
          const timeB = primaryB.lastUpdated?.getTime() ?? -1;
          cmp = timeA - timeB;
          break;
        }
        default:
          return 0;
      }
      return activeSortDirection === 'asc' ? cmp : -cmp;
    });
  }, [filteredRows, activeSortIndex, activeSortDirection]);

  const getDisplayDescription = (row: PrototypeRow): string => {
    const forkId = getForkId(row);
    const raw =
      forkId && generatedDescriptions?.[forkId]
        ? generatedDescriptions[forkId]
        : row.description ?? '—';
    if (raw === '—') return raw;
    return stripGeneratedDescriptionPrefix(raw);
  };

  const getSortParams = (columnIndex: number): ThProps['sort'] => {
    return {
      sortBy: {
        index: activeSortIndex,
        direction: activeSortDirection,
      },
      onSort: (_event, index, direction) => {
        setActiveSortIndex(index);
        setActiveSortDirection(direction);
      },
      columnIndex,
      'aria-label': `Sort by column ${columnIndex + 1}`,
    };
  };

  const [openDropdowns, setOpenDropdowns] = React.useState<Set<string>>(new Set());
  const toggleDropdown = (owner: string) => {
    setOpenDropdowns((prev) => {
      const next = new Set(prev);
      if (next.has(owner)) next.delete(owner);
      else next.add(owner);
      return next;
    });
  };

  const handleLaunch = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <>
      <PageSection variant="default">
        <Title headingLevel="h1" size="lg" id="prototype-launcher-page-title">
          Prototype Launcher
        </Title>
        <p style={{ marginTop: '0.5rem', color: 'var(--pf-v6-global--Color--200)' }}>
          Select a prototype to open it in a new tab. End-to-end prototypes and forks with GitLab Pages are listed
          below.
        </p>
      </PageSection>
      <PageSection variant="default">
        <Toolbar id="prototype-launcher-toolbar">
          <ToolbarContent>
            <ToolbarItem style={{ flexGrow: 1, maxWidth: '400px' }}>
              <SearchInput
                id="prototype-launcher-search"
                placeholder="Search by owner, name, branch, or description..."
                value={searchValue}
                onChange={(_event, value) => setSearchValue(value)}
                onClear={() => setSearchValue('')}
                aria-label="Search prototypes"
              />
            </ToolbarItem>
            <ToolbarItem>
              <ToggleGroup aria-label="View mode" id="prototype-launcher-view-toggle">
                <ToggleGroupItem
                  text="Card view"
                  icon={<ThIcon />}
                  aria-label="Card view"
                  buttonId="prototype-launcher-view-card"
                  isSelected={viewMode === 'card'}
                  onChange={() => setViewMode('card')}
                />
                <ToggleGroupItem
                  text="List view"
                  icon={<ListIcon />}
                  aria-label="List view"
                  buttonId="prototype-launcher-view-list"
                  isSelected={viewMode === 'list'}
                  onChange={() => setViewMode('list')}
                />
              </ToggleGroup>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>

        {loading && (
          <div id="prototype-launcher-loading" style={{ padding: '2rem', textAlign: 'center' }}>
            Loading prototypes…
          </div>
        )}

        {error && (
          <EmptyState id="prototype-launcher-error" icon={SearchIcon} titleText="Could not load prototypes">
            <EmptyStateBody>{error}</EmptyStateBody>
          </EmptyState>
        )}

        {!loading && !error && displayGroups.length === 0 && (
          <EmptyState id="prototype-launcher-empty" icon={SearchIcon} titleText="No prototypes match your search">
            <EmptyStateBody>
              Try a different search term, or clear the search to see all prototypes.
            </EmptyStateBody>
            <Button variant="link" onClick={() => setSearchValue('')} id="prototype-launcher-clear-search">
              Clear search
            </Button>
          </EmptyState>
        )}

        {!loading && !error && displayGroups.length > 0 && viewMode === 'list' && (
          <Card className="prototype-launcher-card">
            <Table aria-label="Prototypes table" variant="compact" id="prototype-launcher-table">
              <Thead>
                <Tr>
                  <Th sort={getSortParams(0)}>Owner</Th>
                  <Th sort={getSortParams(1)}>Branch</Th>
                  <Th sort={getSortParams(2)}>Description</Th>
                  <Th sort={getSortParams(3)}>Last updated</Th>
                  <Th>Prototype</Th>
                </Tr>
              </Thead>
              <Tbody>
                {displayGroups.map((group) => {
                  const primary = group.rows[0];
                  const hasMultiple = group.rows.length > 1;
                  const rowKey = primary.id;
                  const dropdownId = `prototype-list-dropdown-${rowKey}`;
                  return (
                    <Tr
                      key={rowKey}
                      id={`prototype-row-${rowKey}`}
                      className={primary.isE2E ? 'prototype-launcher-row-e2e' : undefined}
                    >
                      <Td dataLabel="Owner">{group.owner}</Td>
                      <Td
                        dataLabel="Branch"
                        id={primary.isE2E ? `prototype-branch-locked-${primary.id}` : undefined}
                      >
                        {getRepoBranchUrl(primary) ? (
                          <Button
                            variant="link"
                            isInline
                            component="a"
                            href={getRepoBranchUrl(primary)}
                            target="_blank"
                            rel="noopener noreferrer"
                            id={
                              primary.isE2E ? undefined : `prototype-launcher-branch-link-${primary.id}`
                            }
                          >
                            {getBranchDisplay(primary)}
                          </Button>
                        ) : (
                          getBranchDisplay(primary)
                        )}
                      </Td>
                      <Td dataLabel="Description">
                        {getDisplayDescription(primary) !== '—' ? (
                          <span
                            style={{
                              fontSize: 'var(--pf-v6-global--FontSize--sm)',
                              color: 'var(--pf-v6-global--Color--200)',
                            }}
                          >
                            {getDisplayDescription(primary)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </Td>
                      <Td dataLabel="Last updated">{formatDateTime(primary.lastUpdated)}</Td>
                      <Td dataLabel="Prototype">
                        {hasMultiple ? (
                          <div style={{ display: 'flex', gap: 0 }}>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleLaunch(primary.url)}
                              id={`prototype-launch-${primary.id}`}
                              component="button"
                              style={{
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                                borderRight: '1px solid rgba(255, 255, 255, 0.3)',
                              }}
                            >
                              Launch
                            </Button>
                            <Dropdown
                              isOpen={openDropdowns.has(group.owner)}
                              onSelect={() => toggleDropdown(group.owner)}
                              onOpenChange={(isOpen) => {
                                if (!isOpen) toggleDropdown(group.owner);
                              }}
                              popperProps={{ placement: 'left' }}
                              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                <MenuToggle
                                  ref={toggleRef}
                                  variant="primary"
                                  size="sm"
                                  isExpanded={openDropdowns.has(group.owner)}
                                  onClick={() => toggleDropdown(group.owner)}
                                  id={dropdownId}
                                  aria-label="Launch prototype menu"
                                  style={{
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0,
                                    minWidth: '32px',
                                  }}
                                />
                              )}
                            >
                              <DropdownList>
                                {group.rows.map((row) => (
                                  <DropdownItem
                                    key={row.id}
                                    onClick={() => handleLaunch(row.url)}
                                    id={`prototype-list-launch-${row.id}`}
                                  >
                                    {row.name}
                                  </DropdownItem>
                                ))}
                              </DropdownList>
                            </Dropdown>
                          </div>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleLaunch(primary.url)}
                            id={`prototype-launch-${primary.id}`}
                            component="button"
                          >
                            Launch
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Card>
        )}

        {!loading && !error && displayGroups.length > 0 && viewMode === 'card' && (
          <Grid hasGutter id="prototype-launcher-cards">
            {displayGroups.map((group) => {
              const primary = group.rows[0];
              const hasMultiple = group.rows.length > 1;
              const rowKey = primary.id;
              const cardDropdownId = `prototype-card-dropdown-${rowKey}`;
              return (
                <GridItem key={rowKey} sm={12} md={6} lg={4}>
                  <Card
                    id={`prototype-card-${rowKey}`}
                    className={
                      primary.isE2E
                        ? 'prototype-launcher-card prototype-launcher-card-e2e'
                        : 'prototype-launcher-card'
                    }
                  >
                    <CardHeader>
                      <CardTitle id={`prototype-card-title-${rowKey}`}>{group.owner}</CardTitle>
                    </CardHeader>
                    <CardBody>
                      {getDisplayDescription(primary) !== '—' && (
                        <Content>
                          <p>{getDisplayDescription(primary)}</p>
                        </Content>
                      )}
                      {getDisplayDescription(primary) !== '—' &&
                        (primary.lastUpdated || getBranchDisplay(primary) !== '—') && <Divider />}
                      <DescriptionList isHorizontal isCompact>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Branch</DescriptionListTerm>
                          <DescriptionListDescription
                            id={primary.isE2E ? `prototype-card-branch-locked-${primary.id}` : undefined}
                          >
                            {getRepoBranchUrl(primary) ? (
                              <Button
                                variant="link"
                                isInline
                                component="a"
                                href={getRepoBranchUrl(primary)}
                                target="_blank"
                                rel="noopener noreferrer"
                                id={primary.isE2E ? undefined : `prototype-card-branch-link-${primary.id}`}
                              >
                                {getBranchDisplay(primary)}
                              </Button>
                            ) : (
                              getBranchDisplay(primary)
                            )}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                        <DescriptionListGroup>
                          <DescriptionListTerm>Last updated</DescriptionListTerm>
                          <DescriptionListDescription>
                            {formatDateTime(primary.lastUpdated)}
                          </DescriptionListDescription>
                        </DescriptionListGroup>
                      </DescriptionList>
                      {hasMultiple && (
                        <>
                          <Divider />
                          <Content>
                            <p
                              style={{
                                fontSize: 'var(--pf-v6-global--FontSize--sm)',
                                color: 'var(--pf-v6-global--Color--200)',
                              }}
                            >
                              Repos: {group.rows.map((r) => r.name).join(', ')}
                            </p>
                          </Content>
                        </>
                      )}
                    </CardBody>
                    <CardFooter>
                      <Flex spaceItems={{ default: 'spaceItemsNone' }} justifyContent={{ default: 'justifyContentFlexStart' }}>
                        <FlexItem>
                          {hasMultiple ? (
                            <div style={{ display: 'flex', gap: 0 }}>
                              <Button
                                variant="primary"
                                onClick={() => handleLaunch(primary.url)}
                                id={`prototype-card-launch-${primary.id}`}
                                component="button"
                                style={{
                                  borderTopRightRadius: 0,
                                  borderBottomRightRadius: 0,
                                  borderRight: '1px solid rgba(255, 255, 255, 0.3)',
                                }}
                              >
                                Launch
                              </Button>
                              <Dropdown
                                isOpen={openDropdowns.has(group.owner)}
                                onSelect={() => toggleDropdown(group.owner)}
                                onOpenChange={(isOpen) => {
                                  if (!isOpen) toggleDropdown(group.owner);
                                }}
                                popperProps={{ placement: 'left' }}
                                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                                  <MenuToggle
                                    ref={toggleRef}
                                    variant="primary"
                                    isExpanded={openDropdowns.has(group.owner)}
                                    onClick={() => toggleDropdown(group.owner)}
                                    id={cardDropdownId}
                                    aria-label="Launch prototype menu"
                                    style={{
                                      borderTopLeftRadius: 0,
                                      borderBottomLeftRadius: 0,
                                      minWidth: '32px',
                                    }}
                                  />
                                )}
                              >
                                <DropdownList>
                                  {group.rows.map((row) => (
                                    <DropdownItem
                                      key={row.id}
                                      onClick={() => handleLaunch(row.url)}
                                      id={`prototype-card-dropdown-item-${row.id}`}
                                    >
                                      {row.name}
                                    </DropdownItem>
                                  ))}
                                </DropdownList>
                              </Dropdown>
                            </div>
                          ) : (
                            <Button
                              variant="primary"
                              onClick={() => handleLaunch(primary.url)}
                              id={`prototype-card-launch-${primary.id}`}
                              component="button"
                            >
                              Launch
                            </Button>
                          )}
                        </FlexItem>
                      </Flex>
                    </CardFooter>
                  </Card>
                </GridItem>
              );
            })}
          </Grid>
        )}
      </PageSection>
    </>
  );
};

export { PrototypeLauncher };
