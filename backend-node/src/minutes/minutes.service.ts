import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeetingMinutes } from './entities/meeting-minutes.entity';

@Injectable()
export class MinutesService {
  constructor(
    @InjectRepository(MeetingMinutes)
    private minutesRepository: Repository<MeetingMinutes>,
  ) {}

  async generateMinutes(meetingId: string, format: string): Promise<MeetingMinutes> {
    // This is a simplified version - full implementation would analyze transcripts
    const summary = 'Meeting summary will be generated from transcripts';

    const existing = await this.minutesRepository.findOne({ where: { meetingId } });

    if (existing) {
      existing.summary = summary;
      existing.format = format;
      existing.updatedAt = new Date();
      return this.minutesRepository.save(existing);
    }

    const minutes = this.minutesRepository.create({
      meetingId,
      summary,
      format,
      keyPoints: [],
      actionItems: [],
      decisions: [],
      participants: {},
    });

    return this.minutesRepository.save(minutes);
  }

  async findByMeeting(meetingId: string): Promise<MeetingMinutes> {
    const minutes = await this.minutesRepository.findOne({ where: { meetingId } });
    if (!minutes) {
      throw new NotFoundException('Meeting minutes not found');
    }
    return minutes;
  }

  async remove(meetingId: string): Promise<{ message: string; meetingId: string }> {
    const minutes = await this.findByMeeting(meetingId);
    await this.minutesRepository.remove(minutes);

    return { message: 'Meeting minutes deleted', meetingId };
  }
}
