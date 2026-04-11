import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { ChatMessageEntity } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: [
      process.env['CLIENT_URL'] ?? 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly authService: AuthService) {}

  handleConnection(client: Socket): void {
    // rooms are assigned after the client emits 'join' with a token
    void client;
  }

  handleDisconnect(client: Socket): void {
    void client;
  }

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { token?: string },
  ): void {
    if (!data?.token) {
      client.disconnect();
      return;
    }

    const token = String(data.token);

    try {
      const adminPayload = this.authService.verifyAdminToken(token);
      void adminPayload;
      void client.join('admin');
      client.emit('joined', { role: 'admin' });
      return;
    } catch {
      // not admin
    }

    try {
      const customerPayload = this.authService.verifyCustomerToken(token);
      void client.join(`customer:${customerPayload.sub}`);
      client.emit('joined', { role: 'customer', customerId: customerPayload.sub });
    } catch {
      client.disconnect();
    }
  }

  /** Push a newly created message to the relevant customer room AND the admin room */
  pushMessage(customerId: string, message: ChatMessageEntity): void {
    this.server.to(`customer:${customerId}`).emit('message:new', message);
    this.server.to('admin').emit('message:new', message);
  }
}
