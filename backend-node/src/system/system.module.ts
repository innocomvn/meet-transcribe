import { Module } from '@nestjs/common';
import { SystemController } from './system.controller';
import { TranscriptionModule } from '../transcription/transcription.module';

@Module({
  imports: [TranscriptionModule],
  controllers: [SystemController],
})
export class SystemModule {}
