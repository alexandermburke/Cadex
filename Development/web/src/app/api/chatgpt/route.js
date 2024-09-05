import OpenAI from 'openai';

export const POST = async (req) => {
  try {
    const body = await req.json();
    const { inputText } = body;

    if (!inputText) {
      return new Response(JSON.stringify({ message: 'No input text provided' }), { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a legal assistant.' },
        { role: 'user', content: `Analyze this legal text: ${inputText}` },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const analysis = response.choices?.[0]?.message?.content || "No analysis available.";

    return new Response(JSON.stringify({ analysis }), { status: 200 });
  } catch (error) {
    console.error('Error during OpenAI API call:', error.response ? error.response.data : error.message);
    return new Response(JSON.stringify({ error: 'Failed to process analysis', details: error.message }), { status: 500 });
  }
};
