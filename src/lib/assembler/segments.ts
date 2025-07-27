export type SegmentType = "CODE" | "DATA" | "NONE";

export interface SegmentContext {
  origin: number;
  segment: SegmentType;
}

export function createInitialContext(): SegmentContext {
  return {
    origin: 0,
    segment: "NONE",
  };
}

export function handleSegmentDirective(
  line: string,
  context: SegmentContext
): SegmentContext | { error: string } {
  const trimmed = line.trim().toLowerCase();

  if (trimmed.startsWith(".org")) {
    const parts = trimmed.split(/\s+/);
    if (parts.length !== 2) return { error: "Falta la dirección para .org" };
    const addr = parseInt(parts[1], 16);
    if (isNaN(addr)) return { error: "Dirección inválida para .org" };
    return { ...context, origin: addr };
  }

  if (trimmed === ".dseg") return { ...context, segment: "DATA" };
  if (trimmed === ".cseg") return { ...context, segment: "CODE" };
  if (trimmed === ".fin") return { ...context, segment: "NONE" };

  return context;
}
