import * as React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  Divider,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  LabelGroup,
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalBody,
  ModalFooter,
  ModalVariant,
  PageSection,
  Select,
  SelectGroup,
  SelectList,
  SelectOption,
  Stack,
  StackItem,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Title,
} from '@patternfly/react-core';
import { SearchIcon, TimesIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';
import {
  CapabilityCategory,
  TaskAssistantMenuItem,
  buildTaskAssistantMenuItems,
  categoryInfo,
  taskAssistantExpandedColumnCopy,
  taskAssistantExpandedLinkIds,
} from './homeCapabilitiesData';
/** Replace `src/app/bgimages/task-assistant-section-background.svg` to change the section art. */
import taskAssistantSectionBackground from '../bgimages/task-assistant-section-background.svg';
import taskAssistantAiHubIcon from '../assets/task-assistant-ai-hub-icon.svg';
import taskAssistantDevelopTrainIcon from '../assets/task-assistant-develop-train-icon.svg';
import taskAssistantGenAiStudioIcon from '../assets/task-assistant-gen-ai-studio-icon.svg';
import taskAssistantHeaderIcon from '../assets/task-assistant-clipboard-checklist.png';

const TASK_CARD_ID = 'rhoai-home-task-assistant-card';
const TASK_SELECT_PLACEHOLDER = 'Looking for another task?';
const TASK_SELECT_LIST_ID = 'rhoai-home-task-assistant-typeahead-listbox';
const NO_RESULTS = '__no_results__';

const TASK_ASSISTANT_INTRO =
  'Task Assistant provides personalized entry points based on your workflow. Select a task to get started.';

const TASK_ASSISTANT_SCOPE_LABELS: { category: CapabilityCategory; text: string }[] = [
  { category: 'ai-hub', text: 'Manage models and MCP servers' },
  { category: 'gen-ai', text: 'Test gen AI models and apps' },
  { category: 'develop', text: 'Develop & train models' },
];

const TASK_ASSISTANT_LABEL_OUTLINES: Record<'ai-hub' | 'gen-ai' | 'develop', string> = {
  'ai-hub': '#B6A6E9',
  'gen-ai': '#F8AE54',
  develop: '#9AD8D8',
};

const EXPANDED_CATEGORIES: Array<'ai-hub' | 'gen-ai' | 'develop'> = ['ai-hub', 'gen-ai', 'develop'];

const TASK_ASSISTANT_CARD_ICONS: Record<
  'ai-hub' | 'gen-ai' | 'develop',
  { backgroundColor: string; iconSvg: string; alt: string }
> = {
  'ai-hub': {
    backgroundColor: '#ECE6FF',
    iconSvg: taskAssistantAiHubIcon,
    alt: 'AI hub icon',
  },
  'gen-ai': {
    backgroundColor: '#FFE8CC',
    iconSvg: taskAssistantGenAiStudioIcon,
    alt: 'Gen AI studio icon',
  },
  develop: {
    backgroundColor: '#DBF2F2',
    iconSvg: taskAssistantDevelopTrainIcon,
    alt: 'Develop and train icon',
  },
};

type TaskMenuGroup = {
  category: CapabilityCategory;
  label: string;
  items: TaskAssistantMenuItem[];
};

const TaskAssistantTypeahead: React.FunctionComponent<{
  options: TaskAssistantMenuItem[];
  onChoose: (item: TaskAssistantMenuItem) => void;
}> = ({ options, onChoose }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>('');
  const [inputValue, setInputValue] = React.useState('');
  const [filterValue, setFilterValue] = React.useState('');
  const [focusedItemIndex, setFocusedItemIndex] = React.useState<number | null>(null);
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null);
  const textInputRef = React.useRef<HTMLInputElement>(null);

  const filteredGroups = React.useMemo((): TaskMenuGroup[] => {
    const q = filterValue.trim().toLowerCase();
    return EXPANDED_CATEGORIES.map((category) => {
      const items = options
        .filter((c) => c.category === category)
        .filter((c) => !q || c.title.toLowerCase().includes(q));
      return {
        category,
        label: categoryInfo[category].label,
        items,
      };
    }).filter((g) => g.items.length > 0);
  }, [options, filterValue]);

  const flatOptions = React.useMemo(
    () => filteredGroups.flatMap((g) => g.items),
    [filteredGroups]
  );

  React.useEffect(() => {
    if (filterValue.trim()) {
      setIsOpen(true);
    }
  }, [filterValue]);

  const createItemId = (value: string) =>
    `rhoai-task-typeahead-${String(value).replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  const setActiveAndFocusedItem = (itemIndex: number) => {
    setFocusedItemIndex(itemIndex);
    const cap = flatOptions[itemIndex];
    if (cap) {
      setActiveItemId(createItemId(cap.id));
    }
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

  const runChoose = (itemId: string) => {
    const cap = options.find((c) => c.id === itemId);
    if (cap) {
      onChoose(cap);
    }
    setInputValue('');
    setFilterValue('');
    setSelected('');
    closeMenu();
  };

  const onSelect = (_event: React.MouseEvent | undefined, value: string | number | undefined) => {
    if (value !== undefined && value !== NO_RESULTS) {
      runChoose(String(value));
    }
  };

  const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
    setFilterValue(value);
    resetActiveAndFocusedItem();
    if (value !== selected) {
      setSelected('');
    }
  };

  const handleMenuArrowKeys = (key: string) => {
    if (!flatOptions.length) {
      return;
    }
    let indexToFocus = 0;
    if (!isOpen) {
      setIsOpen(true);
    }
    if (key === 'ArrowUp') {
      if (focusedItemIndex === null || focusedItemIndex === 0) {
        indexToFocus = flatOptions.length - 1;
      } else {
        indexToFocus = focusedItemIndex - 1;
      }
    }
    if (key === 'ArrowDown') {
      if (focusedItemIndex === null || focusedItemIndex === flatOptions.length - 1) {
        indexToFocus = 0;
      } else {
        indexToFocus = focusedItemIndex + 1;
      }
    }
    setActiveAndFocusedItem(indexToFocus);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const focusedCap = focusedItemIndex !== null ? flatOptions[focusedItemIndex] : null;
    switch (event.key) {
      case 'Enter':
        if (isOpen && focusedCap) {
          runChoose(focusedCap.id);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        handleMenuArrowKeys(event.key);
        break;
      default:
        break;
    }
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
    textInputRef.current?.focus();
  };

  const onClearButtonClick = () => {
    setSelected('');
    setInputValue('');
    setFilterValue('');
    resetActiveAndFocusedItem();
    textInputRef.current?.focus();
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      aria-label={TASK_SELECT_PLACEHOLDER}
      onClick={onToggleClick}
      isExpanded={isOpen}
      style={{ width: '17.5rem', minWidth: '17.5rem', maxWidth: '17.5rem' }}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          icon={<SearchIcon />}
          value={inputValue}
          onClick={onInputClick}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          id="rhoai-home-task-assistant-typeahead-input"
          autoComplete="off"
          innerRef={textInputRef}
          placeholder={TASK_SELECT_PLACEHOLDER}
          {...(activeItemId && { 'aria-activedescendant': activeItemId })}
          role="combobox"
          isExpanded={isOpen}
          aria-controls={TASK_SELECT_LIST_ID}
        />
        <TextInputGroupUtilities {...(!inputValue ? { style: { display: 'none' } } : {})}>
          <Button variant="plain" onClick={onClearButtonClick} aria-label="Clear task search" icon={<TimesIcon />} />
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <Select
      id="rhoai-home-task-assistant-typeahead"
      isOpen={isOpen}
      selected={selected}
      onSelect={onSelect}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closeMenu();
        }
      }}
      toggle={toggle}
      variant="typeahead"
      popperProps={{ position: 'end' }}
    >
      {flatOptions.length === 0 ? (
        <SelectList id={TASK_SELECT_LIST_ID}>
          <SelectOption
            isAriaDisabled
            value={NO_RESULTS}
            id={createItemId(NO_RESULTS)}
            isFocused={focusedItemIndex === 0}
          >
            {filterValue.trim()
              ? `No results found for "${filterValue.trim()}"`
              : 'No tasks available'}
          </SelectOption>
        </SelectList>
      ) : (
        filteredGroups.map((group, groupIndex) => (
          <React.Fragment key={group.category}>
            {groupIndex > 0 && <Divider />}
            <SelectGroup label={group.label}>
              <SelectList id={groupIndex === 0 ? TASK_SELECT_LIST_ID : undefined}>
                {group.items.map((cap, itemIndex) => {
                  const globalIndex =
                    filteredGroups.slice(0, groupIndex).reduce((sum, g) => sum + g.items.length, 0) + itemIndex;
                  return (
                    <SelectOption
                      key={cap.id}
                      value={cap.id}
                      id={createItemId(cap.id)}
                      isFocused={focusedItemIndex === globalIndex}
                      ref={null}
                    >
                      {cap.title}
                    </SelectOption>
                  );
                })}
              </SelectList>
            </SelectGroup>
          </React.Fragment>
        ))
      )}
    </Select>
  );
};

const TaskAssistantExpandedColumn: React.FunctionComponent<{
  category: 'ai-hub' | 'gen-ai' | 'develop';
  items: TaskAssistantMenuItem[];
  onTaskClick: (item: TaskAssistantMenuItem) => void;
}> = ({ category, items, onTaskClick }) => {
  const copy = taskAssistantExpandedColumnCopy[category];
  const iconConfig = TASK_ASSISTANT_CARD_ICONS[category];
  return (
    <div className="rhoai-task-assistant-column-card" data-accent={category} data-testid="home-task-assistant-column">
      <div className="rhoai-task-assistant-column-card__accent" aria-hidden />
      <div className="rhoai-task-assistant-column-card__body">
        <Flex
          id={`rhoai-task-assistant-column-${category}-intro`}
          direction={{ default: 'row' }}
          alignItems={{ default: 'alignItemsFlexStart' }}
          gap={{ default: 'gapMd' }}
          className="rhoai-task-assistant-column-card__intro"
          style={{ minWidth: 0 }}
        >
          <FlexItem flex={{ default: 'flexNone' }}>
            <div
              className="rhoai-task-assistant-column-card__icon"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: iconConfig.backgroundColor,
              }}
            >
              <span
                className="rhoai-task-assistant-column-card__icon-mark"
                role="img"
                aria-label={iconConfig.alt}
                dangerouslySetInnerHTML={{ __html: iconConfig.iconSvg }}
              />
            </div>
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: 0 }}>
            <Flex
              id={`rhoai-task-assistant-column-${category}-intro-text`}
              direction={{ default: 'column' }}
              gap={{ default: 'gapXs' }}
              style={{ minWidth: 0 }}
            >
              <Title headingLevel="h4">{copy.heading}</Title>
              <p className="pf-v6-u-font-size-body pf-v6-u-color-200" style={{ margin: 0 }}>
                {copy.description}
              </p>
            </Flex>
          </FlexItem>
        </Flex>
        <Stack hasGutter>
          {items.map((item) => (
            <StackItem key={item.id}>
              <Button variant="link" isInline onClick={() => onTaskClick(item)} className="pf-m-text-align-left">
                {item.title}
              </Button>
            </StackItem>
          ))}
        </Stack>
      </div>
    </div>
  );
};

const TaskAssistantHomeSection: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMessage, setModalMessage] = React.useState('');
  const [isExpanded, setIsExpanded] = React.useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.localStorage.getItem('homeTaskAssistantExpanded') === 'true';
  });

  React.useEffect(() => {
    window.localStorage.setItem('homeTaskAssistantExpanded', String(isExpanded));
  }, [isExpanded]);

  const showModal = React.useCallback((message: string) => {
    setModalMessage(message);
    setIsModalOpen(true);
  }, []);

  const taskMenuItems = React.useMemo(() => buildTaskAssistantMenuItems(showModal), [showModal]);
  const menuById = React.useMemo(() => new Map(taskMenuItems.map((i) => [i.id, i])), [taskMenuItems]);

  const onExpand = React.useCallback((_event: React.MouseEvent, id: string) => {
    if (id === TASK_CARD_ID) {
      setIsExpanded((e) => !e);
    }
  }, []);

  const onChooseTask = React.useCallback(
    (item: TaskAssistantMenuItem) => {
      if (item.onClick) {
        item.onClick();
      } else if (item.path) {
        navigate(item.path);
      }
    },
    [navigate]
  );

  const headerActions = <TaskAssistantTypeahead options={taskMenuItems} onChoose={onChooseTask} />;
  const taskAssistantCardStyle = React.useMemo(
    () =>
      ({
        '--rhoai-task-assistant-illustration': `url(${taskAssistantSectionBackground})`,
      }) as React.CSSProperties,
    []
  );

  const columnItems = React.useCallback(
    (category: 'ai-hub' | 'gen-ai' | 'develop') =>
      taskAssistantExpandedLinkIds[category]
        .map((id) => menuById.get(id))
        .filter((item): item is TaskAssistantMenuItem => Boolean(item)),
    [menuById]
  );

  const onCollapsedLabelClick = React.useCallback(() => {
    setIsExpanded(true);
  }, []);

  const [collapsedLabelCount, setCollapsedLabelCount] = React.useState(3);

  React.useEffect(() => {
    const updateCollapsedLabelCount = () => {
      const width = window.innerWidth;
      if (width < 1200) {
        setCollapsedLabelCount(1);
      } else if (width < 1500) {
        setCollapsedLabelCount(2);
      } else {
        setCollapsedLabelCount(3);
      }
    };

    updateCollapsedLabelCount();
    window.addEventListener('resize', updateCollapsedLabelCount);
    return () => window.removeEventListener('resize', updateCollapsedLabelCount);
  }, []);

  return (
    <>
      <PageSection variant="default" hasBodyWrapper={false} data-testid="home-task-assistant">
        <div className="rhoai-task-assistant-section-root">
          <Card
            id={TASK_CARD_ID}
            className="rhoai-task-assistant-section-card"
            style={taskAssistantCardStyle}
            isExpanded={isExpanded}
          >
            <CardHeader
              onExpand={onExpand}
              actions={{ actions: headerActions }}
              toggleButtonProps={{
                id: 'home-task-assistant-expand',
                'aria-label': 'Task assistant',
                'aria-labelledby': `${TASK_CARD_ID}-title home-task-assistant-expand`,
                'aria-expanded': isExpanded,
              }}
            >
              <Flex
                flexWrap={{ default: 'wrap' }}
                alignItems={{
                  default: isExpanded ? 'alignItemsFlexStart' : 'alignItemsCenter',
                }}
                gap={{ default: isExpanded ? 'gapMd' : 'gapNone' }}
                style={{
                  minWidth: 0,
                  flex: 1,
                  ...(!isExpanded && { columnGap: '32px' }),
                }}
              >
                <FlexItem
                  flex={{ default: isExpanded ? 'flex_1' : 'flexNone' }}
                  style={{ minWidth: isExpanded ? '12rem' : undefined }}
                >
                  <Stack hasGutter={false}>
                    <Flex
                      className="rhoai-task-assistant-header-title-row"
                      alignItems={{ default: 'alignItemsCenter' }}
                      gap={{ default: 'gapSm' }}
                    >
                      <div
                        className="pf-v6-u-display-flex pf-v6-u-align-items-center pf-v6-u-justify-content-center"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: '#f2f2f2',
                          flexShrink: 0,
                        }}
                        aria-hidden
                      >
                        <img
                          src={taskAssistantHeaderIcon}
                          alt=""
                          width={32}
                          height={32}
                          style={{ display: 'block' }}
                        />
                      </div>
                      <CardTitle
                        id={`${TASK_CARD_ID}-title`}
                        component="h2"
                        className="rhoai-home-section-title-md"
                      >
                        Task assistant
                      </CardTitle>
                    </Flex>
                  </Stack>
                </FlexItem>
                {!isExpanded && (
                  <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: 0 }}>
                    <LabelGroup
                      numLabels={collapsedLabelCount}
                      className="rhoai-task-assistant-collapsed-labels"
                      aria-label="Task assistant focus areas"
                    >
                      {TASK_ASSISTANT_SCOPE_LABELS.map(({ category, text }) => (
                        <Label
                          key={category}
                          variant="outline"
                          onClick={(event) => {
                            event.preventDefault();
                            onCollapsedLabelClick();
                          }}
                          icon={
                            <span
                              className="rhoai-task-assistant-collapsed-label__icon"
                              dangerouslySetInnerHTML={{ __html: TASK_ASSISTANT_CARD_ICONS[category].iconSvg }}
                              aria-hidden
                            />
                          }
                          className="rhoai-task-assistant-collapsed-label"
                          style={
                            {
                              '--pf-v6-c-label--m-outline--BorderColor': TASK_ASSISTANT_LABEL_OUTLINES[category],
                              '--pf-v6-c-label--BackgroundColor': 'var(--pf-t--global--background--color--primary--default)',
                            } as React.CSSProperties
                          }
                        >
                          {text}
                        </Label>
                      ))}
                    </LabelGroup>
                  </FlexItem>
                )}
              </Flex>
            </CardHeader>
            <CardExpandableContent>
              <CardBody data-testid="home-task-assistant-capabilities" className="rhoai-task-assistant-capabilities-body">
                {isExpanded && (
                  <p
                    id="rhoai-home-task-assistant-intro"
                    className="pf-v6-u-font-size-body pf-v6-u-color-200 rhoai-task-assistant-header-body"
                  >
                    {TASK_ASSISTANT_INTRO}
                  </p>
                )}
                <Grid hasGutter>
                  {EXPANDED_CATEGORIES.map((cat) => (
                    <GridItem key={cat} lg={3} md={6} sm={12}>
                      <TaskAssistantExpandedColumn
                        category={cat}
                        items={columnItems(cat)}
                        onTaskClick={onChooseTask}
                      />
                    </GridItem>
                  ))}
                </Grid>
              </CardBody>
            </CardExpandableContent>
          </Card>
        </div>
      </PageSection>
      <Modal
        variant={ModalVariant.small}
        title="Page Not Available"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        id="page-not-available-modal-task-assistant"
      >
        <ModalBody>{modalMessage}</ModalBody>
        <ModalFooter>
          <Button key="close" variant="primary" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default TaskAssistantHomeSection;
