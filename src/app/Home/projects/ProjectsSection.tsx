import * as React from 'react';
import {
  Button,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Gallery,
  PageSection,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import projectSectionStandardIconSvg from '../../assets/project-card-standard-icon.svg';
import ProjectCard from './ProjectCard';
import CreateProjectCard from './CreateProjectCard';
import EmptyProjectsCard from './EmptyProjectsCard';

const MAX_SHOWN_PROJECTS = 5;

// Mock projects data
const mockProjects = [
  {
    name: 'fraud-detection',
    displayName: 'Fraud Detection',
    description: 'ML model for detecting fraudulent transactions',
    owner: 'data-science-team',
    created: new Date('2024-01-15'),
  },
  {
    name: 'sentiment-analysis',
    displayName: 'Sentiment Analysis',
    description: 'Natural language processing for customer feedback',
    owner: 'nlp-team',
    created: new Date('2024-02-20'),
  },
  {
    name: 'image-classification',
    displayName: 'Image Classification',
    description: 'Computer vision model for product categorization',
    owner: 'cv-team',
    created: new Date('2024-03-10'),
  },
];

const ProjectsSection: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [projects] = React.useState(mockProjects);
  const [, setCreateProjectOpen] = React.useState(false);

  const shownProjects = projects.slice(0, MAX_SHOWN_PROJECTS);
  const showCreateCard = projects.length < MAX_SHOWN_PROJECTS;

  const onCreateProject = () => {
    setCreateProjectOpen(true);
  };

  return (
    <PageSection variant="secondary" hasBodyWrapper={false} data-testid="landing-page-projects">
      <Stack hasGutter>
        <StackItem>
          <Flex
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
            alignItems={{ default: 'alignItemsCenter' }}
            flexWrap={{ default: 'wrap' }}
            gap={{ default: 'gapMd' }}
          >
            <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: 0 }}>
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
                <FlexItem flex={{ default: 'flexNone' }}>
                  <div
                    className="pf-v6-u-display-flex pf-v6-u-align-items-center pf-v6-u-justify-content-center rhoai-projects-section-heading__icon"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: '#FFE8CC',
                    }}
                    aria-hidden
                  >
                    <span
                      className="rhoai-projects-section-heading__icon-mark"
                      dangerouslySetInnerHTML={{ __html: projectSectionStandardIconSvg }}
                    />
                  </div>
                </FlexItem>
                <FlexItem>
                  <Content
                    component={ContentVariants.h1}
                    id="landing-page-projects-title"
                    className="rhoai-home-section-title-md"
                  >
                    Projects
                  </Content>
                </FlexItem>
              </Flex>
            </FlexItem>
            {projects.length > 0 && (
              <FlexItem>
                <Button variant="secondary" onClick={onCreateProject}>
                  Create project
                </Button>
              </FlexItem>
            )}
          </Flex>
        </StackItem>
        <StackItem>
          {!projects.length ? (
            <EmptyProjectsCard allowCreate={true} onCreateProject={onCreateProject} />
          ) : (
            <Gallery hasGutter minWidths={{ default: '225px' }} maxWidths={{ default: '1fr' }}>
              {shownProjects.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
              {showCreateCard && (
                <CreateProjectCard allowCreate={true} onCreateProject={onCreateProject} />
              )}
            </Gallery>
          )}
        </StackItem>
        <StackItem>
          <Flex gap={{ default: 'gapMd' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              {shownProjects.length > 0 && (
                <Content>
                  <small>
                    {shownProjects.length < projects.length
                      ? `${shownProjects.length} of ${projects.length} projects`
                      : 'Showing all AI projects'}
                  </small>
                </Content>
              )}
            </FlexItem>
            <FlexItem>
              <Button
                data-testid="goto-projects-link"
                variant="link"
                isInline
                onClick={() => navigate('/projects')}
              >
                Go to <b>Projects</b>
              </Button>
            </FlexItem>
          </Flex>
        </StackItem>
      </Stack>
    </PageSection>
  );
};

export default ProjectsSection;
