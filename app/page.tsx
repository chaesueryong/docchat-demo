"use client";

import { useEffect, useRef, useState } from "react";

type Source = { n: number; title: string; doc: string };
type Msg = { role: "user" | "assistant"; content: string; sources?: Source[] };
type Lang = "en" | "ko";

const STRINGS: Record<
  Lang,
  {
    badge: string;
    tagline: string;
    suggestions: string[];
    thinking: string;
    placeholder: string;
    send: string;
    genericError: string;
    networkError: string;
  }
> = {
  en: {
    badge: "RAG Demo",
    tagline:
      "Ask anything about the (fictional) Northwind Cloud docs — answers are grounded in the actual documentation, with citations.",
    suggestions: [
      "How do I reset my API key?",
      "What plans do you offer and how much do they cost?",
      "How does usage-based billing work?",
      "What's your data retention policy?",
    ],
    thinking: "Searching docs…",
    placeholder: "Ask a question about the docs…",
    send: "Send",
    genericError: "Something went wrong.",
    networkError: "Network error.",
  },
  ko: {
    badge: "RAG 데모",
    tagline:
      "가상의 클라우드 서비스 'Northwind Cloud' 문서에 대해 무엇이든 물어보세요 — 실제 문서 내용을 근거로, 출처 표시와 함께 답변합니다.",
    suggestions: [
      "API 키를 재설정하려면 어떻게 하나요?",
      "요금제 종류와 가격이 어떻게 되나요?",
      "사용량 기반 과금은 어떻게 계산되나요?",
      "데이터 보관 정책이 어떻게 되나요?",
    ],
    thinking: "문서 검색 중…",
    placeholder: "문서에 대해 질문해 보세요…",
    send: "전송",
    genericError: "문제가 발생했습니다.",
    networkError: "네트워크 오류가 발생했습니다.",
  },
};

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Default to Korean for Korean-language browsers.
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("ko")) {
      setLang("ko");
    }
  }, []);

  const t = STRINGS[lang];

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
        updateLast({ content: `⚠️ ${errText || t.genericError}` });
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
      updateLast({ content: `⚠️ ${err?.message ?? t.networkError}` });
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
      <div className="lang-switch" role="group" aria-label="Language">
        <button
          className={`lang-btn ${lang === "en" ? "active" : ""}`}
          onClick={() => setLang("en")}
          aria-pressed={lang === "en"}
        >
          EN
        </button>
        <button
          className={`lang-btn ${lang === "ko" ? "active" : ""}`}
          onClick={() => setLang("ko")}
          aria-pressed={lang === "ko"}
        >
          한국어
        </button>
      </div>

      <div className="hero">
        <div className="badge">{t.badge}</div>
        <h1>DocChat</h1>
        <p>{t.tagline}</p>
      </div>

      {messages.length === 0 && (
        <div className="suggestions">
          {t.suggestions.map((s) => (
            <button key={s} className="suggestion" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="chat">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.content || (busy && i === messages.length - 1 ? <span className="thinking">{t.thinking}</span> : "")}
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
            placeholder={t.placeholder}
            disabled={busy}
          />
          <button type="submit" disabled={busy || !input.trim()}>
            {t.send}
          </button>
        </form>
      </div>
    </main>
  );
}
