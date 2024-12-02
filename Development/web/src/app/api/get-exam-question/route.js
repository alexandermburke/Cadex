// /app/api/get-exam-question/route.js

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    // Parse the JSON body from the request
    const { examType, difficulty, lawType, selectedQuestionTypes } = await request.json();

    // Validate input parameters
    if (!examType || !difficulty) {
      console.warn('Incomplete exam configuration received:', { examType, difficulty });
      return NextResponse.json(
        { error: 'Incomplete exam configuration. Please provide examType and difficulty.' },
        { status: 400 }
      );
    }

    // Mapping difficulty levels to detailed descriptions
    const difficultyDetails = {
      // LSAT difficulty mapping
      'Below 150': 'basic understanding with straightforward scenarios, purpose is to generate a below 150 LSAT equivalent score',
      '150-160': 'intermediate understanding with moderate complexity, purpose is to generate a 150 to 160 LSAT equivalent score',
      '160-170': 'advanced understanding with complex and nuanced scenarios, purpose is to generate a 160 to 170 LSAT equivalent score',
      '175+': 'expert-level understanding with extremely complex and nuanced scenarios, purpose is to generate a 175 or higher LSAT equivalent score',
      // BAR difficulty mapping
      'Below Average': 'basic proficiency with fundamental concepts',
      'Average': 'solid proficiency with moderately challenging concepts',
      'Above Average': 'high proficiency with complex and challenging concepts',
      'Expert': 'very high proficiency with complex and extremely challenging concepts',
      // MPRE difficulty mapping
      'Basic': 'basic ethical understanding with simple scenarios',
      'Intermediate': 'intermediate ethical understanding with moderate complexity',
      'Advanced': 'advanced ethical understanding with complex and nuanced scenarios',
    };

    const difficultyDescription = difficultyDetails[difficulty] || difficulty;

    // Build the question types description for the prompt
    let questionTypesDescription = '';
    if (Array.isArray(selectedQuestionTypes) && selectedQuestionTypes.length > 0) {
      questionTypesDescription = '- Question Focus: The question should be of the following type(s):\n';
      selectedQuestionTypes.forEach((type) => {
        questionTypesDescription += `  - ${type}\n`;
      });
    }

    let prompt = '';

    if (examType === 'LSAT') {
      // Decide whether to generate a multiple-choice or analytical reasoning question (50/50 chance)
      const isMultipleChoice = Math.random() < 0.5;

      if (isMultipleChoice) {
        // LSAT Logical Reasoning multiple-choice prompt
        prompt = `You are an expert question writer for the LSAT. Create a multiple-choice question that matches the style and format of a real LSAT Logical Reasoning question.

- Difficulty Level: ${difficultyDescription}. The question should reflect the difficulty expected for a student aiming for a score of ${difficulty} on the LSAT.
${questionTypesDescription ? questionTypesDescription : ''}
- Content Focus: The question should involve logical reasoning, analyzing arguments, identifying assumptions, or drawing conclusions, without any legal content.
- Style Guidelines:
  - Include a stimulus (a short passage) followed by a question stem.
  - Provide five answer choices labeled (A), (B), (C), (D), (E).
  - Each answer choice should start on a new line and be plausible to avoid obvious elimination.
  - Use clear and precise language appropriate for the LSAT.
  - Do not include any introductory explanations or answers.
  - Do not use any asterisks or markdown formatting in the question.

Please provide only the question text, including the stimulus, question stem, and answer choices, without any additional comments or answers.`;
      } else {
        // LSAT Analytical Reasoning (Logic Games) prompt
        prompt = `You are an expert question writer for the LSAT. Create an Analytical Reasoning (Logic Games) question that matches the style and format of a real LSAT question.

- Difficulty Level: ${difficultyDescription}. The question should reflect the difficulty expected for a student aiming for a score of ${difficulty} on the LSAT.
${questionTypesDescription ? questionTypesDescription : ''}
- Content Focus: Present a scenario followed by a set of conditions or rules, then pose a question based on that setup.
- Style Guidelines:
  - The scenario and rules should be clear and concise but sufficiently complex.
  - Provide one question related to the scenario with five answer choices labeled (A), (B), (C), (D), (E).
  - Each answer choice should start on a new line.
  - Use standard LSAT formatting and language conventions.
  - Do not include any introductory explanations or answers.
  - Do not use any asterisks or markdown formatting in the question.

Please provide only the question text, including the scenario, rules, question stem, and answer choices, without any additional comments or answers.`;
      }
    } else {
      // General prompt for other exams
      if (!lawType) {
        console.warn('Law type is missing for non-LSAT exam.');
        return NextResponse.json(
          { error: 'Incomplete exam configuration. Please provide lawType for non-LSAT exams.' },
          { status: 400 }
        );
      }

      prompt = `You are an expert question writer for the ${examType}. Create a ${lawType} question that matches the style and format of a real ${examType} question.

- Difficulty Level: ${difficultyDescription}. The question should reflect the difficulty expected for a student aiming for a score of ${difficulty} on the ${examType}.
- Question Type: Ensure the question adheres to the types commonly found on the ${examType}, such as essay questions or multiple-choice questions.
${questionTypesDescription ? questionTypesDescription : ''}
- Content Focus: Specifically address key concepts and complexities within ${lawType}, including relevant subtopics or typical scenarios.
- Style Guidelines:
  - Use clear and precise language appropriate for the ${examType}.
  - The question should be well-structured and adhere to the exam's standards.
  - For multiple-choice questions, provide four or five answer choices labeled (A), (B), (C), (D), (E).
  - Each answer choice should start on a new line.
  - For essay questions, present a detailed fact pattern that requires analysis.
  - Do not include any introductory explanations or answers.
  - Do not use any asterisks or markdown formatting in the question.

Please provide only the question text, including any necessary scenario, question stem, and answer choices if applicable, without any additional comments or answers.`;
    }

    // Initialize OpenAI API client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your environment variables
    });

    // Make the API request to OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 700, // Adjust as needed
      temperature: 0.7, // Adjust as needed
    });

    // Validate the structure of the response
    if (
      !response ||
      !response.choices ||
      !Array.isArray(response.choices) ||
      response.choices.length === 0 ||
      !response.choices[0].message ||
      !response.choices[0].message.content
    ) {
      console.error('Unexpected response structure from OpenAI:', response);
      throw new Error('Unexpected response structure from OpenAI.');
    }

    const question = response.choices[0].message.content.trim();

    // Check if a question was generated
    if (!question) {
      console.error('OpenAI did not return any question.');
      throw new Error('No question generated by the AI.');
    }

    // Return the generated question
    return NextResponse.json({ question }, { status: 200 });
  } catch (error) {
    console.error('Error generating exam question:', error);

    // Return an error response
    return NextResponse.json(
      { error: 'An error occurred while generating the exam question.' },
      { status: 500 }
    );
  }
}
