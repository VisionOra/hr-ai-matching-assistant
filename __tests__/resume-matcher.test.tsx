import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResumeMatcherPage from '../pages/resume-matcher';
import '@testing-library/jest-dom';

describe('ResumeMatcherPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the upload form correctly', () => {
    render(<ResumeMatcherPage />);
    
    expect(screen.getByText('Resume Job Matcher')).toBeInTheDocument();
    expect(screen.getByText('Upload Resume (PDF)')).toBeInTheDocument();
    expect(screen.getByText('Upload Job Description (PDF)')).toBeInTheDocument();
    expect(screen.getByText('Analyze Match')).toBeInTheDocument();
  });

  it('handles file uploads correctly', () => {
    render(<ResumeMatcherPage />);
    
    const resumeInput = screen.getByLabelText(/Upload Resume/i);
    const jobDescInput = screen.getByLabelText(/Upload Job Description/i);
    
    const resumeFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
    const jobFile = new File(['job description content'], 'job.pdf', { type: 'application/pdf' });
    
    fireEvent.change(resumeInput, { target: { files: [resumeFile] } });
    fireEvent.change(jobDescInput, { target: { files: [jobFile] } });
    
    expect(resumeInput.files[0]).toBe(resumeFile);
    expect(jobDescInput.files[0]).toBe(jobFile);
  });

  it('submits form and displays results', async () => {
    const mockResponse = {
      jobCategory: 'Software Development',
      resumeCategory: 'Full Stack Developer',
      matchScore: 85,
      matchedSkills: ['JavaScript', 'React', 'Node.js'],
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockResponse),
      })
    ) as jest.Mock;

    render(<ResumeMatcherPage />);
    
    const resumeFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
    const jobFile = new File(['job description content'], 'job.pdf', { type: 'application/pdf' });
    
    fireEvent.change(screen.getByLabelText(/Upload Resume/i), { 
      target: { files: [resumeFile] } 
    });
    fireEvent.change(screen.getByLabelText(/Upload Job Description/i), { 
      target: { files: [jobFile] } 
    });
    
    fireEvent.click(screen.getByText('Analyze Match'));

    await waitFor(() => {
      expect(screen.getByText(`Job Category: ${mockResponse.jobCategory}`)).toBeInTheDocument();
      expect(screen.getByText(`Resume Category: ${mockResponse.resumeCategory}`)).toBeInTheDocument();
      expect(screen.getByText(`Match Score: ${mockResponse.matchScore}%`)).toBeInTheDocument();
      expect(screen.getByText(`Matched Skills: ${mockResponse.matchedSkills.join(', ')}`)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API Error'))
    ) as jest.Mock;

    render(<ResumeMatcherPage />);
    
    const resumeFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
    const jobFile = new File(['job description content'], 'job.pdf', { type: 'application/pdf' });
    
    fireEvent.change(screen.getByLabelText(/Upload Resume/i), { 
      target: { files: [resumeFile] } 
    });
    fireEvent.change(screen.getByLabelText(/Upload Job Description/i), { 
      target: { files: [jobFile] } 
    });
    
    fireEvent.click(screen.getByText('Analyze Match'));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });
}); 