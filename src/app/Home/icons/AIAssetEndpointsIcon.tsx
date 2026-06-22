import * as React from 'react';
import { ShareAltIcon } from '@patternfly/react-icons';

interface AIAssetEndpointsIconProps {
  /** Whether to include the background styling */
  withBackground?: boolean;
  /** Custom size for the icon (default: 32px) */
  size?: number;
  /** Custom background color (overrides CSS variable) */
  backgroundColor?: string;
  /** Additional CSS class name */
  className?: string;
}

export const AIAssetEndpointsIcon: React.FunctionComponent<AIAssetEndpointsIconProps> = ({
  withBackground = false,
  size = 32,
  backgroundColor,
  className = '',
}) => {
  if (withBackground) {
    const containerSize = size + 8;
    const innerIconSize = size - 8;
    const backgroundStyle: React.CSSProperties = {
      background: backgroundColor || 'var(--ai-development--BackgroundColor)',
      borderRadius: '20px',
      padding: '4px',
      width: `${containerSize}px`,
      height: `${containerSize}px`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    return (
      <div style={backgroundStyle} className={className}>
        <ShareAltIcon
          style={{ width: `${innerIconSize}px`, height: `${innerIconSize}px` }}
        />
      </div>
    );
  }

  return (
    <ShareAltIcon
      style={{ width: `${size}px`, height: `${size}px` }}
      className={className}
    />
  );
};
