import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Content,
  Divider,
  ExpandableSection,
  Flex,
  FlexItem,
  Label,
  MenuToggle,
  MenuToggleElement,
  ProgressStep,
  ProgressStepper,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { AngleDownIcon, AngleRightIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import { HistoryEntry } from '@app/utils/designData';

interface HistoryTabProps {
  entries: HistoryEntry[];
}

const typeVariantMap: Record<
  string,
  'default' | 'success' | 'info' | 'pending' | 'warning' | 'danger'
> = {
  Meeting: 'info',
  Update: 'success',
  Decision: 'warning',
  Enhancement: 'info',
  Feature: 'success',
  Addition: 'success',
  Feedback: 'info',
  Descoped: 'danger',
  Removed: 'danger',
  Bugfix: 'default',
};

const typeColorMap: Record<string, 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'teal' | 'grey'> = {
  Meeting: 'blue',
  Update: 'green',
  Decision: 'orange',
  Enhancement: 'teal',
  Feature: 'purple',
  Addition: 'teal',
  Feedback: 'blue',
  Descoped: 'red',
  Removed: 'red',
  Bugfix: 'grey',
};

const renderMarkdownLine = (line: string, lineIndex: number): React.ReactNode => {
  const renderInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const inlinePattern = /(\*\*(.+?)\*\*)|(`([^`]+)`)|(\[([^\]]+)]\(([^)]+)\))/g;
    let lastIdx = 0;
    let match;
    let partKey = 0;

    while ((match = inlinePattern.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(text.slice(lastIdx, match.index));
      }

      if (match[2]) {
        parts.push(<strong key={partKey++}>{match[2]}</strong>);
      } else if (match[4]) {
        parts.push(
          <code
            key={partKey++}
            style={{
              backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
              padding: '0 4px',
              borderRadius: '3px',
              fontSize: '0.8em',
            }}
          >
            {match[4]}
          </code>,
        );
      } else if (match[6] && match[7]) {
        parts.push(
          <Button
            key={partKey++}
            variant="link"
            isInline
            component="a"
            href={match[7]}
            target="_blank"
            rel="noopener noreferrer"
            icon={<ExternalLinkAltIcon />}
            iconPosition="end"
            id={`md-link-${lineIndex}-${partKey}`}
          >
            {match[6]}
          </Button>,
        );
      }
      lastIdx = match.index + match[0].length;
    }

    if (lastIdx < text.length) {
      parts.push(text.slice(lastIdx));
    }

    return parts;
  };

  const trimmed = line.trim();
  if (!trimmed) return null;

  const checkboxDone = trimmed.match(/^- \[x] (.+)/i);
  if (checkboxDone) {
    return (
      <div key={lineIndex} style={{ paddingLeft: '8px', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
        <input type="checkbox" checked readOnly style={{ width: '14px', height: '14px', marginTop: '3px', flexShrink: 0, accentColor: 'var(--pf-t--global--icon--color--status--success--default)' }} />
        <span>{renderInline(checkboxDone[1])}</span>
      </div>
    );
  }

  const checkboxOpen = trimmed.match(/^- \[ ] (.+)/);
  if (checkboxOpen) {
    return (
      <div key={lineIndex} style={{ paddingLeft: '8px', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
        <input type="checkbox" readOnly style={{ width: '14px', height: '14px', marginTop: '3px', flexShrink: 0 }} />
        <span>{renderInline(checkboxOpen[1])}</span>
      </div>
    );
  }

  if (trimmed.startsWith('- ')) {
    return (
      <div key={lineIndex} style={{ paddingLeft: '8px' }}>
        &bull; {renderInline(trimmed.slice(2))}
      </div>
    );
  }

  return <div key={lineIndex}>{renderInline(trimmed)}</div>;
};

const renderMarkdownBody = (body: string): React.ReactNode => {
  const lines = body.split('\n');
  return (
    <div style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
      {lines.map((line, i) => renderMarkdownLine(line, i))}
    </div>
  );
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const HistoryTab: React.FunctionComponent<HistoryTabProps> = ({ entries }) => {
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isTypeSelectOpen, setIsTypeSelectOpen] = useState(false);

  const allTypes = useMemo(() => {
    const types = new Set<string>();
    entries.forEach((e) => types.add(e.type));
    return Array.from(types).sort();
  }, [entries]);

  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(() => new Set(allTypes));

  const handleTypeSelect = (type: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const allTypesSelected = selectedTypes.size === allTypes.length;
  const isTypeFiltered = !allTypesSelected;

  const filteredEntries = useMemo(() => {
    return entries
      .map((entry, i) => ({ entry, originalIndex: i }))
      .filter(({ entry }) => {
        if (!selectedTypes.has(entry.type)) return false;
        if (!searchValue.trim()) return true;
        const term = searchValue.toLowerCase();
        return (
          entry.title.toLowerCase().includes(term) ||
          entry.type.toLowerCase().includes(term) ||
          entry.body?.toLowerCase().includes(term) ||
          entry.date.includes(term) ||
          formatDate(entry.date).toLowerCase().includes(term)
        );
      });
  }, [entries, searchValue, selectedTypes]);

  const groupedEntries = useMemo(() => {
    const groups: { date: string; items: { entry: HistoryEntry; originalIndex: number }[] }[] = [];
    filteredEntries.forEach(({ entry, originalIndex }) => {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.date === entry.date) {
        lastGroup.items.push({ entry, originalIndex });
      } else {
        groups.push({ date: entry.date, items: [{ entry, originalIndex }] });
      }
    });
    return groups;
  }, [filteredEntries]);

  if (entries.length === 0) {
    return (
      <div style={{ padding: '16px 0' }}>
        <Content component="p" id="history-empty-state">
          No history available for this feature yet.
        </Content>
      </div>
    );
  }

  const toggleEntry = (index: number) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleDateGroup = (date: string) => {
    setCollapsedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const handleExpandCollapseAll = () => {
    if (expandAll) {
      setExpandedEntries(new Set());
      setExpandAll(false);
    } else {
      const allIndices = new Set(filteredEntries.map(({ originalIndex }) => originalIndex));
      setExpandedEntries(allIndices);
      setExpandAll(true);
    }
  };

  const typeToggleLabel = allTypesSelected
    ? 'All types'
    : selectedTypes.size === 0
      ? 'No types'
      : selectedTypes.size === 1
        ? Array.from(selectedTypes)[0]
        : `${selectedTypes.size} types`;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexShrink: 0 }}>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsSm' }}
          style={{ paddingTop: '16px', marginBottom: '12px' }}
          flexWrap={{ default: 'nowrap' }}
        >
          <FlexItem>
            <Select
              id="history-type-filter"
              isOpen={isTypeSelectOpen}
              selected={Array.from(selectedTypes)}
              onSelect={(_e, value) => {
                if (value === '__deselect_all__') {
                  setSelectedTypes(new Set());
                } else {
                  handleTypeSelect(value as string);
                }
              }}
              onOpenChange={(open) => setIsTypeSelectOpen(open)}
              toggle={(ref: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={ref}
                  onClick={() => setIsTypeSelectOpen((prev) => !prev)}
                  isExpanded={isTypeSelectOpen}
                  id="history-type-filter-toggle"
                  style={{ whiteSpace: 'nowrap' }}
                  badge={isTypeFiltered ? <Badge isRead id="history-type-badge">{selectedTypes.size}</Badge> : undefined}
                >
                  {typeToggleLabel}
                </MenuToggle>
              )}
            >
              <SelectList id="history-type-filter-list">
                {allTypes.map((type) => (
                  <SelectOption
                    key={type}
                    value={type}
                    hasCheckbox
                    isSelected={selectedTypes.has(type)}
                    id={`history-type-option-${type}`}
                  >
                    <Label isCompact color={typeColorMap[type] || 'grey'} id={`history-type-option-label-${type}`}>
                      {type}
                    </Label>
                  </SelectOption>
                ))}
                <Divider id="history-type-filter-divider" />
                <SelectOption
                  value="__deselect_all__"
                  id="history-type-deselect-all"
                  isDisabled={selectedTypes.size === 0}
                >
                  Deselect all
                </SelectOption>
              </SelectList>
            </Select>
          </FlexItem>
          <FlexItem grow={{ default: 'grow' }}>
            <SearchInput
              placeholder="Filter..."
              value={searchValue}
              onChange={(_e, value) => setSearchValue(value)}
              onClear={() => setSearchValue('')}
              id="history-search"
            />
          </FlexItem>
        </Flex>

        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsCenter' }}
          style={{ marginBottom: '12px' }}
        >
          <FlexItem>
            <Content component="small" id="history-count">
              {filteredEntries.length}{(searchValue.trim() || isTypeFiltered) ? ` of ${entries.length}` : ''} entries
            </Content>
          </FlexItem>
          <FlexItem>
            <Button
              variant="link"
              isInline
              onClick={handleExpandCollapseAll}
              id="history-expand-collapse-btn"
            >
              {expandAll ? 'Collapse all' : 'Expand all'}
            </Button>
          </FlexItem>
        </Flex>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {filteredEntries.length === 0 && (searchValue.trim() || isTypeFiltered) && (
          <Content
            component="p"
            style={{ color: 'var(--pf-t--global--text--color--subtle)', padding: '24px 0', textAlign: 'center' }}
            id="history-no-results"
          >
            No matching entries
          </Content>
        )}

        {groupedEntries.map((group) => {
          const isCollapsed = collapsedDates.has(group.date);

          return (
            <div key={group.date}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleDateGroup(group.date)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleDateGroup(group.date);
                  }
                }}
                id={`history-date-header-${group.date}`}
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1000,
                  backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--pf-t--global--border--color--default)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isCollapsed ? (
                  <AngleRightIcon style={{ color: 'var(--pf-t--global--icon--color--subtle)' }} />
                ) : (
                  <AngleDownIcon style={{ color: 'var(--pf-t--global--icon--color--subtle)' }} />
                )}
                <Content
                  component="p"
                  style={{ fontWeight: 600, margin: 0, fontSize: 'var(--pf-t--global--font--size--body--default)' }}
                  id={`history-date-label-${group.date}`}
                >
                  {formatDate(group.date)}
                </Content>
                <Content
                  component="small"
                  style={{ color: 'var(--pf-t--global--text--color--subtle)', margin: 0 }}
                  id={`history-date-count-${group.date}`}
                >
                  ({group.items.length})
                </Content>
              </div>

              {!isCollapsed && (
                <ProgressStepper
                  isVertical
                  aria-label={`Updates for ${formatDate(group.date)}`}
                  id={`history-timeline-${group.date}`}
                  style={{ paddingTop: '12px', paddingBottom: '8px' }}
                >
                  {group.items.map(({ entry, originalIndex }) => {
                    const variant = typeVariantMap[entry.type] || 'default';

                    return (
                      <ProgressStep
                        key={originalIndex}
                        variant={variant}
                        id={`history-step-${originalIndex}`}
                        titleId={`history-step-title-${originalIndex}`}
                        aria-label={`${entry.type}: ${entry.title}`}
                        description={
                          entry.body ? (
                            <ExpandableSection
                              toggleText={expandedEntries.has(originalIndex) ? 'Hide details' : 'Show details'}
                              isExpanded={expandedEntries.has(originalIndex)}
                              onToggle={() => toggleEntry(originalIndex)}
                              id={`history-step-details-${originalIndex}`}
                            >
                              {renderMarkdownBody(entry.body)}
                            </ExpandableSection>
                          ) : undefined
                        }
                      >
                        <div>
                          <Label
                            isCompact
                            color={typeColorMap[entry.type] || 'grey'}
                            id={`history-step-label-${originalIndex}`}
                            style={{ marginBottom: '2px' }}
                          >
                            {entry.type}
                          </Label>
                          <Content
                            component="p"
                            style={{ margin: 0 }}
                            id={`history-step-text-${originalIndex}`}
                          >
                            {entry.title}
                          </Content>
                        </div>
                      </ProgressStep>
                    );
                  })}
                </ProgressStepper>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryTab;
