import { Order } from 'src/orders/order.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';

@Entity('location_history')
export class LocationHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Order)
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Column('float')
    lat: number;

    @Column('float')
    lng: number;

    @Column('float', { nullable: true })
    heading: number;

    @CreateDateColumn()
    recordedAt: Date;
}