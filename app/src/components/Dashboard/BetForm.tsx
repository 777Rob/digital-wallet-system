import { Paper, NumberInput, Button, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';

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
    <Paper shadow="sm" p="xl" withBorder className="gradient-card" h="100%">
      <Title order={3} mb="lg" style={{ color: 'white' }}>Place New Bet</Title>
      <form onSubmit={handleSubmit}>
        <NumberInput
          label={t('betAmount')}
          min={1}
          max={balance}
          decimalScale={2}
          fixedDecimalScale
          required
          {...form.getInputProps('amount')}
          mb="xl"
        />
        <Button 
          type="submit" 
          fullWidth 
          variant="white"
          color="green"
          loading={isLoading}
          disabled={isLoading || balance < 1}
        >
          {isLoading ? 'Flipping Coin...' : t('bet')}
        </Button>
      </form>
    </Paper>
  );
};
