import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';
import { createReadStream } from 'fs';

export interface TranscriptionProvider {
  transcribeChunk(audioData: Buffer, language: string): Promise<string | null>;
  transcribeFile(filePath: string, language: string): Promise<any>;
}

@Injectable()
export class OpenAIProvider implements TranscriptionProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.openai.com/v1/audio/transcriptions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribeChunk(audioData: Buffer, language: string = 'vi'): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('file', audioData, { filename: 'audio.wav', contentType: 'audio/wav' });
      formData.append('model', 'whisper-1');
      formData.append('language', language);
      formData.append('response_format', 'text');

      const response = await axios.post(this.apiUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${this.apiKey}`,
        },
        timeout: 30000,
      });

      const text = response.data.trim();
      this.logger.log(`OpenAI transcription: ${text.substring(0, 50)}...`);
      return text;
    } catch (error) {
      this.logger.error(`OpenAI transcription error: ${error.message}`);
      return null;
    }
  }

  async transcribeFile(filePath: string, language: string = 'vi'): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', createReadStream(filePath));
      formData.append('model', 'whisper-1');
      formData.append('language', language);
      formData.append('response_format', 'verbose_json');
      formData.append('timestamp_granularities', 'segment');

      const response = await axios.post(this.apiUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${this.apiKey}`,
        },
        timeout: 120000,
      });

      this.logger.log(`OpenAI file transcription complete: ${filePath}`);
      return response.data;
    } catch (error) {
      this.logger.error(`OpenAI file transcription error: ${error.message}`);
      return null;
    }
  }
}

@Injectable()
export class AssemblyAIProvider implements TranscriptionProvider {
  private readonly logger = new Logger(AssemblyAIProvider.name);
  private readonly apiKey: string;
  private readonly uploadUrl = 'https://api.assemblyai.com/v2/upload';
  private readonly transcriptUrl = 'https://api.assemblyai.com/v2/transcript';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribeChunk(audioData: Buffer, language: string = 'vi'): Promise<string | null> {
    try {
      // Upload audio
      const uploadResponse = await this.uploadAudio(audioData);
      if (!uploadResponse) return null;

      const uploadUrl = uploadResponse.upload_url;

      // Create transcription
      const transcriptResponse = await axios.post(
        this.transcriptUrl,
        {
          audio_url: uploadUrl,
          language_code: language === 'vi' ? 'vi' : 'en',
        },
        {
          headers: {
            'authorization': this.apiKey,
            'content-type': 'application/json',
          },
        },
      );

      const transcriptId = transcriptResponse.data.id;

      // Poll for completion
      const text = await this.pollTranscript(transcriptId);
      if (text) {
        this.logger.log(`AssemblyAI transcription: ${text.substring(0, 50)}...`);
      }
      return text;
    } catch (error) {
      this.logger.error(`AssemblyAI transcription error: ${error.message}`);
      return null;
    }
  }

  async transcribeFile(filePath: string, language: string = 'vi'): Promise<any> {
    try {
      const audioData = await import('fs').then(fs => fs.promises.readFile(filePath));
      const uploadResponse = await this.uploadAudio(audioData);
      if (!uploadResponse) return null;

      const transcriptResponse = await axios.post(
        this.transcriptUrl,
        {
          audio_url: uploadResponse.upload_url,
          language_code: language === 'vi' ? 'vi' : 'en',
          punctuate: true,
          format_text: true,
        },
        {
          headers: {
            'authorization': this.apiKey,
            'content-type': 'application/json',
          },
        },
      );

      const result = await this.pollTranscriptFull(transcriptResponse.data.id);
      this.logger.log(`AssemblyAI file transcription complete: ${filePath}`);
      return result;
    } catch (error) {
      this.logger.error(`AssemblyAI file transcription error: ${error.message}`);
      return null;
    }
  }

  private async uploadAudio(audioData: Buffer): Promise<any> {
    try {
      const response = await axios.post(this.uploadUrl, audioData, {
        headers: {
          'authorization': this.apiKey,
        },
        timeout: 60000,
      });
      return response.data;
    } catch (error) {
      this.logger.error(`AssemblyAI upload error: ${error.message}`);
      return null;
    }
  }

  private async pollTranscript(transcriptId: string, maxAttempts: number = 30): Promise<string | null> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await axios.get(`${this.transcriptUrl}/${transcriptId}`, {
          headers: { 'authorization': this.apiKey },
        });

        const { status, text, error } = response.data;

        if (status === 'completed') return text;
        if (status === 'error') {
          this.logger.error(`AssemblyAI transcription error: ${error}`);
          return null;
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        this.logger.error(`AssemblyAI polling error: ${error.message}`);
      }
    }

    this.logger.error('AssemblyAI transcription timeout');
    return null;
  }

  private async pollTranscriptFull(transcriptId: string, maxAttempts: number = 60): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await axios.get(`${this.transcriptUrl}/${transcriptId}`, {
          headers: { 'authorization': this.apiKey },
        });

        const { status, error } = response.data;

        if (status === 'completed') return response.data;
        if (status === 'error') {
          this.logger.error(`AssemblyAI transcription error: ${error}`);
          return null;
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        this.logger.error(`AssemblyAI polling error: ${error.message}`);
      }
    }

    this.logger.error('AssemblyAI transcription timeout');
    return null;
  }
}

@Injectable()
export class TranscriptionService implements OnModuleInit {
  private readonly logger = new Logger(TranscriptionService.name);
  private provider: TranscriptionProvider;
  private readonly providerType: string;
  private readonly language: string;

  constructor(private configService: ConfigService) {
    this.providerType = this.configService.get<string>('TRANSCRIPTION_PROVIDER', 'local');
    this.language = this.configService.get<string>('TRANSCRIPTION_LANGUAGE', 'vi');
  }

  async onModuleInit() {
    await this.initializeProvider();
  }

  private async initializeProvider() {
    this.logger.log(`Initializing transcription provider: ${this.providerType}`);

    switch (this.providerType) {
      case 'openai':
        const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (!openaiKey) {
          throw new Error('OPENAI_API_KEY not set');
        }
        this.provider = new OpenAIProvider(openaiKey);
        this.logger.log('OpenAI Whisper API provider initialized');
        break;

      case 'assemblyai':
        const assemblyKey = this.configService.get<string>('ASSEMBLYAI_API_KEY');
        if (!assemblyKey) {
          throw new Error('ASSEMBLYAI_API_KEY not set');
        }
        this.provider = new AssemblyAIProvider(assemblyKey);
        this.logger.log('AssemblyAI provider initialized');
        break;

      case 'local':
      default:
        this.logger.warn('Local PhoWhisper not implemented in Node.js - using API fallback');
        // For Node.js, we'll use OpenAI as fallback for local
        // In production, you could use a Python microservice for PhoWhisper
        break;
    }
  }

  async transcribeChunk(audioData: string, meetingId: string): Promise<string | null> {
    if (!this.provider) {
      this.logger.warn('Transcription provider not initialized');
      return null;
    }

    try {
      // Decode base64 audio data
      const buffer = Buffer.from(audioData, 'base64');

      // Use the provider to transcribe
      const text = await this.provider.transcribeChunk(buffer, this.language);

      if (text) {
        this.logger.log(`Transcribed text for meeting ${meetingId}: ${text.substring(0, 50)}...`);
      }

      return text;
    } catch (error) {
      this.logger.error(`Error transcribing audio chunk: ${error.message}`);
      return null;
    }
  }

  async transcribeFile(filePath: string, language?: string): Promise<any> {
    if (!this.provider) {
      this.logger.warn('Transcription provider not initialized');
      return null;
    }

    try {
      const lang = language || this.language;
      this.logger.log(`Transcribing file: ${filePath} with language: ${lang}`);

      const result = await this.provider.transcribeFile(filePath, lang);

      if (result) {
        this.logger.log(`File transcription complete: ${filePath}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`Error transcribing file: ${error.message}`);
      return null;
    }
  }

  getProviderInfo() {
    return {
      provider: this.providerType,
      language: this.language,
      status: this.provider ? 'active' : 'inactive',
    };
  }
}
