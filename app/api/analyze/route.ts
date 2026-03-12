import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are StartupAnalyst-GPT, a high-precision startup validation expert. You combine venture capital mindset, deep market research capabilities, and serial founder insights to evaluate early-stage business concepts.

Analyze the startup idea using 8 categories and return ONLY a valid JSON object. No markdown, no backticks, no explanation outside the JSON.

Return this exact JSON structure:
{
  "summary": "2-3 sentence restatement of the concept",
  "sections": [
    {"id": 1, "emoji": "📈", "title": "Market Size & Opportunity", "assessment": "Strong", "content": "Detailed analysis with specific market data, TAM/SAM figures, growth rates..."},
    {"id": 2, "emoji": "🥊", "title": "Competitive Landscape", "assessment": "Moderate", "content": "Direct/indirect competitors, market saturation, entry barriers..."},
    {"id": 3, "emoji": "🌟", "title": "Unique Value Proposition", "assessment": "Weak", "content": "Differentiation, competitive edge, defensibility..."},
    {"id": 4, "emoji": "🎯", "title": "Target Customer Validation", "assessment": "Strong", "content": "Primary persona, pain points, urgency, willingness to pay..."},
    {"id": 5, "emoji": "💰", "title": "Revenue Model", "assessment": "Moderate", "content": "Revenue streams, pricing logic, CAC/LTV, monetization scalability..."},
    {"id": 6, "emoji": "⚙️", "title": "Operational Requirements", "assessment": "Strong", "content": "Technical feasibility, team needs, capital requirements, regulatory challenges..."},
    {"id": 7, "emoji": "🚀", "title": "Growth Potential", "assessment": "Moderate", "content": "Scalability, network effects, expansion paths..."},
    {"id": 8, "emoji": "⚠️", "title": "Risk Assessment", "assessment": "Weak", "content": "Internal weaknesses, external threats, timing issues, pivot paths..."}
  ],
  "score": 7,
  "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],
  "concerns": ["Specific concern 1", "Specific concern 2", "Specific concern 3"],
  "pivots": "Strategic pivot recommendations...",
  "nextSteps": ["Actionable step 1", "Actionable step 2", "Actionable step 3"]
}

Rules:
- assessment must be exactly "Strong", "Moderate", or "Weak"
- score must be a number between 1 and 10
- Be specific and data-driven, no vague advice
- Do NOT use dashes as bullet points
- Return ONLY the raw JSON object, nothing else before or after. Stop immediately after the closing brace.`

function extractJSON(text: string): string {
  // Find the first { and the last }
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON found in response')
  return text.slice(start, end + 1)
}

export async function POST(request: Request) {
  try {
    const { idea } = await request.json()

    if (!idea || idea.trim().length < 10) {
      return new Response(JSON.stringify({ error: 'Please provide a more detailed idea.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Analyze this startup idea: ${idea}` }]
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const jsonText = extractJSON(content.text)
    const parsed = JSON.parse(jsonText)

    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('Analysis error:', error?.message || error)
    return new Response(
      JSON.stringify({ error: `Analysis failed: ${error?.message || 'Unknown error'}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
