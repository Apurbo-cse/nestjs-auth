// src/chat/dto/create-chat.dto.ts
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  room?: string;

  @IsString()
  @IsOptional()
  name?: string;
}
