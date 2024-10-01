// /app/api/research/route.js

import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { searchQuery } = await request.json();

        if (!searchQuery) {
            return NextResponse.json({ error: 'No search query provided.' }, { status: 400 });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Define the prompt for the AI
        const prompt = `
You are a legal expert with extensive knowledge of U.S. Supreme Court cases and other notable legal cases in the United States.

Given the search query: "${searchQuery}", provide a list of relevant cases. For each case, include:

- **Title**: The official case name.
- **Full Case Name**: The official full case name.
- **Summary**: A brief description of the case.
- **Important Dates**: Key dates relevant to the case.
- **Citations**: Legal citations for the case.
- **Related Cases**: Other cases that are related.
- **Decision**: The decision made in the case.
- **Link**: A URL where the full text of the case or a detailed article can be found (use a placeholder URL if necessary).

Provide the response in the following JSON format:

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
  },
  // More cases if relevant
]

Ensure the response is valid JSON and do not include any additional text outside the JSON output.
`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1500,
            temperature: 0.7,
        });

        const assistantMessage = response.choices?.[0]?.message?.content.trim();

        // ** Add logging of the assistant's message **
        console.log('Assistant Message:', assistantMessage);

        // Parse the assistant's message as JSON
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
            { error: 'Failed to process search query', details: error.message },
            { status: 500 }
        );
    }
}
