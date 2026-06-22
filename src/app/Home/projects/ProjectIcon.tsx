import * as React from 'react';
import { SVGIconProps } from '@patternfly/react-icons/dist/esm/createIcon';

const ProjectIcon: React.FunctionComponent<SVGIconProps> = ({
  color = 'currentColor',
  title,
  ...props
}: SVGIconProps) => (
  <svg
    fill={color}
    height="1em"
    width="1em"
    viewBox="9 13 39 29"
    aria-hidden={title ? undefined : true}
    role="img"
    style={{
      verticalAlign: '-0.125em',
    }}
    {...props}
  >
    {title && <title>{title}</title>}
    <path d="M46.8,18h-2.808l-.816-3.852c-.12-.552-.612-.948-1.176-.948h-12c-.564,0-1.056.396-1.176.948l-.816,3.852h-11.208c-.66,0-1.2,.54-1.2,1.2v18c0,.66.54,1.2,1.2,1.2s1.2-.54,1.2-1.2v-16.8h10.98c.564,0,1.056-.396,1.176-.948l.816-3.852h10.056l.816,3.852c.12.552.612.948,1.176.948h2.58v21.6H12v-22.8c0-.66-.54-1.2-1.2-1.2s-1.2,.54-1.2,1.2v24c0,.66.54,1.2,1.2,1.2h36c.66,0,1.2-.54,1.2-1.2v-24c0-.66-.54-1.2-1.2-1.2Z" />
  </svg>
);

ProjectIcon.displayName = 'ProjectIcon';

export default ProjectIcon;

