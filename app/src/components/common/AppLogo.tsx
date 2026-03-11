import { Group, Text } from '@mantine/core';
import { IconWallet } from '@tabler/icons-react';

interface AppLogoProps {
  size?: number;
  /** Hide the text label (icon-only mode) */
  iconOnly?: boolean;
}

export const AppLogo = ({ size = 36, iconOnly = false }: AppLogoProps) => (
  <Group justify="center" gap="xs">
    <IconWallet size={size} className="wallet-logo-icon" />
    {!iconOnly && <Text fw={700} size="xl">QuestWallet</Text>}
  </Group>
);
