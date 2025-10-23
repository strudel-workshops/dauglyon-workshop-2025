import { Box, Typography, CircularProgress } from '@mui/material';
import { useDataFromSource } from '../../../hooks/useDataFromSource';
import { HierarchyNode } from '../index';
import { TreeNode } from './TreeNode';
import { useEffect } from 'react';

interface TreeViewProps {
  searchTerm: string;
  expandedNodes: Set<string>;
  selectedNode: HierarchyNode | null;
  onNodeSelect: (node: HierarchyNode) => void;
  onToggleExpand: (nodeId: string) => void;
  onInitialExpand?: (nodeIds: Set<string>) => void;
}

/**
 * Main tree container component that loads hierarchical data
 * and renders the root-level tree nodes.
 */
export function TreeView({
  searchTerm,
  expandedNodes,
  selectedNode,
  onNodeSelect,
  onToggleExpand,
  onInitialExpand,
}: TreeViewProps) {
  const data = useDataFromSource('dummy-data/hierarchy.json');

  // Initialize default expanded nodes on first load
  useEffect(() => {
    if (data && onInitialExpand && expandedNodes.size === 0) {
      const defaultExpanded = new Set<string>();

      function traverse(node: HierarchyNode) {
        const childCount = node.children?.length || 0;

        // Auto-expand if has more than 1 child and less than or equal to 15
        if (childCount > 1 && childCount <= 15) {
          defaultExpanded.add(node.id);
        }

        // Recursively process children
        node.children?.forEach((child) => traverse(child));
      }

      traverse(data);
      onInitialExpand(defaultExpanded);
    }
  }, [data, onInitialExpand, expandedNodes.size]);

  // Auto-expand nodes when searching
  useEffect(() => {
    if (searchTerm && data) {
      const matchingNodeIds = findMatchingNodes(data, searchTerm);
      matchingNodeIds.forEach((nodeId) => {
        if (!expandedNodes.has(nodeId)) {
          onToggleExpand(nodeId);
        }
      });
    }
  }, [searchTerm, data, expandedNodes, onToggleExpand]);

  if (!data) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Ensure data is a single root node with children
  const rootNode: HierarchyNode = data;
  const filteredNodes = searchTerm
    ? filterTreeBySearch(rootNode, searchTerm)
    : rootNode;

  if (searchTerm && !filteredNodes) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography color="text.secondary">
          No results found for "{searchTerm}"
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {filteredNodes && (
        <TreeNode
          node={filteredNodes}
          level={0}
          isExpanded={expandedNodes.has(filteredNodes.id)}
          isSelected={selectedNode?.id === filteredNodes.id}
          searchTerm={searchTerm}
          expandedNodes={expandedNodes}
          onNodeSelect={onNodeSelect}
          onToggleExpand={onToggleExpand}
        />
      )}
    </Box>
  );
}

/**
 * Recursively filter the tree to only show nodes matching the search term.
 * Returns null if no matches found in this subtree.
 */
function filterTreeBySearch(
  node: HierarchyNode,
  searchTerm: string
): HierarchyNode | null {
  const lowerSearch = searchTerm.toLowerCase();
  const nodeMatches =
    node.name.toLowerCase().includes(lowerSearch) ||
    node.description?.toLowerCase().includes(lowerSearch);

  // Recursively filter children
  const filteredChildren =
    node.children
      ?.map((child) => filterTreeBySearch(child, searchTerm))
      .filter((child): child is HierarchyNode => child !== null) || [];

  // Include node if it matches or has matching descendants
  if (nodeMatches || filteredChildren.length > 0) {
    return {
      ...node,
      children: filteredChildren,
    };
  }

  return null;
}

/**
 * Find all node IDs that match the search term (for auto-expand).
 */
function findMatchingNodes(node: HierarchyNode, searchTerm: string): string[] {
  const lowerSearch = searchTerm.toLowerCase();
  const matches: string[] = [];

  function traverse(n: HierarchyNode, ancestors: string[]) {
    const nodeMatches =
      n.name.toLowerCase().includes(lowerSearch) ||
      n.description?.toLowerCase().includes(lowerSearch);

    if (nodeMatches) {
      // Add all ancestors to expand them
      matches.push(...ancestors);
    }

    n.children?.forEach((child) => {
      traverse(child, [...ancestors, n.id]);
    });
  }

  traverse(node, []);
  return matches;
}
