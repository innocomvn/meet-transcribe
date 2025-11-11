import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MeetingsModule } from './meetings/meetings.module';
import { RecordingsModule } from './recordings/recordings.module';
import { TranscriptionsModule } from './transcriptions/transcriptions.module';
import { MinutesModule } from './minutes/minutes.module';
import { SystemModule } from './system/system.module';
import { WebsocketModule } from './websocket/websocket.module';
import { TranscriptionModule } from './transcription/transcription.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_PATH || './meet-transcribe.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),

    // Serve static files (uploads)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads'),
      serveRoot: '/uploads',
    }),

    // Feature modules
    MeetingsModule,
    RecordingsModule,
    TranscriptionsModule,
    MinutesModule,
    SystemModule,
    WebsocketModule,
    TranscriptionModule,
  ],
})
export class AppModule {}
