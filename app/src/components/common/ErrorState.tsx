import { Stack, Title, Text, Button, Card, Center } from '@mantine/core';
import { IconExclamationCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface ErrorStateProps {
  error: Error | any;
  onRetry?: () => void;
  title?: string;
  p?: string | number;
}

export const ErrorState = ({ error, onRetry, title, p = 'xl' }: ErrorStateProps) => {
  const { t } = useTranslation();
  
  return (
    <Card withBorder shadow="sm" radius="md" p={p}>
      <Center>
        <Stack align="center" gap="sm" ta="center">
          <IconExclamationCircle size={40} color="var(--mantine-color-red-6)" />
          <Title order={3}>{title || t('somethingWentWrong')}</Title>
          <Text c="dimmed" size="sm" maw={400}>
            {error?.message || t('unexpectedError')}
          </Text>
          {onRetry && (
            <Button mt="md" variant="light" color="red" onClick={onRetry}>
              {t('tryAgain')}
            </Button>
          )}
        </Stack>
      </Center>
    </Card>
  );
};
