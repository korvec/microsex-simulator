import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { getInstruction, detectAddressingMode } from "@/lib/instructions";

// Tipado explícito para los registros
export type RegisterKey = 'A' | 'B' | 'C' | 'IX' | 'IY' | 'PP' | 'PC' | 'SP' | 'CARRY' | 'OVERFLOW' | 'HALF' | 'NEGATIVE' | 'ZERO' | 'PARITY';
export type Registers = Record<RegisterKey, string>;

export default function MicrosexSimulator() {
  const [code, setCode] = useState("");
  const [listing, setListing] = useState("MOV A, #0x20\nADD A, 0x10\nJMP num");
  const [output, setOutput] = useState("Ready.");
  const [memory, setMemory] = useState(Array(96).fill("00"));
  const [memorySearch, setMemorySearch] = useState("");
  const [registers, setRegisters] = useState<Registers>({ A: "00", B: "00", C: "00", IX: "0000", IY: "0000", PP: "0000", PC: "0000", SP: "FFFF", CARRY: "0", OVERFLOW: "0", HALF: "0", NEGATIVE: "0", ZERO: "0", PARITY: "0" });
  const [symbols, setSymbols] = useState<Record<string, [string, string]>>({ num: ["0x000A", ""], loop: ["0x0003", ""] });
  const [lines, setLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);

  const assembleCode = () => {
    const newLines = code.split("\n");
    const errors: string[] = [];

    newLines.forEach((line, i) => {
      const cleaned = line.trim();
      if (!cleaned || cleaned.startsWith("//")) return;

      const match = cleaned.match(/^([A-Z]+)\s+([^,]+)\s*,\s*(.+)$/i);
      const [mnemonic, op1, op2] = match ? match.slice(1) : [cleaned.split(" ")[0], "", cleaned.split(" ")[1] || ""];
      const instr = getInstruction(mnemonic);
      if (!instr) {
        errors.push(`Línea ${i + 1}: Instrucción desconocida '${mnemonic}'`);
        return;
      }

      const arg = op2.trim();
      const mode = detectAddressingMode(arg, symbols);
      if (!mode) {
        errors.push(`Línea ${i + 1}: Modo de direccionamiento inválido para '${arg}'`);
        return;
      }
      if (!instr.modes.includes(mode)) {
        errors.push(`Línea ${i + 1}: '${instr.name}' no permite el modo '${mode}'`);
      }
    });

    if (errors.length > 0) {
      setOutput("Errores encontrados:\n" + errors.join("\n"));
    } else {
      setOutput("Código ensamblado exitosamente.");
      setListing(code);
      setLines(newLines);
      setCurrentLine(0);
      setMemory(["A0", "01", "A1", "02", "B0", "03", "00", "FF", "AB", "CD", "00", "00", "00", "00", "00", "00", ...Array(80).fill("00")]);
      setRegisters({ ...registers, A: "01", B: "02", C: "03", PC: "0002", SP: "FFFE" });
    }
  };

  const ejecutarSiguiente = () => {
    if (currentLine >= lines.length) {
      setOutput("Fin del programa.");
      return;
    }
    const raw = lines[currentLine].trim();
    setOutput(`Ejecutando línea ${currentLine + 1}: ${raw}`);
    setCurrentLine(prev => prev + 1);
  };

  const handleRegisterChange = (name: string, value: string) => {
    setRegisters({ ...registers, [name]: value });
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4 h-screen">
      <div className="flex flex-col h-full space-y-4">
        <Card className="flex-3 overflow-auto">
          <CardContent className="pt-4">
            <Tabs defaultValue="editor">
              <TabsList>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="listing">Listado</TabsTrigger>
              </TabsList>
              <TabsContent value="editor">
                <Textarea rows={10} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Escribe tu código ensamblador aquí..." />
                <div className="pt-2 space-x-2">
                  <Button onClick={assembleCode}>Ensamblar</Button>
                  <Button onClick={ejecutarSiguiente}>Ejecutar siguiente</Button>
                </div>
              </TabsContent>
              <TabsContent value="listing">
                <Textarea rows={6} value={listing} readOnly className="bg-gray-100 mb-4" />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Símbolo</TableHead>
                      <TableHead>Dirección</TableHead>
                      <TableHead>Contenido</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(symbols).map(([name, [address, content]]) => (
                      <TableRow key={name}>
                        <TableCell>{name}</TableCell>
                        <TableCell>{address}</TableCell>
                        <TableCell>{content}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="flex-1 overflow-auto">
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm">{output}</pre>
          </CardContent>
        </Card>
      </div>
      {/* Columna derecha: Registros + Memoria */}
      <div className="flex flex-col h-full space-y-4">
        <Card className="flex-1 overflow-auto">
          <CardContent className="space-y-4">
            <h3 className="font-bold">Acumuladores (8 bits)</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['A', 'B', 'C'] as RegisterKey[]).map(reg => (
                <Input key={reg} value={registers[reg]} onChange={(e) => handleRegisterChange(reg, e.target.value)} onFocus={(e) => e.target.select()} />
              ))}
            </div>
            <h3 className="font-bold">Punteros (16 bits)</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['IX', 'IY', 'PP'] as RegisterKey[]).map(reg => (
                <Input key={reg} value={registers[reg]} onChange={(e) => handleRegisterChange(reg, e.target.value)} onFocus={(e) => e.target.select()} />
              ))}
            </div>
            <h3 className="font-bold">Banderas (1 bit)</h3>
            <div className="grid grid-cols-6 gap-2">
              {(['CARRY', 'OVERFLOW', 'HALF', 'NEGATIVE', 'ZERO', 'PARITY'] as RegisterKey[]).map(flag => (
                <Input key={flag} value={registers[flag]} onChange={(e) => handleRegisterChange(flag, e.target.value)} onFocus={(e) => e.target.select()} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 overflow-auto">
          <CardContent>
            <div className="mb-2">
              <Input
                placeholder="Buscar dirección (ej: 0x0020)"
                value={memorySearch}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^0x[0-9a-fA-F]{1,4}$/.test(value) || value === "") {
                    setMemorySearch(value);
                  }
                }}
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  {Array.from({ length: 16 }, (_, i) => (
                    <TableHead key={i}>{"0x" + i.toString(16).toUpperCase()}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 6 }, (_, row) => (
                  <TableRow key={row}>
                    <TableCell className="font-bold">{"0x" + (row * 16).toString(16).padStart(4, "0").toUpperCase()}</TableCell>
                    {Array.from({ length: 16 }, (_, col) => {
                      const index = row * 16 + col;
                      return <TableCell key={col}>{memory[index]}</TableCell>;
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
