import { Controller, Get, Post, Delete, Param, Query, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { MinutesService } from './minutes.service';
import { createReadStream } from 'fs';

@Controller('minutes')
export class MinutesController {
  constructor(private readonly minutesService: MinutesService) {}

  @Post(':meetingId')
  generateMinutes(
    @Param('meetingId') meetingId: string,
    @Query('format') format: string = 'pdf',
  ) {
    return this.minutesService.generateMinutes(meetingId, format);
  }

  @Get(':meetingId')
  getMinutes(@Param('meetingId') meetingId: string) {
    return this.minutesService.findByMeeting(meetingId);
  }

  @Get(':meetingId/download')
  async downloadMinutes(
    @Param('meetingId') meetingId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const minutes = await this.minutesService.findByMeeting(meetingId);

    if (!minutes.filePath) {
      throw new Error('Minutes file not found');
    }

    const file = createReadStream(minutes.filePath);

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="meeting_minutes_${meetingId}.${minutes.format}"`,
    });

    return new StreamableFile(file);
  }

  @Delete(':meetingId')
  remove(@Param('meetingId') meetingId: string) {
    return this.minutesService.remove(meetingId);
  }
}
