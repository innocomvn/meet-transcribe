import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { RecordingsService } from './recordings.service';
import { createReadStream } from 'fs';

@Controller('recordings')
export class RecordingsController {
  constructor(private readonly recordingsService: RecordingsService) {}

  @Post('upload/:meetingId')
  @UseInterceptors(FileInterceptor('file'))
  uploadRecording(
    @Param('meetingId') meetingId: string,
    @Query('recording_type') recordingType: string = 'screen',
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.recordingsService.create(meetingId, file, recordingType);
  }

  @Get('meeting/:meetingId')
  findByMeeting(@Param('meetingId') meetingId: string) {
    return this.recordingsService.findByMeeting(meetingId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.recordingsService.findOne(id);
  }

  @Get(':id/download')
  async downloadRecording(
    @Param('id') id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const recording = await this.recordingsService.findOne(id);
    const file = createReadStream(recording.filePath);

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${recording.fileName}"`,
    });

    return new StreamableFile(file);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.recordingsService.remove(id);
  }
}
