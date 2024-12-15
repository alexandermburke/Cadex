// /api/generate-flashcards/route.js

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    // Parse the JSON body from the request
    const { config } = await request.json();
    const { examType, difficulty, lawType, flashcardLimit, instantFeedback, selectedQuestionTypes } = config;

    // Validate input parameters
    if (!examType || !difficulty) {
      console.warn('Incomplete exam configuration received:', { examType, difficulty });
      return NextResponse.json(
        { error: 'Incomplete exam configuration. Please provide examType and difficulty.' },
        { status: 400 }
      );
    }

    // flashcardLimit check
    const numFlashcards = flashcardLimit && Number.isInteger(flashcardLimit) ? flashcardLimit : 5;

    // Mapping difficulty levels to descriptive strings for the prompt
    const difficultyDetails = {
      'Below 150': 'basic understanding with straightforward scenarios (LSAT score range below 150)',
      '150-160': 'intermediate understanding with moderate complexity (LSAT score range 150-160)',
      '160-170': 'advanced understanding with complex reasoning (LSAT score range 160-170)',
      '175+': 'expert-level complexity and reasoning (LSAT score 175+)',
      'Below Average': 'basic proficiency with fundamental legal concepts (BAR)',
      'Average': 'solid proficiency with moderate complexity (BAR)',
      'Above Average': 'high proficiency dealing with complex legal scenarios (BAR)',
      'Expert': 'expert-level proficiency with extremely challenging legal material (BAR)',
      'Basic': 'basic ethical understanding with simple scenarios (MPRE)',
      'Intermediate': 'intermediate ethical reasoning with moderate complexity (MPRE)',
      'Advanced': 'advanced ethical reasoning with complex, nuanced scenarios (MPRE)',
    };

    const difficultyDescription = difficultyDetails[difficulty] || difficulty;

    // Build the question types description for the prompt if any
    let questionTypesDescription = '';
    if (Array.isArray(selectedQuestionTypes) && selectedQuestionTypes.length > 0) {
      questionTypesDescription = 'Focus on the following question types or reasoning styles:\n';
      selectedQuestionTypes.forEach((type) => {
        questionTypesDescription += `- ${type}\n`;
      });
    }

    // We will instruct the model to produce multiple flashcards. Each flashcard is a Q/A pair.
    // The flashcards should be relevant to the given examType, difficulty, and lawType.
    // If examType is LSAT and questionTypes are provided, focus on logical reasoning or reading comprehension style questions.
    // If BAR or MPRE, focus on legal or ethical scenarios as short Q/A pairs.
    // We'll produce the final output in JSON for easy parsing.

    let examContext = '';
    if (examType === 'LSAT') {
      examContext = `You are an expert LSAT tutor creating flashcards. The difficulty reflects a ${difficultyDescription}. The content should reflect LSAT-style reasoning, possibly related to ${lawType}. ${questionTypesDescription}`;
    } else if (examType === 'BAR') {
      examContext = `You are an expert BAR exam tutor creating flashcards. The difficulty reflects ${difficultyDescription}. The content should reflect ${lawType} concepts relevant to the BAR exam. ${questionTypesDescription}`;
    } else if (examType === 'MPRE') {
      examContext = `You are an expert MPRE exam tutor creating flashcards. The difficulty reflects ${difficultyDescription}. The content should reflect ${lawType} concepts relevant to the MPRE. ${questionTypesDescription}`;
    } else {
      examContext = `You are an expert law exam tutor creating flashcards for ${examType}. The difficulty reflects ${difficultyDescription}. The content should reflect ${lawType} concepts. ${questionTypesDescription}`;
    }

    const prompt = `
${examContext}

Please create ${numFlashcards} flashcards in JSON format. Each flashcard should have the following structure:

{
  "topic": "<The examType or lawType topic>",
  "difficulty": "<The difficulty string>",
  "question": "<A concise question focusing on reasoning or legal knowledge>",
  "answer": "<A concise, correct answer to the question>",
  "correctAnswer": "<Repeat the correct answer here>"
}

- The "topic" should be related to the examType and/or lawType (e.g., "LSAT General Law", "BAR Constitutional Law", "MPRE Professional Responsibility").
- The "difficulty" field should reflect the chosen difficulty.
- The "question" should be a short, clear prompt. For LSAT, it could be a short logical reasoning question or snippet. For BAR/MPRE, it could be a short scenario testing a legal concept.
- The "answer" and "correctAnswer" should contain the correct solution or key point. Keep answers brief but informative.
- Do not provide extra explanation outside of the JSON.
- Return only JSON with a top-level field "flashcards" that is an array of the flashcard objects.
- No extra commentary or formatting outside the JSON object.

Example format (just structure, not actual content):

{
  "flashcards": [
    {
      "topic": "LSAT General Law",
      "difficulty": "Below 150",
      "question": "Which of the following assumptions underlies the argument above?",
      "answer": "The author assumes that the evidence provided is representative of the general scenario.",
      "correctAnswer": "The author assumes that the evidence provided is representative of the general scenario."
    },
    ...
  ]
}

Now produce the actual flashcards according to the given parameters.
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
      // If parsing fails, return an error
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
