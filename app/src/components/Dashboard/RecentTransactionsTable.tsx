import { Paper, Center, Loader, Text, Table, Button, Box } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TransactionAmountCell } from '../common/TransactionAmountCell';
import type { Transaction } from '../../types';

interface RecentTransactionsTableProps {
  transactions?: Transaction[];
  isLoading: boolean;
}

export const RecentTransactionsTable = ({ transactions, isLoading }: RecentTransactionsTableProps) => {
  const { t } = useTranslation();

  return (
    <Paper shadow="sm" radius="md" withBorder p={0} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }} h="100%">
      {isLoading ? (
        <Center p="xl" style={{ flexGrow: 1 }}><Loader /></Center>
      ) : !transactions || transactions.length === 0 ? (
        <Center p="xl" style={{ flexGrow: 1 }}><Text c="dimmed">{t('noRecentTransactions')}</Text></Center>
      ) : (
        <Box style={{ flexGrow: 1, padding: 'var(--mantine-spacing-md)' }}>
        <Table highlightOnHover verticalSpacing="sm">
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
                <Table.Td>{new Date(tx.createdAt).toLocaleDateString()}</Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed" tt="capitalize">{tx.type}</Text>
                </Table.Td>
                <Table.Td>
                  <TransactionAmountCell amount={tx.amount} type={tx.type} />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
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
