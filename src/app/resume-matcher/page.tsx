'use client';

import { useState } from 'react';
import { Box, Button, Container, Typography, CircularProgress, Grid, Paper, Chip, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { CheckCircleOutline, ErrorOutline, Star, ArrowForward } from '@mui/icons-material';

interface MatchResponse {
  job: {
    category: string;
    requiredSkills: string[];
    experienceLevel: string;
    keyRequirements: string[];
    preferredQualifications: string[];
  };
  resume: {
    category: string;
    skills: string[];
    experienceYears: string;
    relevantExperience: string[];
    qualifications: string[];
  };
  match: {
    matchScore: number;
    technicalMatchScore: number;
    experienceMatchScore: number;
    qualificationsMatchScore: number;
    cultureFitScore: number;
    matchedSkills: string[];
    missingCriticalSkills: string[];
    transferableSkills: string[];
    strengthAreas: string[];
    gapAreas: string[];
    competitiveAdvantages: string[];
    developmentAreas: string[];
    fitSummary: string;
    recommendation: {
      decision: 'STRONG_MATCH' | 'POTENTIAL_MATCH' | 'NOT_RECOMMENDED';
      confidence: number;
      nextSteps: string[];
      reasoning: string[];
    };
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
            {/* Overall Score and Recommendation */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" color="primary">
                {result.match.matchScore}% Match
              </Typography>
              <Typography 
                variant="h6" 
                color={
                  result.match.recommendation.decision === 'STRONG_MATCH' 
                    ? 'success.main' 
                    : result.match.recommendation.decision === 'POTENTIAL_MATCH'
                    ? 'warning.main'
                    : 'error.main'
                }
                sx={{ mt: 1 }}
              >
                {result.match.recommendation.decision.replace('_', ' ')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Confidence: {result.match.recommendation.confidence}%
              </Typography>
            </Box>

            {/* Detailed Scores */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Detailed Scores
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant="h6" color="primary">
                      {result.match.technicalMatchScore}%
                    </Typography>
                    <Typography variant="body2">Technical Skills (40%)</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant="h6" color="primary">
                      {result.match.experienceMatchScore}%
                    </Typography>
                    <Typography variant="body2">Experience (30%)</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant="h6" color="primary">
                      {result.match.qualificationsMatchScore}%
                    </Typography>
                    <Typography variant="body2">Qualifications (20%)</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant="h6" color="primary">
                      {result.match.cultureFitScore}%
                    </Typography>
                    <Typography variant="body2">Culture Fit (10%)</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Skills Analysis */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Skills Analysis
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="success.main">
                      Matched Skills
                    </Typography>
                    <Paper sx={{ p: 1, bgcolor: 'transparent' }}>
                      {result.match.matchedSkills.map((skill, i) => (
                        <Chip 
                          key={skill} 
                          label={skill} 
                          sx={{ m: 0.5 }} 
                          color="success"
                        />
                      ))}
                    </Paper>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="error.main">
                      Missing Critical Skills
                    </Typography>
                    <Paper sx={{ p: 1, bgcolor: 'transparent' }}>
                      {result.match.missingCriticalSkills.map((skill, i) => (
                        <Chip 
                          key={skill} 
                          label={skill} 
                          sx={{ m: 0.5 }} 
                          color="error"
                        />
                      ))}
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Strengths and Gaps */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Detailed Analysis
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="success.main" gutterBottom>
                    Strength Areas
                  </Typography>
                  <List>
                    {result.match.strengthAreas.map((strength) => (
                      <ListItem key={`strength-${strength.substring(0, 20)}`}>
                        <ListItemIcon>
                          <CheckCircleOutline color="success" />
                        </ListItemIcon>
                        <ListItemText primary={strength} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="error.main" gutterBottom>
                    Areas for Development
                  </Typography>
                  <List>
                    {result.match.developmentAreas.map((area) => (
                      <ListItem key={`development-${area.substring(0, 20)}`}>
                        <ListItemIcon>
                          <ErrorOutline color="error" />
                        </ListItemIcon>
                        <ListItemText primary={area} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Box>

            {/* Competitive Advantages */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Competitive Advantages
              </Typography>
              <List>
                {result.match.competitiveAdvantages.map((advantage) => (
                  <ListItem key={`advantage-${advantage.substring(0, 20)}`}>
                    <ListItemIcon>
                      <Star color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={advantage} />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Summary and Next Steps */}
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                Summary & Recommendations
              </Typography>
              <Typography variant="body1" paragraph>
                {result.match.fitSummary}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Next Steps:
              </Typography>
              <List>
                {result.match.recommendation.nextSteps.map((step) => (
                  <ListItem key={`step-${step.substring(0, 20)}`}>
                    <ListItemIcon>
                      <ArrowForward color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={step} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        </Box>
      )}
    </Container>
  );
} 