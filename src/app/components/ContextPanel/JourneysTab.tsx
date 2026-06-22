import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Content,
  Flex,
  FlexItem,
  Label,
  Progress,
  ProgressMeasureLocation,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import {
  AngleLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  MapMarkerIcon,
  PlayIcon,
} from '@patternfly/react-icons';
import { Journey, JourneyAction } from '@app/utils/designDataParser';

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

const HIGHLIGHT_STYLE_ID = 'journey-highlight-styles';
const HIGHLIGHT_CLASS = 'journey-highlight-active';
const HIGHLIGHT_DURATION_MS = 3000;

function ensureHighlightStyles() {
  if (document.getElementById(HIGHLIGHT_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = HIGHLIGHT_STYLE_ID;
  style.textContent = `
    @keyframes journeyHighlightPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(0, 102, 204, 0.6); }
      50% { box-shadow: 0 0 0 6px rgba(0, 102, 204, 0.2); }
    }
    .${HIGHLIGHT_CLASS} {
      animation: journeyHighlightPulse 1s ease-in-out 3 !important;
      outline: 3px solid var(--pf-t--global--color--brand--default) !important;
      outline-offset: 3px !important;
      border-radius: 4px !important;
      position: relative;
      z-index: 1000;
    }
  `;
  document.head.appendChild(style);
}

function clearAllHighlights() {
  document.querySelectorAll(`.${HIGHLIGHT_CLASS}`).forEach((el) => {
    el.classList.remove(HIGHLIGHT_CLASS);
  });
}

interface JourneysTabProps {
  journeys: Journey[];
}

const difficultyColors: Record<string, 'green' | 'orange' | 'red'> = {
  easy: 'green',
  medium: 'orange',
  advanced: 'red',
};

const JourneysTab: React.FunctionComponent<JourneysTabProps> = ({ journeys }) => {
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    ensureHighlightStyles();
    return () => {
      clearAllHighlights();
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  const executeActions = useCallback(
    (actions: JourneyAction[]) => {
      clearAllHighlights();
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);

      const navAction = actions.find((a) => a.type === 'navigate');
      const clickActions = actions.filter((a) => a.type === 'click');
      const highlightActions = actions.filter((a) => a.type === 'highlight');

      const applyInteractions = (attempt = 0) => {
        let anyApplied = false;

        for (const action of clickActions) {
          const el = document.getElementById(action.target);
          if (el) {
            el.click();
            anyApplied = true;
          }
        }

        for (const action of highlightActions) {
          const el = document.getElementById(action.target);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add(HIGHLIGHT_CLASS);
            anyApplied = true;
          }
        }

        const allTargets = [...clickActions, ...highlightActions];
        const allFound = allTargets.length === 0 || allTargets.every(
          (a) => document.getElementById(a.target) !== null
        );

        if (!allFound && attempt < 15) {
          setTimeout(() => applyInteractions(attempt + 1), 400);
        } else if (anyApplied) {
          highlightTimerRef.current = setTimeout(() => {
            clearAllHighlights();
          }, HIGHLIGHT_DURATION_MS);
        }
      };

      if (navAction) {
        navigate(navAction.target);
        setTimeout(() => applyInteractions(0), 800);
      } else {
        applyInteractions(0);
      }
    },
    [navigate]
  );

  const startJourney = (journey: Journey) => {
    setActiveJourney(journey);
    setCurrentStepIndex(-1);
    setCompletedSteps(new Set());
    clearAllHighlights();
  };

  const exitJourney = () => {
    setActiveJourney(null);
    setCurrentStepIndex(-1);
    setCompletedSteps(new Set());
    clearAllHighlights();
  };

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
    clearAllHighlights();
  };


  if (journeys.length === 0) {
    return (
      <div style={{ padding: '16px 0' }}>
        <Content component="p" id="journeys-empty-state">
          No journeys available for this feature yet. Create a{' '}
          <code>feature-journeys.md</code> file in the feature&apos;s{' '}
          <code>.design/features/</code> folder to populate this tab.
        </Content>
      </div>
    );
  }

  if (activeJourney) {
    const isIntroduction = currentStepIndex === -1;
    const currentStep = !isIntroduction ? activeJourney.steps[currentStepIndex] : null;
    const totalSteps = activeJourney.steps.length;
    const completedCount = completedSteps.size;
    const progress = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
    const allComplete = completedCount === totalSteps;

    return (
      <div style={{ padding: '16px 0', height: '100%', display: 'flex', flexDirection: 'column' }} id="journey-walkthrough">
        {/* Header */}
        <Flex alignItems={{ default: 'alignItemsCenter' }} style={{ marginBottom: '12px' }}>
          <FlexItem>
            <Button
              variant="plain"
              onClick={exitJourney}
              aria-label="Back to journeys"
              id="journey-back-button"
              size="sm"
            >
              <AngleLeftIcon />
            </Button>
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }}>
            <Content component="h3" style={{ margin: 0 }} id="journey-active-title">
              {activeJourney.title}
            </Content>
          </FlexItem>
        </Flex>

        {/* Progress */}
        <div style={{ marginBottom: '16px' }}>
          <Progress
            value={progress}
            title="Journey progress"
            measureLocation={ProgressMeasureLocation.outside}
            id="journey-progress"
            aria-label="Journey progress"
          />
          <Content component="small">
            {completedCount} of {totalSteps} steps complete
          </Content>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {isIntroduction ? (
            <Stack hasGutter id="journey-introduction">
              <StackItem>
                <Flex gap={{ default: 'gapSm' }} style={{ marginBottom: '8px' }}>
                  <FlexItem>
                    <Label color={difficultyColors[activeJourney.difficulty] || 'green'} isCompact id="journey-difficulty-label">
                      {activeJourney.difficulty.charAt(0).toUpperCase() + activeJourney.difficulty.slice(1)}
                    </Label>
                  </FlexItem>
                  <FlexItem>
                    <Label isCompact id="journey-duration-label">{activeJourney.duration}</Label>
                  </FlexItem>
                  <FlexItem>
                    <Label isCompact variant="outline" id="journey-persona-label">{activeJourney.persona}</Label>
                  </FlexItem>
                </Flex>
              </StackItem>
              <StackItem>
                <Content component="p" id="journey-goal">
                  <strong>Goal:</strong> {activeJourney.goal}
                </Content>
              </StackItem>
              <StackItem>
                <Content component="p" id="journey-intro-text">{renderInlineMarkdown(activeJourney.introduction)}</Content>
              </StackItem>
              <StackItem>
                <Content component="h4" id="journey-steps-preview-heading">Steps in this journey</Content>
                <ol style={{ paddingLeft: '1.5rem', margin: '8px 0' }}>
                  {activeJourney.steps.map((step, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>
                      <Content component="small">
                        {step.optional && <Label isCompact variant="outline" color="grey" style={{ marginRight: '4px' }}>Optional</Label>}
                        {step.title}
                      </Content>
                    </li>
                  ))}
                </ol>
              </StackItem>
              <StackItem>
                <Button
                  variant="primary"
                  onClick={() => goToStep(0)}
                  icon={<PlayIcon />}
                  iconPosition="start"
                  id="journey-start-button"
                >
                  Start journey
                </Button>
              </StackItem>
            </Stack>
          ) : currentStep ? (
            <Stack hasGutter id={`journey-step-${currentStepIndex}`}>
              <StackItem>
                <Content component="small">
                  Step {currentStepIndex + 1} of {totalSteps}
                  {currentStep.optional && (
                    <Label isCompact variant="outline" color="grey" style={{ marginLeft: '8px' }}>Optional</Label>
                  )}
                </Content>
                <Content component="h4" style={{ marginTop: '4px' }} id={`journey-step-title-${currentStepIndex}`}>
                  {currentStep.title}
                </Content>
              </StackItem>
              <StackItem>
                <Content component="p" id={`journey-step-description-${currentStepIndex}`}>
                  {renderInlineMarkdown(currentStep.description)}
                </Content>
              </StackItem>
              {currentStep.actions.length > 0 && (
                <StackItem>
                  <Button
                    variant="secondary"
                    onClick={() => executeActions(currentStep.actions)}
                    icon={<MapMarkerIcon />}
                    iconPosition="start"
                    id={`journey-step-action-${currentStepIndex}`}
                  >
                    {currentStep.actions.some((a) => a.type === 'navigate')
                      ? 'Go there'
                      : currentStep.actions.some((a) => a.type === 'click')
                        ? 'Do this for me'
                        : 'Show me'}
                  </Button>
                </StackItem>
              )}
              <StackItem style={{ marginTop: '16px' }}>
                <Flex gap={{ default: 'gapSm' }}>
                  <FlexItem>
                    <Button
                      variant="secondary"
                      onClick={() => goToStep(currentStepIndex - 1)}
                      isDisabled={currentStepIndex === 0}
                      icon={<AngleLeftIcon />}
                      iconPosition="start"
                      id={`journey-step-back-${currentStepIndex}`}
                    >
                      Back
                    </Button>
                  </FlexItem>
                  <FlexItem>
                    {currentStepIndex < totalSteps - 1 ? (
                      <Button
                        variant="primary"
                        onClick={() => goToStep(currentStepIndex + 1)}
                        icon={<ArrowRightIcon />}
                        iconPosition="end"
                        id={`journey-step-next-${currentStepIndex}`}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => {
                          setCompletedSteps(new Set(activeJourney.steps.map((_s, i) => i)));
                        }}
                        icon={<CheckCircleIcon />}
                        iconPosition="start"
                        id="journey-finish-button"
                      >
                        Finish
                      </Button>
                    )}
                  </FlexItem>
                  <FlexItem align={{ default: 'alignRight' }}>
                    <Button
                      variant="plain"
                      onClick={() => {
                        setCurrentStepIndex(0);
                        setCompletedSteps(new Set());
                        clearAllHighlights();
                      }}
                      aria-label="Restart journey"
                      id="journey-restart-button"
                    >
                      Restart
                    </Button>
                  </FlexItem>
                </Flex>
              </StackItem>
            </Stack>
          ) : null}

          {/* Step navigator (always visible below content) */}
          {!isIntroduction && (
            <div style={{ marginTop: '24px', borderTop: '1px solid var(--pf-t--global--border--color--default)', paddingTop: '12px' }}>
              <Content component="small" style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                All steps
              </Content>
              {activeJourney.steps.map((step, i) => (
                <Button
                  key={i}
                  variant="plain"
                  onClick={() => goToStep(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    backgroundColor: i === currentStepIndex ? 'var(--pf-t--global--background--color--action--plain--hover)' : undefined,
                  }}
                  id={`journey-step-nav-${i}`}
                >
                  {completedSteps.has(i) ? (
                    <CheckCircleIcon style={{ color: 'var(--pf-t--global--icon--color--status--success--default)', flexShrink: 0 }} />
                  ) : (
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '2px solid var(--pf-t--global--border--color--default)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                  )}
                  <Content component="small" style={{ flex: 1 }}>
                    {step.optional && '(Optional) '}
                    {step.title}
                  </Content>
                </Button>
              ))}
            </div>
          )}

          {/* Completion state */}
          {allComplete && !isIntroduction && (
            <div
              style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: 'var(--pf-t--global--background--color--status--success--default)',
                borderRadius: '8px',
                textAlign: 'center',
              }}
              id="journey-complete"
            >
              <CheckCircleIcon
                style={{
                  color: 'var(--pf-t--global--icon--color--status--success--default)',
                  fontSize: '24px',
                  marginBottom: '8px',
                }}
              />
              <Content component="h4">Journey complete!</Content>
              <Content component="small">
                You&apos;ve completed all steps in this journey.
              </Content>
              <div style={{ marginTop: '12px' }}>
                <Button variant="link" onClick={exitJourney} id="journey-back-to-catalog">
                  Back to all journeys
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 0', height: '100%', overflow: 'auto' }} id="journeys-catalog">
      <Stack hasGutter>
        <StackItem>
          <Content component="small">
            Select a journey to walk through key user flows in the prototype.
          </Content>
        </StackItem>
        {journeys.map((journey) => (
          <StackItem key={journey.id}>
            <Card
              isClickable
              id={`journey-card-${journey.id}`}
            >
              <CardHeader
                selectableActions={{
                  onClickAction: () => startJourney(journey),
                  selectableActionId: `journey-card-action-${journey.id}`,
                  selectableActionAriaLabelledby: `journey-card-title-${journey.id}`,
                }}
              >
                <CardTitle id={`journey-card-title-${journey.id}`}>{journey.title}</CardTitle>
              </CardHeader>
              <CardBody>
                <Flex gap={{ default: 'gapSm' }} style={{ marginBottom: '8px' }}>
                  <FlexItem>
                    <Label color={difficultyColors[journey.difficulty] || 'green'} isCompact>
                      {journey.difficulty.charAt(0).toUpperCase() + journey.difficulty.slice(1)}
                    </Label>
                  </FlexItem>
                  <FlexItem>
                    <Label isCompact>{journey.duration}</Label>
                  </FlexItem>
                </Flex>
                <Content component="small">{journey.goal}</Content>
              </CardBody>
              <CardFooter>
                <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem>
                    <Label isCompact variant="outline">{journey.persona}</Label>
                  </FlexItem>
                  <FlexItem>
                    <Content component="small">
                      {journey.steps.length} steps
                    </Content>
                  </FlexItem>
                </Flex>
              </CardFooter>
            </Card>
          </StackItem>
        ))}
      </Stack>
    </div>
  );
};

export default JourneysTab;
