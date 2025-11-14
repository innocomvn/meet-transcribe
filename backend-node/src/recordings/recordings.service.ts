import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recording } from './entities/recording.entity';
import { unlink } from 'fs/promises';

@Injectable()
export class RecordingsService {
  constructor(
    @InjectRepository(Recording)
    private recordingsRepository: Repository<Recording>,
  ) {}

  async create(
    meetingId: string,
    file: Express.Multer.File,
    recordingType: string,
  ): Promise<Recording> {
    const recording = this.recordingsRepository.create({
      meetingId,
      filePath: file.path,
      fileName: file.originalname,
      fileSize: file.size,
      format: file.mimetype.split('/')[1],
      type: recordingType,
    });

    return this.recordingsRepository.save(recording);
  }

  async findByMeeting(meetingId: string): Promise<Recording[]> {
    return this.recordingsRepository.find({ where: { meetingId } });
  }

  async findOne(id: number): Promise<Recording> {
    const recording = await this.recordingsRepository.findOne({ where: { id } });
    if (!recording) {
      throw new NotFoundException(`Recording with ID ${id} not found`);
    }
    return recording;
  }

  async remove(id: number): Promise<{ message: string; recordingId: number }> {
    const recording = await this.findOne(id);

    // Delete file
    try {
      await unlink(recording.filePath);
    } catch (error) {
      // File might not exist, continue anyway
    }

    await this.recordingsRepository.remove(recording);

    return { message: 'Recording deleted', recordingId: id };
  }
}
