import { appendFileSync, existsSync, mkdirSync } from "node:fs";

type Primitive = "tool" | "resource" | "prompt";

const LOG_DIR = "logs";
const LOG_FILE = `${LOG_DIR}/server.log`;

if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });

function emit(line: string): void {
  console.error(line);
  try {
    appendFileSync(LOG_FILE, line + "\n");
  } catch {
    // logging must never break the server
  }
}

export function logCall(
  primitive: Primitive,
  name: string,
  args: unknown,
): void {
  const ts = new Date().toISOString();
  emit(`[${ts}] ${primitive}=${name} args=${JSON.stringify(args)}`);
}

export function logResult(
  name: string,
  summary: string,
  durationMs: number,
): void {
  const ts = new Date().toISOString();
  emit(`[${ts}] result=${name} ${summary} ${durationMs}ms`);
}

export function logEvent(message: string): void {
  const ts = new Date().toISOString();
  emit(`[${ts}] ${message}`);
}
