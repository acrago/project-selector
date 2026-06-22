import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Alert,
  Button,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Tab,
  TabTitleText,
  Tabs,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { HelpIcon, RedoIcon } from '@patternfly/react-icons';
import { YAMLError, documentsToYamlString, groupDocumentsByTab, parseYamlDocuments, replaceTabContent } from '../utils/yamlParser';

export type ViewMode = 'yaml' | 'split';

interface YAMLEditorDrawerProps {
  isOpen: boolean;
  viewMode: ViewMode;
  yamlContent: string;
  yamlErrors: YAMLError[];
  onYAMLChange: (yaml: string) => void;
  onReset: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onClose?: () => void;
  children?: React.ReactNode;
  showResetButton?: boolean;
  onOpenHelp?: () => void;
  /** When set, the editor will scroll to this line (1-based) and highlight it. */
  scrollToLine?: number;
  /** Called after scroll/highlight has been applied. Use to clear scrollToLine in parent. */
  onScrollToLineComplete?: () => void;
  /** When true, YAML is a read-only mirror of the form (form is master). */
  isReadOnly?: boolean;
  /** Called when the user clicks the button to enable manual YAML editing. */
  onEditYAML?: () => void;
  /** Label for the button that enters manual edit mode (e.g. "Enter Manual Edit Mode" for 3.4 MVP). */
  editYAMLButtonLabel?: string;
}

export const YAMLEditorDrawer: React.FunctionComponent<YAMLEditorDrawerProps> = ({
  isOpen,
  viewMode,
  yamlContent,
  yamlErrors,
  onYAMLChange,
  onReset,
  onCopy: _onCopy,
  onDownload: _onDownload,
  onClose,
  children,
  showResetButton = true,
  onOpenHelp,
  scrollToLine,
  onScrollToLineComplete,
  isReadOnly = true,
  onEditYAML,
  editYAMLButtonLabel = 'Edit YAML',
}) => {
  const defaultSize = viewMode === 'yaml' ? '100%' : '50%';
  const minSize = viewMode === 'yaml' ? '400px' : '300px';
  const codeEditorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<Parameters<NonNullable<React.ComponentProps<typeof CodeEditor>['onEditorDidMount']>>[0] | null>(null);
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  const documents = useMemo(() => parseYamlDocuments(yamlContent), [yamlContent]);
  const tabGroups = useMemo(() => groupDocumentsByTab(documents), [documents]);
  const activeTabId = typeof activeTabKey === 'number'
    ? tabGroups[activeTabKey]?.tabId ?? tabGroups[0]?.tabId
    : String(activeTabKey);
  const activeContent = tabGroups.find((t) => t.tabId === activeTabId)?.content ?? yamlContent;

  useEffect(() => {
    if (tabGroups.length > 0 && !tabGroups.some((t) => t.tabId === activeTabKey)) {
      setActiveTabKey(tabGroups[0].tabId);
    }
  }, [tabGroups, activeTabKey]);

  useEffect(() => {
    // Use a small timeout to ensure CodeEditor is fully rendered
    const timeoutId = setTimeout(() => {
      if (codeEditorRef.current) {
        const controlsContainer = codeEditorRef.current.querySelector('.pf-v6-c-code-editor__controls');

        if (controlsContainer) {
          // Check if reset button container already exists
          const resetButtonContainer = controlsContainer.querySelector('#yaml-editor-reset-button-container');

          if (showResetButton && !resetButtonContainer) {
            // Create container for reset button
            const container = document.createElement('div');
            container.id = 'yaml-editor-reset-button-container';
            controlsContainer.appendChild(container);

            // Render React button with tooltip into container
            const root = createRoot(container);
            root.render(
              <Tooltip content="Reset YAML">
                <Button
                  variant="plain"
                  icon={<RedoIcon />}
                  onClick={onReset}
                  aria-label="Reset YAML"
                  id="yaml-editor-reset-button"
                />
              </Tooltip>
            );

            // Store root for cleanup
            (container as any)._reactRoot = root;
          } else if (!showResetButton && resetButtonContainer) {
            // Remove reset button if it should be hidden
            const root = (resetButtonContainer as any)._reactRoot;
            if (root) {
              // Use setTimeout to defer unmount until after current render
              setTimeout(() => root.unmount(), 0);
            }
            resetButtonContainer.remove();
          }

          // Inject help button into controls area (next to Copy, Download, Upload)
          if (onOpenHelp) {
            const helpButtonContainer = controlsContainer.querySelector('#yaml-editor-help-button-container');

            if (!helpButtonContainer) {
              // Create container for help button
              const container = document.createElement('div');
              container.id = 'yaml-editor-help-button-container';
              controlsContainer.appendChild(container);

              // Render React button with tooltip into container
              const root = createRoot(container);
              root.render(
                <Tooltip content="Help with YAML">
                  <Button
                    variant="plain"
                    icon={<HelpIcon />}
                    onClick={onOpenHelp}
                    aria-label="Help with YAML"
                    id="yaml-editor-help-button"
                  />
                </Tooltip>
              );

              // Store root reference for cleanup
              (container as any)._reactRoot = root;
            }
          }
        }
      }
    }, 100); // Small delay to ensure CodeEditor is rendered

    return () => {
      clearTimeout(timeoutId);
      // Defer cleanup to avoid unmounting during render
      setTimeout(() => {
        if (codeEditorRef.current) {
          const controlsContainer = codeEditorRef.current.querySelector('.pf-v6-c-code-editor__controls');
          if (controlsContainer) {
            const resetButtonContainer = controlsContainer.querySelector('#yaml-editor-reset-button-container');
            if (resetButtonContainer) {
              const root = (resetButtonContainer as any)._reactRoot;
              if (root) {
                root.unmount();
              }
              if (resetButtonContainer.parentNode) {
                resetButtonContainer.parentNode.removeChild(resetButtonContainer);
              }
            }
            const helpButtonContainer = controlsContainer.querySelector('#yaml-editor-help-button-container');
            if (helpButtonContainer) {
              const root = (helpButtonContainer as any)._reactRoot;
              if (root) {
                root.unmount();
              }
              if (helpButtonContainer.parentNode) {
                helpButtonContainer.parentNode.removeChild(helpButtonContainer);
              }
            }
          }
        }
      }, 0);
    };
  }, [onReset, showResetButton, onOpenHelp]);

  useEffect(() => {
    if (scrollToLine == null || !isOpen || !monacoEditorRef.current) return;
    const editor = monacoEditorRef.current;
    editor.revealLineInCenter(scrollToLine);
    editor.setSelection({
      startLineNumber: scrollToLine,
      startColumn: 1,
      endLineNumber: scrollToLine,
      endColumn: 999,
    });
    editor.focus();
    onScrollToLineComplete?.();
  }, [scrollToLine, isOpen, onScrollToLineComplete]);

  return (
    <Drawer isExpanded={isOpen} isInline position="end" id="yaml-editor-drawer">
      <DrawerContent
        panelContent={
          <DrawerPanelContent
            isResizable
            defaultSize={defaultSize}
            minSize={minSize}
            id="yaml-editor-drawer-panel"
          >
            <DrawerHead id="yaml-editor-drawer-head">
              <Title headingLevel="h3" size="lg" id="yaml-editor-drawer-title">
                YAML Editor
              </Title>
              <DrawerActions>
                {isReadOnly && onEditYAML && (
                  <Button
                    variant="primary"
                    onClick={onEditYAML}
                    id="yaml-editor-enter-manual-edit-mode-button"
                    aria-label={editYAMLButtonLabel}
                  >
                    {editYAMLButtonLabel}
                  </Button>
                )}
                {onClose && <DrawerCloseButton onClick={onClose} id="yaml-editor-close-button" />}
              </DrawerActions>
            </DrawerHead>
            <DrawerPanelBody id="yaml-editor-drawer-body" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, padding: 0, overflow: 'hidden' }}>
              {!isReadOnly && (
                <Alert
                  variant="info"
                  isInline
                  title="Manual Edit Mode Active"
                  style={{ margin: '1rem', flexShrink: 0 }}
                  id="yaml-editor-manual-mode-banner"
                />
              )}
              {yamlErrors.length > 0 && (
                <Alert
                  variant="danger"
                  isInline
                  title="YAML validation errors"
                  style={{ margin: '1rem', flexShrink: 0 }}
                  id="yaml-editor-error-alert"
                >
                  <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                    {yamlErrors.map((error, index) => (
                      <li key={index}>
                        Line {error.line}: {error.message}
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}
              {tabGroups.length >= 2 ? (
                <>
                  <Tabs
                    activeKey={activeTabKey}
                    onSelect={(_e, key) => setActiveTabKey(key)}
                    id="yaml-editor-tabs"
                    style={{ marginBottom: '8px' }}
                  >
                    {tabGroups.map((tab) => (
                      <Tab
                        key={tab.tabId}
                        eventKey={tab.tabId}
                        title={<TabTitleText>{tab.tabId}</TabTitleText>}
                      />
                    ))}
                  </Tabs>
                  <div ref={codeEditorRef} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                    <CodeEditor
                      isDarkTheme={false}
                      isLineNumbersVisible={true}
                      isReadOnly={isReadOnly}
                      isMinimapVisible={false}
                      isLanguageLabelVisible={true}
                      isCopyEnabled={true}
                      isDownloadEnabled={true}
                      isUploadEnabled={!isReadOnly}
                      copyButtonAriaLabel="Copy YAML to clipboard"
                      downloadButtonAriaLabel="Download YAML"
                      uploadButtonAriaLabel="Upload YAML file"
                      code={activeContent}
                      onChange={
                        isReadOnly
                          ? undefined
                          : (newContent) => {
                              const updated = replaceTabContent(documents, activeTabId, newContent);
                              onYAMLChange(documentsToYamlString(updated));
                            }
                      }
                      language={Language.yaml}
                      height="100%"
                      className="pf-m-full-height"
                      id="yaml-editor-code-editor"
                      onEditorDidMount={(editor) => {
                        monacoEditorRef.current = editor;
                      }}
                    />
                  </div>
                </>
              ) : (
                <div ref={codeEditorRef} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                  <CodeEditor
                    isDarkTheme={false}
                    isLineNumbersVisible={true}
                    isReadOnly={isReadOnly}
                    isMinimapVisible={false}
                    isLanguageLabelVisible={true}
                    isCopyEnabled={true}
                    isDownloadEnabled={true}
                    isUploadEnabled={!isReadOnly}
                    copyButtonAriaLabel="Copy YAML to clipboard"
                    downloadButtonAriaLabel="Download YAML"
                    uploadButtonAriaLabel="Upload YAML file"
                    code={tabGroups.length === 1 ? tabGroups[0].content : yamlContent}
                    onChange={isReadOnly ? undefined : onYAMLChange}
                    language={Language.yaml}
                    height="100%"
                    className="pf-m-full-height"
                    id="yaml-editor-code-editor"
                    onEditorDidMount={(editor) => {
                      monacoEditorRef.current = editor;
                    }}
                  />
                </div>
              )}
            </DrawerPanelBody>
          </DrawerPanelContent>
        }
      >
        <DrawerContentBody id="yaml-editor-drawer-content-body">
          {children}
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
};
