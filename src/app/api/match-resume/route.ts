import { NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { extractTextFromPDF } from './pdf-utils';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import type { BaseMessage } from '@langchain/core/messages';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get('resume') as File;
    const jobDescFile = formData.get('jobDescription') as File;

    if (!resumeFile || !jobDescFile) {
      return NextResponse.json(
        { error: 'Missing required files' },
        { status: 400 }
      );
    }

    // Initialize LangChain components
    const model = new ChatOpenAI({
      temperature: 0,
      modelName: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Load and process files
    let resumeText: string;
    let jobText: string;
    try {
      const resumeBuffer = await resumeFile.arrayBuffer();
      const jobBuffer = await jobDescFile.arrayBuffer();
      
      resumeText = await extractTextFromPDF(resumeBuffer);
      jobText = await extractTextFromPDF(jobBuffer);
      
      if (!resumeText || !jobText) {
        throw new Error('Failed to extract text from PDF files');
      }
    } catch (error) {
      console.error('Error processing PDF files:', error);
      return NextResponse.json(
        { error: 'Failed to process PDF files. Please ensure they are valid PDF documents.' },
        { status: 400 }
      );
    }

    // Comprehensive analysis in a single call
    const analysisResult = await model.invoke([
      new HumanMessage(`
    You are an expert career coach and hiring advisor. Analyze the provided job description and resume,
    then produce a comprehensive analysis in a well-structured JSON object with the following format:

    {
      "job": {
        "category": "job category name",
        "requiredSkills": ["list", "of", "required", "skills"],
        "experienceLevel": "experience level required"
      },
      "resume": {
        "category": "professional category",
        "skills": ["list", "of", "candidate", "skills"],
        "experienceYears": number of years of experience
      },
      "match": {
        "matchScore": number between 0-100 indicating overall match percentage,
        "matchedSkills": ["list of skills that appear in both profiles"],
        "missingSkills": ["required skills missing from candidate profile"],
        "strongPoints": ["bullet points of candidate strengths"],
        "weakPoints": ["bullet points of candidate weaknesses"],
        "techSimilarityPercent": number between 0-100 for technical skills match,
        "fitInsight": "detailed paragraph about candidate suitability",
        "finalRecommendation": "Yes" or "No" based on overall fit,
        "reasoning": "explanation of the recommendation"
      }
    }

    Job Description:
    ${jobText}

    Resume:
    ${resumeText}

    Guidelines for analysis:
    1. Be thorough in identifying required skills from the job description
    2. Carefully match candidate skills against requirements
    3. Consider both technical skills and experience level
    4. Provide specific, actionable insights in strongPoints and weakPoints
    5. Make a clear recommendation based on overall fit
    6. Ensure all percentage scores are integers
    7. Keep the fitInsight and reasoning concise but informative

    Return only the JSON object, no additional commentary.
    `)
    ]);

    try {
      const getContent = (result: BaseMessage | string): string => {
        if (typeof result === 'string') {
          return result;
        }
        if (result instanceof AIMessage) {
          return String(result.content);
        }
        return JSON.stringify(result);
      };

      const analysis = JSON.parse(getContent(analysisResult));
      return NextResponse.json(analysis);
    } catch (error) {
      console.error('Error parsing results:', error);
      return NextResponse.json(
        { error: 'Failed to analyze the documents' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 