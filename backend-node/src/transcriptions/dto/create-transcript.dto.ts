import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateTranscriptDto {
  @IsString()
  meetingId: string;

  @IsString()
  text: string;

  @IsString()
  @IsOptional()
  speaker?: string;

  @IsNumber()
  @IsOptional()
  confidence?: number;

  @IsString()
  @IsOptional()
  language?: string = 'vi';
}
