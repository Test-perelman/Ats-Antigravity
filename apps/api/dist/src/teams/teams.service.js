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
exports.TeamsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TeamsService = class TeamsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTeamDto, creatorId) {
        const team = await this.prisma.team.create({
            data: {
                name: createTeamDto.name,
                industry: createTeamDto.industry,
                description: createTeamDto.description,
                isDiscoverable: createTeamDto.isDiscoverable ?? true,
                createdBy: creatorId,
            },
        });
        await this.prisma.teamMembership.create({
            data: {
                userId: creatorId,
                teamId: team.id,
                role: 'team_admin',
            },
        });
        await this.prisma.teamSettings.create({
            data: {
                teamId: team.id,
                allowSelfSignup: true,
            },
        });
        return team;
    }
    async findAll() {
        return this.prisma.team.findMany({
            where: {
                status: 'active',
                isDiscoverable: true,
            },
            select: {
                id: true,
                name: true,
                industry: true,
                description: true,
            },
        });
    }
    async findMyTeams(userId) {
        return this.prisma.team.findMany({
            where: {
                memberships: {
                    some: { userId },
                },
            },
        });
    }
    async findOne(id) {
        return this.prisma.team.findUnique({
            where: { id },
        });
    }
    async requestAccess(userId, teamId) {
        const existing = await this.prisma.teamMembership.findUnique({
            where: { userId_teamId: { userId, teamId } },
        });
        if (existing)
            throw new common_1.BadRequestException('Already a member');
        return this.prisma.teamAccessRequest.create({
            data: {
                userId,
                teamId,
                status: 'pending',
            }
        });
    }
    async getRequests(teamId) {
        return this.prisma.teamAccessRequest.findMany({
            where: { teamId, status: 'pending' },
            include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        });
    }
    async approveAccess(requestId, teamId) {
        return this.prisma.$transaction(async (tx) => {
            const request = await tx.teamAccessRequest.findUnique({
                where: { id: requestId },
            });
            if (!request || request.status !== 'pending') {
                throw new common_1.BadRequestException('Invalid request');
            }
            await tx.teamMembership.create({
                data: {
                    teamId: request.teamId,
                    userId: request.userId,
                    role: 'user',
                },
            });
            return tx.teamAccessRequest.update({
                where: { id: requestId },
                data: { status: 'approved' },
            });
        });
    }
    async rejectAccess(requestId) {
        return this.prisma.teamAccessRequest.update({
            where: { id: requestId },
            data: { status: 'rejected' },
        });
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeamsService);
//# sourceMappingURL=teams.service.js.map