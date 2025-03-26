# Resume Job Matcher

A modern web application that uses AI to match resumes with job descriptions, providing detailed analysis and compatibility scores.

## Quick Setup - OpenAI Configuration

1. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create `.env.local` in the project root:
```env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```
3. Restart the application if it's running

> **Note**: The application uses GPT-3.5 Turbo by default. Make sure you have sufficient API credits.

## Features

- 📄 PDF Upload Support for both resumes and job descriptions
- 🤖 AI-powered analysis using GPT-3.5 Turbo
- 📊 Comprehensive matching analysis including:
  - Overall match score
  - Technical skills compatibility
  - Experience level assessment
  - Detailed strengths and weaknesses analysis
  - Specific skill matches and gaps
  - Professional recommendations

## Tech Stack

- **Frontend**: Next.js 13+, React, TypeScript, Material-UI
- **Backend**: Next.js API Routes
- **AI/ML**: LangChain, OpenAI GPT-3.5
- **PDF Processing**: PDF.js
- **Styling**: Material-UI components

## Prerequisites

- Node.js 18+ installed
- OpenAI API key
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/resume-job-matcher.git
cd resume-job-matcher
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
NODE_ENV=development
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Upload a resume in PDF format
2. Upload a job description in PDF format
3. Click "Analyze Match"
4. View the comprehensive analysis results:
   - Job category and required skills
   - Resume category and candidate skills
   - Match analysis with detailed scores
   - Technical skill compatibility
   - Strengths and weaknesses
   - Professional recommendation

## API Structure

The application uses a single API endpoint:

- `POST /api/match-resume`
  - Accepts multipart form data with 'resume' and 'jobDescription' files
  - Returns detailed analysis in JSON format

### Response Format

```typescript
{
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
```

## Error Handling

The application includes comprehensive error handling for:
- Invalid file formats
- PDF processing errors
- API failures
- Invalid response formats

## Development

### Project Structure

```
resume-job-matcher/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── match-resume/
│   │   │       ├── route.ts
│   │   │       └── pdf-utils.ts
│   │   ├── resume-matcher/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── providers.tsx
├── public/
├── .env.local
├── package.json
└── README.md
```

### Running Tests

```bash
npm run test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the GPT-3.5 API
- PDF.js for PDF processing capabilities
- Material-UI for the component library
