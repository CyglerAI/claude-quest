import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Claude Quest — Master Claude Through Play",
  description: "A gamified learning platform for mastering Anthropic's Claude. Interactive challenges: build prompts, spot errors, compare approaches. From basics to agent architecture.",
  openGraph: {
    title: "Claude Quest — Master Claude Through Play",
    description: "Not just quizzes. Build prompts, spot errors, compare approaches. From basics to multi-agent architecture.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Quest — Master Claude Through Play",
    description: "Interactive challenges to master Claude. Build prompts, spot errors, compare approaches.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚔️</text></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
