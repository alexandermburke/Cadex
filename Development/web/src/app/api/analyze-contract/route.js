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
      apiKey: process.env.OPENAI_API_KEY_CURRENT,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        {
          role: 'system',
          content: `You are a legal assistant specializing in contract analysis. Your task is to review the following contract text and provide a concise summary highlighting key points, potential ambiguities, and any areas that may require further attention or clarification. Do not provide legal advice, but focus on summarizing the content and noting any general observations.`,
        },
        {
          role: 'user',
          content: `Contract Text:\n\n${contractText}`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const analysis = response.choices?.[0]?.message?.content.trim() || 'No analysis available.';

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error) {
    console.error('Error during OpenAI API call:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to process analysis', details: error.message },
      { status: 500 }
    );
  }
}
