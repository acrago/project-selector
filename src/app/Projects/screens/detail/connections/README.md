# Project Connections UI

This directory contains the UI components for managing connections within a project. These components provide a user interface inspired by the [Open Data Hub Dashboard](https://github.com/opendatahub-io/odh-dashboard/tree/main/frontend/src/pages/projects/screens/detail/connections).

## Components

### ProjectConnections
The main component that orchestrates the connections management interface.

**Features:**
- Displays a list of connections in a table format
- Shows an empty state when no connections exist
- Provides "Add connection" functionality
- Handles edit and delete operations
- Uses mock data (ready to be replaced with real API calls)

**Usage:**
```tsx
import { ProjectConnections } from '@app/Projects/screens/detail/connections';

<ProjectConnections projectId="my-project-id" />
```

### ConnectionsTable
A PatternFly table component that displays connections with their details.

**Features:**
- Displays connection name, type, compatible resources, and creation date
- Row-level actions (Edit/Delete) via kebab menu
- Supports descriptions as secondary text under the name
- Uses PatternFly Labels for types and compatibility

### ConnectionsEmptyState
An empty state component displayed when no connections exist.

**Features:**
- PatternFly EmptyState with icon and descriptive text
- Primary action button to add a connection
- Explains what connections are and their purpose

### ManageConnectionModal
A modal dialog for creating and editing connections.

**Features:**
- Form with name, description, and type fields
- Client-side validation
- Support for both create and edit modes
- Connection types: S3, PostgreSQL, MySQL, URI, Generic
- Loading states during submission

### DeleteConnectionModal
A confirmation modal for deleting connections.

**Features:**
- Displays the connection name being deleted
- Warning message about the permanent nature of deletion
- Error handling with user-friendly messages
- Loading states during deletion

## Connection Type

The `Connection` interface represents a connection object:

```typescript
interface Connection {
  id: string;
  name: string;
  description?: string;
  type: string;
  createdDate: string;
  compatible: string[];
}
```

## Integration with Your API

The components currently use mock data. To integrate with your actual API:

1. **ProjectConnections.tsx**:
   - Replace the `useEffect` mock data with your API call
   - Replace `handleSaveConnection` logic with your create/update API calls
   - Replace `handleConfirmDelete` logic with your delete API call

2. **Connection Types**:
   - Update the `connectionTypes` array in `ManageConnectionModal.tsx` to match your supported types

3. **Compatible Resources**:
   - Update the logic that determines what resources are compatible with each connection

## Styling

All components follow PatternFly design guidelines and use:
- PatternFly React components
- Semantic design tokens for colors and spacing
- Unique ID attributes for accessibility and testing
- No custom CSS (per project rules)

## Accessibility

- All interactive elements have unique IDs
- Labels and form fields are properly associated
- Keyboard navigation is supported
- Screen reader text is provided where needed
- ARIA attributes are used appropriately

## Example: Adding to a Project Detail Page

```tsx
import React from 'react';
import { Tabs, Tab, TabTitleText } from '@patternfly/react-core';
import { ProjectConnections } from '@app/Projects/screens/detail/connections';

const ProjectDetail = ({ projectId }) => {
  const [activeTabKey, setActiveTabKey] = React.useState(0);

  return (
    <Tabs activeKey={activeTabKey} onSelect={(_, tabIndex) => setActiveTabKey(tabIndex)}>
      <Tab eventKey={0} title={<TabTitleText>Overview</TabTitleText>}>
        {/* Overview content */}
      </Tab>
      <Tab eventKey={1} title={<TabTitleText>Connections</TabTitleText>}>
        <ProjectConnections projectId={projectId} />
      </Tab>
      <Tab eventKey={2} title={<TabTitleText>Workbenches</TabTitleText>}>
        {/* Workbenches content */}
      </Tab>
    </Tabs>
  );
};
```

## Future Enhancements

Consider adding:
- Search and filter functionality
- Sorting capabilities
- Pagination for large numbers of connections
- Connection testing/validation
- Bulk operations
- Connection templates
- Import/export functionality

