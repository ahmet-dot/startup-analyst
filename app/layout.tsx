import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StartupAnalyst-GPT",
  description: "AI-powered startup idea validator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0a0f1a", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
