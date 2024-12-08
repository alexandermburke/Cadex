// app/api/generatebrief/route.js

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';

export async function POST(request) {
  try {
    const { caseDescription, category, skillLevel } = await request.json();

    if (!caseDescription || !category || !skillLevel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });

    if (!configuration.apiKey) {
      console.error('OpenAI API key is missing.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const openai = new OpenAIApi(configuration);

    const prompt = `Create a legal case brief for a ${skillLevel.toLowerCase()} level case in ${category.toLowerCase()} law. Description: ${caseDescription}`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a legal expert.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const brief = completion.data.choices[0].message.content.trim();

    return NextResponse.json({ brief }, { status: 200 });
  } catch (error) {
    console.error('Error generating brief:', error.response ? error.response.data : error.message);
    return NextResponse.json({ error: 'Failed to generate brief' }, { status: 500 });
  }
}
