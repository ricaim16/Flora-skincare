export function isMissingColumnError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    cause?: {
      code?: string;
    };
  };

  return candidate.cause?.code === "42703";
}

export function isMissingTableError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    cause?: {
      code?: string;
    };
  };

  return candidate.cause?.code === "42P01";
}
