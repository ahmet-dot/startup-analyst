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
    }
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
