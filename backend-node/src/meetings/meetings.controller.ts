import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMeetingDto: CreateMeetingDto) {
    return this.meetingsService.create(createMeetingDto);
  }

  @Get()
  findAll(@Query('skip') skip: number = 0, @Query('limit') limit: number = 100) {
    return this.meetingsService.findAll(skip, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meetingsService.findOne(id);
  }

  @Patch(':id/start')
  startMeeting(@Param('id') id: string) {
    return this.meetingsService.startMeeting(id);
  }

  @Patch(':id/end')
  endMeeting(@Param('id') id: string) {
    return this.meetingsService.endMeeting(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.meetingsService.remove(id);
  }
}
