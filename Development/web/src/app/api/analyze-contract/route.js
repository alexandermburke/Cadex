// /app/api/analyze-contract/route.js
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { contractText } = await request.json();

    if (!contractText) {
      return NextResponse.json({ error: 'No contract text provided.' }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a legal assistant.',
        },
        {
          role: 'user',
          content: `Please provide a detailed legal analysis of the following contract:\n\n${contractText}\n\nHighlight any potential legal issues, ambiguities, or clauses that might require further review. Provide suggestions for improvements or areas that might need legal consultation.`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const analysis = response.choices?.[0]?.message?.content || 'No analysis available.';

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error) {
    console.error('Error during OpenAI API call:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to process analysis', details: error.message },
      { status: 500 }
    );
  }
}
