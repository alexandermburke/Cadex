import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request) {
  console.log('Received request to /api/casebrief-detailed')
  try {
    const { title, citation, detailed } = await request.json()
    if (!title || typeof title !== 'string' || !title.trim()) {
      console.warn('Invalid or missing "title" in request body.')
      return NextResponse.json({ error: 'Invalid or missing "title" in request body.' }, { status: 400 })
    }
    if (!citation || typeof citation !== 'string' || !citation.trim()) {
      console.warn('Invalid or missing "citation" in request body.')
      return NextResponse.json({ error: 'Invalid or missing "citation" in request body.' }, { status: 400 })
    }
    const inputTitle = title.trim()
    const inputCitation = citation.trim()
    console.log(`Generating ${detailed ? 'detailed' : 'brief'} summary for: "${inputTitle}" with citation "${inputCitation}"`)

    let prompt
    if (detailed) {
      prompt = `
Generate an extremely comprehensive and detailed case summary for the following case title and citation. The summary should:
- Exceed typical expectations in accuracy and detail, with more sentences than the stated minimum.
- Be written in a professional legal style; avoid repetitive or AI-generated phrasing and reflect the expertise of a seasoned lawyer.
- Read as if it were authored by a law professor and emulate the style and tone of case briefs found on Quimbee.

Include the following sections:
1. Rule of Law: Provide a comprehensive explanation of the general legal principles, including detailed references to relevant statutory law, landmark cases, and legal doctrines. Your explanation should be at least two sentences long.
2. Facts: Enumerate at least five key facts. **List them as a numbered list** starting with "1." then "2.", etc., each fact on its own line, clearly stated and explained in detail.
3. Issue: Analyze and describe the primary legal question(s) in at least eight sentences.
4. Holding: Summarize the court's decision in four to five sentences.
5. Reasoning: Provide an in-depth discussion of the court's rationale in at least ten sentences.
6. Majority: If applicable, summarize the majority opinion in at least three sentences; otherwise, state "Not Provided."
7. Concurrence: If applicable, summarize any concurring opinions in at least two sentences; otherwise, state "Not Provided."
8. Dissent: If applicable, summarize any dissenting opinions in at least two sentences; otherwise, state "Not Provided."
9. Analysis: Provide an in-depth analysis of the case’s implications, impact on future jurisprudence, and critical commentary in at least eight sentences.

Return the summary strictly in JSON format with these keys (do not include any additional text):
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

Case Title:
"${inputTitle}"
Case Citation:
"${inputCitation}"
      `
    } else {
      prompt = `
Generate a comprehensive and highly detailed case summary for the following case title and citation. The summary should:
- Be exceptionally accurate, with more sentences than the usual minimum.
- Be written in a professional legal style; avoid repetitive, AI-like language.
- Read as if it were authored by a law professor and emulate the style and tone of case briefs found on Quimbee.

Include the following sections:
1. Rule of Law: Provide a succinct yet detailed explanation of the legal principles and applicable case law in at least four sentences.
2. Facts: List at least six key facts as a **numbered list** starting with "1." then "2.", etc., each on its own line.
3. Issue: Describe the primary legal question(s) in at least four sentences.
4. Holding: Summarize the court's decision in four sentences.
5. Reasoning: Explain the court's rationale in at least five sentences.
6. Majority: If applicable, summarize the majority opinion in at least two sentences; otherwise, state "Not Provided."
7. Concurrence: If applicable, summarize any concurring opinions in at least one sentence; otherwise, state "Not Provided."
8. Dissent: If applicable, provide a brief summary of any dissenting opinions in at least one sentence; otherwise, state "Not Provided."
9. Analysis: Provide a brief analysis of the case’s significance and implications in at least three sentences.

Return the summary in JSON format with these keys (do not include any additional text):
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

Case Title:
"${inputTitle}"
Case Citation:
"${inputCitation}"
      `
    }

    const messages = [
      {
        role: 'system',
        content: `You are an expert legal summarizer. Generate a ${detailed ? 'detailed' : 'brief'} case summary in JSON format including majority, concurrence, dissent, and analysis sections.`
      },
      {
        role: 'user',
        content: prompt
      }
    ]

     const openai = new OpenAI({
             apiKey: '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',
           });
           
    let attemptCount = 0
    let parsedResponse = null

    while (attemptCount < 10) {
      attemptCount++
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4.1-mini',
          messages,
          max_tokens: detailed ? 3500 : 1800,
          temperature: 0.7
        })

        if (!response?.choices?.length || !response.choices[0].message) {
          console.error('Invalid response structure from OpenAI:', response)
          throw new Error('Invalid OpenAI response structure.')
        }

        let rawContent = response.choices[0].message.content.trim()
        console.log('RAW GPT CONTENT =>', rawContent)

        try {
          parsedResponse = JSON.parse(rawContent)
        } catch {
          console.warn('Direct JSON parse failed. Attempting substring extraction...')
          const firstCurly = rawContent.indexOf('{')
          const lastCurly = rawContent.lastIndexOf('}')
          if (firstCurly !== -1 && lastCurly !== -1) {
            const jsonSubstring = rawContent.substring(firstCurly, lastCurly + 1)
            try {
              parsedResponse = JSON.parse(jsonSubstring)
              console.log('Parsed JSON substring successfully.')
            } catch {
              console.error('Failed to parse JSON substring:', jsonSubstring)
              throw new Error('Could not parse JSON from GPT.')
            }
          } else {
            console.error('No JSON object found in GPT response')
            throw new Error('Could not parse JSON from GPT.')
          }
        }
        break
      } catch (err) {
        console.error(`Attempt ${attemptCount} failed:`, err)
        if (attemptCount >= 10) {
          return NextResponse.json(
            { error: 'Failed to retrieve and parse a valid GPT response after 10 attempts.' },
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
