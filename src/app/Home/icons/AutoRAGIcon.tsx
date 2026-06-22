import * as React from 'react';

interface AutoRAGIconProps {
  /** Whether to include the background styling */
  withBackground?: boolean;
  /** Custom size for the icon (default: 32px) */
  size?: number;
  /** Custom background color (overrides CSS variable) */
  backgroundColor?: string;
  /** Additional CSS class name */
  className?: string;
}

export const AutoRAGIcon: React.FunctionComponent<AutoRAGIconProps> = ({
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
      <path d="M29.61,29.88L24.29,4.87c-.07-.34-.4-.56-.74-.48-.34,.07-.55,.4-.48,.74l.29,1.38-3.56,.76-.31-1.47c-.07-.34-.4-.56-.74-.48-.05,0-.08,.03-.12,.05v-.36c0-.34-.28-.62-.62-.62H8c-.35,0-.62,.28-.62,.62V31c0,.34,.28,.62,.62,.62h10c.35,0,.62-.28,.62-.62V7.73l4.97,23.4c.07,.34,.41,.55,.74,.48,.34-.07,.55-.4,.48-.74l-.31-1.45,3.56-.76,.31,1.48c.07,.34,.41,.55,.74,.48,.34-.07,.55-.4,.48-.74ZM17.38,7.38h-3.75v-1.75h3.75v1.75Zm0,20h-3.75V8.62h3.75V27.38ZM8.62,8.62h3.75V27.38h-3.75V8.62Zm3.75-3v1.75h-3.75v-1.75h3.75Zm-3.75,23h3.75v1.75h-3.75v-1.75Zm5,1.75v-1.75h3.75v1.75h-3.75Zm10.63-2.17l-4.19-19.71,3.56-.76,4.19,19.71-3.56,.76Z" />
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

