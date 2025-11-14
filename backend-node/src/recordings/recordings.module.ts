import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { RecordingsController } from './recordings.controller';
import { RecordingsService } from './recordings.service';
import { Recording } from './entities/recording.entity';
import { diskStorage } from 'multer';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recording]),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const meetingId = req.params.meetingId;
          const uploadDir = join(process.env.UPLOAD_DIR || './uploads', 'recordings', meetingId);
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const type = req.query.recording_type || 'screen';
          cb(null, `${type}_${timestamp}_${file.originalname}`);
        },
      }),
      limits: {
        fileSize: parseInt(process.env.MAX_UPLOAD_SIZE) || 524288000, // 500MB
      },
    }),
  ],
  controllers: [RecordingsController],
  providers: [RecordingsService],
})
export class RecordingsModule {}
