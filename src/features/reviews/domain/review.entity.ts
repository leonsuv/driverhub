const DEFAULT_EXCERPT_LENGTH = 220;

export function createReviewExcerpt(content: string, maxLength = DEFAULT_EXCERPT_LENGTH) {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

export function normalizeOptionalField(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}
