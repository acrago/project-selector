import * as React from 'react';
import {
  Bullseye,
  Button,
  Card,
  CardBody,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';
import '@patternfly/react-styles/css/utilities/Spacing/spacing.css';
import ProjectIcon from './ProjectIcon';

interface CreateProjectCardProps {
  allowCreate: boolean;
  onCreateProject: () => void;
}

const CreateProjectCard: React.FunctionComponent<CreateProjectCardProps> = ({
  allowCreate,
  onCreateProject,
}) => {
  if (!allowCreate) {
    return null;
  }

  return (
    <Card isFullHeight className="rhoai-project-card rhoai-project-card--create" data-testid="create-project-card">
      <div className="rhoai-project-card__accent" aria-hidden />
      <CardBody className="pf-v6-u-p-0">
        <Bullseye>
          <EmptyState variant="xs" icon={ProjectIcon}>
            <EmptyStateBody>
              Create a new project to organize your AI/ML workloads
            </EmptyStateBody>
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="link" size="lg" onClick={onCreateProject} data-testid="create-project-button">
                  Create project
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          </EmptyState>
        </Bullseye>
      </CardBody>
    </Card>
  );
};

export default CreateProjectCard;

