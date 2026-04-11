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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const auth_service_1 = require("../auth/auth.service");
let ChatGateway = class ChatGateway {
    constructor(authService) {
        this.authService = authService;
    }
    handleConnection(client) {
        void client;
    }
    handleDisconnect(client) {
        void client;
    }
    handleJoin(client, data) {
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
        }
        catch {
        }
        try {
            const customerPayload = this.authService.verifyCustomerToken(token);
            void client.join(`customer:${customerPayload.sub}`);
            client.emit('joined', { role: 'customer', customerId: customerPayload.sub });
        }
        catch {
            client.disconnect();
        }
    }
    pushMessage(customerId, message) {
        this.server.to(`customer:${customerId}`).emit('message:new', message);
        this.server.to('admin').emit('message:new', message);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoin", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: [
                process.env['CLIENT_URL'] ?? 'http://localhost:3000',
                'http://localhost:3000',
                'http://localhost:3001',
            ],
            credentials: true,
        },
        namespace: '/chat',
    }),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map