import { NextResponse } from 'next/server';
import OpenAI from 'openai';

/**
 * POST /api/generate-flashcards
 * Expects JSON body: { config: { studyYear, proficiency, courseName, questionLimit, ... } }
 * Returns JSON: { flashcards: [ ... ] }
 */
export async function POST(request) {
  try {
    // Parse the JSON body from the request
    const { config } = await request.json();
    const {
      studyYear,
      proficiency,
      courseName,
      questionLimit,
      includeExplanations,
    } = config || {};

    // Basic validation
    if (!studyYear || !proficiency || !courseName) {
      console.warn('Incomplete study config received:', { studyYear, proficiency, courseName });
      return NextResponse.json(
        { error: 'Incomplete configuration. Please provide studyYear, proficiency, and courseName.' },
        { status: 400 }
      );
    }

    // Number of flashcards
    const numFlashcards = questionLimit && Number.isInteger(questionLimit) ? questionLimit : 5;

    // We’ll craft a short prompt oriented to law students
    const prompt = `
You are an expert law tutor creating flashcards for a ${studyYear}-level student in ${courseName} at ${proficiency} proficiency.

Generate ${numFlashcards} flashcards in JSON format. Each flashcard has:
{
  "topic": "<A short label, e.g. 'Contracts Formation' or 'Torts Negligence'>",
  "difficulty": "<Use the same value: '${proficiency}'>",
  "question": "<A concise scenario or question about the subject>",
  "answer": "<A concise, correct answer>",
  "correctAnswer": "<Repeat the same correct answer>"
}

- Keep each flashcard brief and relevant to ${courseName}.
- The 'question' should be a short scenario or direct question testing an important concept for a ${studyYear}-level student with ${proficiency} proficiency.
- The 'answer' and 'correctAnswer' must match (the correct solution).
- ${includeExplanations ? 'You may add a short explanation within the "answer" field if needed.' : 'Do NOT add extra explanations beyond a concise statement of correctness.'}
- Return only JSON with top-level field "flashcards" as an array, no extra text or formatting.

Example JSON:
{
  "flashcards": [
    {
      "topic": "Contracts Offer & Acceptance",
      "difficulty": "Basic",
      "question": "Under common law, when is an offer considered accepted?",
      "answer": "When the offeree communicates unconditional acceptance mirroring the terms of the offer.",
      "correctAnswer": "When the offeree communicates unconditional acceptance mirroring the terms of the offer."
    }
    ...
  ]
}
    `;

    // Initialize OpenAI API client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Make the API request to OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7,
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

    const rawContent = response.choices[0].message.content.trim();

    // Attempt to parse the returned JSON
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (err) {
      console.error('Failed to parse JSON from the model response:', rawContent, err);
      return NextResponse.json(
        { error: 'The AI response could not be parsed as valid JSON.' },
        { status: 500 }
      );
    }

    // Check if parsed.flashcards is an array
    if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) {
      console.error('The JSON does not contain a "flashcards" array.', parsed);
      return NextResponse.json(
        { error: 'The AI did not return a "flashcards" array.' },
        { status: 500 }
      );
    }

    // Return the flashcards
    return NextResponse.json({ flashcards: parsed.flashcards }, { status: 200 });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    // Return an error response
    return NextResponse.json(
      { error: 'An error occurred while generating the flashcards.' },
      { status: 500 }
    );
  }
}
