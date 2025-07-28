import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  getConversation(@Query('user1') user1: string, @Query('user2') user2: string) {
    return this.chatService.getConversation(user1, user2);
  }

  @Post()
  sendMessage(@Body() data: any) {
    return this.chatService.create(data);
  }
}
