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
exports.ImmigrationService = void 0;
const common_1 = require("@nestjs/common");
const team_prisma_service_1 = require("../prisma/team-prisma.service");
let ImmigrationService = class ImmigrationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createImmigrationDto) {
        return this.prisma.client.immigrationCase.create({
            data: {
                ...createImmigrationDto,
                expiryDate: createImmigrationDto.expiryDate ? new Date(createImmigrationDto.expiryDate) : undefined,
            },
        });
    }
    async findAll() {
        return this.prisma.client.immigrationCase.findMany({
            orderBy: { expiryDate: 'asc' },
            include: {
                candidate: true
            }
        });
    }
    async findOne(id) {
        return this.prisma.client.immigrationCase.findUnique({
            where: { id },
            include: {
                candidate: true
            }
        });
    }
    async update(id, updateImmigrationDto) {
        const data = { ...updateImmigrationDto };
        if (data.expiryDate)
            data.expiryDate = new Date(data.expiryDate);
        return this.prisma.client.immigrationCase.update({
            where: { id },
            data: data,
        });
    }
    async remove(id) {
        return this.prisma.client.immigrationCase.delete({
            where: { id },
        });
    }
};
exports.ImmigrationService = ImmigrationService;
exports.ImmigrationService = ImmigrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [team_prisma_service_1.TeamPrismaService])
], ImmigrationService);
//# sourceMappingURL=immigration.service.js.map