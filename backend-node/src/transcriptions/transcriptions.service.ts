import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transcript } from './entities/transcript.entity';
import { CreateTranscriptDto } from './dto/create-transcript.dto';
import { format } from 'date-fns';

@Injectable()
export class TranscriptionsService {
  constructor(
    @InjectRepository(Transcript)
    private transcriptsRepository: Repository<Transcript>,
  ) {}

  async create(createTranscriptDto: CreateTranscriptDto): Promise<Transcript> {
    const transcript = this.transcriptsRepository.create(createTranscriptDto);
    return this.transcriptsRepository.save(transcript);
  }

  async findByMeeting(meetingId: string): Promise<Transcript[]> {
    return this.transcriptsRepository.find({
      where: { meetingId },
      order: { timestamp: 'ASC' },
    });
  }

  async exportTranscript(meetingId: string, formatType: string) {
    const transcripts = await this.findByMeeting(meetingId);

    if (transcripts.length === 0) {
      throw new NotFoundException('No transcripts found for this meeting');
    }

    if (formatType === 'txt') {
      const content = transcripts
        .map(
          (t) =>
            `[${format(new Date(t.timestamp), 'HH:mm:ss')}] ${t.speaker || 'Unknown'}: ${t.text}`,
        )
        .join('\n\n');
      return { format: 'txt', content };
    }

    if (formatType === 'json') {
      return {
        format: 'json',
        transcripts: transcripts.map((t) => ({
          timestamp: t.timestamp.toISOString(),
          speaker: t.speaker,
          text: t.text,
          confidence: t.confidence,
        })),
      };
    }

    if (formatType === 'srt') {
      const srtContent = transcripts
        .map((t, idx) => {
          const startTime = format(new Date(t.timestamp), 'HH:mm:ss,000');
          const endTime = format(new Date(t.timestamp), 'HH:mm:ss,000');
          return `${idx + 1}\n${startTime} --> ${endTime}\n${t.text}\n`;
        })
        .join('\n');

      return { format: 'srt', content: srtContent };
    }

    throw new NotFoundException('Unsupported format. Use txt, json, or srt');
  }

  async remove(id: number): Promise<{ message: string; transcriptId: number }> {
    const transcript = await this.transcriptsRepository.findOne({ where: { id } });
    if (!transcript) {
      throw new NotFoundException(`Transcript with ID ${id} not found`);
    }

    await this.transcriptsRepository.remove(transcript);
    return { message: 'Transcript deleted', transcriptId: id };
  }
}
