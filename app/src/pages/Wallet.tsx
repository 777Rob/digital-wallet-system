import { Container, Title, SimpleGrid, Paper, Stack, Text, Alert } from '@mantine/core';
import { IconGift } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useWalletStore } from '../store/useWalletStore';
import { formatEUR } from '../utils/currency';
import { TopUpForm } from '../components/Dashboard/TopUpForm';
import { PromoCodeForm } from '../components/Dashboard/PromoCodeForm';

export const Wallet = () => {
  const { t } = useTranslation();
  const balance = useWalletStore((state) => state.balance);

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
        <TopUpForm />
        <PromoCodeForm />
      </SimpleGrid>
    </Container>
  );
};
