import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationHistory } from './location-history.entity';
import { Order } from '../orders/order.entity';

type Position = {
    orderId: string;
    lat: number;
    lng: number;
    heading?: number;
    ts: number;
};

@Injectable()
export class TrackingService {
    private positions = new Map<string, Position>();
    private driverSockets = new Map<string, string>(); // socketId → orderId

    constructor(
        @InjectRepository(LocationHistory)
        private locationRepo: Repository<LocationHistory>,
        @InjectRepository(Order)
        private ordersRepo: Repository<Order>,
    ) { }

    async savePosition(pos: Omit<Position, 'ts'>): Promise<Position> {
        const entry: Position = { ...pos, ts: Date.now() };
        this.positions.set(pos.orderId, entry);

        const order = await this.ordersRepo.findOne({ where: { id: pos.orderId } });
        if (order) {
            await this.locationRepo.save({
                order,
                lat: pos.lat,
                lng: pos.lng,
                heading: pos.heading,
            });
        }
        return entry;
    }

    getLastPosition(orderId: string): Position | undefined {
        return this.positions.get(orderId);
    }

    async getHistory(orderId: string): Promise<LocationHistory[]> {
        return this.locationRepo.find({
            where: { order: { id: orderId } },
            order: { recordedAt: 'ASC' },
        });
    }

    removeDriver(socketId: string) {
        const orderId = this.driverSockets.get(socketId);
        if (orderId) {
            this.positions.delete(orderId);
            this.driverSockets.delete(socketId);
        }
    }

    registerDriver(socketId: string, orderId: string) {
        this.driverSockets.set(socketId, orderId);
    }

    async updateOrderStatus(orderId: string, status: string) {
        await this.ordersRepo.update(orderId, { status: status as any });
        return { orderId, status, ts: Date.now() };
    }
}