import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocChat — AI answers from your own docs",
  description:
    "RAG chatbot demo: ask questions, get answers grounded in your documentation with citations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
