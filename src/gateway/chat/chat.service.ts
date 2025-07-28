import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatEntity } from './entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatEntity)
    private chatRepository: Repository<ChatEntity>
  ) {}

  create(messageDto: Partial<ChatEntity>) {
    const message = this.chatRepository.create(messageDto);
    return this.chatRepository.save(message);
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