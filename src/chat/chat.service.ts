import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { Order } from '../orders/order.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Message)
        private messageRepo: Repository<Message>,
        @InjectRepository(Order)
        private ordersRepo: Repository<Order>,
        @InjectRepository(User)
        private usersRepo: Repository<User>,
    ) { }

    async saveMessage(data: {
        orderId: string;
        senderId: string;
        content: string;
    }): Promise<Message> {
        const order = await this.ordersRepo.findOne({ where: { id: data.orderId } });
        if (!order) throw new NotFoundException('Pedido no encontrado');

        const sender = await this.usersRepo.findOne({ where: { id: data.senderId } });
        if (!sender) throw new NotFoundException('Usuario no encontrado');

        const message = this.messageRepo.create({ order, sender, content: data.content });
        return this.messageRepo.save(message);
    }

    async getHistory(orderId: string): Promise<Message[]> {
        return this.messageRepo.find({
            where: { order: { id: orderId } },
            relations: ['sender'],
            order: { sentAt: 'ASC' },
        });
    }
}