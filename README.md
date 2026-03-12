# StartupAnalyst — AI-Powered Startup Validation

A VC-grade startup viability assessment tool powered by Claude AI. Drop your idea, get a structured analysis across 8 critical dimensions in under 60 seconds.

## Features

- 8-dimension viability analysis (Market Size, Competition, UVP, Customer, Revenue, Operations, Growth, Risk)
- Streaming responses for real-time feedback
- Score visualization with animated ring
- Strategic pivot recommendations
- Actionable next steps

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.local.example` to `.env.local` and add your Anthropic API key:
   ```bash
   cp .env.local.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Deployment (Vercel)

1. Push to GitHub
2. Connect repo on [vercel.com](https://vercel.com)
3. Add `ANTHROPIC_API_KEY` in Vercel environment variables
4. Deploy!

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Anthropic Claude API (claude-sonnet-4)
- Streaming responses

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key from [console.anthropic.com](https://console.anthropic.com) |
