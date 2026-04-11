"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("../auth/auth.service");
const send_chat_message_dto_1 = require("./dto/send-chat-message.dto");
const chat_gateway_1 = require("./chat.gateway");
const chat_service_1 = require("./chat.service");
let ChatController = class ChatController {
    constructor(chatService, authService, chatGateway) {
        this.chatService = chatService;
        this.authService = authService;
        this.chatGateway = chatGateway;
    }
    async getMyMessages(request) {
        const token = this.extractBearer(request);
        const payload = this.requireCustomer(token);
        return this.chatService.findByCustomer(payload.sub);
    }
    async postCustomerMessage(request, dto) {
        const token = this.extractBearer(request);
        const payload = this.requireCustomer(token);
        const fullName = `${payload.firstName} ${payload.lastName}`.trim() || payload.email;
        const msg = await this.chatService.addCustomerMessage(payload.sub, fullName, dto.message);
        this.chatGateway.pushMessage(payload.sub, msg);
        return msg;
    }
    async getConversationSummaries(request) {
        const token = this.extractBearer(request);
        this.requireAdmin(token);
        return this.chatService.findConversationSummaries();
    }
    async getConversation(request, customerId) {
        const token = this.extractBearer(request);
        this.requireAdmin(token);
        return this.chatService.findConversation(customerId);
    }
    async postAdminMessage(request, customerId, dto) {
        const token = this.extractBearer(request);
        const payload = this.requireAdmin(token);
        const senderName = `Admin (${payload.email})`;
        const msg = await this.chatService.addAdminMessage(customerId, senderName, dto.message);
        this.chatGateway.pushMessage(customerId, msg);
        return msg;
    }
    extractBearer(request) {
        const header = request.headers.authorization;
        if (!header?.startsWith('Bearer '))
            throw new common_1.UnauthorizedException('Token requis');
        return header.slice(7);
    }
    requireCustomer(token) {
        try {
            return this.authService.verifyCustomerToken(token);
        }
        catch {
            throw new common_1.UnauthorizedException('Token client invalide ou expiré');
        }
    }
    requireAdmin(token) {
        try {
            return this.authService.verifyAdminToken(token);
        }
        catch {
            throw new common_1.UnauthorizedException('Token administrateur invalide ou expiré');
        }
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('messages'),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMyMessages", null);
__decorate([
    (0, common_1.Post)('messages'),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, send_chat_message_dto_1.SendChatMessageDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "postCustomerMessage", null);
__decorate([
    (0, common_1.Get)('admin/conversations'),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getConversationSummaries", null);
__decorate([
    (0, common_1.Get)('admin/conversations/:customerId'),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Post)('admin/conversations/:customerId'),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('customerId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, send_chat_message_dto_1.SendChatMessageDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "postAdminMessage", null);
exports.ChatController = ChatController = __decorate([
    (0, swagger_1.ApiTags)('chat'),
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        auth_service_1.AuthService,
        chat_gateway_1.ChatGateway])
], ChatController);
//# sourceMappingURL=chat.controller.js.map