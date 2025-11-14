import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  hostName: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}
