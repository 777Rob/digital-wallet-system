import { Paper, NumberInput, Button, Title, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { useWalletStore } from '../../store/useWalletStore';

interface BetFormProps {
  isLoading: boolean;
  onSubmit: (values: { amount: number }) => void;
}

export const BetForm = ({ isLoading, onSubmit }: BetFormProps) => {
  const { t } = useTranslation();
  const balance = useWalletStore((state) => state.balance);

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
  });

  const quickAmounts = [5, 10, 50, 100];

  const handleQuickAmount = (amount: number) => {
    form.setFieldValue('amount', Math.min(amount, balance));
  };

  const handleMaxAmount = () => {
    form.setFieldValue('amount', balance);
  };

  return (
    <Paper shadow="sm" p="xl" withBorder className="gradient-card" h="100%">
      <Title order={3} mb="lg" style={{ color: 'white' }}>{t('placeNewBet')}</Title>
      <form onSubmit={handleSubmit}>
        <NumberInput
          label={t('betAmount')}
          min={1}
          max={balance}
          decimalScale={2}
          fixedDecimalScale
          required
          {...form.getInputProps('amount')}
          mb="xs"
          styles={{
            label: { color: 'white' }
          }}
        />
        
        <Group gap="xs" mb="xl">
          {quickAmounts.map((amount) => (
            <Button
              key={amount}
              size="compact-xs"
              variant="transparent"
              c="white"
              style={{ padding: '0 8px', border: '1px solid rgba(255, 255, 255, 0.3)' }}
              onClick={() => handleQuickAmount(amount)}
              disabled={balance < 1}
            >
              +{amount}
            </Button>
          ))}
          <Button
            size="compact-xs"
            variant="transparent"
            c="white"
            style={{ padding: '0 8px', border: '1px solid rgba(255, 255, 255, 0.3)' }}
            onClick={handleMaxAmount}
            disabled={balance < 1}
          >
            {t('max')}
          </Button>
        </Group>

        <Button 
          type="submit" 
          fullWidth 
          variant="white"
          c="#147055"
          fw={600}
          loading={isLoading}
          disabled={isLoading || balance < 1}
        >
          {isLoading ? t('flippingCoin') : t('bet')}
        </Button>
      </form>
    </Paper>
  );
};
