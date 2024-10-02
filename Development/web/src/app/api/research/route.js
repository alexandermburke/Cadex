// /app/api/research/route.js

import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { searchQuery } = await request.json();

        if (!searchQuery) {
            return NextResponse.json({ error: 'No search query provided.' }, { status: 400 });
        }

        // Check if OPENAI_API_KEY is available
        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY is not set.');
            return NextResponse.json(
                { error: 'Server configuration error: OpenAI API key is missing.' },
                { status: 500 }
            );
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Define the prompt for the AI
        const prompt = `
As a legal expert, provide up to 5 relevant U.S. legal cases for the search query: "${searchQuery}". For each case, include:

- "title": The official case name.
- "fullCaseName": The official full case name.
- "summary": A brief description of the case.
- "importantDates": Key dates relevant to the case.
- "citations": Legal citations for the case.
- "relatedCases": Other related cases.
- "decision": The decision made in the case.
- "link": A URL to the case or a detailed article (use a placeholder if necessary).

Provide the response **strictly** in valid JSON format without any additional text:

[
  {
    "title": "Case Title 1",
    "fullCaseName": "Full Case Name of Case 1",
    "summary": "Brief summary of the case.",
    "importantDates": "Important dates for Case 1",
    "citations": "Legal citations for Case 1",
    "relatedCases": "Related cases for Case 1",
    "decision": "Decision made in Case 1",
    "link": "https://example.com/case1"
  }
  // ... up to 5 cases
]

Only output the JSON array and nothing else.
`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500,
            temperature: 0,
        });

        const assistantMessage = response.choices?.[0]?.message?.content.trim();

        // Log the assistant's message for debugging
        console.log('Assistant Message:', assistantMessage);

        // Attempt to extract JSON from the assistant's message
        let searchResults;
        try {
            // Match the JSON array in the assistant's message
            const jsonMatch = assistantMessage.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (jsonMatch) {
                searchResults = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON array found in the assistant message.');
            }
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
