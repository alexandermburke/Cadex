import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  console.log('Received request to /api/casebrief-verification');

  try {
    // Parse the JSON body to extract briefSummary, caseTitle, decisionDate, and jurisdiction
    const { briefSummary, caseTitle, decisionDate, jurisdiction } = await request.json();

    // Validate input
    if (
      !briefSummary ||
      typeof briefSummary !== 'object' ||
      !caseTitle ||
      typeof caseTitle !== 'string' ||
      !caseTitle.trim()
    ) {
      console.warn('Invalid or missing briefSummary or caseTitle in request body.');
      return NextResponse.json(
        { error: 'Invalid or missing briefSummary or caseTitle in request body.' },
        { status: 400 }
      );
    }

    // Construct the verification prompt with additional context
    const verificationPrompt = `
Generate a JSON object with the following keys:
{
  "verified": boolean,
  "explanation": string
}
Verify if the following case brief summary is 100% accurate based solely on the provided context.
If the summary is fully correct, set "verified" to true and "explanation" to "Summary is fully accurate."
If it is not fully accurate, set "verified" to false and provide a brief explanation in "explanation" as to why.
Do not include any additional text. We do not have access to court records or case documents.

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
    `;

    const messages = [
      {
        role: 'system',
        content:
          'You are an expert legal analyst. Your task is to verify the accuracy of a legal case brief summary based on the provided context and return a JSON object as instructed.',
      },
      {
        role: 'user',
        content: verificationPrompt,
      },
    ];

    const openai = new OpenAI({
      apiKey: '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',
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: messages,
      max_tokens: 150,
      temperature: 0,
    });

    if (
      !response ||
      !response.choices ||
      !Array.isArray(response.choices) ||
      response.choices.length === 0 ||
      !response.choices[0].message
    ) {
      console.error('Invalid response structure from OpenAI:', response);
      throw new Error('Invalid OpenAI response structure.');
    }

    let rawOutput = response.choices[0].message.content.trim();
    console.log('Raw verification output:', rawOutput);

    let parsed;
    try {
      parsed = JSON.parse(rawOutput);
    } catch (err) {
      console.warn('Direct JSON parse failed. Attempting substring extraction...');
      const firstCurly = rawOutput.indexOf('{');
      const lastCurly = rawOutput.lastIndexOf('}');
      if (firstCurly !== -1 && lastCurly !== -1) {
        const jsonSubstring = rawOutput.substring(firstCurly, lastCurly + 1);
        try {
          parsed = JSON.parse(jsonSubstring);
          console.log('Successfully parsed JSON substring:', jsonSubstring);
        } catch (innerErr) {
          console.error('Failed to parse JSON substring:', jsonSubstring);
          return NextResponse.json(
            { error: 'Could not parse JSON from GPT.' },
            { status: 500 }
          );
        }
      } else {
        console.error('No JSON object found in GPT response:', rawOutput);
        return NextResponse.json(
          { error: 'Could not parse JSON from GPT.' },
          { status: 500 }
        );
      }
    }

    const result = {
      verified: parsed.verified === true,
      explanation: parsed.explanation || '',
    };

    console.log('FINAL VERIFICATION RESULT =>', result);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('Error in /api/casebrief-verification:', err);
    return NextResponse.json(
      { error: 'Error verifying case brief.' },
      { status: 500 }
    );
  }
}
