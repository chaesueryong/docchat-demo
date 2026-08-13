import OpenAI from "openai";
export const runtime = "nodejs";
export async function GET() {
  const ids: string[] = [];
  try {
    const openai = new OpenAI();
    for await (const m of openai.models.list()) ids.push(m.id);
  } catch (e: any) {
    return Response.json({ error: e?.message, status: e?.status });
  }
  return Response.json({ ids });
}
