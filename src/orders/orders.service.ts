import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Order, OrderStatus } from './order.entity';
import { User } from 'src/users/user.entity';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.PREPARING],
    [OrderStatus.PREPARING]: [OrderStatus.ON_THE_WAY],
    [OrderStatus.ON_THE_WAY]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
};

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepo: Repository<Order>,
    ) { }

    async create(dto: CreateOrderDto, customer: User): Promise<Order> {
        const order = this.ordersRepo.create({
            addressFrom: dto.addressFrom,
            addressTo: dto.addressTo,
            customer,
            status: OrderStatus.PENDING,
        });
        return this.ordersRepo.save(order);
    }

    async findAll(): Promise<Order[]> {
        return this.ordersRepo.find({
            relations: ['customer', 'driver'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Order> {
        const order = await this.ordersRepo.findOne({
            where: { id },
            relations: ['customer', 'driver'],
        });
        if (!order) throw new NotFoundException(`Pedido ${id} no encontrado`);
        return order;
    }

    async findByDriver(driverId: string): Promise<Order[]> {
        return this.ordersRepo.find({
            where: { driver: { id: driverId } },
            relations: ['customer'],
            order: { createdAt: 'DESC' },
        });
    }

    async updateStatus(id: string, dto: UpdateStatusDto): Promise<Order> {
        const order = await this.findOne(id);

        const allowed = VALID_TRANSITIONS[order.status];
        if (!allowed.includes(dto.status)) {
            throw new BadRequestException(
                `No se puede cambiar de "${order.status}" a "${dto.status}"`,
            );
        }

        order.status = dto.status;
        if (dto.status === OrderStatus.DELIVERED) {
            order.deliveredAt = new Date();
        }

        return this.ordersRepo.save(order);
    }

    async assignDriver(orderId: string, driver: User): Promise<Order> {
        const order = await this.findOne(orderId);
        order.driver = driver;
        return this.ordersRepo.save(order);
    }
}