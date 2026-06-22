import * as React from 'react';
import {
  Button,
  Content,
  ContentVariants,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Flex,
  FlexItem,
  Icon,
  Label,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  PageSection,
  Pagination,
  Progress,
  ProgressMeasureLocation,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import CubesIcon from '@patternfly/react-icons/dist/esm/icons/cubes-icon';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import FilterIcon from '@patternfly/react-icons/dist/esm/icons/filter-icon';
import PendingIcon from '@patternfly/react-icons/dist/esm/icons/pending-icon';
import { ActionsColumn, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import InProgressIcon from '@patternfly/react-icons/dist/esm/icons/in-progress-icon';
import HourglassHalfIcon from '@patternfly/react-icons/dist/esm/icons/hourglass-half-icon';
import BanIcon from '@patternfly/react-icons/dist/esm/icons/ban-icon';
import evalIcon from '@app/assets/eval-icon.png';

// Add spinning animation
const spinAnimation = `
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`;

// Inject the animation into the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = spinAnimation;
  if (!document.head.querySelector('style[data-spin-animation]')) {
    styleSheet.setAttribute('data-spin-animation', 'true');
    document.head.appendChild(styleSheet);
  }
}

interface ProgressStep {
  name: string;
  status: 'in-progress' | 'pending' | 'completed';
}

interface EvaluationRun {
  id: string;
  name: string;
  type: 'Benchmark' | 'Collection';
  evaluated: string;
  collectionOrBenchmark?: string;
  status: 'Pending' | 'Running' | 'Complete' | 'Failed' | 'Canceling' | 'Canceled';
  result: string;
  dateRan: Date;
  progressStep?: string;
  detailedProgress?: {
    currentStep: number;
    totalSteps: number;
    elapsedTime: number;
    steps: ProgressStep[];
  };
}

const randomResult = (): string => `${Math.floor(Math.random() * 21) + 80}%`;

const evaluationRuns: EvaluationRun[] = [
  {
    id: '1',
    name: 'GPT-4 Safety Assessment',
    type: 'Benchmark' as const,
    evaluated: 'gpt-4-turbo',
    status: 'Complete' as const,
    result: randomResult(),
    dateRan: new Date('2026-02-05'),
  },
  {
    id: '2',
    name: 'Healthcare Compliance Suite',
    type: 'Collection' as const,
    evaluated: 'llama-3-70b',
    status: 'Complete' as const,
    result: randomResult(),
    dateRan: new Date('2026-02-04'),
  },
  {
    id: '4',
    name: 'MMLU Comprehensive',
    type: 'Benchmark' as const,
    evaluated: 'claude-3-opus',
    status: 'Complete' as const,
    result: randomResult(),
    dateRan: new Date('2026-02-03'),
  },
  {
    id: '5',
    name: 'Toxicity Detection',
    type: 'Benchmark' as const,
    evaluated: 'gpt-3.5-turbo',
    status: 'Failed' as const,
    result: 'Error',
    dateRan: new Date('2026-02-01'),
  },
].sort((a, b) => b.dateRan.getTime() - a.dateRan.getTime());

const Evaluations: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProjectSelectOpen, setIsProjectSelectOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<string>('Project A');
  const [isFilterSelectOpen, setIsFilterSelectOpen] = React.useState(false);
  const [filterAttribute, setFilterAttribute] = React.useState<string>('Name');
  const [filterValue, setFilterValue] = React.useState<string>('');
  const [isStatusFilterOpen, setIsStatusFilterOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  
  const getStoredResult = (runId: string, fallback: string): string => {
    try {
      const storedResults = localStorage.getItem(`evaluationResults_${runId}`);
      if (storedResults) {
        const benchmarks = JSON.parse(storedResults);
        if (benchmarks.length > 0) {
          const avg = Math.round(benchmarks.reduce((sum: number, b: any) => sum + b.score, 0) / benchmarks.length);
          return `${avg}%`;
        }
      }
    } catch {
      // fall through
    }
    return fallback;
  };

  const migrateStatus = (status: string): EvaluationRun['status'] => {
    const statusMap: Record<string, EvaluationRun['status']> = {
      'Completed': 'Complete',
      'In progress': 'Running',
      'Stopping': 'Canceling',
      'Stopped': 'Canceled',
    };
    return statusMap[status] || (status as EvaluationRun['status']);
  };

  // Load runs from localStorage or use default data, always sorted by date (newest first)
  const loadRuns = (): EvaluationRun[] => {
    let loaded: EvaluationRun[];
    try {
      const saved = localStorage.getItem('evaluationRuns');
      if (saved) {
        const parsed = JSON.parse(saved);
        loaded = parsed.map((run: any) => ({
          ...run,
          dateRan: new Date(run.dateRan),
          status: migrateStatus(run.status),
          result: migrateStatus(run.status) === 'Complete' ? getStoredResult(run.id, run.result) : run.result,
        }));
      } else {
        loaded = evaluationRuns;
        localStorage.setItem('evaluationRuns', JSON.stringify(evaluationRuns));
      }
    } catch (error) {
      console.error('Failed to load evaluation runs:', error);
      loaded = evaluationRuns;
    }
    return loaded.sort((a, b) => b.dateRan.getTime() - a.dateRan.getTime());
  };

  const [runs, setRuns] = React.useState<EvaluationRun[]>(loadRuns);

  // Always display runs sorted by date (newest first)
  const sortedRuns = React.useMemo(
    () => [...runs].sort((a, b) => b.dateRan.getTime() - a.dateRan.getTime()),
    [runs]
  );

  const filteredRuns = React.useMemo(() => {
    if (!filterValue) return sortedRuns;
    return sortedRuns.filter((run) => {
      switch (filterAttribute) {
        case 'Name':
          return run.name.toLowerCase().includes(filterValue.toLowerCase());
        case 'Type':
          return run.type.toLowerCase().includes(filterValue.toLowerCase());
        case 'Status':
          return run.status === filterValue;
        default:
          return true;
      }
    });
  }, [sortedRuns, filterAttribute, filterValue]);
  const [isProgressModalOpen, setIsProgressModalOpen] = React.useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = React.useState<EvaluationRun | null>(null);
  const [isStopConfirmModalOpen, setIsStopConfirmModalOpen] = React.useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = React.useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = React.useState<EvaluationRun | null>(null);

  // Save runs to localStorage whenever they change
  React.useEffect(() => {
    try {
      localStorage.setItem('evaluationRuns', JSON.stringify(runs));
    } catch (error) {
      console.error('Failed to save evaluation runs:', error);
    }
  }, [runs]);

  // Check for new evaluation from navigation state
  React.useEffect(() => {
    const state = location.state as { newEvaluation?: EvaluationRun } | null;
    
    if (state?.newEvaluation) {
      const newEval = state.newEvaluation;
      setRuns((prevRuns) => {
        // Check if evaluation with this ID already exists
        const exists = prevRuns.some(run => run.id === newEval.id);
        if (exists) {
          return prevRuns;
        }
        return [newEval, ...prevRuns];
      });
      // Clear the state immediately to prevent re-runs
      window.history.replaceState({}, '', location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Auto-progress evaluations
  React.useEffect(() => {
    const interval = setInterval(() => {
      setRuns((prevRuns) => 
        prevRuns.map((run) => {
          if (run.status !== 'Running' || !run.detailedProgress) {
            return run;
          }

          const { steps, elapsedTime, totalSteps } = run.detailedProgress;
          const completedSteps = steps.filter(s => s.status === 'completed').length;
          const currentStepIndex = steps.findIndex(s => s.status === 'in-progress');
          
          // If no step is in progress yet, start the first one
          if (currentStepIndex === -1 && completedSteps === 0) {
            const updatedSteps = steps.map((step, idx) => 
              idx === 0 ? { ...step, status: 'in-progress' as const } : step
            );
            return {
              ...run,
              progressStep: steps[0].name,
              detailedProgress: {
                ...run.detailedProgress,
                currentStep: 1,
                elapsedTime: elapsedTime + 1,
                steps: updatedSteps,
              },
            };
          }

          // Progress current step to completed after some time
          if (currentStepIndex !== -1) {
            // Complete current step and start next one
            // Benchmarks take longer: 10% chance per second, Collections: 30% chance
            const progressChance = run.type === 'Benchmark' ? 0.9 : 0.7;
            if (Math.random() > progressChance) {
              const nextStepIndex = currentStepIndex + 1;
              
              if (nextStepIndex >= totalSteps) {
                // All steps completed
                return {
                  ...run,
                  status: 'Complete' as const,
                  result: getStoredResult(run.id, randomResult()),
                  progressStep: undefined,
                  detailedProgress: {
                    ...run.detailedProgress,
                    currentStep: totalSteps,
                    elapsedTime: elapsedTime + 1,
                    steps: steps.map(s => ({ ...s, status: 'completed' as const })),
                  },
                };
              }

              const updatedSteps = steps.map((step, idx) => {
                if (idx === currentStepIndex) return { ...step, status: 'completed' as const };
                if (idx === nextStepIndex) return { ...step, status: 'in-progress' as const };
                return step;
              });

              return {
                ...run,
                progressStep: steps[nextStepIndex].name,
                detailedProgress: {
                  ...run.detailedProgress,
                  currentStep: nextStepIndex + 1,
                  elapsedTime: elapsedTime + 1,
                  steps: updatedSteps,
                },
              };
            }
          }

          // Just increment elapsed time
          return {
            ...run,
            detailedProgress: {
              ...run.detailedProgress,
              elapsedTime: elapsedTime + 1,
            },
          };
        })
      );
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  const handleProgressModalClose = () => {
    setIsProgressModalOpen(false);
  };

  const handleStopEvaluation = () => {
    setIsStopConfirmModalOpen(true);
  };

  const handleConfirmStopEvaluation = () => {
    const evaluationId = selectedEvaluation?.id;
    if (evaluationId) {
      setRuns((prevRuns) => {
        const updated = prevRuns.map((run) =>
          run.id === evaluationId ? { ...run, status: 'Canceling' as const } : run
        );
        localStorage.setItem('evaluationRuns', JSON.stringify(updated));
        return updated;
      });
      setIsStopConfirmModalOpen(false);
      setIsProgressModalOpen(false);
      setTimeout(() => {
        setRuns((prevRuns) => {
          const updated = prevRuns.map((run) =>
            run.id === evaluationId ? { ...run, status: 'Canceled' as const, result: '-' } : run
          );
          localStorage.setItem('evaluationRuns', JSON.stringify(updated));
          return updated;
        });
      }, 1500);
    }
  };

  const handleCancelStopEvaluation = () => {
    setIsStopConfirmModalOpen(false);
  };

  const handleDeleteEvaluation = (evaluationId: string) => {
    setRuns((prevRuns) => {
      const updated = prevRuns.filter((run) => run.id !== evaluationId);
      localStorage.setItem('evaluationRuns', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteClick = (evaluation: EvaluationRun) => {
    setEvaluationToDelete(evaluation);
    setIsDeleteConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (evaluationToDelete) {
      handleDeleteEvaluation(evaluationToDelete.id);
      setEvaluationToDelete(null);
      setIsDeleteConfirmModalOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setEvaluationToDelete(null);
    setIsDeleteConfirmModalOpen(false);
  };

  const onProjectSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    setSelectedProject(value as string);
    setIsProjectSelectOpen(false);
  };

  const onFilterSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    setFilterAttribute(value as string);
    setFilterValue('');
    setIsFilterSelectOpen(false);
  };

  const onSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
    setPage(newPage);
  };

  const onPerPageSelect = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  const onProjectToggle = () => {
    setIsProjectSelectOpen(!isProjectSelectOpen);
  };

  const getStatusLabel = (status: EvaluationRun['status'], _progressStep?: string) => {
    const label = (() => {
      switch (status) {
        case 'Pending':
          return <Label color="purple" icon={<HourglassHalfIcon />}>Pending</Label>;
        case 'Running':
          return <Label color="blue" icon={<InProgressIcon style={{ animation: 'spin 2s linear infinite' }} />}>Running</Label>;
        case 'Complete':
          return <Label status="success" icon={<CheckCircleIcon />}>Complete</Label>;
        case 'Failed':
          return <Label color="orange" icon={<ExclamationCircleIcon />}>Failed</Label>;
        case 'Canceling':
          return <Label color="grey" icon={<InProgressIcon style={{ animation: 'spin 2s linear infinite' }} />}>Canceling</Label>;
        case 'Canceled':
          return <Label color="grey" icon={<BanIcon />}>Canceled</Label>;
        default:
          return <Label>{status}</Label>;
      }
    })();

    return label;
  };

  const _getTypeLabel = (type: EvaluationRun['type']) => {
    switch (type) {
      case 'Benchmark':
        return <Label color="purple">{type}</Label>;
      case 'Collection':
        return <Label color="teal">{type}</Label>;
      default:
        return <Label>{type}</Label>;
    }
  };

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
            <FlexItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <img src={evalIcon} alt="Evaluation" style={{ width: '32px', height: '32px' }} />
                </FlexItem>
                <FlexItem>
                  <Content component={ContentVariants.h1}>Evaluations</Content>
                </FlexItem>
              </Flex>
            </FlexItem>
          </Flex>
          <FlexItem>
            <Content component={ContentVariants.p}>
              Start and manage evaluation runs for models and agents.
            </Content>
          </FlexItem>
          <FlexItem>
            <Toolbar id="evaluations-toolbar">
              <ToolbarContent>
                <ToolbarGroup>
                  <ToolbarItem>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem>Project</FlexItem>
                      <FlexItem>
                        <Select
                          id="project-select"
                          isOpen={isProjectSelectOpen}
                          selected={selectedProject}
                          onSelect={onProjectSelect}
                          onOpenChange={(isOpen) => setIsProjectSelectOpen(isOpen)}
                          toggle={(toggleRef) => (
                            <MenuToggle
                              ref={toggleRef}
                              onClick={onProjectToggle}
                              isExpanded={isProjectSelectOpen}
                              id="project-select-toggle"
                            >
                              {selectedProject}
                            </MenuToggle>
                          )}
                        >
                          <SelectList>
                            <SelectOption value="Project A">Project A</SelectOption>
                            <SelectOption value="Project B">Project B</SelectOption>
                          </SelectList>
                        </Select>
                      </FlexItem>
                    </Flex>
                  </ToolbarItem>
                </ToolbarGroup>
              </ToolbarContent>
            </Toolbar>
          </FlexItem>
        </Flex>
      </PageSection>
      <PageSection hasBodyWrapper={false} style={{ paddingTop: 0, columnGap: 0 }}>
        {runs.length === 0 ? (
          <EmptyState id="evaluations-empty-state" icon={CubesIcon} titleText="No existing evaluation runs">
            <EmptyStateBody>
              No evaluation runs have been started in this project. Start a new evaluation run, or select a different project.
            </EmptyStateBody>
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="primary" id="create-evaluation-empty-button" onClick={() => navigate('/develop-train/evaluations/new')}>
                  Start evaluation run
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          </EmptyState>
        ) : (
          <>
        <Toolbar id="evaluation-runs-toolbar" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <ToolbarContent>
            <ToolbarGroup>
              <ToolbarItem>
                <Select
                  id="filter-select"
                  isOpen={isFilterSelectOpen}
                  selected={filterAttribute}
                  onSelect={onFilterSelect}
                  onOpenChange={(isOpen) => setIsFilterSelectOpen(isOpen)}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setIsFilterSelectOpen(!isFilterSelectOpen)}
                      isExpanded={isFilterSelectOpen}
                      id="filter-select-toggle"
                      icon={<FilterIcon />}
                    >
                      {filterAttribute}
                    </MenuToggle>
                  )}
                >
                  <SelectList>
                    <SelectOption value="Name">Name</SelectOption>
                    <SelectOption value="Type">Type</SelectOption>
                    <SelectOption value="Status">Status</SelectOption>
                  </SelectList>
                </Select>
              </ToolbarItem>
              <ToolbarItem>
                {filterAttribute === 'Status' ? (
                  <Select
                    id="status-filter-select"
                    isOpen={isStatusFilterOpen}
                    selected={filterValue}
                    onSelect={(_event, value) => {
                      setFilterValue(value as string);
                      setIsStatusFilterOpen(false);
                    }}
                    onOpenChange={(isOpen) => setIsStatusFilterOpen(isOpen)}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                        isExpanded={isStatusFilterOpen}
                        id="status-filter-select-toggle"
                        style={{ minWidth: '200px' }}
                      >
                        {filterValue || 'Filter by status'}
                      </MenuToggle>
                    )}
                  >
                    <SelectList>
                      <SelectOption value="Pending">Pending</SelectOption>
                      <SelectOption value="Running">Running</SelectOption>
                      <SelectOption value="Complete">Complete</SelectOption>
                      <SelectOption value="Failed">Failed</SelectOption>
                      <SelectOption value="Canceling">Canceling</SelectOption>
                      <SelectOption value="Canceled">Canceled</SelectOption>
                    </SelectList>
                  </Select>
                ) : (
                  <SearchInput
                    placeholder={`Filter by ${filterAttribute.toLowerCase()}`}
                    value={filterValue}
                    onChange={(_event, value) => setFilterValue(value)}
                    onClear={() => setFilterValue('')}
                    id="filter-search-input"
                  />
                )}
              </ToolbarItem>
              <ToolbarItem>
                <Button variant="primary" id="create-evaluation-run-button" onClick={() => navigate('/develop-train/evaluations/new')}>
                  Start evaluation run
                </Button>
              </ToolbarItem>
            </ToolbarGroup>
            <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
              <Pagination
                itemCount={filteredRuns.length}
                perPage={perPage}
                page={page}
                onSetPage={onSetPage}
                onPerPageSelect={onPerPageSelect}
                widgetId="evaluation-runs-pagination"
                id="evaluation-runs-pagination"
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Table aria-label="Evaluation table" id="evaluations-table">
          <Thead>
            <Tr>
              <Th width={20}>Name</Th>
              <Th width={10}>Status</Th>
              <Th width={15}>Evaluation</Th>
              <Th width={15}>Evaluated</Th>
              <Th width={20}>Date</Th>
              <Th
                info={{
                  popover: 'For a suite the result is the weighted average of all benchmarks in the set. Success is determined by the primary metric of each benchmark meeting the configured pass % threshold.',
                  ariaLabel: 'Result help',
                  popoverProps: { headerContent: 'Result' },
                }}
              >
                Result
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredRuns.length === 0 && filterValue ? (
              <Tr>
                <Td colSpan={7}>
                  <EmptyState id="evaluations-filter-empty-state" icon={SearchIcon} titleText="No results found">
                    <EmptyStateBody>
                      No evaluation runs match the applied filters. Try adjusting your filter criteria.
                    </EmptyStateBody>
                    <EmptyStateFooter>
                      <EmptyStateActions>
                        <Button variant="link" id="clear-filters-button" onClick={() => setFilterValue('')}>
                          Clear filters
                        </Button>
                      </EmptyStateActions>
                    </EmptyStateFooter>
                  </EmptyState>
                </Td>
              </Tr>
            ) : (
              filteredRuns.slice((page - 1) * perPage, page * perPage).map((run) => (
                <Tr key={run.id}>
                  <Td dataLabel="Name">
                    {run.status === 'Complete' ? (
                      <Button 
                        variant="link" 
                        isInline 
                        id={`evaluation-link-${run.id}`}
                        onClick={() => navigate(`/develop-train/evaluations/${run.id}/results`)}
                      >
                        {run.name}
                      </Button>
                    ) : (
                      <span id={`evaluation-link-${run.id}`}>{run.name}</span>
                    )}
                  </Td>
                  <Td dataLabel="Status">
                    {getStatusLabel(run.status)}
                  </Td>
                  <Td dataLabel="Evaluation">{run.collectionOrBenchmark || '--'}</Td>
                  <Td dataLabel="Evaluated">{run.evaluated}</Td>
                  <Td dataLabel="Date">{run.dateRan.toLocaleString('en-GB', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })} UTC</Td>
                  <Td dataLabel="Result">{run.result}</Td>
                  <Td isActionCell>
                    <ActionsColumn
                      items={[
                        ...(run.status === 'Running' ? [{
                          title: 'Cancel',
                          onClick: () => {
                            setSelectedEvaluation(run);
                            setIsStopConfirmModalOpen(true);
                          },
                        }] : []),
                        {
                          title: 'Delete',
                          onClick: () => handleDeleteClick(run),
                        },
                      ]}
                    />
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
          </>
        )}
      </PageSection>

      <Modal
        variant={ModalVariant.medium}
        isOpen={isProgressModalOpen}
        onClose={handleProgressModalClose}
        aria-labelledby="progress-modal-title"
        aria-describedby="progress-modal-body"
      >
        <ModalHeader 
          title={
            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>Evaluation status</FlexItem>
              <FlexItem>
                {(() => {
                  const currentRun = runs.find(r => r.id === selectedEvaluation?.id);
                  return currentRun?.progressStep === 'Scheduled' ? (
                    <Label color="purple" icon={<HourglassHalfIcon />}>Pending</Label>
                  ) : (
                    <Label color="blue" icon={<InProgressIcon style={{ animation: 'spin 2s linear infinite' }} />}>Running</Label>
                  );
                })()}
              </FlexItem>
            </Flex>
          }
        />
        <ModalBody id="progress-modal-body">
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
            <FlexItem>
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <Content component={ContentVariants.h3} style={{ fontSize: '16px', fontWeight: 600 }}>
                    Overall progress
                  </Content>
                </FlexItem>
                <FlexItem>
                  <Progress 
                    value={(() => {
                      const currentRun = runs.find(r => r.id === selectedEvaluation?.id);
                      if (!currentRun?.detailedProgress) return 0;
                      return (currentRun.detailedProgress.steps.filter(s => s.status === 'completed').length / currentRun.detailedProgress.totalSteps) * 100;
                    })()}
                    measureLocation={ProgressMeasureLocation.none}
                    style={{
                      ['--pf-v6-c-progress__indicator--Transition' as string]: 'width 0.5s ease-in-out'
                    }}
                  />
                </FlexItem>
              </Flex>
            </FlexItem>
            <FlexItem>
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
                {(() => {
                  const currentRun = runs.find(r => r.id === selectedEvaluation?.id);
                  return currentRun?.detailedProgress?.steps.map((step, index) => (
                  <FlexItem key={index}>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem>
                        {step.status === 'completed' && (
                          <Icon size="md" status="success">
                            <CheckCircleIcon />
                          </Icon>
                        )}
                        {step.status === 'in-progress' && (
                          <Icon size="md" status="info">
                            <InProgressIcon style={{ animation: 'spin 2s linear infinite' }} />
                          </Icon>
                        )}
                        {step.status === 'pending' && (
                          <Icon size="md" status="custom" style={{ color: '#6a6e73' }}>
                            <PendingIcon />
                          </Icon>
                        )}
                      </FlexItem>
                      <FlexItem>
                        <Content 
                          component={ContentVariants.p} 
                          style={{ 
                            fontSize: '14px',
                            color: step.status === 'pending' ? '#6a6e73' : '#151515'
                          }}
                        >
                          {step.name}
                        </Content>
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                  ));
                })()}
              </Flex>
            </FlexItem>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={handleStopEvaluation}>
            Stop evaluation
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        id="stop-confirmation-modal"
        variant={ModalVariant.small}
        isOpen={isStopConfirmModalOpen}
        onClose={handleCancelStopEvaluation}
      >
        <ModalHeader title="Cancel evaluation?" />
        <ModalBody>
          The <strong>{selectedEvaluation?.name}</strong> evaluation will be canceled, and its progress will be lost.
        </ModalBody>
        <ModalFooter>
          <Button variant="danger" onClick={handleConfirmStopEvaluation}>
            Cancel evaluation
          </Button>
          <Button variant="link" onClick={handleCancelStopEvaluation}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        id="delete-confirmation-modal"
        variant={ModalVariant.small}
        isOpen={isDeleteConfirmModalOpen}
        onClose={handleCancelDelete}
      >
        <ModalHeader title="Delete evaluation run" />
        <ModalBody>
          By deleting <strong>{evaluationToDelete?.name}</strong> you will be removing it from the list of evaluation runs.
        </ModalBody>
        <ModalFooter>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
          <Button variant="link" onClick={handleCancelDelete}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export { Evaluations };
