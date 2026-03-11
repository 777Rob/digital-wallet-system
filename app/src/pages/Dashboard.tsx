import { Container, Title, SimpleGrid, Paper, Stack, Text, Group, Box } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useWalletStore } from '../store/useWalletStore';
import { notifications } from '@mantine/notifications';
import { formatEUR } from '../utils/currency';
import { useRecentBets } from '../hooks/queries/useBets';
import { useTransactions } from '../hooks/queries/useTransactions';
import { usePlaceBetMutation } from '../hooks/mutations/useBetMutations';
import { useCoinFlipAnimation } from '../hooks/useCoinFlipAnimation';
import { BetForm } from '../components/Dashboard/BetForm';
import { CoinFlipResult } from '../components/Dashboard/CoinFlipResult';
import { RecentBetsTable } from '../components/Dashboard/RecentBetsTable';
import { RecentTransactionsTable } from '../components/Dashboard/RecentTransactionsTable';
import { AxiosError } from 'axios';

export const Dashboard = () => {
  const { t } = useTranslation();
  const balance = useWalletStore((state) => state.balance);
  
  const { data: recentBets, isLoading: isLoadingBets } = useRecentBets(5);
  const { data: recentTransactions, isLoading: isLoadingTransactions } = useTransactions({ limit: 5 });
  const mutation = usePlaceBetMutation();

  const {
    isFlipping,
    result,
    startAnimation,
    finishAnimation,
    cancelAnimation
  } = useCoinFlipAnimation((data) => {
    notifications.show({
      title: t('success'),
      message: data.winAmount ? `${t('winMessage')} ${formatEUR(data.winAmount)}!` : t('lostMessage'),
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
        let message = t('failedToPlaceBet');
        if ('isAxiosError' in error && error.response?.data) {
          message = (error.response.data as any).message || message;
        }
        notifications.show({
          title: t('error'),
          message,
          color: 'red',
        });
      }
    });
  };

  return (
    <Container size="lg" mt="xl">
      <Title order={2} mb="xl">{t('dashboard')}</Title>

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
            <Text c="dimmed" size="lg" fw={500}>{t('globalBalance')}</Text>
          </Stack>
        </Paper>
      </SimpleGrid>

      {(isFlipping || result) && (
        <CoinFlipResult isFlipping={isFlipping} result={result} />
      )}

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mt="xl">
        <Box>
          <Group justify="space-between" mb="md">
            <Title order={3}>{t('quickHistory')}</Title>
          </Group>
          <RecentTransactionsTable transactions={recentTransactions?.data} isLoading={isLoadingTransactions} />
        </Box>
        
        <Box>
          <Group justify="space-between" mb="md">
            <Title order={3}>{t('activeBets')}</Title>
          </Group>
          <RecentBetsTable bets={recentBets?.data} isLoading={isLoadingBets} />
        </Box>
      </SimpleGrid>
    </Container>
  );
};
