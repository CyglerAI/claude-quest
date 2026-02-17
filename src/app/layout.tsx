import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claude Quest — Master Claude Through Play",
  description: "A gamified learning platform for mastering Anthropic's Claude. Learn prompting, context engineering, Claude Code, MCP, and agent design through interactive quests.",
  openGraph: {
    title: "Claude Quest — Master Claude Through Play",
    description: "Interactive quests from basics to agent architecture. Based on Sara Kukovec's Learn-Claude guide.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚔️</text></svg>" />
      </head>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
