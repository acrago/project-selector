import * as React from 'react';
import ProjectsSection from '../projects/ProjectsSection';
import { useResourcesSection } from '../resources/useResourcesSection';
import HomeHint from '../HomeHint';
import ProjectsCapabilitiesSection from './ProjectsCapabilitiesSection';

const HomeProjects: React.FunctionComponent = () => {
  const resourcesSection = useResourcesSection();

  return (
    <>
      <HomeHint
        title="Welcome to RHOAI 3.4"
        body={
          <div>
            <p>Get started by creating your first project or exploring the available resources.</p>
            <p>
              Projects are workspaces where you can create and manage your AI/ML workloads, including
              notebooks, models, and pipelines.
            </p>
          </div>
        }
        isDisplayed={true}
        homeHintKey="welcome-projects"
      />
      <ProjectsCapabilitiesSection />
      <ProjectsSection />
      {resourcesSection}
    </>
  );
};

export default HomeProjects;


