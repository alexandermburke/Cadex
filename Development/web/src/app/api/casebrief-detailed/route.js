import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  console.log('Received request to /api/casebrief-detailed');
  try {
    const { title, detailed } = await request.json();
    if (!title || typeof title !== 'string' || !title.trim()) {
      console.warn('Invalid or missing "title" in request body.');
      return NextResponse.json(
        { error: 'Invalid or missing "title" in request body.' },
        { status: 400 }
      );
    }
    const inputTitle = title.trim();
    console.log(`Generating ${detailed ? 'detailed' : 'brief'} summary for: "${inputTitle}"`);
    
    let prompt;
    if (detailed) {
      prompt = `
Generate a very detailed case summary based on the following case title. The summary should include:
1. Rule of Law: Provide at least four sentences explaining the general legal principles, including relevant statutory or case law.
2. Facts: List at least three key facts or events that are crucial to understanding the case.
3. Issue: Describe the primary legal question(s) in at least two sentences, ideally more
4. Holding: Summarize the court's decision in one to two sentences.
5. Reasoning: Explain the rationale behind the decision in detail, using at least three sentences.
6. Dissent: If applicable, provide a brief summary of any dissenting opinions in at least one sentence; otherwise state "None."

Return the summary in JSON format with the keys:
{
  "ruleOfLaw": "",
  "facts": "",
  "issue": "",
  "holding": "",
  "reasoning": "",
  "dissent": ""
}
Do not include any additional text.
Case Title:
"${inputTitle}"
      `;
    } else {
      prompt = `
Generate a brief case summary based on the following case title. The summary should include:
1. Rule of Law
2. Facts
3. Issue
4. Holding
5. Reasoning
6. Dissent (if any)
Return the summary in JSON format with the keys:
{
  "ruleOfLaw": "",
  "facts": "",
  "issue": "",
  "holding": "",
  "reasoning": "",
  "dissent": ""
}
Do not include any additional text.
Case Title:
"${inputTitle}"
      `;
    }

    const messages = [
      {
        role: 'system',
        content: `You are an expert legal summarizer. Generate a ${detailed ? 'detailed' : 'brief'} case summary in JSON format.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: detailed ? 2000 : 1500,
      temperature: 0.7,
    });

    if (!response || !response.choices || !Array.isArray(response.choices) || response.choices.length === 0 || !response.choices[0].message) {
      console.error('Invalid response structure from OpenAI:', response);
      throw new Error('Invalid OpenAI response structure.');
    }

    let rawContent = response.choices[0].message.content.trim();
    console.log('RAW GPT CONTENT =>', rawContent);

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (err) {
      console.warn('Direct JSON parse failed. Attempting substring extraction...');
      const firstCurly = rawContent.indexOf('{');
      const lastCurly = rawContent.lastIndexOf('}');
      if (firstCurly !== -1 && lastCurly !== -1) {
        const jsonSubstring = rawContent.substring(firstCurly, lastCurly + 1);
        try {
          parsed = JSON.parse(jsonSubstring);
          console.log('Successfully parsed JSON substring:', jsonSubstring);
        } catch (innerErr) {
          console.error('Failed to parse JSON substring:', jsonSubstring);
          return NextResponse.json({ error: 'Could not parse JSON from GPT.' }, { status: 500 });
        }
      } else {
        console.error('No JSON object found in GPT response:', rawContent);
        return NextResponse.json({ error: 'Could not parse JSON from GPT.' }, { status: 500 });
      }
    }

    const result = {
      ruleOfLaw: parsed.ruleOfLaw || '',
      facts: parsed.facts || '',
      issue: parsed.issue || '',
      holding: parsed.holding || '',
      reasoning: parsed.reasoning || '',
      dissent: parsed.dissent || '',
      verified: false
    };

    console.log('FINAL PARSED RESULT =>', result);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('Error in /api/casebrief-detailed:', err);
    return NextResponse.json({ error: 'Error summarizing case.' }, { status: 500 });
  }
}
