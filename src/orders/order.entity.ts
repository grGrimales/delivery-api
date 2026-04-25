import { User } from 'src/users/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';

export enum OrderStatus {
    PENDING = 'pending',
    PREPARING = 'preparing',
    ON_THE_WAY = 'on_the_way',
    DELIVERED = 'delivered',
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'customer_id' })
    customer: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'driver_id' })
    driver: User;

    @Column()
    addressFrom: string;

    @Column()
    addressTo: string;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;

    @Column('float', { nullable: true })
    lat: number;

    @Column('float', { nullable: true })
    lng: number;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: true })
    deliveredAt: Date;
}