import "server-only";
import { SmartPDFParser } from "pdf-parse-new";

export async function extractTextFromCV(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const parser = new SmartPDFParser(); 
  const result = await parser.parse(buffer);

  console.log("ini dari pdf parse: ", result.text);

  return result.text;
}
