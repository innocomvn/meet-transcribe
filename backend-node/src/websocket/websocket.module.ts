import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { TranscriptionModule } from '../transcription/transcription.module';

@Module({
  imports: [TranscriptionModule],
  providers: [WebsocketGateway],
})
export class WebsocketModule {}
