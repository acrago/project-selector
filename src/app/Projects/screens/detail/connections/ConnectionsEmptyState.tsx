import * as React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

interface ConnectionsEmptyStateProps {
  onAddConnection: () => void;
}

export const ConnectionsEmptyState: React.FunctionComponent<ConnectionsEmptyStateProps> = ({
  onAddConnection,
}) => (
  <EmptyState id="connections-empty-state" titleText="No connections" icon={PlusCircleIcon}>
    <EmptyStateBody>
      Connections enable you to store and retrieve information that typically should not be
      stored in code. For example, you can store details (for example, URIs, usernames,
      passwords) about data sources, S3 object storage, and more.
    </EmptyStateBody>
    <EmptyStateFooter>
      <Button variant="primary" onClick={onAddConnection} id="add-connection-button">
        Add connection
      </Button>
    </EmptyStateFooter>
  </EmptyState>
);

