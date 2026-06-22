import * as React from 'react';

interface KnowledgeSourcesIconProps {
  /** Whether to include the background styling */
  withBackground?: boolean;
  /** Custom size for the icon (default: 32px) */
  size?: number;
  /** Custom background color (overrides CSS variable) */
  backgroundColor?: string;
  /** Additional CSS class name */
  className?: string;
}

export const KnowledgeSourcesIcon: React.FunctionComponent<KnowledgeSourcesIconProps> = ({
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
      <path d="M22.8457,16.3933c.1934-.1118.3125-.3184.3125-.5415v-5.2344c0-.2231-.1191-.4297-.3125-.5415l-4.5332-2.6172c-.1934-.1113-.4316-.1113-.625,0l-4.5332,2.6172c-.1934.1118-.3125.3184-.3125.5415v5.2344c0,.2231.1191.4297.3125.5415l4.5332,2.6172c.0967.0557.2046.0835.3125.0835s.2158-.0278.3125-.0835l4.5332-2.6172ZM14.0918,15.491v-4.5127l3.9082-2.2563,3.9082,2.2563v4.5127l-3.9082,2.2563-3.9082-2.2563Z" />
      <path d="M23.7832,28.5417l4.5332-2.6172c.1934-.1118.3125-.3184.3125-.5415v-5.2349c0-.2231-.1191-.4297-.3125-.5415l-4.5332-2.6172c-.1934-.1113-.4316-.1113-.625,0l-4.5332,2.6172c-.1934.1118-.3125.3184-.3125.5415v5.2349c0,.2231.1191.4297.3125.5415l4.5332,2.6172c.0967.0557.2046.0835.3125.0835s.2158-.0278.3125-.0835ZM19.5625,25.0222v-4.5132l3.9082-2.2563,3.9082,2.2563v4.5132l-3.9082,2.2563s-3.9082-2.2563-3.9082-2.2563Z" />
      <path d="M12.8418,16.9895c-.1934-.1113-.4316-.1113-.625,0l-4.5332,2.6172c-.1934.1118-.3125.3184-.3125.5415v5.2349c0,.2231.1191.4297.3125.5415l4.5332,2.6172c.0967.0557.2046.0835.3125.0835s.2158-.0278.3125-.0835l4.5332-2.6172c.1934-.1118.3125-.3184.3125-.5415v-5.2349c0-.2231-.1191-.4297-.3125-.5415,0,0-4.5332-2.6172-4.5332-2.6172ZM16.4375,25.0222l-3.9082,2.2563-3.9082-2.2563v-4.5132l3.9082-2.2563,3.9082,2.2563v4.5132Z" />
      <path d="M12,30.3752h-6.375V5.6252h6.375c.3452,0,.625-.2798.625-.625s-.2798-.625-.625-.625h-7c-.3452,0-.625.2798-.625.625v26c0,.3452.2798.625.625.625h7c.3452,0,.625-.2798.625-.625s-.2798-.625-.625-.625Z" />
      <path d="M31,4.3752h-7c-.3452,0-.625.2798-.625.625s.2798.625.625.625h6.375v24.75h-6.375c-.3452,0-.625.2798-.625.625s.2798.625.625.625h7c.3452,0,.625-.2798.625-.625V5.0002c0-.3452-.2798-.625-.625-.625Z" />
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
