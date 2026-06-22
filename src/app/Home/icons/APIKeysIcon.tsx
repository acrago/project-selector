import * as React from 'react';
import { KeyIcon } from '@patternfly/react-icons';

interface APIKeysIconProps {
  /** Whether to include the background styling */
  withBackground?: boolean;
  /** Custom size for the icon (default: 32px) */
  size?: number;
  /** Custom background color (overrides CSS variable) */
  backgroundColor?: string;
  /** Additional CSS class name */
  className?: string;
}

export const APIKeysIcon: React.FunctionComponent<APIKeysIconProps> = ({
  withBackground = false,
  size = 32,
  backgroundColor,
  className = '',
}) => {
  const iconElement = (
    <KeyIcon
      style={{ width: `${size}px`, height: `${size}px` }}
      className={!withBackground ? className : ''}
    />
  );

  if (withBackground) {
    const containerSize = size + 16;
    const backgroundStyle: React.CSSProperties = {
      background: backgroundColor || 'var(--ai-setup--BackgroundColor)',
      borderRadius: '50%',
      padding: '8px',
      width: `${containerSize}px`,
      height: `${containerSize}px`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    return (
      <div style={backgroundStyle} className={className}>
        {iconElement}
      </div>
    );
  }

  return iconElement;
};
