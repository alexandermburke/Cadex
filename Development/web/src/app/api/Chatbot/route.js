import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  console.log('Received request to /api/Chatbot');

  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string' || !query.trim()) {
      console.warn('Invalid or missing "query" in request body.');
      return NextResponse.json(
        { error: 'Invalid or missing "query" in request body.' },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    console.log(`Generating legal answer for query: "${trimmedQuery}"`);

    const messages = [
      {
        role: 'system',
        content: `
You are a highly knowledgeable legal chatbot designed for law students. Your answers must be clear, accurate, and always include an authoritative source. In your final JSON response, you MUST include exactly two keys: "answer" and "source". The "answer" should provide a detailed explanation to the student's question, and the "source" must include a verified URL or citation from a trusted legal resource to back up your answer. If you are uncertain about any detail or if no valid source exists, output "N/A" as the source. Do not include any extra text.
        `,
      },
      {
        role: 'user',
        content: `
Answer the following question in detail. Provide your answer in JSON format with exactly these keys:
{
  "answer": "",
  "source": ""
}
Do not include any additional text outside of the JSON object.

Question:
"${trimmedQuery}"
        `,
      },
    ];

     const openai = new OpenAI({
       apiKey: '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',
       })
   
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
          console.log('Successfully parsed JSON substring.');
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
      answer: parsed.answer || '',
      source: parsed.source || '',
    };

    console.log('FINAL PARSED RESULT =>', result);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('Error in /api/legal-chatbot:', err);
    return NextResponse.json(
      { error: 'Error generating legal response.' },
      { status: 500 }
    );
  }
}
