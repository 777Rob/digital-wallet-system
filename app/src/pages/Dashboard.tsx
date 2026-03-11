import { useState } from 'react';
import { Title, Paper, NumberInput, Button, Container, Text, Card, Badge, Center, Stack, Table, Loader } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useWalletStore } from '../store/useWalletStore';
import { formatEUR } from '../utils/currency';

export const Dashboard = () => {
  const { t } = useTranslation();
  const balance = useWalletStore((state) => state.balance);
  const [result, setResult] = useState<{ winAmount: number | null } | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      amount: 1,
    },
    validate: {
      amount: (val: number) => (val < 1 ? t('minBet') : val > balance ? t('insufficientBalance') : null),
    },
  });

  const { data: recentBets, isLoading: isLoadingBets } = useQuery({
    queryKey: ['recent-bets'],
    queryFn: async () => {
      const response = await apiClient.get('/my-bets', {
        params: { page: 1, limit: 5 }
      });
      return response.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: typeof form.values) => {
      const response = await apiClient.post('/bet', values);
      return response.data;
    },
    onMutate: () => {
      setIsFlipping(true);
      setResult(null);
    },
    onSuccess: (data: any) => {
      // Delay setting result to allow animation to play
      setTimeout(() => {
        setResult(data);
        setIsFlipping(false);
        form.reset();
        notifications.show({
          title: 'Success',
          message: data.winAmount ? `You won ${formatEUR(data.winAmount)}!` : 'You lost this bet.',
          color: data.winAmount ? 'green' : 'gray',
        });
        queryClient.invalidateQueries({ queryKey: ['recent-bets'] });
        queryClient.invalidateQueries({ queryKey: ['my-transactions'] });
        queryClient.invalidateQueries({ queryKey: ['my-bets'] });
      }, 2000);
    },
    onError: (error: any) => {
      setIsFlipping(false);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to place bet',
        color: 'red',
      });
    },
  });

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="xl">{t('bet')}</Title>

      <Paper shadow="sm" p="xl" withBorder>
        <form onSubmit={form.onSubmit((values: any) => mutation.mutate(values))}>
          <NumberInput
            label={t('betAmount')}
            description={`Available: ${formatEUR(balance)}`}
            min={1}
            max={balance}
            decimalScale={2}
            fixedDecimalScale
            required
            {...form.getInputProps('amount')}
            mb="md"
          />
          <Button 
            type="submit" 
            fullWidth 
            loading={mutation.isPending || isFlipping}
            disabled={mutation.isPending || isFlipping || balance < 1}
          >
            {isFlipping ? 'Flipping Coin...' : t('bet')}
          </Button>
        </form>
      </Paper>

      {(isFlipping || result) && (
        <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
          <Center mb="md">
            <div className="coin-container">
              <div className={`coin ${isFlipping ? 'flipping win' : (result?.winAmount ? 'win' : 'lost')}`}>
                {isFlipping ? '?' : (result?.winAmount ? 'WIN' : 'LOST')}
              </div>
            </div>
          </Center>

          {!isFlipping && result && (
            <Stack align="center" gap="xs">
              <Text fw={500}>Result</Text>
              <Badge color={result.winAmount ? "green" : "red"} size="lg">
                {result.winAmount ? t('win') : t('lost')}
              </Badge>
              {result.winAmount && (
                <Text size="xl" fw={700} c="green">
                  +{formatEUR(result.winAmount)}
                </Text>
              )}
            </Stack>
          )}
        </Card>
      )}

      <Title order={3} mt="xl" mb="md">Recent Bets</Title>
      <Paper shadow="sm" radius="md" withBorder>
        {isLoadingBets ? (
          <Center p="xl"><Loader /></Center>
        ) : recentBets?.data?.length === 0 ? (
          <Center p="xl"><Text c="dimmed">No recent bets</Text></Center>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('date')}</Table.Th>
                <Table.Th>{t('amount')}</Table.Th>
                <Table.Th>{t('status')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {recentBets?.data?.map((bet: any) => (
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
    </Container>
  );
};
