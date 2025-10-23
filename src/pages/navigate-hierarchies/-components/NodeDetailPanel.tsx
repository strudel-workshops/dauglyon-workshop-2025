import {
  Box,
  Paper,
  Typography,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { HierarchyNode } from '../index';
import { LabelValueTable } from '../../../components/LabelValueTable';

interface NodeDetailPanelProps {
  node: HierarchyNode;
  onClose: () => void;
}

/**
 * Side panel that displays detailed information about a selected node.
 */
export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        padding: 2,
        height: '100%',
        minHeight: '600px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 2,
        }}
      >
        <Typography variant="h6">Node Details</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ marginBottom: 2 }} />

      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="h6" gutterBottom>
          {node.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {node.id}
        </Typography>
      </Box>

      {node.description && (
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {node.description}
          </Typography>
        </Box>
      )}

      <LabelValueTable
        rows={[
          {
            label: 'ID',
            value: node.id,
          },
          {
            label: 'Level',
            value: node.level.toString(),
          },
          ...(node.count !== undefined
            ? [
                {
                  label: 'Count',
                  value: node.count.toLocaleString(),
                },
              ]
            : []),
          {
            label: 'Has Children',
            value: node.children && node.children.length > 0 ? 'Yes' : 'No',
          },
          ...(node.children && node.children.length > 0
            ? [
                {
                  label: 'Children Count',
                  value: node.children.length.toString(),
                },
              ]
            : []),
        ]}
      />

      {node.children && node.children.length > 0 && (
        <Box sx={{ marginTop: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Child Nodes
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginTop: 1 }}>
            {node.children.map((child) => (
              <Chip
                key={child.id}
                label={child.name}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
}
