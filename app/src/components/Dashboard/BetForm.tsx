import { Paper, NumberInput, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { formatEUR } from '../../utils/currency';

interface BetFormProps {
  balance: number;
  isLoading: boolean;
  onSubmit: (values: { amount: number }) => void;
}

export const BetForm = ({ balance, isLoading, onSubmit }: BetFormProps) => {
  const { t } = useTranslation();

  const form = useForm({
    initialValues: {
      amount: 1,
    },
    validate: {
      amount: (val: number) => (val < 1 ? t('minBet') : val > balance ? t('insufficientBalance') : null),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values);
    form.reset();
  });

  return (
    <Paper shadow="sm" p="xl" withBorder>
      <form onSubmit={handleSubmit}>
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
          loading={isLoading}
          disabled={isLoading || balance < 1}
        >
          {isLoading ? 'Flipping Coin...' : t('bet')}
        </Button>
      </form>
    </Paper>
  );
};
