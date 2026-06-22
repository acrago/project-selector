import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  SelectOptionProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities
} from '@patternfly/react-core';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';

export interface AssetOption {
  id: string;
  name: string;
  description?: string;
}

interface AIAssetSelectProps {
  /** Array of available asset options */
  options: AssetOption[];
  /** Array of currently selected asset IDs */
  selected: string[];
  /** Callback when selection changes */
  onSelect: (selectedIds: string[]) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Whether the select is disabled */
  isDisabled?: boolean;
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** Unique ID for the select */
  id?: string;
}

const AIAssetSelect: React.FunctionComponent<AIAssetSelectProps> = ({
  options,
  selected,
  onSelect,
  placeholder = 'Select assets',
  isDisabled = false,
  ariaLabel = 'Asset selection',
  id = 'ai-asset-select'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [selectOptions, setSelectOptions] = useState<SelectOptionProps[]>([]);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [placeholderText, setPlaceholderText] = useState(placeholder);
  const textInputRef = useRef<HTMLInputElement>(null);

  const NO_RESULTS = 'no results';

  // Convert asset options to select options
  const initialSelectOptions: SelectOptionProps[] = options.map(option => ({
    value: option.id,
    children: option.description ? `${option.name} (${option.description})` : option.name
  }));

  useEffect(() => {
    let newSelectOptions: SelectOptionProps[] = initialSelectOptions;

    // Filter menu items based on the text input value when one exists
    if (inputValue) {
      newSelectOptions = initialSelectOptions.filter((menuItem) =>
        String(menuItem.children).toLowerCase().includes(inputValue.toLowerCase())
      );

      // When no options are found after filtering, display 'No results found'
      if (!newSelectOptions.length) {
        newSelectOptions = [
          {
            isAriaDisabled: true,
            children: `No results found for "${inputValue}"`,
            value: NO_RESULTS,
            hasCheckbox: false
          }
        ];
      }

      // Open the menu when the input value changes and the new value is not empty
      if (!isOpen) {
        setIsOpen(true);
      }
    }

    setSelectOptions(newSelectOptions);
  }, [inputValue, initialSelectOptions]);

  useEffect(() => {
    setPlaceholderText(`${selected.length} item${selected.length !== 1 ? 's' : ''} selected`);
  }, [selected]);

  const createItemId = (value: any) => `${id}-${value.replace(' ', '-')}`;

  const setActiveAndFocusedItem = (itemIndex: number) => {
    setFocusedItemIndex(itemIndex);
    const focusedItem = selectOptions[itemIndex];
    setActiveItemId(createItemId(focusedItem.value));
  };

  const resetActiveAndFocusedItem = () => {
    setFocusedItemIndex(null);
    setActiveItemId(null);
  };

  const closeMenu = () => {
    setIsOpen(false);
    resetActiveAndFocusedItem();
  };

  const onInputClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else if (!inputValue) {
      closeMenu();
    }
  };

  const handleMenuArrowKeys = (key: string) => {
    let indexToFocus = 0;

    if (!isOpen) {
      setIsOpen(true);
    }

    if (selectOptions.every((option) => option.isDisabled)) {
      return;
    }

    if (key === 'ArrowUp') {
      // When no index is set or at the first index, focus to the last, otherwise decrement focus index
      if (focusedItemIndex === null || focusedItemIndex === 0) {
        indexToFocus = selectOptions.length - 1;
      } else {
        indexToFocus = focusedItemIndex - 1;
      }

      // Skip disabled options
      while (selectOptions[indexToFocus].isDisabled) {
        indexToFocus--;
        if (indexToFocus === -1) {
          indexToFocus = selectOptions.length - 1;
        }
      }
    }

    if (key === 'ArrowDown') {
      // When no index is set or at the last index, focus to the first, otherwise increment focus index
      if (focusedItemIndex === null || focusedItemIndex === selectOptions.length - 1) {
        indexToFocus = 0;
      } else {
        indexToFocus = focusedItemIndex + 1;
      }

      // Skip disabled options
      while (selectOptions[indexToFocus].isDisabled) {
        indexToFocus++;
        if (indexToFocus === selectOptions.length) {
          indexToFocus = 0;
        }
      }
    }

    setActiveAndFocusedItem(indexToFocus);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const focusedItem = focusedItemIndex !== null ? selectOptions[focusedItemIndex] : null;

    switch (event.key) {
      case 'Enter':
        if (isOpen && focusedItem && focusedItem.value !== NO_RESULTS && !focusedItem.isAriaDisabled) {
          handleSelect(focusedItem.value as string);
        }

        if (!isOpen) {
          setIsOpen(true);
        }

        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        handleMenuArrowKeys(event.key);
        break;
    }
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
    textInputRef?.current?.focus();
  };

  const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
    resetActiveAndFocusedItem();
  };

  const handleSelect = (value: string) => {
    if (value && value !== NO_RESULTS) {
      const newSelected = selected.includes(value) 
        ? selected.filter((selection) => selection !== value) 
        : [...selected, value];
      onSelect(newSelected);
    }

    textInputRef.current?.focus();
  };

  const onClearButtonClick = () => {
    onSelect([]);
    setInputValue('');
    resetActiveAndFocusedItem();
    textInputRef?.current?.focus();
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      variant="typeahead"
      aria-label={ariaLabel}
      onClick={onToggleClick}
      innerRef={toggleRef}
      isExpanded={isOpen}
      isFullWidth
      isDisabled={isDisabled}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={onInputClick}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          id={`${id}-input`}
          autoComplete="off"
          innerRef={textInputRef}
          placeholder={placeholderText}
          {...(activeItemId && { 'aria-activedescendant': activeItemId })}
          role="combobox"
          isExpanded={isOpen}
          aria-controls={`${id}-listbox`}
          disabled={isDisabled}
        />
        <TextInputGroupUtilities {...(selected.length === 0 ? { style: { display: 'none' } } : {})}>
          <Button 
            variant="plain" 
            onClick={onClearButtonClick} 
            aria-label="Clear input value" 
            icon={<TimesIcon />}
            isDisabled={isDisabled}
          />
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <Select
      role="menu"
      id={id}
      isOpen={isOpen}
      selected={selected}
      onSelect={(_event, selection) => handleSelect(selection as string)}
      onOpenChange={(isOpen) => {
        !isOpen && closeMenu();
      }}
      toggle={toggle}
      variant="typeahead"
    >
      <SelectList isAriaMultiselectable id={`${id}-listbox`}>
        {selectOptions.map((option, index) => (
          <SelectOption
            {...(!option.isDisabled && !option.isAriaDisabled && { hasCheckbox: true })}
            isSelected={selected.includes(option.value as string)}
            key={option.value || option.children}
            isFocused={focusedItemIndex === index}
            className={option.className}
            id={createItemId(option.value)}
            {...option}
            ref={null}
          />
        ))}
      </SelectList>
    </Select>
  );
};

export { AIAssetSelect };
