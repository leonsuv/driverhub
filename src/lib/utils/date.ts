import { format, formatDistanceToNow } from "date-fns";

export function formatDate(date: Date | string, formatStr = "PPP") {
  const value = typeof date === "string" ? new Date(date) : date;
  return format(value, formatStr);
}

export function formatRelativeDate(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(value, { addSuffix: true });
}
