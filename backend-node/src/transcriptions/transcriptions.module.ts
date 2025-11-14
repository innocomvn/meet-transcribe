import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranscriptionsController } from './transcriptions.controller';
import { TranscriptionsService } from './transcriptions.service';
import { Transcript } from './entities/transcript.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transcript])],
  controllers: [TranscriptionsController],
  providers: [TranscriptionsService],
})
export class TranscriptionsModule {}
