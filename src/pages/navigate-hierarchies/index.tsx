import { Box, Paper, Stack, TextField } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { TreeView } from './-components/TreeView';
import { NodeDetailPanel } from './-components/NodeDetailPanel';
import { BreadcrumbPath } from './-components/BreadcrumbPath';

export const Route = createFileRoute('/navigate-hierarchies/')({
  component: NavigateHierarchies,
});

export interface HierarchyNode {
  id: string;
  name: string;
  description?: string;
  level: number;
  count?: number;
  children?: HierarchyNode[];
}

/**
 * Main page for the Navigate Hierarchies Task Flow.
 * Enables users to explore and interact with nested, tree-structured data
 * such as ontologies, taxonomies, phylogenetic trees, and file systems.
 */
function NavigateHierarchies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<HierarchyNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const handleCloseDetail = () => {
    setSelectedNode(null);
  };

  const handleNodeSelect = (node: HierarchyNode) => {
    setSelectedNode(node);
  };

  const handleToggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleInitialExpand = (nodeIds: Set<string>) => {
    setExpandedNodes(nodeIds);
  };

  return (
    <Box>
      <PageHeader
        pageTitle="Navigate Hierarchies"
        description="Explore ontologies, taxonomies, and nested data structures"
        sx={{
          marginBottom: 1,
          padding: 2,
        }}
      />
      <Box sx={{ padding: 2 }}>
        <Stack spacing={2}>
          {/* Search bar */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search nodes by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ maxWidth: 600 }}
          />

          {/* Breadcrumb navigation */}
          {selectedNode && (
            <BreadcrumbPath
              selectedNode={selectedNode}
              onNodeSelect={handleNodeSelect}
            />
          )}

          {/* Main content area */}
          <Stack direction="row" spacing={2}>
            {/* Tree view */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                minHeight: '600px',
                padding: 2,
                overflow: 'auto',
              }}
            >
              <TreeView
                searchTerm={searchTerm}
                expandedNodes={expandedNodes}
                selectedNode={selectedNode}
                onNodeSelect={handleNodeSelect}
                onToggleExpand={handleToggleExpand}
                onInitialExpand={handleInitialExpand}
              />
            </Paper>

            {/* Detail panel */}
            {selectedNode && (
              <Box sx={{ minWidth: '350px', maxWidth: '400px' }}>
                <NodeDetailPanel
                  node={selectedNode}
                  onClose={handleCloseDetail}
                />
              </Box>
            )}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
