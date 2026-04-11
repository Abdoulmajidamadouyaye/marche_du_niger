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
exports.DataStoreService = void 0;
const common_1 = require("@nestjs/common");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const products_seed_1 = require("../seed/products.seed");
let DataStoreService = class DataStoreService {
    constructor() {
        this.storePath = (0, node_path_1.join)(process.cwd(), 'data', 'store.json');
        this.products = [];
        this.orders = [];
        this.load();
    }
    save() {
        (0, node_fs_1.mkdirSync)((0, node_path_1.dirname)(this.storePath), { recursive: true });
        (0, node_fs_1.writeFileSync)(this.storePath, JSON.stringify({
            products: this.products,
            orders: this.orders,
        }, null, 2), 'utf-8');
    }
    load() {
        if (!(0, node_fs_1.existsSync)(this.storePath)) {
            this.products = products_seed_1.seededProducts.map((product) => ({ ...product }));
            this.orders = [];
            this.save();
            return;
        }
        try {
            const rawStore = (0, node_fs_1.readFileSync)(this.storePath, 'utf-8');
            const parsedStore = JSON.parse(rawStore);
            this.products = parsedStore.products ?? products_seed_1.seededProducts.map((product) => ({ ...product }));
            this.orders = parsedStore.orders ?? [];
        }
        catch {
            this.products = products_seed_1.seededProducts.map((product) => ({ ...product }));
            this.orders = [];
            this.save();
        }
    }
};
exports.DataStoreService = DataStoreService;
exports.DataStoreService = DataStoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DataStoreService);
//# sourceMappingURL=data-store.service.js.map