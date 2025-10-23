import { Box, Chip, Typography, Button } from '@mui/material';
import { useState } from 'react';
import { Collapsible } from '../../../components/Collapsible';
import { HierarchyNode } from '../index';

interface TreeNodeProps {
  node: HierarchyNode;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  searchTerm: string;
  expandedNodes: Set<string>;
  onNodeSelect: (node: HierarchyNode) => void;
  onToggleExpand: (nodeId: string) => void;
}

const ITEMS_PER_PAGE = 15;

/**
 * Recursive tree node component that renders a single node
 * and its children using the Collapsible component.
 */
export function TreeNode({
  node,
  level,
  isExpanded,
  isSelected,
  searchTerm,
  expandedNodes,
  onNodeSelect,
  onToggleExpand,
}: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const indentPx = level * 24;

  const handleNodeClick = () => {
    onNodeSelect(node);
  };

  // Render node name with optional highlighting
  const renderNodeName = () => {
    if (!searchTerm) {
      return node.name;
    }

    const index = node.name.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (index === -1) {
      return node.name;
    }

    return (
      <>
        {node.name.substring(0, index)}
        <Box
          component="span"
          sx={{
            backgroundColor: 'warning.light',
            fontWeight: 'bold',
          }}
        >
          {node.name.substring(index, index + searchTerm.length)}
        </Box>
        {node.name.substring(index + searchTerm.length)}
      </>
    );
  };

  if (!hasChildren) {
    // Render leaf node without Collapsible
    return (
      <Box
        onClick={handleNodeClick}
        sx={{
          marginLeft: `${indentPx}px`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          padding: 0.5,
          paddingLeft: '2rem',
          borderRadius: 1,
          backgroundColor: isSelected ? 'action.selected' : 'transparent',
          '&:hover': {
            backgroundColor: isSelected ? 'action.selected' : 'action.hover',
          },
        }}
      >
        <Box
          component="span"
          sx={{
            fontWeight: isSelected ? 'bold' : 'normal',
            fontSize: '1rem',
          }}
        >
          {renderNodeName()}
        </Box>
        <Typography variant="caption" color="text.secondary">
          ({node.id})
        </Typography>
        {node.count !== undefined && (
          <Chip
            label={node.count.toLocaleString()}
            size="small"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
        )}
      </Box>
    );
  }

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const children = node.children!;
  const visibleChildren = children.slice(0, visibleCount);
  const hasMoreChildren = visibleCount < children.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  return (
    <Box sx={{ marginLeft: `${indentPx}px` }}>
      <Collapsible
        label={
          <Box
            onClick={(e) => {
              e.stopPropagation();
              handleNodeClick();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              padding: 0.5,
              borderRadius: 1,
              backgroundColor: isSelected ? 'action.selected' : 'transparent',
              '&:hover': {
                backgroundColor: isSelected
                  ? 'action.selected'
                  : 'action.hover',
              },
            }}
          >
            <Box
              component="span"
              sx={{
                fontWeight: isSelected ? 'bold' : 'normal',
                fontSize: '1rem',
              }}
            >
              {renderNodeName()}
            </Box>
            <Typography variant="caption" color="text.secondary">
              ({node.id})
            </Typography>
            {node.count !== undefined && (
              <Chip
                label={node.count.toLocaleString()}
                size="small"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        }
        isOpen={isExpanded}
      >
        <Box sx={{ marginTop: 0.5 }}>
          {visibleChildren.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              isExpanded={expandedNodes.has(child.id)}
              isSelected={isSelected && child.id === node.id}
              searchTerm={searchTerm}
              expandedNodes={expandedNodes}
              onNodeSelect={onNodeSelect}
              onToggleExpand={onToggleExpand}
            />
          ))}
          {hasMoreChildren && (
            <Box
              sx={{
                marginLeft: '2rem',
                marginTop: 1,
                marginBottom: 1,
              }}
            >
              <Button
                size="small"
                variant="text"
                onClick={handleLoadMore}
                sx={{ textTransform: 'none' }}
              >
                Load More ({children.length - visibleCount} remaining)
              </Button>
            </Box>
          )}
        </Box>
      </Collapsible>
    </Box>
  );
}
