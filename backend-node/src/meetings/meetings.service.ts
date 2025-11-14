import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Meeting } from './entities/meeting.entity';
import { CreateMeetingDto } from './dto/create-meeting.dto';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private meetingsRepository: Repository<Meeting>,
  ) {}

  async create(createMeetingDto: CreateMeetingDto): Promise<Meeting> {
    const meeting = this.meetingsRepository.create({
      id: uuidv4(),
      ...createMeetingDto,
      status: 'scheduled',
      participants: {},
      startTime: new Date(),
    });

    return this.meetingsRepository.save(meeting);
  }

  async findAll(skip: number = 0, limit: number = 100): Promise<Meeting[]> {
    return this.meetingsRepository.find({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Meeting> {
    const meeting = await this.meetingsRepository.findOne({ where: { id } });
    if (!meeting) {
      throw new NotFoundException(`Meeting with ID ${id} not found`);
    }
    return meeting;
  }

  async startMeeting(id: string): Promise<{ message: string; meetingId: string }> {
    const meeting = await this.findOne(id);
    meeting.status = 'active';
    meeting.startTime = new Date();
    await this.meetingsRepository.save(meeting);

    return { message: 'Meeting started', meetingId: id };
  }

  async endMeeting(id: string): Promise<{ message: string; meetingId: string }> {
    const meeting = await this.findOne(id);
    meeting.status = 'ended';
    meeting.endTime = new Date();
    await this.meetingsRepository.save(meeting);

    return { message: 'Meeting ended', meetingId: id };
  }

  async remove(id: string): Promise<{ message: string; meetingId: string }> {
    const meeting = await this.findOne(id);
    await this.meetingsRepository.remove(meeting);

    return { message: 'Meeting deleted', meetingId: id };
  }
}
