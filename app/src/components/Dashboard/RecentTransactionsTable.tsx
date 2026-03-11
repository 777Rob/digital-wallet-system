import { Paper, Center, Loader, Text, Table, Button, Box } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatEUR } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { ErrorState } from '../common/ErrorState';
import { useRecentTransactions } from '../../hooks/queries/useRecentTransactions';

export const RecentTransactionsTable = () => {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useRecentTransactions(5);
  const transactions = data?.data;

  if (error) {
    return <ErrorState error={error} onRetry={() => refetch()} title={t('failedToLoadTransactions') || 'Failed to load'} p="md" />;
  }

  return (
    <Paper shadow="sm" radius="md" withBorder p={0} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {isLoading && !transactions ? (
        <Center p="xl" style={{ flexGrow: 1 }}><Loader /></Center>
      ) : !transactions || transactions.length === 0 ? (
        <Center p="xl" style={{ flexGrow: 1 }}><Text c="dimmed">{t('noRecentTransactions')}</Text></Center>
      ) : (
        <Box style={{ flexGrow: 1, padding: 'var(--mantine-spacing-xs)' }}>
          <Table.ScrollContainer minWidth={280}>
            <Table highlightOnHover verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('date')}</Table.Th>
                  <Table.Th>{t('status')}</Table.Th>
                  <Table.Th>{t('amount')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {transactions.map((tx) => (
                  <Table.Tr key={tx.id}>
                    <Table.Td>{formatDate(tx.createdAt)}</Table.Td>
                    <Table.Td>
                      {/* Mapping transaction type to visual status (similar to mockup which uses words like "Blashboard" we use Type) */}
                      <Text size="sm" c="dimmed" tt="capitalize">{tx.type}</Text>
                    </Table.Td>
                    <Table.Td fw={600} c={tx.type === 'bet' ? 'red' : 'green'}>
                      {tx.type === 'bet' ? '-' : '+'}{formatEUR(tx.amount)}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Box>
      )}
      {!isLoading && transactions && transactions.length > 0 && (
        <Button 
          component={Link} 
          to="/transactions" 
          variant="light" 
          color="green" 
          fullWidth 
          radius={0}
          style={{ borderBottomLeftRadius: 'var(--mantine-radius-md)', borderBottomRightRadius: 'var(--mantine-radius-md)' }}
        >
          {t('viewAll')}
        </Button>
      )}
    </Paper>
  );
};
