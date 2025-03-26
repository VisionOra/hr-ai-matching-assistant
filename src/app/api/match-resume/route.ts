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
      temperature: 0,  // Ensure deterministic outputs
      modelName: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      openAIApiKey: process.env.OPENAI_API_KEY,
      maxTokens: 2000,  // Ensure sufficient response length
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
    You are an expert ATS (Applicant Tracking System) and AI-powered career matching specialist.
    Your task is to provide CONSISTENT and DETERMINISTIC analysis of the job description and resume.
    Follow these scoring rules STRICTLY:

    Scoring System (Must follow exactly):
    1. Technical Skills Scoring (40% of total):
       - Each matched technical skill: +5 points
       - Each related/transferable skill: +2 points
       - Perfect technical stack match: +10 bonus points
       - Score = (total points / maximum possible points) * 40

    2. Experience Scoring (30% of total):
       - Years of experience match: 0-15 points
         * Exceeds required: 15 points
         * Meets required: 12 points
         * Within 1 year under: 8 points
         * Within 2 years under: 4 points
         * More than 2 years under: 0 points
       - Role relevancy: 0-10 points
       - Industry match: 0-5 points
       Score = (total points / 30) * 30

    3. Qualifications Scoring (20% of total):
       - Education level match: 0-10 points
       - Certifications match: 0-5 points
       - Domain expertise: 0-5 points
       Score = (total points / 20) * 20

    4. Soft Skills & Culture Scoring (10% of total):
       - Leadership alignment: 0-4 points
       - Team collaboration: 0-3 points
       - Communication indicators: 0-3 points
       Score = (total points / 10) * 10

    Final Score Calculations:
    - Overall Match Score = Sum of all category scores
    - Round all scores to nearest integer
    - Confidence Score must be between 70-100 based on data quality

    Decision Rules:
    - STRONG_MATCH: Overall score ≥ 80
    - POTENTIAL_MATCH: Overall score 60-79
    - NOT_RECOMMENDED: Overall score < 60

    Provide output in the following JSON structure:
    ${JSON.stringify({
      job: {
        category: "Precise job category",
        requiredSkills: ["Prioritized list of required skills"],
        experienceLevel: "Required years and level",
        keyRequirements: ["Critical job requirements"],
        preferredQualifications: ["Nice-to-have qualifications"]
      },
      resume: {
        category: "Candidate's professional category",
        skills: ["All identified skills"],
        experienceYears: "Total relevant years",
        relevantExperience: ["Key relevant experiences"],
        qualifications: ["Education and certifications"]
      },
      match: {
        matchScore: "Overall score (0-100)",
        technicalMatchScore: "Technical skills score (0-40)",
        experienceMatchScore: "Experience match score (0-30)",
        qualificationsMatchScore: "Qualifications match score (0-20)",
        cultureFitScore: "Soft skills and culture score (0-10)",
        matchedSkills: ["Skills present in both"],
        missingCriticalSkills: ["Required skills not found"],
        transferableSkills: ["Related skills that could apply"],
        strengthAreas: ["Detailed points of strong alignment"],
        gapAreas: ["Specific gaps in requirements"],
        competitiveAdvantages: ["Unique strengths that set candidate apart"],
        developmentAreas: ["Specific skills or qualifications to acquire"],
        fitSummary: "Detailed paragraph analyzing overall fit",
        recommendation: {
          decision: "STRONG_MATCH | POTENTIAL_MATCH | NOT_RECOMMENDED",
          confidence: "Confidence level (70-100)",
          nextSteps: ["Specific recommended actions"],
          reasoning: ["Key factors influencing decision"]
        }
      }
    }, null, 2)}

    Analysis Requirements:
    1. Use exact text matching for skills (case-insensitive)
    2. Count only explicitly mentioned skills and qualifications
    3. Use specific examples from the resume/job description in all feedback
    4. Provide only fact-based, evidence-supported analysis
    5. Follow the scoring system exactly as specified
    6. Ensure scores add up correctly
    7. Be consistent in skill identification across analyses

    Job Description:
    ${jobText}

    Resume:
    ${resumeText}

    Remember: Your analysis must be DETERMINISTIC - the same inputs should always produce the same outputs.
    Follow the scoring rules EXACTLY as specified above.
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