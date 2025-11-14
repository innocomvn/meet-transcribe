import { Controller, Get } from '@nestjs/common';
import { TranscriptionService } from '../transcription/transcription.service';

@Controller('system')
export class SystemController {
  constructor(private readonly transcriptionService: TranscriptionService) {}

  @Get('health')
  healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'meet-transcribe-node',
    };
  }

  @Get('info')
  getSystemInfo() {
    return {
      version: '1.0.0',
      runtime: 'Node.js',
      framework: 'NestJS',
      transcription: this.transcriptionService.getProviderInfo(),
    };
  }

  @Get('transcription/provider')
  getTranscriptionProvider() {
    return this.transcriptionService.getProviderInfo();
  }

  @Get('transcription/providers')
  listTranscriptionProviders() {
    return {
      providers: [
        {
          id: 'local',
          name: 'Local PhoWhisper',
          description: 'Vietnamese ASR model running locally (Python service required)',
          languages: ['vi'],
          requires: ['Python service', 'GPU/CPU'],
          pros: ['Privacy', 'Offline', 'No API costs'],
          cons: ['Requires Python service', 'Slower on CPU'],
          note: 'Not available in Node.js - use Python backend or API providers',
        },
        {
          id: 'openai',
          name: 'OpenAI Whisper API',
          description: 'Cloud-based Whisper API from OpenAI',
          languages: ['vi', 'en', 'multilingual'],
          requires: ['OPENAI_API_KEY'],
          pros: ['Fast', 'Accurate', 'Multi-language', 'No local resources'],
          cons: ['API costs', 'Requires internet'],
        },
        {
          id: 'assemblyai',
          name: 'AssemblyAI',
          description: 'Cloud-based speech recognition API',
          languages: ['vi', 'en', 'multilingual'],
          requires: ['ASSEMBLYAI_API_KEY'],
          pros: ['Fast', 'Feature-rich', 'Good accuracy'],
          cons: ['API costs', 'Requires internet'],
        },
      ],
    };
  }
}
