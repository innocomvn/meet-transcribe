import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TranscriptionService } from '../transcription/transcription.service';

@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/ws',
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  private meetingRooms: Map<string, Set<string>> = new Map();

  constructor(private readonly transcriptionService: TranscriptionService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove client from all meeting rooms
    this.meetingRooms.forEach((clients, meetingId) => {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        this.server.to(meetingId).emit('user_left', {
          type: 'user_left',
          clientId: client.id,
          timestamp: new Date().toISOString(),
        });

        if (clients.size === 0) {
          this.meetingRooms.delete(meetingId);
          this.logger.log(`Meeting room ${meetingId} cleaned up`);
        }
      }
    });
  }

  @SubscribeMessage('join_meeting')
  handleJoinMeeting(
    @MessageBody() data: { meetingId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { meetingId } = data;

    client.join(meetingId);

    if (!this.meetingRooms.has(meetingId)) {
      this.meetingRooms.set(meetingId, new Set());
    }
    this.meetingRooms.get(meetingId).add(client.id);

    this.logger.log(`Client ${client.id} joined meeting ${meetingId}`);

    // Notify others in the room
    client.to(meetingId).emit('user_joined', {
      type: 'user_joined',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });

    return { success: true, meetingId };
  }

  @SubscribeMessage('audio_chunk')
  async handleAudioChunk(
    @MessageBody() data: { meetingId: string; audio: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { meetingId, audio } = data;

    try {
      // Transcribe audio chunk
      const transcript = await this.transcriptionService.transcribeChunk(audio, meetingId);

      if (transcript) {
        // Broadcast transcript to all participants in the meeting
        this.server.to(meetingId).emit('transcript', {
          type: 'transcript',
          text: transcript,
          timestamp: new Date().toISOString(),
          meetingId,
        });
      }
    } catch (error) {
      this.logger.error(`Error processing audio chunk: ${error.message}`);
    }
  }

  @SubscribeMessage('signaling')
  handleSignaling(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { meetingId } = data;

    // Broadcast signaling data to all other participants
    client.to(meetingId).emit('signaling', data);
  }

  @SubscribeMessage('chat')
  handleChat(
    @MessageBody() data: { meetingId: string; message: string; sender: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { meetingId, message, sender } = data;

    // Broadcast chat message to all participants
    this.server.to(meetingId).emit('chat', {
      type: 'chat',
      message,
      sender,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('recording_control')
  handleRecordingControl(
    @MessageBody() data: { meetingId: string; action: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { meetingId, action } = data;

    // Broadcast recording status to all participants
    this.server.to(meetingId).emit('recording_status', {
      type: 'recording_status',
      action,
      timestamp: new Date().toISOString(),
    });
  }
}
