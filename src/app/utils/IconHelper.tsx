import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFolder,
  faHouse
} from '@fortawesome/free-regular-svg-icons';
import {
  faBook,
  faBrain,
  faCode,
  faColumns,
  faFlask,
  faGear,
  faMagnifyingGlass,
  faTableCellsLarge
} from '@fortawesome/free-solid-svg-icons';

// Import NavIcons
import HomeNavIcon from '../../images/icons/HomeNavIcon';
import ProjectsNavIcon from '../../images/icons/ProjectsNavIcon';
import AiHubNavIcon from '../../images/icons/AiHubNavIcon';
import GenAiStudioNavIcon from '../../images/icons/GenAiStudioNavIcon';
import DevelopAndTrainNavIcon from '../../images/icons/DevelopAndTrainNavIcon';
import ApplicationsNavIcon from '../../images/icons/ApplicationsNavIcon';
import LearningResourcesNavIcon from '../../images/icons/LearningResourcesNavIcon';
import SettingsNavIcon from '../../images/icons/SettingsNavIcon';
import ObserveAndMonitorNavIcon from '../../images/icons/ObserveAndMonitorNavIcon';

// Map of icon names to FontAwesome icons
const iconMap = {
  'fa-light fa-house': faHouse,
  'fa-light fa-folder': faFolder,
  'fa-light fa-brain': faBrain,
  'fa-light fa-flask': faFlask,
  'fa-light fa-magnifying-glass': faMagnifyingGlass,
  'fa-light fa-book': faBook,
  'fa-light fa-code': faCode,
  'fa-light fa-gear': faGear,
  'fa-columns': faColumns,
  'fa-light fa-table-cells-large': faTableCellsLarge,
};

interface FontAwesomeIconComponentProps {
  iconClass: string;
}

export const FontAwesomeIconComponent: React.FunctionComponent<FontAwesomeIconComponentProps> = ({ iconClass }) => {
  const icon = iconMap[iconClass as keyof typeof iconMap];
  
  if (!icon) {
    console.warn(`Icon not found for class: ${iconClass}`);
    return null;
  }
  
  return <FontAwesomeIcon icon={icon} />;
};

// Helper function to create icon components for routes
export const createFontAwesomeIcon = (iconClass: string) => {
  return () => <FontAwesomeIconComponent iconClass={iconClass} />;
};

// Wrapper component for NavIcons to match FontAwesome styling
const NavIconWrapper: React.FunctionComponent<{ icon: React.ComponentType }> = ({ icon: Icon }) => {
  return (
    <div style={{ display: 'inline-flex', width: '1.25em', height: '1.25em' }}>
      <Icon />
    </div>
  );
};

// Helper functions to create NavIcon components for routes
export const createHomeNavIcon = () => {
  return () => <NavIconWrapper icon={HomeNavIcon} />;
};

export const createProjectsNavIcon = () => {
  return () => <NavIconWrapper icon={ProjectsNavIcon} />;
};

export const createAiHubNavIcon = () => {
  return () => <NavIconWrapper icon={AiHubNavIcon} />;
};

export const createGenAiStudioNavIcon = () => {
  return () => <NavIconWrapper icon={GenAiStudioNavIcon} />;
};

export const createDevelopAndTrainNavIcon = () => {
  return () => <NavIconWrapper icon={DevelopAndTrainNavIcon} />;
};

export const createApplicationsNavIcon = () => {
  return () => <NavIconWrapper icon={ApplicationsNavIcon} />;
};

export const createLearningResourcesNavIcon = () => {
  return () => <NavIconWrapper icon={LearningResourcesNavIcon} />;
};

export const createSettingsNavIcon = () => {
  return () => <NavIconWrapper icon={SettingsNavIcon} />;
};

export const createObserveAndMonitorNavIcon = () => {
  return () => <NavIconWrapper icon={ObserveAndMonitorNavIcon} />;
};
