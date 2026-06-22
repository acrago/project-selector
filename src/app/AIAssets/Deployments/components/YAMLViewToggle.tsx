import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';

export type ViewMode = 'form' | 'yaml' | 'split';

interface YAMLViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  /** When true, hide the Form option. */
  hideFormOption?: boolean;
  /** When true, show Form but grayed out and disabled (e.g. in manual YAML mode). */
  formOptionDisabled?: boolean;
  /** When true, hide the Split option (e.g. 3.4 MVP has Form and YAML only). */
  hideSplitOption?: boolean;
}

export const YAMLViewToggle: React.FunctionComponent<YAMLViewToggleProps> = ({
  viewMode,
  onViewModeChange,
  hideFormOption = false,
  formOptionDisabled = false,
  hideSplitOption = false,
}) => {
  const showForm = !hideFormOption || formOptionDisabled;
  return (
    <ToggleGroup aria-label="View mode selection" id="yaml-view-toggle-group">
      {showForm && (
        <ToggleGroupItem
          text="Form"
          buttonId="view-form"
          isSelected={viewMode === 'form'}
          isDisabled={formOptionDisabled}
          onChange={() => !formOptionDisabled && onViewModeChange('form')}
          id="yaml-view-toggle-form"
        />
      )}
      <ToggleGroupItem
        text="YAML"
        buttonId="view-yaml"
        isSelected={viewMode === 'yaml'}
        onChange={() => onViewModeChange('yaml')}
        id="yaml-view-toggle-yaml"
      />
      {!hideSplitOption && (
        <ToggleGroupItem
          text="Split"
          buttonId="view-split"
          isSelected={viewMode === 'split'}
          onChange={() => onViewModeChange('split')}
          id="yaml-view-toggle-split"
        />
      )}
    </ToggleGroup>
  );
};
