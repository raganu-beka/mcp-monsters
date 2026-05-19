import { logCall } from "./log.ts";

const INJECTION_PATTERNS: { pattern: RegExp; label: string }[] = [
  {
    pattern: /\bignore\s+(all\s+)?previous\s+instructions?\b/gi,
    label: "ignore-previous",
  },
  { pattern: /\b(system|assistant|user)\s*:/gi, label: "role-prefix" },
  { pattern: /<\|im_(start|end)\|>/gi, label: "chat-template" },
  { pattern: /\[INST\]|\[\/INST\]/gi, label: "inst-tags" },
  { pattern: /reveal\s+(your\s+)?system\s+prompt/gi, label: "prompt-leak" },
];

export function sanitizeText(text: string, fieldName: string): string {
  if (!text) return text;

  let sanitized = text;
  const hits: string[] = [];

  for (const { pattern, label } of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      hits.push(label);
      sanitized = sanitized.replace(pattern, "[REDACTED]");
    }
  }

  if (hits.length > 0) {
    logCall("tool", "sanitize", {
      field: fieldName,
      patterns_matched: hits,
      original_length: text.length,
    });
  }

  return sanitized;
}
