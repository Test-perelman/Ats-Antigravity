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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const team_prisma_service_1 = require("../prisma/team-prisma.service");
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProjectDto) {
        const { name, clientId, startDate, endDate, status } = createProjectDto;
        return this.prisma.client.project.create({
            data: {
                name,
                clientId,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : undefined,
                status: status || 'active',
            },
        });
    }
    async findAll() {
        return this.prisma.client.project.findMany({
            orderBy: { startDate: 'desc' },
            include: {
                client: true,
                _count: {
                    select: { timesheets: true }
                }
            }
        });
    }
    async findOne(id) {
        return this.prisma.client.project.findUnique({
            where: { id },
            include: {
                client: true
            }
        });
    }
    async update(id, updateProjectDto) {
        const data = { ...updateProjectDto };
        if (data.startDate)
            data.startDate = new Date(data.startDate);
        if (data.endDate)
            data.endDate = new Date(data.endDate);
        return this.prisma.client.project.update({
            where: { id },
            data: data,
        });
    }
    async remove(id) {
        return this.prisma.client.project.delete({
            where: { id },
        });
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [team_prisma_service_1.TeamPrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map