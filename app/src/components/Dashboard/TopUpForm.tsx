import { Paper, NumberInput, Button, Title, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { IconCash } from '@tabler/icons-react';

interface TopUpFormProps {
  isLoading: boolean;
  onSubmit: (values: { amount: number }) => void;
}

export const TopUpForm = ({ isLoading, onSubmit }: TopUpFormProps) => {
  const { t } = useTranslation();

  const form = useForm({
    initialValues: { amount: 10 },
    validate: {
      amount: (val: number) =>
        val < 1 ? t('minTopUp') : val > 10000 ? t('maxTopUp') : null,
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values);
    form.reset();
  });

  return (
    <Paper shadow="sm" p="lg" withBorder>
      <Title order={4} mb="md">{t('topUpBalance')}</Title>
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <NumberInput
            label={t('amount')}
            min={1}
            max={10000}
            decimalScale={2}
            fixedDecimalScale
            required
            {...form.getInputProps('amount')}
          />
          <Button
            type="submit"
            color="green"
            loading={isLoading}
            leftSection={<IconCash size={18} />}
          >
            {t('topUp')}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};
