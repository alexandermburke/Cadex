// /app/api/research/route.js

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    // Parse the JSON body from the request
    const { searchQuery } = await request.json();

    // Validate input parameters
    if (!searchQuery) {
      console.warn('No search query provided.');
      return NextResponse.json(
        { error: 'No search query provided.' },
        { status: 400 }
      );
    }

    // Define the detailed prompt
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

    // Initialize OpenAI API client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your environment variables
      // You can set other default options here if needed
    });

    // Make the API request to OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Use 'gpt-4' or 'gpt-3.5-turbo' as needed
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500, // Adjust as needed
      temperature: 0, // Lower temperature for more deterministic output
    });

    // Validate the structure of the response
    if (
      !response ||
      !response.choices ||
      !Array.isArray(response.choices) ||
      response.choices.length === 0 ||
      !response.choices[0].message ||
      !response.choices[0].message.content
    ) {
      console.error('Unexpected response structure from OpenAI:', response);
      throw new Error('Unexpected response structure from OpenAI.');
    }

    const assistantMessage = response.choices[0].message.content.trim();

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

    // Optional: Validate that searchResults is an array with up to 5 cases
    if (!Array.isArray(searchResults)) {
      console.error('Parsed JSON is not an array:', searchResults);
      return NextResponse.json(
        { error: 'AI response is not a valid JSON array.' },
        { status: 500 }
      );
    }

    // Return the search results
    return NextResponse.json({ searchResults }, { status: 200 });
  } catch (error) {
    // Enhanced error logging and response
    if (error instanceof OpenAI.APIError) {
      // OpenAI API specific error
      console.error('OpenAI API error:', {
        status: error.status,
        message: error.message,
        code: error.code,
        type: error.type,
      });
      return NextResponse.json(
        {
          error: 'Failed to process search query.',
          details: {
            status: error.status,
            message: error.message,
            code: error.code,
            type: error.type,
          },
        },
        { status: 500 }
      );
    } else if (error instanceof OpenAI.RequestError) {
      // Network or request error
      console.error('OpenAI Request error:', error);
      return NextResponse.json(
        {
          error: 'Network error while processing the search query.',
          details: error.message,
        },
        { status: 500 }
      );
    } else if (error instanceof OpenAI.RateLimitError) {
      // Rate limit exceeded
      console.error('OpenAI Rate limit error:', error);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          details: error.message,
        },
        { status: 429 }
      );
    } else if (error instanceof OpenAI.UnknownError) {
      // Unknown error
      console.error('OpenAI Unknown error:', error);
      return NextResponse.json(
        {
          error: 'An unknown error occurred while processing the search query.',
          details: error.message,
        },
        { status: 500 }
      );
    } else if (error.message) {
      // General error
      console.error('General error:', error.message);
      return NextResponse.json(
        {
          error: 'Failed to process search query.',
          details: error.message,
        },
        { status: 500 }
      );
    } else {
      // Fallback error
      console.error('Unknown error:', error);
      return NextResponse.json(
        {
          error: 'An unknown error occurred while processing the search query.',
        },
        { status: 500 }
      );
    }
  }
}
