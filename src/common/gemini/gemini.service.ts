import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

export interface MatchCandidate {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  imageUrl: string | null;
}

export interface AiMatchResult {
  candidateId: string;
  score: number;
  reasoning: string;
}

@Injectable()
export class AiMatchingService {
  private readonly logger = new Logger(AiMatchingService.name);
  private readonly groq: Groq | null;

  private readonly TEXT_MODEL = 'llama-3.3-70b-versatile';
  private readonly VISION_MODEL = 'llama-3.2-90b-vision-preview';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY not set — AI matching will be disabled');
      this.groq = null;
      return;
    }
    this.groq = new Groq({ apiKey });
    this.logger.log('Groq AI matching service initialized');
  }

  get isAvailable(): boolean {
    return this.groq !== null;
  }

  /**
   * Compares a source item against candidates using Groq AI.
   * Uses vision model if source item has an image, otherwise text-only.
   */
  async findMatches(
    sourceItem: MatchCandidate,
    candidates: MatchCandidate[],
  ): Promise<AiMatchResult[]> {
    if (!this.groq || candidates.length === 0) {
      return [];
    }

    try {
      if (sourceItem.imageUrl) {
        return this.findMatchesWithVision(sourceItem, candidates);
      }
      return this.findMatchesTextOnly(sourceItem, candidates);
    } catch (error) {
      this.logger.error('Groq AI matching failed:', error);
      return [];
    }
  }

  /**
   * Vision-based matching: sends the source item image + text to Groq vision model.
   */
  private async findMatchesWithVision(
    sourceItem: MatchCandidate,
    candidates: MatchCandidate[],
  ): Promise<AiMatchResult[]> {
    const imageDataUrl = await this.fetchImageAsDataUrl(sourceItem.imageUrl);
    if (!imageDataUrl) {
      this.logger.warn('Failed to fetch source image, falling back to text-only');
      return this.findMatchesTextOnly(sourceItem, candidates);
    }

    const prompt = this.buildMatchingPrompt(sourceItem, candidates);

    const response = await this.groq!.chat.completions.create({
      model: this.VISION_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 2048,
    });

    const text = response.choices[0]?.message?.content || '[]';
    return this.parseMatchResponse(text, candidates);
  }

  /**
   * Text-only matching using Groq's fast text model with JSON output.
   */
  private async findMatchesTextOnly(
    sourceItem: MatchCandidate,
    candidates: MatchCandidate[],
  ): Promise<AiMatchResult[]> {
    const prompt = this.buildMatchingPrompt(sourceItem, candidates);

    const response = await this.groq!.chat.completions.create({
      model: this.TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an AI matching engine for a university lost-and-found system. Respond ONLY with valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content || '[]';
    return this.parseMatchResponse(text, candidates);
  }

  /**
   * Analyzes a single item image and extracts descriptive features.
   */
  async analyzeItemImage(imageUrl: string): Promise<string | null> {
    if (!this.groq) return null;

    try {
      const imageDataUrl = await this.fetchImageAsDataUrl(imageUrl);
      if (!imageDataUrl) return null;

      const response = await this.groq.chat.completions.create({
        model: this.VISION_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image of a lost or found item. Describe:
1. What the item is (type, brand if visible)
2. Color and physical characteristics
3. Any distinguishing marks, text, or damage
4. Estimated size/condition

Keep the description concise (2-3 sentences).`,
              },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 512,
      });

      return response.choices[0]?.message?.content || null;
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
  - Location: ${c.location}`,
      )
      .join('\n\n');

    return `You are an AI matching engine for a university lost-and-found system called "BU Finder".

A user has reported an item. Your job is to compare it against a list of candidates and determine how likely each candidate is the SAME physical item.

SOURCE ITEM:
- Title: ${source.title}
- Description: ${source.description}
- Category: ${source.category}
- Location: ${source.location}
${source.imageUrl ? '- An image of this item is attached.' : ''}

CANDIDATES:
${candidateList}

SCORING RULES:
- Score 0.0 to 1.0 where 1.0 = definitely the same item
- Consider: item type/category match, physical description similarity, color, brand, location proximity, distinguishing features
- If an image is provided, use visual details as a strong signal
- Be strict: only score above 0.7 if descriptions strongly suggest the same physical item
- Score 0.0 for clearly unrelated items

Respond with a JSON object containing a "matches" array:
{"matches": [{"candidateId": "<uuid>", "score": <number>, "reasoning": "<brief explanation>"}]}

If no candidates match at all, return: {"matches": []}`;
  }

  private parseMatchResponse(
    text: string,
    candidates: MatchCandidate[],
  ): AiMatchResult[] {
    try {
      const cleaned = text
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();

      const parsed = JSON.parse(cleaned);
      const matches = Array.isArray(parsed) ? parsed : (parsed.matches || []);

      if (!Array.isArray(matches)) return [];

      const validIds = new Set(candidates.map((c) => c.id));

      return matches
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
      this.logger.error('Failed to parse Groq response:', text);
      return [];
    }
  }

  private async fetchImageAsDataUrl(imageUrl: string | null): Promise<string | null> {
    if (!imageUrl) return null;

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) return null;

      const buffer = await response.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = response.headers.get('content-type') || 'image/jpeg';

      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      this.logger.warn(`Failed to fetch image: ${imageUrl}`);
      return null;
    }
  }
}
