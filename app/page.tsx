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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
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
                <div style={{ fontWeight: 700, fontSize: 15, color: "#e2e8f0" }}>
                  <span style={{ color: "#4f8ef7", marginRight: 8, fontSize: 13 }}>{i + 1}.</span>
                  {cat.name}
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
