// File: /app/api/citation/route.js

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  console.log('Received request for citation generation.');

  try {
    // Parse the JSON body and extract the necessary details.
    const { title, date, jurisdiction } = await request.json();
    
    // Validate input: all three fields are required.
    if (
      !title || typeof title !== 'string' || !title.trim() ||
      !date || typeof date !== 'string' || !date.trim() ||
      !jurisdiction || typeof jurisdiction !== 'string' || !jurisdiction.trim()
    ) {
      console.warn('Invalid input: title, date, and jurisdiction are required.');
      return NextResponse.json(
        { error: 'Invalid input. Provide a non-empty title, date, and jurisdiction.' },
        { status: 400 }
      );
    }

    const cleanTitle = title.trim();
    const cleanDate = date.trim();
    const cleanJurisdiction = jurisdiction.trim();

    // Prepare a prompt instructing the AI to return only the reporter citation.
    const promptContent = `
Based on the following case details, generate only the reporter citation string,
which should include the volume number, reporter abbreviation, and page number.
Do NOT include the case name or the year. If the citation either doesn't exist,
or isn't publicly available, the answer must be "N/A"

Case Details:
Title: "${cleanTitle}"
Date: "${cleanDate}"
Jurisdiction: "${cleanJurisdiction}"

Return your answer strictly in JSON format with a single key:
{
  "citation": "<generated citation>"
}

For example, if the full citation is "Prigg v. Pennsylvania, 41 U.S. 539 (1842)",
return only "41 U.S. 539".
    `;

    const messages = [
      {
        role: 'system',
        content: `
You are a legal citation generator. Based on the provided case details,
generate only the reporter citation (volume, reporter, and page number)
in a valid JSON object with the key "citation". Do NOT include the case name or year.
        `
      },
      {
        role: 'user',
        content: promptContent
      }
    ];

       const openai = new OpenAI({
         apiKey: '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',
       });
   
       const response = await openai.chat.completions.create({
         model: 'gpt-4-turbo',
         messages: messages,
      max_tokens: 200,
      temperature: 0.5,
    });

    if (
      !response ||
      !response.choices ||
      !Array.isArray(response.choices) ||
      response.choices.length === 0 ||
      !response.choices[0].message
    ) {
      console.error('Invalid response from OpenAI:', response);
      return NextResponse.json({ error: 'Invalid citation response.' }, { status: 500 });
    }

    let rawContent = response.choices[0].message.content.trim();
    let parsedResult;
    try {
      parsedResult = JSON.parse(rawContent);
    } catch (err) {
      // Attempt to extract JSON substring if direct parse fails.
      const firstBrace = rawContent.indexOf('{');
      const lastBrace = rawContent.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        const jsonSubstring = rawContent.substring(firstBrace, lastBrace + 1);
        try {
          parsedResult = JSON.parse(jsonSubstring);
        } catch (innerErr) {
          console.error('Failed to parse JSON substring:', jsonSubstring);
          return NextResponse.json({ error: 'Could not parse citation JSON.' }, { status: 500 });
        }
      } else {
        console.error('No JSON object found in response:', rawContent);
        return NextResponse.json({ error: 'Could not parse citation JSON.' }, { status: 500 });
      }
    }

    const result = {
      citation: parsedResult.citation || ''
    };

    console.log('Generated citation:', result.citation);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('Error generating citation:', err);
    return NextResponse.json({ error: 'Error generating citation.' }, { status: 500 });
  }
}
