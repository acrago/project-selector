import * as React from 'react';
import { Button } from '@patternfly/react-core';
import { CommentIcon } from '@patternfly/react-icons';
import { findElementBySelector } from '../utils/selectorUtils';

interface CommentPinProps {
  id: string;
  cssSelector?: string;
  xPercent: number;
  yPercent: number;
  commentCount: number;
  isClosed?: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export const CommentPin: React.FunctionComponent<CommentPinProps> = ({
  id,
  cssSelector,
  xPercent,
  yPercent,
  commentCount,
  isClosed = false,
  isSelected,
  onClick,
}) => {
  const pinRef = React.useRef<HTMLButtonElement>(null);
  const [position, setPosition] = React.useState({ left: `${xPercent}%`, top: `${yPercent}%` });
  const [elementExists, setElementExists] = React.useState(true);

  const updatePosition = React.useCallback(() => {
    const overlayEl = pinRef.current?.closest('[data-comment-overlay]');
    const overlayRect = overlayEl?.getBoundingClientRect();

    if (!cssSelector) {
      if (overlayRect) {
        const leftPx = (xPercent / 100) * overlayRect.width;
        const topPx = (yPercent / 100) * overlayRect.height;
        setPosition({ left: `${leftPx}px`, top: `${topPx}px` });
      } else {
        setPosition({ left: `${xPercent}%`, top: `${yPercent}%` });
      }
      setElementExists(true);
      return;
    }

    const element = findElementBySelector(cssSelector);
    if (element && overlayRect) {
      const rect = element.getBoundingClientRect();
      const leftPx = rect.left - overlayRect.left + 4;
      const topPx = rect.top - overlayRect.top + 4;
      setPosition({ left: `${leftPx}px`, top: `${topPx}px` });
      setElementExists(true);
    } else if (element && !overlayRect) {
      setPosition({ left: `${xPercent}%`, top: `${yPercent}%` });
      setElementExists(true);
    } else {
      if (overlayRect) {
        const leftPx = (xPercent / 100) * overlayRect.width;
        const topPx = (yPercent / 100) * overlayRect.height;
        setPosition({ left: `${leftPx}px`, top: `${topPx}px` });
      } else {
        setPosition({ left: `${xPercent}%`, top: `${yPercent}%` });
      }
      setElementExists(false);
    }
  }, [cssSelector, xPercent, yPercent]);

  React.useEffect(() => {
    updatePosition();

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [updatePosition]);

  const opacity = elementExists ? 1.0 : 0.4;

  return (
    <Button
      ref={pinRef}
      id={`comment-pin-${id}`}
      variant="plain"
      data-comment-pin
      style={{
        position: 'absolute',
        left: position.left,
        top: position.top,
        transform: 'translate(0, 0)',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: isClosed
          ? 'var(--pf-t--global--icon--color--subtle)'
          : 'var(--pf-t--global--color--status--danger--default)',
        color: 'white',
        border: isSelected
          ? '3px solid var(--pf-t--global--color--brand--default)'
          : '2px solid var(--pf-t--global--border--color--default)',
        boxShadow: isSelected
          ? '0 0 0 3px color-mix(in srgb, var(--pf-t--global--color--brand--default) 30%, transparent), 0 2px 8px rgba(0,0,0,0.3)'
          : '0 2px 8px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        pointerEvents: 'auto',
        opacity,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={`${isClosed ? 'Resolved ' : ''}comment thread with ${commentCount} comment${commentCount !== 1 ? 's' : ''}${!elementExists ? ' (element deleted)' : ''}`}
    >
      {commentCount <= 1 ? (
        <CommentIcon style={{ fontSize: '16px' }} />
      ) : (
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{commentCount}</span>
      )}
    </Button>
  );
};
