import type { Product } from "../types/index.ts";

export interface ProductQuestion { question: string; answer: string }
export function parseProductFaq(product: Pick<Product, "specs">): ProductQuestion[] {
  try {
    const value: unknown = JSON.parse(product.specs.storeFaq || "[]");
    if (!Array.isArray(value) || value.length > 8) return [];
    return value.filter((row): row is ProductQuestion => row && typeof row.question === "string" && typeof row.answer === "string" && row.question.trim() && row.answer.trim() && row.question.length <= 200 && row.answer.length <= 1200);
  } catch { return []; }
}
export function serializeProductFaq(rows: ProductQuestion[]): string {
  if (rows.length > 8 || rows.some((row) => row.question.length > 200 || row.answer.length > 1200 || Boolean(row.question.trim()) !== Boolean(row.answer.trim()))) {
    throw new Error("Completa la pregunta y su respuesta. Máximo 8 preguntas, de 200 caracteres y respuestas de 1200 caracteres.");
  }
  return JSON.stringify(rows.map((row) => ({ question: row.question.trim(), answer: row.answer.trim() })).filter((row) => row.question && row.answer));
}
