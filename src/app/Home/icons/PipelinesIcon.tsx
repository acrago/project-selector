import * as React from 'react';

interface PipelinesIconProps {
  /** Whether to include the background styling */
  withBackground?: boolean;
  /** Custom size for the icon (default: 32px) */
  size?: number;
  /** Custom background color (overrides CSS variable) */
  backgroundColor?: string;
  /** Additional CSS class name */
  className?: string;
}

export const PipelinesIcon: React.FunctionComponent<PipelinesIconProps> = ({
  withBackground = false,
  size = 32,
  backgroundColor,
  className = '',
}) => {
  const iconSvg = (
    <svg
      className={`pf-v6-svg ${!withBackground ? className : ''}`}
      viewBox="0 0 36 36"
      fill="currentColor"
      aria-hidden="true"
      role="img"
      width="1em"
      height="1em"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <path d="M28,24.375c-1.785,0-3.2637,1.2992-3.5618,3h-14.4382c-2.4126,0-4.375-1.9629-4.375-4.375s1.9624-4.375,4.375-4.375h16c3.1016,0,5.625-2.5234,5.625-5.625s-2.5234-5.625-5.625-5.625h-14.4382c-.298-1.7008-1.7768-3-3.5618-3-1.999,0-3.625,1.626-3.625,3.625s1.626,3.625,3.625,3.625c1.785,0,3.2637-1.2992,3.5618-3h14.4382c2.4126,0,4.375,1.9629,4.375,4.375s-1.9624,4.375-4.375,4.375H10c-3.1016,0-5.625,2.5234-5.625,5.625s2.5234,5.625,5.625,5.625h14.4382c.298,1.7008,1.7768,3,3.5618,3,1.999,0,3.625-1.626,3.625-3.625s-1.626-3.625-3.625-3.625ZM8,10.375c-1.3096,0-2.375-1.0654-2.375-2.375s1.0654-2.375,2.375-2.375,2.375,1.0654,2.375,2.375-1.0654,2.375-2.375,2.375ZM28,30.375c-1.3096,0-2.375-1.0654-2.375-2.375s1.0654-2.375,2.375-2.375,2.375,1.0654,2.375,2.375-1.0654,2.375-2.375,2.375Z" />
    </svg>
  );

  if (withBackground) {
    const containerSize = size + 8; // Add 8px for padding (4px on each side)
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
        {iconSvg}
      </div>
    );
  }

  return iconSvg;
};

