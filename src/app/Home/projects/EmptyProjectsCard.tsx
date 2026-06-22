import * as React from 'react';
import {
  Button,
  Card,
  CardBody,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';
import ProjectIcon from './ProjectIcon';

interface EmptyProjectsCardProps {
  allowCreate: boolean;
  onCreateProject: () => void;
}

const EmptyProjectsCard: React.FunctionComponent<EmptyProjectsCardProps> = ({
  allowCreate,
  onCreateProject,
}) => {
  return (
    <Card>
      <CardBody>
        <EmptyState icon={ProjectIcon}>
          <EmptyStateBody>
            Projects are workspaces where you can create and manage your AI/ML workloads. Get
            started by creating your first project.
          </EmptyStateBody>
          {allowCreate && (
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="link" onClick={onCreateProject}>
                  Create project
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          )}
        </EmptyState>
      </CardBody>
    </Card>
  );
};

export default EmptyProjectsCard;

