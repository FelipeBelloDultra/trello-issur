const UNIT_SECONDS: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };

export function parseDurationToSeconds(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) throw new Error(`Invalid duration format: "${duration}"`);
  return Number(match[1]) * (UNIT_SECONDS[match[2]] ?? 1);
}
