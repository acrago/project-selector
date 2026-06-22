import * as React from 'react';
import {
  Content,
  ContentVariants,
  Divider,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { CheckIcon, FlagIcon } from '@patternfly/react-icons';
import { VariantFlagCategory, useVariantFlags } from '@app/utils/VariantFlagsContext';

const VariantFlagsDropdown: React.FunctionComponent = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { getActiveCategories, isVariantFlagEnabled, toggleVariantFlag } = useVariantFlags();

  const activeCategories = getActiveCategories();

  // Don't render if there are no active categories for the current page
  if (activeCategories.length === 0) {
    return null;
  }

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (categoryId: string, optionId: string) => {
    toggleVariantFlag(categoryId, optionId);
    // Don't close the dropdown to allow multiple selections
  };

  const renderCategoryItems = (category: VariantFlagCategory) => {
    return category.options.map((option) => {
      const isEnabled = isVariantFlagEnabled(category.id, option.id);
      return (
        <DropdownItem
          key={`${category.id}-${option.id}`}
          id={`variant-flag-${category.id}-${option.id}`}
          onClick={() => handleOptionClick(category.id, option.id)}
          icon={isEnabled ? <CheckIcon color="var(--pf-t--global--icon--color--status--success--default)" /> : undefined}
          description={option.description}
        >
          {option.label}
        </DropdownItem>
      );
    });
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(open: boolean) => setIsOpen(open)}
      popperProps={{
        position: 'right',
      }}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={onToggle}
          isExpanded={isOpen}
          variant="plain"
          aria-label="Prototype variations"
          id="variant-flags-toggle"
          style={{
            color: '#FF69B4', // Hot pink for the icon
          }}
        >
          <FlagIcon />
        </MenuToggle>
      )}
    >
      <Content
        component={ContentVariants.p}
        style={{
          padding: '0.75rem 1rem 0.5rem',
          fontWeight: 600,
          fontSize: '0.875rem',
          color: '#C71585', // Medium violet red for title
          margin: 0,
        }}
      >
        Prototype variations
      </Content>
      <Divider />
      <DropdownList>
        {activeCategories.map((category) => (
          <DropdownGroup
            key={category.id}
            label={category.label}
            id={`variant-group-${category.id}`}
          >
            {renderCategoryItems(category)}
          </DropdownGroup>
        ))}
      </DropdownList>
    </Dropdown>
  );
};

export { VariantFlagsDropdown };
