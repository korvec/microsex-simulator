import { parseHexOrDecimal } from "../instructions/utils";

export type DataDirectiveResult = {
  bytes: number[];
  symbol?: { name: string; address: number; value?: number };
};

export function handleDbDirective(
  label: string | null,
  arg: string,
  currentAddress: number
): DataDirectiveResult | { error: string } {
  const value = parseHexOrDecimal(arg);
  if (value === null || value < 0 || value > 0xFF) {
    return { error: `Valor inválido en .db: ${arg}` };
  }
  return {
    bytes: [value],
    symbol: label
      ? { name: label, address: currentAddress, value: value }
      : undefined,
  };
}

export function handleRbDirective(
  label: string | null,
  arg: string,
  currentAddress: number
): DataDirectiveResult | { error: string } {
  const size = parseHexOrDecimal(arg);
  if (size === null || size <= 0 || size > 65536) {
    return { error: `Tamaño inválido en .rb: ${arg}` };
  }
  return {
    bytes: new Array(size).fill(0),
    symbol: label ? { name: label, address: currentAddress } : undefined,
  };
}

export function handleEquDirective(
  label: string | null,
  arg: string
): { symbol: { name: string; value: number } } | { error: string } {
  const value = parseHexOrDecimal(arg);
  if (value === null) return { error: `Valor inválido en .equ: ${arg}` };
  if (!label) return { error: "La directiva .equ requiere una etiqueta" };
  return { symbol: { name: label, value: value } };
}
