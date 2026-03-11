import { Box, Center, Group } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import { LanguageMenu } from '../common/LanguageMenu';
import { ColorSchemeToggle } from '../common/ColorSchemeToggle';

export const AuthLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Box pos="relative" mih="100vh">
      <Group pos="absolute" top={20} right={20}>
        <LanguageMenu />
        <ColorSchemeToggle />
      </Group>

      <Center mih="100vh" p="md">
        {children || <Outlet />}
      </Center>
    </Box>
  );
};
