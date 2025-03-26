'use client';

import { useState } from 'react';
import { Box, Button, Container, Typography, CircularProgress } from '@mui/material';

interface MatchResponse {
  job: {
    category: string;
    requiredSkills: string[];
    experienceLevel: string;
  };
  resume: {
    category: string;
    skills: string[];
    experienceYears: number;
  };
  match: {
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    strongPoints: string[];
    weakPoints: string[];
    techSimilarityPercent: number;
    fitInsight: string;
    finalRecommendation: "Yes" | "No";
    reasoning: string;
  };
}

export default function ResumeMatcherPage() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume || !jobDescription) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await fetch('/api/match-resume', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to process files');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to process files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Resume Job Matcher
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Upload Resume (PDF)</Typography>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setResume(e.target.files?.[0] || null)}
            style={{ width: '100%', marginTop: '8px' }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Upload Job Description (PDF)</Typography>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setJobDescription(e.target.files?.[0] || null)}
            style={{ width: '100%', marginTop: '8px' }}
          />
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Button 
          variant="contained" 
          type="submit"
          disabled={!resume || !jobDescription || loading}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Analyze Match'}
        </Button>
      </Box>

      {result && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>Results</Typography>
          
          {/* Job Description Analysis */}
          <Box sx={{ mb: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Job Description Analysis
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Category:</strong> {result.job.category}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Required Skills:</strong> {result.job.requiredSkills.join(', ')}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Experience Level:</strong> {result.job.experienceLevel}
            </Typography>
          </Box>

          {/* Resume Analysis */}
          <Box sx={{ mb: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Candidate Resume Analysis
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Professional Category:</strong> {result.resume.category}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Skills:</strong> {result.resume.skills.join(', ')}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Years of Experience:</strong> {result.resume.experienceYears}
            </Typography>
          </Box>

          {/* Match Results */}
          <Box sx={{ p: 3, bgcolor: '#e3f2fd', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Match Analysis
            </Typography>
            
            {/* Overall Match Score */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" color="primary">
                {result.match.matchScore}% Overall Match
              </Typography>
              <Typography variant="h6" color={result.match.finalRecommendation === "Yes" ? "success.main" : "error.main"}>
                {result.match.finalRecommendation === "Yes" ? "Recommended" : "Not Recommended"}
              </Typography>
            </Box>

            {/* Technical Match */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {result.match.techSimilarityPercent}%
              </Typography>
              <Typography variant="body2">Technical Skills Match</Typography>
            </Box>

            {/* Skills Analysis */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Skills Analysis
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="success.main" gutterBottom>
                  <strong>Matched Skills:</strong>
                </Typography>
                <Typography variant="body2">
                  {result.match.matchedSkills.join(', ')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="error.main" gutterBottom>
                  <strong>Missing Skills:</strong>
                </Typography>
                <Typography variant="body2">
                  {result.match.missingSkills.join(', ')}
                </Typography>
              </Box>
            </Box>

            {/* Strengths and Weaknesses */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Strengths & Weaknesses
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="success.main" gutterBottom>
                  <strong>Strong Points:</strong>
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {result.match.strongPoints.map((point, index) => (
                    <li key={index}><Typography variant="body2">{point}</Typography></li>
                  ))}
                </ul>
              </Box>
              <Box>
                <Typography variant="body2" color="error.main" gutterBottom>
                  <strong>Areas for Improvement:</strong>
                </Typography>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {result.match.weakPoints.map((point, index) => (
                    <li key={index}><Typography variant="body2">{point}</Typography></li>
                  ))}
                </ul>
              </Box>
            </Box>

            {/* Detailed Analysis */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Detailed Analysis
              </Typography>
              <Typography variant="body2" paragraph>
                {result.match.fitInsight}
              </Typography>
              <Typography variant="body2">
                <strong>Final Assessment:</strong> {result.match.reasoning}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Container>
  );
} 