# StartupAnalyst-GPT — Next.js + Vercel Deploy

## 📁 Project Structure

```
startup-analyst/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── api/
│       └── analyze/
│           └── route.ts
├── .env.local.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## 1. `package.json`

```json
{
  "name": "startup-analyst-gpt",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "^18",
    "react-dom": "^18",
    "@anthropic-ai/sdk": "^0.20.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "tailwindcss": "^3.4.1",
    "postcss": "^8",
    "autoprefixer": "^10"
  }
}
```

---

## 2. `.env.local.example`

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

---

## 3. `app/layout.tsx`

```tsx
import type { Metadata } from "next";
import "./globals.css";

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
```

---

## 4. `app/api/analyze/route.ts`

```ts
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are StartupAnalyst-GPT, a high-precision startup validation expert. You combine venture capital mindset, deep market research capabilities, and serial founder insights to evaluate early-stage business concepts.

Analyze the startup idea across exactly these 10 categories:
1. Problem & Pain Point
2. Market Size & Opportunity
3. Solution & Differentiation
4. Business Model
5. Competition & Moat
6. Go-to-Market Strategy
7. Team Requirements
8. Financial Viability
9. Risk & Challenges
10. Timing & Market Readiness

Respond ONLY with a valid JSON object. No markdown, no backticks, no extra text.

Format:
{
  "categories": [
    {
      "name": "Problem & Pain Point",
      "score": 8,
      "analysis": "Detailed analysis here (3-5 sentences)..."
    },
    ...
  ],
  "overall_score": 7.5,
  "verdict": "INVEST",
  "verdict_summary": "2-3 sentence overall summary of the startup idea."
}

Verdict options: "STRONG INVEST", "INVEST", "WATCH", "PASS"
Scores are 1-10. overall_score is the average.`;

export async function POST(req: NextRequest) {
  try {
    const { idea } = await req.json();
    if (!idea || idea.trim().length < 10) {
      return NextResponse.json({ error: "Please provide a startup idea." }, { status: 400 });
    }

    const msg = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Startup idea: ${idea}` }],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text : "";
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
```

---

## 5. `app/page.tsx`

```tsx
"use client";
import { useState } from "react";

const VERDICT_STYLES: Record<string, { color: string; bg: string; emoji: string }> = {
  "STRONG INVEST": { color: "#00c896", bg: "#003d2e", emoji: "🚀" },
  "INVEST":        { color: "#4ade80", bg: "#052e16", emoji: "✅" },
  "WATCH":         { color: "#facc15", bg: "#2d2006", emoji: "👀" },
  "PASS":          { color: "#f87171", bg: "#2d0a0a", emoji: "❌" },
};

interface Category {
  name: string;
  score: number;
  analysis: string;
}

interface Result {
  categories: Category[];
  overall_score: number;
  verdict: string;
  verdict_summary: string;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 8 ? "#00c896" : score >= 6 ? "#facc15" : "#f87171";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
      <div style={{ flex: 1, background: "#1e2a3a", borderRadius: 99, height: 8, overflow: "hidden" }}>
        <div style={{ width: `${score * 10}%`, background: color, height: 8, borderRadius: 99 }} />
      </div>
      <span style={{ color, fontWeight: 700, fontSize: 14, minWidth: 32 }}>{score}/10</span>
    </div>
  );
}

export default function Home() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const verdict = result ? VERDICT_STYLES[result.verdict] || VERDICT_STYLES["WATCH"] : null;

  return (
    <main style={{ minHeight: "100vh", padding: "40px 20px", maxWidth: 780, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🧠</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, background: "linear-gradient(90deg,#00c896,#4f8ef7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          StartupAnalyst-GPT
        </h1>
        <p style={{ color: "#64748b", marginTop: 8, fontSize: 15 }}>
          VC-grade startup validation in seconds
        </p>
      </div>

      {/* Input */}
      <div style={{ background: "#111827", border: "1px solid #1e2a3a", borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <label style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
          Your Startup Idea
        </label>
        <textarea
          value={idea}
          onChange={e => setIdea(e.target.value)}
          placeholder="Describe your startup idea in as much detail as possible — the problem, your solution, target market, revenue model..."
          rows={5}
          style={{
            width: "100%", marginTop: 10, background: "#0a0f1a", border: "1px solid #1e2a3a",
            borderRadius: 10, color: "#e2e8f0", fontSize: 15, padding: 14, resize: "vertical",
            outline: "none", boxSizing: "border-box", lineHeight: 1.6,
          }}
        />
        <button
          onClick={analyze}
          disabled={loading || !idea.trim()}
          style={{
            marginTop: 14, width: "100%", padding: "14px 0", borderRadius: 10, border: "none",
            background: loading || !idea.trim() ? "#1e2a3a" : "linear-gradient(90deg,#00c896,#4f8ef7)",
            color: loading || !idea.trim() ? "#4a5568" : "#fff",
            fontSize: 16, fontWeight: 700, cursor: loading || !idea.trim() ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {loading ? "Analyzing..." : "Analyze My Idea →"}
        </button>
      </div>

      {error && (
        <div style={{ background: "#2d0a0a", border: "1px solid #f87171", borderRadius: 12, padding: 16, color: "#f87171", marginBottom: 24 }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", color: "#4f8ef7", padding: 40, fontSize: 15 }}>
          ⏳ Running VC-grade analysis across 10 dimensions...
        </div>
      )}

      {result && verdict && (
        <div>
          {/* Verdict */}
          <div style={{ background: verdict.bg, border: `1px solid ${verdict.color}`, borderRadius: 16, padding: 24, marginBottom: 24, textAlign: "center" }}>
            <div style={{ fontSize: 36 }}>{verdict.emoji}</div>
            <div style={{ color: verdict.color, fontSize: 26, fontWeight: 800, marginTop: 6 }}>{result.verdict}</div>
            <div style={{ color: "#94a3b8", fontSize: 15, marginTop: 8, lineHeight: 1.6 }}>{result.verdict_summary}</div>
            <div style={{ marginTop: 14, fontSize: 28, fontWeight: 800, color: verdict.color }}>
              {result.overall_score.toFixed(1)} <span style={{ fontSize: 14, fontWeight: 400, color: "#64748b" }}>/ 10 overall</span>
            </div>
          </div>

          {/* Categories */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {result.categories.map((cat, i) => (
              <div key={i} style={{ background: "#111827", border: "1px solid #1e2a3a", borderRadius: 14, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>
                    <span style={{ color: "#4f8ef7", marginRight: 8, fontSize: 13 }}>{i + 1}.</span>
                    {cat.name}
                  </div>
                </div>
                <ScoreBar score={cat.score} />
                <p style={{ marginTop: 12, color: "#94a3b8", fontSize: 14, lineHeight: 1.7, margin: "12px 0 0 0" }}>
                  {cat.analysis}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
```

---

## 6. `next.config.ts`

```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {};
export default nextConfig;
```

---

## 🚀 Deploy Steps

1. `npx create-next-app@latest startup-analyst --typescript --tailwind --app`
2. Replace files with the code above
3. `npm install @anthropic-ai/sdk`
4. Create `.env.local` → add `ANTHROPIC_API_KEY=sk-ant-...`
5. Push to GitHub
6. Go to [vercel.com](https://vercel.com) → Import repo
7. Add `ANTHROPIC_API_KEY` in Vercel Environment Variables
8. Deploy ✅
