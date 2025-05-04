import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    const {
      question,
      answer,
      studyYear,
      course,
      subTopic,
      showLegalReferences,
      provideApproach,
      includeKeyCases,
      includeStatutes,
    } = await request.json();

    // Build a custom prompt for feedback
    let additionalInstructions = '';
    if (showLegalReferences) {
      additionalInstructions += `Include references to relevant legal principles or theories if appropriate.\n`;
    }
    if (provideApproach) {
      additionalInstructions += `Provide a structured approach or steps the student should have taken to arrive at the correct solution.\n`;
    }
    if (includeKeyCases) {
      additionalInstructions += `Include a short mention of key case precedents that illustrate the principle.\n`;
    }
    if (includeStatutes) {
      additionalInstructions += `Mention any crucial statutes or code sections that apply.\n`;
    }

    const evaluationPrompt = `
You are a law school tutor. The question was:
"${question}"

The student answered:
"${answer}"

1. Determine if the answer is correct or not (true/false).
2. Provide detailed feedback, referencing specific legal rules or reasoning missed or correctly applied.
3. ${additionalInstructions.trim()}
4. Return JSON only in this format:

{
  "correct": true/false,
  "feedback": "Detailed explanation or feedback here",
  "highlightedSections": [
    {
      "text": "some reasoning text chunk",
      "highlight": true/false,
      "reason": "why it was highlighted"
    },
    ...
  ]
}
No disclaimers, no extra text beyond valid JSON.
`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const responseAI = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: 'You are a law tutor that evaluates a student’s answer.' },
        { role: 'user', content: evaluationPrompt },
      ],
      temperature: 0.7,
    });

    const completionText = responseAI.choices[0].message.content.trim();

    let parsed;
    try {
      parsed = JSON.parse(completionText);
    } catch (error) {
      parsed = {
        correct: false,
        feedback: 'Could not parse AI feedback. Possibly incomplete or invalid JSON.',
        highlightedSections: [],
      };
    }

    const { correct, feedback, highlightedSections } = parsed;
    return NextResponse.json({ correct, feedback, highlightedSections }, { status: 200 });
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return NextResponse.json({ error: 'Failed to submit answer.' }, { status: 500 });
  }
}
