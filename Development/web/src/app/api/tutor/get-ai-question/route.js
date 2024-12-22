import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    const { examType, topic, subTopic, complexity, selectedQuestionTypes, userPrompt } = await request.json();

    // Build the base prompt without introductory or filler phrases
    let prompt = `Provide only the text of a challenging ${complexity} ${examType} question about ${topic}${subTopic ? ' (subtopic: ' + subTopic + ')' : ''}. 
No introductions, disclaimers, or extraneous text. The question should be suitable for a tutoring session.`;

    // If the user provided a custom prompt, incorporate it and still instruct to avoid introductions
    if (userPrompt && userPrompt.trim().length > 0) {
      prompt = `Based on this user prompt: "${userPrompt}", provide only the text of a challenging ${complexity} question that is relevant to ${examType}, ${topic}${subTopic ? ', ' + subTopic : ''}.
No introductions, disclaimers, or extraneous text. The question should be suitable for a tutoring session.`;
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Request the question from OpenAI
    const questionResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: "You are an expert legal tutor." },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    const question = questionResponse.choices[0].message.content.trim();

    // Prompt for highlighting key phrases
    const highlightPrompt = `Question: ${question}
Please identify key sentences or phrases in the question that are crucial for answering it. 
For each highlighted section, explain why it's important. 
Return a JSON array of objects in the format: 
[
  { "text": "...", "highlight": true/false, "reason": "..." }
]
Make sure to cover the entire question text in sequence, splitting it into chunks. 
Chunks that are not important should have "highlight": false and reason "Not crucial".
Do not include any introductory phrases or apologies, just return the JSON array directly.`;

    const highlightResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: "You are a text analyst." },
        { role: 'user', content: highlightPrompt }
      ]
    });

    let highlightedSections = [];
    try {
      highlightedSections = JSON.parse(highlightResponse.choices[0].message.content);
    } catch {
      highlightedSections = [{ text: question, highlight: false, reason: 'No highlight info provided' }];
    }

    return NextResponse.json({ question, highlightedSections }, { status: 200 });
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ error: 'Failed to fetch AI question.' }, { status: 500 });
  }
}
