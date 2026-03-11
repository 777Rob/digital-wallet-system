import { useState } from 'react';
import { Container, Title, Table, Pagination, Group, Select, TextInput, Badge, Button, Loader, Text, Center } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { formatEUR } from '../utils/currency';
import { useBets } from '../hooks/queries/useBets';
import { useCancelBetMutation } from '../hooks/mutations/useBetMutations';
import { AxiosError } from 'axios';

export const MyBets = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [idFilter, setIdFilter] = useState('');
  const [debouncedId] = useDebouncedValue(idFilter, 500);
  const limit = 10;

  const { data, isLoading, error } = useBets({
    page,
    limit,
    status,
    id: debouncedId,
  });

  const cancelMutation = useCancelBetMutation();

  const handleCancelBet = (id: string) => {
    cancelMutation.mutate(id, {
      onSuccess: () => {
        notifications.show({ title: 'Success', message: 'Bet cancelled successfully', color: 'green' });
      },
      onError: (error: Error | AxiosError) => {
        let message = 'Failed to cancel bet';
        if ('isAxiosError' in error && error.response?.data) {
          message = (error.response.data as any).message || message;
        }
        notifications.show({ title: 'Error', message, color: 'red' });
      }
    });
  };

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
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setIdFilter(event.currentTarget.value)}
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
              {data?.data.map((bet) => (
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
                      onClick={() => handleCancelBet(bet.id)}
                    >
                      {t('cancelBet')}
                    </Button>
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
