// /app/api/examprep/submit-exam-answer/route.js

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    const { question, answer, examType, lawType } = await request.json();

    if (!question || !answer) {
      console.warn('Incomplete submission:', { question, answer });
      return NextResponse.json(
        { error: 'Question and answer text are required.' },
        { status: 400 }
      );
    }

    // Construct prompt to evaluate law-student style answer
    const prompt = `
You are a law professor grading a law student's response. 

1. **Exam Type**: ${examType || 'General Practice Exam'} 
2. **Subject**: ${lawType || 'General Law Subject'}

The question was:

"${question}"

The student's answer was:

"${answer}"

**Task**:
- Determine the accuracy and completeness of the student's answer.
- Provide feedback and reasoning on whether the student identified key legal issues, rules, and analysis.
- If relevant, highlight any missing arguments or misunderstandings. 
- Conclude with whether the student's answer is correct or not (if multiple-choice) or if it is sufficiently correct (for essay format).

**Return**:
- JSON with "feedback" string summarizing the evaluation 
- "correct" boolean if multiple-choice style. 
  - If it's an essay style, you can approximate correctness as true if answer is generally correct, false if lacking.

Do not include disclaimers or extraneous commentary, just the JSON response.

Example JSON:
{
  "feedback": "Your analysis is mostly correct. You identified the key issues but missed some details about consideration.",
  "correct": false
}`;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // or gpt-3.5-turbo
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200,
      temperature: 0.6,
    });

    if (
      !response ||
      !response.choices ||
      !Array.isArray(response.choices) ||
      response.choices.length === 0 ||
      !response.choices[0].message ||
      !response.choices[0].message.content
    ) {
      console.error('Unexpected response structure from OpenAI:', response);
      throw new Error('Unexpected response from OpenAI.');
    }

    const rawContent = response.choices[0].message.content.trim();
    if (!rawContent) {
      throw new Error('OpenAI did not return any feedback.');
    }

    // Attempt to parse JSON
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (err) {
      // If parsing fails, treat it as text
      console.warn('OpenAI did not return valid JSON. Wrapping as feedback only.');
      parsed = {
        feedback: rawContent,
        correct: false,
      };
    }

    // We expect at least "feedback" and optionally "correct"
    const { feedback = 'No feedback provided.', correct = false } = parsed;

    return NextResponse.json({ feedback, correct }, { status: 200 });
  } catch (error) {
    // Enhanced error handling
    if (error instanceof OpenAI.APIError) {
      console.error('OpenAI API error:', {
        status: error.status,
        message: error.message,
        code: error.code,
        type: error.type,
      });
      return NextResponse.json(
        {
          error: 'Failed to evaluate the answer.',
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
      console.error('OpenAI Request error:', error);
      return NextResponse.json(
        { error: 'Network error while evaluating the answer.', details: error.message },
        { status: 500 }
      );
    } else if (error instanceof OpenAI.RateLimitError) {
      console.error('OpenAI Rate limit error:', error);
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.', details: error.message },
        { status: 429 }
      );
    } else if (error instanceof OpenAI.UnknownError) {
      console.error('OpenAI Unknown error:', error);
      return NextResponse.json(
        { error: 'Unknown error while evaluating the answer.', details: error.message },
        { status: 500 }
      );
    } else if (error.message) {
      console.error('General error:', error.message);
      return NextResponse.json(
        { error: 'Failed to evaluate answer.', details: error.message },
        { status: 500 }
      );
    } else {
      console.error('Unknown error:', error);
      return NextResponse.json(
        { error: 'An unknown error occurred while evaluating the answer.' },
        { status: 500 }
      );
    }
  }
}
