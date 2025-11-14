import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { TranscriptionsService } from './transcriptions.service';
import { CreateTranscriptDto } from './dto/create-transcript.dto';

@Controller('transcriptions')
export class TranscriptionsController {
  constructor(private readonly transcriptionsService: TranscriptionsService) {}

  @Post()
  create(@Body() createTranscriptDto: CreateTranscriptDto) {
    return this.transcriptionsService.create(createTranscriptDto);
  }

  @Get('meeting/:meetingId')
  findByMeeting(@Param('meetingId') meetingId: string) {
    return this.transcriptionsService.findByMeeting(meetingId);
  }

  @Get('meeting/:meetingId/export')
  exportTranscript(
    @Param('meetingId') meetingId: string,
    @Query('format') format: string = 'txt',
  ) {
    return this.transcriptionsService.exportTranscript(meetingId, format);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.transcriptionsService.remove(id);
  }
}
