import { Injectable } from '@nestjs/common';
import { createWorker } from 'tesseract.js';

@Injectable()
export class AutoflowService {
  /**
   * Extracts text from an image using Tesseract.js.
   * Supports common image formats (PNG, JPG, BMP, etc.).
   * @param image A local file path, a URL, or a Buffer of the image.
   * @returns The extracted plain text.
   */
  async extractTextFromImage(image: Buffer | string): Promise<string> {
    // It is recommended to create a new worker for each recognition task.
    // We are specifying both Chinese and English for better recognition on resumes.
    const worker = await createWorker('chi_sim+eng');

    try {
      const {
        data: { text },
      } = await worker.recognize(image);
      return text;
    } catch (error) {
      console.error('Error during OCR process:', error);
      throw new Error('Failed to extract text from image.');
    } finally {
      // Ensure the worker is always terminated to free up resources.
      await worker.terminate();
    }
  }
}
