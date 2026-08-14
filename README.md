# DocChat — RAG Chatbot Demo

A production-style **Retrieval-Augmented Generation (RAG)** chatbot that answers questions from your own documentation — with inline citations, streaming responses, and zero hallucinated answers (it refuses when the docs don't cover the question).

Built with **Next.js (App Router) + TypeScript**. Generation works with **Claude or OpenAI** (switchable via env var), embeddings via OpenAI.

> Demo dataset: docs for a fictional cloud platform ("Northwind Cloud") — swap in your own markdown files and re-run ingest to make it answer about *your* product.

## Features

- **Bilingual (EN/한국어)** — UI language toggle with browser-language auto-detection; the demo docs ship in both English and Korean, so Korean questions retrieve Korean sources and answers cite Korean doc titles

- **Grounded answers with citations** — every answer cites the doc sections it used, shown as source chips under the message
- **Streaming UI** — tokens render as they arrive, no spinner-then-wall-of-text
- **Honest refusals** — if the answer isn't in the docs, it says so instead of guessing
- **Provider-agnostic** — set `ANTHROPIC_API_KEY` to answer with Claude, or leave it unset to use OpenAI
- **No vector DB required** — the index is a JSON file with cosine similarity search; swap in pgvector/Pinecone for production scale

## Quick start

```bash
npm install
cp .env.example .env        # add your OPENAI_API_KEY (and optionally ANTHROPIC_API_KEY)
npm run ingest              # chunk + embed docs/*.md -> data/index.json
npm run dev                 # open http://localhost:3000
```

## How it works

1. **Ingest** (`scripts/ingest.mjs`): markdown files in `docs/` are split into ~900-character chunks on paragraph boundaries with overlap, embedded with `text-embedding-3-small`, and written to `data/index.json`.
2. **Retrieve** (`lib/search.ts`): at query time the question is embedded and the top-4 chunks are selected by cosine similarity.
3. **Generate** (`app/api/chat/route.ts`): the chunks are injected into a system prompt that instructs the model to answer only from context and cite sections as `[1]`, `[2]`. The answer streams back; the first stream line carries the source metadata.

## Korean docs / 한국어 문서

The demo dataset ships in both languages (`docs/*.md` for English, `docs/*.ko.md` for Korean). Both are indexed together by `npm run ingest`; the embedding model matches questions to same-language chunks, and the system prompt makes the model answer in the user's language. After adding or editing docs in either language, re-run `npm run ingest` and redeploy.

## Customizing for your docs

Drop your own `.md` files into `docs/`, run `npm run ingest`, restart. That's it. For larger corpora (1,000+ pages), replace the JSON index with pgvector or a hosted vector DB — `lib/search.ts` is the only file to change.

## Deploy

Works on any Node.js host (Vercel, Railway, Fly.io). Run `npm run ingest` locally and commit `data/index.json` (or run ingest as a build step). Set `OPENAI_API_KEY` (and optionally `ANTHROPIC_API_KEY`) in your host's environment variables.
