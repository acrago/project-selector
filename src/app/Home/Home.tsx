import * as React from 'react';
import EnableYourTeamSection from './EnableYourTeamSection';
import ProjectsSection from './projects/ProjectsSection';
import { useResourcesSection } from './resources/useResourcesSection';
import TaskAssistantHomeSection from './TaskAssistantHomeSection';

const Home: React.FunctionComponent = () => {
  const resourcesSection = useResourcesSection();

  return (
    <div data-testid="home-page">
      <ProjectsSection />
      <TaskAssistantHomeSection />
      {resourcesSection}
      <EnableYourTeamSection />
    </div>
  );
};

export { Home };
