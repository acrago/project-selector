import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
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
  MenuToggle,
  PageSection,
  Pagination,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, FilterIcon } from '@patternfly/react-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export interface Benchmark {
  name: string;
  description: string;
  link?: string;
}

export interface CollectionCard {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  benchmarks: Benchmark[];
  framework?: string;
}

const getCategoryColor = (category: string): 'blue' | 'orange' | 'grey' | 'yellow' | 'green' | 'purple' | 'teal' => {
  switch (category) {
    case 'General':
      return 'blue';
    case 'Safety':
      return 'yellow';
    case 'Healthcare':
      return 'green';
    case 'Finance':
      return 'purple';
    case 'Code':
      return 'teal';
    case 'Compliance':
      return 'orange';
    case 'Telco':
      return 'blue';
    default:
      return 'grey';
  }
};

export const collections: CollectionCard[] = [
  {
    id: 'open-llm-leaderboard',
    title: 'Open LLM Leaderboard v2',
    description: 'Comprehensive evaluation suite for general-purpose language models.',
    category: 'General',
    tags: ['Comprehensive', 'Industry Standard'],
    framework: 'LM Evaluation Harness or LightEval',
    benchmarks: [
      {
        name: 'IFEval',
        description: 'Tests a model\'s ability to follow explicit formatting instructions like "include keyword x" or "use format y." Focuses on adherence to instructions rather than content quality.',
        link: 'https://arxiv.org/abs/2311.07911'
      },
      {
        name: 'Big-bench hard',
        description: '23 challenging tasks from BIG-Bench where language models previously didn\'t outperform average human raters. Tests multi-step reasoning capabilities (3-shot, multiple choice).',
        link: 'https://arxiv.org/abs/2210.09261'
      },
      {
        name: 'GPQA',
        description: '448 expert-written questions in biology, physics, and chemistry. Designed to be extremely difficult - even PhD experts achieve only 65% accuracy (0-shot, multiple choice).',
        link: 'https://arxiv.org/abs/2311.12022'
      },
      {
        name: 'MMLU-Pro',
        description: 'Enhanced version of MMLU with 10 answer choices instead of 4, expert-reviewed to reduce noise, and more challenging questions (5-shot, multiple choice).',
        link: 'https://arxiv.org/abs/2406.01574'
      },
      {
        name: 'MuSR',
        description: 'Complex ~1,000-word problems including murder mysteries, object placement, and team allocation. Tests reasoning with long-range context parsing (0-shot, multiple choice).',
        link: 'https://arxiv.org/abs/2310.16049'
      },
      {
        name: 'Math-lvl-5',
        description: 'Advanced mathematical reasoning tasks (4-shot, generative, Minerva version).',
        link: 'https://arxiv.org/abs/2206.14858'
      }
    ]
  },
  {
    id: 'safety-fairness',
    title: 'Safety and fairness',
    description: 'Evaluates model safety, bias, and fairness across diverse scenarios.',
    category: 'Safety',
    tags: ['Bias', 'Fairness'],
    benchmarks: [
      {
        name: 'truthfulqa_mc1',
        description: 'Tests whether models give truthful answers to questions where humans often answer incorrectly due to misconceptions. Questions cover health, law, conspiracies, and fiction vs. reality.',
        link: 'https://arxiv.org/abs/2109.07958'
      },
      {
        name: 'toxigen',
        description: 'Measures a model\'s propensity to generate toxic or hateful content, particularly implicit hate speech targeting marginalized groups (13 minority groups).',
        link: 'https://arxiv.org/abs/2203.09509'
      },
      {
        name: 'winogender',
        description: 'Evaluates gender bias in pronoun resolution using sentences with occupations and gender-ambiguous pronouns to test stereotypical associations.',
        link: 'https://arxiv.org/abs/1804.09301'
      },
      {
        name: 'crows_pairs_english',
        description: 'Measures stereotypical biases across 9 categories including race, gender, sexual orientation, religion, age, nationality, disability, physical appearance, and socioeconomic status.',
        link: 'https://arxiv.org/abs/2010.00133'
      },
      {
        name: 'BBQ',
        description: 'Tests social biases in question answering contexts with both ambiguous and disambiguated contexts, measuring whether models make biased assumptions.',
        link: 'https://arxiv.org/abs/2110.08193'
      },
      {
        name: 'ETHICS',
        description: 'Tests whether models can make basic moral judgments about everyday scenarios - distinguishing right from wrong in common situations.',
        link: 'https://arxiv.org/abs/2008.02275'
      }
    ]
  },
  {
    id: 'telco-benchmark',
    title: 'Free open-telco LLM benchmark',
    description: 'Specialized benchmarks for telecommunications industry applications.',
    category: 'Telco',
    tags: ['Industry', 'Domain-specific'],
    benchmarks: [
      {
        name: 'TeleYAML',
        description: 'Translates operator intents into standards-aligned YAML configurations. Focus: 5G Core functions, subscriber provisioning, network slicing. Current Performance: <30% for top models.',
        link: 'https://arxiv.org/abs/2409.16314'
      },
      {
        name: 'TeleLogs',
        description: 'Root-Cause Analysis (RCA) on 5G network data. Focus: Fault detection, diagnosis, real-time fixes. Top Score: 80.00 (GPT-5).',
        link: 'https://arxiv.org/abs/2409.16314'
      },
      {
        name: 'TeleMath',
        description: 'Quantitative engineering calculations for telecom-specific mathematical problem-solving under network constraints.',
        link: 'https://arxiv.org/abs/2409.16314'
      },
      {
        name: '3GPP-TSG',
        description: 'Understanding 3GPP technical documentation. Focus: Classifying and interpreting telecom standards from 3GPP/ETSI/ITU.',
        link: 'https://arxiv.org/abs/2409.16314'
      },
      {
        name: 'TeleQnA',
        description: 'Telecom domain knowledge assessment with multiple-choice questions on standards, research, and technical topics. Top Score: 82.51 (GPT-5).',
        link: 'https://arxiv.org/abs/2409.16314'
      }
    ]
  },
  {
    id: 'healthcare',
    title: 'Healthcare evaluation collection',
    description: 'Medical and healthcare domain-specific evaluation suite.',
    category: 'Healthcare',
    tags: ['Medical', 'Domain-specific'],
    framework: 'LM Evaluation Harness, RAGAS, LightEval, DeepEval, Garak',
    benchmarks: [
      {
        name: 'MedQA',
        description: 'Medical licensing exam questions covering pathology, pharmacology, clinical reasoning.',
        link: 'https://arxiv.org/abs/2009.13081'
      },
      {
        name: 'MedMCQA',
        description: 'Indian medical entrance exam questions for medical knowledge assessment.',
        link: 'https://arxiv.org/abs/2203.14371'
      },
      {
        name: 'PubMedQA',
        description: 'Biomedical literature comprehension and question answering from PubMed abstracts.',
        link: 'https://arxiv.org/abs/1909.06146'
      },
      {
        name: 'MMLU Medical Subtasks',
        description: 'Medical knowledge across anatomy, clinical knowledge, college biology/medicine, medical genetics, professional medicine, and virology.'
      },
      {
        name: 'Clinical Case Reasoning',
        description: 'Differential diagnosis reasoning, treatment protocol adherence, and medical terminology understanding.'
      },
      {
        name: 'HIPAA Compliance Testing',
        description: 'Privacy protection probes for PII/PHI detection, de-identification validation, and access control.'
      }
    ]
  },
  {
    id: 'finance',
    title: 'Finance evaluation collections',
    description: 'Financial services and banking domain evaluation suite.',
    category: 'Finance',
    tags: ['Banking', 'Domain-specific'],
    framework: 'LM Evaluation Harness, RAGAS, LightEval, DeepEval, Garak',
    benchmarks: [
      {
        name: 'MMLU Finance Subtasks',
        description: 'Knowledge assessment in accounting, business ethics, econometrics, macroeconomics, microeconomics, professional accounting, and finance theory.'
      },
      {
        name: 'CFA Practice Questions',
        description: 'Chartered Financial Analyst practice questions covering portfolio theory, derivatives, and corporate finance.'
      },
      {
        name: 'Financial Statement Analysis',
        description: 'Balance sheet interpretation, income statement analysis, cash flow assessment, and ratio analysis.'
      },
      {
        name: 'SEC & FINRA Compliance',
        description: 'Regulation Best Interest (Reg BI), Know Your Customer (KYC), Anti-Money Laundering (AML), and suitability requirements.'
      },
      {
        name: 'Credit Risk Assessment',
        description: 'Corporate credit risk assessment, covenant analysis, default probability estimation with fairness testing.'
      },
      {
        name: 'Market Manipulation Detection',
        description: 'Detection of pump-and-dump schemes, wash trading, spoofing, and insider trading patterns.'
      }
    ]
  },
  {
    id: 'software-engineering',
    title: 'Software engineering evaluation collections',
    description: 'Code generation, debugging, and software development tasks.',
    category: 'Code',
    tags: ['Software', 'Engineering'],
    framework: 'LM Evaluation Harness, LightEval, DeepEval, Garak',
    benchmarks: [
      {
        name: 'HumanEval',
        description: '164 Python programming problems testing function completion and code generation.',
        link: 'https://arxiv.org/abs/2107.03374'
      },
      {
        name: 'MBPP',
        description: '974 Python programming tasks for basic to intermediate programming challenges.',
        link: 'https://arxiv.org/abs/2108.07732'
      },
      {
        name: 'APPS',
        description: '10,000 programming problems from coding competitions testing algorithmic problem-solving.',
        link: 'https://arxiv.org/abs/2105.09938'
      },
      {
        name: 'DS-1000',
        description: 'Data science code generation for NumPy, Pandas, PyTorch, and other data science libraries.',
        link: 'https://arxiv.org/abs/2211.11501'
      },
      {
        name: 'SWE-bench',
        description: 'Real-world software engineering tasks from GitHub issues requiring bug fixes and feature implementation.',
        link: 'https://arxiv.org/abs/2310.06770'
      },
      {
        name: 'Security Vulnerability Detection',
        description: 'OWASP Top 10 compliance testing including SQL injection, XSS, authentication issues, and cryptographic vulnerabilities.'
      }
    ]
  },
  {
    id: 'eu-ai-act',
    title: 'EU AI Act compliance evaluation collection',
    description: 'Compliance testing for EU AI Act requirements.',
    category: 'Compliance',
    tags: ['Regulation', 'EU'],
    framework: 'LM Evaluation Harness, LightEval, RAGAS, DeepEval, Garak, NeMo Guardrails',
    benchmarks: [
      {
        name: 'Multilingual MMLU',
        description: 'Knowledge assessment across 57 subjects in 23+ EU official languages (tier 1: ≥95%, tier 2: ≥85%, tier 3: ≥75% accuracy).'
      },
      {
        name: 'XQuAD',
        description: 'Cross-lingual question answering in 11 languages testing comprehension and reasoning.',
        link: 'https://arxiv.org/abs/1910.11856'
      },
      {
        name: 'XNLI',
        description: 'Cross-lingual natural language inference in 15 languages.',
        link: 'https://arxiv.org/abs/1809.05053'
      },
      {
        name: 'Faithfulness',
        description: 'Cross-lingual fact verification and source attribution with 90% threshold across all EU languages.'
      },
      {
        name: 'Toxicity Detection',
        description: 'Offensive content identification per language with <2% toxicity rate requirement.'
      },
      {
        name: 'Bias Evaluation',
        description: 'Demographic bias testing (gender, age, nationality) with <5% bias requirement across all languages.'
      },
      {
        name: 'Security Testing',
        description: 'Prompt injection defense (95% resistance), jailbreak defense (98%), and data leakage prevention (99%).'
      }
    ]
  },
  {
    id: 'toxicity-risk',
    title: 'Toxicity & risk evals (WIP)',
    description: 'Evaluates model outputs for toxic, harmful, or risky content.',
    category: 'Safety',
    tags: ['Toxicity', 'Risk'],
    framework: 'LightEval, LM Eval Harness, DeepEval, Garak',
    benchmarks: [
      {
        name: 'TruthfulQA',
        description: 'Evaluates how well LLMs generate truthful responses and detect human misconceptions.',
        link: 'https://arxiv.org/abs/2109.07958'
      },
      {
        name: 'ToxiGen',
        description: 'Tests how well LLMs distinguish between toxic and benign statements and detect hate speech.',
        link: 'https://arxiv.org/abs/2203.09509'
      },
      {
        name: 'HHH',
        description: 'Tests alignment with ethical values in different interaction scenarios.',
        link: 'https://arxiv.org/abs/2204.05862'
      },
      {
        name: 'AdvBench',
        description: 'Tests resistance to adversarial inputs and jailbreaking attempts.',
        link: 'https://arxiv.org/abs/2307.15043'
      },
      {
        name: 'RealToxicityPrompts',
        description: 'Assesses responses to naturally occurring text prompts that might lead to toxic outputs.',
        link: 'https://arxiv.org/abs/2009.11462'
      },
      {
        name: 'DoNotAnswer',
        description: 'Tests ability to recognize and refuse harmful, unethical, or dangerous requests.',
        link: 'https://arxiv.org/abs/2308.13387'
      }
    ]
  },
];

const EvaluationCollections: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const _evaluationContext = location.state as { evaluationName?: string; endpoint?: string; offlineUri?: string } | null;
  const [filterValue, setFilterValue] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [isCategoryOpen, setIsCategoryOpen] = React.useState(false);
  const [selectedCollection, setSelectedCollection] = React.useState<CollectionCard | null>(null);
  const [isDrawerExpanded, setIsDrawerExpanded] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(24);
  
  const filteredCollections = collections.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(filterValue.toLowerCase()) ||
      c.description.toLowerCase().includes(filterValue.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || c.category.toLowerCase() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const paginatedCollections = filteredCollections.slice((page - 1) * perPage, page * perPage);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setPage(1);
  }, [filterValue, categoryFilter]);

  const onSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
    setPage(newPage);
  };

  const onPerPageSelect = (
    _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    newPerPage: number,
    newPage: number
  ) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const handleCollectionClick = (collection: CollectionCard) => {
    setSelectedCollection(collection);
    setIsDrawerExpanded(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerExpanded(false);
  };

  const handleRunCollection = (collection: CollectionCard) => {
    setIsDrawerExpanded(false);
    navigate('/develop-train/evaluations/run', { state: { runType: 'collection', item: collection } });
  };

  const panelContent = (
    <DrawerPanelContent isResizable defaultSize="500px" minSize="400px">
      <DrawerHead>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>
            <Label color={selectedCollection ? getCategoryColor(selectedCollection.category) : 'grey'} style={{ fontSize: '12px', padding: '2px 10px' }}>
              {selectedCollection?.category}
            </Label>
          </FlexItem>
          <FlexItem>
            <Title headingLevel="h2" size="xl">
              {selectedCollection?.title}
            </Title>
          </FlexItem>
        </Flex>
        <DrawerActions>
          <DrawerCloseButton onClick={handleDrawerClose} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '16px' }}>
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
            <FlexItem>
              <DescriptionList isCompact>
                <DescriptionListGroup>
                  <DescriptionListTerm>Description</DescriptionListTerm>
                  <DescriptionListDescription>
                    {selectedCollection?.description}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                {selectedCollection?.framework && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Framework</DescriptionListTerm>
                    <DescriptionListDescription>
                      {selectedCollection.framework}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
              </DescriptionList>
            </FlexItem>
            <FlexItem>
              <Title headingLevel="h3" size="md" style={{ marginBottom: '12px' }}>
                Benchmarks
              </Title>
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
                {selectedCollection?.benchmarks.map((benchmark, index) => (
                  <FlexItem key={index}>
                    <Card isCompact style={{ border: 'none' }}>
                      <CardBody>
                        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                          <FlexItem>
                            <Content component={ContentVariants.p} style={{ fontWeight: 400, marginBottom: '4px', fontSize: '14px' }}>
                              {benchmark.link ? (
                                <a 
                                  href={benchmark.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ color: 'var(--pf-t--global--color--brand--default)', textDecoration: 'none', fontSize: '14px', fontWeight: 400 }}
                                >
                                  {benchmark.name} <ExternalLinkAltIcon style={{ fontSize: '12px', marginLeft: '4px' }} />
                                </a>
                              ) : (
                                benchmark.name
                              )}
                            </Content>
                          </FlexItem>
                          <FlexItem>
                            <Content component={ContentVariants.p} style={{ fontSize: '13px', color: '#6a6e73' }}>
                              {benchmark.description}
                            </Content>
                          </FlexItem>
                        </Flex>
                      </CardBody>
                    </Card>
                  </FlexItem>
                ))}
              </Flex>
            </FlexItem>
          </Flex>
        </div>
        <div style={{ 
          position: 'sticky', 
          bottom: 0, 
          backgroundColor: '#fff', 
          padding: '16px 0',
          borderTop: '1px solid #d2d2d2',
          marginTop: 'auto'
        }}>
          <Button 
            variant="primary" 
            onClick={() => selectedCollection && handleRunCollection(selectedCollection)}
            style={{ marginTop: '12px' }}
          >
            Run this benchmark suite
          </Button>
        </div>
      </DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <>
    <Drawer isExpanded={isDrawerExpanded}>
      <DrawerContent panelContent={panelContent}>
        <DrawerContentBody>
          <PageSection hasBodyWrapper={false}>
        <Breadcrumb id="collections-breadcrumb">
          <BreadcrumbItem>
            <Link to="/develop-train/evaluations">Evaluation</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to="/develop-train/evaluations/new">New Evaluation</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Collections</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection hasBodyWrapper={false} style={{ paddingBottom: '8px', columnGap: 0, rowGap: 0 }}>
        <Content component={ContentVariants.h1} style={{ marginBottom: '4px' }}>Select benchmark suite</Content>
        <Content component={ContentVariants.p}>
          Select a benchmark suite to run on your model or agent.
        </Content>
      </PageSection>
      <PageSection hasBodyWrapper={false} style={{ paddingBottom: '24px' }}>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
          <FlexItem>
            <Flex spaceItems={{ default: 'spaceItemsMd' }} alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
              <Flex spaceItems={{ default: 'spaceItemsMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>
                  <SearchInput
                    placeholder="Filter by name"
                    value={filterValue}
                    onChange={(_event, value) => setFilterValue(value)}
                    onClear={() => setFilterValue('')}
                    id="collection-search"
                    style={{ width: '250px' }}
                  />
                </FlexItem>
                <FlexItem>
                  <Select
                    id="category-filter"
                    isOpen={isCategoryOpen}
                    selected={categoryFilter}
                    onSelect={(_event, value) => {
                      setCategoryFilter(value as string);
                      setIsCategoryOpen(false);
                    }}
                    onOpenChange={(isOpen) => setIsCategoryOpen(isOpen)}
                    toggle={(toggleRef) => (
                      <MenuToggle 
                        ref={toggleRef} 
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)} 
                        isExpanded={isCategoryOpen}
                        icon={<FilterIcon />}
                      >
                        {categoryFilter === 'all' ? 'Industry' : categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}
                      </MenuToggle>
                    )}
                  >
                    <SelectList>
                      <SelectOption value="all">All industries</SelectOption>
                      <SelectOption value="general">General</SelectOption>
                      <SelectOption value="safety">Safety</SelectOption>
                      <SelectOption value="healthcare">Healthcare</SelectOption>
                      <SelectOption value="finance">Finance</SelectOption>
                      <SelectOption value="code">Code</SelectOption>
                      <SelectOption value="compliance">Compliance</SelectOption>
                      <SelectOption value="telco">Telco</SelectOption>
                    </SelectList>
                  </Select>
                </FlexItem>
              </Flex>
              <FlexItem>
                <Pagination
                  itemCount={filteredCollections.length}
                  perPage={perPage}
                  page={page}
                  onSetPage={onSetPage}
                  onPerPageSelect={onPerPageSelect}
                  variant="top"
                  perPageOptions={[
                    { title: '12', value: 12 },
                    { title: '24', value: 24 },
                    { title: '48', value: 48 },
                    { title: '96', value: 96 }
                  ]}
                />
              </FlexItem>
            </Flex>
          </FlexItem>
          <Gallery hasGutter minWidths={{ default: '280px', md: '320px', lg: '300px', xl: '320px' }}>
            {paginatedCollections.map((collection) => (
              <GalleryItem key={collection.id}>
                <Card
                  id={`collection-${collection.id}`}
                  style={{ 
                    height: '100%',
                    borderRadius: '16px'
                  }}
                >
                    <CardBody style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <Label color={getCategoryColor(collection.category)} style={{ fontSize: '12px', padding: '2px 10px' }}>
                          {collection.category}
                        </Label>
                      </div>
                      <div style={{ flex: 1 }}>
                        <Content 
                          component={ContentVariants.h4} 
                          style={{ 
                            marginBottom: '4px', 
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: 'var(--pf-t--global--color--brand--default)'
                          }}
                          onClick={() => handleCollectionClick(collection)}
                        >
                          {collection.title}
                        </Content>
                        <Content component={ContentVariants.p} style={{ fontSize: '13px', color: '#6a6e73', fontWeight: 500, marginBottom: '8px' }}>
                          {collection.benchmarks.length} {collection.benchmarks.length === 1 ? 'benchmark' : 'benchmarks'}
                        </Content>
                        <Content component={ContentVariants.p} style={{ fontSize: '13px', color: '#6a6e73' }}>
                          {collection.description}
                        </Content>
                      </div>
                      <div style={{ marginTop: '12px' }}>
                        <Button 
                          variant="secondary" 
                          id={`run-collection-${collection.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRunCollection(collection);
                          }}
                        >
                          Run this benchmark suite
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
              </GalleryItem>
            ))}
          </Gallery>
          <FlexItem>
            <Pagination
              itemCount={filteredCollections.length}
              perPage={perPage}
              page={page}
              onSetPage={onSetPage}
              onPerPageSelect={onPerPageSelect}
              variant="bottom"
              perPageOptions={[
                { title: '12', value: 12 },
                { title: '24', value: 24 },
                { title: '48', value: 48 },
                { title: '96', value: 96 }
              ]}
            />
          </FlexItem>
        </Flex>
      </PageSection>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
    </>
  );
};

export { EvaluationCollections };
