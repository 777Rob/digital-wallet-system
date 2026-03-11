import { Badge } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { BetStatus } from "../../types";

const STATUS_COLOR: Record<BetStatus, string> = {
  win: "green",
  lost: "red",
  canceled: "gray",
};

interface BetStatusBadgeProps {
  status: BetStatus;
}

export const BetStatusBadge = ({ status }: BetStatusBadgeProps) => {
  const { t } = useTranslation();

  return <Badge color={STATUS_COLOR[status]}>{t(status)}</Badge>;
};
