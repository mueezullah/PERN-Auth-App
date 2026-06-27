import { toast } from "react-toastify";

export const handleSuccess = (msg: string) => {
  toast.success(msg, { position: "top-right" });
};

export const handleError = (msg: string) => {
  toast.error(msg, { position: "top-right" });
};

const normalizeDateValue = (value: string | Date | null | undefined) => {
  if (!value) return null;
  if (value instanceof Date) return value;

  if (typeof value === "number") {
    return new Date(value);
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(trimmed);
  const looksLikeSqlTimestamp = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/.test(
    trimmed,
  );

  if (looksLikeSqlTimestamp && !hasTimezone) {
    return new Date(`${trimmed.replace(" ", "T")}Z`);
  }

  return new Date(trimmed);
};

export const formatRelativeTime = (
  value: string | Date | null | undefined,
): string => {
  const date = normalizeDateValue(value);

  if (!date || Number.isNaN(date.getTime())) {
    return "just now";
  }

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds <= 0) return "just now";
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};
