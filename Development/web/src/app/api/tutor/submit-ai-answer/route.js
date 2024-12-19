import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    const { question, answer, examType, topic, subTopic, selectedQuestionTypes } = await request.json();

    const evaluationPrompt = `You are a legal tutoring assistant. The student was given the following question:
"${question}"

The student answered:
"${answer}"

1. Determine if the answer is correct or not. 
2. Provide detailed feedback and reasoning. 
3. If possible, highlight the reasoning steps and important legal rules that the student should have considered.

Return JSON in the format:
{
  "correct": true/false,
  "feedback": "Your feedback here",
  "highlightedSections": [
     { "text": "some reasoning text", "highlight": true/false, "reason": "why this was highlighted" },
     ...
  ]
}`;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: "You are a legal tutor that evaluates student's answers." },
        { role: 'user', content: evaluationPrompt }
      ],
      temperature: 0.7,
    });

    const completionText = response.choices[0].message.content.trim();

    let parsed;
    try {
      parsed = JSON.parse(completionText);
    } catch (e) {
      parsed = {
        correct: false,
        feedback: "Could not parse AI feedback. The answer might be incorrect or incomplete.",
        highlightedSections: []
      };
    }

    const { correct, feedback, highlightedSections } = parsed;

    return NextResponse.json({ correct, feedback, highlightedSections }, { status: 200 });
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return NextResponse.json({ error: 'Failed to submit answer.' }, { status: 500 });
  }
}
