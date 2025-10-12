type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | Record<string, boolean | undefined | null | 0 | 1>;

/**
 * Lightweight replacement for the popular `classnames` package.
 * Accepts strings or object maps and returns a space-separated string.
 */
export function cn(...values: ClassValue[]): string {
  const classes: string[] = [];

  for (const value of values) {
    if (!value) continue;

    if (typeof value === "string" || typeof value === "number") {
      classes.push(String(value));
      continue;
    }

    if (typeof value === "object") {
      for (const [key, condition] of Object.entries(value)) {
        if (condition) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(" ");
}

export default cn;
