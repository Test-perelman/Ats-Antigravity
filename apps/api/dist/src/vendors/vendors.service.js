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
exports.VendorsService = void 0;
const common_1 = require("@nestjs/common");
const team_prisma_service_1 = require("../prisma/team-prisma.service");
let VendorsService = class VendorsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createVendorDto) {
        return this.prisma.client.vendor.create({
            data: createVendorDto,
        });
    }
    async findAll() {
        return this.prisma.client.vendor.findMany({
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        return this.prisma.client.vendor.findUnique({
            where: { id },
        });
    }
    async update(id, updateVendorDto) {
        return this.prisma.client.vendor.update({
            where: { id },
            data: updateVendorDto,
        });
    }
    async remove(id) {
        return this.prisma.client.vendor.delete({
            where: { id },
        });
    }
};
exports.VendorsService = VendorsService;
exports.VendorsService = VendorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [team_prisma_service_1.TeamPrismaService])
], VendorsService);
//# sourceMappingURL=vendors.service.js.map