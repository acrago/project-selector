import * as React from 'react';
import {
  Bullseye,
  Button,
  PageSection,
  Stack,
  StackItem,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { Connection, ConnectionsTable } from './ConnectionsTable';
import { ConnectionsEmptyState } from './ConnectionsEmptyState';
import { ManageConnectionModal } from './ManageConnectionModal';
import { DeleteConnectionModal } from './DeleteConnectionModal';

interface ProjectConnectionsProps {
  projectId?: string;
}

export const ProjectConnections: React.FunctionComponent<ProjectConnectionsProps> = ({
  projectId,
}) => {
  const [connections, setConnections] = React.useState<Connection[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedConnection, setSelectedConnection] = React.useState<Connection | null>(null);

  // Mock data - replace with actual API call
  React.useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setConnections([
        {
          id: '1',
          name: 'My S3 Storage',
          description: 'Production data storage',
          type: 's3',
          createdDate: 'Dec 3, 2025',
          compatible: ['Workbench', 'Pipeline'],
        },
        {
          id: '2',
          name: 'Database Connection',
          description: 'PostgreSQL database for analytics',
          type: 'postgres',
          createdDate: 'Dec 1, 2025',
          compatible: ['Workbench'],
        },
      ]);
      setIsLoading(false);
    }, 500);
  }, [projectId]);

  const handleAddConnection = () => {
    setSelectedConnection(null);
    setIsManageModalOpen(true);
  };

  const handleEditConnection = (connection: Connection) => {
    setSelectedConnection(connection);
    setIsManageModalOpen(true);
  };

  const handleDeleteConnection = (connection: Connection) => {
    setSelectedConnection(connection);
    setIsDeleteModalOpen(true);
  };

  const handleSaveConnection = async (
    connectionData: Omit<Connection, 'id' | 'createdDate'>
  ) => {
    // Mock save - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (selectedConnection) {
      // Edit existing
      setConnections((prev) =>
        prev.map((conn) =>
          conn.id === selectedConnection.id
            ? {
                ...conn,
                ...connectionData,
              }
            : conn
        )
      );
    } else {
      // Add new
      const newConnection: Connection = {
        ...connectionData,
        id: Date.now().toString(),
        createdDate: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };
      setConnections((prev) => [...prev, newConnection]);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedConnection) return;

    // Mock delete - replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setConnections((prev) => prev.filter((conn) => conn.id !== selectedConnection.id));
  };

  const isEmpty = connections.length === 0 && !isLoading;

  return (
    <>
      <PageSection isFilled id="project-connections-page">
        <Stack hasGutter>
          <StackItem>
            <Toolbar id="connections-toolbar">
              <ToolbarContent>
                <ToolbarItem>
                  <Title headingLevel="h1" id="connections-title">
                    Connections
                  </Title>
                </ToolbarItem>
                <ToolbarItem variant="separator" />
                <ToolbarItem>
                  {!isEmpty && (
                    <Button
                      variant="primary"
                      onClick={handleAddConnection}
                      id="add-connection-toolbar-button"
                    >
                      Add connection
                    </Button>
                  )}
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
          </StackItem>
          <StackItem isFilled>
            {isEmpty ? (
              <Bullseye>
                <ConnectionsEmptyState onAddConnection={handleAddConnection} />
              </Bullseye>
            ) : (
              <ConnectionsTable
                connections={connections}
                onEdit={handleEditConnection}
                onDelete={handleDeleteConnection}
              />
            )}
          </StackItem>
        </Stack>
      </PageSection>

      <ManageConnectionModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        onSubmit={handleSaveConnection}
        connection={selectedConnection || undefined}
      />

      <DeleteConnectionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleConfirmDelete}
        connection={selectedConnection}
      />
    </>
  );
};

