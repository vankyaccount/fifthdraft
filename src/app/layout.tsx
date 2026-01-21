import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FifthDraft - AI Meeting Notes & Voice Memo Transcription | Turn Audio to Polished Notes",
  description: "Transform voice memos into professional meeting notes in seconds with FifthDraft. AI-powered transcription, action items extraction, and brainstorming tools. Free 30 min/month. No bot, no surveillance - just clean, organized notes from browser or system audio.",
  keywords: [
    "AI meeting notes",
    "voice memo transcription",
    "meeting transcription software",
    "AI note taker",
    "automatic meeting notes",
    "voice to text",
    "meeting minutes generator",
    "AI brainstorming tool",
    "Otter.ai alternative",
    "Fireflies alternative",
    "bot-free meeting notes",
    "action items extraction",
    "meeting summary AI",
    "voice recording app",
    "transcription service",
    "idea brainstorming software",
    "project planning tool"
  ],
  openGraph: {
    title: "FifthDraft - Transform Voice Memos into Polished Meeting Notes",
    description: "AI-powered meeting notes with automatic transcription, action items, and idea brainstorming. 500+ professionals trust FifthDraft. Start free with 30 min/month.",
    type: "website",
    siteName: "FifthDraft",
  },
  twitter: {
    card: "summary_large_image",
    title: "FifthDraft - AI Meeting Notes & Transcription",
    description: "Turn voice memos into professional notes instantly. Free plan available.",
  },
  robots: {
    index: true,
    follow: true,
  },
  authors: [{ name: "FifthDraft" }],
  creator: "FifthDraft",
  publisher: "FifthDraft",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
