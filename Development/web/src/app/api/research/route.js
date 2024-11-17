// /app/api/research/route.js

import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';

export async function POST(request) {
  try {
    const { searchQuery } = await request.json();

    if (!searchQuery) {
      return NextResponse.json({ error: 'No search query provided.' }, { status: 400 });
    }

    // Set up OpenAI API
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    // Define the prompt
    const prompt = `As a legal expert, provide up to 5 relevant U.S. legal cases for the search query: "${searchQuery}". For each case, include:

- "title": The official case name.
- "summary": A brief description of the case.
- "citations": Legal citations for the case.
- "decision": The decision made in the case.

Provide the response in valid JSON format:

[
  {
    "title": "Case Title 1",
    "summary": "Brief summary of the case.",
    "citations": "Legal citations for Case 1",
    "decision": "Decision made in Case 1"
  }
  // ... up to 5 cases
]

Only output the JSON array and nothing else.`;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0,
    });

    const assistantMessage = response.data.choices[0].message.content.trim();

    // Attempt to parse the JSON array
    let searchResults;
    try {
      searchResults = JSON.parse(assistantMessage);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      console.error('Assistant Message:', assistantMessage);
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON.', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ searchResults }, { status: 200 });
  } catch (error) {
    console.error('Error during OpenAI API call:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to process search query', details: error.response?.data || error.message },
      { status: 500 }
    );
  }
}
