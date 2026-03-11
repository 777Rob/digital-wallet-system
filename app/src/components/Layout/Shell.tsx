import React from 'react';
import { AppShell, Burger, Group, Title, Text, ActionIcon, useMantineColorScheme, useComputedColorScheme, Menu, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, NavLink as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  IconSun, 
  IconMoon, 
  IconLogout, 
  IconWorld, 
  IconCoin, 
  IconTicket, 
  IconHistory, 
  IconWallet 
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useWalletStore } from '../../store/useWalletStore';
import { useWalletWs } from '../../hooks/useWalletWs';
import { formatEUR } from '../../utils/currency';

export const Shell = () => {
  const [opened, { toggle }] = useDisclosure();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const logout = useAuthStore((state) => state.logout);
  const balance = useWalletStore((state) => state.balance);

  // Initialize WebSockets
  useWalletWs();

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = React.useMemo(() => [
    { to: '/dashboard', label: t('bet'), icon: <IconCoin size={20} stroke={1.5} /> },
    { to: '/my-bets', label: t('myBets'), icon: <IconTicket size={20} stroke={1.5} /> },
    { to: '/transactions', label: t('transactions'), icon: <IconHistory size={20} stroke={1.5} /> },
  ], [t]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap="sm">
              <IconWallet size={28} color="var(--mantine-color-blue-filled)" />
              <Title order={3}>Wallet.app</Title>
            </Group>
          </Group>

          <Group>
            <Text fw={700} c="blue" size="lg">
              {formatEUR(balance)}
            </Text>
            
            <Menu shadow="md" width={150}>
              <Menu.Target>
                <ActionIcon variant="default" size="lg">
                  <IconWorld size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => i18n.changeLanguage('en')}>English</Menu.Item>
                <Menu.Item onClick={() => i18n.changeLanguage('lt')}>Lietuvių</Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <ActionIcon variant="default" onClick={toggleColorScheme} size="lg">
              {computedColorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>

            <ActionIcon variant="default" color="red" onClick={handleLogout} size="lg">
              <IconLogout size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            component={RouterLink}
            to={item.to}
            label={item.label}
            leftSection={item.icon}
            active={location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)}
            onClick={() => {
              if (opened) toggle(); // Close on mobile click
            }}
            variant="light"
            style={{ borderRadius: 'var(--mantine-radius-sm)', marginBottom: 4 }}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
