import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    const {
      studyYear,
      course,
      subTopic,
      complexity,
      userPrompt,
    } = await request.json();

    // Base prompt for a law school question
    let prompt = `
Generate a ${complexity}-level question for a ${studyYear} student in ${course}
${subTopic ? ' (subtopic: ' + subTopic + ')' : ''}.
The question should be concise, direct, and suitable for a law school quiz or exam scenario.
No introduction or extraneous text, just the question itself.
`;

    // If the user provided a custom userPrompt, weave it in
    if (userPrompt && userPrompt.trim().length > 0) {
      prompt = `
Based on this user prompt: "${userPrompt}", generate a ${complexity}-level question 
that is relevant to a ${studyYear} course on ${course}${subTopic ? ', ' + subTopic : ''}.
Only return the question text, no disclaimers or intros.
`;
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const questionResponse = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: 'You are an expert law tutor focusing on law school coursework.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const question = questionResponse.choices[0].message.content.trim();

    // Next, highlight the question
    const highlightPrompt = `
Question: ${question}
Identify key sentences or phrases crucial for answering. 
Return a JSON array of objects:
[
  { "text": "...", "highlight": true/false, "reason": "..." }
]
Include the entire question text in sequence. 
Mark chunks that matter with "highlight": true, explaining the reason. 
Chunks that don't matter can have "highlight": false, reason "Not crucial".
Only output valid JSON.
`;

    const highlightResponse = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: 'You are a text analyst that highlights key legal question parts.' },
        { role: 'user', content: highlightPrompt },
      ],
      temperature: 0.7,
    });

    let highlightedSections = [];
    try {
      highlightedSections = JSON.parse(highlightResponse.choices[0].message.content);
    } catch {
      highlightedSections = [
        {
          text: question,
          highlight: false,
          reason: 'No highlight info provided',
        },
      ];
    }

    return NextResponse.json({ question, highlightedSections }, { status: 200 });
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ error: 'Failed to fetch AI question.' }, { status: 500 });
  }
}
