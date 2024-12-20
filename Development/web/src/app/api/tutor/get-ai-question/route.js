import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    const { examType, topic, subTopic, complexity, selectedQuestionTypes, userPrompt } = await request.json();

    let prompt = `You are a legal tutor. Provide a challenging ${complexity} ${examType} question on ${topic} ${subTopic ? 'subtopic: ' + subTopic : ''}.
    The question should be suitable for a tutoring session.`;

    if (userPrompt && userPrompt.trim().length > 0) {
      prompt = `You are a legal tutor. Based on the following user prompt, create a challenging ${complexity} question:
      User Prompt: "${userPrompt}"
      Make sure it is relevant to ${examType}, ${topic}${subTopic ? ', ' + subTopic : ''}.
      `;
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const questionResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: "You are an expert legal tutor." },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    const question = questionResponse.choices[0].message.content.trim();

    // Highlighting
    const highlightPrompt = `Question: ${question}
Please identify key sentences or phrases in the question that are crucial for answering it. For each highlighted section, explain why it's important. 
Return a JSON array of objects in the format: [{ "text": "...", "highlight": true/false, "reason": "..." }] 
Make sure to cover the entire question text in sequence, splitting it into chunks. Chunks that are not important should have "highlight": false and reason "Not crucial".
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
