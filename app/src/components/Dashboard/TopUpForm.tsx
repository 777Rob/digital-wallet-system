import { Paper, NumberInput, Button, Title, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { IconCash } from '@tabler/icons-react';
import { useTopUpMutation } from '../../hooks/mutations/useWalletMutations';
import { useWalletStore } from '../../store/useWalletStore';
import { notifications } from '@mantine/notifications';
import { formatEUR } from '../../utils/currency';
import { extractErrorMessage } from '../../utils/errorMessage';

export const TopUpForm = () => {
  const { t } = useTranslation();
  const topUpMutation = useTopUpMutation();

  const form = useForm({
    initialValues: { amount: 10 },
    validate: {
      amount: (val: number) =>
        val < 1 ? t('minTopUp') : val > 10000 ? t('maxTopUp') : null,
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    topUpMutation.mutate(values, {
      onSuccess: (data) => {
        useWalletStore.getState().setBalance(data.balance);
        notifications.show({
          title: t('success'),
          message: `${t('topUpSuccess')} +${formatEUR(values.amount)}`,
          color: 'green',
        });
        form.reset();
      },
      onError: (error) => {
        notifications.show({
          title: t('error'),
          message: extractErrorMessage(error, t('failedToTopUp')),
          color: 'red',
        });
      },
    });
  });

  return (
    <Paper shadow="sm" p="lg" withBorder>
      <Title order={4} mb="md">{t('topUpBalance')}</Title>
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <NumberInput
            label={t('amount')}
            description={t('topUpLimits')}
            decimalScale={2}
            fixedDecimalScale
            clampBehavior="none"
            required
            {...form.getInputProps('amount')}
          />
          <Button
            type="submit"
            color="green"
            loading={topUpMutation.isPending}
            leftSection={<IconCash size={18} />}
          >
            {t('topUp')}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};
