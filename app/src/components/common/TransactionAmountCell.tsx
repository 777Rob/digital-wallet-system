import { Text } from "@mantine/core";
import { formatEUR } from "../../utils/currency";
import type { TransactionType } from "../../types";

interface TransactionAmountCellProps {
  amount: number;
  type: TransactionType;
}

const isDebit = (type: TransactionType): boolean => type === "bet";

export const TransactionAmountCell = ({
  amount,
  type,
}: TransactionAmountCellProps) => {
  const prefix = isDebit(type) ? "-" : "+";
  const color = isDebit(type) ? "red" : "green";

  return (
    <Text component="span" fw={600} c={color}>
      {prefix}
      {formatEUR(amount)}
    </Text>
  );
};
