import { Box } from '@mui/material';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { KBaseJobBrowserProvider } from './-context/ContextProvider';

export const Route = createFileRoute('/kbase-job-browser/_layout')({
  component: KBaseJobBrowserLayout,
});

function KBaseJobBrowserLayout() {
  return (
    <Box>
      <KBaseJobBrowserProvider>
        <Outlet />
      </KBaseJobBrowserProvider>
    </Box>
  );
}
