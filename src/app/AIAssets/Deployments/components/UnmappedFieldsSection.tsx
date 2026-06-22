import React from 'react';
import { Button, Flex, FlexItem, Label, Title } from '@patternfly/react-core';
import { EditIcon } from '@patternfly/react-icons';
import { UnmappedField } from '../utils/yamlParser';

interface UnmappedFieldsSectionProps {
  unmappedFields: UnmappedField[];
  onEditInYAML: () => void;
  onFieldClick?: (field: UnmappedField) => void;
}

export const UnmappedFieldsSection: React.FunctionComponent<UnmappedFieldsSectionProps> = ({
  unmappedFields,
  onEditInYAML,
  onFieldClick,
}) => {
  if (unmappedFields.length === 0) {
    return null;
  }

  const formatValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <div style={{ marginBottom: '2rem' }} id="unmapped-fields-section">
      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
        <FlexItem>
          <Title headingLevel="h3" size="md" id="unmapped-fields-title">
            Custom YAML Properties
          </Title>
        </FlexItem>
        <FlexItem>
          <Button
            variant="link"
            icon={<EditIcon />}
            onClick={onEditInYAML}
            id="unmapped-fields-edit-button"
          >
            Edit in YAML
          </Button>
        </FlexItem>
      </Flex>
      <p style={{ marginBottom: '1rem', color: 'var(--pf-v5-global--Color--200)', fontSize: '0.875rem' }}>
        The following custom properties were added in YAML and are not available in the form. They are managed in YAML and cannot be edited through the form.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }} id="unmapped-fields-group">
        {unmappedFields.map((field, index) => (
          <Label
            key={index}
            id={`unmapped-field-label-${index}`}
            onClick={onFieldClick ? () => onFieldClick(field) : undefined}
            style={onFieldClick ? { cursor: 'pointer' } : undefined}
          >
            {field.path}: {formatValue(field.value)}
          </Label>
        ))}
      </div>
    </div>
  );
};
