import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { useContextPanel } from '@app/components/ContextPanel/ContextPanelContext';
import { useComments } from '../contexts/CommentContext';
import { CommentPin } from './CommentPin';
import {
  findElementBySelector,
  generateSelectorForElement,
  getElementComponentMetadata,
  getElementDescription,
} from '../utils/selectorUtils';
import { getComponentName, getFiberFromElement } from '../utils/componentUtils';

export const CommentOverlay: React.FunctionComponent = () => {
  const location = useLocation();
  const { openToDiscussions } = useContextPanel();
  const {
    commentsEnabled,
    showClosedThreads,
    showPinsEnabled,
    addThread,
    setCommentsEnabled,
    selectedThreadId,
    setSelectedThreadId,
    syncFromGitLab,
    getThreadsForRoute,
  } = useComments();
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const highlightRef = React.useRef<HTMLDivElement | null>(null);
  const previewRef = React.useRef<HTMLDivElement | null>(null);
  const previewLabelRef = React.useRef<HTMLDivElement | null>(null);
  const hoveredElementRef = React.useRef<Element | null>(null);
  const commentsEnabledRef = React.useRef(commentsEnabled);
  commentsEnabledRef.current = commentsEnabled;
  const setCommentsEnabledRef = React.useRef(setCommentsEnabled);
  setCommentsEnabledRef.current = setCommentsEnabled;
  const addThreadRef = React.useRef(addThread);
  addThreadRef.current = addThread;
  const setSelectedThreadIdRef = React.useRef(setSelectedThreadId);
  setSelectedThreadIdRef.current = setSelectedThreadId;
  const locationRef = React.useRef(location);
  locationRef.current = location;
  const syncFromGitLabRef = React.useRef(syncFromGitLab);
  syncFromGitLabRef.current = syncFromGitLab;

  const [altKeyHeld, setAltKeyHeld] = React.useState(false);

  const currentThreads = getThreadsForRoute(location.pathname);
  const pinsToShow = React.useMemo(
    () =>
      currentThreads.filter(
        (t) => t.status === 'open' || (t.status === 'closed' && showClosedThreads)
      ),
    [currentThreads, showClosedThreads]
  );
  const selectedThread = currentThreads.find((t) => t.id === selectedThreadId);

  // Component highlighting for selected thread
  React.useEffect(() => {
    if (!commentsEnabled || !selectedThread || !selectedThread.cssSelector) {
      if (highlightRef.current) {
        highlightRef.current.remove();
        highlightRef.current = null;
      }
      return;
    }

    const element = findElementBySelector(selectedThread.cssSelector);
    if (!element) {
      if (highlightRef.current) {
        highlightRef.current.remove();
        highlightRef.current = null;
      }
      return;
    }

    let highlight = highlightRef.current;
    if (!highlight) {
      highlight = document.createElement('div');
      highlight.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 998;
        border: 2px solid var(--pf-t--global--color--brand--default);
        background-color: color-mix(in srgb, var(--pf-t--global--color--brand--default) 10%, transparent);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--pf-t--global--color--brand--default) 30%, transparent);
        transition: all 0.15s ease;
      `;
      document.body.appendChild(highlight);
      highlightRef.current = highlight;
    }

    const updateHighlight = () => {
      if (!highlight || !element) return;
      const rect = element.getBoundingClientRect();
      highlight.style.left = `${rect.left}px`;
      highlight.style.top = `${rect.top}px`;
      highlight.style.width = `${rect.width}px`;
      highlight.style.height = `${rect.height}px`;
    };

    updateHighlight();
    window.addEventListener('scroll', updateHighlight, true);
    window.addEventListener('resize', updateHighlight);

    return () => {
      window.removeEventListener('scroll', updateHighlight, true);
      window.removeEventListener('resize', updateHighlight);
    };
  }, [commentsEnabled, selectedThreadId, selectedThread]);

  // Cursor feedback when Option/Alt is held (or in Add comment mode) so user knows click will place a pin
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') setAltKeyHeld(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') setAltKeyHeld(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  React.useEffect(() => {
    const showPlaceCommentCursor = commentsEnabled || altKeyHeld;
    if (showPlaceCommentCursor) {
      document.body.style.cursor = 'crosshair';
    } else {
      document.body.style.cursor = '';
    }
    return () => {
      document.body.style.cursor = '';
    };
  }, [commentsEnabled, altKeyHeld]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (highlightRef.current) {
        highlightRef.current.remove();
        highlightRef.current = null;
      }
      if (previewRef.current) {
        previewRef.current.remove();
        previewRef.current = null;
      }
      if (previewLabelRef.current) {
        previewLabelRef.current.remove();
        previewLabelRef.current = null;
      }
    };
  }, []);

  // Hover preview
  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!commentsEnabledRef.current) {
        if (previewRef.current) {
          previewRef.current.remove();
          previewRef.current = null;
        }
        if (previewLabelRef.current) {
          previewLabelRef.current.remove();
          previewLabelRef.current = null;
        }
        hoveredElementRef.current = null;
        return;
      }

      const target = e.target as HTMLElement;

      if (
        target.closest('[data-comment-controls]') ||
        target.closest('[data-comment-pin]') ||
        target.closest('[data-comment-preview]')
      ) {
        if (previewRef.current) previewRef.current.style.display = 'none';
        if (previewLabelRef.current) previewLabelRef.current.style.display = 'none';
        hoveredElementRef.current = null;
        return;
      }

      const element = target as Element;
      if (hoveredElementRef.current === element) return;
      hoveredElementRef.current = element;

      const elementDescription = getElementDescription(element);
      const fiber = getFiberFromElement(element);
      let previewName = elementDescription;

      if (fiber) {
        const type = fiber.type;
        if (type && typeof type !== 'string') {
          const componentName = getComponentName(fiber);
          const displayName =
            (typeof type === 'function' && (type.displayName || type.name)) ||
            (type?.$$typeof === Symbol.for('react.forward_ref') &&
              (type.render?.displayName || type.render?.name)) ||
            undefined;
          previewName = componentName || displayName || elementDescription;
        }
      }

      let preview = previewRef.current;
      if (!preview) {
        preview = document.createElement('div');
        preview.setAttribute('data-comment-preview', 'true');
        preview.style.cssText = `
          position: fixed;
          pointer-events: none;
          z-index: 997;
          border: 2px dashed var(--pf-t--global--color--brand--default);
          background-color: color-mix(in srgb, var(--pf-t--global--color--brand--default) 5%, transparent);
          box-shadow: 0 0 0 1px color-mix(in srgb, var(--pf-t--global--color--brand--default) 20%, transparent);
          transition: all 0.1s ease;
        `;
        document.body.appendChild(preview);
        previewRef.current = preview;
      }

      let previewLabel = previewLabelRef.current;
      if (!previewLabel) {
        previewLabel = document.createElement('div');
        previewLabel.setAttribute('data-comment-preview', 'true');
        previewLabel.style.cssText = `
          position: fixed;
          pointer-events: none;
          z-index: 998;
          background-color: var(--pf-t--global--color--brand--default);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-family: var(--pf-t--global--font--family--sans);
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.1s ease;
        `;
        document.body.appendChild(previewLabel);
        previewLabelRef.current = previewLabel;
      }

      const rect = element.getBoundingClientRect();
      preview.style.display = 'block';
      preview.style.left = `${rect.left}px`;
      preview.style.top = `${rect.top}px`;
      preview.style.width = `${rect.width}px`;
      preview.style.height = `${rect.height}px`;

      previewLabel.style.display = 'block';
      previewLabel.textContent = previewName;

      const labelLeft = Math.max(8, rect.left);
      const labelTop =
        rect.top - 28 < 40 ? rect.bottom + 4 : rect.top - 28;

      previewLabel.style.left = `${labelLeft}px`;
      previewLabel.style.top = `${labelTop}px`;
    },
    [], // stable reference — reads commentsEnabledRef inside
  );

  const handleMouseLeave = React.useCallback(() => {
    if (previewRef.current) previewRef.current.style.display = 'none';
    if (previewLabelRef.current) previewLabelRef.current.style.display = 'none';
    hoveredElementRef.current = null;
  }, []);

  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave, true);

    if (!commentsEnabled) {
      if (previewRef.current) {
        previewRef.current.remove();
        previewRef.current = null;
      }
      if (previewLabelRef.current) {
        previewLabelRef.current.remove();
        previewLabelRef.current = null;
      }
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
    };
  }, [commentsEnabled, handleMouseMove, handleMouseLeave]);

  // Stable click handler that reads refs to avoid stale closures
  const handlePageClick = React.useCallback(
    (e: MouseEvent) => {
      // Place a pin when: in "Add comment" mode (any click) OR Option/Alt+click (secondary action from anywhere)
      if (!commentsEnabledRef.current && !e.altKey) return;

      const target = e.target as HTMLElement;
      if (
        target.closest('[data-comment-controls]') ||
        target.closest('[data-comment-pin]') ||
        target.closest('[data-comment-preview]') ||
        target.closest('[data-context-panel]') ||
        target.closest('[data-discussion-thread-row]') ||
        target.closest('[id="discussions-back-btn"]') ||
        target.closest('[id="toggle-pins-btn"]') ||
        target.closest('button[aria-label="Back to discussions"]') ||
        target.closest('button[aria-label="Show pins"]') ||
        target.closest('button[aria-label="Hide pins"]') ||
        target.closest('button[aria-label*="Remove"]') ||
        target.closest('button[aria-label*="Delete"]') ||
        target.closest('button[aria-label*="Edit"]') ||
        target.closest('button[aria-label*="Reply"]') ||
        target.closest('[data-comment-reply-inline]') ||
        target.closest('[data-comment-edit-form]') ||
        target.closest('[id^="save-edit-"]') ||
        target.closest('[id^="cancel-edit-"]')
      ) {
        return;
      }

      if (!overlayRef.current) return;
      e.preventDefault();
      e.stopPropagation();

      const overlayRect = overlayRef.current.getBoundingClientRect();
      const xPercent = ((e.clientX - overlayRect.left) / overlayRect.width) * 100;
      const yPercent = ((e.clientY - overlayRect.top) / overlayRect.height) * 100;
      const clickedElement = target as Element;
      const pathname = locationRef.current.pathname;

      // Defer heavy DOM/fiber work to avoid freezing the UI on complex pages (e.g. after navigation)
      setTimeout(() => {
        const cssSelector = generateSelectorForElement(clickedElement);
        const elementDescription = getElementDescription(clickedElement);
        const componentMetadata = getElementComponentMetadata(clickedElement);

        const threadId = addThreadRef.current(
          cssSelector,
          elementDescription,
          componentMetadata,
          xPercent,
          yPercent,
          pathname,
        );
        setSelectedThreadIdRef.current(threadId);
        setCommentsEnabledRef.current(false);
      }, 0);
    },
    [], // stable reference — all mutable state read via refs
  );

  // Register click handler when overlay is mounted (so both "Add comment" clicks and Option+click place pins)
  React.useEffect(() => {
    document.addEventListener('click', handlePageClick, true);
    return () => document.removeEventListener('click', handlePageClick, true);
  }, [handlePageClick]);

  // When entering comment mode, sync from GitLab so latest discussions are available (use ref to avoid effect loop)
  React.useEffect(() => {
    if (commentsEnabled) {
      syncFromGitLabRef.current(location.pathname).catch(() => undefined);
    }
  }, [commentsEnabled, location.pathname]);

  if (!commentsEnabled && !(showPinsEnabled && pinsToShow.length > 0)) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      data-comment-overlay
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 999,
        overflow: 'visible',
      }}
    >
      {pinsToShow.map((thread) => (
        <CommentPin
          key={thread.id}
          id={thread.id}
          cssSelector={thread.cssSelector}
          xPercent={thread.xPercent}
          yPercent={thread.yPercent}
          commentCount={thread.comments.length}
          isClosed={thread.status === 'closed'}
          isSelected={selectedThreadId === thread.id}
          onClick={() => {
            openToDiscussions();
            setSelectedThreadId(thread.id);
          }}
        />
      ))}
    </div>
  );
};
