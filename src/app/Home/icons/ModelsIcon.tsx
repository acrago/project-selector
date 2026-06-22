import * as React from 'react';

interface ModelsIconProps {
  /** Whether to include the background styling */
  withBackground?: boolean;
  /** Custom size for the icon (default: 32px) */
  size?: number;
  /** Custom background color (overrides CSS variable) */
  backgroundColor?: string;
  /** Additional CSS class name */
  className?: string;
}

export const ModelsIcon: React.FunctionComponent<ModelsIconProps> = ({
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
      <path d="M20.625,16.25928l6.63428-6.63428h3.74072c.34521,0,.625-.28027.625-.625v-4c0-.34521-.27979-.625-.625-.625h-4c-.34521,0-.625.27979-.625.625v1.375H9.625v-1.375c0-.34521-.27979-.625-.625-.625h-4c-.34521,0-.625.27979-.625.625v4c0,.34473.27979.625.625.625h3.74078l6.63422,6.63403v1.11597h-5.75v-1.375c0-.34473-.27979-.625-.625-.625h-4c-.34521,0-.625.28027-.625.625v4c0,.34473.27979.625.625.625h4c.34521,0,.625-.28027.625-.625v-1.375h5.75v1.11597l-6.63422,6.63403h-3.74078c-.34521,0-.625.28027-.625.625v4c0,.34473.27979.625.625.625h4c.34521,0,.625-.28027.625-.625v-1.375h16.75v1.375c0,.34473.27979.625.625.625h4c.34521,0,.625-.28027.625-.625v-4c0-.34473-.27979-.625-.625-.625h-3.74078l-6.63422-6.63403v-1.11597h5.75v1.375c0,.34473.27979.625.625.625h4c.34521,0,.625-.28027.625-.625v-4c0-.34473-.27979-.625-.625-.625h-4c-.34521,0-.625.28027-.625.625v1.375h-5.75v-1.11572ZM8.375,19.375h-2.75v-2.75h2.75v2.75ZM27.625,16.625h2.75v2.75h-2.75v-2.75ZM16.625,19.375v-2.75h2.75v2.75h-2.75ZM27.625,5.625h2.75v2.75h-2.75v-2.75ZM26.375,7.625v1.11621l-6.63403,6.63379h-3.48193l-6.63403-6.63379v-1.11621h16.75ZM5.625,5.625h2.75v2.75h-2.75v-2.75ZM8.375,30.375h-2.75v-2.75h2.75v2.75ZM9.625,28.375v-1.11572l6.63428-6.63428h3.48169l6.63403,6.63379v1.11621H9.625ZM30.375,30.375h-2.75v-2.75h2.75v2.75Z"/>
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
