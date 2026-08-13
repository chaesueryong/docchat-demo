"use client";

import { useRef, useState } from "react";

type Source = { n: number; title: string; doc: string };
type Msg = { role: "user" | "assistant"; content: string; sources?: Source[] };

const SUGGESTIONS = [
  "How do I reset my API key?",
  "What plans do you offer and how much do they cost?",
  "How does usage-based billing work?",
  "What's your data retention policy?",
];

export default function Home() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;

    const history: Msg[] = [...messages, { role: "user", content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text();
        updateLast({ content: `⚠️ ${errText || "Something went wrong."}` });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let sources: Source[] | undefined;
      let answer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // The first line of the stream carries the sources payload.
        if (!sources) {
          const nl = buffer.indexOf("\n");
          if (nl === -1) continue;
          const first = buffer.slice(0, nl);
          if (first.startsWith("__SOURCES__")) {
            try {
              sources = JSON.parse(first.slice("__SOURCES__".length));
            } catch {
              sources = [];
            }
            buffer = buffer.slice(nl + 1);
          } else {
            sources = [];
          }
        }

        answer = buffer;
        updateLast({ content: answer, sources });
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err: any) {
      updateLast({ content: `⚠️ ${err?.message ?? "Network error."}` });
    } finally {
      setBusy(false);
    }
  }

  function updateLast(patch: Partial<Msg>) {
    setMessages((prev) => {
      const next = [...prev];
      next[next.length - 1] = { ...next[next.length - 1], ...patch };
      return next;
    });
  }

  return (
    <main className="shell">
      <div className="hero">
        <div className="badge">RAG Demo</div>
        <h1>DocChat</h1>
        <p>
          Ask anything about the (fictional) Northwind Cloud docs — answers are grounded in
          the actual documentation, with citations.
        </p>
      </div>

      {messages.length === 0 && (
        <div className="suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="suggestion" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="chat">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.content || (busy && i === messages.length - 1 ? <span className="thinking">Searching docs…</span> : "")}
            {m.role === "assistant" && m.sources && m.sources.length > 0 && (
              <div className="sources">
                {m.sources.map((s) => (
                  <span key={s.n} className="source-chip">
                    <b>[{s.n}]</b> {s.title}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="composer">
        <form
          className="composer-inner"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the docs…"
            disabled={busy}
          />
          <button type="submit" disabled={busy || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
