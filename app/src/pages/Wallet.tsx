import { Container, Title, SimpleGrid, Paper, Stack, Text, Alert } from '@mantine/core';
import { IconGift } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useWalletStore } from '../store/useWalletStore';
import { notifications } from '@mantine/notifications';
import { formatEUR } from '../utils/currency';
import { useTopUpMutation, usePromoCodeMutation } from '../hooks/mutations/useWalletMutations';
import { extractErrorMessage } from '../utils/errorMessage';
import { TopUpForm } from '../components/Dashboard/TopUpForm';
import { PromoCodeForm } from '../components/Dashboard/PromoCodeForm';

export const Wallet = () => {
  const { t } = useTranslation();
  const balance = useWalletStore((state) => state.balance);
  const topUpMutation = useTopUpMutation();
  const promoMutation = usePromoCodeMutation();

  const handleTopUp = (values: { amount: number }) => {
    topUpMutation.mutate(values, {
      onSuccess: (data) => {
        useWalletStore.getState().setBalance(data.balance);
        notifications.show({
          title: t('success'),
          message: `${t('topUpSuccess')} +${formatEUR(values.amount)}`,
          color: 'green',
        });
      },
      onError: (error) => {
        notifications.show({
          title: t('error'),
          message: extractErrorMessage(error, t('failedToTopUp')),
          color: 'red',
        });
      },
    });
  };

  const handlePromoCode = (values: { code: string }) => {
    promoMutation.mutate(values, {
      onSuccess: (data) => {
        useWalletStore.getState().setBalance(data.balance);
        notifications.show({
          title: t('success'),
          message: `${t('promoRedeemed')} +${formatEUR(data.amount)}`,
          color: 'green',
        });
      },
      onError: (error) => {
        notifications.show({
          title: t('error'),
          message: extractErrorMessage(error, t('failedToRedeemPromo')),
          color: 'red',
        });
      },
    });
  };

  return (
    <Container size="lg" mt="xl">
      <Title order={2} mb="xl">{t('wallet')}</Title>

      <Paper shadow="sm" p="xl" withBorder mb="xl">
        <Stack align="center" gap="xs">
          <Title order={1} c="green" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
            {formatEUR(balance)}
          </Title>
          <Text c="dimmed" size="lg" fw={500}>{t('globalBalance')}</Text>
        </Stack>
      </Paper>

      <Alert
        variant="light"
        color="violet"
        icon={<IconGift size={24} />}
        title={t('promoBannerTitle')}
        mb="xl"
        radius="md"
      >
        {t('promoBannerText')}
      </Alert>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <TopUpForm isLoading={topUpMutation.isPending} onSubmit={handleTopUp} />
        <PromoCodeForm isLoading={promoMutation.isPending} onSubmit={handlePromoCode} />
      </SimpleGrid>
    </Container>
  );
};
