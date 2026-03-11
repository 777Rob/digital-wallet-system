import { Paper, Center, Loader, Text, Table, Badge, Button, Box } from '@mantine/core';
import { Link } from 'react-router-dom';
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
    <Paper shadow="sm" radius="md" withBorder p={0} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {isLoading ? (
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
                    <Table.Td>{new Date(bet.createdAt).toLocaleString(undefined, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</Table.Td>
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
