import * as React from 'react';
import { MastheadProjectSelector } from '@app/components/MastheadProjectSelector';

/**
 * Variation 3: same open-menu content and behavior as variation 1 (`MastheadProjectSelector`),
 * with PatternFly [plain toggle with text label](https://www.patternfly.org/components/menus/menu-toggle#plain-toggle-with-text-label)
 * (`variant="plainText"`) instead of the default bordered toggle.
 */
const MastheadProjectSelectorV3: React.FunctionComponent = () => (
  <MastheadProjectSelector menuToggleVariant="plainText" showProjectFieldLabel={false} />
);

export { MastheadProjectSelectorV3 };
