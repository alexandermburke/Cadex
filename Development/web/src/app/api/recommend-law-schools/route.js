import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
    try {
        const { accuracy } = await request.json();

        const prompt = `
You are a knowledgeable assistant. The user has a certain accuracy score on their exam simulation. Based on their accuracy, recommend exactly 3 ABA-accredited law schools in North America. If accuracy is very high (>=80%), recommend top-tier schools. If accuracy is medium (>=60% but <80%), recommend well-regarded schools. If accuracy is <60%, recommend more accessible but reputable schools.

For each recommended school, add:
- "name": the school's name
- "notes": either "(Optimistic)" if it's more competitive or "(More Likely)" if it aligns better with their score
- "brief": a short paragraph describing key benefits of attending that school, prioritize including a typical GPA & LSAT acceptance scores, notable program strengths, and any unique opportunities (e.g., clinics, networking, externships).

Return only a JSON array like:
[
  {
    "name": "Harvard Law School",
    "notes": "(Optimistic)",
    "brief": "Typically admits with LSAT ~173 and GPA ~3.9. Offers extensive clinics, strong alumni network, and international opportunities."
  }
]

The user's accuracy is: ${accuracy}%
`;

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant that only returns the JSON as requested.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 800,
            temperature: 0.7,
        });

        if (!response || !response.choices || response.choices.length === 0) {
            throw new Error('No response from OpenAI.');
        }

        let responseText = response.choices[0].message.content.trim();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            // Fallback if parsing fails
            data = [
                {
                    name: 'Arizona State University (ASU) Law',
                    notes: '(More Likely)',
                    brief: 'Admits students with LSAT ~160-164 and GPA ~3.5-3.7. Strong clinical programs, extensive externships in Phoenix, and good job placement in the Southwest.'
                },
                {
                    name: 'University of Arizona Law',
                    notes: '(More Likely)',
                    brief: 'Typical LSAT ~160 and GPA ~3.5. Known for its Indigenous Law and environmental law programs, hands-on clinics, and supportive faculty.'
                },
                {
                    name: 'Temple University Law',
                    notes: '(Optimistic)',
                    brief: 'Median LSAT ~160 and GPA ~3.5. Excellent trial advocacy programs, urban setting with strong networking, and diverse experiential learning opportunities.'
                }
            ];
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error recommending law schools:', error);
        return NextResponse.json({ error: 'Failed to recommend schools' }, { status: 500 });
    }
}
