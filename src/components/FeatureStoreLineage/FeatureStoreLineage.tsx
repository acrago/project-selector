import * as React from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  List,
  ListItem,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Switch,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import { CompressIcon, ExpandIcon, MinusIcon, PlusIcon, SearchIcon, TimesIcon } from '@patternfly/react-icons';
import {
  LineageNode as LineageNodeType,
  generateLineageData,
  mockDataSources,
  mockFeatureServices,
  mockFeatureViews,
} from '../../mockData/featureStore';
import { mockEntities } from '../../mockData/entities';

// ============================================
// Custom SVG Icons (matching Overview page)
// ============================================
const EntitiesIcon = () => (
  <svg viewBox="0 0 36 36" fill="currentColor" width="20" height="20">
    <path d="M28.125,9c0-1.99902-1.62598-3.625-3.625-3.625s-3.625,1.62598-3.625,3.625c0,1.78497,1.29919,3.26373,3,3.56177v2.43823c0,1.30957-1.06543,2.375-2.375,2.375h-6c-1.33502,0-2.53003.57721-3.375,1.48492v-8.29816c1.70081-.29803,3-1.77679,3-3.56177,0-1.99902-1.62598-3.625-3.625-3.625s-3.625,1.62598-3.625,3.625c0,1.78497,1.29919,3.26373,3,3.56177v14.87646c-1.70081.29803-3,1.77679-3,3.56177,0,1.99902,1.62598,3.625,3.625,3.625s3.625-1.62598,3.625-3.625c0-1.78497-1.29919-3.26373-3-3.56177v-3.43823c0-1.86133,1.51416-3.375,3.375-3.375h6c1.99902,0,3.625-1.62598,3.625-3.625v-2.43823c1.70081-.29803,3-1.77679,3-3.56177ZM9.125,7c0-1.30957,1.06543-2.375,2.375-2.375s2.375,1.06543,2.375,2.375-1.06543,2.375-2.375,2.375-2.375-1.06543-2.375-2.375ZM13.875,29c0,1.30957-1.06543,2.375-2.375,2.375s-2.375-1.06543-2.375-2.375,1.06543-2.375,2.375-2.375,2.375,1.06543,2.375,2.375ZM24.5,11.375c-1.30957,0-2.375-1.06543-2.375-2.375s1.06543-2.375,2.375-2.375,2.375,1.06543,2.375,2.375-1.06543,2.375-2.375,2.375Z"></path>
  </svg>
);

const DataSourcesIcon = () => (
  <svg viewBox="0 0 36 36" fill="currentColor" width="20" height="20">
    <path d="M22.8457,16.3933c.1934-.1118.3125-.3184.3125-.5415v-5.2344c0-.2231-.1191-.4297-.3125-.5415l-4.5332-2.6172c-.1934-.1113-.4316-.1113-.625,0l-4.5332,2.6172c-.1934.1118-.3125.3184-.3125.5415v5.2344c0,.2231.1191.4297.3125.5415l4.5332,2.6172c.0967.0557.2046.0835.3125.0835s.2158-.0278.3125-.0835l4.5332-2.6172ZM14.0918,15.491v-4.5127l3.9082-2.2563,3.9082,2.2563v4.5127l-3.9082,2.2563-3.9082-2.2563Z M23.7832,28.5417l4.5332-2.6172c.1934-.1118.3125-.3184.3125-.5415v-5.2349c0-.2231-.1191-.4297-.3125-.5415l-4.5332-2.6172c-.1934-.1113-.4316-.1113-.625,0l-4.5332,2.6172c-.1934.1118-.3125.3184-.3125.5415v5.2349c0,.2231.1191.4297.3125.5415l4.5332,2.6172c.0967.0557.2046.0835.3125.0835s.2158-.0278.3125-.0835ZM19.5625,25.0222v-4.5132l3.9082-2.2563,3.9082,2.2563v4.5132l-3.9082,2.2563s-3.9082-2.2563-3.9082-2.2563Z M12.8418,16.9895c-.1934-.1113-.4316-.1113-.625,0l-4.5332,2.6172c-.1934.1118-.3125.3184-.3125.5415v5.2349c0,.2231.1191.4297.3125.5415l4.5332,2.6172c.0967.0557.2046.0835.3125.0835s.2158-.0278.3125-.0835l4.5332-2.6172c.1934-.1118.3125-.3184.3125-.5415v-5.2349c0-.2231-.1191-.4297-.3125-.5415,0,0-4.5332-2.6172-4.5332-2.6172ZM16.4375,25.0222l-3.9082,2.2563-3.9082-2.2563v-4.5132l3.9082-2.2563,3.9082,2.2563v4.5132Z M12,30.3752h-6.375V5.6252h6.375c.3452,0,.625-.2798.625-.625s-.2798-.625-.625-.625h-7c-.3452,0-.625.2798-.625.625v26c0,.3452.2798.625.625.625h7c.3452,0,.625-.2798.625-.625s-.2798-.625-.625-.625Z M31,4.3752h-7c-.3452,0-.625.2798-.625.625s.2798.625.625.625h6.375v24.75h-6.375c-.3452,0-.625.2798-.625.625s.2798.625.625.625h7c.3452,0,.625-.2798.625-.625V5.0002c0-.3452-.2798-.625-.625-.625Z"></path>
  </svg>
);

const FeatureViewsIcon = () => (
  <svg viewBox="0 0 36 36" fill="currentColor" width="20" height="20">
    <path d="M25.625,22v-14c0-.34473-.27979-.625-.625-.625H5c-.34521,0-.625.28027-.625.625v14c0,.34473.27979.625.625.625h20c.34521,0,.625-.28027.625-.625ZM24.375,21.375H5.625v-12.75h18.75v12.75Z M28.625,25v-14c0-.34473-.27979-.625-.625-.625s-.625.28027-.625.625v13.375H8c-.34521,0-.625.28027-.625.625s.27979.625.625.625h20c.34521,0,.625-.28027.625-.625Z M31,13.375c-.34521,0-.625.28027-.625.625v13.375H11c-.34521,0-.625.28027-.625.625s.27979.625.625.625h20c.34521,0,.625-.28027.625-.625v-14c0-.34473-.27979-.625-.625-.625Z"></path>
  </svg>
);

const FeatureServicesIcon = () => (
  <svg viewBox="0 0 36 36" fill="currentColor" width="20" height="20">
    <path d="M16,7.375H5c-.34521,0-.625.28027-.625.625v8c0,.34473.27979.625.625.625h11c.34521,0,.625-.28027.625-.625v-8c0-.34473-.27979-.625-.625-.625ZM15.375,15.375H5.625v-6.75h9.75v6.75Z M31,7.375h-11c-.34521,0-.625.28027-.625.625v8c0,.34473.27979.625.625.625h11c.34521,0,.625-.28027.625-.625v-8c0-.34473-.27979-.625-.625-.625ZM30.375,15.375h-9.75v-6.75h9.75v6.75Z M16,19.375H5c-.34521,0-.625.28027-.625.625v8c0,.34473.27979.625.625.625h11c.34521,0,.625-.28027.625-.625v-8c0-.34473-.27979-.625-.625-.625ZM15.375,27.375H5.625v-6.75h9.75v6.75Z M31,19.375h-11c-.34521,0-.625.28027-.625.625v8c0,.34473.27979.625.625.625h11c.34521,0,.625-.28027.625-.625v-8c0-.34473-.27979-.625-.625-.625ZM30.375,27.375h-9.75v-6.75h9.75v6.75Z"></path>
  </svg>
);

// ============================================
// Node Color Themes - Icons use colored outlines only
// ============================================
const NODE_COLORS = {
  entity: {
    iconColor: '#6a6e73', // Darker gray for better readability on canvas (matches PatternFly text color)
  },
  dataSource: {
    iconColor: '#0066cc', // Blue for data source icons
  },
  featureView: {
    iconColor: '#6753ac', // Purple for feature view icons
  },
  featureService: {
    iconColor: '#3e8635', // Green for feature service icons
  },
};

// Default node styling
const DEFAULT_NODE_BORDER = '#d2d2d2';

// Node layout constants - PatternFly strict standards
const NODE_PADDING_HORIZONTAL = 8; // Edge padding (left and right)
const ELEMENT_GAP = 8; // Gap between Icon, Text, and Badge
const ICON_SIZE = 28; // Icon size (increased from 24 to 28 for better visibility)
const MAX_NODE_WIDTH = 184; // Maximum node width before truncation
const WIDTH_BUFFER = 4; // Breathing room buffer to prevent CSS truncation for short text due to sub-pixel font rendering
const ZOOM_THRESHOLD = 0.7; // Zoom threshold for condensed view (scale < 0.7)
const CONDENSED_NODE_SIZE = 32; // Fixed size for condensed (circular) nodes

// Canvas for text measurement (created once and reused)
let textMeasurementCanvas: HTMLCanvasElement | null = null;
const getTextMeasurementCanvas = (): HTMLCanvasElement => {
  if (!textMeasurementCanvas) {
    textMeasurementCanvas = document.createElement('canvas');
  }
  return textMeasurementCanvas;
};

// Helper function to measure text width using canvas
// CRITICAL: Must use PatternFly font family to match rendered UI
const measureTextWidth = (text: string, fontSize: string, fontWeight: number): number => {
  const canvas = getTextMeasurementCanvas();
  const context = canvas.getContext('2d');
  if (!context) return text.length * 7; // Fallback estimate
  
  // Use PatternFly font stack to match actual rendered text
  // PatternFly uses "Red Hat Text" and "Red Hat Display" fonts
  const fontFamily = '"Red Hat Text", "Red Hat Display", sans-serif';
  context.font = `${fontWeight} ${fontSize} ${fontFamily}`;
  return context.measureText(text).width;
};

// PatternFly typography classes
// body-small-semibold: font-size: 12px, line-height: 18px, font-weight: 600
// body-small-regular: font-size: 12px, line-height: 18px, font-weight: 400

// ============================================
// Types for positioned nodes
// ============================================
interface PositionedNode {
  node: LineageNodeType;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PositionedEdge {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

// ============================================
// Node Content Sub-Component (Unified Render Path)
// ============================================
interface NodeContentProps {
  nodeType: string;
  nodeWidth: number;
  resourceType: string;
  resourceName: string;
  iconColor: string;
  textColor: string;
  hasBadge: boolean;
  isSelected: boolean;
  featureCount?: number;
}

// Unified node content component - used in both standard and hovered/selected views
// This guarantees identical behavior for all node types including entities
const NodeContent: React.FC<NodeContentProps> = ({
  nodeType,
  nodeWidth,
  resourceType,
  resourceName,
  iconColor,
  textColor,
  hasBadge,
  isSelected,
  featureCount,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'entity':
        return <EntitiesIcon />;
      case 'dataSource':
        return <DataSourcesIcon />;
      case 'featureView':
        return <FeatureViewsIcon />;
      case 'featureService':
        return <FeatureServicesIcon />;
      default:
        return <EntitiesIcon />;
    }
  };

  return (
    <foreignObject 
      width={nodeWidth} 
      height={29} 
      x={0} 
      y={0}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        padding: '0 8px',
        boxSizing: 'border-box',
        width: '100%',
        pointerEvents: 'auto', // Ensure pointer events work for tooltip
      }}>
        {/* Icon */}
        <div style={{ 
          flexShrink: 0, 
          width: 28, 
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: iconColor,
          marginRight: '4px', // 4px gap between icon and text
        }}> 
          {getIcon(nodeType)} 
        </div>

        {/* Text Group - Unified render path for all node types */}
        {/* Type span: Always 600 (Semi-Bold), Name span: Always 400 (Regular) for ALL node types */}
        <div style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flexGrow: 1,
          fontSize: '12px',
          lineHeight: '29px',
          color: textColor,
          // Ensure no font-weight is applied to parent - only to individual spans
        }}>
          {resourceType && (
            <span style={{ fontWeight: 600 }}>{resourceType} </span>
          )}
          <span style={{ fontWeight: 400 }}>
            {resourceName}
          </span>
        </div>

        {/* Badge */}
        {hasBadge && (
          <div style={{
            flexShrink: 0,
            height: '16px',
            padding: '0 8px',
            backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : '#d2d2d2',
            color: isSelected ? 'white' : '#151515',
            borderRadius: '8px',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: '16px',
            marginLeft: '8px', // 8px gap between text and badge
          }}>
            {featureCount} features
          </div>
        )}
      </div>
    </foreignObject>
  );
};

// ============================================
// Main Lineage Component
// ============================================
interface FeatureStoreLineageProps {
  selectedFeatureStore: string;
  hideEmptyStates?: boolean; // Skip empty states when used in detail pages
  rootNodeId?: string; // Single resource mode: focus on a specific node (e.g., "featureview-fv-001")
}

export const FeatureStoreLineage: React.FC<FeatureStoreLineageProps> = ({ selectedFeatureStore, hideEmptyStates = false, rootNodeId }) => {
  const navigate = useNavigate();
  
  // State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Entity');
  const [isCategorySelectOpen, setIsCategorySelectOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [isResourceSelectOpen, setIsResourceSelectOpen] = useState(false);
  const [resourceSearchValue, setResourceSearchValue] = useState('');
  const [hideUnconnected, setHideUnconnected] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const graphGroupRef = useRef<SVGGElement>(null);
  // Popover state - only store the node ID, position calculated dynamically based on pan/zoom
  const [popoverNodeId, setPopoverNodeId] = useState<string | null>(null);
  // Popover position state - updated via useLayoutEffect for smooth positioning
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number; showBelow: boolean } | null>(null);
  
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [hoveredCondensedNodeId, setHoveredCondensedNodeId] = useState<string | null>(null);
  
  // Derived state: determine if we're in condensed view based on zoom threshold
  // Use explicit comparison to ensure all nodes switch when threshold is hit
  const isCondensedView = zoom < ZOOM_THRESHOLD;
  
  // Generate lineage data
  // In Single Resource Mode (rootNodeId present), bypass the "All feature stores" check
  // and generate data for the feature store that contains the root node
  const lineageData = useMemo(() => {
    // Single Resource Mode: If rootNodeId is provided, we need to find which feature store it belongs to
    if (rootNodeId) {
      // Extract resource type and ID from rootNodeId (e.g., "featureview-fv-001")
      let resourceType: string | null = null;
      let resourceId: string | null = null;
      
      if (rootNodeId.startsWith('entity-')) {
        resourceType = 'entity';
        resourceId = rootNodeId.replace('entity-', '');
      } else if (rootNodeId.startsWith('datasource-')) {
        resourceType = 'dataSource';
        resourceId = rootNodeId.replace('datasource-', '');
      } else if (rootNodeId.startsWith('featureview-')) {
        resourceType = 'featureView';
        resourceId = rootNodeId.replace('featureview-', '');
      } else if (rootNodeId.startsWith('featureservice-')) {
        resourceType = 'featureService';
        resourceId = rootNodeId.replace('featureservice-', '');
      }
      
      // Find the feature store for this resource
      if (resourceType === 'featureView' && resourceId) {
        const featureView = mockFeatureViews.find(fv => fv.id === resourceId);
        if (featureView) {
          return generateLineageData(featureView.featureStore);
        }
      } else if (resourceType === 'entity' && resourceId) {
        const entity = mockEntities.find(e => e.id === resourceId);
        if (entity) {
          return generateLineageData(entity.featureStore);
        }
      } else if (resourceType === 'dataSource' && resourceId) {
        const dataSource = mockDataSources.find(ds => ds.id === resourceId);
        if (dataSource) {
          return generateLineageData(dataSource.featureStore);
        }
      } else if (resourceType === 'featureService' && resourceId) {
        const featureService = mockFeatureServices.find(fs => fs.id === resourceId);
        if (featureService) {
          return generateLineageData(featureService.featureStore);
        }
      }
      
      // Fallback: return empty if we can't find the resource
      return { nodes: [], edges: [] };
    }
    
    // Overview Mode: Normal behavior
    if (selectedFeatureStore === 'All feature stores') {
      return { nodes: [], edges: [] };
    }
    return generateLineageData(selectedFeatureStore);
  }, [selectedFeatureStore, rootNodeId]);
  
  // Calculate filtered nodes and edges based on selected resource OR rootNodeId
  const filteredLineageData = useMemo(() => {
    // Single Resource Mode: If rootNodeId is provided, filter to show only that node's connections
    const nodeIdToFilter = rootNodeId || (selectedResourceId ? (() => {
      // Map resource ID to graph node ID based on category
      switch (selectedCategory) {
        case 'Entity':
          return `entity-${selectedResourceId}`;
        case 'Data source':
          return `datasource-${selectedResourceId}`;
        case 'Feature view':
          return `featureview-${selectedResourceId}`;
        case 'Feature service':
          return `featureservice-${selectedResourceId}`;
        default:
          return null;
      }
    })() : null);
    
    if (!nodeIdToFilter) {
      return lineageData;
    }
    
    // Use the nodeIdToFilter (either from rootNodeId or selectedResourceId)
    const selectedNodeIdInGraph = nodeIdToFilter;
    
    // Build adjacency maps for BFS
    const forwardMap = new Map<string, string[]>();
    const backwardMap = new Map<string, string[]>();
    
    lineageData.edges.forEach(edge => {
      if (!forwardMap.has(edge.source)) {
        forwardMap.set(edge.source, []);
      }
      forwardMap.get(edge.source)!.push(edge.target);
      
      if (!backwardMap.has(edge.target)) {
        backwardMap.set(edge.target, []);
      }
      backwardMap.get(edge.target)!.push(edge.source);
    });
    
    // BFS to find all connected nodes (ancestors and descendants)
    const connectedNodeIds = new Set<string>([selectedNodeIdInGraph]);
    const queue = [selectedNodeIdInGraph];
    const visited = new Set<string>([selectedNodeIdInGraph]);
    
    // Find downstream (descendants)
    while (queue.length > 0) {
      const current = queue.shift()!;
      const targets = forwardMap.get(current) || [];
      targets.forEach(target => {
        if (!visited.has(target)) {
          visited.add(target);
          connectedNodeIds.add(target);
          queue.push(target);
        }
      });
    }
    
    // Reset queue for upstream (ancestors)
    queue.push(selectedNodeIdInGraph);
    visited.clear();
    visited.add(selectedNodeIdInGraph);
    
    // Find upstream (ancestors)
    while (queue.length > 0) {
      const current = queue.shift()!;
      const sources = backwardMap.get(current) || [];
      sources.forEach(source => {
        if (!visited.has(source)) {
          visited.add(source);
          connectedNodeIds.add(source);
          queue.push(source);
        }
      });
    }
    
    // Filter nodes and edges
    const filteredNodes = lineageData.nodes.filter(node => connectedNodeIds.has(node.id));
    const filteredEdges = lineageData.edges.filter(edge => 
      connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target)
    );
    
    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  }, [lineageData, selectedResourceId, selectedCategory, rootNodeId]);
  
  // Get resource options based on selected category
  const resourceOptions = useMemo(() => {
    // Filter resources by selected feature store
    const filteredResources: Array<{ id: string; name: string; description: string }> = [];
    
    switch (selectedCategory) {
      case 'Entity':
        filteredResources.push(...mockEntities.filter(e => e.featureStore === selectedFeatureStore));
        break;
      case 'Data source':
        filteredResources.push(...mockDataSources.filter(ds => ds.featureStore === selectedFeatureStore));
        break;
      case 'Feature view':
        filteredResources.push(...mockFeatureViews.filter(fv => fv.featureStore === selectedFeatureStore));
        break;
      case 'Feature service':
        filteredResources.push(...mockFeatureServices.filter(fs => fs.featureStore === selectedFeatureStore));
        break;
    }
    
    return filteredResources;
  }, [selectedCategory, selectedFeatureStore]);
  
  // Filter resource options based on search value
  const filteredResourceOptions = useMemo(() => {
    if (!resourceSearchValue) return resourceOptions;
    
    const searchLower = resourceSearchValue.toLowerCase();
    return resourceOptions.filter(resource => {
      const name = resource.name?.toLowerCase() || '';
      const description = resource.description?.toLowerCase() || '';
      return name.includes(searchLower) || description.includes(searchLower);
    });
  }, [resourceOptions, resourceSearchValue]);
  
  // Calculate connected paths - this is the highlighted path when a node is selected
  // Inline implementation for proper path finding
  const highlightedPath = useMemo(() => {
    if (!selectedNodeId) {
      return { nodes: new Set<string>(), edges: new Set<string>() };
    }
    
    const edges = filteredLineageData.edges;
    const connectedNodes = new Set<string>();
    const connectedEdgeIds = new Set<string>();
    
    // Build adjacency maps
    const forwardMap = new Map<string, Array<{ target: string; edgeId: string }>>();
    const backwardMap = new Map<string, Array<{ source: string; edgeId: string }>>();
    
    edges.forEach(edge => {
      // Forward: source -> targets (for downstream)
      if (!forwardMap.has(edge.source)) {
        forwardMap.set(edge.source, []);
      }
      forwardMap.get(edge.source)!.push({ target: edge.target, edgeId: edge.id });
      
      // Backward: target -> sources (for upstream)
      if (!backwardMap.has(edge.target)) {
        backwardMap.set(edge.target, []);
      }
      backwardMap.get(edge.target)!.push({ source: edge.source, edgeId: edge.id });
    });
    
    // BFS to find downstream nodes
    const downstreamQueue = [selectedNodeId];
    const downstreamVisited = new Set<string>([selectedNodeId]);
    
    while (downstreamQueue.length > 0) {
      const current = downstreamQueue.shift()!;
      const targets = forwardMap.get(current) || [];
      
      targets.forEach(({ target, edgeId }) => {
        if (!downstreamVisited.has(target)) {
          downstreamVisited.add(target);
          connectedNodes.add(target);
          connectedEdgeIds.add(edgeId);
          downstreamQueue.push(target);
        }
      });
    }
    
    // BFS to find upstream nodes
    const upstreamQueue = [selectedNodeId];
    const upstreamVisited = new Set<string>([selectedNodeId]);
    
    while (upstreamQueue.length > 0) {
      const current = upstreamQueue.shift()!;
      const sources = backwardMap.get(current) || [];
      
      sources.forEach(({ source, edgeId }) => {
        if (!upstreamVisited.has(source)) {
          upstreamVisited.add(source);
          connectedNodes.add(source);
          connectedEdgeIds.add(edgeId);
          upstreamQueue.push(source);
        }
      });
    }
    
    return { nodes: connectedNodes, edges: connectedEdgeIds };
  }, [selectedNodeId, filteredLineageData.edges]);
  
  // Helper function to measure badge width
  const measureBadgeWidth = useCallback((featureCount: number): number => {
    const badgeText = `${featureCount} features`;
    // Badge text uses 10px font size
    return measureTextWidth(badgeText, '10px', 400) + 16; // Add padding (8px each side)
  }, []);
  
  // Helper function to calculate node width and truncation using strict PatternFly algorithm
  const calculateNodeLayout = useCallback((node: LineageNodeType): {
    nodeWidth: number;
    displayText: string;
    badgeWidth: number;
    isTruncated: boolean;
  } => {
      const hasBadge = node.data.featureCount !== undefined;
      
      // Measure badge width if present
      const badgePixelWidth = hasBadge ? measureBadgeWidth(node.data.featureCount!) : 0;
      
      // Measure full text width - MUST match rendering exactly
      // Type label: Always fontWeight 600 (Semi-Bold)
      // Name: Always fontWeight 400 (Regular) for ALL node types including entities
      const labelParts = node.label.split(': ');
      const resourceType = labelParts.length > 1 ? labelParts[0] + ':' : '';
      const resourceName = labelParts.length > 1 ? labelParts.slice(1).join(': ') : node.label;
      
      // CRITICAL: Measure type and name separately with correct font weights
      // The rendering shows: <span>{resourceType} </span><span>{resourceName}</span>
      // resourceType already includes the colon (e.g., "Entity:"), so we add space to match rendering
      // MUST include colon in measurement - it's part of resourceType
      const typeText = resourceType ? resourceType + ' ' : ''; // Includes colon and space: "Entity: "
      const typeWidth = typeText ? measureTextWidth(typeText, '12px', 600) : 0;
      
      // Name is ALWAYS 400 (Regular) for all node types
      const nameWidth = measureTextWidth(resourceName, '12px', 400);
      
      // Total text width = type width + name width (no extra gap, they're adjacent)
      const textPixelWidth = typeWidth + nameWidth;
      
      // Calculate content width: Padding(8) + Icon(24) + Gap(4) + text + Gap(8) + badge + Padding(8)
      // Icon-text gap is 4px, text-badge gap is 8px
      const iconTextGap = 4; // Gap between icon and text
      const textBadgeGap = ELEMENT_GAP; // Gap between text and badge (8px)
      const contentWidth = NODE_PADDING_HORIZONTAL + ICON_SIZE + iconTextGap + 
                          textPixelWidth + (hasBadge ? textBadgeGap + badgePixelWidth : 0) + 
                          NODE_PADDING_HORIZONTAL;
      
      // Case A: Short Text (contentWidth <= maxWidth - 12px buffer)
      // Use 12px safety buffer to force tooltip if text is even close to the edge
      // This prevents "dead zones" where text is cut off without a tooltip
      // Increased to 12px to account for font loading race conditions
      // (Canvas may measure with Arial fallback before "Red Hat Text" loads, causing width mismatch)
      const TRUNCATION_BUFFER = 12; // 12px buffer to ensure tooltip appears (aggressive for font loading)
      if (contentWidth <= (MAX_NODE_WIDTH - TRUNCATION_BUFFER)) {
        // Add breathing room buffer to prevent CSS truncation for short text
        // If math measures 100px but browser renders 101px (sub-pixel rendering),
        // the 4px buffer ensures the container is wide enough to avoid CSS truncation
        const idealWidth = contentWidth + WIDTH_BUFFER;
        const finalNodeWidth = Math.min(idealWidth, MAX_NODE_WIDTH);
        return {
          nodeWidth: finalNodeWidth,
          displayText: node.label,
          badgeWidth: badgePixelWidth,
          isTruncated: false,
        };
      }
      
      // Case B: Long Text (contentWidth > 184px)
      // CSS will handle truncation with ellipsis, so we just return max width
      // The full label will be used in HTML rendering, and CSS text-overflow will truncate it
      return {
        nodeWidth: MAX_NODE_WIDTH,
        displayText: node.label, // Full label - CSS handles truncation
        badgeWidth: badgePixelWidth,
        isTruncated: true,
      };
    }, [measureBadgeWidth]);
  
  // Legacy function for backward compatibility - now uses new layout calculation
  const calculateNodeWidth = useCallback((node: LineageNodeType): number => {
    return calculateNodeLayout(node).nodeWidth;
  }, [calculateNodeLayout]);
  
  // Calculate node positions using a simple left-to-right layout
  const { positionedNodes, positionedEdges, canvasWidth, canvasHeight } = useMemo(() => {
    const nodes: PositionedNode[] = [];
    const edges: PositionedEdge[] = [];
    
    // Use filtered lineage data
    let filteredNodes = filteredLineageData.nodes;
    
    // Additional filter: if hideUnconnected is true, only show nodes that have connections
    if (hideUnconnected) {
      // Build a set of node IDs that have connections (appear as source or target in edges)
      const connectedNodeIds = new Set<string>();
      filteredLineageData.edges.forEach(edge => {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
      });
      // Filter to only include nodes that have connections
      filteredNodes = filteredLineageData.nodes.filter(node => connectedNodeIds.has(node.id));
    }
    
    // Group nodes by type for column layout
    const columns: { [key: string]: LineageNodeType[] } = {
      entity: [],
      dataSource: [],
      featureView: [],
      featureService: [],
    };
    
    filteredNodes.forEach(node => {
      if (columns[node.type]) {
        columns[node.type].push(node);
      }
    });
    
    // Layout parameters - adjust spacing for condensed view
    // When zoomed out (condensed view), use tighter spacing to fit more nodes
    const isCondensedLayout = zoom < ZOOM_THRESHOLD;
    // Column gap for horizontal spacing between nodes (slightly increased for better readability)
    const columnGap = isCondensedLayout ? 60 : 70; // Increased spacing for better edge readability
    // Row gap for vertical spacing between nodes
    const rowGap = isCondensedLayout ? 40 : 50; // Increased vertical spacing for better readability
    const nodeHeight = 29; // Fixed height (PatternFly standard)
    // Set margins to 0 - centering will handle positioning with external padding
    // This ensures the bounding box accurately reflects node positions
    const startX = 0; // No internal left margin (centering handles positioning)
    const startY = 0; // No internal top margin (centering handles positioning)
    
    // Position nodes by column
    const columnOrder = ['entity', 'dataSource', 'featureView', 'featureService'];
    const nodePositions: { [key: string]: { x: number; y: number } } = {};
    
    let maxHeight = 0;
    
    // First pass: calculate all node widths
    const nodeWidths: { [key: string]: number } = {};
    columnOrder.forEach((colType) => {
      const colNodes = columns[colType];
      colNodes.forEach((node) => {
        nodeWidths[node.id] = calculateNodeWidth(node);
      });
    });
    
    // Calculate max width per column for consistent column spacing
    const maxWidthsPerColumn: { [key: number]: number } = {};
    columnOrder.forEach((colType, colIndex) => {
      const colNodes = columns[colType];
      maxWidthsPerColumn[colIndex] = Math.max(
        ...colNodes.map(node => nodeWidths[node.id]),
        80 // Minimum column width
      );
    });
    
    // Second pass: position nodes with calculated widths
    columnOrder.forEach((colType, colIndex) => {
      const colNodes = columns[colType];
      const previousColumnsWidth = columnOrder.slice(0, colIndex).reduce(
        (sum, _, idx) => sum + maxWidthsPerColumn[idx] + columnGap,
        0
      );
      
      colNodes.forEach((node, rowIndex) => {
        const x = startX + previousColumnsWidth;
        const y = startY + rowIndex * (nodeHeight + rowGap);
        const width = nodeWidths[node.id];
        
        nodePositions[node.id] = { x, y };
        nodes.push({
          node,
          x,
          y,
          width,
          height: nodeHeight,
        });
        
        maxHeight = Math.max(maxHeight, y + nodeHeight);
      });
    });
    
    const totalColumnsWidth = columnOrder.reduce(
      (sum, _, idx) => sum + maxWidthsPerColumn[idx] + (idx < columnOrder.length - 1 ? columnGap : 0),
      0
    );
    const canvasWidth = startX + totalColumnsWidth;
    const canvasHeight = maxHeight + startY;
    
    // Create edges with positions - only include edges between visible nodes
    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
    filteredLineageData.edges.forEach(edge => {
      // Only create edge if both source and target nodes are visible
      if (!visibleNodeIds.has(edge.source) || !visibleNodeIds.has(edge.target)) {
        return;
      }
      
      const sourcePos = nodePositions[edge.source];
      const targetPos = nodePositions[edge.target];
      
      if (sourcePos && targetPos) {
        const sourceNode = nodes.find(n => n.node.id === edge.source);
        const sourceWidth = sourceNode?.width || 80; // Minimum node width fallback
        edges.push({
          id: edge.id,
          sourceX: sourcePos.x + sourceWidth,
          sourceY: sourcePos.y + nodeHeight / 2,
          targetX: targetPos.x,
          targetY: targetPos.y + nodeHeight / 2,
        });
      }
    });
    
    return { positionedNodes: nodes, positionedEdges: edges, canvasWidth, canvasHeight };
  }, [filteredLineageData, zoom, calculateNodeWidth, hideUnconnected]);
  
  // Calculate popover position using raw transform math - runs on every pan/zoom change
  useLayoutEffect(() => {
    if (!popoverNodeId || !containerRef.current) {
      setPopoverPosition(null);
      return;
    }
    
    // Find the positioned node to get canvas coordinates
    const positionedNode = positionedNodes.find(pn => pn.node.id === popoverNodeId);
    if (!positionedNode) {
      setPopoverPosition(null);
      return;
    }
    
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Node's center-top position in canvas coordinates
    const nodeCanvasX = positionedNode.x + positionedNode.width / 2;
    const nodeCanvasY = positionedNode.y;
    
    // Calculate absolute screen position using raw transform math
    // Formula: containerOffset + pan + (nodePosition * zoom)
    const absoluteX = containerRect.left + pan.x + (nodeCanvasX * zoom);
    const absoluteY = containerRect.top + pan.y + (nodeCanvasY * zoom);
    
    // Safety check: If popover would go off-screen at top, show below instead
    const headerHeight = 100; // Approximate header height
    const showBelow = absoluteY < headerHeight;
    
    setPopoverPosition({ x: absoluteX, y: absoluteY, showBelow });
  }, [popoverNodeId, pan, zoom, positionedNodes]);
  
  // Auto-center the graph when layout is calculated
  // This ensures the graph is centered in the viewport with padding to account for the floating toolbar
  // Similar to controller.getGraph().fit(80) - centers graph with 80px padding
  const lastLayoutHashRef = useRef<string>('');
  const hasCenteredRef = useRef<boolean>(false);
  
  useEffect(() => {
    if (positionedNodes.length === 0 || !containerRef.current) {
      return;
    }
    
    // Create a hash of the layout to detect actual layout changes (not just zoom)
    const layoutHash = `${canvasWidth}-${canvasHeight}-${positionedNodes.length}`;
    if (layoutHash === lastLayoutHashRef.current) {
      return; // Layout hasn't actually changed, skip re-centering
    }
    lastLayoutHashRef.current = layoutHash;
    
    // Use requestAnimationFrame to ensure container dimensions are available
    requestAnimationFrame(() => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;
      
      // Calculate the center of the graph content (bounding box)
      const graphCenterX = canvasWidth / 2;
      const graphCenterY = canvasHeight / 2;
      
      // Calculate the center of the viewport
      const viewportCenterX = containerWidth / 2;
      const viewportCenterY = containerHeight / 2;
      
      // Calculate pan offset needed to center the graph
      // Use 80px symmetric padding (mimics controller.getGraph().fit(80))
      const panX = viewportCenterX - graphCenterX * zoom;
      // Center vertically with symmetric padding (no extra offset needed since startY is 0)
      const panY = viewportCenterY - graphCenterY * zoom;
      
      setPan({ x: panX, y: panY });
    });
  }, [positionedNodes.length, canvasWidth, canvasHeight, zoom]); // Auto-center when layout data changes
  
  // Handle mouse events for panning - allow dragging from anywhere on canvas
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Check if clicking on a node (prevent dragging when clicking nodes)
    const isNodeElement = target.closest('g[data-node]') !== null;
    if (isNodeElement) {
      return; // Let node click handler take over
    }
    
    // Allow dragging if clicking on canvas background, SVG, edges, or when holding spacebar/middle mouse
    const isCanvasBackground = 
      target === e.currentTarget || 
      target.tagName === 'svg' || 
      (target.tagName === 'rect' && target.getAttribute('data-canvas') === 'true') ||
      (target.tagName === 'g' && target.getAttribute('data-edge') === 'true') ||
      (target.tagName === 'path');
    
    // Also allow dragging when holding middle mouse button
    const isMiddleButton = e.button === 1;
    
    if (isCanvasBackground || isMiddleButton) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
      e.stopPropagation();
    }
  }, [pan]);
  
  // Handle canvas click to deselect
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Only deselect if clicking on canvas background, not on nodes
    const target = e.target as SVGElement;
    if (target.tagName === 'svg' || target.tagName === 'rect' && target.getAttribute('data-canvas') === 'true') {
      setSelectedNodeId(null);
      setPopoverNodeId(null);
      setPopoverPosition(null);
    }
  }, []);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const newPan = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };
      setPan(newPan);
      
      // Update popover position immediately during drag for smooth movement
      // This hooks directly into the pan event loop to minimize lag
      if (popoverNodeId && containerRef.current) {
        const positionedNode = positionedNodes.find(pn => pn.node.id === popoverNodeId);
        if (positionedNode) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const nodeCanvasX = positionedNode.x + positionedNode.width / 2;
          const nodeCanvasY = positionedNode.y;
          const absoluteX = containerRect.left + newPan.x + (nodeCanvasX * zoom);
          const absoluteY = containerRect.top + newPan.y + (nodeCanvasY * zoom);
          const headerHeight = 100;
          const showBelow = absoluteY < headerHeight;
          setPopoverPosition({ x: absoluteX, y: absoluteY, showBelow });
        }
      }
      
      e.preventDefault();
    }
  }, [isDragging, dragStart, popoverNodeId, positionedNodes, zoom]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Robust "Zoom to Fit" function using native bounding box measurement
  const zoomToFit = useCallback(() => {
    if (!svgRef.current || !graphGroupRef.current) return false;
    
    try {
      // 1. Measure the CONTENT (the graph) using getBBox()
      const graphBox = graphGroupRef.current.getBBox();
      if (graphBox.width === 0 || graphBox.height === 0) {
        // Content not yet rendered, skip
        return false;
      }
      
      // 2. Measure the CONTAINER (the viewing window)
      const svgElement = svgRef.current;
      const clientWidth = svgElement.clientWidth || svgElement.getBoundingClientRect().width;
      const clientHeight = svgElement.clientHeight || svgElement.getBoundingClientRect().height;
      
      if (clientWidth === 0 || clientHeight === 0) {
        // Container not yet sized, skip
        return false;
      }
      
      // 3. Calculate "Fit" Scale with padding
      const padding = 40;
      const scaleX = (clientWidth - padding * 2) / graphBox.width;
      const scaleY = (clientHeight - padding * 2) / graphBox.height;
      const scale = Math.min(scaleX, scaleY, 1); // Cap zoom at 1x so we don't zoom in too much on small graphs
      
      // 4. Calculate Center Translation
      // We need to center the graph content within the viewport
      const tx = (clientWidth - graphBox.width * scale) / 2 - graphBox.x * scale;
      const ty = (clientHeight - graphBox.height * scale) / 2 - graphBox.y * scale;
      
      // 5. Apply Transform via state (since we're using React state, not D3 zoom behavior)
      setZoom(scale);
      setPan({ x: tx, y: ty });
      
      return true; // Success
    } catch (error) {
      // getBBox() can fail if the element is not yet in the DOM or not visible
      console.warn('zoomToFit failed:', error);
      return false;
    }
  }, []);
  
  // Reset centering ref when rootNodeId changes (switching between different resources)
  useEffect(() => {
    hasCenteredRef.current = false;
  }, [rootNodeId]);
  
  // Robust "Zoom to Fit" with safety delay - waits for DOM to paint before measuring
  // This ensures getBBox() returns accurate measurements after React has rendered
  useEffect(() => {
    const nodesCount = filteredLineageData.nodes.length;
    
    if (nodesCount === 0 || positionedNodes.length === 0 || hasCenteredRef.current) {
      return;
    }
    
    // Wait for the DOM to paint so getBBox() is accurate
    // React needs 1-2 frames to paint the DOM (especially text labels inside nodes)
    const timer = setTimeout(() => {
      if (zoomToFit()) {
        hasCenteredRef.current = true;
      }
    }, 100); // 100ms delay to ensure DOM is fully painted
    
    return () => clearTimeout(timer);
  }, [filteredLineageData.nodes.length, filteredLineageData.edges.length, positionedNodes.length, zoomToFit, rootNodeId]);
  
  // ResizeObserver: Watch for container size changes and re-center if needed
  // This handles the race condition where the container height starts at 0 and grows later
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver(() => {
      // Check if we have valid dimensions and nodes
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const hasValidDimensions = rect.width > 0 && rect.height > 0;
        const hasNodes = filteredLineageData.nodes.length > 0;
        const hasPositionedNodes = positionedNodes.length > 0;
        
        // If we have valid dimensions, nodes, and positioned nodes, but haven't centered yet, center now
        if (hasValidDimensions && hasNodes && hasPositionedNodes && !hasCenteredRef.current) {
          // Use timeout to ensure DOM is painted
          setTimeout(() => {
            if (zoomToFit()) {
              hasCenteredRef.current = true;
            }
          }, 100);
        }
      }
    });
    
    observer.observe(containerRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [filteredLineageData.nodes.length, positionedNodes.length, zoomToFit]);
  
  // Helper function to handle node click and show popover with screen coordinates
  const handleNodeClick = useCallback((e: React.MouseEvent, node: LineageNodeType) => {
    e.stopPropagation();
    if (isDragging) return;
    
    const isCurrentlySelected = node.id === selectedNodeId;
    setSelectedNodeId(isCurrentlySelected ? null : node.id);
    
    if (isCurrentlySelected) {
      // Close popover if clicking the same node
      setPopoverNodeId(null);
    } else {
      // Store only the node ID - position will be calculated dynamically
      setPopoverNodeId(node.id);
    }
  }, [isDragging, selectedNodeId]);
  
  // Zoom controls
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.25, 3);
    setZoom(newZoom);
    // Update popover position immediately during zoom for smooth movement
    if (popoverNodeId && containerRef.current) {
      const positionedNode = positionedNodes.find(pn => pn.node.id === popoverNodeId);
      if (positionedNode) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const nodeCanvasX = positionedNode.x + positionedNode.width / 2;
        const nodeCanvasY = positionedNode.y;
        const absoluteX = containerRect.left + pan.x + (nodeCanvasX * newZoom);
        const absoluteY = containerRect.top + pan.y + (nodeCanvasY * newZoom);
        const headerHeight = 100;
        const showBelow = absoluteY < headerHeight;
        setPopoverPosition({ x: absoluteX, y: absoluteY, showBelow });
      }
    }
  };
  
  const handleZoomOut = () => {
    const newZoom = Math.max(zoom * 0.8, 0.25);
    setZoom(newZoom);
    // Update popover position immediately during zoom for smooth movement
    if (popoverNodeId && containerRef.current) {
      const positionedNode = positionedNodes.find(pn => pn.node.id === popoverNodeId);
      if (positionedNode) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const nodeCanvasX = positionedNode.x + positionedNode.width / 2;
        const nodeCanvasY = positionedNode.y;
        const absoluteX = containerRect.left + pan.x + (nodeCanvasX * newZoom);
        const absoluteY = containerRect.top + pan.y + (nodeCanvasY * newZoom);
        const headerHeight = 100;
        const showBelow = absoluteY < headerHeight;
        setPopoverPosition({ x: absoluteX, y: absoluteY, showBelow });
      }
    }
  };
  const handleFitToScreen = () => {
    // Use zoomToFit for accurate bounding box measurement
    setTimeout(() => {
      zoomToFit();
    }, 100);
  };
  const handleReset = () => {
    setSelectedNodeId(null);
    setPopoverNodeId(null);
    setPopoverPosition(null);
    // Use zoomToFit for accurate bounding box measurement
    setTimeout(() => {
      zoomToFit();
    }, 100);
  };
  
  // Get icon for node type
  const getIcon = (type: string) => {
    switch (type) {
      case 'entity':
        return <EntitiesIcon />;
      case 'dataSource':
        return <DataSourcesIcon />;
      case 'featureView':
        return <FeatureViewsIcon />;
      case 'featureService':
        return <FeatureServicesIcon />;
      default:
        return <EntitiesIcon />;
    }
  };
  
  // Show empty state if "All feature stores" is selected (unless hidden or in Single Resource Mode)
  // In Single Resource Mode (rootNodeId present), skip this check since we already know the feature store
  if (!hideEmptyStates && !rootNodeId && selectedFeatureStore === 'All feature stores') {
    return (
      <EmptyState variant="lg">
        <Title headingLevel="h4" size="lg">
          <SearchIcon style={{ marginRight: '8px' }} />
          Select a Feature Store to view lineage
        </Title>
        <EmptyStateBody>
          The lineage graph shows the data flow relationships between entities, data sources, 
          feature views, and feature services within a specific feature store. 
          Please select a feature store from the dropdown above to visualize its lineage.
        </EmptyStateBody>
      </EmptyState>
    );
  }
  
  // Check if there's any data (unless empty states are hidden)
  if (!hideEmptyStates && lineageData.nodes.length === 0) {
    return (
      <EmptyState variant="lg">
        <Title headingLevel="h4" size="lg">
          No lineage data available
        </Title>
        <EmptyStateBody>
          No entities, data sources, feature views, or feature services were found for the selected feature store.
        </EmptyStateBody>
      </EmptyState>
    );
  }
  
  // Render popover content for all node types
  const renderPopoverContent = (node: LineageNodeType) => {
    // Helper function to extract resource ID from node.id
    const extractResourceId = (nodeId: string, nodeType: string): string => {
      const prefixMap: Record<string, string> = {
        'entity': 'entity-',
        'dataSource': 'datasource-',
        'featureView': 'featureview-',
        'featureService': 'featureservice-',
      };
      const prefix = prefixMap[nodeType] || '';
      if (prefix && nodeId.startsWith(prefix)) {
        return nodeId.substring(prefix.length);
      }
      return nodeId;
    };
    
    // Handle navigation to detail page for all resource types
    const handleDetailPageClick = () => {
      const resourceId = extractResourceId(node.id, node.type);
      
      switch (node.type) {
        case 'entity':
          navigate(`/develop-train/feature-store/entities/${resourceId}?featureStore=${encodeURIComponent(selectedFeatureStore)}`);
          break;
        case 'dataSource':
          navigate(`/develop-train/feature-store/data-sources/${resourceId}?featureStore=${encodeURIComponent(selectedFeatureStore)}`);
          break;
        case 'featureView':
          navigate(`/develop-train/feature-store/feature-views/${resourceId}?featureStore=${encodeURIComponent(selectedFeatureStore)}`);
          break;
        case 'featureService':
          navigate(`/develop-train/feature-store/feature-services/${resourceId}?featureStore=${encodeURIComponent(selectedFeatureStore)}`);
          break;
      }
    };
    
    // Handle navigation to Features list with Feature view filter
    const handleViewAllFeaturesClick = () => {
      if (node.type === 'featureView') {
        // Extract feature view name from label (e.g., "Batch FeatureView: user_transaction_aggregates" -> "user_transaction_aggregates")
        // The label format is: "Batch FeatureView: name" or "On demand FeatureView: name"
        // So we need to get everything after the first colon and space
        const labelParts = node.label.split(': ');
        const featureViewName = labelParts.length > 1 ? labelParts.slice(1).join(': ') : node.label;
        // Navigate to Features list with feature view name as filter
        navigate(`/develop-train/feature-store/features?featureStore=${encodeURIComponent(selectedFeatureStore)}&filterFeatureView=${encodeURIComponent(featureViewName)}`);
      }
    };
    
    // Get resource type display name
    const getResourceTypeDisplayName = (type: string): string => {
      switch (type) {
        case 'entity':
          return 'Entity';
        case 'dataSource':
          return 'Data source';
        case 'featureView':
          return 'Feature view';
        case 'featureService':
          return 'Feature service';
        default:
          return 'Resource';
      }
    };
    
    const resourceTypeDisplayName = getResourceTypeDisplayName(node.type);
    
    return (
      <div style={{ maxWidth: '320px' }}>
        {node.data.description && (
          <p style={{ fontSize: '14px', marginBottom: '12px', color: '#6a6e73' }}>
            {node.data.description}
          </p>
        )}
        {node.type === 'featureView' && node.data.features && node.data.features.length > 0 && (
          <>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Features:</div>
            <List>
              {node.data.features.slice(0, 6).map((feature: string, idx: number) => (
                <ListItem key={idx} style={{ fontSize: '14px' }}>
                  {feature}
                </ListItem>
              ))}
              {node.data.features.length > 6 && (
                <ListItem style={{ fontSize: '14px', fontStyle: 'italic' }}>
                  ...and {node.data.features.length - 6} more
                </ListItem>
              )}
            </List>
          </>
        )}
        <div style={{ marginTop: '12px' }}>
          {node.type === 'featureView' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleDetailPageClick}
                style={{ paddingLeft: '8px', paddingRight: '8px' }}
              >
                View {resourceTypeDisplayName} detail page
              </Button>
              {node.data.features && node.data.features.length > 0 && (
                <Button 
                  variant="link" 
                  isInline 
                  onClick={handleViewAllFeaturesClick}
                >
                  View all features
                </Button>
              )}
            </div>
          ) : (
            <Button 
              variant="link" 
              isInline 
              onClick={handleDetailPageClick}
            >
              View {resourceTypeDisplayName} detail page
            </Button>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div style={{ 
      height: 'calc(100vh - 180px)', // Viewport-based height to prevent collapse
      minHeight: '500px', // Safety minimum to ensure visibility
      width: '100%',
      margin: 0,
      padding: 0,
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden', // Prevent window scrollbars for full bleed
    }}>
      
      {/* Canvas Container - Full Bleed Layout */}
      <div 
        ref={containerRef}
        style={{ 
          flex: 1,
          height: '100%',
          width: '100%',
          position: 'relative', 
          overflow: 'hidden',
          backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
          borderRadius: 0, // Remove border radius for full bleed
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          margin: 0,
          padding: 0,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Filter Toolbar - Floating Panel */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 10,
          width: 'auto',
          backgroundColor: 'var(--pf-v5-global--BackgroundColor--100)',
          boxShadow: 'var(--pf-v5-global--BoxShadow--sm)',
          borderRadius: '4px',
          padding: '8px',
          display: 'flex',
          gap: '16px',
        }}>
          <Toolbar style={{ marginBottom: 0 }}>
        <ToolbarContent>
          {/* Attribute Selector */}
          <ToolbarItem>
            <Select
              id="attribute-selector-lineage"
              isOpen={isCategorySelectOpen}
              onOpenChange={setIsCategorySelectOpen}
              onSelect={(_e, value) => {
                setSelectedCategory(value as string);
                setIsCategorySelectOpen(false);
                // Clear resource selection when category changes
                setSelectedResourceId(null);
                setResourceSearchValue('');
              }}
              selected={selectedCategory}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsCategorySelectOpen(!isCategorySelectOpen)}
                  isExpanded={isCategorySelectOpen}
                  style={{ minWidth: '150px' }}
                >
                  {selectedCategory}
                </MenuToggle>
              )}
            >
              <SelectList>
                <SelectOption value="Entity">Entity</SelectOption>
                <SelectOption value="Data source">Data source</SelectOption>
                <SelectOption value="Feature view">Feature view</SelectOption>
                <SelectOption value="Feature service">Feature service</SelectOption>
              </SelectList>
            </Select>
          </ToolbarItem>
          
          {/* Value Selector (Typeahead) */}
          <ToolbarItem>
            <Select
              id="resource-selector-lineage"
              variant="typeahead"
              isOpen={isResourceSelectOpen}
              onOpenChange={setIsResourceSelectOpen}
              onSelect={(_e, value) => {
                const resourceId = value as string;
                if (resourceId === 'no-results') return;
                setSelectedResourceId(resourceId);
                setIsResourceSelectOpen(false);
                // Set search value to the selected resource name
                const selectedResource = resourceOptions.find(r => r.id === resourceId);
                if (selectedResource) {
                  setResourceSearchValue(selectedResource.name);
                }
              }}
              selected={selectedResourceId}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsResourceSelectOpen(true)}
                  isExpanded={isResourceSelectOpen}
                  style={{ minWidth: '250px' }}
                  variant="typeahead"
                >
                  <TextInputGroup isPlain>
                    <TextInputGroupMain
                      value={resourceSearchValue}
                      onChange={(_e, value) => {
                        setResourceSearchValue(value);
                        setIsResourceSelectOpen(true);
                      }}
                      onClick={() => setIsResourceSelectOpen(true)}
                      onFocus={() => setIsResourceSelectOpen(true)}
                      placeholder={`Find by ${selectedCategory.toLowerCase()}`}
                      autoComplete="off"
                    />
                    {resourceSearchValue && (
                      <TextInputGroupUtilities>
                        <Button
                          variant="plain"
                          onClick={(e) => {
                            e.stopPropagation();
                            setResourceSearchValue('');
                            setSelectedResourceId(null);
                            setIsResourceSelectOpen(false);
                          }}
                          aria-label="Clear input value"
                        >
                          <TimesIcon />
                        </Button>
                      </TextInputGroupUtilities>
                    )}
                  </TextInputGroup>
                </MenuToggle>
              )}
            >
              <SelectList
                style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                {filteredResourceOptions.length === 0 ? (
                  <SelectOption value="no-results" isDisabled>
                    No results found
                  </SelectOption>
                ) : (
                  filteredResourceOptions.map((resource) => (
                    <SelectOption key={resource.id} value={resource.id}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>
                          {resource.name}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#6a6e73',
                          marginTop: '2px',
                        }}>
                          {resource.description || 'No description'}
                        </div>
                      </div>
                    </SelectOption>
                  ))
                )}
              </SelectList>
            </Select>
          </ToolbarItem>
          
          <ToolbarItem align={{ default: 'alignCenter' }}>
            <Switch
              id="hide-unconnected-switch-lineage"
              label="Hide objects without relationships"
              isChecked={hideUnconnected}
              onChange={(_e, checked) => setHideUnconnected(checked)}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
        </div>
        {/* SVG Canvas */}
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            overflow: 'hidden', // Ensure overflow is hidden for accurate calculations
          }}
          onClick={handleCanvasClick}
        >
          {/* Invisible background rect to capture clicks */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="transparent"
            data-canvas="true"
          />
          <defs>
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#d2d2d2" />
            </marker>
            <marker
              id="arrow-highlighted"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#0066cc" />
            </marker>
            {/* Clip paths for text truncation - one per node with badge */}
            {positionedNodes
              .filter(pn => pn.node.data.featureCount !== undefined)
              .map(({ node, width, height }) => {
                // ClipPath width: total width minus left padding, icon, gap, badge width, gap, and right padding
                // Using new PatternFly constants: 8px padding, 24px icon, 8px gap
                const layout = calculateNodeLayout(node);
                const badgeWidth = layout.badgeWidth;
                const clipWidth = width - NODE_PADDING_HORIZONTAL * 2 - ICON_SIZE - ELEMENT_GAP - badgeWidth - (badgeWidth > 0 ? ELEMENT_GAP : 0);
                return (
                  <clipPath key={`node-text-clip-${node.id}`} id={`node-text-clip-${node.id}`}>
                    <rect
                      x={0}
                      y={0}
                      width={clipWidth}
                      height={height}
                    />
                  </clipPath>
                );
              })}
          </defs>
          
          <g ref={graphGroupRef} transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Render Edges */}
            {positionedEdges.map((edge) => {
              const isEdgeHighlighted = selectedNodeId ? highlightedPath.edges.has(edge.id) : false;
              
              // Get actual edge data to find source and target node IDs
              const actualEdge = filteredLineageData.edges.find(e => e.id === edge.id);
              if (!actualEdge) return null;
              
              // Find source and target nodes
              const sourceNode = positionedNodes.find(pn => pn.node.id === actualEdge.source);
              const targetNode = positionedNodes.find(pn => pn.node.id === actualEdge.target);
              
              // Calculate connection points - adjust for condensed nodes
              let sourceX = edge.sourceX;
              let sourceY = edge.sourceY;
              let targetX = edge.targetX;
              let targetY = edge.targetY;
              let isSourceCondensed = false;
              let isTargetCondensed = false;
              
              if (isCondensedView && sourceNode) {
                // Check if source node is condensed (not hovered and not selected)
                isSourceCondensed = hoveredCondensedNodeId !== sourceNode.node.id && 
                                   selectedNodeId !== sourceNode.node.id;
                if (isSourceCondensed) {
                  // Connect to center of condensed circular node
                  const condensedX = sourceNode.x + sourceNode.width / 2;
                  const condensedY = sourceNode.y + sourceNode.height / 2;
                  sourceX = condensedX;
                  sourceY = condensedY;
                }
              }
              
              if (isCondensedView && targetNode) {
                // Check if target node is condensed (not hovered and not selected)
                isTargetCondensed = hoveredCondensedNodeId !== targetNode.node.id && 
                                   selectedNodeId !== targetNode.node.id;
                if (isTargetCondensed) {
                  // Connect to center of condensed circular node
                  const condensedX = targetNode.x + targetNode.width / 2;
                  const condensedY = targetNode.y + targetNode.height / 2;
                  targetX = condensedX;
                  targetY = condensedY;
                }
              }
              
              // Create a curved path with adjusted control points for condensed nodes
              // When both nodes are condensed, use tighter control points to shorten the edge
              const horizontalDistance = targetX - sourceX;
              const controlPointOffset = (isSourceCondensed && isTargetCondensed) 
                ? horizontalDistance * 0.15  // Shorter control points for condensed nodes (15% of distance)
                : horizontalDistance * 0.5;   // Standard control points (50% of distance)
              
              const controlX1 = sourceX + controlPointOffset;
              const controlX2 = targetX - controlPointOffset;
              const path = `M ${sourceX} ${sourceY} C ${controlX1} ${sourceY}, ${controlX2} ${targetY}, ${targetX} ${targetY}`;
              
              return (
                <g key={edge.id} data-edge="true">
                <path
                  d={path}
                  stroke={isEdgeHighlighted ? '#0066cc' : '#d2d2d2'}
                  strokeWidth={isEdgeHighlighted ? 2 : 1}
                  fill="none"
                  markerEnd={isEdgeHighlighted ? 'url(#arrow-highlighted)' : 'url(#arrow-default)'}
                    style={{ pointerEvents: 'none' }}
                />
                </g>
              );
            })}
            
            {/* Render Nodes - Split into regular nodes and hovered/selected condensed nodes for z-index */}
            {/* First, render regular nodes (condensed or standard, but not hovered/selected in condensed view) */}
            {positionedNodes
              .filter(({ node }) => {
                // In condensed view, exclude nodes that are hovered OR selected (they should show in regular view)
                if (isCondensedView) {
                  return hoveredCondensedNodeId !== node.id && selectedNodeId !== node.id;
                }
                return true;
              })
              .map(({ node, x, y, width, height }) => {
              const colors = NODE_COLORS[node.type as keyof typeof NODE_COLORS] || NODE_COLORS.entity;
              const isSelected = node.id === selectedNodeId;
              const isConnected = selectedNodeId ? highlightedPath.nodes.has(node.id) : false;
              
              // Determine if we should render condensed view
              // In condensed view, ALL nodes that pass the filter (not hovered, not selected) should be condensed
              // Since we already filtered out hovered/selected nodes, we can simply check isCondensedView
              const shouldRenderCondensed = isCondensedView;
              
              // Render condensed view (circular, icon-only) - this applies to ALL nodes when zoom < threshold
              if (shouldRenderCondensed) {
                const condensedSize = CONDENSED_NODE_SIZE;
                const condensedX = x + width / 2 - condensedSize / 2;
                const condensedY = y + height / 2 - condensedSize / 2;
                
                // Determine styling for condensed nodes
                let fillColor = 'white';
                let borderColor = colors.iconColor;
                let borderWidth = 1;
                let iconColor = colors.iconColor;
                
                if (isSelected) {
                  fillColor = '#0066cc';
                  borderColor = '#0066cc';
                  borderWidth = 2;
                  iconColor = 'white';
                } else if (isConnected) {
                  borderColor = '#0066cc';
                  borderWidth = 2;
                }
                
                return (
                  <g
                    key={node.id}
                    data-node={node.id}
                    transform={`translate(${condensedX}, ${condensedY})`}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => handleNodeClick(e, node)}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    onMouseEnter={() => {
                      // When hovering in condensed view, expand this node
                      setHoveredCondensedNodeId(node.id);
                    }}
                    onMouseLeave={() => {
                      // Only clear hovered node if it's not selected (selected nodes stay expanded)
                      if (!isSelected) {
                        setHoveredCondensedNodeId(null);
                      }
                    }}
                  >
                    {/* Circular background with color theme border */}
                    <circle
                      cx={condensedSize / 2}
                      cy={condensedSize / 2}
                      r={condensedSize / 2}
                      fill={fillColor}
                      stroke={borderColor}
                      strokeWidth={borderWidth}
                    />
                    {/* Icon centered */}
                    <foreignObject 
                      x={condensedSize / 2 - 10} 
                      y={condensedSize / 2 - 10} 
                      width={20} 
                      height={20}
                    >
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: iconColor, 
                        width: '100%', 
                        height: '100%' 
                      }}>
                        {getIcon(node.type)}
                      </div>
                    </foreignObject>
                  </g>
                );
              }
              
              // Render standard view (pill shape with icon, text, badge)
              // Use strict PatternFly layout calculation
              const layout = calculateNodeLayout(node);
              const finalNodeWidth = layout.nodeWidth;
              const hasBadge = node.data.featureCount !== undefined;
              
              // Determine styling based on state:
              // - Selected: Blue filled background, white text/icons (PatternFly selected state)
              // - Connected: Blue border outline with hover-like appearance
              // - Default: Gray border, white background, colored icons
              let fillColor = 'white';
              let borderColor = DEFAULT_NODE_BORDER;
              let borderWidth = 1;
              let textColor = '#151515';
              let iconColor = colors.iconColor;
              let showOuterGlow = false;
              
              if (isSelected) {
                // Selected state: Blue filled background with white text/icons
                fillColor = '#0066cc';
                borderColor = '#0066cc';
                borderWidth = 2;
                textColor = 'white';
                iconColor = 'white';
              } else if (isConnected) {
                // Connected state: Blue border outline (hover-like state)
                borderColor = '#0066cc';
                borderWidth = 2;
                showOuterGlow = true;
              }
              
              // Parse label to separate resource type and name (for HTML rendering)
              const labelParts = node.label.split(': ');
              const resourceType = labelParts.length > 1 ? labelParts[0] + ':' : '';
              const resourceName = labelParts.length > 1 ? labelParts.slice(1).join(': ') : node.label;
              
              // Render condensed view (circular, icon-only)
              if (shouldRenderCondensed) {
                const condensedSize = CONDENSED_NODE_SIZE;
                const condensedX = x + width / 2 - condensedSize / 2;
                const condensedY = y + height / 2 - condensedSize / 2;
                
                return (
                  <g
                    key={node.id}
                    data-node={node.id}
                    transform={`translate(${condensedX}, ${condensedY})`}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => handleNodeClick(e, node)}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    onMouseEnter={() => {
                      // When hovering in condensed view, expand this node
                      setHoveredCondensedNodeId(node.id);
                    }}
                    onMouseLeave={() => {
                      setHoveredCondensedNodeId(null);
                    }}
                  >
                    {/* Circular background with color theme border */}
                    <circle
                      cx={condensedSize / 2}
                      cy={condensedSize / 2}
                      r={condensedSize / 2}
                      fill={isSelected ? '#0066cc' : 'white'}
                      stroke={isSelected ? '#0066cc' : (isConnected ? '#0066cc' : colors.iconColor)}
                      strokeWidth={isSelected || isConnected ? 2 : 1}
                    />
                    {/* Icon centered */}
                    <foreignObject 
                      x={condensedSize / 2 - 8} 
                      y={condensedSize / 2 - 8} 
                      width={16} 
                      height={16}
                    >
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: isSelected ? 'white' : colors.iconColor, 
                        width: '100%', 
                        height: '100%' 
                      }}>
                        {getIcon(node.type)}
                      </div>
                    </foreignObject>
                  </g>
                );
              }
              
              // Render standard view (pill shape with icon, text, badge)
              const nodeContent = (
                <g
                  key={node.id}
                  data-node={node.id}
                  transform={`translate(${x}, ${y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent canvas click handler
                    if (!isDragging) { // Only select if we're not dragging
                      handleNodeClick(e, node);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation(); // Prevent canvas drag when clicking node
                  }}
                  onMouseEnter={(e) => {
                    // Always check if node is truncated and show tooltip for all node types (including entities)
                    // Recalculate layout to ensure accuracy - this is critical for entity nodes
                    const nodeLayout = calculateNodeLayout(node);
                    
                    // Force tooltip to show if node is truncated (with safety buffer in calculation)
                    if (nodeLayout.isTruncated) {
                      setHoveredNodeId(node.id);
                      // Calculate tooltip position relative to container - top-aligned above node
                      if (containerRef.current) {
                        const containerRect = containerRef.current.getBoundingClientRect();
                        const svgElement = e.currentTarget.ownerSVGElement as SVGSVGElement;
                        if (svgElement) {
                          const svgRect = svgElement.getBoundingClientRect();
                          // Calculate node top center in SVG coordinates, then transform to screen coordinates
                          const nodeCenterX = (x + finalNodeWidth / 2) * zoom + pan.x;
                          const nodeTopY = y * zoom + pan.y; // Use top Y position for top alignment
                          // Convert to container-relative coordinates
                          setTooltipPosition({
                            x: nodeCenterX + (svgRect.left - containerRect.left),
                            y: nodeTopY + (svgRect.top - containerRect.top), // Top of node
                          });
                        } else {
                          // Fallback: use node position directly if SVG element not found
                          const nodeCenterX = (x + finalNodeWidth / 2) * zoom + pan.x;
                          const nodeTopY = y * zoom + pan.y;
                          setTooltipPosition({
                            x: nodeCenterX,
                            y: nodeTopY,
                          });
                        }
                      }
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredNodeId(null);
                    // If in condensed view, clear hovered condensed node when leaving
                    if (isCondensedView) {
                      setHoveredCondensedNodeId(null);
                    }
                  }}
                >
                  {/* Outer glow for connected nodes (hover-like effect) */}
                  {showOuterGlow && (
                    <rect
                      x={-3}
                      y={-3}
                      width={finalNodeWidth + 6}
                      height={29 + 6}
                      rx={(29 + 6) / 2}
                      ry={(29 + 6) / 2}
                      fill="none"
                      stroke="rgba(0, 102, 204, 0.3)"
                      strokeWidth={4}
                    />
                  )}
                  {/* Main Container Outline - 29px height */}
                  <rect
                    x={0}
                    y={0}
                    width={finalNodeWidth}
                    height={29}
                    rx={29 / 2}
                    ry={29 / 2}
                    fill={fillColor}
                    stroke={borderColor}
                    strokeWidth={borderWidth}
                  />
                  
                  {/* Content Container - Using unified NodeContent component */}
                  <NodeContent
                    nodeType={node.type}
                    nodeWidth={finalNodeWidth}
                    resourceType={resourceType}
                    resourceName={resourceName}
                    iconColor={iconColor}
                    textColor={textColor}
                    hasBadge={hasBadge}
                    isSelected={isSelected}
                    featureCount={node.data.featureCount}
                  />
                </g>
              );
              
              return nodeContent;
            })}
            
            {/* Render hovered/selected condensed nodes on top (for z-index) */}
            {/* These nodes should always show in regular view when hovered or selected */}
            {isCondensedView && positionedNodes
              .filter(({ node }) => hoveredCondensedNodeId === node.id || selectedNodeId === node.id)
              .map(({ node, x, y }) => {
              const colors = NODE_COLORS[node.type as keyof typeof NODE_COLORS] || NODE_COLORS.entity;
              const isSelected = node.id === selectedNodeId;
              const isConnected = selectedNodeId ? highlightedPath.nodes.has(node.id) : false;
              
              // Determine styling based on state
              let fillColor = 'white';
              let borderColor = DEFAULT_NODE_BORDER;
              let borderWidth = 1;
              let textColor = '#151515';
              let iconColor = colors.iconColor;
              let showOuterGlow = false;
              
              if (isSelected) {
                fillColor = '#0066cc';
                borderColor = '#0066cc';
                borderWidth = 2;
                textColor = 'white';
                iconColor = 'white';
              } else if (isConnected) {
                borderColor = '#0066cc';
                borderWidth = 2;
                showOuterGlow = true;
              }
              
              // Use strict PatternFly layout calculation
              const layout = calculateNodeLayout(node);
              const finalNodeWidth = layout.nodeWidth;
              const hasBadge = node.data.featureCount !== undefined;
              
              // Parse label to separate resource type and name (for HTML rendering)
              const labelParts = node.label.split(': ');
              const resourceType = labelParts.length > 1 ? labelParts[0] + ':' : '';
              const resourceName = labelParts.length > 1 ? labelParts.slice(1).join(': ') : node.label;
              
              return (
                <g
                  key={`hovered-${node.id}`}
                  data-node={node.id}
                  transform={`translate(${x}, ${y})`}
                  style={{ cursor: 'pointer', pointerEvents: 'all' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isDragging) {
                      handleNodeClick(e, node);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  onMouseLeave={() => {
                    // Only clear hovered node if it's not selected (selected nodes stay expanded)
                    if (selectedNodeId !== node.id) {
                      setHoveredCondensedNodeId(null);
                    }
                    // Always clear tooltip on mouse leave
                    setHoveredNodeId(null);
                  }}
                  onMouseEnter={(e) => {
                    // Always check if node is truncated and show tooltip for all node types (including entities)
                    // Recalculate layout to ensure accuracy - this is critical for entity nodes
                    const nodeLayout = calculateNodeLayout(node);
                    
                    // Force tooltip to show if node is truncated (with safety buffer in calculation)
                    if (nodeLayout.isTruncated) {
                      setHoveredNodeId(node.id);
                      // Calculate tooltip position relative to container - top-aligned above node
                      if (containerRef.current) {
                        const containerRect = containerRef.current.getBoundingClientRect();
                        const svgElement = e.currentTarget.ownerSVGElement as SVGSVGElement;
                        if (svgElement) {
                          const svgRect = svgElement.getBoundingClientRect();
                          // Calculate node top center in SVG coordinates, then transform to screen coordinates
                          const nodeCenterX = (x + finalNodeWidth / 2) * zoom + pan.x;
                          const nodeTopY = y * zoom + pan.y; // Use top Y position for top alignment
                          // Convert to container-relative coordinates
                          setTooltipPosition({
                            x: nodeCenterX + (svgRect.left - containerRect.left),
                            y: nodeTopY + (svgRect.top - containerRect.top), // Top of node
                          });
                        } else {
                          // Fallback: use node position directly if SVG element not found
                          const nodeCenterX = (x + finalNodeWidth / 2) * zoom + pan.x;
                          const nodeTopY = y * zoom + pan.y;
                          setTooltipPosition({
                            x: nodeCenterX,
                            y: nodeTopY,
                          });
                        }
                      }
                    }
                  }}
                >
                  {/* Outer glow for connected nodes */}
                  {showOuterGlow && (
                    <rect
                      x={-3}
                      y={-3}
                      width={finalNodeWidth + 6}
                      height={29 + 6}
                      rx={(29 + 6) / 2}
                      ry={(29 + 6) / 2}
                      fill="none"
                      stroke="rgba(0, 102, 204, 0.3)"
                      strokeWidth={4}
                    />
                  )}
                  {/* Main Container Outline - 29px height */}
                      <rect
                        x={0}
                        y={0}
                    width={finalNodeWidth}
                    height={29}
                    rx={29 / 2}
                    ry={29 / 2}
                    fill={fillColor}
                    stroke={borderColor}
                    strokeWidth={borderWidth}
                  />
                  
                  {/* Content Container - Using unified NodeContent component */}
                  <NodeContent
                    nodeType={node.type}
                    nodeWidth={finalNodeWidth}
                    resourceType={resourceType}
                    resourceName={resourceName}
                    iconColor={iconColor}
                    textColor={textColor}
                    hasBadge={hasBadge}
                    isSelected={isSelected}
                    featureCount={node.data.featureCount}
                  />
                </g>
              );
            })}
          </g>
        </svg>
        
        {/* Zoom Controls - Horizontal layout */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          display: 'flex',
          flexDirection: 'row',
          gap: '4px',
          backgroundColor: 'white',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          padding: '4px',
        }}>
          <Tooltip 
            content={<div style={{ maxWidth: '200px', wordWrap: 'break-word', whiteSpace: 'normal' }}>Zoom in</div>} 
            position="top"
          >
            <Button variant="plain" onClick={handleZoomIn} aria-label="Zoom in">
              <PlusIcon />
            </Button>
          </Tooltip>
          <Tooltip 
            content={<div style={{ maxWidth: '200px', wordWrap: 'break-word', whiteSpace: 'normal' }}>Zoom out</div>} 
            position="top"
          >
            <Button variant="plain" onClick={handleZoomOut} aria-label="Zoom out">
              <MinusIcon />
            </Button>
          </Tooltip>
          <Tooltip 
            content={<div style={{ maxWidth: '200px', wordWrap: 'break-word', whiteSpace: 'normal' }}>Fit to screen</div>} 
            position="top"
          >
            <Button variant="plain" onClick={handleFitToScreen} aria-label="Fit to screen">
              <CompressIcon />
            </Button>
          </Tooltip>
          <Tooltip 
            content={<div style={{ maxWidth: '200px', wordWrap: 'break-word', whiteSpace: 'normal' }}>Reset view</div>} 
            position="top"
          >
            <Button variant="plain" onClick={handleReset} aria-label="Reset view">
              <ExpandIcon />
            </Button>
          </Tooltip>
        </div>
        
        {/* Tooltip for truncated node labels - top-aligned above node */}
        {hoveredNodeId && (() => {
          const hoveredNode = positionedNodes.find(pn => pn.node.id === hoveredNodeId);
          if (!hoveredNode) return null;
          
          // Always recalculate layout to ensure accuracy for all node types (including entities)
          const layout = calculateNodeLayout(hoveredNode.node);
          if (!layout.isTruncated) return null;
          
          // Get full label for tooltip
          const fullLabel = hoveredNode.node.label;
          
          // Calculate tooltip position: centered horizontally above the node
          // Use fallback calculation if tooltipPosition wasn't set correctly
          const tooltipGap = 8; // Gap between node top and tooltip bottom
          
          let tooltipX = tooltipPosition.x;
          let tooltipY = tooltipPosition.y;
          
          // Fallback: calculate position from node position if tooltipPosition is invalid
          if (!tooltipPosition || (tooltipPosition.x === 0 && tooltipPosition.y === 0)) {
            if (containerRef.current) {
              const containerRect = containerRef.current.getBoundingClientRect();
              const svgElement = containerRef.current.querySelector('svg');
              if (svgElement) {
                const svgRect = svgElement.getBoundingClientRect();
                const nodeCenterX = (hoveredNode.x + hoveredNode.width / 2) * zoom + pan.x;
                const nodeTopY = hoveredNode.y * zoom + pan.y;
                tooltipX = nodeCenterX + (svgRect.left - containerRect.left);
                tooltipY = nodeTopY + (svgRect.top - containerRect.top);
              }
            }
          }
          
          return (
            <div
              style={{
                position: 'absolute',
                left: `${tooltipX}px`,
                top: `${tooltipY - tooltipGap}px`,
                transform: 'translate(-50%, -100%)', // Center horizontally and position above
                backgroundColor: '#151515',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                pointerEvents: 'none',
                zIndex: 10000, // Increased z-index to ensure it's above everything
                maxWidth: '300px',
                minWidth: '100px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                lineHeight: '1.4',
              }}
            >
              {fullLabel}
              {/* Polygon pointer (arrow) pointing down to the node */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: '8px solid #151515',
                }}
              />
            </div>
          );
        })()}
      </div>
      
      {/* Popover rendered via Portal outside the graph container to avoid clipping */}
      {popoverNodeId && popoverPosition && (() => {
        const popoverNode = positionedNodes.find(pn => pn.node.id === popoverNodeId);
        if (!popoverNode) return null;
        
        // Use pure transform for positioning to minimize reflows (no left/top)
        // This ensures the browser can optimize the positioning without triggering layout reflows
        const arrowOffset = popoverPosition.showBelow ? 12 : -12;
        const translateY = popoverPosition.showBelow ? '0%' : '-100%';
        
        return ReactDOM.createPortal(
          <div
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              transform: `translate(${popoverPosition.x}px, ${popoverPosition.y}px) translate(-50%, ${translateY}) translateY(${arrowOffset}px)`,
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              padding: '16px',
              minWidth: '300px',
              maxWidth: '400px',
              zIndex: 9999,
              pointerEvents: 'auto',
            }}
          >
            {/* Arrow pointer - position based on showBelow */}
            {popoverPosition.showBelow ? (
              <div
                style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderBottom: '10px solid white',
                }}
              />
            ) : (
              <div
                style={{
                  position: 'absolute',
                  bottom: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderTop: '10px solid white',
                }}
              />
            )}
            
            {/* Header with title and close button - Matched Height Alignment */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '8px',
            }}>
              <Title 
                headingLevel="h4" 
                size="md" 
                style={{ 
                  flex: 1,
                  marginRight: '16px',
                  whiteSpace: 'normal', 
                  wordBreak: 'break-word',
                  margin: 0,
                  padding: 0,
                  fontSize: '14px',
                  lineHeight: '24px', // Match button height exactly
                }}
              >
                {popoverNode.node.label}
              </Title>
              <Button 
                variant="plain" 
                onClick={() => {
                  setPopoverNodeId(null);
                  setPopoverPosition(null);
                }}
                style={{
                  flexShrink: 0,
                  height: '24px', // Match title line-height exactly
                  width: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: 0,
                  padding: 0,
                  minWidth: 'auto',
                  alignSelf: 'flex-start',
                }}
              >
                <TimesIcon />
              </Button>
            </div>
            
            {/* Content */}
            {renderPopoverContent(popoverNode.node)}
          </div>,
          document.body
        );
      })()}
    </div>
  );
};

export default FeatureStoreLineage;
