import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';
import './i18n';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const theme = createTheme({
  primaryColor: 'green',
  colors: {
    green: [
      '#e0fbef',
      '#baf3d6',
      '#8feaba',
      '#61e09c',
      '#37d781',
      '#1ac365', // 5
      '#198f5d', // 6
      '#147055', // 7 
      '#0e503d', // 8
      '#093327', // 9
    ]
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <Notifications />
        <App />
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>
);
