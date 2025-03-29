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
Generate an extremely comprehensive and detailed case summary for the following case title. The summary should be as in-depth and accurate as Quimbee case briefs, and must include the following sections:

1. Rule of Law: Provide a comprehensive explanation of the general legal principles, including detailed references to relevant statutory law, landmark cases, and legal doctrines. Your explanation should be at least six sentences long to ensure a full understanding of the applicable legal framework.
2. Facts: Enumerate and elaborate on at least eight key facts or events that are crucial for understanding the case. Each fact should be clearly stated and explained in detail.
3. Issue: Analyze and describe the primary legal question(s) in at least five sentences, delving into any complexities or alternative interpretations.
4. Holding: Summarize the court's decision in three to four sentences, clearly outlining the legal outcome.
5. Reasoning: Provide an in-depth discussion of the court's rationale in at least seven sentences. Explain how legal principles, statutory interpretations, and precedents influenced the decision.
6. Dissent: If applicable, summarize any dissenting opinions in at least three sentences, highlighting the key points of disagreement. If no dissent exists, simply state "None."

Return the summary strictly in JSON format with the following keys:
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
Generate a comprehensive case summary based on the following case title. The summary should include:
1. Rule of Law: Provide a succinct explanation of the legal principles and applicable case law in at least three sentences.
2. Facts: List and explain at least five key facts or events that are crucial for understanding the case.
3. Issue: Describe the primary legal question(s) in at least three sentences.
4. Holding: Summarize the court's decision in three sentences.
5. Reasoning: Explain the court's rationale in at least four sentences.
6. Dissent: If applicable, provide a brief summary of any dissenting opinions in at least two sentences; otherwise, state "None."

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
    let attemptCount = 0;
    let parsedResponse = null;

    while (attemptCount < 10) {
      attemptCount++;

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: detailed ? 3000 : 1500,
          temperature: 0.7,
        });

        if (
          !response ||
          !response.choices ||
          !Array.isArray(response.choices) ||
          response.choices.length === 0 ||
          !response.choices[0].message
        ) {
          console.error('Invalid response structure from OpenAI:', response);
          throw new Error('Invalid OpenAI response structure.');
        }

        let rawContent = response.choices[0].message.content.trim();
        console.log('RAW GPT CONTENT =>', rawContent);

         try {
          parsedResponse = JSON.parse(rawContent);
        } catch (err) {
          console.warn('Direct JSON parse failed. Attempting substring extraction...');
          const firstCurly = rawContent.indexOf('{');
          const lastCurly = rawContent.lastIndexOf('}');
          if (firstCurly !== -1 && lastCurly !== -1) {
            const jsonSubstring = rawContent.substring(firstCurly, lastCurly + 1);
            try {
              parsedResponse = JSON.parse(jsonSubstring);
              console.log('Successfully parsed JSON substring:', jsonSubstring);
            } catch (innerErr) {
              console.error('Failed to parse JSON substring:', jsonSubstring);
              throw new Error('Could not parse JSON from GPT.');
            }
          } else {
            console.error('No JSON object found in GPT response:', rawContent);
            throw new Error('Could not parse JSON from GPT.');
          }
        }

        break;
      } catch (err) {
        console.error(`Attempt ${attemptCount} failed:`, err);
        if (attemptCount >= 10) {
          return NextResponse.json(
            { error: 'Failed to retrieve and parse a valid GPT response after 10 attempts.' },
            { status: 500 }
          );
        }
      }
    }

    const result = {
      ruleOfLaw: parsedResponse.ruleOfLaw || '',
      facts: parsedResponse.facts || '',
      issue: parsedResponse.issue || '',
      holding: parsedResponse.holding || '',
      reasoning: parsedResponse.reasoning || '',
      dissent: parsedResponse.dissent || '',
      verified: false,
    };

    console.log('FINAL PARSED RESULT =>', result);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('Error in /api/casebrief-detailed:', err);
    return NextResponse.json({ error: 'Error summarizing case.' }, { status: 500 });
  }
}