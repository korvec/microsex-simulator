import { parseNumber } from "../instructions/utils";

export type DataDirectiveResult = {
  bytes: number[];
  symbol?: { name: string; address?: number; value?: number };
};

export function handleDbDirective(
  label: string | null,
  arg: string,
  currentAddress: number
): DataDirectiveResult | { error: string } {
  const value = parseNumber(arg);
  if (value === null) {
    return { error: `Valor inválido en .db: ${arg}` };
  }
  if (value < 0 || value > 255) {
    return { error: `Valor fuera de rango en .db: ${arg}` };
  }
  if (label && !/^[_]*[a-zA-Z][a-zA-Z0-9_]*$/.test(label)) {
    return { error: `Etiqueta inválida en .db: ${label}` };
  }
  if (currentAddress < 0 || currentAddress > 0xFFFF) {
    return { error: `Dirección fuera de rango en .db: ${currentAddress}` };
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
  const size = parseNumber(arg);
  if (size === null) {
    return { error: `Tamaño inválido en .rb: ${arg}` };
  }
  if (label && !/^[_]*[a-zA-Z_][a-zA-Z0-9_]*$/.test(label)) {
    return { error: `Etiqueta inválida en .rb: ${label}` };
  }
  if (size < 1 || size > 65536) {
    return { error: `Tamaño fuera de rango en .rb: ${arg}` };
  }
  const lastByte = currentAddress + size - 1;
  if (lastByte < 0 || lastByte > 0xFFFF) {
    return { error: `Dirección final fuera de rango en .rb: ${lastByte}` };
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
  const value = parseNumber(arg);
  if (value === null) return { error: `Valor inválido en .equ: ${arg}` };
  if (!label) return { error: "La directiva .equ requiere una etiqueta" };
  return { symbol: { name: label, value: value } };
}
