import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY_CURRENT,
    });

    // Prompt the AI to generate networking events for law students:
    const prompt = `
You are an expert in generating law student networking opportunities taking place across the United States. 
Return at least 8 real-sounding but fictional events in the next few months. 
Each event should have these fields:
  - id: a unique integer id
  - title: short event title
  - date: date in YYYY-MM-DD format
  - location: city/state or online
  - description: short summary
  - link: a plausible URL for the event

Constraints/Instructions:
1. Return only valid JSON.
2. Structure the JSON as:
   {
     "events": [
       {
         "id": 1,
         "title": "...",
         "date": "...",
         "location": "...",
         "description": "...",
         "link": "..."
       },
       ...
     ]
   }
3. Include at least 8 events.
4. Do not provide disclaimers or extra commentary.
5. No markdown formatting.
6. Return the JSON directly as plain text. No other text.
    `;

    // Call the OpenAI Chat Completion API
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        {
          role: 'system',
          content: 'You generate lists of upcoming networking events for law students in JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    });

    const rawContent = response?.choices?.[0]?.message?.content?.trim() || '';

    if (!rawContent) {
      return NextResponse.json(
        { error: 'No content returned from the AI model.' },
        { status: 500 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (error) {
      // If JSON parse fails, respond with raw content for debugging
      return NextResponse.json(
        {
          error: 'AI response could not be parsed as valid JSON.',
          rawContent,
        },
        { status: 500 }
      );
    }

    // Basic validation: check if "events" is an array with at least 8 items
    if (!Array.isArray(parsed.events)) {
      return NextResponse.json(
        { error: '"events" must be an array.', rawContent },
        { status: 500 }
      );
    }

    if (parsed.events.length < 8) {
      return NextResponse.json(
        { error: 'Fewer than 8 events returned.', rawContent },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    console.error('Error in AI event generation:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating networking opportunities.' },
      { status: 500 }
    );
  }
}