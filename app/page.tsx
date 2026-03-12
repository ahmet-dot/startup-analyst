'use client'

import { useState, useRef } from 'react'

interface AnalysisSection {
  id: number
  emoji: string
  title: string
  assessment: 'Strong' | 'Moderate' | 'Weak'
  content: string
}

interface AnalysisResult {
  summary: string
  sections: AnalysisSection[]
  score: number
  strengths: string[]
  concerns: string[]
  pivots: string
  nextSteps: string[]
}

const assessmentConfig = {
  Strong: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
  Moderate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  Weak: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' },
}

function ScoreRing({ score }: { score: number }) {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 10) * circumference
  const color = score >= 7 ? '#10b981' : score >= 5 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 28, fontWeight: 700, color, fontFamily: 'var(--font-display)' }}>{score}</span>
        <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em' }}>/ 10</span>
      </div>
    </div>
  )
}

function SectionCard({ section, index }: { section: AnalysisSection; index: number }) {
  const [expanded, setExpanded] = useState(true)
  const config = assessmentConfig[section.assessment] || assessmentConfig['Moderate']
  return (
    <div className="analysis-card" style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden',
      opacity: 0, animation: `sectionReveal 0.5s ease ${index * 0.08}s forwards`,
    }}>
      <button onClick={() => setExpanded(!expanded)} style={{
        width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
        background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
      }}>
        <span style={{ fontSize: 20 }}>{section.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{section.title}</span>
            <span style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', padding: '2px 10px', borderRadius: 20,
              background: config.bg, color: config.color, border: `1px solid ${config.border}`,
            }}>{section.assessment?.toUpperCase()}</span>
          </div>
        </div>
        <span style={{ color: 'var(--muted)', fontSize: 12, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
      </button>
      {expanded && (
        <div style={{ padding: '0 20px 18px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(232,232,240,0.82)', paddingTop: 14, fontFamily: 'var(--font-body)' }}>
            {section.content}
          </p>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const analyze = async () => {
    if (!idea.trim() || loading) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Failed')
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setIdea('')
    setError('')
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  return (
    <main style={{ minHeight: '100vh', position: 'relative' }}>
      <div className="bg-grid" style={{ position: 'fixed', inset: 0, zIndex: 0 }} />
      <div style={{
        position: 'fixed', top: -200, left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 800,
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <header style={{ paddingTop: 60, paddingBottom: 48, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100,
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: 28,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: '#818cf8', letterSpacing: '0.08em', fontWeight: 500 }}>AI-POWERED STARTUP VALIDATION</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.1, marginBottom: 18, letterSpacing: '-0.02em' }}>
            <span style={{ color: 'var(--text)' }}>Is your startup idea</span><br />
            <span className="gradient-text">worth the risk?</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto' }}>
            Drop your idea below. Get a VC-grade viability assessment across 8 critical dimensions in under 60 seconds.
          </p>
        </header>

        {/* Input */}
        {!result && (
          <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 12 }}>YOUR STARTUP IDEA</label>
            <textarea
              ref={textareaRef}
              value={idea}
              onChange={e => setIdea(e.target.value.slice(0, 2000))}
              placeholder="Describe your startup idea in detail. Include the problem you're solving, your target market, how you plan to make money, and what makes it different..."
              rows={6}
              style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 15, lineHeight: 1.7, resize: 'vertical', outline: 'none', fontFamily: 'var(--font-body)' }}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) analyze() }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{idea.length} / 2000 chars · Cmd+Enter to submit</span>
              <button onClick={analyze} disabled={loading || idea.trim().length < 10}
                style={{
                  padding: '12px 28px', borderRadius: 10,
                  background: loading || idea.trim().length < 10 ? 'rgba(99,102,241,0.2)' : '#6366f1',
                  color: loading || idea.trim().length < 10 ? 'rgba(255,255,255,0.3)' : '#fff',
                  border: 'none', cursor: loading || idea.trim().length < 10 ? 'not-allowed' : 'pointer',
                  fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', transition: 'all 0.2s ease',
                }}>
                {loading ? 'Analyzing...' : 'Analyze Idea →'}
              </button>
            </div>
          </section>
        )}

        {/* Loading */}
        {loading && (
          <section style={{ background: 'var(--surface)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 16, padding: 40, textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Conducting deep market analysis... this may take 20-40 seconds.</p>
            <div style={{ background: 'var(--border)', borderRadius: 4, height: 3, overflow: 'hidden', marginTop: 20 }}>
              <div className="load-bar" style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #f59e0b)', borderRadius: 4 }} />
            </div>
          </section>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ padding: '16px 20px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', fontSize: 14, marginBottom: 24 }}>
            {error}
            <button onClick={() => setError('')} style={{ marginLeft: 12, background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}>Try again</button>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div style={{ paddingBottom: 80 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <button onClick={reset} style={{ padding: '8px 20px', borderRadius: 8, background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)' }}>
                ← New Analysis
              </button>
            </div>

            {/* Summary */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, marginBottom: 20, animation: 'sectionReveal 0.4s ease forwards' }}>
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 10 }}>IDEA SUMMARY</div>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{result.summary}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <ScoreRing score={result.score} />
                  <span style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em' }}>VIABILITY SCORE</span>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {result.sections?.map((section, i) => <SectionCard key={section.id} section={section} index={i} />)}
            </div>

            {/* Strengths & Concerns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={{ background: 'var(--surface)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: 20, animation: 'sectionReveal 0.5s ease 0.6s forwards', opacity: 0 }}>
                <div style={{ fontSize: 12, color: '#10b981', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 14 }}>✅ TOP STRENGTHS</div>
                <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.strengths?.map((s, i) => (
                    <li key={i} style={{ fontSize: 13, color: 'rgba(232,232,240,0.85)', lineHeight: 1.6, display: 'flex', gap: 10 }}>
                      <span style={{ color: '#10b981', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>{s}
                    </li>
                  ))}
                </ol>
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: 20, animation: 'sectionReveal 0.5s ease 0.7s forwards', opacity: 0 }}>
                <div style={{ fontSize: 12, color: '#ef4444', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 14 }}>🚩 TOP CONCERNS</div>
                <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.concerns?.map((c, i) => (
                    <li key={i} style={{ fontSize: 13, color: 'rgba(232,232,240,0.85)', lineHeight: 1.6, display: 'flex', gap: 10 }}>
                      <span style={{ color: '#ef4444', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>{c}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Pivots */}
            {result.pivots && (
              <div style={{ background: 'var(--surface)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: 20, marginBottom: 12, animation: 'sectionReveal 0.5s ease 0.8s forwards', opacity: 0 }}>
                <div style={{ fontSize: 12, color: '#f59e0b', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 12 }}>🔄 STRATEGIC PIVOTS</div>
                <p style={{ fontSize: 14, color: 'rgba(232,232,240,0.85)', lineHeight: 1.7, fontFamily: 'var(--font-body)' }}>{result.pivots}</p>
              </div>
            )}

            {/* Next Steps */}
            <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(245,158,11,0.05) 100%)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 20, animation: 'sectionReveal 0.5s ease 0.9s forwards', opacity: 0 }}>
              <div style={{ fontSize: 12, color: '#818cf8', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 14 }}>📋 RECOMMENDED NEXT STEPS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {result.nextSteps?.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#818cf8' }}>{i + 1}</div>
                    <p style={{ fontSize: 14, color: 'rgba(232,232,240,0.85)', lineHeight: 1.65, fontFamily: 'var(--font-body)', paddingTop: 3 }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button onClick={reset} style={{ padding: '14px 36px', borderRadius: 10, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)' }}>
                Analyze Another Idea →
              </button>
            </div>
          </div>
        )}

        <footer style={{ paddingBottom: 32, paddingTop: 16, textAlign: 'center', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>Built with Claude AI · StartupAnalyst-GPT</p>
        </footer>
      </div>
    </main>
  )
}
