import * as React from 'react';

interface ModelRegistryIconNewProps {
  /** Whether to include the background styling */
  withBackground?: boolean;
  /** Custom size for the icon (default: 32px) */
  size?: number;
  /** Custom background color (overrides CSS variable) */
  backgroundColor?: string;
  /** Additional CSS class name */
  className?: string;
}

export const ModelRegistryIconNew: React.FunctionComponent<ModelRegistryIconNewProps> = ({
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
      <g>
        <path d="M22,20.71a.62.62,0,0,0-.62.62v2.05H14.62V16.62h4.71a.62.62,0,0,0,0-1.24H14a.62.62,0,0,0-.62.62v8a.62.62,0,0,0,.62.62h8a.62.62,0,0,0,.62-.62V21.33A.62.62,0,0,0,22,20.71Z"/>
        <path d="M17.11,19.56a.63.63,0,1,0-.89.88l1.34,1.34a.63.63,0,0,0,.88,0l4-4a.63.63,0,0,0-.88-.89L18,20.45Z"/>
        <path d="M27,7.38H23a.62.62,0,0,0-.62.62V9.18H13.62V8A.62.62,0,0,0,13,7.38H9A.62.62,0,0,0,8.38,8V31a.62.62,0,0,0,.62.62H27a.62.62,0,0,0,.62-.62V8A.62.62,0,0,0,27,7.38Zm-.62,23H9.62V8.62h2.76V9.81a.62.62,0,0,0,.62.62H23a.62.62,0,0,0,.62-.62V8.62h2.76Z"/>
        <path d="M12,6.62h3.09a.63.63,0,0,0,.67-.4,2.39,2.39,0,0,1,4.48,0,.6.6,0,0,0,.68.4H24a.62.62,0,0,0,0-1.24H21.23a3.63,3.63,0,0,0-6.46,0H12A.62.62,0,0,0,12,6.62Z"/>
        <circle cx="18" cy="6" r="0.62"/>
      </g>
    </svg>
  );

  if (withBackground) {
    const containerSize = size + 8;
    const backgroundStyle: React.CSSProperties = {
      background: backgroundColor || '#ece6ff',
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
