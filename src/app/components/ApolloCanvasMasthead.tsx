import React, { useState } from 'react';
import {
  Divider,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownList,
  Masthead,
  MastheadContent,
  MenuToggle,
  PageToggleButton,
  SearchInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { CodeBranchIcon, CommentIcon } from '@patternfly/react-icons';

interface ApolloCanvasMastheadProps {
  onLeftDrawerToggle?: () => void;
  onRightDrawerToggle?: () => void;
}

const ApolloCanvasMasthead: React.FC<ApolloCanvasMastheadProps> = ({
  onLeftDrawerToggle: _onLeftDrawerToggle,
  onRightDrawerToggle,
}) => {
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [isReleaseDropdownOpen, setIsReleaseDropdownOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('RHOAI');
  const [selectedRelease, setSelectedRelease] = useState('3.0');
  const [currentBranch, setCurrentBranch] = useState('main');
  const [availableBranches, setAvailableBranches] = useState<Array<{ name: string; commit?: { id: string; short_id: string; message: string; date: string } }>>([]);
  const [branchLoading, setBranchLoading] = useState(false);
  const [branchSearchValue, setBranchSearchValue] = useState('');

  const productOptions = [
    { key: 'acm', label: 'ACM', description: 'Red Hat Advanced Cluster Management for Kubernetes' },
    { key: 'acs', label: 'ACS', description: 'Red HatAdvanced Cluster Security for Kubernetes' },
    { key: 'ansible', label: 'Ansible', description: 'Red Hat Ansible Automation Platform' },
    { key: 'consoledot', label: 'ConsoleDot', description: 'Red Hat ConsoleDot' },
    { key: 'openshift', label: 'OCP', description: 'Red Hat OpenShift Container Platform' },
    { key: 'openshift-virtualization', label: 'OCP Virt', description: 'Red Hat OpenShift Virtualization' },
    { key: 'rhdh', label: 'RHDH', description: 'Red Hat Developer Hub' },
    { key: 'rhel', label: 'RHEL', description: 'Red Hat Enterprise Linux' },
    { key: 'openshift-ai', label: 'RHOAI', description: 'Red Hat OpenShift AI' },
  ];

  const releaseOptionGroups = [
    {
      groupLabel: 'Prototypes',
      options: [
        { key: 'now', label: '3.0', description: undefined },
        { key: 'next', label: '3.1', description: undefined },
        { key: 'future', label: '3.next', description: undefined },
      ]
    },
    {
      groupLabel: 'Upstreams',
      options: [
        { key: 'odh-dashboard', label: 'ODH Dashboard', description: 'red-hat-data-services/odh-dashboard' },
      ]
    }
  ];

  // Product to repository mapping
  const productRepoMap: Record<string, { gitlabUrl: string; localPath: string }> = {
    'RHOAI': {
      gitlabUrl: 'git@gitlab.cee.redhat.com:uxd/apollo/openshift-ai.git',
      localPath: 'projects/redhat/openshift-ai/code'
    }
    // Add more products as needed
  };

  const handleProductSelect = (option: { key: string; label: string; description: string }) => {
    setSelectedProduct(option.label);
    setIsProductDropdownOpen(false);
    // Reset branch-related state when product changes
    setCurrentBranch('main');
    setAvailableBranches([]);
    setBranchSearchValue('');
  };

  const handleReleaseSelect = (option: { key: string; label: string; description?: string }) => {
    setSelectedRelease(option.label);
    setIsReleaseDropdownOpen(false);
  };

  // Fetch available branches for the current product
  const fetchBranches = async () => {
    const productConfig = productRepoMap[selectedProduct];
    if (!productConfig) {
      console.warn(`No repository configuration found for product: ${selectedProduct}`);
      return;
    }

    setBranchLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/git/gitlab-branches?repoPath=${encodeURIComponent(productConfig.localPath)}`);
      const result = await response.json();
      
      if (result.success) {
        setAvailableBranches(result.branches || []);
      } else {
        console.error('Failed to fetch branches:', result.error);
        setAvailableBranches([]);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      setAvailableBranches([]);
    } finally {
      setBranchLoading(false);
    }
  };

  // Get current branch when product changes
  const getCurrentBranch = async () => {
    const productConfig = productRepoMap[selectedProduct];
    if (!productConfig) return;

    try {
      const response = await fetch(`http://localhost:3001/api/git/current-branch?repoPath=${encodeURIComponent(productConfig.localPath)}`);
      const result = await response.json();
      
      if (result.success) {
        setCurrentBranch(result.branch);
      }
    } catch (error) {
      console.error('Error fetching current branch:', error);
    }
  };

  // Switch to selected branch
  const handleBranchSelect = async (branchName: string) => {
    const productConfig = productRepoMap[selectedProduct];
    if (!productConfig) return;

    setBranchLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/git/switch-branch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          branch: branchName,
          repoPath: productConfig.localPath
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setCurrentBranch(branchName);
        console.log('Branch switched successfully:', result.message);
      } else {
        console.error('Failed to switch branch:', result.error);
      }
    } catch (error) {
      console.error('Error switching branch:', error);
    } finally {
      setBranchLoading(false);
      setIsBranchDropdownOpen(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString || dateString === 'unknown') return 'Unknown date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Filter branches based on search
  const filteredBranches = availableBranches.filter(branch => 
    branch.name.toLowerCase().includes(branchSearchValue.toLowerCase()) ||
    (branch.commit?.message || '').toLowerCase().includes(branchSearchValue.toLowerCase())
  );

  // Load current branch when component mounts or product changes
  React.useEffect(() => {
    getCurrentBranch();
  }, [selectedProduct]);

  return (
    <Masthead role="banner" aria-label="Apollo Canvas masthead" id="apollo-canvas-masthead">

      <MastheadContent>
        <Toolbar isFullHeight id="apollo-toolbar">
          <ToolbarContent>
          <Title headingLevel="h1" size="lg" id="uxd-prototype-title">
            UXD Prototype
          </Title>
            <ToolbarGroup variant="action-group-plain" id="apollo-toolbar-selectors">
              <ToolbarItem>
                <Dropdown
                  id="apollo-product-dropdown"
                  onOpenChange={(isOpen) => setIsProductDropdownOpen(isOpen)}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      id="apollo-product-menu-toggle"
                      ref={toggleRef}
                      onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                      isExpanded={isProductDropdownOpen}
                      variant="plainText"
                    >
                      Product: {selectedProduct}
                    </MenuToggle>
                  )}
                  isOpen={isProductDropdownOpen}
                >
                  <DropdownList>
                    {productOptions.map((option) => (
                      <DropdownItem
                        key={option.key}
                        id={`apollo-product-${option.key}`}
                        onClick={() => handleProductSelect(option)}
                        description={option.description}
                      >
                        {option.label}
                      </DropdownItem>
                    ))}
                  </DropdownList>
                </Dropdown>
              </ToolbarItem>
              <ToolbarItem>
                <Dropdown
                  id="apollo-release-dropdown"
                  onOpenChange={(isOpen) => setIsReleaseDropdownOpen(isOpen)}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      id="apollo-release-menu-toggle"
                      ref={toggleRef}
                      onClick={() => setIsReleaseDropdownOpen(!isReleaseDropdownOpen)}
                      isExpanded={isReleaseDropdownOpen}
                      variant="plainText"
                    >
                      Release: {selectedRelease}
                    </MenuToggle>
                  )}
                  isOpen={isReleaseDropdownOpen}
                >
                  <DropdownList>
                    {releaseOptionGroups.map((group) => (
                      <DropdownGroup key={group.groupLabel} label={group.groupLabel}>
                        {group.options.map((option) => (
                          <DropdownItem
                            key={option.key}
                            id={`apollo-release-${option.key}`}
                            onClick={() => handleReleaseSelect(option)}
                            description={option.description}
                          >
                            {option.label}
                          </DropdownItem>
                        ))}
                        <Divider />
                      </DropdownGroup>
                    ))}
                  </DropdownList>
                </Dropdown>
              </ToolbarItem>
              <ToolbarItem>
                <Dropdown
                  id="apollo-branch-dropdown"
                  onOpenChange={(isOpen) => {
                    setIsBranchDropdownOpen(isOpen);
                    if (isOpen) {
                      fetchBranches();
                    } else {
                      setBranchSearchValue('');
                    }
                  }}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      id="apollo-branch-menu-toggle"
                      ref={toggleRef}
                      onClick={() => {
                        const newState = !isBranchDropdownOpen;
                        setIsBranchDropdownOpen(newState);
                        if (newState) {
                          fetchBranches();
                        } else {
                          setBranchSearchValue('');
                        }
                      }}
                      isExpanded={isBranchDropdownOpen}
                      variant="plainText"
                      icon={<CodeBranchIcon />}
                      isDisabled={branchLoading || !productRepoMap[selectedProduct]}
                    >
                      Branch: {branchLoading ? 'Loading...' : currentBranch}
                    </MenuToggle>
                  )}
                  isOpen={isBranchDropdownOpen}
                >
                  <DropdownList 
                    style={{ 
                      maxHeight: '400px', 
                      maxWidth: '500px', 
                      overflowY: 'auto' 
                    }}
                  >
                    {availableBranches.length > 0 && (
                      <div style={{ padding: '8px', borderBottom: '1px solid var(--pf-v5-global--BorderColor--100)' }}>
                        <SearchInput
                          id="apollo-branch-search"
                          placeholder="Search branches..."
                          value={branchSearchValue}
                          onChange={(_, value) => setBranchSearchValue(value)}
                          onClear={() => setBranchSearchValue('')}
                          style={{ width: '100%' }}
                        />
                      </div>
                    )}
                    {availableBranches.length > 0 ? (
                      filteredBranches.length > 0 ? (
                        filteredBranches.map((branch) => (
                          <DropdownItem
                            key={branch.name}
                            id={`apollo-branch-${branch.name}`}
                            onClick={() => handleBranchSelect(branch.name)}
                            description={
                              branch.commit ? 
                                `${formatDate(branch.commit.date)} • ${branch.commit.short_id}: ${branch.commit.message}` : 
                                undefined
                            }
                          >
                            {branch.name}
                          </DropdownItem>
                        ))
                      ) : (
                        <DropdownItem isDisabled>
                          <span style={{ fontSize: '0.875rem', color: 'var(--pf-v5-global--Color--200)' }}>
                            No branches match "{branchSearchValue}"
                          </span>
                        </DropdownItem>
                      )
                    ) : (
                      <DropdownItem isDisabled>
                        {branchLoading ? 'Loading branches...' : 'No branches available'}
                      </DropdownItem>
                    )}
                  </DropdownList>
                </Dropdown>
              </ToolbarItem>
              <ToolbarItem>
                {/*}
                <Dropdown
                  onOpenChange={(isOpen) => setIsIterationDropdownOpen(isOpen)}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setIsIterationDropdownOpen(!isIterationDropdownOpen)}
                      isExpanded={isIterationDropdownOpen}
                      variant="plainText"
                    >
                      Iteration: {selectedIteration}
                    </MenuToggle>
                  )}
                  isOpen={isIterationDropdownOpen}
                >
                  <DropdownList>
                    {iterationOptions.map((option) => (
                      <DropdownItem
                        key={option.key}
                        onClick={() => handleIterationSelect(option)}
                      >
                        {option.label}
                      </DropdownItem>
                    ))}
                  </DropdownList>
                </Dropdown>
                */}
              </ToolbarItem>

            </ToolbarGroup>
            <ToolbarGroup variant="action-group-plain" align={{ default: 'alignEnd' }} id="apollo-toolbar-actions">

              {onRightDrawerToggle && (
                <ToolbarItem>
                  <PageToggleButton
                    id="apollo-right-drawer-toggle"
                    variant="plain"
                    aria-label="Toggle right drawer"
                    onClick={onRightDrawerToggle}
                  >
                    <CommentIcon />
                  </PageToggleButton>
                </ToolbarItem>
              )}
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </MastheadContent>
    </Masthead>
  );
};

export default ApolloCanvasMasthead;

