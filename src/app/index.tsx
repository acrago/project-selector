import * as React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/chatbot/dist/css/main.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppLayout } from '@app/AppLayout/AppLayout';
import { PlaygroundMastheadProvider } from '@app/utils/PlaygroundMastheadContext';
import { AppRoutes } from '@app/routes';
import { ThemeProvider } from '@app/utils/ThemeContext';
import { FeatureFlagsProvider } from '@app/utils/FeatureFlagsContext';
import { UserProfileProvider } from '@app/utils/UserProfileContext';
import { VariantFlagsProvider } from '@app/utils/VariantFlagsContext';
import { MCPCatalogProvider } from '@app/utils/MCPCatalogContext';
import { AIHubNavProvider } from '@app/utils/AIHubNavContext';
import { CommentProvider, GitLabAuthProvider } from '@app/components/CommentingSystem';
import '@app/app.css';

const App: React.FunctionComponent = () => {
  // Basename must match ASSET_PATH / GitLab Pages path_prefix (set in CI for MR/branch previews).
  // process.env.PUBLIC_PATH is defined at build time in webpack (empty string = site root).
  const routerBasename =
    process.env.PUBLIC_PATH && process.env.PUBLIC_PATH.length > 0 ? process.env.PUBLIC_PATH : undefined;

  return (
    <GitLabAuthProvider>
      <FeatureFlagsProvider>
        <UserProfileProvider>
          <MCPCatalogProvider>
            <AIHubNavProvider>
              <ThemeProvider>
                <Router basename={routerBasename}>
                  <CommentProvider>
                    <VariantFlagsProvider>
                      <PlaygroundMastheadProvider>
                        <AppLayout>
                          <AppRoutes />
                        </AppLayout>
                      </PlaygroundMastheadProvider>
                    </VariantFlagsProvider>
                  </CommentProvider>
                </Router>
              </ThemeProvider>
            </AIHubNavProvider>
          </MCPCatalogProvider>
        </UserProfileProvider>
      </FeatureFlagsProvider>
    </GitLabAuthProvider>
  );
};

export default App;