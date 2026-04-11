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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const regions_1 = require("../../constants/regions");
class VehicleSpecsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VehicleSpecsDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VehicleSpecsDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1900),
    __metadata("design:type", Number)
], VehicleSpecsDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['Essence', 'Diesel', 'Hybride', 'Electrique'] }),
    (0, class_validator_1.IsIn)(['Essence', 'Diesel', 'Hybride', 'Electrique']),
    __metadata("design:type", String)
], VehicleSpecsDto.prototype, "engineType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], VehicleSpecsDto.prototype, "horsepower", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['Automatique', 'Manuelle'] }),
    (0, class_validator_1.IsIn)(['Automatique', 'Manuelle']),
    __metadata("design:type", String)
], VehicleSpecsDto.prototype, "transmission", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Consommation en L/100km' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], VehicleSpecsDto.prototype, "fuelConsumption", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Autonomie en km' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], VehicleSpecsDto.prototype, "autonomy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Capacité du réservoir en litres' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], VehicleSpecsDto.prototype, "tankCapacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Kilométrage en km' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], VehicleSpecsDto.prototype, "mileage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], VehicleSpecsDto.prototype, "doors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], VehicleSpecsDto.prototype, "seats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VehicleSpecsDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VehicleSpecsDto.prototype, "airbags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VehicleSpecsDto.prototype, "abs", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VehicleSpecsDto.prototype, "reverseCamera", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VehicleSpecsDto.prototype, "airConditioning", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VehicleSpecsDto.prototype, "gpsNavigation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VehicleSpecsDto.prototype, "touchScreen", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['neuf', 'occasion'] }),
    (0, class_validator_1.IsIn)(['neuf', 'occasion']),
    __metadata("design:type", String)
], VehicleSpecsDto.prototype, "condition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], VehicleSpecsDto.prototype, "papersAvailable", void 0);
class MotoSpecsDto {
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MotoSpecsDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MotoSpecsDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1900),
    __metadata("design:type", Number)
], MotoSpecsDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['Sport', 'Cross', 'Scooter', 'Routière', 'Autre'] }),
    (0, class_validator_1.IsIn)(['Sport', 'Cross', 'Scooter', 'Routière', 'Autre']),
    __metadata("design:type", String)
], MotoSpecsDto.prototype, "motoType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['2 temps', '4 temps'] }),
    (0, class_validator_1.IsIn)(['2 temps', '4 temps']),
    __metadata("design:type", String)
], MotoSpecsDto.prototype, "engineType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Vitesse maximale km/h' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], MotoSpecsDto.prototype, "maxSpeed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Poids en kg' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], MotoSpecsDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MotoSpecsDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MotoSpecsDto.prototype, "tireType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Kilométrage en km' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], MotoSpecsDto.prototype, "mileage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['ville', 'route', 'tout-terrain'] }),
    (0, class_validator_1.IsIn)(['ville', 'route', 'tout-terrain']),
    __metadata("design:type", String)
], MotoSpecsDto.prototype, "usage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Consommation en L/100km' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], MotoSpecsDto.prototype, "fuelConsumption", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Capacité du réservoir en litres' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], MotoSpecsDto.prototype, "tankCapacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['disque', 'tambour', 'disque + tambour'] }),
    (0, class_validator_1.IsIn)(['disque', 'tambour', 'disque + tambour']),
    __metadata("design:type", String)
], MotoSpecsDto.prototype, "brakes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MotoSpecsDto.prototype, "antiTheft", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MotoSpecsDto.prototype, "ledLighting", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MotoSpecsDto.prototype, "electricStart", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MotoSpecsDto.prototype, "digitalDashboard", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['neuf', 'occasion'] }),
    (0, class_validator_1.IsIn)(['neuf', 'occasion']),
    __metadata("design:type", String)
], MotoSpecsDto.prototype, "condition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MotoSpecsDto.prototype, "papersAvailable", void 0);
class CreateProductDto {
}
exports.CreateProductDto = CreateProductDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "shortDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "categorySlug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "sizes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "colors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'object', additionalProperties: { type: 'string' } }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateProductDto.prototype, "inStock", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: VehicleSpecsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => VehicleSpecsDto),
    __metadata("design:type", VehicleSpecsDto)
], CreateProductDto.prototype, "vehicleSpecs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: MotoSpecsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MotoSpecsDto),
    __metadata("design:type", MotoSpecsDto)
], CreateProductDto.prototype, "motoSpecs", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: Object.values(regions_1.COUNTRIES) }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(Object.values(regions_1.COUNTRIES)),
    __metadata("design:type", String)
], CreateProductDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String], description: 'Array of region codes for Niger or location for Benin' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "regions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Delai d\'expedition en jours (Benin)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "shippingDelayDays", void 0);
//# sourceMappingURL=create-product.dto.js.map