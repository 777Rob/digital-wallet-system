import { useState } from 'react';
import { Container, Title, Table, Pagination, Group, Select, TextInput, Badge, Loader, Text, Center, SimpleGrid } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useDebouncedValue } from '@mantine/hooks';
import { useTransactions } from '../hooks/queries/useTransactions';
import { TransactionAmountCell } from '../components/common/TransactionAmountCell';

const TRANSACTION_TYPE_COLOR: Record<string, string> = {
  win: 'green',
  bet: 'blue',
  cancel: 'gray',
};

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
        <Text c="red">{t('failedToLoadTransactions')}</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" mt="xl">
      <Title order={2} mb="xl">{t('transactions')}</Title>

      <SimpleGrid cols={{ base: 1, sm: 2 }} mb="md">
        <Select
          placeholder={t('filterType')}
          value={type}
          onChange={setType}
          data={[
            { value: 'all', label: t('all') },
            { value: 'bet', label: t('bet') },
            { value: 'win', label: t('win') },
            { value: 'cancel', label: t('cancel') }
          ]}
          clearable
        />
        <TextInput
          placeholder={t('filterById')}
          value={idFilter}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setIdFilter(event.currentTarget.value)}
        />
      </SimpleGrid>

      {isLoading && !data ? (
        <Center my={50}><Loader /></Center>
      ) : data?.data?.length === 0 ? (
        <Center my={50}>
          <Text c="dimmed">{t('noTransactionsFound')}</Text>
        </Center>
      ) : (
        <>
          <Table.ScrollContainer minWidth={600}>
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
                    <Table.Td>{new Date(tx.createdAt).toLocaleString(undefined, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</Table.Td>
                    <Table.Td>
                      <Badge color={TRANSACTION_TYPE_COLOR[tx.type] ?? 'gray'}>
                        {tx.type.toUpperCase()}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <TransactionAmountCell amount={tx.amount} type={tx.type} />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          {data && data.total > limit && (
            <Group justify="center" mt="xl">
              <Pagination 
                total={Math.ceil(data.total / limit)} 
                value={page} 
                onChange={setPage} 
                size="sm"
                siblings={1}
              />
            </Group>
          )}
        </>
      )}
    </Container>
  );
};
