import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Stack,
  Button,
  Progress,
  Badge,
  Box,
} from '@mantine/core';
import { IconGift, IconClock } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useWheel } from '../hooks/useWheel';
import { notifications } from '@mantine/notifications';
import { formatEUR } from '../utils/currency';

const PRIZES = [
  { amount: 0, color: '#ff6b6b', label: '0 EUR' },
  { amount: 10, color: '#4dabf7', label: '10 EUR' },
  { amount: 50, color: '#51cf66', label: '50 EUR' },
  { amount: 100, color: '#fcc419', label: '100 EUR' },
  { amount: 500, color: '#cc5de8', label: '500 EUR' },
  { amount: 1000, color: '#20c997', label: '1000 EUR' },
];

export const WheelOfFortune = () => {
  const { t } = useTranslation();
  const { statusQuery, claimMutation, spinMutation } = useWheel();
  const { data: wheelStatus } = statusQuery;

  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Countdown timer for free spin
  useEffect(() => {
    if (!wheelStatus?.lastFreeSpinClaimDate) {
      setTimeLeft('');
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const lastClaim = new Date(wheelStatus.lastFreeSpinClaimDate!).getTime();
      const diff = lastClaim + 24 * 60 * 60 * 1000 - now;

      if (diff <= 0) {
        setTimeLeft('');
        clearInterval(interval);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [wheelStatus?.lastFreeSpinClaimDate]);

  const handleClaimFreeSpin = () => {
    claimMutation.mutate(undefined, {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: 'You claimed your daily free spin!',
          color: 'green',
        });
      },
      onError: (err: any) => {
        notifications.show({
          title: 'Error',
          message: err.message || 'Failed to claim free spin',
          color: 'red',
        });
      },
    });
  };

  const handleSpin = () => {
    if (wheelStatus?.availableSpins === 0 || isSpinning) return;

    setIsSpinning(true);
    spinMutation.mutate(undefined, {
      onSuccess: (data: any) => {
        // Find prize index
        const index = PRIZES.findIndex((p) => p.amount === data.wonAmount);
        const targetIndex = index >= 0 ? index : 0;

        // Calculate rotation
        // Segment size is 60deg. Center of segment i is i * 60 + 30.
        // To land at center (12 o'clock / 0deg), rotate by 360 - (i * 60 + 30).
        const extraSpins = 5 * 360; // 5 full spins
        const segmentCenter = targetIndex * 60 + 30;
        
        // We add this to current rotation to keep spinning forward
        const currentSpins = Math.floor(rotation / 360) * 360;
        const newRotation = currentSpins + extraSpins + (360 - segmentCenter);

        setRotation(newRotation);

        setTimeout(() => {
          setIsSpinning(false);
          if (data.wonAmount > 0) {
            notifications.show({
              title: 'Congratulations!',
              message: `You won ${formatEUR(data.wonAmount)}!`,
              color: 'green',
              icon: <IconGift size={18} />,
            });
          } else {
            notifications.show({
              title: 'Better luck next time!',
              message: 'You won 0 EUR.',
              color: 'gray',
            });
          }
        }, 5000); // 5s match CSS transition
      },
      onError: (err: any) => {
        setIsSpinning(false);
        notifications.show({
          title: 'Error',
          message: err.message || 'Failed to spin the wheel',
          color: 'red',
        });
      },
    });
  };

  const gradientColors = PRIZES.map(
    (prize, i) => `${prize.color} ${i * 60}deg ${(i + 1) * 60}deg`
  ).join(', ');

  const progressPercent = wheelStatus ? (wheelStatus.betAmountTowardsSpin / 1000) * 100 : 0;

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Title order={2}>{t('wheelOfFortune', 'Wheel of Fortune')}</Title>
          <Badge size="xl" color="green" variant="light">
            {wheelStatus?.availableSpins || 0} Spins Available
          </Badge>
        </Group>

        <Group align="flex-start" gap="xl">
          <Card withBorder shadow="sm" radius="md" style={{ flex: 1 }}>
            <Stack gap="md" align="center">
              <Text fw={600} size="lg">Spin to Win</Text>
              
              <Box style={{ position: 'relative', width: 300, height: 300 }}>
                {/* Pointer */}
                <Box
                  style={{
                    position: 'absolute',
                    top: -15,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '15px solid transparent',
                    borderRight: '15px solid transparent',
                    borderTop: '30px solid var(--mantine-color-red-6)',
                    zIndex: 10,
                  }}
                />

                {/* Wheel */}
                <Box
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: `conic-gradient(${gradientColors})`,
                    transform: `rotate(${rotation}deg)`,
                    transition: 'transform 5s cubic-bezier(0.25, 0.1, 0.15, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '4px solid var(--mantine-color-gray-2)',
                    boxShadow: '0 0 15px rgba(0,0,0,0.1)',
                  }}
                >
                  {PRIZES.map((prize, i) => {
                    const angle = i * 60 + 30; // Center of the segment
                    return (
                      <Text
                        key={i}
                        fw={700}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-110px)`,
                          color: 'white',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                        }}
                      >
                        {prize.label}
                      </Text>
                    );
                  })}
                </Box>
              </Box>

              <Button 
                size="xl" 
                radius="md" 
                color="green" 
                fullWidth 
                mt="md"
                onClick={handleSpin}
                loading={isSpinning || spinMutation.isPending}
                disabled={!wheelStatus?.availableSpins || wheelStatus.availableSpins <= 0}
              >
                SPIN ({wheelStatus?.availableSpins || 0} left)
              </Button>
            </Stack>
          </Card>

          <Stack style={{ flex: 1 }} gap="md">
            <Card withBorder shadow="sm" radius="md">
              <Stack gap="sm">
                <Group gap="xs">
                  <IconGift size={24} color="var(--mantine-color-green-6)" />
                  <Title order={4}>Daily Free Spin</Title>
                </Group>
                <Text size="sm" c="dimmed">
                  Claim one free spin every 24 hours to win up to 1000 EUR.
                </Text>
                
                {timeLeft ? (
                  <Group gap="xs" mt="sm">
                    <IconClock size={16} />
                    <Text fw={600} c="orange">Available in {timeLeft}</Text>
                  </Group>
                ) : (
                  <Button 
                    mt="sm" 
                    variant="light" 
                    color="green" 
                    onClick={handleClaimFreeSpin}
                    loading={claimMutation.isPending}
                  >
                    Claim Free Spin
                  </Button>
                )}
              </Stack>
            </Card>

            <Card withBorder shadow="sm" radius="md">
              <Stack gap="sm">
                <Title order={4}>Bet to Earn</Title>
                <Text size="sm" c="dimmed">
                  Earn 1 additional spin for every 1000 EUR you bet in any of our games.
                </Text>
                
                <Box mt="sm">
                  <Group justify="space-between" mb={5}>
                    <Text size="sm" fw={500}>Current Progress</Text>
                    <Text size="sm" fw={700}>{formatEUR(wheelStatus?.betAmountTowardsSpin || 0)} / €1,000</Text>
                  </Group>
                  <Progress value={progressPercent} size="lg" radius="xl" color="green" striped animated />
                </Box>
              </Stack>
            </Card>
          </Stack>
        </Group>
      </Stack>
    </Container>
  );
};
