import { Injectable, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatEntity } from './entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatEntity)
    private chatRepository: Repository<ChatEntity>,

    @Inject(forwardRef(() => ChatGateway))
    private chatGateway: ChatGateway,
  ) {}

  async create(messageDto: Partial<ChatEntity>) {
    if (!messageDto.senderId || !messageDto.receiverId || !messageDto.message) {
      throw new BadRequestException('senderId, receiverId and message are required');
    }
    const message = this.chatRepository.create(messageDto);
    const saved = await this.chatRepository.save(message);
    this.chatGateway.broadcastMessage(saved); // Emit socket event
    return saved;
  }

  getConversation(user1: string, user2: string) {
    return this.chatRepository.find({
      where: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
      order: { createdAt: 'ASC' },
    });
  }
}
