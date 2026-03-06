import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';

export interface MatchCandidate {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  imageUrl: string | null;
}

export interface GeminiMatchResult {
  candidateId: string;
  score: number;
  reasoning: string;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly model;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not set — AI matching will be disabled');
      this.model = null;
      return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  get isAvailable(): boolean {
    return this.model !== null;
  }

  /**
   * Uses Gemini to compare a source item against candidate matches.
   * Supports text-only and multimodal (text + image) comparison.
   */
  async findMatches(
    sourceItem: MatchCandidate,
    candidates: MatchCandidate[],
  ): Promise<GeminiMatchResult[]> {
    if (!this.model || candidates.length === 0) {
      return [];
    }

    try {
      const parts: Part[] = [];

      // Fetch source image if available
      const sourceImagePart = await this.fetchImagePart(sourceItem.imageUrl);

      parts.push({
        text: this.buildMatchingPrompt(sourceItem, candidates),
      });

      if (sourceImagePart) {
        parts.push(sourceImagePart);
      }

      // Fetch candidate images (up to 5 to stay within token limits)
      const candidateImages = await this.fetchCandidateImages(candidates);
      for (const img of candidateImages) {
        parts.push({ text: `[Image for candidate ${img.candidateId}]:` });
        parts.push(img.part);
      }

      const result = await this.model.generateContent(parts);
      const response = result.response;
      const text = response.text();

      return this.parseMatchResponse(text, candidates);
    } catch (error) {
      this.logger.error('Gemini matching failed:', error);
      return [];
    }
  }

  /**
   * Analyzes a single item image and extracts descriptive features.
   */
  async analyzeItemImage(imageUrl: string): Promise<string | null> {
    if (!this.model) return null;

    try {
      const imagePart = await this.fetchImagePart(imageUrl);
      if (!imagePart) return null;

      const result = await this.model.generateContent([
        {
          text: `Analyze this image of a lost or found item. Describe:
1. What the item is (type, brand if visible)
2. Color and physical characteristics
3. Any distinguishing marks, text, or damage
4. Estimated size/condition

Keep the description concise (2-3 sentences).`,
        },
        imagePart,
      ]);

      return result.response.text();
    } catch (error) {
      this.logger.error('Image analysis failed:', error);
      return null;
    }
  }

  private buildMatchingPrompt(
    source: MatchCandidate,
    candidates: MatchCandidate[],
  ): string {
    const candidateList = candidates
      .map(
        (c, i) =>
          `Candidate ${i + 1} (ID: ${c.id}):
  - Title: ${c.title}
  - Description: ${c.description}
  - Category: ${c.category}
  - Location: ${c.location}
  - Has image: ${c.imageUrl ? 'Yes' : 'No'}`,
      )
      .join('\n\n');

    return `You are an AI matching engine for a university lost-and-found system called "BU Finder".

A user has reported an item. Your job is to compare it against a list of candidates and determine how likely each candidate is the SAME physical item.

SOURCE ITEM:
- Title: ${source.title}
- Description: ${source.description}
- Category: ${source.category}
- Location: ${source.location}
- Has image: ${source.imageUrl ? 'Yes (attached below)' : 'No'}

CANDIDATES:
${candidateList}

SCORING RULES:
- Score 0.0 to 1.0 where 1.0 = definitely the same item
- Consider: item type/category match, physical description similarity, color, brand, location proximity, distinguishing features
- If images are provided, use visual similarity as a strong signal
- Be strict: only score above 0.7 if descriptions strongly suggest the same physical item
- Score 0.0 for clearly unrelated items

Respond ONLY with valid JSON array, no markdown fences, no extra text:
[{"candidateId": "<uuid>", "score": <number>, "reasoning": "<brief explanation>"}]

If no candidates match at all, return an empty array: []`;
  }

  private parseMatchResponse(
    text: string,
    candidates: MatchCandidate[],
  ): GeminiMatchResult[] {
    try {
      // Strip markdown code fences if present
      const cleaned = text
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      const parsed = JSON.parse(cleaned);

      if (!Array.isArray(parsed)) return [];

      const validIds = new Set(candidates.map((c) => c.id));

      return parsed
        .filter(
          (item: any) =>
            item.candidateId &&
            validIds.has(item.candidateId) &&
            typeof item.score === 'number' &&
            item.score >= 0 &&
            item.score <= 1,
        )
        .map((item: any) => ({
          candidateId: item.candidateId,
          score: Math.round(item.score * 100) / 100,
          reasoning: item.reasoning || '',
        }));
    } catch (error) {
      this.logger.error('Failed to parse Gemini response:', text);
      return [];
    }
  }

  private async fetchImagePart(imageUrl: string | null): Promise<Part | null> {
    if (!imageUrl) return null;

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) return null;

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = response.headers.get('content-type') || 'image/jpeg';

      return {
        inlineData: {
          data: base64,
          mimeType,
        },
      };
    } catch (error) {
      this.logger.warn(`Failed to fetch image: ${imageUrl}`);
      return null;
    }
  }

  private async fetchCandidateImages(
    candidates: MatchCandidate[],
  ): Promise<{ candidateId: string; part: Part }[]> {
    const withImages = candidates.filter((c) => c.imageUrl).slice(0, 5);

    const results: { candidateId: string; part: Part }[] = [];

    for (const candidate of withImages) {
      const part = await this.fetchImagePart(candidate.imageUrl);
      if (part) {
        results.push({ candidateId: candidate.id, part });
      }
    }

    return results;
  }
}
