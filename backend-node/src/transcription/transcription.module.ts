import { Module, Global } from '@nestjs/common';
import { TranscriptionService } from './transcription.service';

@Global()
@Module({
  providers: [TranscriptionService],
  exports: [TranscriptionService],
})
export class TranscriptionModule {}
