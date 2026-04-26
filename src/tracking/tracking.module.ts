import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingService } from './tracking.service';
import { LocationHistory } from './location-history.entity';
import { Order } from '../orders/order.entity';
import { AuthModule } from '../auth/auth.module';
import { TrackingGateway } from './tracking/tracking.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocationHistory, Order]),
    AuthModule,
  ],
  providers: [TrackingGateway, TrackingService],
  exports: [TrackingGateway, TrackingService],
})
export class TrackingModule { }