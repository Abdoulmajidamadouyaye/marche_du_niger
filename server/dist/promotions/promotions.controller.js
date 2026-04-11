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
exports.PromotionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_auth_guard_1 = require("../auth/guards/admin-auth.guard");
const set_promotion_dto_1 = require("../products/dto/set-promotion.dto");
const promotions_service_1 = require("./promotions.service");
let PromotionsController = class PromotionsController {
    constructor(promotionsService) {
        this.promotionsService = promotionsService;
    }
    listActivePromotions() {
        return this.promotionsService.listActivePromotions();
    }
    applyToProduct(productId, dto) {
        return this.promotionsService.applyToProduct(productId, dto);
    }
    removeFromProduct(productId) {
        return this.promotionsService.removeFromProduct(productId);
    }
};
exports.PromotionsController = PromotionsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "listActivePromotions", null);
__decorate([
    (0, common_1.Post)(':productId'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, set_promotion_dto_1.SetPromotionDto]),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "applyToProduct", null);
__decorate([
    (0, common_1.Delete)(':productId'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PromotionsController.prototype, "removeFromProduct", null);
exports.PromotionsController = PromotionsController = __decorate([
    (0, swagger_1.ApiTags)('promotions'),
    (0, common_1.Controller)('promotions'),
    __metadata("design:paramtypes", [promotions_service_1.PromotionsService])
], PromotionsController);
//# sourceMappingURL=promotions.controller.js.map