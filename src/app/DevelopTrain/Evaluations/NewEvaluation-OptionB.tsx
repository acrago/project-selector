import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  Content,
  ContentVariants,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Flex,
  FlexItem,
  Gallery,
  GalleryItem,
  Label,
  PageSection,
  SearchInput,
  Title,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { Link } from 'react-router-dom';

// Types
interface BenchmarkCard {
  id: string;
  title: string;
  benchmarkName: string;
  category: 'Safety' | 'Capability' | 'Quality';
  description: string;
  tags: string[];
}

interface CollectionCard {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

// Data
const benchmarks: BenchmarkCard[] = [
  {
    id: 'mmlu',
    title: 'MMLU',
    benchmarkName: 'Measuring Massive Multitask Language Understanding',
    category: 'Capability',
    description: 'Tests knowledge across 57 subjects including STEM, humanities, and social sciences.',
    tags: ['Knowledge', 'Multi-domain', 'Academic'],
  },
  {
    id: 'truthfulqa',
    title: 'TruthfulQA',
    benchmarkName: 'TruthfulQA: Measuring How Models Mimic Human Falsehoods',
    category: 'Safety',
    description: 'Evaluates whether a model generates truthful answers to questions that humans might answer falsely.',
    tags: ['Truthfulness', 'Factuality', 'Safety'],
  },
  {
    id: 'gsm8k',
    title: 'GSM8K',
    benchmarkName: 'Grade School Math 8K',
    category: 'Capability',
    description: 'Tests mathematical reasoning with grade school level word problems.',
    tags: ['Math', 'Reasoning', 'Problem-solving'],
  },
  {
    id: 'humaneval',
    title: 'HumanEval',
    benchmarkName: 'Evaluating Large Language Models Trained on Code',
    category: 'Capability',
    description: 'Evaluates code generation capabilities through programming problems.',
    tags: ['Code', 'Programming', 'Problem-solving'],
  },
  {
    id: 'hellaswag',
    title: 'HellaSwag',
    benchmarkName: 'HellaSwag: Can a Machine Really Finish Your Sentence?',
    category: 'Quality',
    description: 'Tests commonsense reasoning about the physical world.',
    tags: ['Common sense', 'Reasoning', 'NLI'],
  },
  {
    id: 'winogrande',
    title: 'WinoGrande',
    benchmarkName: 'WinoGrande: An Adversarial Winograd Schema Challenge',
    category: 'Quality',
    description: 'Tests commonsense reasoning through pronoun resolution problems.',
    tags: ['Common sense', 'Reasoning', 'NLI'],
  },
];

const collections: CollectionCard[] = [
  {
    id: 'open-llm-leaderboard',
    title: 'Open LLM Leaderboard v2',
    description: 'Comprehensive evaluation suite for general-purpose language models.',
    tags: ['General', 'Comprehensive', 'Industry Standard'],
  },
  {
    id: 'safety-fairness',
    title: 'Safety and Fairness',
    description: 'Evaluates model safety, bias, and fairness across diverse scenarios.',
    tags: ['Safety', 'Bias', 'Fairness'],
  },
  {
    id: 'telco-benchmark',
    title: 'Free Open-Telco LLM Benchmark',
    description: 'Specialized benchmarks for telecommunications industry applications.',
    tags: ['Telco', 'Industry', 'Domain-specific'],
  },
  {
    id: 'healthcare',
    title: 'Healthcare Evaluation Collection',
    description: 'Medical and healthcare domain-specific evaluation suite.',
    tags: ['Healthcare', 'Medical', 'Domain-specific'],
  },
  {
    id: 'finance',
    title: 'Finance Evaluation Collections',
    description: 'Financial services and banking domain evaluation suite.',
    tags: ['Finance', 'Banking', 'Domain-specific'],
  },
  {
    id: 'software-engineering',
    title: 'Software Engineering Evaluation Collections',
    description: 'Code generation, debugging, and software development tasks.',
    tags: ['Code', 'Software', 'Engineering'],
  },
  {
    id: 'eu-ai-act',
    title: 'EU AI Act Compliance Evaluation Collection',
    description: 'Compliance testing for EU AI Act requirements.',
    tags: ['Compliance', 'Regulation', 'EU'],
  },
  {
    id: 'toxicity-risk',
    title: 'Toxicity & Risk Evals (WIP)',
    description: 'Evaluates model outputs for toxic, harmful, or risky content.',
    tags: ['Safety', 'Toxicity', 'Risk'],
  },
];

const getCategoryColor = (category: BenchmarkCard['category']): 'blue' | 'orange' | 'grey' | 'yellow' => {
  switch (category) {
    case 'Safety':
      return 'yellow';
    case 'Capability':
      return 'blue';
    case 'Quality':
      return 'orange';
    default:
      return 'grey';
  }
};

const NewEvaluation: React.FunctionComponent = () => {
  const [filterValue, setFilterValue] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<'all' | 'collections' | 'benchmarks'>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<'all' | 'capability' | 'quality' | 'safety'>('all');
  const [selectedItem, setSelectedItem] = React.useState<(BenchmarkCard | CollectionCard) & { type: 'benchmark' | 'collection' } | null>(null);
  const [isDrawerExpanded, setIsDrawerExpanded] = React.useState(false);

  // Clear only sub-filters, keep parent type selection
  const handleClearFilters = () => {
    setFilterValue('');
    setCategoryFilter('all');
  };

  const filteredBenchmarks = benchmarks.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(filterValue.toLowerCase()) ||
      b.benchmarkName.toLowerCase().includes(filterValue.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || b.category.toLowerCase() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredCollections = collections.filter((c) =>
    c.title.toLowerCase().includes(filterValue.toLowerCase())
  );

  // Combine items based on type filter
  const allItems = [
    ...(typeFilter === 'all' || typeFilter === 'collections' ? filteredCollections.map(c => ({ ...c, type: 'collection' as const })) : []),
    ...(typeFilter === 'all' || typeFilter === 'benchmarks' ? filteredBenchmarks.map(b => ({ ...b, type: 'benchmark' as const })) : []),
  ];

  const handleItemClick = (item: typeof allItems[0]) => {
    setSelectedItem(item);
    setIsDrawerExpanded(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerExpanded(false);
  };

  const panelContent = selectedItem && (
    <DrawerPanelContent 
      widths={{ default: 'width_50', xl: 'width_33' }}
    >
      <DrawerHead>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>
            <Label 
              isCompact={false}
              color={selectedItem.type === 'collection' ? 'blue' : 'orange'}
            >
              {selectedItem.type === 'collection' ? 'Evaluation Collection' : 'Standardized Benchmark'}
            </Label>
          </FlexItem>
          <FlexItem>
            <Title headingLevel="h2" size="xl">
              {selectedItem.title}
            </Title>
          </FlexItem>
        </Flex>
        <DrawerActions>
          <DrawerCloseButton onClick={handleDrawerClose} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
          {selectedItem.type === 'benchmark' && 'category' in selectedItem && (
            <FlexItem>
              <Label color={getCategoryColor(selectedItem.category)} isCompact={false}>
                {selectedItem.category}
              </Label>
            </FlexItem>
          )}
          
          {selectedItem.type === 'benchmark' && 'benchmarkName' in selectedItem && (
            <FlexItem>
              <Content component={ContentVariants.h3} style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                Full Name
              </Content>
              <Content component={ContentVariants.p} style={{ color: 'var(--pf-t--global--color--brand--default)' }}>
                {selectedItem.benchmarkName}
              </Content>
            </FlexItem>
          )}

          <FlexItem>
            <Content component={ContentVariants.h3} style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
              Description
            </Content>
            <Content component={ContentVariants.p}>
              {selectedItem.description}
            </Content>
          </FlexItem>

          <FlexItem>
            <Content component={ContentVariants.h3} style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
              Tags
            </Content>
            <Flex spaceItems={{ default: 'spaceItemsXs' }} style={{ flexWrap: 'wrap' }}>
              {selectedItem.tags.map((tag) => (
                <FlexItem key={tag}>
                  <Label isCompact>{tag}</Label>
                </FlexItem>
              ))}
            </Flex>
          </FlexItem>

          <FlexItem>
            <Content component={ContentVariants.h3} style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
              Type
            </Content>
            <Content component={ContentVariants.p}>
              {selectedItem.type === 'collection' ? 'Evaluation Collection' : 'Standardized Benchmark'}
            </Content>
          </FlexItem>

          <FlexItem style={{ marginTop: '24px' }}>
            <Button 
              variant="primary" 
              isBlock
              onClick={() => console.log(`Run ${selectedItem.type}: ${selectedItem.title}`)}
            >
              Start evaluation run
            </Button>
          </FlexItem>
          
          <FlexItem>
            <Button 
              variant="link" 
              isInline
              onClick={() => console.log(`View full details: ${selectedItem.title}`)}
            >
              View full documentation
            </Button>
          </FlexItem>
        </Flex>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Breadcrumb id="new-evaluation-breadcrumb">
          <BreadcrumbItem>
            <Link to="/develop-train/evaluations">Evaluation</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>New Evaluation</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection hasBodyWrapper={false} style={{ paddingBottom: '8px', columnGap: 0, rowGap: 0 }}>
        <Content component={ContentVariants.h1} style={{ marginBottom: '4px' }}>Run an evaluation</Content>
        <Content component={ContentVariants.p}>
          Browse all evaluations or filter by type. Select an evaluation to view details and run.
        </Content>
      </PageSection>
      <PageSection hasBodyWrapper={false} isFilled style={{ paddingBottom: 0 }}>
        <Drawer isExpanded={isDrawerExpanded} onExpand={handleDrawerClose}>
          <DrawerContent panelContent={panelContent}>
            <DrawerContentBody style={{ paddingBottom: 0 }}>
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
                {/* Parent Type Selection */}
                <FlexItem>
                  <ToggleGroup aria-label="Type filter">
                    <ToggleGroupItem
                      text="All"
                      buttonId="type-all"
                      isSelected={typeFilter === 'all'}
                      onChange={() => {
                        setTypeFilter('all');
                        setCategoryFilter('all'); // Reset category when changing type
                      }}
                    />
                    <ToggleGroupItem
                      text="Collections"
                      buttonId="type-collections"
                      isSelected={typeFilter === 'collections'}
                      onChange={() => {
                        setTypeFilter('collections');
                        setCategoryFilter('all'); // Reset category when changing type
                      }}
                    />
                    <ToggleGroupItem
                      text="Benchmarks"
                      buttonId="type-benchmarks"
                      isSelected={typeFilter === 'benchmarks'}
                      onChange={() => setTypeFilter('benchmarks')}
                    />
                  </ToggleGroup>
                </FlexItem>

                {/* Search + Conditional Filters */}
                <FlexItem>
                  <Flex spaceItems={{ default: 'spaceItemsMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <SearchInput
                        placeholder={
                          typeFilter === 'collections' ? 'Search collections...' :
                          typeFilter === 'benchmarks' ? 'Search benchmarks...' :
                          'Search evaluations...'
                        }
                        value={filterValue}
                        onChange={(_event, value) => setFilterValue(value)}
                        onClear={() => setFilterValue('')}
                        id="evaluation-search"
                        style={{ width: '300px' }}
                      />
                    </FlexItem>
                    
                    {/* Child Filters - Only show for Benchmarks */}
                    {typeFilter === 'benchmarks' && (
                      <FlexItem>
                        <ToggleGroup aria-label="Category filter">
                          <ToggleGroupItem
                            text="All"
                            buttonId="category-all"
                            isSelected={categoryFilter === 'all'}
                            onChange={() => setCategoryFilter('all')}
                          />
                          <ToggleGroupItem
                            text="Capability"
                            buttonId="category-capability"
                            isSelected={categoryFilter === 'capability'}
                            onChange={() => setCategoryFilter('capability')}
                          />
                          <ToggleGroupItem
                            text="Quality"
                            buttonId="category-quality"
                            isSelected={categoryFilter === 'quality'}
                            onChange={() => setCategoryFilter('quality')}
                          />
                          <ToggleGroupItem
                            text="Safety"
                            buttonId="category-safety"
                            isSelected={categoryFilter === 'safety'}
                            onChange={() => setCategoryFilter('safety')}
                          />
                        </ToggleGroup>
                      </FlexItem>
                    )}
                    
                    {/* Clear Filters Button */}
                    {(filterValue || categoryFilter !== 'all') && (
                      <FlexItem>
                        <Button 
                          variant="link" 
                          isInline
                          onClick={handleClearFilters}
                        >
                          Clear filters
                        </Button>
                      </FlexItem>
                    )}
                  </Flex>
                </FlexItem>

                {/* Active Filters Breadcrumb */}
                <FlexItem>
                  <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <Content component={ContentVariants.p} style={{ fontSize: '14px', color: '#6a6e73' }}>
                        Showing: <strong>
                          {typeFilter === 'all' ? 'All Evaluations' : 
                           typeFilter === 'collections' ? 'Collections' : 
                           'Benchmarks'}
                        </strong>
                        {typeFilter === 'benchmarks' && categoryFilter !== 'all' && (
                          <> → <strong style={{ color: 'var(--pf-t--global--color--brand--default)' }}>
                            {categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}
                          </strong></>
                        )}
                        {filterValue && (
                          <> → Search: "<strong>{filterValue}</strong>"</>
                        )}
                      </Content>
                    </FlexItem>
                    <FlexItem>
                      <Content component={ContentVariants.p} style={{ fontSize: '14px', color: '#6a6e73' }}>
                        ({allItems.length} {allItems.length === 1 ? 'result' : 'results'})
                      </Content>
                    </FlexItem>
                  </Flex>
                </FlexItem>

                <FlexItem>
                  {allItems.length > 0 ? (
                    <Gallery hasGutter minWidths={{ default: '280px' }} maxWidths={{ default: '100%', md: '48%', lg: '24%', xl: '24%' }}>
                      {allItems.map((item) => {
                        return (
                          <GalleryItem key={item.id}>
                            <Card
                              id={`${item.type}-${item.id}`}
                              isClickable
                              isSelectable
                              isSelected={selectedItem?.id === item.id}
                              onClick={() => handleItemClick(item)}
                              style={{ 
                                height: '100%', 
                                cursor: 'pointer',
                                border: selectedItem?.id === item.id ? '2px solid var(--pf-t--global--color--brand--default)' : '1px solid #d2d2d2',
                                borderRadius: '16px'
                              }}
                            >
                              <CardBody>
                                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                                  <FlexItem>
                                    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                                      {item.type === 'benchmark' && 'category' in item && (
                                        <FlexItem>
                                          <Label color={getCategoryColor(item.category)}>{item.category}</Label>
                                        </FlexItem>
                                      )}
                                      <FlexItem>
                                        <Label 
                                          isCompact 
                                          color={item.type === 'collection' ? 'blue' : 'orange'}
                                        >
                                          {item.type === 'collection' ? 'Collection' : 'Benchmark'}
                                        </Label>
                                      </FlexItem>
                                    </Flex>
                                  </FlexItem>
                                  <FlexItem>
                                    <Content component={ContentVariants.h4} style={{ marginBottom: '4px', fontWeight: 600 }}>
                                      {item.title}
                                    </Content>
                                  </FlexItem>
                                  <FlexItem>
                                    <Content component={ContentVariants.p} style={{ fontSize: '13px', color: '#6a6e73', marginBottom: '8px' }}>
                                      {item.description.length > 100 ? `${item.description.substring(0, 100)}...` : item.description}
                                    </Content>
                                  </FlexItem>
                                  <FlexItem>
                                    <Flex spaceItems={{ default: 'spaceItemsXs' }} style={{ flexWrap: 'wrap' }}>
                                      {item.tags.slice(0, 3).map((tag) => (
                                        <FlexItem key={tag}>
                                          <Label isCompact>{tag}</Label>
                                        </FlexItem>
                                      ))}
                                      {item.tags.length > 3 && (
                                        <FlexItem>
                                          <Label isCompact>+{item.tags.length - 3}</Label>
                                        </FlexItem>
                                      )}
                                    </Flex>
                                  </FlexItem>
                                </Flex>
                              </CardBody>
                            </Card>
                          </GalleryItem>
                        );
                      })}
                    </Gallery>
                  ) : (
                    <Card>
                      <CardBody>
                        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }} alignItems={{ default: 'alignItemsCenter' }} style={{ padding: '48px 24px', textAlign: 'center' }}>
                          <FlexItem>
                            <Content component={ContentVariants.h3} style={{ color: '#6a6e73' }}>
                              No results found
                            </Content>
                          </FlexItem>
                          <FlexItem>
                            <Content component={ContentVariants.p} style={{ color: '#6a6e73' }}>
                              {filterValue ? (
                                <>No {typeFilter === 'all' ? 'evaluations' : typeFilter} match your search "{filterValue}".</>
                              ) : categoryFilter !== 'all' ? (
                                <>No {categoryFilter} benchmarks found.</>
                              ) : (
                                <>No evaluations available.</>
                              )}
                            </Content>
                          </FlexItem>
                          {(filterValue || categoryFilter !== 'all') && (
                            <FlexItem>
                              <Button variant="link" onClick={handleClearFilters}>
                                Clear filters
                              </Button>
                            </FlexItem>
                          )}
                        </Flex>
                      </CardBody>
                    </Card>
                  )}
                </FlexItem>
              </Flex>
            </DrawerContentBody>
          </DrawerContent>
        </Drawer>
      </PageSection>
    </>
  );
};

export { NewEvaluation };
