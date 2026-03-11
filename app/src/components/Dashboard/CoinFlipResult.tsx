import { Card, Center, Stack, Text, Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { formatEUR } from '../../utils/currency';
import { IconCoin, IconTrophy, IconMoodSad } from '@tabler/icons-react';

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
          <div className={`coin ${isFlipping ? 'flipping' : (result?.winAmount ? 'win' : 'lost')}`}>
            <div className="coin-inner">
              {isFlipping ? (
                <IconCoin size={60} color="white" stroke={1.5} />
              ) : result?.winAmount ? (
                <IconTrophy size={60} color="white" stroke={1.5} />
              ) : (
                <IconMoodSad size={60} color="white" stroke={1.5} />
              )}
            </div>
          </div>
        </div>
      </Center>

      {!isFlipping && result && (
        <Stack align="center" gap="xs">
          <Text fw={500}>{t('result')}</Text>
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
