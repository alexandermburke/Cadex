// File: /app/api/aiGenerateTermDefinition/route.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  console.log('Received request to /api/aiGenerateTermDefinition');

  try {
    const { termName } = await request.json();

    if (!termName || typeof termName !== 'string' || !termName.trim()) {
      return NextResponse.json(
        { error: 'Missing or invalid termName.' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY_CURRENT,
      });
  
    // Simple system & user prompts to generate a short legal definition.
    const messages = [
      {
        role: 'system',
        content:
          'You are an expert legal writer. Provide a concise, plain-English definition for the user’s legal term.',
      },
      {
        role: 'user',
        content: `Generate a short definition for the following legal term, no more than 3 sentences: "${termName.trim()}".`,
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-nano', 
      messages,
      max_tokens: 120,
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

    const rawOutput = response.choices[0].message.content.trim();
    console.log('Generated definition output:', rawOutput);

    return NextResponse.json({ definition: rawOutput }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/aiGenerateTermDefinition:', error);
    return NextResponse.json(
      { error: 'Failed to generate a definition.' },
      { status: 500 }
    );
  }
}
