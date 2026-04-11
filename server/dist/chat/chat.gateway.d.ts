import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { ChatMessageEntity } from './chat.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly authService;
    server: Server;
    constructor(authService: AuthService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoin(client: Socket, data: {
        token?: string;
    }): void;
    pushMessage(customerId: string, message: ChatMessageEntity): void;
}
