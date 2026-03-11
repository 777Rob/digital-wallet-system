import { useState } from 'react';
import { Container, Title, Table, Pagination, Group, Select, TextInput, Badge, Button, Loader, Text, Center } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { apiClient } from '../api/client';
import { formatEUR } from '../utils/currency';

export const MyBets = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [idFilter, setIdFilter] = useState('');
  const [debouncedId] = useDebouncedValue(idFilter, 500);
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-bets', page, status, debouncedId],
    queryFn: async () => {
      const response = await apiClient.get('/my-bets', {
        params: {
          page,
          limit,
          ...(status && status !== 'all' ? { status } : {}),
          ...(debouncedId ? { id: debouncedId } : {})
        }
      });
      return response.data;
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/my-bet/${id}`);
      return response.data;
    },
    onSuccess: () => {
      notifications.show({ title: 'Success', message: 'Bet cancelled successfully', color: 'green' });
      queryClient.invalidateQueries({ queryKey: ['my-bets'] });
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] }); // update transactions as well
    },
    onError: (error: any) => {
      notifications.show({ title: 'Error', message: error.response?.data?.message || 'Failed to cancel bet', color: 'red' });
    }
  });

  if (error) {
    return (
      <Container mt="xl">
        <Title order={2} mb="xl">{t('myBets')}</Title>
        <Text color="red">Failed to load bets</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" mt="xl">
      <Title order={2} mb="xl">{t('myBets')}</Title>

      <Group mb="md">
        <Select
          placeholder={t('filterStatus')}
          value={status}
          onChange={setStatus}
          data={[
            { value: 'all', label: t('all') },
            { value: 'win', label: t('win') },
            { value: 'lost', label: t('lost') },
            { value: 'canceled', label: t('canceled') }
          ]}
          clearable
        />
        <TextInput
          placeholder="Filter by ID"
          value={idFilter}
          onChange={(event: any) => setIdFilter(event.currentTarget.value)}
        />
      </Group>

      {isLoading && !data ? (
        <Center my={50}><Loader /></Center>
      ) : data?.data?.length === 0 ? (
        <Center my={50}>
          <Text c="dimmed">No bets found</Text>
        </Center>
      ) : (
        <>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>{t('date')}</Table.Th>
                <Table.Th>{t('amount')}</Table.Th>
                <Table.Th>{t('prize')}</Table.Th>
                <Table.Th>{t('status')}</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data?.data.map((bet: any) => (
                <Table.Tr key={bet.id}>
                  <Table.Td style={{ maxWidth: '120px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    <Text size="xs" c="dimmed">{bet.id}</Text>
                  </Table.Td>
                  <Table.Td>{new Date(bet.createdAt).toLocaleString()}</Table.Td>
                  <Table.Td>{formatEUR(bet.amount)}</Table.Td>
                  <Table.Td>{bet.winAmount ? formatEUR(bet.winAmount) : '-'}</Table.Td>
                  <Table.Td>
                    <Badge color={
                      bet.status === 'win' ? 'green' 
                      : bet.status === 'lost' ? 'red' 
                      : 'gray'
                    }>
                      {t(bet.status)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Button 
                      size="xs" 
                      variant="light" 
                      color="red"
                      disabled={bet.status === 'canceled' || bet.status === 'win' || cancelMutation.isPending}
                      onClick={() => cancelMutation.mutate(bet.id)}
                    >
                      {t('cancelBet')}
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {data?.total > limit && (
            <Group justify="center" mt="xl">
              <Pagination 
                total={Math.ceil((data?.total || 0) / limit)} 
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
