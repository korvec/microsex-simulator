import { INSTRUCTION_SET } from "./index";
import { Operand, InstructionVariant } from "./types";

export function getVariantByOperands(
  name: string,
  operands: [Operand, Operand]
): InstructionVariant | undefined {
  const entry = INSTRUCTION_SET.find(
    (i) => i.name.toUpperCase() === name.toUpperCase()
  );
  if (!entry) return undefined;
  return entry.variants.find(
    (v) => v.operands[0] === operands[0] && v.operands[1] === operands[1]
  );
}

export function assembleLine(
  rawLine: string
): { opcode: number[]; size: number } | { error: string } {
  const cleanLine = rawLine.trim().replace(/\s+/g, " ");
  const [mnemonicPart, argsPart] = cleanLine.split(/ (.+)/);
  if (!mnemonicPart) return { error: "Missing mnemonic." };

  const mnemonic = mnemonicPart.toUpperCase();
  const args = argsPart?.split(/\s*,\s*/) ?? [];

  if (args.length !== 2) {
    return { error: `Expected 2 operands, got ${args.length}` };
  }

  const [op1Raw, op2Raw] = args;
  const op1 = op1Raw.trim().toUpperCase();
  const op2Parsed = parseArgument(op2Raw);

  if ("error" in op2Parsed) return { error: op2Parsed.error };

  const operand1 = op1 as Operand;
  const operand2 = op2Parsed.operand;
  const value = op2Parsed.value;

  const variant = getVariantByOperands(mnemonic, [operand1, operand2]);
  if (!variant) {
    return { error: `Instruction not found: ${mnemonic} ${operand1}, ${operand2}` };
  }

  const opcode = [...variant.opcode];
  if (variant.size > variant.opcode.length) {
    const addressBytes = encodeAddress(value, variant.size - variant.opcode.length);
    if (!addressBytes) return { error: `Invalid value for address encoding: ${value}` };
    opcode.push(...addressBytes);
  }

  return { opcode, size: variant.size };
}

function encodeAddress(value: number, size: number): number[] | null {
  if (value < 0 || value > 0xFFFF) return null;
  const bytes: number[] = [];
  for (let i = 0; i < size; i++) {
    bytes.unshift((value >> (8 * i)) & 0xff);
  }
  return bytes;
}

export function parseArgument(raw: string): { operand: Operand; value: number } | { error: string } {
  const trimmed = raw.trim();

  if (trimmed.startsWith("#")) {
    const value = parseHexOrDecimal(trimmed.slice(1));
    if (value === null) return { error: `Invalid immediate value: ${trimmed}` };
    return { operand: "IMM", value };
  }

  if (/^(IX|IY)(\s*[+-]\s*\d+)?$/i.test(trimmed)) {
    return { operand: trimmed.startsWith("IX") ? "IX" : "IY", value: 0 }; // Offset handling can be added later
  }

  const value = parseHexOrDecimal(trimmed);
  if (value !== null) return { operand: "MEM", value };

  return { error: `Unrecognized argument format: ${trimmed}` };
}

function parseNumber(value: string): number | null {
  if (/^0x[0-9a-fA-F]+$/.test(value)) return parseInt(value, 16);
  if (/^0b[01]+$/.test(value)) return parseInt(value.slice(2), 2);
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  return null;
}

export function parseHex(value: string): number | null {
  if (/^0x[0-9a-fA-F]+$/.test(value)) return parseInt(value, 16);
  return null;
}

export function parseHexOrDecimal(value: string): number | null {
  if (/^0x[0-9a-fA-F]+$/.test(value)) return parseInt(value, 16);
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  return null;
}
