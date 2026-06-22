import * as React from 'react';
import { 
  Avatar, 
  Badge, 
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownList,
  Grid,
  GridItem,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  TextInput,
  Title
} from '@patternfly/react-core';
import { 
  ChevronDownIcon,
  EllipsisVIcon,
  ListIcon,
  PlusIcon,
  SearchIcon,
  TagIcon,
  ThIcon,
  UsersIcon
} from '@patternfly/react-icons';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

interface Agent {
  id: string;
  name: string;
  description: string;
  models: string[];
  status: 'active' | 'draft' | 'archived';
  lastModified: string;
  evalScore: string | null;
  owner: {
    name: string;
    avatar: string;
  };
  isShared: boolean;
  tags: number;
}

const MyAgents: React.FunctionComponent = () => {
  useDocumentTitle("My Agents");
  
  const [searchValue, setSearchValue] = React.useState('');
  const [statusFilterOpen, setStatusFilterOpen] = React.useState(false);
  const [modelsFilterOpen, setModelsFilterOpen] = React.useState(false);
  const [mcpServerFilterOpen, setMcpServerFilterOpen] = React.useState(false);
  const [tagsFilterOpen, setTagsFilterOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'cards' | 'table'>('cards');
  const [actionMenus, setActionMenus] = React.useState<{ [key: string]: boolean }>({});

  // Agent data matching the prototype
  const agents: Agent[] = [
    {
      id: '1',
      name: 'Customer Support Assistant',
      description: 'Handles customer inquiries and provides support for product-related questions',
      models: ['Granite 3.3'],
      status: 'active',
      lastModified: '12/15/2023',
      evalScore: '92%',
      owner: { name: 'You', avatar: 'https://github.com/yusufhilmi.png' },
      isShared: true,
      tags: 3
    },
    {
      id: '2',
      name: 'Code Assistant',
      description: 'Helps developers with coding tasks, debugging, and code reviews',
      models: ['Granite 4.0', 'GPT-4'],
      status: 'active',
      lastModified: '12/20/2023',
      evalScore: '88%',
      owner: { name: 'You', avatar: 'https://github.com/yusufhilmi.png' },
      isShared: false,
      tags: 3
    },
    {
      id: '3',
      name: 'Sales Assistant',
      description: 'Provides product recommendations and answers sales-related questions',
      models: ['Claude 3 Sonnet'],
      status: 'active',
      lastModified: '11/25/2023',
      evalScore: '95%',
      owner: { name: 'Furkan Ksl', avatar: 'https://github.com/furkanksl.png' },
      isShared: true,
      tags: 3
    },
    {
      id: '4',
      name: 'Research Assistant',
      description: 'Helps with research tasks, information gathering, and summarization',
      models: ['Llama 3 70B'],
      status: 'draft',
      lastModified: '12/5/2023',
      evalScore: null,
      owner: { name: 'You', avatar: 'https://github.com/yusufhilmi.png' },
      isShared: false,
      tags: 3
    },
    {
      id: '5',
      name: 'Marketing Content Generator',
      description: 'Creates marketing content, social media posts, and email campaigns',
      models: ['GPT-4 Turbo'],
      status: 'active',
      lastModified: '12/12/2023',
      evalScore: '90%',
      owner: { name: 'Deniz Buyuktas', avatar: 'https://github.com/denizbuyuktas.png' },
      isShared: true,
      tags: 3
    },
    {
      id: '6',
      name: 'Data Analysis Assistant',
      description: 'Helps with data analysis, visualization, and interpretation',
      models: ['Mistral Large'],
      status: 'archived',
      lastModified: '11/30/2023',
      evalScore: '85%',
      owner: { name: 'Yahya Bedirhan', avatar: 'https://github.com/yahyabedirhan.png' },
      isShared: true,
      tags: 3
    },
    {
      id: '7',
      name: 'HR Assistant',
      description: 'Handles HR-related inquiries, onboarding, and employee support',
      models: ['Claude 3 Opus'],
      status: 'active',
      lastModified: '12/18/2023',
      evalScore: '93%',
      owner: { name: 'You', avatar: 'https://github.com/yusufhilmi.png' },
      isShared: false,
      tags: 3
    },
    {
      id: '8',
      name: 'Legal Document Assistant',
      description: 'Helps with legal document review, summarization, and analysis',
      models: ['GPT-4'],
      status: 'active',
      lastModified: '12/10/2023',
      evalScore: '91%',
      owner: { name: 'Kedar NP', avatar: 'https://github.com/kdrnp.png' },
      isShared: true,
      tags: 3
    },
    {
      id: '9',
      name: 'Product Documentation Assistant',
      description: 'Helps with creating and maintaining product documentation',
      models: ['Granite 3.3'],
      status: 'draft',
      lastModified: '11/15/2023',
      evalScore: null,
      owner: { name: 'You', avatar: 'https://github.com/yusufhilmi.png' },
      isShared: false,
      tags: 3
    },
    {
      id: '10',
      name: 'Financial Advisor',
      description: 'Provides financial advice, budget planning, and investment recommendations',
      models: ['Claude 3 Sonnet', 'GPT-4'],
      status: 'active',
      lastModified: '12/25/2023',
      evalScore: '89%',
      owner: { name: 'Furkan Ksl', avatar: 'https://github.com/furkanksl.png' },
      isShared: true,
      tags: 3
    },
    {
      id: '11',
      name: 'Healthcare Assistant',
      description: 'Provides healthcare information, symptom checking, and medical advice',
      models: ['Llama 3 70B', 'Claude 3 Opus'],
      status: 'active',
      lastModified: '12/8/2023',
      evalScore: '94%',
      owner: { name: 'Deniz Buyuktas', avatar: 'https://github.com/denizbuyuktas.png' },
      isShared: false,
      tags: 3
    },
    {
      id: '12',
      name: 'Travel Planner',
      description: 'Helps with travel planning, itinerary creation, and booking recommendations',
      models: ['GPT-4 Turbo'],
      status: 'archived',
      lastModified: '11/20/2023',
      evalScore: '87%',
      owner: { name: 'Yahya Bedirhan', avatar: 'https://github.com/yahyabedirhan.png' },
      isShared: true,
      tags: 3
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'draft':
        return 'orange';
      case 'archived':
        return 'grey';
      default:
        return 'grey';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const toggleActionMenu = (agentId: string) => {
    setActionMenus(prev => ({
      ...prev,
      [agentId]: !prev[agentId]
    }));
  };

  return (
    <PageSection style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <Title headingLevel="h1" size="2xl">My Agents</Title>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '16rem' }}>
              <SearchIcon style={{ 
                position: 'absolute', 
                left: '0.625rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                fontSize: '1rem',
                color: 'var(--pf-v5-global--Color--200)'
              }} />
              <TextInput
                value={searchValue}
                onChange={(_event, value) => setSearchValue(value)}
                placeholder="Search agents..."
                style={{ paddingLeft: '2rem' }}
              />
            </div>

            {/* View Toggle */}
            <div style={{ display: 'flex', border: '1px solid #d2d2d2', borderRadius: '6px', overflow: 'hidden' }}>
              <Button
                variant={viewMode === 'cards' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('cards')}
                style={{ 
                  borderRadius: 0, 
                  border: 'none', 
                  fontSize: '0.75rem',
                  height: '2rem',
                  paddingLeft: '0.75rem',
                  paddingRight: '0.75rem'
                }}
                icon={<ThIcon style={{ marginRight: '0.5rem' }} />}
              >
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('table')}
                style={{ 
                  borderRadius: 0, 
                  border: 'none', 
                  fontSize: '0.75rem',
                  height: '2rem',
                  paddingLeft: '0.75rem',
                  paddingRight: '0.75rem'
                }}
                icon={<ListIcon style={{ marginRight: '0.5rem' }} />}
              >
                Table
              </Button>
            </div>

                         {/* New Agent Button */}
             <Button variant="primary" icon={<PlusIcon />}>
               New Agent
             </Button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <Card style={{ marginBottom: '1rem' }}>
        <CardBody style={{ padding: 0 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '0.75rem',
            borderRadius: '6px'
          }}>
            {/* Left side - Agent count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                {agents.length} Agents
              </div>
            </div>

            {/* Right side - Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--pf-v5-global--Color--200)' }}>
                Filters:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                {/* Status Filter */}
                <Dropdown
                  isOpen={statusFilterOpen}
                  onSelect={() => setStatusFilterOpen(false)}
                  onOpenChange={(isOpen: boolean) => setStatusFilterOpen(isOpen)}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setStatusFilterOpen(!statusFilterOpen)}
                      isExpanded={statusFilterOpen}
                      variant="secondary"
                      size="sm"
                      style={{
                        border: '1px dashed #d2d2d2',
                        fontSize: '0.75rem',
                        height: '2rem',
                        paddingLeft: '0.75rem',
                        paddingRight: '0.75rem'
                      }}
                    >
                      Status
                      <ChevronDownIcon style={{ marginLeft: '0.25rem' }} />
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem>All</DropdownItem>
                    <DropdownItem>Active</DropdownItem>
                    <DropdownItem>Draft</DropdownItem>
                    <DropdownItem>Archived</DropdownItem>
                  </DropdownList>
                </Dropdown>

                {/* Models Filter */}
                <Dropdown
                  isOpen={modelsFilterOpen}
                  onSelect={() => setModelsFilterOpen(false)}
                  onOpenChange={(isOpen: boolean) => setModelsFilterOpen(isOpen)}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setModelsFilterOpen(!modelsFilterOpen)}
                      isExpanded={modelsFilterOpen}
                      variant="secondary"
                      size="sm"
                      style={{
                        border: '1px dashed #d2d2d2',
                        fontSize: '0.75rem',
                        height: '2rem',
                        paddingLeft: '0.75rem',
                        paddingRight: '0.75rem'
                      }}
                    >
                      Models
                      <ChevronDownIcon style={{ marginLeft: '0.25rem' }} />
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem>All Models</DropdownItem>
                    <DropdownItem>GPT-4</DropdownItem>
                    <DropdownItem>Claude 3</DropdownItem>
                    <DropdownItem>Granite</DropdownItem>
                    <DropdownItem>Llama 3</DropdownItem>
                    <DropdownItem>Mistral</DropdownItem>
                  </DropdownList>
                </Dropdown>

                {/* MCP Servers Filter */}
                <Dropdown
                  isOpen={mcpServerFilterOpen}
                  onSelect={() => setMcpServerFilterOpen(false)}
                  onOpenChange={(isOpen: boolean) => setMcpServerFilterOpen(isOpen)}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setMcpServerFilterOpen(!mcpServerFilterOpen)}
                      isExpanded={mcpServerFilterOpen}
                      variant="secondary"
                      size="sm"
                      style={{
                        border: '1px dashed #d2d2d2',
                        fontSize: '0.75rem',
                        height: '2rem',
                        paddingLeft: '0.75rem',
                        paddingRight: '0.75rem'
                      }}
                    >
                      MCP Servers
                      <ChevronDownIcon style={{ marginLeft: '0.25rem' }} />
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem>All Servers</DropdownItem>
                    <DropdownItem>File System</DropdownItem>
                    <DropdownItem>Database</DropdownItem>
                    <DropdownItem>Web API</DropdownItem>
                  </DropdownList>
                </Dropdown>

                {/* Tags Filter */}
                <Dropdown
                  isOpen={tagsFilterOpen}
                  onSelect={() => setTagsFilterOpen(false)}
                  onOpenChange={(isOpen: boolean) => setTagsFilterOpen(isOpen)}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setTagsFilterOpen(!tagsFilterOpen)}
                      isExpanded={tagsFilterOpen}
                      variant="secondary"
                      size="sm"
                      style={{
                        border: '1px dashed #d2d2d2',
                        fontSize: '0.75rem',
                        height: '2rem',
                        paddingLeft: '0.75rem',
                        paddingRight: '0.75rem'
                      }}
                    >
                      Tags
                      <ChevronDownIcon style={{ marginLeft: '0.25rem' }} />
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem>All Tags</DropdownItem>
                    <DropdownItem>customer-service</DropdownItem>
                    <DropdownItem>development</DropdownItem>
                    <DropdownItem>content</DropdownItem>
                    <DropdownItem>analytics</DropdownItem>
                  </DropdownList>
                </Dropdown>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Agents Grid */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px', 
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <Grid hasGutter style={{ padding: '1rem' }}>
          {agents.map((agent) => (
            <GridItem key={agent.id} md={6} lg={4}>
              <Card 
                style={{
                  borderRadius: '12px',
                  border: '1px solid #e5e5e5',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  height: '100%'
                }}
              >
                <CardHeader style={{ paddingBottom: '0.5rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start' 
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <a href={`/agent/${agent.id}`} style={{ 
                          color: 'inherit', 
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          fontSize: '1.125rem'
                        }}>
                          {agent.name}
                        </a>
                        {agent.isShared && (
                          <UsersIcon style={{ fontSize: '1rem', color: 'var(--pf-v5-global--Color--200)' }} />
                        )}
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        color: 'var(--pf-v5-global--Color--200)',
                        lineHeight: '1.4',
                        marginTop: '0.25rem'
                      }}>
                        {agent.description}
                      </div>
                    </div>
                    <Badge 
                      color={getStatusColor(agent.status)}
                      style={{ 
                        marginLeft: '0.5rem',
                        textTransform: 'capitalize',
                        fontSize: '0.75rem'
                      }}
                    >
                      {getStatusText(agent.status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardBody style={{ paddingTop: 0, paddingBottom: '0.5rem' }}>
                  <Grid hasGutter>
                    <GridItem span={6}>
                      <h4 style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 'bold', 
                        color: 'var(--pf-v5-global--Color--200)',
                        marginBottom: '0.25rem'
                      }}>
                        Models
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {agent.models.map((model, index) => (
                          <div key={index} style={{ fontSize: '0.75rem' }}>
                            {model}
                          </div>
                        ))}
                      </div>
                    </GridItem>
                    <GridItem span={6}>
                      <h4 style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 'bold', 
                        color: 'var(--pf-v5-global--Color--200)',
                        marginBottom: '0.25rem'
                      }}>
                        Tags
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <TagIcon style={{ fontSize: '1rem', color: 'var(--pf-v5-global--Color--200)' }} />
                        <span style={{ fontSize: '0.75rem' }}>{agent.tags}</span>
                      </div>
                    </GridItem>
                  </Grid>

                  <Grid hasGutter style={{ marginTop: '1rem' }}>
                    <GridItem span={6}>
                      <h4 style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 'bold', 
                        color: 'var(--pf-v5-global--Color--200)',
                        marginBottom: '0.25rem'
                      }}>
                        Last Modified
                      </h4>
                      <div style={{ fontSize: '0.75rem' }}>
                        {agent.lastModified}
                      </div>
                    </GridItem>
                    <GridItem span={6}>
                      <h4 style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: 'bold', 
                        color: 'var(--pf-v5-global--Color--200)',
                        marginBottom: '0.25rem'
                      }}>
                        Eval Score
                      </h4>
                      {agent.evalScore ? (
                        <Badge 
                          style={{ 
                            border: '1px solid #d2d2d2',
                            color: '#000',
                            fontSize: '0.75rem',
                            fontFamily: 'monospace'
                          }}
                        >
                          {agent.evalScore}
                        </Badge>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--pf-v5-global--Color--200)' }}>
                          N/A
                        </span>
                      )}
                    </GridItem>
                  </Grid>
                </CardBody>

                <CardFooter style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingTop: '0.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Avatar
                      src={agent.owner.avatar}
                      alt={agent.owner.name}
                      size="sm"
                    />
                    <span style={{ fontSize: '0.75rem' }}>{agent.owner.name}</span>
                  </div>
                  
                  <Dropdown
                    isOpen={actionMenus[agent.id] || false}
                    onSelect={() => setActionMenus({})}
                    onOpenChange={(isOpen: boolean) => 
                      setActionMenus(prev => ({ ...prev, [agent.id]: isOpen }))
                    }
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => toggleActionMenu(agent.id)}
                        variant="plain"
                        aria-label="Actions"
                        style={{ width: '2rem', height: '2rem' }}
                      >
                        <EllipsisVIcon />
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      <DropdownItem>Edit</DropdownItem>
                      <DropdownItem>Duplicate</DropdownItem>
                      <DropdownItem>Share</DropdownItem>
                      <DropdownItem>Delete</DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </CardFooter>
              </Card>
            </GridItem>
          ))}
        </Grid>
      </div>
    </PageSection>
  );
};

export { MyAgents }; 