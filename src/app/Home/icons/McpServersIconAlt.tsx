import * as React from 'react';

interface McpServersIconAltProps {
  /** Whether to include the background styling */
  withBackground?: boolean;
  /** Custom size for the icon (default: 32px) */
  size?: number;
  /** Custom background color (overrides CSS variable) */
  backgroundColor?: string;
  /** Additional CSS class name */
  className?: string;
}

export const McpServersIconAlt: React.FunctionComponent<McpServersIconAltProps> = ({
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
        <path d="M29,23.38a2.62,2.62,0,0,0-2.54,2h-1.2l-1.82-1.82c-.56-.58-1.46.32-.88.88l2,2a.6.6,0,0,0,.44.18h1.46A2.62,2.62,0,1,0,29,23.38Zm0,4a1.38,1.38,0,0,1,0-2.75A1.38,1.38,0,0,1,29,27.38Z"/>
        <path d="M22.62,22V14a.61.61,0,0,0-.62-.62H14a.61.61,0,0,0-.62.62v8a.61.61,0,0,0,.62.62h8A.61.61,0,0,0,22.62,22Zm-1.24-.62H14.62V14.62h6.76Z"/>
        <path d="M31,15.38H27a.61.61,0,0,0-.62.62v1.38H24a.62.62,0,0,0,0,1.24h2.38V20a.61.61,0,0,0,.62.62h4a.61.61,0,0,0,.62-.62V16A.61.61,0,0,0,31,15.38Zm-.62,4H27.62V16.62h2.76Z"/>
        <path d="M23,12.62a.62.62,0,0,0,.44-.18l1.82-1.82h1.2a2.62,2.62,0,1,0,0-1.24H25a.6.6,0,0,0-.44.18l-2,2A.62.62,0,0,0,23,12.62Zm6-4a1.38,1.38,0,0,1,0,2.75A1.38,1.38,0,0,1,29,8.62Z"/>
        <path d="M7,12.62a2.62,2.62,0,0,0,2.54-2h1.2l1.82,1.82a.62.62,0,0,0,.88-.88l-2-2A.6.6,0,0,0,11,9.38H9.54A2.62,2.62,0,1,0,7,12.62Zm0-4a1.38,1.38,0,0,1,0,2.75A1.38,1.38,0,0,1,7,8.62Z"/>
        <path d="M5,20.62H9A.61.61,0,0,0,9.62,20V18.62H12a.62.62,0,0,0,0-1.24H9.62V16A.61.61,0,0,0,9,15.38H5a.61.61,0,0,0-.62.62v4A.61.61,0,0,0,5,20.62Zm.62-4H8.38v2.76H5.62Z"/>
        <path d="M12.56,23.56l-1.82,1.82H9.54a2.62,2.62,0,1,0,0,1.24H11a.6.6,0,0,0,.44-.18l2-2C14,23.88,13.12,23,12.56,23.56ZM7,27.38a1.38,1.38,0,0,1,0-2.75A1.38,1.38,0,0,1,7,27.38Z"/>
      </g>
    </svg>
  );

  if (withBackground) {
    const containerSize = size + 8;
    const backgroundStyle: React.CSSProperties = {
      background: backgroundColor || '#d2d2d2',
      borderRadius: '50%',
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
