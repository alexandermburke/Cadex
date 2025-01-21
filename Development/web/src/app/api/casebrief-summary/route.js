// app/api/casebrief-summary/route.js

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * POST /api/casebrief-summary
 * Expects JSON body: { title: "Case Title" }
 * Returns JSON: { ruleOfLaw, facts, issue, holding, reasoning, dissent }
 */
export async function POST(request) {
  console.log('Received request to /api/casebrief-summary');

  try {
    // Parse the JSON body to extract the title
    const { title } = await request.json();

    // Validate the presence and type of the title
    if (!title || typeof title !== 'string' || !title.trim()) {
      console.warn('Invalid or missing "title" in request body.');
      return NextResponse.json(
        {
          error: 'Invalid or missing "title" in request body.',
        },
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

Provide the summary in JSON format with the following keys:
{
  "ruleOfLaw": "",
  "facts": "",
  "issue": "",
  "holding": "",
  "reasoning": "",
  "dissent": ""
}

DO NOT include any additional text, explanations, or disclaimers.

Case Title:
"${inputTitle}"
    `;

    // Define the conversation messages to guide the AI
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
  "dissent": ""
}
ONLY return the JSON object. DO NOT include any additional text or commentary.
        `,
      },
      {
        role: 'user',
        content: userContent,
      },
    ];

    // Initialize OpenAI API client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Make the API request to OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 1500,
      temperature: 0.7,
    });

    // Validate the structure of the response
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

    // Structure the parsed result
    const result = {
      ruleOfLaw: parsed.ruleOfLaw || '',
      facts: parsed.facts || '',
      issue: parsed.issue || '',
      holding: parsed.holding || '',
      reasoning: parsed.reasoning || '',
      dissent: parsed.dissent || '',
    };

    console.log('FINAL PARSED RESULT =>', result);

    // Return the structured summary as JSON
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('Error in /api/casebrief-summary:', err);
    return NextResponse.json(
      { error: 'Error summarizing case.' },
      { status: 500 }
    );
  }
}
