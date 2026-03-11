import { Container, Title, SimpleGrid, Paper, Stack, Text, Group, Box } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useWalletStore } from '../store/useWalletStore';
import { notifications } from '@mantine/notifications';
import { formatEUR } from '../utils/currency';
import { usePlaceBetMutation } from '../hooks/mutations/useBetMutations';
import { useCoinFlipAnimation } from '../hooks/useCoinFlipAnimation';
import { extractErrorMessage } from '../utils/errorMessage';
import { BetForm } from '../components/Dashboard/BetForm';
import { CoinFlipResult } from '../components/Dashboard/CoinFlipResult';
import { RecentBetsTable } from '../components/Dashboard/RecentBetsTable';
import { RecentTransactionsTable } from '../components/Dashboard/RecentTransactionsTable';

export const Dashboard = () => {
  const { t } = useTranslation();
  const balance = useWalletStore((state) => state.balance);
  
  const mutation = usePlaceBetMutation();

  const {
    isFlipping,
    result,
    startAnimation,
    finishAnimation,
    cancelAnimation
  } = useCoinFlipAnimation((data) => {
    notifications.show({
      title: data.winAmount ? t('success') : t('result'),
      message: data.winAmount ? `${t('winMessage')} ${formatEUR(data.winAmount)}!` : t('lostMessage'),
      color: data.winAmount ? 'green' : 'red',
    });
  });

  const handlePlaceBet = (values: { amount: number }) => {
    startAnimation();
    mutation.mutate(values, {
      onSuccess: (data) => {
        finishAnimation(data);
      },
      onError: (error) => {
        cancelAnimation();
        notifications.show({
          title: t('error'),
          message: extractErrorMessage(error, t('failedToPlaceBet')),
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
          isLoading={mutation.isPending || isFlipping} 
          onSubmit={handlePlaceBet} 
        />
        <Paper shadow="sm" p="xl" withBorder h="100%">
          <Stack align="center" justify="center" h="100%" gap="xs">
            <Title order={1} c="green" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
              {formatEUR(balance)}
            </Title>
            <Text c="dimmed" size="lg" fw={500}>{t('globalBalance')}</Text>
          </Stack>
        </Paper>
      </SimpleGrid>

      {(isFlipping || result) && (
        <CoinFlipResult isFlipping={isFlipping} result={result} />
      )}

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 'md', md: 'lg' }} mt={{ base: 'md', md: 'xl' }}>
        <Box>
          <Group justify="space-between" mb="md">
            <Title order={3}>{t('quickHistory')}</Title>
          </Group>
          <RecentTransactionsTable />
        </Box>
        
        <Box>
          <Group justify="space-between" mb="md">
            <Title order={3}>{t('activeBets')}</Title>
          </Group>
          <RecentBetsTable />
        </Box>
      </SimpleGrid>
    </Container>
  );
};
