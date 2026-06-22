import * as React from 'react';

interface EvaluationsIconProps {
  /** Whether to include the background styling */
  withBackground?: boolean;
  /** Custom size for the icon (default: 32px) */
  size?: number;
  /** Custom background color (overrides CSS variable) */
  backgroundColor?: string;
  /** Additional CSS class name */
  className?: string;
}

export const EvaluationsIcon: React.FunctionComponent<EvaluationsIconProps> = ({
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
      <path d="M25,26.375c-.34521,0-.625.28027-.625.625v3.375H5.625V9.625h3.375c.34521,0,.625-.28027.625-.625v-3.375h14.75v5.375c0,.34473.27979.625.625.625s.625-.28027.625-.625v-6c0-.34521-.27979-.625-.625-.625H9c-.02869,0-.05322.01263-.08093.01636-.02771.0036-.0517.00854-.07867.01587-.10693.02899-.20654.07501-.28259.15118l-3.99969,3.99921c-.00067.00067-.00067.00177-.00134.0025-.07495.07556-.12054.17389-.14935.27954-.00751.02771-.01263.05219-.0163.08063-.00366.02728-.01611.05145-.01611.07971v22c0,.34473.27979.625.625.625h20c.34521,0,.625-.28027.625-.625v-4c0-.34473-.27979-.625-.625-.625ZM8.375,6.50879v1.86621h-1.86621l1.86621-1.86621Z" />
      <path d="M31.44189,27.55762l-4.3382-4.33862c.94965-1.14673,1.5213-2.61719,1.5213-4.21899,0-3.65332-2.97217-6.625-6.625-6.625s-6.625,2.97168-6.625,6.625,2.97217,6.625,6.625,6.625c1.60193,0,3.07257-.5719,4.21942-1.52173l4.33868,4.33911c.12207.12207.28174.18262.44189.18262s.31982-.06055.44189-.18262c.24414-.24414.24414-.64062,0-.88477ZM16.625,19c0-2.96387,2.41113-5.375,5.375-5.375s5.375,2.41113,5.375,5.375-2.41113,5.375-5.375,5.375-5.375-2.41113-5.375-5.375Z" />
    </svg>
  );

  if (withBackground) {
    const containerSize = size + 8;
    const backgroundStyle: React.CSSProperties = {
      background: backgroundColor || 'var(--ai-deployment--BackgroundColor)',
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

