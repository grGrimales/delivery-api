import {
  WebSocketGateway, WebSocketServer,
  SubscribeMessage, MessageBody,
  ConnectedSocket, OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { TrackingService } from '../tracking.service';
import { WsJwtGuard } from 'src/auth/ws-jwt.guard';

@WebSocketGateway({
  namespace: '/tracking',
  cors: { origin: '*', credentials: true },
})
export class TrackingGateway
  implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() server: Server;
  private readonly logger = new Logger(TrackingGateway.name);

  constructor(private readonly trackingService: TrackingService) { }

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
    this.trackingService.removeDriver(client.id);
  }

  @SubscribeMessage('join:order')
  handleJoinOrder(
    @MessageBody() orderId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const room = `order:${orderId}`;
    client.join(room);
    const lastPos = this.trackingService.getLastPosition(orderId);
    if (lastPos) client.emit('location:update', lastPos);
    return { status: 'joined', room };
  }

  @SubscribeMessage('leave:order')
  handleLeaveOrder(
    @MessageBody() orderId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`order:${orderId}`);
    return { status: 'left' };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('driver:location')
  async handleDriverLocation(
    @MessageBody() payload: { orderId: string; lat: number; lng: number; heading?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { orderId, lat, lng, heading } = payload;
    await this.trackingService.savePosition({ orderId, lat, lng, heading });
    this.server
      .to(`order:${orderId}`)
      .emit('location:update', { orderId, lat, lng, heading, ts: Date.now() });
    return { status: 'ok' };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('order:status')
  async handleOrderStatus(
    @MessageBody() payload: { orderId: string; status: 'preparing' | 'on_the_way' | 'delivered' },
  ) {
    const updated = await this.trackingService.updateOrderStatus(payload.orderId, payload.status);
    this.server.to(`order:${payload.orderId}`).emit('order:status:update', updated);
    return updated;
  }

  emitOrderUpdate(orderId: string, data: any) {
    this.server.to(`order:${orderId}`).emit('order:update', data);
  }
}