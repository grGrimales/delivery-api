import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { Message } from './message.entity';
import { Order } from '../orders/order.entity';
import { User } from '../users/user.entity';
import { AuthModule } from '../auth/auth.module';
import { ChatGateway } from './chat/chat.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Order, User]),
    AuthModule,
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatGateway],
})
export class ChatModule { }