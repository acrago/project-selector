import * as React from 'react';
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import { css } from '@patternfly/react-styles';
import menuStyles from '@patternfly/react-styles/css/components/Menu/menu.mjs';
import {
  Badge,
  Button,
  Divider,
  DropdownGroup,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Menu,
  MenuContainer,
  MenuContent,
  MenuFooter,
  MenuToggle,
  MenuToggleElement,
  SearchInput,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { CheckIcon, OutlinedFolderIcon, OutlinedStarIcon, StarIcon } from '@patternfly/react-icons';
import { MastheadCreateProjectModal } from '@app/components/MastheadCreateProjectModal';

/** Pill “AI” badge (sparkle icon + text) to match masthead project selector spec. */
const MastheadProjectAiBadge: React.FunctionComponent<{ id: string }> = ({ id }) => (
  <span
    id={id}
    role="img"
    aria-label="AI"
    className="pf-v6-u-display-inline-flex pf-v6-u-align-items-center pf-v6-u-gap-xs pf-v6-u-px-sm pf-v6-u-py-xs"
    style={{
      border: '1px solid var(--pf-t--global--border--color--200)',
      borderRadius: '9999px',
      backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
      color: 'var(--pf-t--global--text--color--regular)',
      fontFamily: 'var(--pf-t--global--FontFamily--text)',
      lineHeight: 1,
    }}
  >
    <FontAwesomeIcon
      icon={faWandMagicSparkles}
      style={{
        fontSize: '0.8125rem',
        color: 'var(--pf-t--global--text--color--regular)',
      }}
      aria-hidden
    />
    <span
      className="pf-v6-u-font-size-xs"
      style={{
        fontFamily: 'var(--pf-t--global--FontFamily--text)',
        fontWeight: 'var(--pf-t--global--font--weight--body--default)',
      }}
      aria-hidden
    >
      AI
    </span>
  </span>
);

type DemoProject = {
  id: string;
  name: string;
  isAi: boolean;
};

const INITIAL_PROJECTS: DemoProject[] = [
  { id: '1', name: 'Project 1', isAi: false },
  { id: '2', name: 'Project 2', isAi: true },
  { id: '3', name: 'Project 3', isAi: false },
  { id: '4', name: 'Project 4', isAi: false },
  { id: '5', name: 'Project 5', isAi: true },
  { id: '6', name: 'Project 6', isAi: false },
  { id: '7', name: 'Project 7', isAi: true },
  { id: '8', name: 'Project 8', isAi: false },
  { id: '9', name: 'Project 9', isAi: false },
  { id: '10', name: 'Project 10', isAi: false },
  { id: '11', name: 'Project 11', isAi: false },
  { id: '12', name: 'Project 12', isAi: true },
  { id: '13', name: 'Project 13', isAi: false },
  { id: '14', name: 'Project 14', isAi: false },
];

/** Shown on the masthead toggle until the user picks a project from the menu. */
const SELECT_PROJECT_PLACEHOLDER = 'Select a project';

/** Toggle + dropdown width (masthead balance: readable but compact). */
const MASTHEAD_PROJECT_SELECTOR_WIDTH = '200px';

const mastheadProjectMenuItemBlockStyle = {
  '--pf-v6-c-menu__item--PaddingBlockStart': 'var(--pf-t--global--spacer--xs)',
  '--pf-v6-c-menu__item--PaddingBlockEnd': 'var(--pf-t--global--spacer--xs)',
} as React.CSSProperties;

type ProjectListFilter = 'all' | 'ai';

/**
 * Alternate masthead project picker (v2): same scrollable menu pattern as v1, but replaces the
 * “Showing” row and **AI only** switch with a compact [ToggleGroup](https://www.patternfly.org/components/toggle-group)
 * below search: **Show all projects (N)** vs **Show AI projects (ai/total)**.
 */
const MastheadProjectSelectorV2: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const menuRef = React.useRef<HTMLDivElement>(null);
  const toggleRef = React.useRef<MenuToggleElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [listFilter, setListFilter] = React.useState<ProjectListFilter>('all');
  const [projects, setProjects] = React.useState<DemoProject[]>(() => [...INITIAL_PROJECTS]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [favorites, setFavorites] = React.useState<Set<string>>(() => new Set());
  const projectsRef = React.useRef(projects);
  projectsRef.current = projects;

  const totalCount = projects.length;
  const aiTotalCount = React.useMemo(() => projects.filter((p) => p.isAi).length, [projects]);

  const filteredProjects = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (listFilter === 'ai' && !p.isAi) {
        return false;
      }
      if (q.length === 0) {
        return true;
      }
      return p.name.toLowerCase().includes(q);
    });
  }, [search, listFilter, projects]);

  const favoriteFiltered = React.useMemo(
    () => filteredProjects.filter((p) => favorites.has(p.id)),
    [filteredProjects, favorites]
  );
  const nonFavoriteFiltered = React.useMemo(
    () => filteredProjects.filter((p) => !favorites.has(p.id)),
    [filteredProjects, favorites]
  );

  const selectedProject = selectedId !== null ? projects.find((p) => p.id === selectedId) : undefined;

  const favoriteStarColor = 'var(--pf-t--global--icon--color--favorite--default, #F0AB00)';
  const outlineStarColor = 'var(--pf-t--global--icon--color--subtle)';

  const handleCreateProject = React.useCallback(({ name }: { name: string }) => {
    const prev = projectsRef.current;
    const maxId = Math.max(0, ...prev.map((p) => Number(p.id)).filter((n) => !Number.isNaN(n)));
    const newId = String(maxId + 1);
    setProjects([...prev, { id: newId, name, isAi: false }]);
    setSelectedId(newId);
  }, []);

  const toggleFavorite = (projectId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const renderProjectMenuItem = (project: DemoProject) => {
    const isSelected = project.id === selectedId;
    const isFav = favorites.has(project.id);
    return (
      <DropdownItem
        key={project.id}
        id={`masthead-project-v2-option-${project.id}`}
        style={mastheadProjectMenuItemBlockStyle}
        onClick={() => {
          setSelectedId(project.id);
        }}
      >
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          gap={{ default: 'gapMd' }}
          flexWrap={{ default: 'nowrap' }}
        >
          <FlexItem grow={{ default: 'grow' }}>
            <span id={`masthead-project-v2-option-name-${project.id}`}>{project.name}</span>
          </FlexItem>
          <FlexItem>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              justifyContent={{ default: 'justifyContentFlexEnd' }}
              gap={{ default: 'gapSm' }}
              flexWrap={{ default: 'nowrap' }}
            >
              {project.isAi ? <MastheadProjectAiBadge id={`masthead-project-v2-ai-badge-${project.id}`} /> : null}
              <span
                style={{
                  width: '1.25rem',
                  display: 'inline-flex',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isSelected ? <CheckIcon color="var(--pf-t--global--icon--color--brand--default)" /> : null}
              </span>
              <Button
                id={`masthead-project-v2-favorite-${project.id}`}
                variant="plain"
                type="button"
                aria-label={isFav ? `Remove ${project.name} from favorites` : `Add ${project.name} to favorites`}
                aria-pressed={isFav}
                onClick={(e) => toggleFavorite(project.id, e)}
                icon={
                  isFav ? (
                    <StarIcon style={{ color: favoriteStarColor }} />
                  ) : (
                    <OutlinedStarIcon style={{ color: outlineStarColor }} />
                  )
                }
              />
            </Flex>
          </FlexItem>
        </Flex>
      </DropdownItem>
    );
  };

  return (
    <div id="masthead-project-selector-v2-wrap" style={{ margin: '16px' }}>
      <Flex
        id="masthead-project-selector-v2"
        alignItems={{ default: 'alignItemsCenter' }}
        flexWrap={{ default: 'nowrap' }}
        gap={{ default: 'gapMd' }}
      >
        <FlexItem>
          <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
            <OutlinedFolderIcon id="masthead-project-selector-v2-folder-icon" />
            <span id="masthead-project-selector-v2-label">Project</span>
          </Flex>
        </FlexItem>
        <FlexItem>
          <MenuContainer
            isOpen={isOpen}
            menuRef={menuRef}
            onOpenChange={setIsOpen}
            popperProps={{ minWidth: MASTHEAD_PROJECT_SELECTOR_WIDTH, maxWidth: '320px' }}
            toggle={
              <div
                id="masthead-project-v2-menu-toggle-wrap"
                style={{ width: MASTHEAD_PROJECT_SELECTOR_WIDTH, minWidth: MASTHEAD_PROJECT_SELECTOR_WIDTH }}
              >
                <MenuToggle
                  id="masthead-project-v2-menu-toggle"
                  ref={toggleRef}
                  aria-label={
                    selectedProject
                      ? `Project: ${selectedProject.name} (variant with project scope toggle)`
                      : `${SELECT_PROJECT_PLACEHOLDER} (variant with project scope toggle)`
                  }
                  isPlaceholder={!selectedProject}
                  isExpanded={isOpen}
                  isFullWidth
                  variant="default"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {selectedProject ? selectedProject.name : SELECT_PROJECT_PLACEHOLDER}
                </MenuToggle>
              </div>
            }
            toggleRef={toggleRef}
            menu={
              <Menu id="masthead-project-v2-dropdown" ref={menuRef} isScrollable>
                <div
                  className={css(menuStyles.menuHeader)}
                  id="masthead-project-v2-dropdown-header"
                  style={{ paddingBlockEnd: 'var(--pf-t--global--spacer--xs)' }}
                >
                  <Flex direction={{ default: 'column' }} gap={{ default: 'gapNone' }}>
                    <div
                      id="masthead-project-v2-search-row"
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',
                      }}
                    >
                      <SearchInput
                        id="masthead-project-v2-search"
                        aria-label="Filter projects by name"
                        placeholder="Project name"
                        value={search}
                        onChange={(_event, value) => setSearch(value)}
                        onClear={() => setSearch('')}
                      />
                    </div>
                    <div
                      id="masthead-project-v2-filter-toggle-row"
                      style={{ marginTop: 'var(--pf-t--global--spacer--md)', width: '100%' }}
                    >
                      <ToggleGroup
                        id="masthead-project-v2-scope-toggle"
                        aria-label="Project list scope"
                        isCompact
                      >
                        <ToggleGroupItem
                          buttonId="masthead-project-v2-scope-all"
                          text={
                            <span className="pf-v6-u-display-inline-flex pf-v6-u-align-items-center">
                              <span>All projects</span>
                              <Badge
                                id="masthead-project-v2-scope-all-count-badge"
                                className="pf-v6-u-ml-sm"
                                isRead
                              >
                                {totalCount}
                              </Badge>
                            </span>
                          }
                          isSelected={listFilter === 'all'}
                          onChange={() => setListFilter('all')}
                        />
                        <ToggleGroupItem
                          buttonId="masthead-project-v2-scope-ai"
                          text={
                            <span className="pf-v6-u-display-inline-flex pf-v6-u-align-items-center">
                              <span>AI projects</span>
                              <Badge
                                id="masthead-project-v2-scope-ai-count-badge"
                                className="pf-v6-u-ml-sm"
                                isRead
                              >
                                {aiTotalCount}/{totalCount}
                              </Badge>
                            </span>
                          }
                          isSelected={listFilter === 'ai'}
                          onChange={() => setListFilter('ai')}
                        />
                      </ToggleGroup>
                    </div>
                  </Flex>
                </div>
                <Divider id="masthead-project-v2-dropdown-divider-header" />
                <MenuContent id="masthead-project-v2-menu-scroll" maxMenuHeight="17.5rem">
                  <DropdownList id="masthead-project-v2-dropdown-list">
                    {favoriteFiltered.length > 0 ? (
                      <DropdownGroup
                        id="masthead-project-v2-favorites-group"
                        label="Favorites"
                        labelHeadingLevel="h3"
                        titleId="masthead-project-v2-favorites-group-title"
                      >
                        {favoriteFiltered.map((project) => renderProjectMenuItem(project))}
                      </DropdownGroup>
                    ) : null}
                    {favoriteFiltered.length > 0 && nonFavoriteFiltered.length > 0 ? (
                      <Divider component="li" id="masthead-project-v2-favorites-all-divider" />
                    ) : null}
                    {nonFavoriteFiltered.length > 0 ? (
                      <DropdownGroup
                        id="masthead-project-v2-list-group"
                        label="All projects"
                        labelHeadingLevel="h3"
                        titleId="masthead-project-v2-list-group-title"
                      >
                        {nonFavoriteFiltered.map((project) => renderProjectMenuItem(project))}
                      </DropdownGroup>
                    ) : null}
                  </DropdownList>
                </MenuContent>
                <MenuFooter id="masthead-project-v2-dropdown-footer">
                  <Button
                    id="masthead-project-v2-create-link-button"
                    isInline
                    variant="link"
                    onClick={() => {
                      setIsOpen(false);
                      setCreateModalOpen(true);
                    }}
                  >
                    Create project
                  </Button>
                </MenuFooter>
              </Menu>
            }
          />
        </FlexItem>
        {selectedProject ? (
          <FlexItem>
            <Button
              id="masthead-project-v2-go-to-link"
              variant="link"
              isInline
              aria-label={`Go to ${selectedProject.name}`}
              onClick={() => navigate(`/projects/${selectedProject.id}`)}
            >
              <span
                id="masthead-project-v2-go-to-inner"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--pf-t--global--spacer--xs)',
                }}
              >
                <span>Go to</span>
                <OutlinedFolderIcon />
                <span>{selectedProject.name}</span>
              </span>
            </Button>
          </FlexItem>
        ) : null}
      </Flex>
      <MastheadCreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
};

export { MastheadProjectSelectorV2 };
