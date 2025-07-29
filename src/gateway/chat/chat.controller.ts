import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  getConversation(
    @Query('user1') user1: string,
    @Query('user2') user2: string,
  ) {
    return this.chatService.getConversation(user1, user2);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  sendMessage(@Body() data: CreateChatDto) {
    console.log('Body received:', data);
    return this.chatService.create(data);
  }
}
