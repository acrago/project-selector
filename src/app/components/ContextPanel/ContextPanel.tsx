import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  AlertActionLink,
  Content,
  Dropdown,
  DropdownList,
  FormGroup,
  MenuToggle,
  MenuToggleCheckbox,
  Select,
  SelectList,
  SelectOption,
  Tab,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';
import { DesignFeatureData, getAllFeatures, getFeatureById } from '@app/utils/designData';
import { useFeatureFromRoute } from '@app/utils/useFeatureFromRoute';
import { useFeatureFlags } from '@app/utils/FeatureFlagsContext';
import DetailsTab from './DetailsTab';
import HistoryTab from './HistoryTab';
import SourcesTab from './SourcesTab';
import JourneysTab from './JourneysTab';
import ExtendTab from './ExtendTab';
import DiscussionsTab from '@app/components/CommentingSystem/components/DiscussionsTab';
import { useContextPanel } from './ContextPanelContext';

const STORAGE_KEY_FEATURE = 'contextPanel_selectedFeature';
const STORAGE_KEY_WIDTH = 'contextPanel_width';
const STORAGE_KEY_AUTO_SWITCH = 'contextPanel_autoSwitch';
const DEFAULT_WIDTH = 360;
const MIN_WIDTH = 260;
const MAX_WIDTH = 600;

const ContextPanel: React.FunctionComponent = () => {
  const allFeatures = getAllFeatures();
  const { featureId: routeFeatureId, featureLabel: routeFeatureLabel } = useFeatureFromRoute();
  const { flags } = useFeatureFlags();
  const { activeTab, setActiveTab } = useContextPanel();

  const isAvailableFeature = (id: string | null): boolean =>
    id !== null && allFeatures.some((f) => f.id === id);

  const [autoSwitch, setAutoSwitch] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_AUTO_SWITCH);
    return stored === null ? true : stored === 'true';
  });

  const [selectedFeatureId, setSelectedFeatureId] = useState<string>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_FEATURE);
    if (stored && isAvailableFeature(stored)) return stored;
    if (isAvailableFeature(routeFeatureId)) return routeFeatureId!;
    return allFeatures[0]?.id || 'maas';
  });
  const [featureSelectOpen, setFeatureSelectOpen] = useState(false);
  const [kebabOpen, setKebabOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_WIDTH);
    return stored ? Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parseInt(stored, 10))) : DEFAULT_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeGeneration, setResizeGeneration] = useState(0);
  const [routeSuggestionDismissed, setRouteSuggestionDismissed] = useState(false);

  /** When switching from Discussions back to Feature context, restore last Details/History/… tab */
  const lastFeatureSubTabRef = useRef<string>('details');

  const selectedFeature: DesignFeatureData | undefined = getFeatureById(selectedFeatureId);

  const hasJourneys = (selectedFeature?.journeys?.length ?? 0) > 0;
  const hasSources =
    selectedFeature?.sources && Object.keys(selectedFeature.sources).length > 0;
  const showExtend = !hasJourneys && !hasSources;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FEATURE, selectedFeatureId);
  }, [selectedFeatureId]);

  useEffect(() => {
    if (!flags.enableDiscussions && activeTab === 'discussions') {
      setActiveTab('details');
    }
  }, [flags.enableDiscussions, activeTab, setActiveTab]);

  useEffect(() => {
    if (activeTab !== 'discussions') {
      lastFeatureSubTabRef.current = activeTab;
    }
  }, [activeTab]);

  useEffect(() => {
    const hasJourneys = (selectedFeature?.journeys?.length ?? 0) > 0;
    if (!hasJourneys && activeTab === 'journeys') {
      setActiveTab('details');
    }
  }, [selectedFeature?.journeys, activeTab, setActiveTab]);

  useEffect(() => {
    if (showExtend && (activeTab === 'journeys' || activeTab === 'sources')) {
      setActiveTab('more');
    }
    if (!showExtend && activeTab === 'more') {
      setActiveTab('details');
    }
  }, [showExtend, activeTab, setActiveTab]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WIDTH, String(panelWidth));
    document.documentElement.style.setProperty('--context-panel-width', `${panelWidth}px`);
  }, [panelWidth]);

  useEffect(() => {
    document.documentElement.style.setProperty('--context-panel-width', `${panelWidth}px`);
    return () => {
      document.documentElement.style.removeProperty('--context-panel-width');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUTO_SWITCH, String(autoSwitch));
  }, [autoSwitch]);

  useEffect(() => {
    if (autoSwitch && routeFeatureId && routeFeatureId !== selectedFeatureId && isAvailableFeature(routeFeatureId)) {
      setSelectedFeatureId(routeFeatureId);
    }
    setRouteSuggestionDismissed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeFeatureId, autoSwitch]);

  const showRouteSuggestion =
    !autoSwitch &&
    routeFeatureId &&
    routeFeatureId !== selectedFeatureId &&
    isAvailableFeature(routeFeatureId) &&
    !routeSuggestionDismissed;

  const handleFeatureSelect = (_event: React.MouseEvent | undefined, value: string | number | undefined) => {
    if (typeof value === 'string') {
      setSelectedFeatureId(value);
      setFeatureSelectOpen(false);
      setRouteSuggestionDismissed(false);
    }
  };

  const handleSwitchToRouteFeature = () => {
    if (routeFeatureId) {
      setSelectedFeatureId(routeFeatureId);
      setRouteSuggestionDismissed(true);
    }
  };

  const handlePrimaryTabSelect = useCallback(
    (_event: React.MouseEvent | KeyboardEvent, key: string | number) => {
      const k = String(key);
      if (k === 'discussions') {
        setActiveTab('discussions');
      } else {
        setActiveTab(lastFeatureSubTabRef.current || 'details');
      }
    },
    [setActiveTab],
  );

  const showFeatureContextChrome =
    !flags.enableDiscussions || activeTab !== 'discussions';

  // -- Resize logic -------------------------------------------------

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      const startX = e.clientX;
      const startWidth = panelWidth;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startX;
        const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth + delta));
        setPanelWidth(newWidth);
      };

      const onMouseUp = () => {
        setIsResizing(false);
        setResizeGeneration((g) => g + 1);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [panelWidth]
  );

  if (!selectedFeature) {
    return null;
  }

  return (
    <div
      style={{
        width: `${panelWidth}px`,
        minWidth: `${MIN_WIDTH}px`,
        maxWidth: `${MAX_WIDTH}px`,
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        flexShrink: 0,
        borderRight: '1px solid var(--pf-t--global--border--color--default)',
        backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
        position: 'relative',
        zIndex: 1000,
      }}
      id="context-panel"
      data-context-panel
    >
      {/* Panel content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '12px 16px',
        }}
      >
        {/* Primary: design docs vs prototype discussions (peer-level when flag on) */}
        {flags.enableDiscussions && (
          <Tabs
            key={resizeGeneration}
            id="context-panel-primary-tabs"
            activeKey={activeTab === 'discussions' ? 'discussions' : 'feature-context'}
            onSelect={handlePrimaryTabSelect}
            aria-label="Context panel: feature context or discussions"
            isOverflowHorizontal
            style={{ width: '100%', marginBottom: '8px' }}
          >
            <Tab
              eventKey="feature-context"
              title={<TabTitleText>Feature context</TabTitleText>}
              id="context-primary-tab-feature-context"
            />
            <Tab
              eventKey="discussions"
              title={<TabTitleText>Discussions</TabTitleText>}
              id="context-primary-tab-discussions"
            />
          </Tabs>
        )}

        {/* Feature selector with kebab */}
        {showFeatureContextChrome && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '8px' }}>
          <div style={{ flex: 1 }}>
            <FormGroup label="Feature" fieldId="context-panel-feature-select" id="context-panel-feature-form-group">
              <Select
                id="context-panel-feature-select"
                isOpen={featureSelectOpen}
                selected={selectedFeatureId}
                onSelect={handleFeatureSelect}
                onOpenChange={(isOpen) => setFeatureSelectOpen(isOpen)}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setFeatureSelectOpen(!featureSelectOpen)}
                    isExpanded={featureSelectOpen}
                    style={{ width: '100%' }}
                    id="context-panel-feature-toggle"
                  >
                    {selectedFeature.label}
                  </MenuToggle>
                )}
                shouldFocusToggleOnSelect
              >
                <SelectList>
                  {allFeatures.map((f) => (
                    <SelectOption
                      key={f.id}
                      value={f.id}
                      id={`context-feature-option-${f.id}`}
                    >
                      {f.label}
                    </SelectOption>
                  ))}
                </SelectList>
              </Select>
            </FormGroup>
          </div>
          <Dropdown
            isOpen={kebabOpen}
            onSelect={() => {}}
            onOpenChange={(isOpen) => setKebabOpen(isOpen)}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                variant="plain"
                onClick={() => setKebabOpen(!kebabOpen)}
                isExpanded={kebabOpen}
                aria-label="Context panel options"
                id="context-panel-kebab-toggle"
              >
                <EllipsisVIcon />
              </MenuToggle>
            )}
            popperProps={{ position: 'right' }}
            id="context-panel-kebab"
          >
            <DropdownList>
              <div style={{ padding: '8px 16px', maxWidth: '260px' }}>
                <MenuToggleCheckbox
                  id="context-auto-switch-checkbox"
                  isChecked={autoSwitch}
                  onChange={() => setAutoSwitch((prev) => !prev)}
                  aria-label="Automatically switch features"
                >
                  Automatically switch features
                </MenuToggleCheckbox>
                <Content
                  component="small"
                  style={{
                    display: 'block',
                    marginTop: '4px',
                    paddingLeft: '24px',
                    color: 'var(--pf-t--global--text--color--subtle)',
                  }}
                  id="context-auto-switch-description"
                >
                  When enabled, the selected feature automatically updates to match the page you&apos;re viewing.
                </Content>
              </div>
            </DropdownList>
          </Dropdown>
        </div>
        )}

        {/* Route suggestion alert (only when auto-switch is off) */}
        {showFeatureContextChrome && showRouteSuggestion && (
          <Alert
            variant="info"
            isInline
            isPlain
            title={`This page is part of ${routeFeatureLabel}.`}
            actionLinks={
              <AlertActionLink onClick={handleSwitchToRouteFeature} id="context-switch-feature-link">
                Switch context
              </AlertActionLink>
            }
            style={{ marginBottom: '8px' }}
            id="context-panel-route-suggestion"
          />
        )}

        {/* Feature-area sub-tabs (Details, History, …) — not shown on Discussions branch */}
        {showFeatureContextChrome && (
        <Tabs
          key={resizeGeneration}
          activeKey={activeTab}
          onSelect={(_event, tabIndex) => setActiveTab(String(tabIndex))}
          aria-label="Feature design context tabs"
          role="region"
          id="context-panel-feature-tabs"
          isOverflowHorizontal
          style={{ width: '100%' }}
        >
          <Tab eventKey="details" title={<TabTitleText>Details</TabTitleText>} id="context-tab-details" />
          <Tab eventKey="history" title={<TabTitleText>History</TabTitleText>} id="context-tab-history" />
          {hasJourneys && (
            <Tab eventKey="journeys" title={<TabTitleText>Journeys</TabTitleText>} id="context-tab-journeys" />
          )}
          {hasSources && (
            <Tab eventKey="sources" title={<TabTitleText>Sources</TabTitleText>} id="context-tab-sources" />
          )}
          {showExtend && (
            <Tab eventKey="more" title={<TabTitleText>More</TabTitleText>} id="context-tab-more" />
          )}
        </Tabs>
        )}

        {/* Tab content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          {flags.enableDiscussions && activeTab === 'discussions' && <DiscussionsTab />}
          {showFeatureContextChrome && activeTab === 'details' && (
            <DetailsTab feature={selectedFeature} />
          )}
          {showFeatureContextChrome && activeTab === 'more' && (
            <ExtendTab featureId={selectedFeature.id} />
          )}
          {showFeatureContextChrome && activeTab === 'journeys' && (
            <JourneysTab journeys={selectedFeature.journeys} />
          )}
          {showFeatureContextChrome && activeTab === 'history' && (
            <HistoryTab entries={selectedFeature.history} />
          )}
          {showFeatureContextChrome && activeTab === 'sources' && (
            <SourcesTab sources={selectedFeature.sources} />
          )}
        </div>
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          width: '6px',
          cursor: 'col-resize',
          backgroundColor: isResizing
            ? 'var(--pf-t--global--border--color--hover)'
            : 'transparent',
          transition: 'background-color 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          if (!isResizing) {
            (e.currentTarget as HTMLElement).style.backgroundColor =
              'var(--pf-t--global--border--color--hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isResizing) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
          }
        }}
        id="context-panel-resize-handle"
      />
    </div>
  );
};

export default ContextPanel;
