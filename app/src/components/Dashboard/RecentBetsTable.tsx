import { Paper, Center, Loader, Text, Table, Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { formatEUR } from '../../utils/currency';
import type { Bet } from '../../types';

interface RecentBetsTableProps {
  bets?: Bet[];
  isLoading: boolean;
}

export const RecentBetsTable = ({ bets, isLoading }: RecentBetsTableProps) => {
  const { t } = useTranslation();

  return (
    <Paper shadow="sm" radius="md" withBorder>
      {isLoading ? (
        <Center p="xl"><Loader /></Center>
      ) : !bets || bets.length === 0 ? (
        <Center p="xl"><Text c="dimmed">No recent bets</Text></Center>
      ) : (
        <Table highlightOnHover verticalSpacing="sm">
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
                <Table.Td>{new Date(bet.createdAt).toLocaleString()}</Table.Td>
                <Table.Td>{formatEUR(bet.amount)}</Table.Td>
                <Table.Td>
                  <Badge color={bet.status === 'win' ? 'green' : bet.status === 'lost' ? 'red' : 'gray'}>
                    {t(bet.status)}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Paper>
  );
};
