import { Paper, TextInput, Button, Title, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { IconGift } from '@tabler/icons-react';

interface PromoCodeFormProps {
  isLoading: boolean;
  onSubmit: (values: { code: string }, form: UseFormReturnType<{ code: string }>) => void;
}

export const PromoCodeForm = ({ isLoading, onSubmit }: PromoCodeFormProps) => {
  const { t } = useTranslation();

  const form = useForm({
    initialValues: { code: '' },
    validate: {
      code: (val: string) => (val.trim().length === 0 ? t('required') : null),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values, form);
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
            loading={isLoading}
            leftSection={<IconGift size={18} />}
          >
            {t('redeem')}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};
