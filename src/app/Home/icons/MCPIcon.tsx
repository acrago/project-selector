import * as React from 'react';

interface MCPIconProps {
  /** Whether to include the background styling */
  withBackground?: boolean;
  /** Custom size for the icon (default: 32px) */
  size?: number;
  /** Custom background color (overrides CSS variable) */
  backgroundColor?: string;
  /** Additional CSS class name */
  className?: string;
}

export const MCPIcon: React.FunctionComponent<MCPIconProps> = ({
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
      <polygon points="20.38 18.51 15.62 23.26 15.62 27.49 20.38 22.74 20.38 18.51" fill="none"/>
      <path d="M20.35,10.62h-4.69s-.02,4.7-.03,4.87l4.73-4.73s0-.09,0-.14Z" fill="none"/>
      <path d="M20.15,9.38c-.14-.93-1.64-2.58-2.15-3.33-.51.76-2,2.39-2.15,3.33h4.29Z" fill="none"/>
      <polygon points="15.62 21.49 20.38 16.74 20.38 12.51 15.62 17.26 15.62 21.49" fill="none"/>
      <polygon points="14.38 22.29 9.62 24.41 9.62 26.38 14.38 26.38 14.38 22.29" fill="none"/>
      <polygon points="21.62 26.38 26.38 26.38 26.38 24.41 21.62 22.29 21.62 26.38" fill="none"/>
      <polygon points="16.51 28.38 20.38 28.38 20.38 24.51 16.51 28.38" fill="none"/>
      <path d="M20,30.38h-4c-.82,0-.82,1.25,0,1.25,0,0,4,0,4,0,.82,0,.82-1.25,0-1.25Z"/>
      <path d="M27.25,23.43l-5.63-2.51v-9.92c-.03-.63-.06-2.28-1-3.54,0,0-2.12-2.83-2.12-2.83-.12-.16-.3-.25-.5-.25s-.38.09-.5.25l-2.12,2.83c-.94,1.26-.97,2.91-1,3.54,0,0,0,9.92,0,9.92l-5.63,2.51c-.23.1-.37.32-.37.57v3c0,.34.28.62.62.62h5.38v1.38c0,.33.29.63.63.63,0,0,6,0,6,0,.35,0,.62-.28.62-.62v-1.38h5.38c.35,0,.62-.28.62-.62v-3c0-.25-.15-.47-.37-.57ZM15.62,11.05c.02-.13.01-.28.03-.42h4.69s0,.09,0,.14l-4.73,4.73v-4.44ZM20.38,16.74l-4.75,4.75v-4.23l4.75-4.75v4.23ZM15.62,23.26l4.75-4.75v4.23l-4.75,4.75v-4.23ZM18,6.04c.51.76,2,2.39,2.15,3.33h-4.29c.14-.93,1.64-2.58,2.15-3.33ZM9.62,26.38v-1.97l4.75-2.11v4.08h-4.75ZM20.38,28.38h-3.87l3.87-3.87v3.87ZM26.38,26.38h-4.75v-4.08l4.75,2.11v1.97Z"/>
    </svg>
  );

  if (withBackground) {
    const containerSize = size + 8;
    const backgroundStyle: React.CSSProperties = {
      background: backgroundColor || 'var(--ai-mcp--BackgroundColor, #FFF4E6)',
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
