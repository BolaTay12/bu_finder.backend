import { Module } from '@nestjs/common';
import { AiMatchingService } from './gemini.service';

@Module({
  providers: [AiMatchingService],
  exports: [AiMatchingService],
})
export class AiMatchingModule {}
