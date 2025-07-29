import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { ValidationPipe, UsePipes, forwardRef, Inject } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private server: Server;

  constructor(
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  afterInit(server: Server) {
    this.server = server;
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async handleMessage(@MessageBody() data: CreateChatDto) {
    console.log('Received message:', data);
    const message = await this.chatService.create(data);
    // No need to emit here — service will emit after save
  }

  public broadcastMessage(message: any) {
    if (this.server) {
      this.server.emit('message', message);
    }
  }
}
