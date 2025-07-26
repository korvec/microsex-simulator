export type Operand = "A" | "B" | "C" | "IX" | "IY" | "MEM" | "IMM" | "SYMBOL";
export type AddressingMode = "immediate" | "direct" | "indirect" | "indexed" | "accumulator";

export interface InstructionVariant {
  operands: [Operand, Operand];   // Ej: ["A", "IMM"]
  opcode: number[];               // Ej: [0x48]
  size: number;                   // Bytes ocupados
}

export interface InstructionEntry {
  name: string;                   // Ej: "ADD"
  variants: InstructionVariant[]; // Cada forma válida
}
