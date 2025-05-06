import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request) {
  console.log('Received request to /api/casebrief-detailed')
  try {
    const { title, citation, detailed } = await request.json()
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Invalid or missing "title" in request body.' }, { status: 400 })
    }
    if (!citation || typeof citation !== 'string' || !citation.trim()) {
      return NextResponse.json({ error: 'Invalid or missing "citation" in request body.' }, { status: 400 })
    }
    const inputTitle = title.trim()
    const inputCitation = citation.trim()
    console.log(`Generating ${detailed ? 'detailed' : 'brief'} summary for: "${inputTitle}" with citation "${inputCitation}"`)

    let prompt
    if (detailed) {
      prompt = `
Generate an ultra-detailed case summary for "${inputTitle}" (${inputCitation}). Follow Quimbee’s exact format and sentence counts:

1. Rule of Law: exactly 3 sentences.
2. Facts: exactly 5 numbered bullet points ("1." through "5.").
3. Issue: exactly 8 sentences.
4. Holding: exactly 5 sentences.
5. Reasoning: exactly 10 sentences.
6. Majority: exactly 3 sentences or "Not Provided."
7. Concurrence: exactly 2 sentences or "Not Provided."
8. Dissent: exactly 2 sentences or "Not Provided."
9. Analysis: exactly 8 sentences.

Return only a JSON object with keys:
{
  "ruleOfLaw": "",
  "facts": "",
  "issue": "",
  "holding": "",
  "reasoning": "",
  "majority": "",
  "concurrence": "",
  "dissent": "",
  "analysis": ""
}
No extra text.
`
    } else {
      prompt = `
Generate a concise case summary for "${inputTitle}" (${inputCitation}). Match Quimbee’s style and sentence counts exactly:

1. Rule of Law: exactly 4 sentences.
2. Facts: exactly 6 numbered bullet points ("1." through "6.").
3. Issue: exactly 4 sentences.
4. Holding: exactly 4 sentences.
5. Reasoning: exactly 5 sentences.
6. Majority: exactly 2 sentences or "Not Provided."
7. Concurrence: exactly 1 sentence or "Not Provided."
8. Dissent: exactly 1 sentence or "Not Provided."
9. Analysis: exactly 3 sentences.

Return only a JSON object with keys:
{
  "ruleOfLaw": "",
  "facts": "",
  "issue": "",
  "holding": "",
  "reasoning": "",
  "majority": "",
  "concurrence": "",
  "dissent": "",
  "analysis": ""
}
No extra text.
`
    }

    const messages = [
      {
        role: 'system',
        content: `You are an expert legal summarizer.`
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_FOURPOINTONE })

    let attempt = 0
    let parsedResponse = null

    while (attempt < 10) {
      attempt++
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4.1',
          messages,
          max_tokens: detailed ? 3500 : 1800,
          temperature: 0.7
        })

        const raw = response.choices[0].message.content.trim()
        try {
          parsedResponse = JSON.parse(raw)
        } catch {
          const start = raw.indexOf('{')
          const end = raw.lastIndexOf('}') + 1
          parsedResponse = JSON.parse(raw.slice(start, end))
        }
        break
      } catch (err) {
        if (attempt >= 10) {
          return NextResponse.json(
            { error: 'Failed to retrieve valid response after 10 attempts.' },
            { status: 500 }
          )
        }
      }
    }

    const result = {
      ruleOfLaw: parsedResponse.ruleOfLaw || '',
      facts: parsedResponse.facts || '',
      issue: parsedResponse.issue || '',
      holding: parsedResponse.holding || '',
      reasoning: parsedResponse.reasoning || '',
      majority: parsedResponse.majority || 'Not Provided.',
      concurrence: parsedResponse.concurrence || 'Not Provided.',
      dissent: parsedResponse.dissent || 'Not Provided.',
      analysis: parsedResponse.analysis || '',
      verified: false
    }

    console.log('FINAL PARSED RESULT =>', result)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    console.error('Error in /api/casebrief-detailed:', err)
    return NextResponse.json({ error: 'Error summarizing case.' }, { status: 500 })
  }
}
