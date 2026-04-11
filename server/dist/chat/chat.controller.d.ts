import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { SendChatMessageDto } from './dto/send-chat-message.dto';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    private readonly authService;
    private readonly chatGateway;
    constructor(chatService: ChatService, authService: AuthService, chatGateway: ChatGateway);
    getMyMessages(request: Request): Promise<import("./chat.service").ChatMessageEntity[]>;
    postCustomerMessage(request: Request, dto: SendChatMessageDto): Promise<import("./chat.service").ChatMessageEntity>;
    getConversationSummaries(request: Request): Promise<import("./chat.service").ConversationSummaryEntity[]>;
    getConversation(request: Request, customerId: string): Promise<import("./chat.service").ChatMessageEntity[]>;
    postAdminMessage(request: Request, customerId: string, dto: SendChatMessageDto): Promise<import("./chat.service").ChatMessageEntity>;
    private extractBearer;
    private requireCustomer;
    private requireAdmin;
}
