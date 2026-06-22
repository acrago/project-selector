import * as React from 'react';

interface ExperimentsIconProps {
  /** Whether to include the background styling */
  withBackground?: boolean;
  /** Custom size for the icon (default: 32px) */
  size?: number;
  /** Custom background color (overrides CSS variable) */
  backgroundColor?: string;
  /** Additional CSS class name */
  className?: string;
}

export const ExperimentsIcon: React.FunctionComponent<ExperimentsIconProps> = ({
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
      <path d="m 16.56,5.44 c 0.55,0.59 1.48,-0.32 0.88,-0.88 a 0.62225397,0.62225397 0 0 0 -0.88,0.88 z m 2,7 c 0.57,0.58 1.47,-0.31 0.88,-0.88 -0.59,-0.57 -1.44,0.31 -0.88,0.88 z m -2,6 a 0.62225397,0.62225397 0 0 0 0.88,-0.88 C 16.86,17 16,17.87 16.56,18.44 Z M 27.39,27.3 21.62,13 V 7.62 c 0.72,-0.07 2,0.3 2,-0.62 A 0.62,0.62 0 0 0 23,6.38 h -2 a 0.62,0.62 0 0 0 -0.62,0.7 v 6 a 0.5,0.5 0 0 0 0,0.12 c 0,0 0,0.08 0,0.12 l 2.83,7 H 12.75 l 2.83,-7 c 0,0 0,-0.08 0,-0.12 a 0.5,0.5 0 0 0 0,-0.12 v -6 A 0.62,0.62 0 0 0 14.96,6.38 H 13 a 0.62,0.62 0 0 0 0,1.24 h 1.38 V 13 L 8.61,27.3 a 3.14,3.14 0 0 0 2.89,4.32 h 13 a 3.14,3.14 0 0 0 2.89,-4.32 z m -2.89,3.08 h -13 A 1.89,1.89 0 0 1 9.62,28.5 c -0.23,-0.16 2.54,-6.53 2.62,-6.88 h 11.52 l 2.47,6.15 a 1.89,1.89 0 0 1 -1.73,2.61 z" />
    </svg>
  );

  if (withBackground) {
    const containerSize = size + 8;
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
