import * as React from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import {
  Button,
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  Tooltip,
} from '@patternfly/react-core';
import { CheckIcon, EyeIcon, EyeSlashIcon, LinkIcon, PencilAltIcon, UndoIcon } from '@patternfly/react-icons';
import type { AvailableNavItem } from '@app/routes';
import { type NavConfig, NAV_URL_PARAM, decodeNavConfig, encodeNavConfig, loadNavConfig, saveNavConfig } from '@app/utils/navConfig';

const CUSTOM_NAV_ICON_WIDTH = '1.25rem';

interface NavSubGroup {
  subGroupLabel: string | null;
  items: AvailableNavItem[];
}

interface NavSection {
  sectionLabel: string | null;
  sectionIcon?: React.ComponentType;
  subGroups: NavSubGroup[];
}

/** Group ordered items into sections (L1) and sub-groups (L2) based on parentLabel / subGroupLabel. */
function groupBySectionAndSubGroup(items: AvailableNavItem[]): NavSection[] {
  const sections: NavSection[] = [];

  for (const item of items) {
    const sectionLabel = item.parentLabel?.trim() || null;
    const subGroupLabel = item.subGroupLabel?.trim() || null;

    let currentSection = sections[sections.length - 1];
    if (!currentSection || currentSection.sectionLabel !== sectionLabel) {
      currentSection = { sectionLabel, sectionIcon: item.parentIcon, subGroups: [] };
      sections.push(currentSection);
    }

    let currentSubGroup = currentSection.subGroups[currentSection.subGroups.length - 1];
    if (!currentSubGroup || currentSubGroup.subGroupLabel !== subGroupLabel) {
      currentSubGroup = { subGroupLabel, items: [] };
      currentSection.subGroups.push(currentSubGroup);
    }

    currentSubGroup.items.push(item);
  }

  return sections;
}

export interface CustomNavSidebarProps {
  availableItems: AvailableNavItem[];
  getNavLinkPath: (path: string) => string;
  isRouteActive: (path: string) => boolean;
}

/** When config has itemIds, show only those in order; otherwise show all (default). */
function orderedItems(config: NavConfig, available: AvailableNavItem[]): AvailableNavItem[] {
  const byId = new Map(available.map((i) => [i.id, i]));
  if (config.itemIds.length === 0) {
    return available;
  }
  const result: AvailableNavItem[] = [];
  const seen = new Set<string>();
  for (const id of config.itemIds) {
    const item = byId.get(id);
    if (item && !seen.has(id)) {
      seen.add(id);
      result.push(item);
    }
  }
  return result;
}

const CustomNavSidebar: React.FunctionComponent<CustomNavSidebarProps> = ({
  availableItems,
  getNavLinkPath,
  isRouteActive,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [config, setConfig] = React.useState<NavConfig>(() => {
    const urlNav = searchParams.get(NAV_URL_PARAM);
    if (urlNav) {
      const decoded = decodeNavConfig(urlNav);
      if (decoded) {
        saveNavConfig(decoded);
        return decoded;
      }
    }
    return loadNavConfig();
  });
  const [isCustomizing, setIsCustomizing] = React.useState(false);
  const [expandedKeys, setExpandedKeys] = React.useState<Set<string>>(new Set());
  const [copied, setCopied] = React.useState(false);

  const items = React.useMemo(
    () => orderedItems(config, availableItems),
    [config, availableItems],
  );
  const availableToAdd = React.useMemo(
    () => availableItems.filter((a) => !config.itemIds.includes(a.id)),
    [availableItems, config.itemIds],
  );

  const sections = React.useMemo(() => groupBySectionAndSubGroup(items), [items]);

  const toggleExpanded = React.useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const persist = React.useCallback((next: NavConfig) => {
    setConfig(next);
    saveNavConfig(next);
  }, []);

  const removeItem = React.useCallback(
    (id: string) => {
      persist({ itemIds: config.itemIds.filter((i) => i !== id) });
    },
    [config.itemIds, persist],
  );

  const removeSectionItems = React.useCallback(
    (section: NavSection) => {
      const ids = new Set<string>();
      section.subGroups.forEach((sg) => sg.items.forEach((i) => ids.add(i.id)));
      persist({ itemIds: config.itemIds.filter((id) => !ids.has(id)) });
    },
    [config.itemIds, persist],
  );

  const addItem = React.useCallback(
    (item: AvailableNavItem) => {
      if (config.itemIds.includes(item.id)) return;
      const defaultIdx = availableItems.findIndex((a) => a.id === item.id);
      const before = config.itemIds.filter((id) => {
        const i = availableItems.findIndex((a) => a.id === id);
        return i >= 0 && i < defaultIdx;
      });
      const after = config.itemIds.filter((id) => {
        const i = availableItems.findIndex((a) => a.id === id);
        return i > defaultIdx;
      });
      persist({ itemIds: [...before, item.id, ...after] });
    },
    [config.itemIds, availableItems, persist],
  );

  const exitCustomize = React.useCallback(() => {
    const ids = items.map((i) => i.id);
    persist({ itemIds: ids });
    setIsCustomizing(false);
  }, [items, persist]);

  const restoreToDefault = React.useCallback(() => {
    persist({ itemIds: [] });
  }, [persist]);

  const handleShare = React.useCallback(() => {
    const currentConfig = config.itemIds.length > 0
      ? config
      : { itemIds: availableItems.map((i) => i.id) };
    const encoded = encodeNavConfig(currentConfig);
    if (!encoded) return;

    const url = new URL(window.location.href);
    url.searchParams.set(NAV_URL_PARAM, encoded);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [config, availableItems]);

  const clearNavParam = React.useCallback(() => {
    if (searchParams.has(NAV_URL_PARAM)) {
      searchParams.delete(NAV_URL_PARAM);
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  React.useEffect(() => {
    clearNavParam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItemRow = (item: AvailableNavItem, groupId?: string) => {
    const IconComponent = item.icon;
    const itemId = `custom-nav-item-${item.id.replace(/\//g, '_')}`;
    const linkContent = (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {IconComponent && <IconComponent />}
        {item.displayName}
      </span>
    );
    return (
      <NavItem
        key={item.id}
        id={itemId}
        itemId={item.path}
        isActive={isRouteActive(item.path)}
        groupId={groupId}
      >
        {isCustomizing ? (
          <div className="pf-v6-c-nav__link" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Tooltip content="Hide from menu">
              <Button
                id={`custom-nav-hide-${item.id.replace(/\//g, '_')}`}
                variant="plain"
                aria-label={`Hide ${item.displayName}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeItem(item.id);
                }}
                icon={<EyeSlashIcon />}
                style={{ flexShrink: 0 }}
              />
            </Tooltip>
            <NavLink
              to={getNavLinkPath(item.path)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {linkContent}
            </NavLink>
          </div>
        ) : (
          <NavLink
            to={getNavLinkPath(item.path)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            {linkContent}
          </NavLink>
        )}
      </NavItem>
    );
  };

  return (
    <div id="custom-nav-sidebar-root">
      <div className="pf-v6-c-nav__item" style={{ padding: '0.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {isCustomizing ? (
          <>
            <Button
              id="custom-nav-done-btn"
              variant="link"
              size="sm"
              onClick={exitCustomize}
              icon={<PencilAltIcon />}
            >
              Done
            </Button>
            <Tooltip content="Reset nav to default order and visibility">
              <Button
                id="custom-nav-restore-default-btn"
                variant="link"
                size="sm"
                onClick={restoreToDefault}
                icon={<UndoIcon />}
                aria-label="Restore menu to default"
              >
                Restore default
              </Button>
            </Tooltip>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tooltip content="Customize nav: hide or show items">
              <Button
                id="custom-nav-customize-btn"
                variant="link"
                size="sm"
                onClick={() => setIsCustomizing(true)}
                icon={<PencilAltIcon />}
              >
                Customize
              </Button>
            </Tooltip>
            <Tooltip content={copied ? 'Copied!' : 'Copy shareable link with current nav layout'}>
              <Button
                id="custom-nav-share-btn"
                variant="plain"
                size="sm"
                onClick={handleShare}
                icon={copied ? <CheckIcon color="var(--pf-t--global--color--status--success--default)" /> : <LinkIcon />}
                aria-label="Share nav layout"
              />
            </Tooltip>
          </div>
        )}
      </div>
      <Nav id="custom-nav-nav" aria-label="Custom navigation">
        <NavList id="custom-nav-list">
        {sections.map((section, sectionIndex) => {
          if (section.sectionLabel) {
            const sectionKey = `section-${section.sectionLabel}`;
            const SectionIcon = section.sectionIcon;
            const isExpanded = expandedKeys.has(sectionKey);
            const groupId = `custom-nav-section-${sectionIndex}`;

            const titleContent = (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {SectionIcon && <SectionIcon />}
                {section.sectionLabel}
              </span>
            );

            const sectionTitle = isCustomizing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: '100%' }}>
                <span style={{ flex: 1 }}>{titleContent}</span>
                <Tooltip content="Hide entire section">
                  <Button
                    id={`custom-nav-hide-section-${section.sectionLabel.replace(/\s+/g, '-')}`}
                    variant="plain"
                    aria-label={`Hide section ${section.sectionLabel}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeSectionItems(section);
                    }}
                    icon={<EyeSlashIcon />}
                    style={{ flexShrink: 0 }}
                  />
                </Tooltip>
              </div>
            ) : titleContent;

            return (
              <NavExpandable
                key={`section-${section.sectionLabel}-${sectionIndex}`}
                id={groupId}
                groupId={groupId}
                title={sectionTitle}
                isExpanded={isExpanded}
                onToggle={() => toggleExpanded(sectionKey)}
                isActive={section.subGroups.some((sg) => sg.items.some((i) => isRouteActive(i.path)))}
              >
                {section.subGroups.map((subGroup, sgIndex) => {
                  if (subGroup.subGroupLabel) {
                    const sgKey = `${sectionKey}::${subGroup.subGroupLabel}`;
                    const sgGroupId = `${groupId}_subgroup-${sgIndex}`;
                    return (
                      <NavExpandable
                        key={sgKey}
                        id={sgGroupId}
                        groupId={sgGroupId}
                        title={subGroup.subGroupLabel}
                        isExpanded={expandedKeys.has(sgKey)}
                        onToggle={() => toggleExpanded(sgKey)}
                        isActive={subGroup.items.some((i) => isRouteActive(i.path))}
                      >
                        {subGroup.items.map((item) => renderItemRow(item, sgGroupId))}
                      </NavExpandable>
                    );
                  }
                  return (
                    <React.Fragment key={`sg-flat-${sgIndex}`}>
                      {subGroup.items.map((item) => renderItemRow(item, groupId))}
                    </React.Fragment>
                  );
                })}
              </NavExpandable>
            );
          }

          return (
            <React.Fragment key={`top-${sectionIndex}`}>
              {section.subGroups.flatMap((sg) => sg.items.map((item) => renderItemRow(item)))}
            </React.Fragment>
          );
        })}
        </NavList>
        {isCustomizing && availableToAdd.length > 0 && (
          <React.Fragment>
            <div
              style={{
                padding: 'var(--pf-t--global--spacer--xs) 1rem',
                fontSize: 'var(--pf-v6-global--FontSize--sm)',
                color: 'var(--pf-v6-global--Color--200)',
                fontWeight: 600,
              }}
            >
              Hidden items
            </div>
            <NavList id="custom-nav-available-list">
              {availableToAdd.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavItem key={item.id} id={`custom-nav-available-${item.id.replace(/\//g, '_')}`}>
                    <div className="pf-v6-c-nav__link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBlockStart: 'var(--pf-t--global--spacer--xs)', paddingBlockEnd: 'var(--pf-t--global--spacer--xs)' }}>
                      <Tooltip content="Show in menu">
                        <Button
                          id={`custom-nav-show-${item.id.replace(/\//g, '_')}`}
                          variant="plain"
                          aria-label={`Show ${item.displayName} in menu`}
                          onClick={() => addItem(item)}
                          icon={<EyeIcon />}
                          style={{ flexShrink: 0 }}
                        />
                      </Tooltip>
                      <span
                        style={{
                          width: CUSTOM_NAV_ICON_WIDTH,
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {IconComponent ? <IconComponent /> : null}
                      </span>
                      <span style={{ flex: 1 }}>{item.displayName}</span>
                    </div>
                  </NavItem>
                );
              })}
            </NavList>
          </React.Fragment>
        )}
      </Nav>
    </div>
  );
};

export { CustomNavSidebar };
