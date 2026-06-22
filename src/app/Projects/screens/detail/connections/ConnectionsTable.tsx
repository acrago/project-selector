import * as React from 'react';
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Label,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

export interface Connection {
  id: string;
  name: string;
  description?: string;
  type: string;
  createdDate: string;
  compatible: string[];
}

interface ConnectionsTableProps {
  connections: Connection[];
  onEdit: (connection: Connection) => void;
  onDelete: (connection: Connection) => void;
}

export const ConnectionsTable: React.FunctionComponent<ConnectionsTableProps> = ({
  connections,
  onEdit,
  onDelete,
}) => {
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null);

  const columnNames = {
    name: 'Name',
    type: 'Type',
    connected: 'Connected to',
    created: 'Created',
  };

  const onToggle = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const onSelect = () => {
    setOpenDropdownId(null);
  };

  return (
    <Table aria-label="Connections table" variant="compact" id="connections-table">
      <Thead>
        <Tr>
          <Th>{columnNames.name}</Th>
          <Th>{columnNames.type}</Th>
          <Th>{columnNames.connected}</Th>
          <Th>{columnNames.created}</Th>
          <Th screenReaderText="Actions" />
        </Tr>
      </Thead>
      <Tbody>
        {connections.map((connection) => (
          <Tr key={connection.id} id={`connection-row-${connection.id}`}>
            <Td dataLabel={columnNames.name}>
              <div>
                <strong>{connection.name}</strong>
                {connection.description && (
                  <div style={{ fontSize: 'var(--pf-t--global--font--size--sm)' }}>
                    {connection.description}
                  </div>
                )}
              </div>
            </Td>
            <Td dataLabel={columnNames.type}>
              <Label color="blue" id={`connection-type-${connection.id}`}>
                {connection.type}
              </Label>
            </Td>
            <Td dataLabel={columnNames.connected}>
              {connection.compatible.length > 0 ? (
                <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                  {connection.compatible.map((item, index) => (
                    <FlexItem key={`${connection.id}-compatible-${index}`}>
                      <Label
                        color="grey"
                        id={`connection-compatible-${connection.id}-${index}`}
                      >
                        {item}
                      </Label>
                    </FlexItem>
                  ))}
                </Flex>
              ) : (
                '-'
              )}
            </Td>
            <Td dataLabel={columnNames.created}>{connection.createdDate}</Td>
            <Td isActionCell>
              <Dropdown
                isOpen={openDropdownId === connection.id}
                onSelect={onSelect}
                onOpenChange={(isOpen) => !isOpen && setOpenDropdownId(null)}
                toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    aria-label={`Actions for ${connection.name}`}
                    variant="plain"
                    onClick={() => onToggle(connection.id)}
                    isExpanded={openDropdownId === connection.id}
                    id={`connection-actions-${connection.id}`}
                  >
                    <EllipsisVIcon />
                  </MenuToggle>
                )}
                shouldFocusToggleOnSelect
              >
                <DropdownList>
                  <DropdownItem
                    key="edit"
                    onClick={() => {
                      onEdit(connection);
                      onSelect();
                    }}
                    id={`edit-connection-${connection.id}`}
                  >
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    onClick={() => {
                      onDelete(connection);
                      onSelect();
                    }}
                    id={`delete-connection-${connection.id}`}
                  >
                    Delete
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

