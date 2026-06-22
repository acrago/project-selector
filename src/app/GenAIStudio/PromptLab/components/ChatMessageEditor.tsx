import * as React from 'react';
import {
  Button,
  Flex,
  FlexItem,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  TextInput,
} from '@patternfly/react-core';
import { PlusIcon, TimesIcon, TrashIcon } from '@patternfly/react-icons';
import { ChatMessage, ChatRole } from '../types';

interface ChatMessageEditorProps {
  messages: ChatMessage[];
  onChange: (messages: ChatMessage[]) => void;
}

const ROLE_OPTIONS: ChatRole[] = ['user', 'system', 'assistant'];

const roleLabels: Record<ChatRole, string> = {
  user: 'User',
  system: 'System',
  assistant: 'Assistant',
};

export const ChatMessageEditor: React.FunctionComponent<ChatMessageEditorProps> = ({
  messages,
  onChange,
}) => {
  const [openRoleSelectIndex, setOpenRoleSelectIndex] = React.useState<number | null>(null);

  const generateId = () => String(Date.now()) + String(Math.random()).slice(2, 8);

  const handleRoleChange = (index: number, role: ChatRole) => {
    const updated = [...messages];
    updated[index] = { ...updated[index], role };
    onChange(updated);
    setOpenRoleSelectIndex(null);
  };

  const handleContentChange = (index: number, content: string) => {
    const updated = [...messages];
    updated[index] = { ...updated[index], content };
    onChange(updated);
  };

  const handleClearContent = (index: number) => {
    const updated = [...messages];
    updated[index] = { ...updated[index], content: '' };
    onChange(updated);
  };

  const handleAddMessage = (index: number) => {
    const updated = [...messages];
    updated.splice(index + 1, 0, { id: generateId(), role: 'user', content: '' });
    onChange(updated);
  };

  const handleRemoveMessage = (index: number) => {
    if (messages.length <= 1) {
      return;
    }
    const updated = messages.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pf-t--global--spacer--sm)' }}>
      {messages.map((message, index) => (
        <Flex
          key={message.id}
          gap={{ default: 'gapSm' }}
          alignItems={{ default: 'alignItemsFlexStart' }}
        >
          <FlexItem style={{ minWidth: '140px' }}>
            <Select
              id={`chat-role-select-${index}`}
              isOpen={openRoleSelectIndex === index}
              selected={message.role}
              onSelect={(_event, value) => handleRoleChange(index, value as ChatRole)}
              onOpenChange={(isOpen) => {
                if (!isOpen) {
                  setOpenRoleSelectIndex(null);
                }
              }}
              toggle={(toggleRef) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() =>
                    setOpenRoleSelectIndex(openRoleSelectIndex === index ? null : index)
                  }
                  isExpanded={openRoleSelectIndex === index}
                  style={{ width: '140px' }}
                >
                  {roleLabels[message.role]}
                </MenuToggle>
              )}
            >
              <SelectList>
                {ROLE_OPTIONS.map((role) => (
                  <SelectOption key={role} value={role}>
                    {roleLabels[role]}
                  </SelectOption>
                ))}
              </SelectList>
            </Select>
          </FlexItem>

          <FlexItem grow={{ default: 'grow' }}>
            <div style={{ position: 'relative' }}>
              <TextInput
                type="text"
                id={`chat-message-content-${index}`}
                value={message.content}
                onChange={(_event, value) => handleContentChange(index, value)}
                placeholder="Enter message content..."
                style={{ paddingRight: '2rem' }}
              />
              {message.content && (
                <Button
                  variant="plain"
                  aria-label="Clear content"
                  onClick={() => handleClearContent(index)}
                  style={{
                    position: 'absolute',
                    right: '0.25rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: '0.25rem',
                  }}
                >
                  <TimesIcon />
                </Button>
              )}
            </div>
          </FlexItem>

          <FlexItem>
            <Button
              variant="plain"
              aria-label="Add message"
              onClick={() => handleAddMessage(index)}
            >
              <PlusIcon />
            </Button>
          </FlexItem>

          <FlexItem>
            <Button
              variant="plain"
              aria-label="Remove message"
              onClick={() => handleRemoveMessage(index)}
              isDisabled={messages.length <= 1}
            >
              <TrashIcon />
            </Button>
          </FlexItem>
        </Flex>
      ))}
    </div>
  );
};
