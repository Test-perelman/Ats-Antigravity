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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const team_prisma_service_1 = require("../prisma/team-prisma.service");
let ClientsService = class ClientsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createClientDto) {
        return this.prisma.client.client.create({
            data: createClientDto,
        });
    }
    async findAll() {
        return this.prisma.client.client.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { projects: true }
                }
            }
        });
    }
    async findOne(id) {
        const client = await this.prisma.client.client.findUnique({
            where: { id },
        });
        if (!client)
            throw new common_1.NotFoundException('Client not found');
        return client;
    }
    async update(id, updateClientDto) {
        return this.prisma.client.client.update({
            where: { id },
            data: updateClientDto,
        });
    }
    async remove(id) {
        return this.prisma.client.client.delete({
            where: { id },
        });
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [team_prisma_service_1.TeamPrismaService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map