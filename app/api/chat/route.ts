import { NextRequest } from "next/server";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { loadIndex, topK } from "@/lib/search";

export const runtime = "nodejs";

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
const OPENAI_MODEL = process.env.ANSWER_MODEL_OPENAI || "gpt-4o-mini";
const ANTHROPIC_MODEL = process.env.ANSWER_MODEL_ANTHROPIC || "claude-sonnet-4-5";

type Msg = { role: "user" | "assistant"; content: string };

function systemPrompt(context: string): string {
  return [
    "You are a helpful support assistant for the product documentation provided below.",
    "Answer ONLY from the provided context. If the answer is not in the context, say you don't know and suggest contacting support — never invent details.",
    "Cite sources inline using bracketed numbers like [1] or [2] that refer to the numbered context sections.",
    "Be concise. Use short paragraphs. Answer in the same language the user asked in.",
    "",
    "CONTEXT:",
    context,
  ].join("\n");
}

export async function POST(req: NextRequest) {
  const { messages } = (await req.json()) as { messages: Msg[] };
  const question = messages[messages.length - 1]?.content ?? "";

  if (!process.env.OPENAI_API_KEY) {
    return new Response("Server is missing OPENAI_API_KEY.", { status: 500 });
  }
  if (!loadIndex()) {
    return new Response(
      "Vector index not found. Run `npm run ingest` first to index the docs.",
      { status: 500 }
    );
  }

  const openai = new OpenAI();

  // 1) Embed the question and retrieve the most relevant chunks
  const emb = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: question });
  const hits = topK(emb.data[0].embedding, 4);

  const context = hits
    .map((h, i) => `[${i + 1}] (${h.title})\n${h.text}`)
    .join("\n\n---\n\n");
  const sources = hits.map((h, i) => ({ n: i + 1, title: h.title, doc: h.doc }));

  const encoder = new TextEncoder();

  // 2) Stream the answer. The first line of the stream is a JSON payload with
  //    the sources, followed by the answer tokens.
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(`__SOURCES__${JSON.stringify(sources)}\n`));
      try {
        if (process.env.ANTHROPIC_API_KEY) {
          const anthropic = new Anthropic();
          const s = anthropic.messages.stream({
            model: ANTHROPIC_MODEL,
            max_tokens: 1024,
            system: systemPrompt(context),
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
          });
          s.on("text", (t) => controller.enqueue(encoder.encode(t)));
          await s.finalMessage();
        } else {
          const s = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            stream: true,
            messages: [
              { role: "system", content: systemPrompt(context) },
              ...messages.map((m) => ({ role: m.role, content: m.content })),
            ],
          });
          for await (const part of s) {
            const t = part.choices[0]?.delta?.content;
            if (t) controller.enqueue(encoder.encode(t));
          }
        }
      } catch (err: any) {
        controller.enqueue(encoder.encode(`\n\n[error] ${err?.message ?? "generation failed"}`));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
