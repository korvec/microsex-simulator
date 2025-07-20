export type AddressingMode = "immediate" | "direct" | "indirect" | "indexed";

export interface Instruction {
  opcode: string;
  name: string;
  modes: AddressingMode[];
}

export const INSTRUCTION_SET: Instruction[] = [
  {
    name: "MOV",
    opcode: "A0",
    modes: ["immediate", "direct", "indirect", "indexed"],
  },
  {
    name: "ADD",
    opcode: "A1",
    modes: ["immediate", "direct", "indirect", "indexed"],
  },
  {
    name: "JMP",
    opcode: "B0",
    modes: ["direct", "indirect"],
  },
];

export function detectAddressingMode(arg: string, symbolTable: Record<string, [string, string]>): AddressingMode | null {
  if (!arg) return null;

  if (arg.startsWith("#")) {
    const value = arg.slice(1);
    if (isValidNumber(value) || isSymbol(value, symbolTable)) return "immediate";
    return null;
  }

  if (arg === "IX" || arg === "IY") return "indexed";

  if (isValidNumber(arg)) return "direct";

  if (isSymbol(arg, symbolTable)) return "indirect";

  return null;
}

function isValidNumber(value: string): boolean {
  return (
    /^0x[0-9a-fA-F]+$/.test(value) || // hexadecimal
    /^0b[01]+$/.test(value) ||        // binario
    /^\d+$/.test(value)              // decimal
  );
}

function isSymbol(value: string, symbolTable: Record<string, [string, string]>): boolean {
  return Object.prototype.hasOwnProperty.call(symbolTable, value);
}

export function getInstruction(name: string): Instruction | undefined {
  return INSTRUCTION_SET.find(i => i.name.toUpperCase() === name.toUpperCase());
}
export function getOpcode(name: string): string | undefined {
  const instruction = getInstruction(name);
  return instruction ? instruction.opcode : undefined;
}
// export function getArguments(instruction: string): string[] {
//   const parts = instruction.split(/\s+/);
//   return parts.slice(1).map(arg => arg.replace(/,/g, "").trim());
// }