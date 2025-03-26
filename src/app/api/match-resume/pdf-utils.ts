import { getDocument, version } from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

// Configure PDF.js
const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.entry');

if (typeof window === 'undefined') {
  const canvas = require('canvas');
  global.DOMMatrix = canvas.DOMMatrix;
}

export async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    // Load the PDF document
    const data = new Uint8Array(buffer);
    const loadingTask = getDocument({
      data,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    });
    
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const textContent: string[] = [];

    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .filter((item): item is TextItem => 'str' in item)
        .map(item => item.str)
        .join(' ');
      textContent.push(pageText);
    }

    return textContent.join('\n').trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
} 