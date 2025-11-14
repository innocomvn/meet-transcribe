import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinutesController } from './minutes.controller';
import { MinutesService } from './minutes.service';
import { MeetingMinutes } from './entities/meeting-minutes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MeetingMinutes])],
  controllers: [MinutesController],
  providers: [MinutesService],
})
export class MinutesModule {}
