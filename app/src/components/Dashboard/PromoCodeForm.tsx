import { Paper, TextInput, Button, Title, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { IconGift } from '@tabler/icons-react';
import { usePromoCodeMutation } from '../../hooks/mutations/useWalletMutations';
import { useWalletStore } from '../../store/useWalletStore';
import { notifications } from '@mantine/notifications';
import { formatEUR } from '../../utils/currency';
import { extractErrorMessage } from '../../utils/errorMessage';

export const PromoCodeForm = () => {
  const { t } = useTranslation();
  const promoMutation = usePromoCodeMutation();

  const form = useForm({
    initialValues: { code: '' },
    validate: {
      code: (val: string) => (val.trim().length === 0 ? t('required') : null),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    promoMutation.mutate(values, {
      onSuccess: (data) => {
        form.reset();
        useWalletStore.getState().setBalance(data.balance);
        notifications.show({
          title: t('success'),
          message: `${t('promoRedeemed')} +${formatEUR(data.amount)}`,
          color: 'green',
        });
      },
      onError: (error) => {
        const backendMessage = extractErrorMessage(error, t('failedToRedeemPromo'));
        let message = backendMessage;
        
        if (backendMessage === "Invalid promotional code") {
          message = t('invalidPromoCode');
        } else if (backendMessage === "This code has already been redeemed") {
          message = t('promoAlreadyRedeemed');
        } else if (backendMessage === "Please enter a promo code") {
          message = t('pleaseEnterPromoCode');
        }

        form.setFieldError('code', `${message}: ${values.code}`);
        notifications.show({
          title: t('error'),
          message,
          color: 'red',
        });
      },
    });
  });

  return (
    <Paper shadow="sm" p="lg" withBorder>
      <Title order={4} mb="md">{t('promoCode')}</Title>
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <TextInput
            label={t('enterPromoCode')}
            placeholder="HELLO"
            required
            {...form.getInputProps('code')}
          />
          <Button
            type="submit"
            variant="light"
            color="green"
            loading={promoMutation.isPending}
            leftSection={<IconGift size={18} />}
          >
            {t('redeem')}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};
