import { InstructionEntry } from "./types";

export const INSTRUCTION_SET: InstructionEntry[] = [
  {
    name: "ADD",
    variants: [
      { operands: ["A", "B"], opcode: [0x58], size: 1 },
      { operands: ["A", "MEM"], opcode: [0x78], size: 3 },
      { operands: ["A", "IMM"], opcode: [0x48], size: 2 },
      { operands: ["A", "IX"], opcode: [0x80, 0x08], size: 3 },
      { operands: ["A", "IY"], opcode: [0x80, 0x88], size: 3 },
    ],
  },
];

export function getInstruction(name: string) {
  return INSTRUCTION_SET.find(i => i.name.toUpperCase() === name.toUpperCase());
}
