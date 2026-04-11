import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { SendChatMessageDto } from './dto/send-chat-message.dto';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly chatGateway: ChatGateway,
  ) {}

  // ─── Customer endpoints ───────────────────────────────────────────────────

  /** Customer: get their own conversation */
  @Get('messages')
  @ApiBearerAuth()
  async getMyMessages(@Req() request: Request) {
    const token = this.extractBearer(request);
    const payload = this.requireCustomer(token);
    return this.chatService.findByCustomer(payload.sub);
  }

  /** Customer: send a message */
  @Post('messages')
  @ApiBearerAuth()
  async postCustomerMessage(@Req() request: Request, @Body() dto: SendChatMessageDto) {
    const token = this.extractBearer(request);
    const payload = this.requireCustomer(token);
    const fullName = `${payload.firstName} ${payload.lastName}`.trim() || payload.email;
    const msg = await this.chatService.addCustomerMessage(payload.sub, fullName, dto.message);
    this.chatGateway.pushMessage(payload.sub, msg);
    return msg;
  }

  // ─── Admin endpoints ──────────────────────────────────────────────────────

  /** Admin: list of all conversation summaries */
  @Get('admin/conversations')
  @ApiBearerAuth()
  async getConversationSummaries(@Req() request: Request) {
    const token = this.extractBearer(request);
    this.requireAdmin(token);
    return this.chatService.findConversationSummaries();
  }

  /** Admin: full conversation for a customer */
  @Get('admin/conversations/:customerId')
  @ApiBearerAuth()
  async getConversation(@Req() request: Request, @Param('customerId') customerId: string) {
    const token = this.extractBearer(request);
    this.requireAdmin(token);
    return this.chatService.findConversation(customerId);
  }

  /** Admin: reply to a customer conversation */
  @Post('admin/conversations/:customerId')
  @ApiBearerAuth()
  async postAdminMessage(
    @Req() request: Request,
    @Param('customerId') customerId: string,
    @Body() dto: SendChatMessageDto,
  ) {
    const token = this.extractBearer(request);
    const payload = this.requireAdmin(token);
    const senderName = `Admin (${payload.email})`;
    const msg = await this.chatService.addAdminMessage(customerId, senderName, dto.message);
    this.chatGateway.pushMessage(customerId, msg);
    return msg;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private extractBearer(request: Request): string {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedException('Token requis');
    return header.slice(7);
  }

  private requireCustomer(token: string) {
    try {
      return this.authService.verifyCustomerToken(token);
    } catch {
      throw new UnauthorizedException('Token client invalide ou expiré');
    }
  }

  private requireAdmin(token: string) {
    try {
      return this.authService.verifyAdminToken(token);
    } catch {
      throw new UnauthorizedException('Token administrateur invalide ou expiré');
    }
  }
}
