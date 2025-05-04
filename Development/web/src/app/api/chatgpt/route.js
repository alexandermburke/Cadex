import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { inputText } = body;

    if (!inputText) {
      return NextResponse.json({ message: 'No input text provided' }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: 'You are a legal assistant.' },
        { role: 'user', content: `Analyze this legal text: ${inputText}` },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const analysis = response.choices?.[0]?.message?.content || "No analysis available.";

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error) {
    console.error('Error during OpenAI API call:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to process analysis', details: error.message }, { status: 500 });
  }
}
