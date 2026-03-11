import { useState } from 'react';
import { Container, Title, Table, Pagination, Group, Select, TextInput, Badge, Loader, Text, Center } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useDebouncedValue } from '@mantine/hooks';
import { formatEUR } from '../utils/currency';
import { useTransactions } from '../hooks/queries/useTransactions';

export const Transactions = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [type, setType] = useState<string | null>(null);
  const [idFilter, setIdFilter] = useState('');
  const [debouncedId] = useDebouncedValue(idFilter, 500);
  const limit = 10;

  const { data, isLoading, error } = useTransactions({
    page,
    limit,
    type,
    id: debouncedId,
  });

  if (error) {
    return (
      <Container mt="xl">
        <Title order={2} mb="xl">{t('transactions')}</Title>
        <Text color="red">Failed to load transactions</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" mt="xl">
      <Title order={2} mb="xl">{t('transactions')}</Title>

      <Group mb="md">
        <Select
          placeholder={t('filterType')}
          value={type}
          onChange={setType}
          data={[
            { value: 'all', label: t('all') },
            { value: 'bet', label: 'Bet' },
            { value: 'win', label: 'Win' },
            { value: 'cancel', label: 'Cancel' }
          ]}
          clearable
        />
        <TextInput
          placeholder="Filter by ID"
          value={idFilter}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setIdFilter(event.currentTarget.value)}
        />
      </Group>

      {isLoading && !data ? (
        <Center my={50}><Loader /></Center>
      ) : data?.data?.length === 0 ? (
        <Center my={50}>
          <Text c="dimmed">No transactions found</Text>
        </Center>
      ) : (
        <>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>{t('date')}</Table.Th>
                <Table.Th>{t('type')}</Table.Th>
                <Table.Th>{t('amount')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data?.data.map((tx) => (
                <Table.Tr key={tx.id}>
                  <Table.Td style={{ maxWidth: '120px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    <Text size="xs" c="dimmed">{tx.id}</Text>
                  </Table.Td>
                  <Table.Td>{new Date(tx.createdAt).toLocaleString()}</Table.Td>
                  <Table.Td>
                    <Badge color={
                      tx.type === 'win' ? 'green' 
                      : tx.type === 'bet' ? 'blue' 
                      : 'gray'
                    }>
                      {tx.type.toUpperCase()}
                    </Badge>
                  </Table.Td>
                  <Table.Td fw={600} c={tx.type === 'bet' ? 'red' : 'green'}>
                    {tx.type === 'bet' ? '-' : '+'}{formatEUR(tx.amount)}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {data && data.total > limit && (
            <Group justify="center" mt="xl">
              <Pagination 
                total={Math.ceil(data.total / limit)} 
                value={page} 
                onChange={setPage} 
              />
            </Group>
          )}
        </>
      )}
    </Container>
  );
};
