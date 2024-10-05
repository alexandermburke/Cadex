import { Configuration, OpenAIApi } from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { caseDescription, category, skillLevel } = req.body;

  if (!caseDescription || !category || !skillLevel) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  try {
    const prompt = `Create a legal case brief for a ${skillLevel.toLowerCase()} level case in ${category.toLowerCase()} law. Description: ${caseDescription}`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a legal expert.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const brief = completion.data.choices[0].message.content.trim();

    res.status(200).json({ brief });
  } catch (error) {
    console.error('Error generating brief:', error);
    res.status(500).json({ error: 'Failed to generate brief' });
  }
}
