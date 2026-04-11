import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  /** Customer: only their own messages */
  async findByCustomer(customerId: string): Promise<ChatMessageEntity[]> {
    const rows = await this.prisma.chatMessage.findMany({
      where: { customerId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => this.toEntity(r));
  }

  /** Admin: all messages for all conversations */
  async findAll(limit = 200): Promise<ChatMessageEntity[]> {
    const safeLimit = Math.min(Math.max(1, limit), 500);
    const rows = await this.prisma.chatMessage.findMany({
      orderBy: { createdAt: 'asc' },
      take: safeLimit,
    });
    return rows.map((r) => this.toEntity(r));
  }

  /** Admin: all messages for one customer conversation */
  async findConversation(customerId: string): Promise<ChatMessageEntity[]> {
    const rows = await this.prisma.chatMessage.findMany({
      where: { customerId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => this.toEntity(r));
  }

  /** Admin: summary list per customer (last message) - optimized without N+1 queries */
  async findConversationSummaries(): Promise<ConversationSummaryEntity[]> {
    // Get last message per customer using group by
    const lastMessages = await this.prisma.chatMessage.findMany({
      distinct: ['customerId'],
      orderBy: { createdAt: 'desc' },
    });

    // Get all unique customer IDs
    const customerIds = [...new Set(lastMessages.map((m) => m.customerId))];

    // Fetch all customers in one query
    const customers = await this.prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, firstName: true, lastName: true },
    });

    const customerMap = new Map(
      customers.map((c) => [c.id, `${c.firstName} ${c.lastName}`.trim()]),
    );

    // Build summaries from last messages, using customer map for lookup
    return lastMessages.map((msg) => ({
      customerId: msg.customerId,
      customerName: customerMap.get(msg.customerId) || 'Client inconnu',
      lastMessage: msg.message,
      lastAt: msg.createdAt.toISOString(),
      lastSenderRole: msg.senderRole as ChatSenderRole,
    }));
  }

  async addCustomerMessage(
    customerId: string,
    senderName: string,
    message: string,
  ): Promise<ChatMessageEntity> {
    const row = await this.prisma.chatMessage.create({
      data: { customerId, senderName: senderName.trim(), senderRole: 'customer', message: message.trim() },
    });
    return this.toEntity(row);
  }

  async addAdminMessage(
    customerId: string,
    senderName: string,
    message: string,
  ): Promise<ChatMessageEntity> {
    const row = await this.prisma.chatMessage.create({
      data: { customerId, senderName: senderName.trim(), senderRole: 'admin', message: message.trim() },
    });
    return this.toEntity(row);
  }

  private toEntity(row: {
    id: string;
    customerId: string;
    senderName: string;
    senderRole: string;
    message: string;
    createdAt: Date;
  }): ChatMessageEntity {
    return {
      id: row.id,
      customerId: row.customerId,
      senderName: row.senderName,
      senderRole: row.senderRole as ChatSenderRole,
      message: row.message,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
