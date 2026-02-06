// lib/cv/extractPdf.ts
import "server-only";
import { SmartPDFParser } from "pdf-parse-new";

export async function extractTextFromCV(buffer: ArrayBuffer | Buffer) {
  const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const parser = new SmartPDFParser();
  const result = await parser.parse(nodeBuffer);
  return result.text;
}
