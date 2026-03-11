import { Card, Center, Stack, Text, Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { formatEUR } from '../../utils/currency';

interface CoinFlipResultProps {
  isFlipping: boolean;
  result: { winAmount: number | null } | null;
}

export const CoinFlipResult = ({ isFlipping, result }: CoinFlipResultProps) => {
  const { t } = useTranslation();

  if (!isFlipping && !result) {
    return null;
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
      <Center mb="md">
        <div className="coin-container">
          <div className={`coin ${isFlipping ? 'flipping win' : (result?.winAmount ? 'win' : 'lost')}`}>
            {isFlipping ? '?' : (result?.winAmount ? 'WIN' : 'LOST')}
          </div>
        </div>
      </Center>

      {!isFlipping && result && (
        <Stack align="center" gap="xs">
          <Text fw={500}>Result</Text>
          <Badge color={result.winAmount ? "green" : "red"} size="lg">
            {result.winAmount ? t('win') : t('lost')}
          </Badge>
          {result.winAmount && (
            <Text size="xl" fw={700} c="green">
              +{formatEUR(result.winAmount)}
            </Text>
          )}
        </Stack>
      )}
    </Card>
  );
};
