/**
 * Format a date string into a compact locale representation (MM/DD, HH:MM).
 */
export const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleString(undefined, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
