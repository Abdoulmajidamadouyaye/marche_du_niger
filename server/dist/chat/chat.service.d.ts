import { PrismaService } from '../shared/prisma/prisma.service';
export type ChatSenderRole = 'customer' | 'admin';
export type ChatMessageEntity = {
    id: string;
    customerId: string;
    senderName: string;
    senderRole: ChatSenderRole;
    message: string;
    createdAt: string;
};
export type ConversationSummaryEntity = {
    customerId: string;
    customerName: string;
    lastMessage: string;
    lastAt: string;
    lastSenderRole: ChatSenderRole;
};
export declare class ChatService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByCustomer(customerId: string): Promise<ChatMessageEntity[]>;
    findAll(limit?: number): Promise<ChatMessageEntity[]>;
    findConversation(customerId: string): Promise<ChatMessageEntity[]>;
    findConversationSummaries(): Promise<ConversationSummaryEntity[]>;
    addCustomerMessage(customerId: string, senderName: string, message: string): Promise<ChatMessageEntity>;
    addAdminMessage(customerId: string, senderName: string, message: string): Promise<ChatMessageEntity>;
    private toEntity;
}
