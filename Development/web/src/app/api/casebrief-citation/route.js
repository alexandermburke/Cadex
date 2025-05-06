import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request) {
  const { title, date } = await request.json()

  if (!title || typeof title !== 'string' || !title.trim() || !date || typeof date !== 'string' || !date.trim()) {
    return NextResponse.json({ error: 'Invalid input. Provide a non-empty title and date.' }, { status: 400 })
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_FOURPOINTONE })
  const model = 'gpt-4.1'
  console.log(`Using model: ${model}`)

  const messages = [
    {
      role: 'system',
      content: `
You are a legal citation generator. Based on provided case details, return only the reporter citation (volume, reporter, page). If it doesn't exist or isn't publicly available, return "N/A".`
    },
    {
      role: 'user',
      content: `Title: "${title.trim()}"\nDate: "${date.trim()}"`
    }
  ]

  const functions = [
    {
      name: 'generateCitation',
      description: 'Returns a single reporter citation string',
      parameters: {
        type: 'object',
        properties: {
          citation: {
            type: 'string',
            description: 'Volume, reporter abbreviation, and page number or "N/A"'
          }
        },
        required: ['citation']
      }
    }
  ]

  let citation = ''
  for (let attempt = 0; attempt < 2; attempt++) {
    const resp = await openai.chat.completions.create({
      model,
      messages,
      functions,
      function_call: { name: 'generateCitation' },
      temperature: attempt === 0 ? 0 : 0.2,
      max_tokens: 150
    })

    const call = resp.choices?.[0]?.message?.function_call
    if (call?.arguments) {
      try {
        const args = JSON.parse(call.arguments)
        if (args.citation && args.citation.trim()) {
          citation = args.citation.trim()
          break
        }
      } catch {}
    }
  }

  if (!citation) {
    citation = 'N/A'
  }

  console.log(`Generated citation: ${citation}`)
  return NextResponse.json({ citation }, { status: 200 })
}
