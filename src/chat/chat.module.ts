import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat/chat.gateway';

@Module({
  providers: [ChatService, ChatGateway]
})
export class ChatModule {}
