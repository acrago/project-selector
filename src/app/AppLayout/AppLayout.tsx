import * as React from 'react';
import { NavLink, matchPath, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Badge,
  Brand,
  Button,
  Content,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Label,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadLogo,
  MastheadMain,
  MastheadToggle,
  MenuToggle,
  MenuToggleElement,
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  Page,
  PageSidebar,
  PageSidebarBody,
  Select,
  SelectGroup,
  SelectList,
  SelectOption,
  SkipToContent,
  Switch,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip
} from '@patternfly/react-core';
import { AppRouteConfig, IAppRoute, IAppRouteGroup, MCPServersWithTabs, ModelsWithTabs, buildAvailableNavItems, filterRoutesByFlags, routes } from '@app/routes';
import { Prompts } from '@app/AIHub/Models/Prompts';
import { CustomNavSidebar } from '@app/components/CustomNavSidebar/CustomNavSidebar';
import { NAV_URL_PARAM } from '@app/utils/navConfig';
import { BarsIcon, BellIcon, CogIcon, ExternalLinkAltIcon, FlagIcon, InfoCircleIcon, MoonIcon, PanelCloseIcon, PanelOpenIcon, QuestionCircleIcon, SunIcon, TrashIcon, UserIcon } from '@patternfly/react-icons';
import { useTheme } from '@app/utils/ThemeContext';
import { useUserProfile } from '@app/utils/UserProfileContext';
import { ApiKeysVariation, useFeatureFlags } from '@app/utils/FeatureFlagsContext';
// Import custom logos
import LightLogo from '@app/bgimages/Product_Logos_Light.svg';
import DarkLogo from '@app/bgimages/Product-Logos_Dark.svg';
import UxdLogo from '@app/bgimages/logo-uxd-filled.svg';
import { VariantFlagsDropdown } from '@app/components/VariantFlagsDropdown';
import { ContextPanelProvider, useContextPanel } from '@app/components/ContextPanel/ContextPanelContext';
import { usePlaygroundMasthead } from '@app/utils/PlaygroundMastheadContext';

// ContextPanel and its subtree import assets from .design/ which may not
// exist in public/stripped builds. Load it only when design data is present.
let ContextPanel: React.ComponentType | null = null;
if (process.env.HAS_DESIGN_DATA === 'true') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  ContextPanel = (require('@app/components/ContextPanel/ContextPanel') as { default: React.ComponentType }).default;
}
import { CommentOverlay } from '@app/components/CommentingSystem';
import { MastheadProjectSelector } from '@app/components/MastheadProjectSelector';
import { MastheadProjectSelectorV2 } from '@app/components/MastheadProjectSelectorV2';
import { MastheadProjectSelectorV3 } from '@app/components/MastheadProjectSelectorV3';

interface IAppLayout {
  children: React.ReactNode;
}

const AppLayoutContent: React.FunctionComponent<{ children: React.ReactNode }> = ({ children }) => {
  const { contextPanelOpen, setContextPanelOpen } = useContextPanel();
  const playgroundMasthead = usePlaygroundMasthead();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set());
  const { userProfile, setUserProfile } = useUserProfile();
  const { theme, toggleTheme } = useTheme();
  const { flags, updateFlag, dashboardVariation, setDashboardVariation, apiKeysVariation, setApiKeysVariation } = useFeatureFlags();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [dashboardVariationSelectOpen, setDashboardVariationSelectOpen] = React.useState(false);
  const [apiKeysVariationSelectOpen, setApiKeysVariationSelectOpen] = React.useState(false);
  const isDashboardPage = location.pathname.startsWith('/observe-monitor/dashboard');
  const isApiKeysPage = location.pathname.startsWith('/gen-ai-studio/api-keys') || location.pathname.startsWith('/settings/api-keys');

  const [prototypeHelpOpen, setPrototypeHelpOpen] = React.useState(false);
  const [featureFlagsDropdownOpen, setFeatureFlagsDropdownOpen] = React.useState(false);

  const useGenericLogo = process.env.GENERIC_LOGO === 'true';
  const hidePrototypeBar = process.env.PROTOTYPE_BAR === 'false';
  
  // Fidelity switcher state
  const [fidelitySelectOpen, setFidelitySelectOpen] = React.useState(false);
  const [projectSelectorSelectOpen, setProjectSelectorSelectOpen] = React.useState(false);
  const [projectSelectorVariation, setProjectSelectorVariation] = React.useState<'v1' | 'v2' | 'v3'>('v1');
  const [fidelity, setFidelity] = React.useState<'high' | 'low'>(() => {
    // Priority: 1) URL query parameter, 2) Environment variable, 3) Default to 'high'
    const params = new URLSearchParams(location.search);
    const urlFidelity = params.get('fidelity');
    
    if (urlFidelity === 'low' || urlFidelity === 'high') {
      return urlFidelity;
    }
    
    // Check environment variable for default fidelity
    const defaultFidelity = process.env.DEFAULT_FIDELITY;
    if (defaultFidelity === 'low' || defaultFidelity === 'high') {
      return defaultFidelity;
    }
    
    return 'high';
  });

  // Effect to toggle fidelity class on #prototype container and update URL
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentFidelityParam = params.get('fidelity');
    const prototypeEl = document.getElementById('prototype');
    
    if (fidelity === 'low') {
      prototypeEl?.classList.add('fidelity-low');
      if (currentFidelityParam !== 'low') {
        params.set('fidelity', 'low');
        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
      }
    } else {
      prototypeEl?.classList.remove('fidelity-low');
      if (currentFidelityParam !== null) {
        params.delete('fidelity');
        const newSearch = params.toString();
        navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true });
      }
    }
  }, [fidelity, location.pathname, location.search, navigate]);

  // On initial page load only, expand the nav group(s) containing the current page
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    const findParentGroupIds = (
      routeList: AppRouteConfig[],
      currentPath: string,
      parentGroupId?: string
    ): string[] | null => {
      for (let idx = 0; idx < routeList.length; idx++) {
        const route = routeList[idx];
        
        if ('routes' in route && route.routes) {
          const groupId = `${parentGroupId ? `${parentGroupId}_` : ''}nav-group-${idx}`;
          
          const nestedGroupIds = findParentGroupIds(route.routes, currentPath, groupId);
          if (nestedGroupIds !== null) {
            return [groupId, ...nestedGroupIds];
          }
        } else if ('path' in route) {
          const match = matchPath(
            { path: route.path, end: route.exact !== false },
            currentPath
          );
          if (match) {
            return [];
          }
        }
      }
      return null;
    };

    const filteredRoutes = filterRoutesByFlags(routes, flags);
    const parentGroupIds = findParentGroupIds(filteredRoutes, location.pathname);
    
    if (parentGroupIds && parentGroupIds.length > 0) {
      setExpandedGroups(new Set(parentGroupIds));
    }
  }, []); // empty deps — runs once on mount (page load / full refresh)

  // Auto-enable custom nav when a shared nav URL param is present
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has(NAV_URL_PARAM) && !flags.customNav) {
      updateFlag('customNav', true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear local storage handler
  const handleClearLocalStorage = () => {
    // Clear all playground-related localStorage items
    localStorage.removeItem('playgroundMcpServers');
    localStorage.removeItem('enabledMcpTools');
    localStorage.removeItem('agentConfig');
    // Clear any other playground-related items
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('mcp-token-') || key.startsWith('playground-')) {
        localStorage.removeItem(key);
      }
    });
    // Clear sessionStorage as well
    sessionStorage.clear();
    // Reload the page to reset the state
    window.location.reload();
  };

  // Theme-aware logo selection
  const logoSrc = theme === 'light' ? LightLogo : DarkLogo;
  const logoAlt = theme === 'light' ? 'Product Logo Light' : 'Product Logo Dark';

  const masthead = (
    <Masthead id="rhoai-product-masthead">
      <MastheadMain style={{ width: 'fit-content' }}>
        <MastheadToggle>
          <Button
            icon={<BarsIcon />}
            variant="plain"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Global navigation"
          />
        </MastheadToggle>
        <MastheadBrand style={{ display: 'flex', alignItems: 'center' }}>
          {useGenericLogo ? (
            <span style={{ 
              fontSize: '1.25rem', 
              fontWeight: 600,
              color: theme === 'dark' ? '#ffffff' : '#151515'
            }}>
              AI Platform
            </span>
          ) : (
            <img 
              src={logoSrc}
              alt={logoAlt}
              style={{ 
                height: '36px', 
                width: 'auto', 
                maxWidth: '200px' // Prevent logo from being too wide
              }}
            />
          )}
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <div
          id="product-masthead-toolbar-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            width: '100%',
            minWidth: 0,
            gap: 'var(--pf-t--global--spacer--md)',
          }}
        >
          {projectSelectorVariation === 'v1' ? (
            <MastheadProjectSelector />
          ) : projectSelectorVariation === 'v2' ? (
            <MastheadProjectSelectorV2 />
          ) : (
            <MastheadProjectSelectorV3 />
          )}
          <div
            id="product-masthead-actions"
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              flexShrink: 0,
            }}
          >
            {isDashboardPage && (
              <Select
                id="dashboard-variation-select"
                isOpen={dashboardVariationSelectOpen}
                selected={dashboardVariation}
                onSelect={(_event, value) => {
                  if (value) {
                    setDashboardVariation(value as 'v1-echarts' | 'v2-patternfly' | 'v3-empty' | 'v4-table');
                    setDashboardVariationSelectOpen(false);
                  }
                }}
                onOpenChange={(isOpen) => setDashboardVariationSelectOpen(isOpen)}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setDashboardVariationSelectOpen(!dashboardVariationSelectOpen)}
                    isExpanded={dashboardVariationSelectOpen}
                    style={{ minWidth: '220px' }}
                    id="dashboard-variation-toggle"
                  >
                    {dashboardVariation === 'v4-table' && '3.4 MVP'}
                    {dashboardVariation === 'v3-empty' && 'Empty States'}
                    {dashboardVariation === 'v1-echarts' && 'Alternative: Perses / ECharts'}
                    {dashboardVariation === 'v2-patternfly' && 'Alternative: PatternFly Charts'}
                  </MenuToggle>
                )}
                shouldFocusToggleOnSelect
                popperProps={{ minWidth: '320px' }}
              >
                <SelectGroup label={<a href="https://issues.redhat.com/browse/RHAISTRAT-1235" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', paddingTop: '0.5rem', paddingLeft: '0.25rem' }} onClick={(e) => e.stopPropagation()}>RHAISTRAT-1235 — MaaS Dashboard <ExternalLinkAltIcon style={{ fontSize: '0.6rem' }} /></a>}>
                  <SelectList>
                    <SelectOption value="v4-table" id="dashboard-v4" description="Table-based internal cost attribution">3.4 MVP</SelectOption>
                    <SelectOption value="v3-empty" id="dashboard-v3" description="First-time experience with no data">Empty States</SelectOption>
                    <SelectOption value="v1-echarts" id="dashboard-v1" description="Perses-style visual charts">Alternative: Perses / ECharts</SelectOption>
                    <SelectOption value="v2-patternfly" id="dashboard-v2" description="PatternFly native charts">Alternative: PatternFly Charts</SelectOption>
                  </SelectList>
                </SelectGroup>
              </Select>
            )}
            {isApiKeysPage && (
              <Select
                id="api-keys-variation-select"
                isOpen={apiKeysVariationSelectOpen}
                selected={apiKeysVariation}
                onSelect={(_event, value) => {
                  if (value) {
                    setApiKeysVariation(value as ApiKeysVariation);
                    setApiKeysVariationSelectOpen(false);
                  }
                }}
                onOpenChange={(isOpen) => setApiKeysVariationSelectOpen(isOpen)}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setApiKeysVariationSelectOpen(!apiKeysVariationSelectOpen)}
                    isExpanded={apiKeysVariationSelectOpen}
                    style={{ minWidth: '180px' }}
                    id="api-keys-variation-toggle"
                  >
                    {{ 'v34-models-flat': 'Version 3.4 (New)', v34: 'V3.4 — Subscription chips', 'v34-models-table': 'V3.4 — Subscription table', 'v34-expiry-limit': 'V3.4 — Expiration limit', 'v34-expiry-fallback': 'V3.4 — Expiration fallback', 'v34-scroll-preview': 'V3.4 — Scrollable preview', 'v34-revoke-filter': 'V3.4 — Revoke by filter', 'v34-checkboxes': 'V3.4 + Checkboxes', current: "Andy's version (Pre-3.4)" }[apiKeysVariation]}
                  </MenuToggle>
                )}
                shouldFocusToggleOnSelect
              >
                <SelectList>
                  <SelectOption value="v34-models-flat" id="api-keys-var-v34mf" description="Aligned to MaaS OpenAPI spec. Subscription-scoped keys, flat model list, status badges, popover on table (RHOAIENG-54596)">Version 3.4 (New)</SelectOption>
                  <SelectOption value="v34" id="api-keys-var-v34" description="Recommended: model names as label chips with expandable rate limits and billing details">V3.4 — Subscription chips</SelectOption>
                  <SelectOption value="v34-models-table" id="api-keys-var-v34mt" description="Model names, token limits, and request limits in a compact table">V3.4 — Subscription table</SelectOption>
                  <SelectOption value="v34-expiry-limit" id="api-keys-var-v34el" description="Recommended: UI fetches maxExpirationDays and filters dropdown (RHOAIENG-51806)">V3.4 — Expiration limit</SelectOption>
                  <SelectOption value="v34-expiry-fallback" id="api-keys-var-v34ef" description="Fallback: API rejects over-limit expiration with inline error (RHOAIENG-51806)">V3.4 — Expiration fallback</SelectOption>
                  <SelectOption value="v34-scroll-preview" id="api-keys-var-v34sp" description="Modal shows all keys in a scrollable table">V3.4 — Scrollable preview</SelectOption>
                  <SelectOption value="v34-revoke-filter" id="api-keys-var-v34rf" description="Revoke-all disabled until admin filters by user">V3.4 — Revoke by filter</SelectOption>
                  <SelectOption value="v34-checkboxes" id="api-keys-var-v34cb" description="Reference only — not actively considered">V3.4 + Checkboxes</SelectOption>
                  <SelectOption value="current" id="api-keys-var-current" description="Andy's pre-3.4 prototype design">Andy&apos;s version (Pre-3.4)</SelectOption>
                </SelectList>
              </Select>
            )}
            <VariantFlagsDropdown />
            {playgroundMasthead?.mastheadSlot}
            <Button
              icon={<BellIcon />}
              variant="plain"
              aria-label="Alerts"
            />
            <Button
              icon={<InfoCircleIcon />}
              variant="plain"
              aria-label="Information"
            />
            <Button
              icon={theme === 'light' ? <MoonIcon /> : <SunIcon />}
              variant="plain"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              id="prototype-masthead-theme-toggle"
              style={{ color: theme === 'dark' ? '#f0ab00' : undefined }}
            />
            <Dropdown
              isOpen={userDropdownOpen}
              onSelect={() => setUserDropdownOpen(false)}
              onOpenChange={(isOpen: boolean) => setUserDropdownOpen(isOpen)}
              popperProps={{
                position: 'right'
              }}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  isExpanded={userDropdownOpen}
                  variant="plain"
                  aria-label="User menu"
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.25rem 0.5rem'
                  }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px',
                      backgroundColor: '#0066cc',
                      color: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}>
                      <UserIcon />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{userProfile}</span>
                  </div>
                </MenuToggle>
              )}
            >
              <DropdownList>
                <DropdownItem 
                  key="ai-admin"
                  icon={<UserIcon />}
                  onClick={() => {
                    setUserProfile('AI Admin');
                  }}
                  style={{ 
                    fontWeight: userProfile === 'AI Admin' ? '600' : '400',
                    color: userProfile === 'AI Admin' ? '#0066cc' : 'inherit'
                  }}
                >
                  AI Admin
                </DropdownItem>
                <DropdownItem 
                  key="ai-engineer"
                  icon={<UserIcon />}
                  onClick={() => {
                    setUserProfile('AI Engineer');
                  }}
                  style={{ 
                    fontWeight: userProfile === 'AI Engineer' ? '600' : '400',
                    color: userProfile === 'AI Engineer' ? '#0066cc' : 'inherit'
                  }}
                >
                  AI Engineer
                </DropdownItem>
                <DropdownItem 
                  key="data-scientist"
                  icon={<UserIcon />}
                  onClick={() => {
                    setUserProfile('Data Scientist');
                  }}
                  style={{ 
                    fontWeight: userProfile === 'Data Scientist' ? '600' : '400',
                    color: userProfile === 'Data Scientist' ? '#0066cc' : 'inherit'
                  }}
                >
                  Data Scientist
                </DropdownItem>
                <Divider component="li" />
                <DropdownItem 
                  key="profile"
                  icon={<UserIcon />}
                >
                  Profile
                </DropdownItem>
                <DropdownItem 
                  key="settings"
                  icon={<CogIcon />}
                >
                  Settings
                </DropdownItem>
                <DropdownItem 
                  key="feature-flags"
                  icon={<FlagIcon />}
                  onClick={() => navigate('/feature-flags')}
                >
                  Feature Flags
                </DropdownItem>
                <DropdownItem 
                  key="clear-storage"
                  icon={<TrashIcon />}
                  onClick={handleClearLocalStorage}
                >
                  Clear local storage
                </DropdownItem>
              </DropdownList>
            </Dropdown>
          </div>
        </div>
      </MastheadContent>
    </Masthead>
  );

  // Helper to preserve featureStore param for feature-store routes during cross-navigation
  const getNavLinkPath = (path: string): string => {
    if (path.includes('/feature-store/')) {
      const featureStoreParam = searchParams.get('featureStore');
      if (featureStoreParam) {
        return `${path}?featureStore=${encodeURIComponent(featureStoreParam)}`;
      }
    }
    return path;
  };

  // Helper to check if a route path matches the current location (including sub-paths)
  const isRouteActive = (routePath: string): boolean => {
    // Exact match
    if (routePath === location.pathname) {
      return true;
    }
    // Check if current path is a sub-path of the route (e.g., /settings/api-keys/key-123 matches /settings/api-keys)
    // Use matchPath with a wildcard pattern to match child routes
    const match = matchPath({ path: `${routePath}/*`, end: false }, location.pathname);
    return match !== null;
  };

  const renderNavItem = (route: IAppRoute, index: number, groupId?: string) => {
    const IconComponent = route.icon;
    const itemId = `${groupId ? `${groupId}_` : ''}${route.label}-${index}`;
    
    return (
      <NavItem 
        key={itemId} 
        id={itemId} 
        itemId={itemId}
        groupId={groupId}
        isActive={isRouteActive(route.path)}
      >
        {(route as any).disabled ? (
          <div
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '0.5rem 1rem',
              color: '#6a6e73',
              cursor: 'not-allowed',
              opacity: 0.5
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {IconComponent && <IconComponent />}
              {route.label}
            </span>
            {(route as any).techPreview && (
              <Label 
                variant="outline" 
                color="orange" 
                isCompact
                style={{ fontSize: '10px' }}
              >
                Tech Preview
              </Label>
            )}
            {(route as any).inProgress && (
              <Badge 
                style={{ 
                  backgroundColor: '#F32BC4',
                  color: '#ffffff',
                  fontSize: '10px'
                }}
                id={`${itemId}-in-progress-badge-disabled`}
              >
                WIP
              </Badge>
            )}
          </div>
        ) : (
          <NavLink
            to={getNavLinkPath(route.path)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {IconComponent && <IconComponent />}
              {route.label}
            </span>
            {(route as any).techPreview && (
              <Label 
                variant="outline" 
                color="orange" 
                isCompact
                style={{ fontSize: '10px' }}
              >
                Tech Preview
              </Label>
            )}
            {(route as any).old && (
              <Tooltip 
                content="This feature is likely going away in 3.4."
                position="right"
              >
                <Badge 
                  style={{ 
                    backgroundColor: '#F32BC4',
                    color: '#ffffff',
                    fontSize: '10px'
                  }}
                  id={`${itemId}-old-badge`}
                >
                  Old
                </Badge>
              </Tooltip>
            )}
            {(route as any).testing && (
              <Label 
                variant="outline" 
                color="green" 
                isCompact
                style={{ fontSize: '10px' }}
              >
                Testing
              </Label>
            )}
            {(route as any).inProgress && (
              <Badge 
                style={{ 
                  backgroundColor: '#F32BC4',
                  color: '#ffffff',
                  fontSize: '10px'
                }}
                id={`${itemId}-in-progress-badge`}
              >
                WIP
              </Badge>
            )}
            {(route as any).tbd && (
              <Tooltip 
                content="This feature is unlikely to make it for 3.4."
                position="right"
              >
                <Badge 
                  style={{ 
                    backgroundColor: '#6A6E73',
                    color: '#ffffff',
                    fontSize: '10px'
                  }}
                  id={`${itemId}-tbd-badge`}
                >
                  TBD
                </Badge>
              </Tooltip>
            )}
          </NavLink>
        )}
      </NavItem>
    );
  };

  const renderNavGroup = (group: IAppRouteGroup, groupIndex: number, parentGroupId?: string) => {
    const IconComponent = group.icon;
    const groupId = `${parentGroupId ? `${parentGroupId}_` : ''}nav-group-${groupIndex}`;
    
    // Check if this group or any of its children are active
    const isGroupActive = (routes: AppRouteConfig[]): boolean => {
      return routes.some((route) => {
        if ('routes' in route && route.routes) {
          return isGroupActive(route.routes);
        }
        return 'path' in route && isRouteActive(route.path);
      });
    };

    const handleToggle = () => {
      setExpandedGroups((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(groupId)) {
          newSet.delete(groupId);
        } else {
          newSet.add(groupId);
        }
        return newSet;
      });
    };
    
    return (
      <NavExpandable
        key={groupId}
        id={groupId}
        groupId={groupId}
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {IconComponent && <IconComponent />}
            {group.label}
          </span>
        }
        isActive={isGroupActive(group.routes)}
        isExpanded={expandedGroups.has(groupId)}
        onToggle={handleToggle}
        style={(group as any).disabled ? { 
          color: '#6a6e73', 
          opacity: 0.5, 
          cursor: 'not-allowed' 
        } : undefined}
      >
        {group.routes.map((route, idx) => {
          if (!route.label) return null;
          
          if ('routes' in route) {
            // This is a nested group (third level)
            return renderNavGroup(route as IAppRouteGroup, idx, groupId);
          } else {
            // This is a regular nav item
            return renderNavItem(route as IAppRoute, idx, groupId);
          }
        })}
      </NavExpandable>
    );
  };

  const renderNavigationItem = (route: AppRouteConfig, idx: number) => {
    if (!('label' in route) || !route.label) {
      return null;
    }

    if ('routes' in route) {
      return renderNavGroup(route as IAppRouteGroup, idx);
    } else {
      return renderNavItem(route as IAppRoute, idx);
    }
  };

  // Filter AI Hub routes based on selected navigation variation
  const filterAIHubRoutes = React.useCallback((routeList: AppRouteConfig[]): AppRouteConfig[] => {
    return routeList.map((route) => {
      // Check if this is the AI hub group
      if ('routes' in route && route.label === 'AI hub') {
        const aiHubGroup = route as IAppRouteGroup;
        
        // Build routes array based on feature flags
        const routes: IAppRoute[] = [
          {
            element: <ModelsWithTabs />,
            exact: true,
            label: 'Models',
            path: '/ai-hub/models',
            title: 'RHOAI Prototype | AI Hub - Models',
          } as IAppRoute,
        ];
        
        // Add MCP servers if enabled
        if (flags.enableMCP) {
          routes.push({
            element: <MCPServersWithTabs />,
            exact: true,
            label: 'MCP servers',
            path: '/ai-hub/mcp-servers',
            title: 'RHOAI Prototype | AI Hub - MCP Servers',
          } as IAppRoute);
        }
        
        // Add Prompts if enabled
        if (flags.enablePromptRegistry) {
          routes.push({
            element: <Prompts />,
            exact: true,
            label: 'Prompts',
            path: '/ai-hub/prompts',
            title: 'RHOAI Prototype | AI Hub - Prompts',
          } as IAppRoute);
        }
        
        // Replace 3-level nav with 2-level tabs (full access)
        return {
          ...aiHubGroup,
          routes,
        };
      }
      
      return route;
    });
  }, [flags.enableMCP, flags.enablePromptRegistry]);

  const filteredRoutes = React.useMemo(() => {
    const flagFiltered = filterRoutesByFlags(routes, flags);
    return filterAIHubRoutes(flagFiltered);
  }, [flags, filterAIHubRoutes]);
  const availableNavItems = React.useMemo(
    () => buildAvailableNavItems(filteredRoutes),
    [filteredRoutes],
  );

  const Navigation = (
    <Nav id="nav-primary-simple">
      <NavList id="nav-list-simple">
        {filteredRoutes.map((route, idx) => renderNavigationItem(route, idx))}
      </NavList>
    </Nav>
  );

  const Sidebar = flags.customNav ? (
    <PageSidebar id="custom-nav-sidebar">
      <PageSidebarBody>
        <CustomNavSidebar
          availableItems={availableNavItems}
          getNavLinkPath={getNavLinkPath}
          isRouteActive={isRouteActive}
        />
      </PageSidebarBody>
    </PageSidebar>
  ) : (
    <PageSidebar>
      <PageSidebarBody>{Navigation}</PageSidebarBody>
    </PageSidebar>
  );

  const pageId = 'primary-app-container';

  const PageSkipToContent = (
    <SkipToContent
      onClick={(event) => {
        event.preventDefault();
        const primaryContentContainer = document.getElementById(pageId);
        primaryContentContainer?.focus();
      }}
      href={`#${pageId}`}
    >
      Skip to Content
    </SkipToContent>
  );
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Apollo Canvas Masthead */}
      {/* <ApolloCanvasMasthead /> */}
      
      {/* Prototype Masthead - Controlled by PROTOTYPE_BAR environment variable */}
      {!hidePrototypeBar && (
        <Masthead
          id="prototype-masthead"
          style={{
            '--pf-v6-c-masthead--BackgroundColor': '#1b1d21',
            color: '#ffffff',
            colorScheme: 'dark',
            flexShrink: 0,
            zIndex: 1000,
          } as React.CSSProperties}
        >
          <MastheadMain style={{ '--pf-v6-c-masthead__brand': 'auto' } as React.CSSProperties}>
            {ContextPanel && (
              <MastheadToggle>
                <Button
                  icon={contextPanelOpen ? <PanelCloseIcon /> : <PanelOpenIcon />}
                  variant="plain"
                  onClick={() => setContextPanelOpen(!contextPanelOpen)}
                  aria-label={contextPanelOpen ? 'Close context panel' : 'Open context panel'}
                  id="context-panel-toggle-btn"
                  style={{ '--pf-v6-c-button--m-plain--Color': '#ffffff' } as React.CSSProperties}
                />
              </MastheadToggle>
            )}
            <MastheadBrand>
              <MastheadLogo
                component="a"
                href="/"
                id="prototype-masthead-logo"
              >
                <Brand
                  src={UxdLogo}
                  alt="UXD Logo"
                  style={{ height: '36px' }}
                  id="prototype-uxd-brand"
                />
              </MastheadLogo>
            </MastheadBrand>
          </MastheadMain>
          <MastheadContent>
            <Toolbar id="prototype-masthead-toolbar" isStatic>
              <ToolbarContent style={{ alignItems: 'center' }}>
                <ToolbarItem id="prototype-title-item" style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                      RHOAI PROTOTYPE: 3.5 CANDIDATE
                    </span>
                    <Tooltip
                      content="Not all features and interactions are fully represented and this does not represent a commitment on the part of Red Hat. Features are subject to change."
                      position="bottom"
                      id="prototype-disclaimer-tooltip"
                    >
                      <InfoCircleIcon style={{ cursor: 'pointer', opacity: 0.7 }} />
                    </Tooltip>
                  </span>
                </ToolbarItem>
                <ToolbarGroup align={{ default: 'alignEnd' }} id="prototype-masthead-right-group" style={{ marginLeft: 'auto' }}>
                  <ToolbarItem id="prototype-launcher-link-item">
                    <a
                      href="/prototype-launcher"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/prototype-launcher');
                      }}
                      style={{
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        whiteSpace: 'nowrap',
                      }}
                      id="prototype-launcher-link"
                    >
                      Prototype Launcher
                    </a>
                  </ToolbarItem>
                  <ToolbarItem id="prototype-fidelity-item">
                    <Select
                      id="fidelity-select"
                      isOpen={fidelitySelectOpen}
                      selected={fidelity}
                      isPlain={true}
                      onSelect={(_event, value) => {
                        setFidelity(value as 'high' | 'low');
                        setFidelitySelectOpen(false);
                      }}
                      onOpenChange={(isOpen) => setFidelitySelectOpen(isOpen)}
                      toggle={(toggleRef) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setFidelitySelectOpen(!fidelitySelectOpen)}
                          isExpanded={fidelitySelectOpen}
                          variant="plainText"
                          aria-label="Fidelity switcher"
                          id="fidelity-toggle"
                        >
                          Fidelity: {fidelity === 'high' ? 'High' : 'Low'}
                        </MenuToggle>
                      )}
                    >
                      <SelectList>
                        <SelectOption value="high" id="fidelity-option-high">High</SelectOption>
                        <SelectOption value="low" id="fidelity-option-low">Low</SelectOption>
                      </SelectList>
                    </Select>
                  </ToolbarItem>
                  <ToolbarItem id="prototype-project-selector-item">
                    <Select
                      id="prototype-project-selector-select"
                      isOpen={projectSelectorSelectOpen}
                      selected={projectSelectorVariation}
                      isPlain
                      onSelect={(_event, value) => {
                        if (value === 'v1' || value === 'v2' || value === 'v3') {
                          setProjectSelectorVariation(value);
                        }
                        setProjectSelectorSelectOpen(false);
                      }}
                      onOpenChange={(isOpen) => setProjectSelectorSelectOpen(isOpen)}
                      toggle={(toggleRef) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setProjectSelectorSelectOpen(!projectSelectorSelectOpen)}
                          isExpanded={projectSelectorSelectOpen}
                          variant="plainText"
                          aria-label="Project selector variation"
                          id="prototype-project-selector-toggle"
                        >
                          Project selector:{' '}
                          {projectSelectorVariation === 'v1'
                            ? 'Variation 1'
                            : projectSelectorVariation === 'v2'
                              ? 'Variation 2'
                              : 'Variation 3'}
                        </MenuToggle>
                      )}
                    >
                      <SelectList>
                        <SelectOption value="v1" id="prototype-project-selector-option-v1">
                          Variation 1
                        </SelectOption>
                        <SelectOption value="v2" id="prototype-project-selector-option-v2">
                          Variation 2
                        </SelectOption>
                        <SelectOption value="v3" id="prototype-project-selector-option-v3">
                          Variation 3
                        </SelectOption>
                      </SelectList>
                    </Select>
                  </ToolbarItem>
                  <ToolbarItem id="prototype-feature-flags-item">
                    <Dropdown
                      isOpen={featureFlagsDropdownOpen}
                      onSelect={() => {}}
                      onOpenChange={(isOpen: boolean) => setFeatureFlagsDropdownOpen(isOpen)}
                      popperProps={{ position: 'right' }}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setFeatureFlagsDropdownOpen(!featureFlagsDropdownOpen)}
                          isExpanded={featureFlagsDropdownOpen}
                          variant="plain"
                          aria-label="Feature flags"
                          id="prototype-feature-flags-toggle"
                          style={{ '--pf-v6-c-menu-toggle--m-plain--Color': '#ffffff' } as React.CSSProperties}
                        >
                          <FlagIcon />
                        </MenuToggle>
                      )}
                    >
                      <DropdownList id="prototype-feature-flags-dropdown-list">
                        <div style={{ padding: '8px 16px 4px 16px' }}>
                          <Content
                            component="small"
                            id="prototype-feature-flags-quick-access-heading"
                            style={{
                              fontWeight: 'var(--pf-t--global--font--weight--heading--default)',
                              color: 'var(--pf-t--global--text--color--subtle)',
                            }}
                          >
                            Quick access
                          </Content>
                        </div>
                        <div style={{ padding: '0 16px 12px 16px', minWidth: '240px' }}>
                          <Switch
                            id="feature-flag-discussions-switch"
                            label="Discussions"
                            isChecked={flags.enableDiscussions}
                            onChange={(_event, checked) => updateFlag('enableDiscussions', checked)}
                            aria-label="Enable discussions"
                          />
                          <div style={{ marginTop: '12px' }}>
                            <Switch
                              id="feature-flag-custom-nav-switch"
                              label="Custom nav"
                              isChecked={flags.customNav}
                              onChange={(_event, checked) => updateFlag('customNav', checked)}
                              aria-label="Enable custom nav (reorder, add, remove items)"
                            />
                          </div>
                        </div>
                        <Divider component="li" id="prototype-feature-flags-dropdown-divider" />
                        <DropdownItem
                          id="prototype-feature-flags-all-link"
                          onClick={() => {
                            navigate('/feature-flags');
                            setFeatureFlagsDropdownOpen(false);
                          }}
                        >
                          All feature flags…
                        </DropdownItem>
                      </DropdownList>
                    </Dropdown>
                  </ToolbarItem>
                  <ToolbarItem id="prototype-help-item">
                    <Dropdown
                      isOpen={prototypeHelpOpen}
                      onSelect={() => setPrototypeHelpOpen(false)}
                      onOpenChange={(isOpen: boolean) => setPrototypeHelpOpen(isOpen)}
                      popperProps={{ position: 'right' }}
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setPrototypeHelpOpen(!prototypeHelpOpen)}
                          isExpanded={prototypeHelpOpen}
                          variant="plain"
                          aria-label="Prototype help"
                          id="prototype-help-toggle"
                          style={{ '--pf-v6-c-menu-toggle--m-plain--Color': '#ffffff' } as React.CSSProperties}
                        >
                          <QuestionCircleIcon />
                        </MenuToggle>
                      )}
                    >
                      <DropdownList>
                        <DropdownItem
                          key="code-repo"
                          id="prototype-code-repo-link"
                          component="a"
                          href="https://gitlab.cee.redhat.com/uxd/prototypes/rhoai"
                          target="_blank"
                          rel="noopener noreferrer"
                          icon={<ExternalLinkAltIcon />}
                        >
                          Prototype repo
                        </DropdownItem>
                      </DropdownList>
                    </Dropdown>
                  </ToolbarItem>
                </ToolbarGroup>
              </ToolbarContent>
            </Toolbar>
          </MastheadContent>
        </Masthead>
      )}
      
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {ContextPanel && contextPanelOpen && (
          <ContextPanel />
        )}
        <div id="prototype" style={{ position: 'relative', flex: 1, minHeight: 0, minWidth: 0 }}>
          <Page
            mainContainerId={pageId}
            masthead={masthead}
            sidebar={sidebarOpen && Sidebar}
            skipToContent={PageSkipToContent}
            style={{ height: '100%' }}
            isContentFilled
          >
            {children}
          </Page>
          {flags.enableDiscussions && <CommentOverlay />}
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FunctionComponent<IAppLayout> = ({ children }) => {
  const { flags } = useFeatureFlags();
  return (
    <ContextPanelProvider isDiscussionsEnabled={flags.enableDiscussions}>
      <AppLayoutContent>{children}</AppLayoutContent>
    </ContextPanelProvider>
  );
};

export { AppLayout };
