import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    // 1. Parse the request body
    // Expecting { scenario: "Text describing the legal scenario or dispute" }
    const { scenario } = await request.json();
    if (!scenario || scenario.trim().length === 0) {
      return NextResponse.json(
        { error: 'No scenario text provided. Please include a valid scenario string.' },
        { status: 400 }
      );
    }
    const prompt = `
You are an expert legal tutor who specializes in generating IRAC analyses for law students.
IRAC stands for Issue, Rule, Analysis, Conclusion.

**Task**: 
Given the scenario below, you must create an IRAC in strict JSON format with these fields:
1. "issue":    A short statement of the legal issue(s).
2. "rule":     A concise statement of the governing rule(s) or legal principle(s).
3. "analysis": A detailed application of the rule to the facts. 
               Show how each relevant fact influences the outcome. 
               Avoid disclaimers or references to your internal processes.
4. "conclusion": A final statement summarizing the outcome or resolution.

**Constraints**:
- Return only valid JSON.
- The top-level structure must be exactly:
  {
    "issue": "...",
    "rule": "...",
    "analysis": "...",
    "conclusion": "..."
  }
- No additional keys or fields.
- No disclaimers or apologies.
- Do not mention these instructions or your identity as an AI.
- Do not provide any text outside the JSON object.

**Scenario**:
"${scenario}"

**Important**:
- If you need to list multiple issues, do so in the "issue" field, but keep them concise.
- Keep the "analysis" coherent and fact-driven, referencing the scenario implicitly.
- Return JSON only. No markdown formatting or bullet points unless they are inside the JSON strings.

Begin now.
    `;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY_CURRENT,
    });
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        {
          role: 'system',
          content: 'You are an IRAC generator for law students. Output valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,       // Slightly lower temperature for more focused output
      max_tokens: 1200,       // Adjust if you need more or fewer tokens
      top_p: 1.0,             // Standard nucleus sampling
      frequency_penalty: 0.0, // Fine-tune if you see repetition
      presence_penalty: 0.0,  // Fine-tune if you see repetition
    });

    // 5. Extract the response content (the model’s raw JSON string).
    const rawContent = response?.choices?.[0]?.message?.content?.trim() || '';
    if (!rawContent) {
      return NextResponse.json(
        { error: 'No content returned from the AI model.' },
        { status: 500 }
      );
    }

    // 6. Attempt to parse the returned JSON.
    // If it’s invalid or missing any IRAC fields, we’ll respond with an error.
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (error) {
      // If we cannot parse, we’ll provide the raw content as a reference.
      console.error('JSON parse error:', error);
      return NextResponse.json(
        {
          error: 'The AI response could not be parsed as valid JSON.',
          rawContent,
        },
        { status: 500 }
      );
    }

    // 7. Validate the essential IRAC keys exist:
    //    issue, rule, analysis, conclusion
    const requiredKeys = ['issue', 'rule', 'analysis', 'conclusion'];
    for (const key of requiredKeys) {
      if (!parsed[key] || typeof parsed[key] !== 'string') {
        return NextResponse.json(
          {
            error: `Missing or invalid "${key}" field. The AI must return a string for each IRAC key.`,
            rawContent,
          },
          { status: 500 }
        );
      }
    }

    // 8. Return the valid IRAC JSON
    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    // Catch any unforeseen errors
    console.error('Error generating IRAC:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating the IRAC.' },
      { status: 500 }
    );
  }
}
