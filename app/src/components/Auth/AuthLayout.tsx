import { Box, Center, Group, ActionIcon, Menu, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconSun, IconMoon, IconWorld } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

export const AuthLayout = ({ children }: { children?: React.ReactNode }) => {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const { i18n } = useTranslation();

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Box pos="relative" mih="100vh">
      <Group pos="absolute" top={20} right={20}>
        <Menu shadow="md" width={150}>
          <Menu.Target>
            <ActionIcon variant="default" size="lg" aria-label="Toggle language">
              <IconWorld size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => i18n.changeLanguage('en')}>English</Menu.Item>
            <Menu.Item onClick={() => i18n.changeLanguage('lt')}>Lietuvių</Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <ActionIcon variant="default" onClick={toggleColorScheme} size="lg" aria-label="Toggle color scheme">
          {computedColorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
        </ActionIcon>
      </Group>

      <Center mih="100vh" p="md">
        {children || <Outlet />}
      </Center>
    </Box>
  );
};
