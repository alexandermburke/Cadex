import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    const { examType, topic, subTopic, complexity, userPrompt } = await request.json();

    let prompt = `You are a legal tutor. Provide a challenging ${complexity} ${examType} question on ${topic}${subTopic ? ' subtopic: ' + subTopic : ''}. The question should be suitable for a tutoring session. Do not include any acknowledgements like "Sure, here's a...". Just provide the question itself.`;

    if (userPrompt && userPrompt.trim().length > 0) {
      prompt = `You are a legal tutor. Based on the following user prompt, create a challenging ${complexity} question:
User Prompt: "${userPrompt}"
Make sure it is relevant to ${examType}, ${topic}${subTopic ? ', ' + subTopic : ''}.
Do not include any filler acknowledgements. Only provide the question itself.`;
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Generate the question
    const questionResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: "You are a helpful legal tutoring assistant. Do not respond with 'Sure, here's...'. Only output the requested question text." 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    const question = questionResponse.choices[0].message.content.trim();

    // Highlighting
    const highlightPrompt = `Question: ${question}
Please identify key sentences or phrases in the question that are crucial for answering it. For each highlighted section, explain why it's important.
Return a JSON array of objects in the exact format: [{"text": "...", "highlight": true/false, "reason": "..."}].
Make sure to cover the entire question text in sequence, splitting it into chunks. Chunks that are not important should have "highlight": false and reason "Not crucial".
Do not say "Sure, here's..." or add any extra explanations. Only provide the JSON array.`;

    const highlightResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: "You are a text analyst. Do not output acknowledgements or extra text, only the requested JSON array." 
        },
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
