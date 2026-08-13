import fs from "node:fs";
import path from "node:path";

export type Chunk = {
  id: string;
  doc: string;
  title: string;
  text: string;
  embedding: number[];
};

type Index = { model: string; chunks: Chunk[] };

let cached: Index | null = null;

export function loadIndex(): Index | null {
  if (cached) return cached;
  const file = path.join(process.cwd(), "data", "index.json");
  if (!fs.existsSync(file)) return null;
  cached = JSON.parse(fs.readFileSync(file, "utf8")) as Index;
  return cached;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function topK(queryEmbedding: number[], k = 4): (Chunk & { score: number })[] {
  const index = loadIndex();
  if (!index) return [];
  return index.chunks
    .map((c) => ({ ...c, score: cosine(queryEmbedding, c.embedding) }))
    .sort((x, y) => y.score - x.score)
    .slice(0, k);
}
