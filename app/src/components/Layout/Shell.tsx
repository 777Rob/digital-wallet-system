import { useMemo } from 'react';
import { AppShell, Burger, Group, Title, Text, ActionIcon, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, NavLink as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { IconLogout, IconCoin, IconTicket, IconHistory, IconWallet } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useWalletStore } from '../../store/useWalletStore';
import { useWalletWs } from '../../hooks/useWalletWs';
import { formatEUR } from '../../utils/currency';
import { LanguageMenu } from '../common/LanguageMenu';
import { ColorSchemeToggle } from '../common/ColorSchemeToggle';

export const Shell = () => {
  const [opened, { toggle }] = useDisclosure();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const logout = useAuthStore((state) => state.logout);
  const balance = useWalletStore((state) => state.balance);

  useWalletWs();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = useMemo(() => [
    { to: '/dashboard', label: t('bet'), icon: <IconCoin size={24} stroke={1.5} /> },
    { to: '/my-bets', label: t('myBets'), icon: <IconTicket size={24} stroke={1.5} /> },
    { to: '/transactions', label: t('transactions'), icon: <IconHistory size={24} stroke={1.5} /> },
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
              <IconWallet size={34} className="wallet-logo-icon" />
              <Title order={2} c="green" style={{ fontFamily: 'Inter, sans-serif' }}>QuestWallet</Title>
            </Group>
          </Group>

          <Group>
            <Text fw={700} c="green" size="lg">
              {formatEUR(balance)}
            </Text>

            <LanguageMenu />
            <ColorSchemeToggle />

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
              if (opened) toggle();
            }}
            variant="light"
            color="green"
            styles={{ label: { fontSize: '1.05rem' } }}
            style={{ borderRadius: 'var(--mantine-radius-md)', marginBottom: 4, fontWeight: 500 }}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
