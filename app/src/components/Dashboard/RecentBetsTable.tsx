import { Paper, Center, Loader, Text, Table, Button, Box } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatEUR } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { BetStatusBadge } from '../common/BetStatusBadge';
import { ErrorState } from '../common/ErrorState';
import { useRecentBets } from '../../hooks/queries/useBets';

export const RecentBetsTable = () => {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useRecentBets(5);
  const bets = data?.data;

  if (error) {
    return <ErrorState error={error} onRetry={() => refetch()} title={t('failedToLoadBets') || 'Failed to load'} p="md" />;
  }

  return (
    <Paper shadow="sm" radius="md" withBorder p={0} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {isLoading && !bets ? (
        <Center p="xl" style={{ flexGrow: 1 }}><Loader /></Center>
      ) : !bets || bets.length === 0 ? (
        <Center p="xl" style={{ flexGrow: 1 }}><Text c="dimmed">{t('noRecentBets')}</Text></Center>
      ) : (
        <Box style={{ flexGrow: 1, padding: 'var(--mantine-spacing-xs)' }}>
          <Table.ScrollContainer minWidth={280}>
            <Table highlightOnHover verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('date')}</Table.Th>
                  <Table.Th>{t('amount')}</Table.Th>
                  <Table.Th>{t('status')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {bets.map((bet) => (
                  <Table.Tr key={bet.id}>
                    <Table.Td>{formatDate(bet.createdAt)}</Table.Td>
                    <Table.Td>{formatEUR(bet.amount)}</Table.Td>
                    <Table.Td>
                      <BetStatusBadge status={bet.status} />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Box>
      )}
      {!isLoading && bets && bets.length > 0 && (
        <Button 
          component={Link} 
          to="/my-bets" 
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
