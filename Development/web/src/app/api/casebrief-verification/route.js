import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request) {
  console.log('Received request to /api/casebrief-verification')
  try {
    const { briefSummary, caseTitle, decisionDate, jurisdiction } = await request.json()

    if (
      !briefSummary ||
      typeof briefSummary !== 'object' ||
      !caseTitle ||
      typeof caseTitle !== 'string' ||
      !caseTitle.trim()
    ) {
      console.warn('Invalid or missing briefSummary or caseTitle in request body.')
      return NextResponse.json(
        { error: 'Invalid or missing briefSummary or caseTitle in request body.' },
        { status: 400 }
      )
    }

    const rawCitation = (briefSummary.citation || '').trim()
    const isCitationProvided = rawCitation && rawCitation.toUpperCase() !== 'N/A'

    const citationLine = isCitationProvided ? `7. Citation: ${rawCitation}` : ''
    const citationCriteria = isCitationProvided ? '  7. Citation' : ''

    const verificationPrompt = `
Generate a JSON object with the following keys:
{
  "verified": boolean,
  "explanation": string
}
Your task is to verify if the provided case brief summary is 100% accurate based solely on the following context.
In addition to checking that the summary includes detailed content for:
  1. Rule of Law
  2. Facts
  3. Issue
  4. Holding
  5. Reasoning
  6. Dissent
${citationCriteria}
please also verify that the provided case title, decision date (year), and jurisdiction are correct and well-formatted. This includes checking for proper punctuation, spelling, grammar, and capitalization.
If the citation field is missing or its value is "N/A" (case-insensitive), disregard the citation as a method of verification.
If the summary is fully correct and all additional fields are accurate and properly formatted, set "verified" to true and "explanation" to "Summary is fully accurate."
If there are any issues—whether the summary is missing substantial details or if the title, date, jurisdiction, or citation (when provided) are incorrect, misspelled, or improperly formatted—set "verified" to false and provide a concise explanation stating what is wrong.
If there is no Dissent provided, the summary can still be 100% accurate as it might not be possible to generate.
If the jurisdiction is N/A, Unknown and/or Blank, the case may still be verified as some case's don't provide this information publicly.
Do not include any additional text.
Citation can be N/A or missing & the verification can still be correct.
The Decision date is only provided in years within this application, therefore, for instance '2014' would be correct.
If a Case summary is close to fully accurate, it may be marked as verified, also some case briefs might be significantly smaller than others, as you'll be verifying small versions too.

Case Title: "${caseTitle.trim()}"
Decision Date: ${decisionDate || 'N/A'}
Jurisdiction: ${jurisdiction || 'N/A'}

Summary:
1. Rule of Law: ${briefSummary.ruleOfLaw || 'N/A'}
2. Facts: ${briefSummary.facts || 'N/A'}
3. Issue: ${briefSummary.issue || 'N/A'}
4. Holding: ${briefSummary.holding || 'N/A'}
5. Reasoning: ${briefSummary.reasoning || 'N/A'}
6. Dissent: ${briefSummary.dissent || 'N/A'}
${citationLine}
    `

    const messages = [
      {
        role: 'system',
        content:
          'You are an expert legal analyst. Your task is to verify the accuracy of a legal case brief summary and check that the case title, decision date (year), jurisdiction, and citation (if provided) are correct and properly formatted (including punctuation, spelling, grammar, and capitalization). Return ONLY a JSON object in the exact format specified.'
      },
      {
        role: 'user',
        content: verificationPrompt
      }
    ]

 const openai = new OpenAI({
          apiKey: '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',
        });
   
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages,
      max_tokens: 150,
      temperature: 0
    })

    if (
      !response ||
      !response.choices ||
      !Array.isArray(response.choices) ||
      response.choices.length === 0 ||
      !response.choices[0].message
    ) {
      console.error('Invalid response structure from OpenAI:', response)
      throw new Error('Invalid OpenAI response structure.')
    }

    let rawOutput = response.choices[0].message.content.trim()
    console.log('Raw verification output:', rawOutput)

    if (!rawOutput.startsWith('{')) {
      console.error("GPT verification response does not start with '{':", rawOutput)
      throw new Error("GPT verification response is not valid JSON")
    }

    let parsed
    try {
      parsed = JSON.parse(rawOutput)
    } catch (err) {
      console.warn('Direct JSON parse failed. Attempting substring extraction...')
      const firstCurly = rawOutput.indexOf('{')
      const lastCurly = rawOutput.lastIndexOf('}')
      if (firstCurly !== -1 && lastCurly !== -1) {
        const jsonSubstring = rawOutput.substring(firstCurly, lastCurly + 1)
        try {
          parsed = JSON.parse(jsonSubstring)
          console.log('Successfully parsed JSON substring:', jsonSubstring)
        } catch (innerErr) {
          console.error('Failed to parse JSON substring:', jsonSubstring)
          return NextResponse.json(
            { error: 'Could not parse JSON from GPT.' },
            { status: 500 }
          )
        }
      } else {
        console.error('No JSON object found in GPT response:', rawOutput)
        return NextResponse.json(
          { error: 'Could not parse JSON from GPT.' },
          { status: 500 }
        )
      }
    }

    const result = {
      verified: parsed.verified === true,
      explanation: parsed.explanation || ''
    }

    console.log('FINAL VERIFICATION RESULT =>', result)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    console.error('Error in /api/casebrief-verification:', err)
    return NextResponse.json(
      { error: 'Error verifying case brief.' },
      { status: 500 }
    )
  }
}
