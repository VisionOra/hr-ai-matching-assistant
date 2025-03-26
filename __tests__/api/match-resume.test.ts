import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/match-resume';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';

jest.mock('langchain/chat_models/openai');
jest.mock('langchain/document_loaders/fs/pdf');

describe('Match Resume API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Method not allowed',
    });
  });

  it('processes resume and job description successfully', async () => {
    const mockResumeContent = 'Mock resume content';
    const mockJobContent = 'Mock job description content';

    // Mock PDF loader
    (PDFLoader as jest.Mock).mockImplementation(() => ({
      load: () => Promise.resolve({ pageContent: mockResumeContent }),
    }));

    // Mock ChatOpenAI responses
    (ChatOpenAI as jest.Mock).mockImplementation(() => ({
      call: jest.fn()
        .mockResolvedValueOnce('Software Engineer') // Job category
        .mockResolvedValueOnce('Full Stack Developer') // Resume category
        .mockResolvedValueOnce(JSON.stringify({ // Match result
          matchScore: 85,
          matchedSkills: ['JavaScript', 'React', 'Node.js'],
          analysis: 'Good match for the position',
        })),
    }));

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        resume: new File([mockResumeContent], 'resume.pdf', { type: 'application/pdf' }),
        jobDescription: new File([mockJobContent], 'job.pdf', { type: 'application/pdf' }),
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = JSON.parse(res._getData());
    expect(responseData).toEqual({
      jobCategory: 'Software Engineer',
      resumeCategory: 'Full Stack Developer',
      matchScore: 85,
      matchedSkills: ['JavaScript', 'React', 'Node.js'],
      analysis: 'Good match for the position',
    });
  });

  it('handles errors properly', async () => {
    (PDFLoader as jest.Mock).mockImplementation(() => {
      throw new Error('PDF processing error');
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        resume: new File(['content'], 'resume.pdf', { type: 'application/pdf' }),
        jobDescription: new File(['content'], 'job.pdf', { type: 'application/pdf' }),
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Internal server error',
    });
  });
}); 