import {
  WebSocketGateway, WebSocketServer,
  SubscribeMessage, MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/auth/ws-jwt.guard';
import { ChatService } from '../chat.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*', credentials: true },
})
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private chatService: ChatService) { }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('chat:join')
  handleJoin(
    @MessageBody() orderId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`chat:${orderId}`);
    return { status: 'joined', room: `chat:${orderId}` };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('chat:message')
  async handleMessage(
    @MessageBody() payload: { orderId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    const message = await this.chatService.saveMessage({
      orderId: payload.orderId,
      senderId: user.sub,
      content: payload.content,
    });

    // Broadcast a todos en la room del pedido
    this.server
      .to(`chat:${payload.orderId}`)
      .emit('chat:message', message);

    return message;
  }
}