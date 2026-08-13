// Ingest: reads markdown files in /docs, chunks them, embeds with OpenAI,
// and writes data/index.json (the vector index used at query time).
//
// Usage:  OPENAI_API_KEY=sk-... npm run ingest

import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";

const DOCS_DIR = path.join(process.cwd(), "docs");
const OUT_FILE = path.join(process.cwd(), "data", "index.json");
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
const CHUNK_SIZE = 900; // characters
const CHUNK_OVERLAP = 150;

if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY. Set it in .env or the environment.");
  process.exit(1);
}

const openai = new OpenAI();

function chunkText(text) {
  // Split on paragraph boundaries, then pack into ~CHUNK_SIZE chunks with overlap.
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks = [];
  let current = "";

  for (const p of paragraphs) {
    if ((current + "\n\n" + p).length > CHUNK_SIZE && current) {
      chunks.push(current);
      // keep the tail of the previous chunk as overlap for context continuity
      current = current.slice(-CHUNK_OVERLAP) + "\n\n" + p;
    } else {
      current = current ? current + "\n\n" + p : p;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function titleOf(markdown, fallback) {
  const m = markdown.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : fallback;
}

async function main() {
  const files = fs
    .readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  if (files.length === 0) {
    console.error(`No markdown files found in ${DOCS_DIR}`);
    process.exit(1);
  }

  const records = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(DOCS_DIR, file), "utf8");
    const title = titleOf(raw, file);
    const chunks = chunkText(raw);
    chunks.forEach((text, i) => {
      records.push({ id: `${file}#${i}`, doc: file, title, text });
    });
    console.log(`chunked ${file} -> ${chunks.length} chunks`);
  }

  // Embed in batches of 64
  for (let i = 0; i < records.length; i += 64) {
    const batch = records.slice(i, i + 64);
    const res = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch.map((r) => r.text),
    });
    res.data.forEach((e, j) => {
      batch[j].embedding = e.embedding;
    });
    console.log(`embedded ${Math.min(i + 64, records.length)}/${records.length}`);
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify({ model: EMBEDDING_MODEL, createdAt: new Date().toISOString(), chunks: records })
  );
  console.log(`wrote ${OUT_FILE} (${records.length} chunks)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
