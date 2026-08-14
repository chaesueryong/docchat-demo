import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocChat — AI answers from your own docs | 문서 기반 AI 챗봇",
  description:
    "RAG chatbot demo: ask questions, get answers grounded in your documentation with citations. 문서 내용을 근거로 출처와 함께 답변하는 RAG 챗봇 데모 (한국어/영어 지원).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
