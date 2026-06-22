import * as React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Label,
  Title,
} from '@patternfly/react-core';
import { OutlinedStarIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
  project: {
    name: string;
    displayName: string;
    description: string;
    owner: string;
    created: Date;
  };
}

const ProjectCard: React.FunctionComponent<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();

  return (
    <Card isFullHeight className="rhoai-project-card" data-testid={`project-card-${project.name}`}>
      <div className="rhoai-project-card__accent" aria-hidden />
      <CardHeader>
        <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>
            <Title headingLevel="h4" id={`project-card-title-${project.name}`}>
              <Button
                data-testid={`project-link-${project.name}`}
                variant="link"
                isInline
                onClick={() => navigate(`/projects/${project.name}`)}
              >
                {project.displayName}
              </Button>
            </Title>
          </FlexItem>
          <FlexItem>
            <Label
              icon={<OutlinedStarIcon />}
              variant="outline"
              data-testid="ai-project-label"
              isCompact
            >
              AI
            </Label>
          </FlexItem>
        </Flex>
      </CardHeader>
      <CardBody>
        <Content>{project.description || 'No description'}</Content>
      </CardBody>
      <CardFooter>
        <DescriptionList isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>Created</DescriptionListTerm>
            <DescriptionListDescription>
              {project.created.toLocaleDateString()}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>Owner</DescriptionListTerm>
            <DescriptionListDescription>{project.owner}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
