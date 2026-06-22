import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ModelCatalogSettingsPage } from './ModelCatalogSettingsPage';

const ModelCatalogSettings: React.FunctionComponent = () => {
  const location = useLocation();
  const isManagingSourcePage = location.pathname.includes('/managing-source');

  // If we're at the base path, show the ModelCatalogSettingsPage directly
  // Otherwise, show the outlet for nested routes (like ManagingSource)
  if (location.pathname === '/settings/model-resources/model-catalog-settings' || 
      location.pathname === '/settings/model-resources/model-catalog-settings/') {
    return <ModelCatalogSettingsPage />;
  }

  // For nested routes, render the outlet
  return <Outlet />;
};

export { ModelCatalogSettings };
