import { useState } from 'react';
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
  Center,
  Loader,
} from '@mantine/core';
import { IconGift, IconClock } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useWheel } from '../hooks/useWheel';
import { notifications } from '@mantine/notifications';
import { formatEUR } from '../utils/currency';
import Confetti from 'react-confetti';
import { useCountdown } from '../hooks/useCountdown';
import { ErrorState } from '../components/common/ErrorState';

const PRIZES = [
  { amount: 0, color: '#ff6b6b' },
  { amount: 10, color: '#4dabf7' },
  { amount: 50, color: '#51cf66' },
  { amount: 100, color: '#fcc419' },
  { amount: 500, color: '#cc5de8' },
  { amount: 1000, color: '#20c997' },
];

export const WheelOfFortune = () => {
  const { t } = useTranslation();
  const { statusQuery, claimMutation, spinMutation } = useWheel();
  const { data: wheelStatus, isLoading, error, refetch } = statusQuery;

  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const timeLeft = useCountdown(wheelStatus?.lastFreeSpinClaimDate);

  const formatTimeLeft = () => {
    if (!timeLeft) return null;
    return `${timeLeft.hours}${t('hoursShort')} ${timeLeft.minutes}${t('minutesShort')} ${timeLeft.seconds}${t('secondsShort')}`;
  };

  const handleClaimFreeSpin = () => {
    claimMutation.mutate(undefined, {
      onSuccess: () => {
        notifications.show({
          title: t('success'),
          message: t('claimSuccess'),
          color: 'green',
        });
      },
      onError: (err: any) => {
        notifications.show({
          title: t('error'),
          message: err.message || t('failedToClaim'),
          color: 'red',
        });
      },
    });
  };

  const handleSpin = () => {
    if (wheelStatus?.availableSpins === 0 || isSpinning) return;

    setShowConfetti(false);
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
            setShowConfetti(true);
            notifications.show({
              title: t('congratulations'),
              message: t('wonAmount', { amount: formatEUR(data.wonAmount) }),
              color: 'green',
              icon: <IconGift size={18} />,
            });
          } else {
            notifications.show({
              title: t('betterLuck'),
              message: t('wonZero'),
              color: 'gray',
            });
          }
        }, 5000); // 5s match CSS transition
      },
      onError: (err: any) => {
        setIsSpinning(false);
        notifications.show({
          title: t('error'),
          message: err.message || t('failedToSpin'),
          color: 'red',
        });
      },
    });
  };

  if (error) {
    return (
      <Container size="md" py="xl">
        <Title order={2} mb="xl">{t('wheelOfFortune')}</Title>
        <ErrorState error={error} onRetry={() => refetch()} title={t('somethingWentWrong')} />
      </Container>
    );
  }

  const gradientColors = PRIZES.map(
    (prize, i) => `${prize.color} ${i * 60}deg ${(i + 1) * 60}deg`
  ).join(', ');

  const progressPercent = wheelStatus ? (wheelStatus.betAmountTowardsSpin / 1000) * 100 : 0;

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Title order={2}>{t('wheelOfFortune')}</Title>
          {isLoading && !wheelStatus ? (
             <Loader size="sm" />
          ) : (
             <Badge size="xl" color="green" variant="light">
               {wheelStatus?.availableSpins || 0} {t('spinsAvailable')}
             </Badge>
          )}
        </Group>

        {isLoading && !wheelStatus ? (
           <Center my={50}><Loader /></Center>
        ) : (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 'var(--mantine-spacing-xl)',
              alignItems: 'flex-start',
            }}
          >
            <Card withBorder shadow="sm" radius="md" style={{ flex: '1 1 300px' }}>
              <Stack gap="md" align="center">
                <Text fw={600} size="lg">{t('spinToWin')}</Text>
                
                <Box style={{ position: 'relative', width: 300, height: 300 }}>
                  {showConfetti && (
                    <Box style={{ position: 'absolute', top: -50, left: -50, width: 400, height: 400, pointerEvents: 'none', zIndex: 100 }}>
                      <Confetti
                        width={400}
                        height={400}
                        recycle={false}
                        numberOfPieces={250}
                        gravity={0.15}
                        initialVelocityY={10}
                      />
                    </Box>
                  )}

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
                          {prize.amount === 0 ? `0 €` : formatEUR(prize.amount)}
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
                  {t('spin')}
                </Button>
              </Stack>
            </Card>

            <Stack style={{ flex: '1 1 300px' }} gap="md">
              <Card withBorder shadow="sm" radius="md">
                <Stack gap="sm">
                  <Group gap="xs">
                    <IconGift size={24} color="var(--mantine-color-green-6)" />
                    <Title order={4}>{t('dailyFreeSpin')}</Title>
                  </Group>
                  <Text size="sm" c="dimmed">
                    {t('dailyFreeSpinDesc')}
                  </Text>
                  
                  {timeLeft ? (
                    <Group gap="xs" mt="sm">
                      <IconClock size={16} />
                      <Text fw={600} c="orange">{t('availableIn', { time: formatTimeLeft() })}</Text>
                    </Group>
                  ) : (
                    <Button 
                      mt="sm" 
                      variant="light" 
                      color="green" 
                      onClick={handleClaimFreeSpin}
                      loading={claimMutation.isPending}
                      disabled={isLoading}
                    >
                      {t('claimFreeSpin')}
                    </Button>
                  )}
                </Stack>
              </Card>

              <Card withBorder shadow="sm" radius="md">
                <Stack gap="sm">
                  <Title order={4}>{t('betToEarn')}</Title>
                  <Text size="sm" c="dimmed">
                    {t('betToEarnDesc')}
                  </Text>
                  
                  <Box mt="sm">
                    <Group justify="space-between" mb={5}>
                      <Text size="sm" fw={500}>{t('currentProgress')}</Text>
                      <Text size="sm" fw={700}>{formatEUR(wheelStatus?.betAmountTowardsSpin || 0)} / €1,000</Text>
                    </Group>
                    <Progress value={progressPercent} size="lg" radius="xl" color="green" striped animated />
                  </Box>
                </Stack>
              </Card>
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  );
};
