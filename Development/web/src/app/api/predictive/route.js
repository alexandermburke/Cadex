// /app/api/predictive/route.js
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { inputData } = await request.json();

        if (!inputData) {
            return NextResponse.json({ error: 'No input data provided.' }, { status: 400 });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Define the prompt for the AI
        const prompt = `
You are a legal analyst specializing in predictive analytics for legal outcomes. Based on the following input data, provide a prediction regarding potential legal risks or outcomes. Additionally, generate chart data and options suitable for rendering with Chart.js.

Important Instructions:
- Output **only** the JSON object and nothing else.
- Do **not** include comments or any text outside the JSON object.
- Ensure that "chartData" includes both "labels" and a "datasets" array with at least one dataset.
- If there is insufficient data for analysis, set "predictionResult" to an appropriate message, and set "chartData" and "chartOptions" to **null**.
- Ensure the JSON is **valid** and can be parsed using **JSON.parse()**.

The JSON format should be:

{
  "predictionResult": "Your prediction text here.",
  "chartData": {
    "labels": ["Label1", "Label2", "Label3"],
    "datasets": [
      {
        "label": "Dataset Label",
        "data": [value1, value2, value3],
        "backgroundColor": ["color1", "color2", "color3"],
        "borderColor": ["color1", "color2", "color3"],
        "borderWidth": 1
      }
    ]
  },
  "chartOptions": {
    // Chart.js options object
  }
}

Input Data:
"""
${inputData}
"""
`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: prompt },
            ],
            max_tokens: 1000,
            temperature: 0.7,
        });

        // Extract the assistant's message
        const assistantMessage = response.choices?.[0]?.message?.content.trim();

        // Log the assistant's message for debugging
        console.log('Assistant Message:', assistantMessage);

        // Use regex to extract JSON from the assistant's message
        const jsonStringMatch = assistantMessage.match(/\{[\s\S]*\}/);

        if (!jsonStringMatch) {
            console.error('No JSON object found in the assistant\'s response.');
            return NextResponse.json(
                { error: 'No JSON object found in the assistant\'s response.' },
                { status: 500 }
            );
        }

        const jsonString = jsonStringMatch[0];

        // Parse the assistant's message as JSON
        let result;
        try {
            result = JSON.parse(jsonString);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            return NextResponse.json(
                { error: 'Failed to parse AI response as JSON.', details: parseError.message },
                { status: 500 }
            );
        }

        const { predictionResult, chartData, chartOptions } = result;

        return NextResponse.json({ predictionResult, chartData, chartOptions }, { status: 200 });
    } catch (error) {
        console.error('Error during OpenAI API call:', error.response?.data || error.message);
        return NextResponse.json(
            { error: 'Failed to process prediction', details: error.message },
            { status: 500 }
        );
    }
}
