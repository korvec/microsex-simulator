import { INSTRUCTION_SET } from "./instructions";

export function executeInstruction(instruction: string, registers: any, memory: string[]) {
  // lógica básica
  if (instruction === "MOV A, 0x20") {
    registers.A = "20";
  }
  return { registers, memory };
}
