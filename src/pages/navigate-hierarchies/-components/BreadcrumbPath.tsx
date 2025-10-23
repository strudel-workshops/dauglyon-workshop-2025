import { Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { HierarchyNode } from '../index';

interface BreadcrumbPathProps {
  selectedNode: HierarchyNode;
  onNodeSelect: (node: HierarchyNode) => void;
}

/**
 * Displays a breadcrumb trail showing the path from root to the selected node.
 * Note: This is a simplified version that only shows the current node.
 * A full implementation would require tracking the full path through the tree.
 */
export function BreadcrumbPath({
  selectedNode,
  onNodeSelect,
}: BreadcrumbPathProps) {
  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ marginBottom: 1 }}
    >
      <Link
        component="button"
        variant="body2"
        onClick={() => onNodeSelect(selectedNode)}
        sx={{
          cursor: 'pointer',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        Root
      </Link>
      <Typography variant="body2" color="text.primary">
        {selectedNode.name}
      </Typography>
    </Breadcrumbs>
  );
}
