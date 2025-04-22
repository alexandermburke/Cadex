import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  console.log('Received request to /api/casebrief-summary');

  try {
    const { title, citation } = await request.json();

    if (!title || typeof title !== 'string' || !title.trim()) {
      console.warn('Invalid or missing "title" in request body.');
      return NextResponse.json(
        { error: 'Invalid or missing "title" in request body.' },
        { status: 400 }
      );
    }

    const inputTitle = title.trim();
    console.log(`Generating summary based on title: "${inputTitle}"`);

    const userContent = `
Generate a brief case summary based on the following case title. The summary should include:
1. Rule of Law
2. Facts
3. Issue
4. Holding
5. Reasoning
6. Dissent (if any)
7. Analysis

Provide the summary in JSON format with the following keys:
{
  "ruleOfLaw": "",
  "facts": "",
  "issue": "",
  "holding": "",
  "reasoning": "",
  "dissent": "",
  "analysis": ""
}

DO NOT include any additional text, explanations, or disclaimers.

Case Title:
"${inputTitle}"
    `;

    const messages = [
      {
        role: 'system',
        content: `
You are a concise legal summarizer. Your task is to generate a structured case brief based on the provided case title. The summary must be in JSON format with the following keys:
{
  "ruleOfLaw": "",
  "facts": "",
  "issue": "",
  "holding": "",
  "reasoning": "",
  "dissent": "",
  "analysis": ""
}
ONLY return the JSON object. DO NOT include any additional text or commentary.
        `,
      },
      {
        role: 'user',
        content: userContent,
      },
    ];

    const openai = new OpenAI({
      apiKey: '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',
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 1500,
      temperature: 0.7,
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

    let rawContent = response.choices[0].message.content.trim();
    console.log('RAW GPT CONTENT =>', rawContent);

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (err) {
      console.warn('Direct JSON parse failed. Attempting substring extraction...');
      const firstCurly = rawContent.indexOf('{');
      const lastCurly = rawContent.lastIndexOf('}');
      if (firstCurly !== -1 && lastCurly !== -1) {
        const jsonSubstring = rawContent.substring(firstCurly, lastCurly + 1);
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
        console.error('No JSON object found in GPT response:', rawContent);
        return NextResponse.json(
          { error: 'Could not parse JSON from GPT.' },
          { status: 500 }
        );
      }
    }

    const result = {
      ruleOfLaw: parsed.ruleOfLaw || '',
      facts: parsed.facts || '',
      issue: parsed.issue || '',
      holding: parsed.holding || '',
      reasoning: parsed.reasoning || '',
      dissent: parsed.dissent || '',
      analysis: parsed.analysis || '',
    };

    if (citation && citation.trim() !== '' && citation.trim().toUpperCase() !== 'N/A') {
      result.citation = citation.trim();
    }

    console.log('FINAL PARSED RESULT =>', result);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('Error in /api/casebrief-summary:', err);
    return NextResponse.json(
      { error: 'Error summarizing case.' },
      { status: 500 }
    );
  }
}
