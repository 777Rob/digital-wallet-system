import { ActionIcon, Menu } from "@mantine/core";
import { IconWorld } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export const LanguageMenu = () => {
  const { i18n } = useTranslation();

  return (
    <Menu shadow="md" width={150}>
      <Menu.Target>
        <ActionIcon variant="default" size="lg" aria-label="Toggle language">
          <IconWorld size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={() => i18n.changeLanguage("en")}>English</Menu.Item>
        <Menu.Item onClick={() => i18n.changeLanguage("lt")}>
          Lietuvių
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
