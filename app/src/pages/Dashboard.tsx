import { Container, Title, SimpleGrid, Paper, Stack, Text } from '@mantine/core';

import { useWalletStore } from '../store/useWalletStore';
import { notifications } from '@mantine/notifications';
import { formatEUR } from '../utils/currency';
import { useRecentBets } from '../hooks/queries/useBets';
import { usePlaceBetMutation } from '../hooks/mutations/useBetMutations';
import { useCoinFlipAnimation } from '../hooks/useCoinFlipAnimation';
import { BetForm } from '../components/Dashboard/BetForm';
import { CoinFlipResult } from '../components/Dashboard/CoinFlipResult';
import { RecentBetsTable } from '../components/Dashboard/RecentBetsTable';
import { AxiosError } from 'axios';

export const Dashboard = () => {
  const balance = useWalletStore((state) => state.balance);
  
  const { data: recentBets, isLoading: isLoadingBets } = useRecentBets(5);
  const mutation = usePlaceBetMutation();

  const {
    isFlipping,
    result,
    startAnimation,
    finishAnimation,
    cancelAnimation
  } = useCoinFlipAnimation((data) => {
    notifications.show({
      title: 'Success',
      message: data.winAmount ? `You won ${formatEUR(data.winAmount)}!` : 'You lost this bet.',
      color: data.winAmount ? 'green' : 'gray',
    });
  });

  const handlePlaceBet = (values: { amount: number }) => {
    startAnimation();
    mutation.mutate(values, {
      onSuccess: (data) => {
        finishAnimation(data);
      },
      onError: (error: Error | AxiosError) => {
        cancelAnimation();
        let message = 'Failed to place bet';
        if ('isAxiosError' in error && error.response?.data) {
          message = (error.response.data as any).message || message;
        }
        notifications.show({
          title: 'Error',
          message,
          color: 'red',
        });
      }
    });
  };

  return (
    <Container size="lg" mt="xl">
      <Title order={2} mb="xl">Dashboard</Title>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mb="xl">
        <BetForm 
          balance={balance} 
          isLoading={mutation.isPending || isFlipping} 
          onSubmit={handlePlaceBet} 
        />
        <Paper shadow="sm" p="xl" withBorder h="100%">
          <Stack align="center" justify="center" h="100%" gap="xs">
            <Title order={1} c="green" style={{ fontSize: '3rem' }}>
              {formatEUR(balance)}
            </Title>
            <Text c="dimmed" size="lg" fw={500}>Global Balance</Text>
          </Stack>
        </Paper>
      </SimpleGrid>

      {(isFlipping || result) && (
        <CoinFlipResult isFlipping={isFlipping} result={result} />
      )}

      <Title order={3} mt="xl" mb="md">Recent Bets</Title>
      <RecentBetsTable bets={recentBets?.data} isLoading={isLoadingBets} />
    </Container>
  );
};
